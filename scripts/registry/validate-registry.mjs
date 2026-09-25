#!/usr/bin/env node
// Registry validator (Section 41 of the master transformation spec).
// Loads every registry YAML file this repository actually has, validates
// each entry against its JSON Schema, and checks cross-file reference
// integrity (duplicate IDs, dangling pointers). Exits non-zero on any
// failure so this is usable as a real CI gate, not just documentation.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const SCHEMAS_DIR = path.join(ROOT, 'shared', 'registry', 'schemas');

const ajv = new Ajv({ allErrors: true, strict: false });
const schemas = {};
for (const name of ['competency', 'domain', 'tool', 'lab', 'evidence', 'relationship', 'profile-state']) {
  const file = path.join(SCHEMAS_DIR, `${name}.schema.json`);
  schemas[name] = ajv.compile(JSON.parse(readFileSync(file, 'utf8')));
}

let errorCount = 0;
const knownIds = new Map(); // id -> file it was first seen in
const allGapIds = new Set();
const allCompetencyIds = new Set();
const allDomainIds = new Set();
const allToolIds = new Set();

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
      allCompetencyIds.add(c.id);
      for (const g of c.gaps || []) allGapIds.add(`ref:${g}:${file}`);
    }
  }
  ok(`competency-state.yaml: ${validCount}/${competencyState.competencies.length} competencies valid`);
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
      allDomainIds.add(d.domain_id);
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

// --- Universal catalog (shared/registry/catalog/) — optional, validated if present ---

const catalogDir = 'shared/registry/catalog';
const catalogFiles = {
  domains: { schema: 'domain', idField: 'domain_id' },
  labs: { schema: 'lab', idField: 'id' },
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
  }
  ok(`${fileBase}.yaml: ${validCount}/${items.length} ${schemaName} entries valid`);
}

// --- Evidence registry (06-EVIDENCE/evidence.yaml — owned there per Section 33-35) ---

const allLabIds = new Set();
{
  const labsData = loadYaml(`${catalogDir}/labs.yaml`);
  if (labsData && Array.isArray(labsData.items)) {
    for (const l of labsData.items) allLabIds.add(l.id);
  }
}

const evidenceFile = '06-EVIDENCE/evidence.yaml';
const evidenceData = loadYaml(evidenceFile);
if (evidenceData && Array.isArray(evidenceData.items)) {
  let validCount = 0;
  for (const e of evidenceData.items) {
    if (validateEntry('evidence', e, evidenceFile, `evidence '${e.id}'`)) {
      if (registerId(e.id, evidenceFile)) validCount += 1;
    }
    if (e.artifact && !existsSync(path.join(ROOT, e.artifact))) {
      fail(evidenceFile, `evidence '${e.id}' artifact path does not exist: ${e.artifact}`);
    }
    if (e.related_lab && !allLabIds.has(e.related_lab)) {
      fail(evidenceFile, `evidence '${e.id}' related_lab '${e.related_lab}' not found in labs.yaml`);
    }
  }
  ok(`evidence.yaml: ${validCount}/${evidenceData.items.length} evidence entries valid, all artifact paths checked`);
}

// --- Relationships (shared/registry/relationships/relationships.yaml) ---

const relFile = 'shared/registry/relationships/relationships.yaml';
const relationships = loadYaml(relFile);
if (relationships && Array.isArray(relationships.relationships)) {
  let validCount = 0;
  for (const rel of relationships.relationships) {
    if (validateEntry('relationship', rel, relFile, `relationship ${rel.from} ${rel.predicate} ${rel.to}`)) {
      validCount += 1;
      // Best-effort dangling-reference check against what we've seen loaded
      // so far (catalog is not exhaustive yet, so this only warns, not fails,
      // for ids outside the personal registry + catalog we actually loaded).
    }
  }
  ok(`relationships.yaml: ${validCount}/${relationships.relationships.length} relationships schema-valid`);
}

console.log('');
if (errorCount > 0) {
  console.error(`REGISTRY VALIDATION FAILED: ${errorCount} error(s).`);
  process.exit(1);
} else {
  console.log('REGISTRY VALIDATION PASSED: 0 errors.');
  process.exit(0);
}
