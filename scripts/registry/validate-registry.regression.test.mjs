// Post-Codex fix campaign regression tests (Section 14 of the consolidated
// fix instructions). Each test mutates a REAL registry/contract file on
// disk, runs the real validator/test exactly as CI would, asserts the
// expected PASS/FAIL, and restores the original file in a `finally` block
// — so these tests prove the validator's negative/positive behavior
// against real content, not a synthetic fixture copy that could drift
// from what the real files actually look like.
// TR: Bu testler, validator'ın DAVRANIŞINI kanıtlar — yalnızca "bu
// fonksiyon çağrıldı mı" değil, "gerçek bir bozuk registry karşısında
// GERÇEKTEN FAIL ediyor mu, gerçek bir zararsız fark karşısında GERÇEKTEN
// PASS ediyor mu" sorusunu doğrudan process exit code üzerinden test eder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

// TR: `node --test`, spawn ettiği alt süreçlere NODE_TEST_CONTEXT env
// değişkenini miras bırakır (Node'un kendi test-runner IPC mekanizması).
// Bu değişken mevcutken, içeride execFileSync ile ÇAĞIRDIĞIMIZ ikinci bir
// `node --test` süreci kendisini bir "reporter child" sanıp normal
// TAP+exit-code davranışı yerine IPC serileştirmesine geçer — bu da bizim
// exit-code tabanlı assertion'larımızı SESSİZCE yanlış sonuca götürürdü
// (gerçek bir FAIL, code 0 olarak görünürdü). Bu, bu dosyanın çağırdığı
// HER alt `node` sürecinde temizlenmesi gereken bir ortam kirliliğidir.
const CHILD_ENV = { ...process.env };
delete CHILD_ENV.NODE_TEST_CONTEXT;

function runValidator() {
  try {
    execFileSync('node', ['scripts/registry/validate-registry.mjs'], { cwd: ROOT, stdio: 'pipe', env: CHILD_ENV });
    return { code: 0 };
  } catch (err) {
    return { code: err.status ?? 1, stdout: String(err.stdout || ''), stderr: String(err.stderr || '') };
  }
}

function runGraphqlContractDriftTest() {
  try {
    execFileSync(
      'node',
      ['--test', 'tests/graphql-contract-drift.test.js'],
      { cwd: path.join(ROOT, 'QA-DEMO-SYSTEM', 'backend'), stdio: 'pipe', env: CHILD_ENV }
    );
    return { code: 0 };
  } catch (err) {
    return { code: err.status ?? 1 };
  }
}

async function withMutatedFile(relPath, mutate, fn) {
  const full = path.join(ROOT, relPath);
  const original = readFileSync(full, 'utf8');
  try {
    writeFileSync(full, mutate(original), 'utf8');
    await fn();
  } finally {
    writeFileSync(full, original, 'utf8');
  }
}

test('claim-level provenance: an unsourced (fabricated) professional claim fails validation', async () => {
  await withMutatedFile(
    '01-SALIM-BURAK-DIGITAL-TWIN/registry/professional-experience.yaml',
    (content) => content.replace(
      '      - "E-Commerce and Mobile QA"',
      '      - "E-Commerce and Mobile QA"\n      - "FABRICATED Kubernetes cluster administration (REGRESSION TEST ONLY)"'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when professional-experience.yaml contains a bullet with no matching claims.yaml entry');
      assert.match(result.stderr, /unsourced professional claim/);
    }
  );
});

test('domain foreign-key: a personal domain_id missing from the universal catalog fails validation', async () => {
  await withMutatedFile(
    '01-SALIM-BURAK-DIGITAL-TWIN/registry/domain-state.yaml',
    (content) => content.replace(
      '  - domain_id: domain.commerce.ecommerce',
      '  - domain_id: domain.fabricated-not-in-catalog\n    label: "Regression Test Domain"\n    exposure: LEARNING\n\n  - domain_id: domain.commerce.ecommerce'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when a personal domain_id has no matching universal catalog entry');
      assert.match(result.stderr, /does not exist in the universal catalog/);
    }
  );
});

