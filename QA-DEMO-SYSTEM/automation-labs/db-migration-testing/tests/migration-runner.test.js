'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { applyPending, rollbackLast, getAppliedVersions } = require('../lib/migration-runner');
const { migrations } = require('../lib/sample-migrations');

function freshDb() {
  return new DatabaseSync(':memory:');
}

test('applyPending() applies every migration in version order against a real db', () => {
  const db = freshDb();
  const appliedThisRun = applyPending(db, migrations);
  assert.deepEqual(appliedThisRun, [1, 2, 3]);
  assert.deepEqual(getAppliedVersions(db), [1, 2, 3]);

  const columns = db.prepare('PRAGMA table_info(catalog_items)').all().map((c) => c.name);
  assert.deepEqual(columns, ['id', 'display_name', 'price', 'category']);
});

test('applyPending() genuinely backfills existing rows when adding a column (real zero-downtime proof)', () => {
  const db = freshDb();
  applyPending(db, [migrations[0]]);
  db.prepare('INSERT INTO catalog_items (name, price) VALUES (?, ?)').run('Widget', 9.99);

  applyPending(db, [migrations[0], migrations[1]]);
  const row = db.prepare('SELECT category FROM catalog_items WHERE name = ?').get('Widget');
  assert.equal(row.category, 'uncategorized');
});

test('applyPending() is genuinely idempotent — re-running with the same migrations is a real no-op', () => {
  const db = freshDb();
  applyPending(db, migrations);
  const secondRun = applyPending(db, migrations);
  assert.deepEqual(secondRun, [], 'nothing should be (re-)applied the second time');
  assert.deepEqual(getAppliedVersions(db), [1, 2, 3]);
});

test('rollbackLast() reverses exactly the highest applied version, not an arbitrary one', () => {
  const db = freshDb();
  applyPending(db, migrations);
  const rolledBack = rollbackLast(db, migrations);
  assert.equal(rolledBack, 3);
  assert.deepEqual(getAppliedVersions(db), [1, 2]);

  const columns = db.prepare('PRAGMA table_info(catalog_items)').all().map((c) => c.name);
  assert.ok(columns.includes('name'), 'rolling back migration 3 must restore the real "name" column');
  assert.ok(!columns.includes('display_name'));
});

test('rollbackLast() throws rather than silently no-op when nothing is applied', () => {
  const db = freshDb();
  assert.throws(() => rollbackLast(db, migrations), /no applied migrations/);
});

test('a real forward-then-rollback-then-forward cycle leaves the schema in the same real state', () => {
  const db = freshDb();
  applyPending(db, migrations);
  rollbackLast(db, migrations);
  applyPending(db, migrations);
  assert.deepEqual(getAppliedVersions(db), [1, 2, 3]);
  const columns = db.prepare('PRAGMA table_info(catalog_items)').all().map((c) => c.name);
  assert.deepEqual(columns, ['id', 'display_name', 'price', 'category']);
});
