#!/usr/bin/env node
// Registry validator (Section 41 of the master transformation spec).
// Loads every registry YAML file this repository actually has, validates
// each entry against its JSON Schema, and checks cross-file reference
// integrity (duplicate IDs, dangling pointers, orphans, claim-integrity
// rules). Exits non-zero on any failure so this is usable as a real CI
// gate, not just documentation. This is the exact script CI runs — see
// .github/workflows/ci.yml's "Registry integrity" job.
// TR: Bu, dokümantasyon amaçlı bir örnek DEĞİL — CI'da gerçekten
// çalışan, sıfırdan farklı bir çıkış koduyla gerçekten FAIL edebilen
// kapıdır (bkz. .github/workflows/ci.yml "registry-integrity" job'ı).
// Her kontrol bloğu (şema, dangling-ref, orphan, claim-integrity, EOL
// normalizasyonlu drift) kendi canonical veri sahipliğini ve neden
// var olduğunu kendi bloğunda açıklar (P3-01 TR yorum standardı).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import { buildIndexMarkdown } from './lib/build-index-markdown.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SCHEMAS_DIR = path.join(ROOT, 'shared', 'registry', 'schemas');

const ajv = new Ajv({ allErrors: true, strict: false });
const schemas = {};
for (const name of ['competency', 'domain', 'domain-catalog', 'tool', 'lab', 'evidence', 'relationship', 'profile-state', 'pattern', 'claim']) {
  const file = path.join(SCHEMAS_DIR, `${name}.schema.json`);
  schemas[name] = ajv.compile(JSON.parse(readFileSync(file, 'utf8')));
}

let errorCount = 0;
const knownIds = new Map(); // id -> file it was first seen in
const allGapIds = new Set();
const allCompetencyEntries = new Map(); // id -> full entry
const allDomainIds = new Set(); // universal catalog (shared/registry/catalog/domains.yaml) domain ids
const personalDomainIds = new Set(); // domain_ids referenced by 01-SALIM-BURAK-DIGITAL-TWIN/registry/domain-state.yaml (must be a subset of allDomainIds — FK check below)
const allToolIds = new Set();
const allLabIds = new Set();
const allEvidenceEntries = new Map(); // id -> full entry
const allPatternIds = new Set();
const allProfessionalCaseIds = new Set();

function fail(file, message) {
  errorCount += 1;
  console.error(`FAIL  ${file}: ${message}`);
}

function ok(message) {
  console.log(`OK    ${message}`);
}

function loadYaml(relPath) {
  const full = path.join(ROOT, relPath);
  if (!existsSync(full)) return null;
  return yaml.load(readFileSync(full, 'utf8'));
}

function registerId(id, file) {
  if (knownIds.has(id)) {
    fail(file, `duplicate id '${id}' also defined in ${knownIds.get(id)}`);
    return false;
  }
  knownIds.set(id, file);
  return true;
}

function validateEntry(schemaName, entry, file, label) {
  const validate = schemas[schemaName];
  const valid = validate(entry);
  if (!valid) {
    for (const err of validate.errors) {
      fail(file, `${label} ${err.instancePath || '(root)'} ${err.message}`);
    }
    return false;
  }
  return true;
}

// --- Digital Twin personal registry (01-SALIM-BURAK-DIGITAL-TWIN/registry/) ---

const dtRoot = '01-SALIM-BURAK-DIGITAL-TWIN/registry';

const profile = loadYaml(`${dtRoot}/profile.yaml`);
if (profile) {
  if (validateEntry('profile-state', profile, `${dtRoot}/profile.yaml`, 'profile')) {
    registerId(profile.id, `${dtRoot}/profile.yaml`);
    ok(`profile.yaml: ${profile.id} valid`);
  }
}

const competencyState = loadYaml(`${dtRoot}/competency-state.yaml`);
if (competencyState && Array.isArray(competencyState.competencies)) {
  let validCount = 0;
  for (const c of competencyState.competencies) {
    const file = `${dtRoot}/competency-state.yaml`;
    if (validateEntry('competency', c, file, `competency '${c.id}'`)) {
      if (registerId(c.id, file)) validCount += 1;
      allCompetencyEntries.set(c.id, c);
      for (const g of c.gaps || []) allGapIds.add(`ref:${g}:${file}`);
    }
  }
  ok(`competency-state.yaml: ${validCount}/${competencyState.competencies.length} competencies valid`);
}