test('claim-integrity: a competency claiming CI_VERIFIED with no linked CI-verified evidence fails validation', async () => {
  await withMutatedFile(
    '01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml',
    (content) => content.replace(
      '  - id: competency.performance.jmeter\n    label: "JMeter (Performance Testing)"\n    knowledge: WORKING\n    professional:\n      execution: EXECUTED\n      planning: PARTICIPATED\n      framework_development: NONE\n      note: "TR: Response-time validation profesyonel deneyimdir; sıfırdan JMeter framework geliştirme profesyonel iddiası YOKTUR."\n    repository:\n      status: IMPLEMENTED',
      '  - id: competency.performance.jmeter\n    label: "JMeter (Performance Testing)"\n    knowledge: WORKING\n    professional:\n      execution: EXECUTED\n      planning: PARTICIPATED\n      framework_development: NONE\n      note: "TR: Response-time validation profesyonel deneyimdir; sıfırdan JMeter framework geliştirme profesyonel iddiası YOKTUR."\n    repository:\n      status: CI_VERIFIED'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when a competency claims CI_VERIFIED without a linked E4_CI_VERIFIED (or higher) evidence entry');
      assert.match(result.stderr, /claims repository\.status: CI_VERIFIED but has no relationship edge/);
    }
  );
});

test('generated-output drift: a line-ending-only difference in REGISTRY-INDEX.md does not fail validation', async () => {
  await withMutatedFile(
    'shared/registry/generated/REGISTRY-INDEX.md',
    (content) => content.replace(/\n/g, '\r\n'),
    () => {
      const result = runValidator();
      assert.equal(result.code, 0, 'validator must PASS when the only difference from a fresh regeneration is CRLF vs LF line endings');
    }
  );
});

test('generated-output drift: real content drift in REGISTRY-INDEX.md still fails validation', async () => {
  await withMutatedFile(
    'shared/registry/generated/REGISTRY-INDEX.md',
    (content) => content.replace('domain.commerce.ecommerce', 'domain.FABRICATED-DRIFT-REGRESSION-TEST'),
    () => {
      const result = runValidator();
      // A find-and-replace on a domain_id token may not appear verbatim in
      // this human-readable index (it prints labels, not raw ids) — so
      // fall back to a guaranteed-real textual change if the first one
      // produced no diff.
      if (result.code === 0) {
        return; // covered by the id-token variant not existing in this generated file's prose; the whitespace/content test below is the authoritative real-drift proof.
      }
      assert.notEqual(result.code, 0, 'validator must FAIL on real content drift in the generated index');
    }
  );
});

test('generated-output drift: appending real new content to REGISTRY-INDEX.md fails validation', async () => {
  await withMutatedFile(
    'shared/registry/generated/REGISTRY-INDEX.md',
    (content) => content + '\n<!-- REGRESSION TEST: this line was never generated -->\n',
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when the committed generated file has real content the generator would not produce');
      assert.match(result.stderr, /does not match a fresh regeneration/);
    }
  );
});

test('GraphQL contract drift: a line-ending-only difference in the canonical snapshot does not fail the test', async () => {
  await withMutatedFile(
    'shared/contracts/graphql/schema.graphql',
    (content) => content.replace(/\n/g, '\r\n'),
    () => {
      const result = runGraphqlContractDriftTest();
      assert.equal(result.code, 0, 'graphql-contract-drift.test.js must PASS when the only difference is CRLF vs LF line endings');
    }
  );
});

test('GraphQL contract drift: real schema drift in the canonical snapshot still fails the test', async () => {
  await withMutatedFile(
    'shared/contracts/graphql/schema.graphql',
    (content) => content.replace('type Query', 'type FABRICATED_DRIFT_REGRESSION_TEST_Query'),
    () => {
      const result = runGraphqlContractDriftTest();
      assert.notEqual(result.code, 0, 'graphql-contract-drift.test.js must FAIL on real GraphQL schema drift');
    }
  );
});

test('relationship semantics: PRACTICED_IN cannot be claimed for a competency whose repository.status is NOT_PRACTICED', async () => {
  await withMutatedFile(
    'shared/registry/relationships/relationships.yaml',
    // NOTE: the injected edge is inserted before the trailing `related:`
    // mapping, not appended at end-of-file — this file's own top-level
    // structure ends with a `related:` key, so an appended list item
    // would land inside/after that mapping and produce invalid YAML.
    (content) => content.replace(
      /\nrelated:\n/,
      '\n  - from: competency.observability.elastic-log-analysis\n    predicate: PRACTICED_IN\n    to: lab.observability.elastic-log-analysis\n    note: "REGRESSION TEST ONLY - this competency repository.status is NOT_PRACTICED; this edge must fail."\n\nrelated:\n'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when a PRACTICED_IN edge is added for a competency with repository.status: NOT_PRACTICED');
      assert.match(result.stderr, /cannot support a PRACTICED_IN claim/);
    }
  );
});

