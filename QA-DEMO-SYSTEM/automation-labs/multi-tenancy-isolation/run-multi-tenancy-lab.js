'use strict';

// Real aggregate run: seeds 2 real tenants' rows in one real SQLite
// database, then proves the scoped repository's full isolation
// across create/read/list/update/delete, and separately proves the
// deliberately unsafe comparison repository DOES leak — side by side,
// against the same real seeded data.
// TR: Bu, iki GERÇEK tenant'ın satırlarının tek bir GERÇEK SQLite
// veritabanında tohumlandığı bir agregat çalıştırmadır.

const { DatabaseSync } = require('node:sqlite');
const { createSchema } = require('./lib/tenant-schema');
const { createScopedRepository } = require('./lib/tenant-scoped-repository');
const { createUnsafeRepository } = require('./lib/unsafe-repository');

function main() {
  const results = [];
  let failures = 0;

  const db = new DatabaseSync(':memory:');
  createSchema(db);
  const tenantA = createScopedRepository(db, 'tenant-a');
  const tenantB = createScopedRepository(db, 'tenant-b');
  const aDocId = tenantA.create({ title: 'A Secret', body: 'confidential A' });
  const bDocId = tenantB.create({ title: 'B Secret', body: 'confidential B' });

  const getByIdOk = tenantA.getById(bDocId) === null;
  results.push({ ok: getByIdOk, label: `scoped getById(tenant B's id) from tenant A returns null (observed: ${JSON.stringify(tenantA.getById(bDocId))})` });
  if (!getByIdOk) failures += 1;

  const listOk = tenantA.list().length === 1 && tenantB.list().length === 1;
  results.push({ ok: listOk, label: `scoped list() returns exactly 1 row per tenant (A=${tenantA.list().length}, B=${tenantB.list().length})` });
  if (!listOk) failures += 1;

  const updateChanges = tenantA.update(bDocId, { title: 'HACKED', body: 'x' });
  const updateOk = updateChanges === 0;
  results.push({ ok: updateOk, label: `scoped update() against tenant B's id from tenant A affected ${updateChanges} real row(s)` });
  if (!updateOk) failures += 1;

  const removeChanges = tenantA.remove(bDocId);
  const removeOk = removeChanges === 0 && tenantB.getById(bDocId) !== null;
  results.push({ ok: removeOk, label: `scoped remove() against tenant B's id from tenant A affected ${removeChanges} real row(s); tenant B's row still exists: ${tenantB.getById(bDocId) !== null}` });
  if (!removeOk) failures += 1;

  const unsafe = createUnsafeRepository(db);
  const leaked = unsafe.getById(bDocId);
  const leakProvenOk = leaked !== null && leaked.title === 'B Secret';
  results.push({ ok: leakProvenOk, label: `the deliberately unsafe repository genuinely leaks tenant B's row (observed title: "${leaked ? leaked.title : null}") — the real negative-path proof` });
  if (!leakProvenOk) failures += 1;

  console.log('--- Multi-Tenancy Isolation Lab: real scenario results ---');
  for (const r of results) {
    console.log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.label}`);
  }

  const status = failures === 0 ? 'EXECUTED' : 'FAILED';
  console.log(`\nMULTI_TENANCY_LAB_STATUS: ${status}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main();