// --- Claim-integrity (F1-2 post-verification fix): knowledge must never
// silently become professional participation. A competency's own note can
// admit that its ONLY grounding is a knowledge-level list (not a real
// what_i_did case action) while still assigning an elevated professional
// status (PARTICIPATED/EXECUTED/AUDITED) — this is a self-contradicting
// entry, and the exact defect Codex found in competency.security.security-aware-qa
// (professional.status: PARTICIPATED with a note literally admitting the
// source is a "professional knowledge listesi", not a case action).
// TR: Codex, competency-state.yaml'da bir competency'nin KENDİ notunun
// "bu yalnızca bir knowledge listesinden geliyor, gerçek bir vaka fiili
// değil" dediği halde professional.status'un PARTICIPATED/EXECUTED
// olarak bırakıldığını bulmuştu. Bu kontrol, bu türden bir öz-çelişkiyi
// gelecekte de otomatik olarak yakalar — yalnızca bu turda bulunan tek
// örneği elle düzeltmekle YETİNMEZ.
const KNOWLEDGE_ONLY_MARKERS = [
  'professional knowledge listesi',
  'knowledge listesi olarak',
  'professional_domain_tool_knowledge listesinde',
];
if (competencyState && Array.isArray(competencyState.competencies)) {
  const elevatedStatuses = new Set(['PARTICIPATED', 'EXECUTED', 'AUDITED']);
  let checkedCount = 0;
  for (const c of competencyState.competencies) {
    const prof = c.professional;
    if (!prof || !elevatedStatuses.has(prof.status)) continue;
    checkedCount += 1;
    const text = `${prof.note || ''} ${prof.evidence || ''}`;
    const hit = KNOWLEDGE_ONLY_MARKERS.find((m) => text.includes(m));
    if (hit) {
      fail(`${dtRoot}/competency-state.yaml`, `competency '${c.id}' has professional.status: ${prof.status} but its own note/evidence admits knowledge-list-only grounding ("${hit}") — knowledge must never automatically become professional participation; downgrade professional.status to NONE or remove the self-contradicting marker text`);
    }
  }
  ok(`claim-integrity: ${checkedCount} elevated professional-status competencies checked for knowledge-only-derivation self-contradiction`);
}

const domainState = loadYaml(`${dtRoot}/domain-state.yaml`);
if (domainState && Array.isArray(domainState.personal_domain_exposure)) {
  // domain_id here is a REFERENCE into shared/registry/catalog/domains.yaml
  // (the catalog owns the id), not a new definition — so this loop
  // validates shape only and does not call registerId, matching the
  // "one fact, one owner" rule: personal exposure is a different fact
  // about the same domain_id, not a competing definition of it.
  // TR: domain_id burada bir TANIM değil, REFERANS'tır — sahiplik
  // domains.yaml'dadır. Bu yüzden registerId() çağrılmaz; aksi halde
  // kişisel exposure kaydı ile evrensel domain tanımı arasında YANLIŞ bir
  // "duplicate id" çakışması raporlanırdı (bu hata gerçekten yaşandı ve
  // düzeltildi — bkz. .ai/DECISIONS.md).
  let validCount = 0;
  for (const d of domainState.personal_domain_exposure) {
    const file = `${dtRoot}/domain-state.yaml`;
    if (validateEntry('domain', d, file, `domain '${d.domain_id}'`)) {
      validCount += 1;
      personalDomainIds.add(d.domain_id);
    }
  }
  ok(`domain-state.yaml: ${validCount}/${domainState.personal_domain_exposure.length} domain exposures valid`);
}

const toolState = loadYaml(`${dtRoot}/tool-state.yaml`);
if (toolState && toolState.tool_categories) {
  let total = 0;
  let validCount = 0;
  for (const [category, tools] of Object.entries(toolState.tool_categories)) {
    for (const t of tools) {
      total += 1;
      const file = `${dtRoot}/tool-state.yaml`;
      if (validateEntry('tool', t, file, `tool '${t.id}' (${category})`)) {
        if (registerId(t.id, file)) validCount += 1;
        allToolIds.add(t.id);
      }
    }
  }
  ok(`tool-state.yaml: ${validCount}/${total} tools valid`);
}

// gaps.yaml has no dedicated schema (it is a flat label list referenced by
// id, not a catalog entry shape) — collect real ids for reference checking.
const gapsFile = loadYaml(`${dtRoot}/gaps.yaml`);
const realGapIds = new Set();
if (gapsFile && Array.isArray(gapsFile.gaps)) {
  for (const g of gapsFile.gaps) realGapIds.add(g.id);
  ok(`gaps.yaml: ${gapsFile.gaps.length} gap entries loaded`);
}