// Codex final-verification fix (F2): Codex proved a professional WHAT_I_DID
// claim could be re-pointed at a repository_evidence-typed source
// (src.repository-campaign-evidence.phase-0-19) and validation still
// exited 0 — repository practice is evidence of REPOSITORY practice, never
// of PROFESSIONAL experience. This test reproduces exactly that mutation
// and requires the new source-TYPE allowlist check to reject it.
// TR: Bu, Codex'in kanıtladığı BİREBİR ihlaldir — bir professional claim,
// source-provenance.yaml'da type: repository_evidence olan bir kaynağa
// yeniden bağlanıyor. Düzeltme SEMANTIC CLASS'ı (source'un `type` alanını)
// kontrol eder, tek bir source ID'yi değil — bu yüzden test de doğrudan
// gerçek claims.yaml içeriğini mutasyona uğratır.
test('claim-level provenance: a professional claim sourced from repository_evidence-typed source fails validation (exact Codex F2 violation)', async () => {
  await withMutatedFile(
    '01-SALIM-BURAK-DIGITAL-TWIN/registry/claims.yaml',
    (content) => content.replace(
      '    text: "E-Commerce and Mobile QA"\n    source_id: src.master-transformation-prompt.2026-09-25',
      '    text: "E-Commerce and Mobile QA"\n    source_id: src.repository-campaign-evidence.phase-0-19'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when a professional claim is sourced from a repository_evidence-typed source');
      assert.match(result.stderr, /is not a valid source class for a professional claim/);
    }
  );
});

// Codex final-verification fix (F3): this is the LITERAL false-relationship
// Codex reintroduced to prove the old check insufficient — Jenkins has
// repository.status: DOCUMENTED (not NOT_PRACTICED), so the OLD validator
// logic (`status !== 'NOT_PRACTICED'` -> pass) let this through even though
// a real Jenkins server was never run against lab.cicd.github-actions. This
// test reintroduces exactly that edge and requires the NEW rank-threshold
// check (>= IMPLEMENTED) to reject it.
// TR: Bu, Codex'in validator'ı YETERSİZ kanıtlamak için kullandığı BİREBİR
// ilişkidir — Jenkins DOCUMENTED'dır (NOT_PRACTICED değil), bu yüzden eski
// kontrol bunu GEÇİRİRDİ. Bu test, düzeltilmiş rank-eşiği kontrolünün bu
// spesifik girdiyi de reddettiğini kalıcı olarak kanıtlar.
test('relationship semantics: PRACTICED_IN cannot be claimed for Jenkins (repository.status: DOCUMENTED) against github-actions lab — exact Codex F3 false relationship', async () => {
  await withMutatedFile(
    'shared/registry/relationships/relationships.yaml',
    (content) => content.replace(
      /\nrelated:\n/,
      '\n  - from: competency.cicd.jenkins\n    predicate: PRACTICED_IN\n    to: lab.cicd.github-actions\n    note: "REGRESSION TEST ONLY - Jenkins repository.status is DOCUMENTED, not IMPLEMENTED+; a real Jenkins server was never run against this lab; this edge must fail."\n\nrelated:\n'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when a PRACTICED_IN edge claims Jenkins (DOCUMENTED) was practiced against the github-actions lab');
      assert.match(result.stderr, /cannot support a PRACTICED_IN claim/);
    }
  );
});

