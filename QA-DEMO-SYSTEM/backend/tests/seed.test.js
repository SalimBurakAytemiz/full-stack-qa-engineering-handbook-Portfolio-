const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getDatabase } = require('../src/database/connection');
const { seedDatabase } = require('../src/database/seed');

test('seedDatabase deterministically populates users and products tables', () => {
  const db = getDatabase(':memory:');
  const result = seedDatabase(db);

  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;

  assert.equal(userCount, result.userCount);
  assert.equal(productCount, result.productCount);
  assert.ok(userCount > 0);
  assert.ok(productCount > 0);

  db.close();
});