// --- Cross-reference integrity: every gaps: [...] pointer in
// competency-state.yaml must resolve to a real gap in gaps.yaml ---
for (const ref of allGapIds) {
  const [, gapId, file] = ref.split(':');
  if (!realGapIds.has(gapId)) {
    fail(file, `dangling gap reference '${gapId}' — not found in gaps.yaml`);
  }
}
if (allGapIds.size > 0) ok(`${allGapIds.size} gap references checked against gaps.yaml`);

// --- Professional experience (claim-integrity: no professional claim
// without provenance) ---
const proFile = `${dtRoot}/professional-experience.yaml`;
const proData = loadYaml(proFile);
if (proData && Array.isArray(proData.professional_cases)) {
  let validCount = 0;
  for (const p of proData.professional_cases) {
    if (typeof p.sanitized !== 'boolean') {
      fail(proFile, `professional case '${p.id}' is missing a 'sanitized' boolean — every professional claim must state whether it is sanitized (claim-integrity: no claim without source classification)`);
      continue;
    }
    if (registerId(p.id, proFile)) validCount += 1;
    allProfessionalCaseIds.add(p.id);
  }
  ok(`professional-experience.yaml: ${validCount}/${proData.professional_cases.length} professional cases valid (sanitized field present)`);
}

const sourceProvenanceFile = `${dtRoot}/source-provenance.yaml`;
const sourceProvenance = loadYaml(sourceProvenanceFile);
if (sourceProvenance && Array.isArray(sourceProvenance.sources)) {
  const proSource = sourceProvenance.sources.find((s) => (s.covers || []).includes('professional-experience'));
  if (!proSource) {
    fail(sourceProvenanceFile, `no source declares coverage of 'professional-experience' — every professional claim in professional-experience.yaml would then have no traceable provenance`);
  } else {
    ok(`source-provenance.yaml: professional-experience coverage traced to '${proSource.id}'`);
  }
}

// --- CLAIM-LEVEL provenance (P1-05 post-Codex fix — "the most important
// integrity fix"). The file-level check above only proves *some* source
// covers professional-experience.yaml as a whole; it cannot catch a single
// invented what_i_did/other_professional_project_exposure bullet inserted
// into that file, because nothing checked individual bullets. This block
// closes that gap: every real bullet must have an exact-text-matching
// claims.yaml entry, and every claims.yaml entry's source_id must resolve
// to a real source-provenance.yaml source.
// TR: Codex'in kanıtladığı gerçek açık — dosya seviyesinde "bir kaynak
// var" kontrolü, professional-experience.yaml'a UYDURMA bir what_i_did
// maddesi eklense bile PASS veriyordu, çünkü hiçbir kontrol MADDE
// seviyesinde çalışmıyordu. Bu blok, her maddeyi claims.yaml'daki birebir
// (text) eşleşen bir kayda zorunlu kılarak bunu kapatır.
const claimsFile = `${dtRoot}/claims.yaml`;
const claimsData = loadYaml(claimsFile);
const realSourceIds = new Set((sourceProvenance && sourceProvenance.sources || []).map((s) => s.id));
const sourceTypeById = new Map((sourceProvenance && sourceProvenance.sources || []).map((s) => [s.id, s.type]));

// --- Professional claim source SCOPE (F2 post-verification fix). Every
// entry in claims.yaml is, by definition, a professional-experience claim
// (WHAT_I_DID or OTHER_PROFESSIONAL_PROJECT_EXPOSURE) — so its source_id
// must resolve not merely to *some* source-provenance.yaml entry, but to
// one whose declared TYPE is actually valid evidence of professional
// history. source-provenance.yaml's own precedence table already states
// this rule in prose ("Repository kanıtı yalnızca repository pratiğini
// kanıtlar, profesyonel istihdam deneyimini KANITLAMAZ") — this enforces
// it as a real, executable constraint instead of only prose.
// TR: Codex, bir professional WHAT_I_DID claim'inin source_id'sini
// src.repository-campaign-evidence.phase-0-19 (type: repository_evidence)
// olarak değiştirip validation'ın hâlâ exit 0 verdiğini KANITLADI —
// önceki kontrol yalnızca "source_id GERÇEK bir source'a çözümleniyor mu"
// diye bakıyordu, o source'un TÜRÜNE (type) hiç bakmıyordu. Bu, tek bir
// source ID'yi hardcode ederek değil, source_id'nin TİPİNİ (semantic
// class) kontrol ederek çözülür — gelecekte eklenecek herhangi bir
// repository_evidence tipli kaynak da otomatik olarak reddedilir.
const PROFESSIONAL_CLAIM_VALID_SOURCE_TYPES = new Set([
  'latest_explicit_user_confirmation',
  'current_professional_cv_or_canonical_professional_data',
  'older_user_statement',
]);