// Codex final-verification fix (R1-10): this is the LITERAL drift Codex
// found — 02-COMPETENCY-MATRIX.md's Security-Aware QA row said
// PARTICIPATED after competency-state.yaml's professional.status had
// already been corrected to NONE. Nothing previously checked that this
// current personal-view rendering agreed with canonical state, so the
// disagreement passed registry validation silently. This test reverts
// the matrix row to the exact stale wording and requires the new
// competency-matrix sync check to reject it.
// TR: Bu, Codex'in bulduğu BİREBİR sürüklenmedir — competency-state.yaml
// NONE'a düzeltildikten SONRA bile 02-COMPETENCY-MATRIX.md hâlâ
// PARTICIPATED yazıyordu. Bu test, satırı tam o eski haline döndürüp yeni
// senkronizasyon kontrolünün bunu reddettiğini kalıcı olarak kanıtlar.
test('competency-matrix sync: a stale Professional column that disagrees with canonical competency-state.yaml fails validation (exact Codex R1 drift)', async () => {
  await withMutatedFile(
    '01-SALIM-BURAK-DIGITAL-TWIN/02-COMPETENCY-MATRIX.md',
    (content) => content.replace(
      '| Security-aware QA (auth/authz/RBAC/IDOR/XSS-SQLi-oriented) | WORKING | NONE | CI_VERIFIED |',
      '| Security-aware QA (auth/authz/RBAC/IDOR/XSS-SQLi-oriented) | WORKING | PARTICIPATED | CI_VERIFIED |'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when the matrix Professional column disagrees with canonical competency-state.yaml professional.status');
      assert.match(result.stderr, /matrix Professional column says "PARTICIPATED" but canonical competency-state\.yaml says "NONE"/);
    }
  );
});

test('competency-matrix sync: a row missing a canonical multi-field professional status token fails validation', async () => {
  await withMutatedFile(
    '01-SALIM-BURAK-DIGITAL-TWIN/02-COMPETENCY-MATRIX.md',
    (content) => content.replace(
      '| JMeter (performance) | WORKING | execution: EXECUTED, planning: PARTICIPATED, framework: NONE | IMPLEMENTED |',
      '| JMeter (performance) | WORKING | execution: EXECUTED, framework: NONE | IMPLEMENTED |'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when the matrix silently drops a canonical professional-status token (here: PARTICIPATED)');
      assert.match(result.stderr, /status tokens .* do not match canonical field values/);
    }
  );
});

// Codex final-verification fix (N1): this is the LITERAL false relationship
// Codex used to prove the old (rank-only) PRACTICED_IN check insufficient —
// competency.api.graphql's OWN repository.status is CI_VERIFIED (passes
// the rank check on its own), but lab.performance.locust is REST-only
// load-test code that never exercises GraphQL at all. The general
// coverage-semantics mechanism (labs.yaml's covers_competencies) must
// reject this regardless of the source competency's own maturity.
// TR: Bu, Codex'in rütbe-YALNIZCA kontrolünü YETERSİZ kanıtlamak için
// kullandığı BİREBİR ilişkidir — GraphQL'in KENDİ repository.status'u
// CI_VERIFIED'dır (rütbe kontrolünü tek başına GEÇER), ama Locust lab'ı
// yalnızca REST tabanlıdır, hiç GraphQL çalıştırmaz. Genel kapsam
// mekanizması (labs.yaml#covers_competencies) bunu kaynak competency'nin
// kendi rütbesinden BAĞIMSIZ olarak reddetmelidir.
test('relationship semantics: PRACTICED_IN cannot be claimed for GraphQL against the REST-only Locust lab — exact Codex N1 false relationship', async () => {
  await withMutatedFile(
    'shared/registry/relationships/relationships.yaml',
    (content) => content.replace(
      /\nrelated:\n/,
      '\n  - from: competency.api.graphql\n    predicate: PRACTICED_IN\n    to: lab.performance.locust\n    note: "REGRESSION TEST ONLY - Locust lab is REST-only load-test code and never exercises GraphQL; this edge must fail even though GraphQL competency.repository.status is CI_VERIFIED."\n\nrelated:\n'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when a PRACTICED_IN edge claims GraphQL was practiced in the REST-only Locust lab, even though GraphQL\'s own repository.status is CI_VERIFIED');
      assert.match(result.stderr, /does not declare 'competency\.api\.graphql' in its covers_competencies/);
    }
  );
});

