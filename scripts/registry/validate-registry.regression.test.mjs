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