if (claimsData && Array.isArray(claimsData.claims)) {
  let validClaimCount = 0;
  const seenClaimIds = new Set();
  for (const c of claimsData.claims) {
    const label = `claim '${c.claim_id}'`;
    if (!validateEntry('claim', c, claimsFile, label)) continue;
    if (seenClaimIds.has(c.claim_id)) {
      fail(claimsFile, `duplicate claim_id '${c.claim_id}' within claims.yaml`);
      continue;
    }
    seenClaimIds.add(c.claim_id);
    if (!realSourceIds.has(c.source_id)) {
      fail(claimsFile, `${label} — source_id '${c.source_id}' does not resolve to any entry in source-provenance.yaml#sources`);
      continue;
    }
    const sourceType = sourceTypeById.get(c.source_id);
    if (!PROFESSIONAL_CLAIM_VALID_SOURCE_TYPES.has(sourceType)) {
      fail(claimsFile, `${label} — source_id '${c.source_id}' has type '${sourceType}', which is not a valid source class for a professional claim (repository evidence proves repository PRACTICE only, never professional EXPERIENCE — see source-provenance.yaml#precedence rank 3's own note)`);
      continue;
    }
    if (c.claim_type === 'WHAT_I_DID' && !c.professional_case_id) {
      fail(claimsFile, `${label} — claim_type WHAT_I_DID requires a professional_case_id`);
      continue;
    }
    if (c.claim_type === 'OTHER_PROFESSIONAL_PROJECT_EXPOSURE' && c.professional_case_id) {
      fail(claimsFile, `${label} — claim_type OTHER_PROFESSIONAL_PROJECT_EXPOSURE must not carry a professional_case_id`);
      continue;
    }
    validClaimCount += 1;
  }
  ok(`claims.yaml: ${validClaimCount}/${claimsData.claims.length} claim entries valid (schema + resolvable source_id)`);

  // Negative-provenance check, both directions:
  //   (a) every real bullet in professional-experience.yaml must have a
  //       matching SOURCED claim (an inserted/fabricated bullet fails here);
  //   (b) every SOURCED claim must still correspond to a real, live bullet
  //       (a stale claim left behind after a bullet is removed is also a
  //       drift the graph should not silently tolerate).
  if (proData && Array.isArray(proData.professional_cases)) {
    const whatIDidClaims = claimsData.claims.filter((c) => c.claim_type === 'WHAT_I_DID' && c.verification_state === 'SOURCED');
    const otherExposureClaims = claimsData.claims.filter((c) => c.claim_type === 'OTHER_PROFESSIONAL_PROJECT_EXPOSURE' && c.verification_state === 'SOURCED');
    const matchedClaimIds = new Set();
    let uncoveredBullets = 0;

    for (const p of proData.professional_cases) {
      for (const bulletText of p.what_i_did || []) {
        const match = whatIDidClaims.find((c) => c.professional_case_id === p.id && c.text === bulletText);
        if (!match) {
          uncoveredBullets += 1;
          fail(proFile, `unsourced professional claim — professional case '${p.id}' what_i_did bullet "${bulletText}" has no matching claims.yaml entry (claim-level provenance: NO CLAIM WITHOUT SOURCE)`);
        } else {
          matchedClaimIds.add(match.claim_id);
        }
      }
    }
    for (const bulletText of proData.other_professional_project_exposure || []) {
      const match = otherExposureClaims.find((c) => c.text === bulletText);
      if (!match) {
        uncoveredBullets += 1;
        fail(proFile, `unsourced professional claim — other_professional_project_exposure item "${bulletText}" has no matching claims.yaml entry (claim-level provenance: NO CLAIM WITHOUT SOURCE)`);
      } else {
        matchedClaimIds.add(match.claim_id);
      }
    }

    let staleClaims = 0;
    for (const c of [...whatIDidClaims, ...otherExposureClaims]) {
      if (!matchedClaimIds.has(c.claim_id)) {
        staleClaims += 1;
        fail(claimsFile, `claim '${c.claim_id}' does not match any live bullet in professional-experience.yaml — either the bullet was removed (stale claim, should be deleted) or the text has drifted (claim-level provenance must stay 1:1)`);
      }
    }

    if (uncoveredBullets === 0 && staleClaims === 0) {
      ok(`claim-level provenance: every what_i_did/other_professional_project_exposure bullet in professional-experience.yaml has an exact-matching, source-resolvable claims.yaml entry (${matchedClaimIds.size} claims verified 1:1)`);
    }
  }
} else {
  fail(claimsFile, 'claims.yaml is missing or has no claims array — claim-level provenance (P1-05) cannot be enforced without it');
}