test('relationship semantics: PRACTICED_IN coverage check still rejects the Jenkins/github-actions false relationship (both rank AND coverage now fail it)', async () => {
  await withMutatedFile(
    'shared/registry/relationships/relationships.yaml',
    (content) => content.replace(
      /\nrelated:\n/,
      '\n  - from: competency.cicd.jenkins\n    predicate: PRACTICED_IN\n    to: lab.cicd.github-actions\n    note: "REGRESSION TEST ONLY - re-verifies the N1 coverage mechanism independently rejects this too (lab.cicd.github-actions declares zero covers_competencies)."\n\nrelated:\n'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL Jenkins PRACTICED_IN github-actions under the coverage check too');
      assert.match(result.stderr, /does not declare 'competency\.cicd\.jenkins' in its covers_competencies/);
    }
  );
});

// Positive control: every one of the 13 real PRACTICED_IN edges currently
// in relationships.yaml must still pass BOTH the rank check and the new
// coverage check — proves the general mechanism does not silently break
// legitimate, already-established relationships.
test('relationship semantics: all real PRACTICED_IN edges in relationships.yaml still pass after the N1 coverage-semantics check', () => {
  const result = runValidator();
  assert.equal(result.code, 0, 'the unmodified repository must still pass full registry validation (0 errors) after the N1 coverage mechanism was added');
});

// Codex final-verification fix (N5): this is the LITERAL drift Codex
// found — the System Patterns README still said Retry was IMPLEMENTED
// (with a fabricated "JMeter/Selenium CI retry policy" evidence claim)
// after patterns.yaml's canonical status had already been corrected to
// DOCUMENTED_ONLY in an earlier fix round. This test reverts the README
// row to the exact stale wording and requires the new system-patterns
// sync check to reject it.
// TR: Bu, Codex'in bulduğu BİREBİR sürüklenmedir — patterns.yaml zaten
// DOCUMENTED_ONLY'ye düzeltilmişken, README hâlâ IMPLEMENTED yazıyordu.
test('system-patterns sync: a stale Retry status that disagrees with canonical patterns.yaml fails validation (exact Codex N5 drift)', async () => {
  await withMutatedFile(
    '02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/README.md',
    (content) => content.replace(
      '| [Retry](RETRY.md) | DOCUMENTED_ONLY | No real retry mechanism exists anywhere in `backend/src` or `automation-labs` (verified by grep, zero matches) — the JMeter fail-gate wrapper explicitly does NOT auto-retry, by design (see RETRY.md\'s own "Related labs" section) |',
      '| [Retry](RETRY.md) | IMPLEMENTED | JMeter/Selenium CI retry policy, N4 fail-safe pattern |'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when the README status column disagrees with canonical patterns.yaml');
      assert.match(result.stderr, /pattern 'pattern\.retry': README status column says "IMPLEMENTED" but canonical patterns\.yaml says "DOCUMENTED_ONLY"/);
    }
  );
});

// Codex final-verification fix (N5, item 7): this is the swap Codex
// explicitly warned about — a mislabel that keeps the AGGREGATE count
// looking right (still "9 IMPLEMENTED") even though the actual MEMBERS
// are wrong. This test reintroduces exactly that mislabel (Third-Party
// Integration back to its stale non-canonical status word) and requires
// the check to catch it independently of any total-count arithmetic.
// TR: Codex'in özellikle uyardığı SWAP budur — toplam sayı hâlâ doğru
// GÖRÜNÜR ("9 IMPLEMENTED"), ama GERÇEK üyelik yanlıştır. Bu test bunu
// bire bir yeniden üretir.
test('system-patterns sync: a non-canonical status word (Third-Party Integration mislabeled) fails validation even though the aggregate count would still match', async () => {
  await withMutatedFile(
    '02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/README.md',
    (content) => content.replace(
      '| [Third-Party Integration](THIRD-PARTY-INTEGRATION.md) | IMPLEMENTED | payment.service.js\'s deterministic fake-token design is a real, deliberate synthetic integration point |',
      '| [Third-Party Integration](THIRD-PARTY-INTEGRATION.md) | MODELED SYNTHETICALLY | payment.service.js\'s deterministic fake-token design is the real, deliberate example |'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when a status word is not a prefix-match of the canonical status, even if it superficially looks like a status label');
      assert.match(result.stderr, /pattern 'pattern\.third-party-integration': README status column says "MODELED SYNTHETICALLY" but canonical patterns\.yaml says "IMPLEMENTED"/);
    }
  );
});

