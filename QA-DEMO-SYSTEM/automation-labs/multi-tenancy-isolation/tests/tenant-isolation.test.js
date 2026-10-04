'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { createSchema } = require('../lib/tenant-schema');
const { createScopedRepository } = require('../lib/tenant-scoped-repository');
const { createUnsafeRepository } = require('../lib/unsafe-repository');

function seedTwoTenants() {
  const db = new DatabaseSync(':memory:');
  createSchema(db);
  const tenantA = createScopedRepository(db, 'tenant-a');
  const tenantB = createScopedRepository(db, 'tenant-b');

  const aDocId = tenantA.create({ title: 'A Secret Doc', body: 'tenant A confidential content' });
  const bDocId = tenantB.create({ title: 'B Secret Doc', body: 'tenant B confidential content' });

  return { db, tenantA, tenantB, aDocId, bDocId };
}

test('getById() never returns a real row belonging to a different tenant', () => {
  const { tenantA, bDocId } = seedTwoTenants();
  const result = tenantA.getById(bDocId);
  assert.equal(result, null, "tenant A must not be able to read tenant B's real document by id");
});

test('getById() correctly returns a real row that does belong to the calling tenant', () => {
  const { tenantA, aDocId } = seedTwoTenants();
  const result = tenantA.getById(aDocId);
  assert.ok(result);
  assert.equal(result.title, 'A Secret Doc');
});

test('list() only returns the calling tenant\'s real rows, never another tenant\'s', () => {
  const { tenantA, tenantB } = seedTwoTenants();
  tenantA.create({ title: 'A Doc 2', body: 'more A content' });

  const aList = tenantA.list();
  const bList = tenantB.list();

  assert.equal(aList.length, 2);
  assert.equal(bList.length, 1);
  assert.ok(aList.every((d) => d.tenant_id === 'tenant-a'));
  assert.ok(bList.every((d) => d.tenant_id === 'tenant-b'));
});

test('update() affects 0 real rows when targeting a different tenant\'s id (never cross-tenant mutates)', () => {
  const { db, tenantA, bDocId } = seedTwoTenants();
  const changes = tenantA.update(bDocId, { title: 'HACKED', body: 'overwritten' });
  assert.equal(changes, 0);

  const stillIntact = db.prepare('SELECT title FROM tenant_documents WHERE id = ?').get(bDocId);
  assert.equal(stillIntact.title, 'B Secret Doc', "tenant B's real row must be unchanged");
});

test('remove() affects 0 real rows when targeting a different tenant\'s id', () => {
  const { db, tenantA, bDocId } = seedTwoTenants();
  const changes = tenantA.remove(bDocId);
  assert.equal(changes, 0);

  const stillExists = db.prepare('SELECT id FROM tenant_documents WHERE id = ?').get(bDocId);
  assert.ok(stillExists, "tenant B's real row must still exist");
});

test('the deliberately unsafe repository DOES leak across tenants — the real finding this lab exists to catch', () => {
  const { db, bDocId } = seedTwoTenants();
  const unsafe = createUnsafeRepository(db);

  // Called with no tenant context at all — exactly the real bug class
  // (a forgotten WHERE tenant_id = ? clause) this lab's safe
  // repository is structurally designed to make impossible.
  const leaked = unsafe.getById(bDocId);
  assert.ok(leaked, 'the unsafe repository really does return the row — proving the leak is real, not hypothetical');
  assert.equal(leaked.title, 'B Secret Doc');
});