// --- Universal catalog (shared/registry/catalog/) — optional, validated if present ---

const catalogDir = 'shared/registry/catalog';
const catalogFiles = {
  domains: { schema: 'domain-catalog', idField: 'domain_id' },
  labs: { schema: 'lab', idField: 'id' },
  patterns: { schema: 'pattern', idField: 'id' },
};
for (const [fileBase, { schema: schemaName, idField }] of Object.entries(catalogFiles)) {
  const data = loadYaml(`${catalogDir}/${fileBase}.yaml`);
  if (!data) continue;
  const items = Array.isArray(data) ? data : data.items;
  if (!Array.isArray(items)) continue;
  let validCount = 0;
  const file = `${catalogDir}/${fileBase}.yaml`;
  for (const item of items) {
    if (validateEntry(schemaName, item, file, `${schemaName} '${item[idField]}'`)) {
      if (registerId(item[idField], file)) validCount += 1;
    }
    if (item.path && !existsSync(path.join(ROOT, item.path))) {
      fail(file, `${schemaName} '${item[idField]}' path does not exist: ${item.path}`);
    }
    if (fileBase === 'labs') allLabIds.add(item.id);
    if (fileBase === 'patterns') allPatternIds.add(item.id);
    if (fileBase === 'domains') allDomainIds.add(item.domain_id);
  }
  ok(`${fileBase}.yaml: ${validCount}/${items.length} ${schemaName} entries valid`);
}

// --- Foreign-key check (P2-01 post-Codex fix): every personal domain_id in
// domain-state.yaml must resolve to a real domain in the universal catalog.
// domains.yaml is the id space personal exposure entries point into — the
// personal file's own header comment already documented this as the
// intent, but nothing actually checked it until now.
// TR: Codex, kişisel domain-state.yaml'ın evrensel domains.yaml katalogundan
// DAHA FAZLA domain içerdiğini bulmuştu — bu, "domain_id burada bir
// REFERANS'tır" iddiasının hiçbir zaman DOĞRULANMADIĞI anlamına geliyordu.
// Bu kontrol artık bunu gerçek bir foreign-key kısıtlaması olarak uygular.
for (const id of personalDomainIds) {
  if (!allDomainIds.has(id)) {
    fail(`${dtRoot}/domain-state.yaml`, `personal domain exposure references domain_id '${id}', which does not exist in the universal catalog (shared/registry/catalog/domains.yaml) — every personal domain_id must resolve to a real catalog entry (foreign-key check)`);
  }
}
if (personalDomainIds.size > 0) ok(`domain foreign-key check: ${personalDomainIds.size} personal domain_id references checked against the universal catalog`);

// --- Evidence registry (06-EVIDENCE/evidence.yaml — owned there per Section 33-35) ---

const evidenceFile = '06-EVIDENCE/evidence.yaml';
const evidenceData = loadYaml(evidenceFile);
if (evidenceData && Array.isArray(evidenceData.items)) {
  let validCount = 0;
  for (const e of evidenceData.items) {
    if (validateEntry('evidence', e, evidenceFile, `evidence '${e.id}'`)) {
      if (registerId(e.id, evidenceFile)) validCount += 1;
      allEvidenceEntries.set(e.id, e);
    }
    if (e.artifact && !existsSync(path.join(ROOT, e.artifact))) {
      fail(evidenceFile, `evidence '${e.id}' artifact path does not exist: ${e.artifact}`);
    }
    if (e.related_lab && !allLabIds.has(e.related_lab)) {
      fail(evidenceFile, `evidence '${e.id}' related_lab '${e.related_lab}' not found in labs.yaml`);
    }
    // Claim-integrity: AUDITED/E5 without independent audit evidence.
    // The schema's if/then already requires audit_record structurally for
    // E5_INDEPENDENTLY_AUDITED — this is a second, explicit check so the
    // rule is visible here too, not only buried in the JSON Schema.
    if (e.maturity === 'E5_INDEPENDENTLY_AUDITED' && !e.audit_record) {
      fail(evidenceFile, `evidence '${e.id}' claims E5_INDEPENDENTLY_AUDITED without an audit_record — no self-declared AUDITED evidence is allowed`);
    }
  }
  ok(`evidence.yaml: ${validCount}/${evidenceData.items.length} evidence entries valid, all artifact paths checked`);
}