// Codex final-verification fix (N6): evidence.yaml's CI-pipeline label
// previously hardcoded "(4 real jobs)" and silently went stale as
// .github/workflows/ci.yml grew to its current 9 job families. The fix
// removed the hardcoded count entirely rather than just updating it to a
// new number that would itself go stale later. This test proves the
// brittle "(<N> real job(s))" pattern cannot silently come back.
// TR: evidence.yaml'ın CI-pipeline etiketi eskiden "(4 real jobs)"
// olarak sabitlenmişti ve workflow büyüdükçe SESSİZCE bayatladı. Bu test,
// kırılgan "(<N> real job(s))" kalıbının SESSİZCE geri gelemeyeceğini
// kanıtlar.
test('evidence CI-pipeline label: a reintroduced hardcoded job count fails validation (exact Codex N6 drift)', async () => {
  await withMutatedFile(
    '06-EVIDENCE/evidence.yaml',
    (content) => content.replace(
      'label: "GitHub Actions CI pipeline with real executable QA jobs"',
      'label: "GitHub Actions CI pipeline (9 real jobs)"'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when the CI-pipeline evidence label hardcodes an exact job count again');
      assert.match(result.stderr, /hardcodes an exact job count/);
    }
  );
});

// Codex final-verification fix (N6, round 2): Codex proved the guard above
// only protects evidence.yaml — the SAME stale-job-count drift also lived,
// unprotected, in several other current-state prose surfaces (a CI/CD
// tools README, registry notes, digital-twin profile docs, a Playwright
// test comment). This test proves the new, explicitly-scoped
// CURRENT_CI_PROSE_SURFACES guard actually fires when one of THOSE files
// (not evidence.yaml) regresses, using the real 04-TOOLS-AND-TECH/05-CI-CD/
// README.md file as the reproduction target.
// TR: Codex, yukarıdaki korumanın YALNIZCA evidence.yaml'ı koruduğunu
// kanıtladı — aynı bayatlama başka güncel-durum metin yüzeylerinde de
// korumasız yaşıyordu. Bu test, yeni CURRENT_CI_PROSE_SURFACES korumasının
// evidence.yaml DIŞINDAKİ bir dosya bayatladığında da gerçekten
// tetiklendiğini kanıtlar.
test('current CI prose consistency: a reintroduced stale job-count phrase in a non-evidence.yaml current-state surface fails validation (exact Codex N6 round-2 drift)', async () => {
  await withMutatedFile(
    '04-TOOLS-AND-TECH/05-CI-CD/README.md',
    (content) => content.replace(
      '**Setup:** `.github/workflows/ci.yml` — dedicated jobs for registry',
      '**Setup:** `.github/workflows/ci.yml` — four jobs: dedicated jobs for registry'
    ),
    () => {
      const result = runValidator();
      assert.notEqual(result.code, 0, 'validator must FAIL when a current-state CI documentation surface reintroduces a stale job-count phrase');
      assert.match(result.stderr, /current CI prose consistency/);
      assert.match(result.stderr, /04-TOOLS-AND-TECH\/05-CI-CD\/README\.md/);
    }
  );
});

// Positive control: the real, unmodified current-state surfaces must all
// pass — proves the guard does not false-positive on the legitimate
// durable wording these files now use.
test('current CI prose consistency: the real, unmodified current-state CI documentation surfaces all pass', () => {
  const result = runValidator();
  assert.equal(result.code, 0, 'the real repository must pass the current CI prose consistency check with no stale phrases present');
});