// --- Relationships (shared/registry/relationships/relationships.yaml) ---

const relFile = 'shared/registry/relationships/relationships.yaml';
const relationships = loadYaml(relFile);
const allKnownIdsForRelationships = new Set([
  ...allCompetencyEntries.keys(),
  ...allDomainIds,
  ...allToolIds,
  ...allLabIds,
  ...allEvidenceEntries.keys(),
  ...allPatternIds,
  ...allProfessionalCaseIds,
  ...realGapIds,
  ...(profile ? [profile.id] : []),
]);
const referencedEvidenceIds = new Set();
const referencedLabIds = new Set();

if (relationships && Array.isArray(relationships.relationships)) {
  let validCount = 0;
  for (const rel of relationships.relationships) {
    const label = `relationship ${rel.from} ${rel.predicate} ${rel.to}`;
    if (!validateEntry('relationship', rel, relFile, label)) continue;

    // "missing relation targets": both from and to must resolve to a real,
    // already-loaded id — not just be shaped like one.
    let targetsOk = true;
    if (!allKnownIdsForRelationships.has(rel.from)) {
      fail(relFile, `${label} — 'from' id '${rel.from}' does not resolve to any known registry entry`);
      targetsOk = false;
    }
    if (!allKnownIdsForRelationships.has(rel.to)) {
      fail(relFile, `${label} — 'to' id '${rel.to}' does not resolve to any known registry entry`);
      targetsOk = false;
    }
    if (targetsOk) validCount += 1;

    if (allEvidenceEntries.has(rel.to)) referencedEvidenceIds.add(rel.to);
    if (allEvidenceEntries.has(rel.from)) referencedEvidenceIds.add(rel.from);
    if (allLabIds.has(rel.to)) referencedLabIds.add(rel.to);
    if (allLabIds.has(rel.from)) referencedLabIds.add(rel.from);
  }
  ok(`relationships.yaml: ${validCount}/${relationships.relationships.length} relationships valid (schema + both endpoints resolve)`);
}

// --- Orphan check, generalized across every canonical entity type ---
// TR: Sadece evidence/lab için değil, HER canonical entity tipi için
// (competency, domain, tool, pattern, gap, professional-experience)
// hiçbir relationship edge'i tarafından dokunulmamış bir id gerçekten
// "unintentionally orphaned" mi diye kontrol eder — bu, grafiğin
// büyümesiyle birlikte YENİ bir orphan eklenirse (bir kayıt eklenip
// ilişki eklenmeyi unutulursa) otomatik olarak yakalanmasını sağlar.
{
  const touchedIds = new Set();
  if (relationships && Array.isArray(relationships.relationships)) {
    for (const rel of relationships.relationships) {
      touchedIds.add(rel.from);
      touchedIds.add(rel.to);
    }
  }
  const entityGroups = [
    { label: 'competency', file: `${dtRoot}/competency-state.yaml`, ids: [...allCompetencyEntries.keys()] },
    { label: 'domain', file: `${catalogDir}/domains.yaml`, ids: [...allDomainIds] },
    { label: 'tool', file: `${dtRoot}/tool-state.yaml`, ids: [...allToolIds] },
    { label: 'pattern', file: `${catalogDir}/patterns.yaml`, ids: [...allPatternIds] },
    { label: 'gap', file: `${dtRoot}/gaps.yaml`, ids: [...realGapIds] },
    { label: 'professional case', file: proFile, ids: [...allProfessionalCaseIds] },
  ];
  let totalChecked = 0;
  for (const { label, file, ids } of entityGroups) {
    totalChecked += ids.length;
    for (const id of ids) {
      if (!touchedIds.has(id)) {
        fail(file, `${label} '${id}' is orphaned — not referenced by any relationship edge (from or to)`);
      }
    }
  }
  ok(`generalized orphan check: ${totalChecked} competency/domain/tool/pattern/gap/professional-case entries checked for relationship-graph orphaning`);
}

// --- Orphan checks ---
// Orphan evidence: no lab points to it via related_lab AND no relationship
// edge references it either way.
for (const [id, e] of allEvidenceEntries) {
  const hasLabLink = Boolean(e.related_lab);
  const hasRelationshipLink = referencedEvidenceIds.has(id);
  if (!hasLabLink && !hasRelationshipLink) {
    fail(evidenceFile, `evidence '${id}' is orphaned — not linked from any lab's related_lab and not referenced by any relationship edge`);
  }
}
// Orphan labs: no evidence points back to it via related_lab AND no
// relationship edge references it either.
const labsWithEvidenceLink = new Set();
for (const e of allEvidenceEntries.values()) {
  if (e.related_lab) labsWithEvidenceLink.add(e.related_lab);
}
for (const id of allLabIds) {
  if (!labsWithEvidenceLink.has(id) && !referencedLabIds.has(id)) {
    fail(catalogDir + '/labs.yaml', `lab '${id}' is orphaned — no evidence entry's related_lab points to it and no relationship edge references it`);
  }
}
ok(`orphan check: ${allEvidenceEntries.size} evidence and ${allLabIds.size} lab entries checked for orphaning`);

// --- Claim-integrity: CI_VERIFIED without CI evidence ---
// Any competency whose repository.status is CI_VERIFIED must have a
// relationship edge pointing at an evidence entry whose maturity is
// E4_CI_VERIFIED or higher — otherwise the claim has no real CI proof
// behind it in the graph.
// TR: Bir competency'nin repository.status alanı CI_VERIFIED OLABİLİR
// ama bunu destekleyen gerçek bir evidence bağlantısı YOKSA, bu durum
// "iddia var, kanıt yok" anlamına gelir — Section 42'nin "NO CI_VERIFIED
// WITHOUT CI EVIDENCE" kuralının YAML alanı seviyesinde değil, GRAF
// seviyesinde uygulanmasıdır. Bu kontrol olmadan, biri competency-state.yaml'da
// statüyü CI_VERIFIED yazıp hiçbir zaman gerçek bir bağlantı eklemeyi
// unutabilir — bu, schema validation'ın YAKALAYAMAYACAĞI bir hatadır.
if (relationships && Array.isArray(relationships.relationships)) {
  const ciVerifiedMaturities = new Set(['E4_CI_VERIFIED', 'E5_INDEPENDENTLY_AUDITED']);
  for (const [id, c] of allCompetencyEntries) {
    if (c.repository.status !== 'CI_VERIFIED') continue;
    const linkedEvidenceIds = relationships.relationships
      .filter((r) => r.from === id && allEvidenceEntries.has(r.to))
      .map((r) => r.to);
    const hasCiEvidence = linkedEvidenceIds.some((eid) => {
      const e = allEvidenceEntries.get(eid);
      return e && ciVerifiedMaturities.has(e.maturity);
    });
    if (!hasCiEvidence) {
      fail(relFile, `competency '${id}' claims repository.status: CI_VERIFIED but has no relationship edge to an E4_CI_VERIFIED (or higher) evidence entry — no CI_VERIFIED claim without real CI evidence`);
    }
  }
  ok('claim-integrity: CI_VERIFIED competencies checked for a linked CI-verified evidence entry');
}