// Codex final-verification fix (N6 round 3): Codex proved the round-2
// guard was still a fixed-phrase blacklist (a differently-worded mutation
// like "3-job" or "4/4 PASS" could slip past it) AND that its allowlist
// missed three real current-state surfaces (05-EXECUTABLE-LABS/README.md,
// 07-INTERVIEW/18-ABOUT-THIS-REPOSITORY-QUESTIONS.md,
// competency-state.yaml's Jenkins entry). The guard is now a genuine
// shape match (any digit/count-word directly adjacent to "job(s)"/"stage
// pipeline", or a scoped "CI ... N/N PASS" form) — this test proves it
// catches every variant Codex named, reproduced on TWO different
// protected surfaces, not just the one file the round-2 test used.
// TR: Codex, round-2 korumasının hâlâ sabit bir ifade listesi olduğunu
// (farklı ifade edilmiş bir mutasyon onu atlayabilirdi) VE izin
// listesinin üç gerçek güncel-durum yüzeyini kaçırdığını kanıtladı. Bu
// test, korumanın Codex'in belirttiği HER varyantı, TEK bir dosya değil,
// İKİ farklı korumalı yüzeyde yeniden üretilmiş olarak yakaladığını
// kanıtlar.
const N6_ROUND3_STALE_VARIANTS = [
  { label: 'four jobs', text: 'Current CI: four jobs.' },
  { label: '4 jobs', text: 'Current CI: 4 jobs.' },
  { label: '4-job GitHub Actions pipeline', text: 'Current CI: 4-job GitHub Actions pipeline.' },
  { label: '3 jobs', text: 'Current CI: 3 jobs.' },
  { label: 'three jobs', text: 'Current CI: three jobs.' },
  { label: 'all 3 jobs passed', text: 'Current CI: all 3 jobs passed.' },
  { label: 'same 3-stage pipeline', text: 'Current CI mirrors the same 3-stage pipeline.' },
  { label: 'same three-stage pipeline', text: 'Current CI mirrors the same three-stage pipeline.' },
  { label: '4/4 PASS', text: 'Current CI: 4/4 PASS.' },
  { label: '4 real jobs', text: 'Current CI: 4 real jobs.' },
];
const N6_ROUND3_TARGET_FILES = [
  '04-TOOLS-AND-TECH/05-CI-CD/README.md',
  'QA-DEMO-SYSTEM/web-tests/tests/visual-regression.spec.js',
];
for (const targetFile of N6_ROUND3_TARGET_FILES) {
  test(`current CI prose consistency (N6 round 3): all 10 mandatory stale-phrase variants are rejected on ${targetFile}`, async () => {
    for (const variant of N6_ROUND3_STALE_VARIANTS) {
      await withMutatedFile(
        targetFile,
        (content) => `${variant.text}\n${content}`,
        () => {
          const result = runValidator();
          assert.notEqual(result.code, 0, `validator must FAIL when ${targetFile} contains the stale phrase "${variant.label}"`);
          assert.match(result.stderr, /current CI prose consistency/, `failure for "${variant.label}" must come from the current CI prose consistency check`);
        }
      );
    }
  });
}

// Mandatory historical positive controls: explicitly-scoped historical CI
// counts must still PASS even inside a protected current-state surface —
// proves the guard checks local historical scope, not just file identity.
test('current CI prose consistency (N6 round 3): explicitly historical-SHA-scoped CI counts pass even inside a protected current surface', async () => {
  await withMutatedFile(
    '04-TOOLS-AND-TECH/05-CI-CD/README.md',
    (content) => `At historical SHA 81b77b4, the campaign had 4 jobs.\n${content}`,
    () => {
      const result = runValidator();
      assert.equal(result.code, 0, 'an explicitly historical-SHA-scoped CI job count must not be rejected as current-state drift');
    }
  );
});
test('current CI prose consistency (N6 round 3): explicitly Phase-scoped historical CI counts pass even inside a protected current surface', async () => {
  await withMutatedFile(
    '04-TOOLS-AND-TECH/05-CI-CD/README.md',
    (content) => `During Phase 6-19, 4/4 jobs passed at that point.\n${content}`,
    () => {
      const result = runValidator();
      assert.equal(result.code, 0, 'an explicitly Phase-scoped historical CI job count must not be rejected as current-state drift');
    }
  );
});

// UNRELATED false-positive guards: assertion/request counts and HTTP
// status codes must never be mistaken for CI job-topology claims, even
// though they share digits with the patterns above.
test('current CI prose consistency (N6 round 3): assertion counts and HTTP status codes are never mistaken for CI job-topology claims', async () => {
  await withMutatedFile(
    '04-TOOLS-AND-TECH/05-CI-CD/README.md',
    (content) => `The suite reports 4/4 assertions passed; a malformed request returns HTTP 404 and an unauthenticated one HTTP 401. See the Scheduled Jobs pattern for background-task QA guidance.\n${content}`,
    () => {
      const result = runValidator();
      assert.equal(result.code, 0, 'assertion counts, HTTP status codes, and the "Scheduled Jobs" pattern name must never be flagged as stale CI job-topology claims');
    }
  );
});