// --- Relationship semantics: PRACTICED_IN requires REAL repository
// practice, not merely "not explicitly NOT_PRACTICED" (F3 post-verification
// fix, tightening P1-04's original check). ---
// PRACTICED_IN claims real repository execution of a competency inside a
// specific lab. repository.status has a real maturity ORDER (this file's
// own header comment): NOT_PRACTICED < DOCUMENTED < IMPLEMENTED < EXECUTED
// < CI_VERIFIED < AUDITED. The original version of this check only
// rejected status === NOT_PRACTICED — Codex proved this was too weak by
// reintroducing `competency.cicd.jenkins PRACTICED_IN lab.cicd.github-actions`:
// Jenkins' repository.status is DOCUMENTED, not NOT_PRACTICED, so the old
// check let it through even though this competency's OWN evidence text
// says "gerçek Jenkins server hiç mevcut olmadı, ÇALIŞTIRILMADI" (a real
// Jenkins server never existed, was NEVER EXECUTED) — DOCUMENTED in this
// repository's own vocabulary means "written/configured, not proven
// executed," which is precisely NOT what PRACTICED_IN may claim.
// The fix: PRACTICED_IN now requires repository.status to be at or above
// IMPLEMENTED (real evidence of having actually run, not just a
// syntax-valid config) — verified against all 13 currently-real
// PRACTICED_IN edges, every one of which is already IMPLEMENTED or higher,
// so no legitimate edge is broken by tightening this threshold.
// TR: Önceki kontrol yalnızca "NOT_PRACTICED DEĞİL mi" diye bakıyordu —
// bu, DOCUMENTED (yazılmış ama hiç ÇALIŞTIRILMAMIŞ) durumundaki bir
// competency'nin PRACTICED_IN iddiasını YAKALAYAMIYORDU. Codex tam olarak
// bunu kanıtladı (Jenkins). Şimdi eşik IMPLEMENTED VE ÜZERİ'ne
// yükseltildi — DOCUMENTED artık PRACTICED_IN için YETERSİZ sayılır.
const REPOSITORY_STATUS_ORDER = ['NOT_PRACTICED', 'DOCUMENTED', 'IMPLEMENTED', 'EXECUTED', 'CI_VERIFIED', 'AUDITED'];
const MIN_PRACTICED_IN_STATUS_RANK = REPOSITORY_STATUS_ORDER.indexOf('IMPLEMENTED');
if (relationships && Array.isArray(relationships.relationships)) {
  let checkedCount = 0;
  for (const rel of relationships.relationships) {
    if (rel.predicate !== 'PRACTICED_IN') continue;
    const comp = allCompetencyEntries.get(rel.from);
    if (!comp) continue;
    checkedCount += 1;
    const status = comp.repository && comp.repository.status;
    const rank = REPOSITORY_STATUS_ORDER.indexOf(status);
    if (rank < MIN_PRACTICED_IN_STATUS_RANK) {
      fail(relFile, `relationship ${rel.from} PRACTICED_IN ${rel.to} — competency '${rel.from}' has repository.status: ${status}, which is below IMPLEMENTED and therefore cannot support a PRACTICED_IN claim (PRACTICED_IN requires real, executed repository practice — NOT_PRACTICED and DOCUMENTED both mean the competency was never actually run in this repository)`);
    }
  }
  ok(`relationship-semantic check: ${checkedCount} PRACTICED_IN edges checked against their competency's repository.status (requires >= IMPLEMENTED)`);
}

// --- Generated-output drift ---
// shared/registry/generated/REGISTRY-INDEX.md must be exactly what
// build-indexes.mjs would produce right now — if it isn't, someone
// edited the registry without regenerating the index (or edited the
// generated file by hand), and the two are now silently out of sync.
// TR: Bu kontrol OLMADAN, registry YAML dosyaları güncellenip
// REGISTRY-INDEX.md güncellenmezse (veya tam tersi, index elle
// düzenlenirse) hiçbir hata YAKALANMAZ — dosyalar sessizce birbirinden
// uzaklaşır (drift). Bu, "tek gerçek kaynak" ilkesinin ihlalini otomatik
// olarak tespit eden tek kontroldür.
// TR: Codex post-audit fix (P2-02) — Windows'ta (veya CRLF'e normalize eden
// bir git ayarında) checkout edilen REGISTRY-INDEX.md CRLF satır sonlarına
// sahip olabilirken, buildIndexMarkdown() her zaman LF üretir. Karşılaştırma
// öncesi her iki tarafı da LF'ye normalize etmek, gerçek içerik farkını
// (bir kayıt eklenip index'in yeniden üretilmemesi gibi) GİZLEMEZ — yalnızca
// EOL temsilini eşitler.
function normalizeEol(text) {
  return text === null ? text : text.replace(/\r\n/g, '\n');
}

const generatedIndexPath = 'shared/registry/generated/REGISTRY-INDEX.md';
const committedIndex = normalizeEol(loadYamlOrText(generatedIndexPath));
const freshIndex = normalizeEol(buildIndexMarkdown(ROOT));
if (committedIndex !== freshIndex) {
  fail(generatedIndexPath, "committed file does not match a fresh regeneration — run 'npm run registry:build-indexes' and commit the diff (comparison is EOL-normalized — this is real content drift, not a line-ending difference)");
} else {
  ok('generated-output drift: shared/registry/generated/REGISTRY-INDEX.md matches a fresh regeneration (EOL-normalized comparison)');
}

function loadYamlOrText(relPath) {
  const full = path.join(ROOT, relPath);
  if (!existsSync(full)) return null;
  return readFileSync(full, 'utf8');
}

console.log('');
if (errorCount > 0) {
  console.error(`REGISTRY VALIDATION FAILED: ${errorCount} error(s).`);
  process.exit(1);
} else {
  console.log('REGISTRY VALIDATION PASSED: 0 errors.');
  process.exit(0);
}
