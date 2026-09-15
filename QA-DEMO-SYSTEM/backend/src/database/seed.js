const fs = require('node:fs');
const path = require('node:path');
const { getDatabase } = require('./connection');
const config = require('../config');

const SHARED_TEST_DATA_DIR = path.join(__dirname, '..', '..', '..', '..', 'shared', 'test-data');

function loadJSON(fileName) {
  const filePath = path.join(SHARED_TEST_DATA_DIR, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

const AUTOINCREMENT_TABLES = ['users', 'products', 'orders', 'order_items'];

// Resets AUTOINCREMENT counters so a reseed always produces the same
// deterministic IDs, regardless of how many rows existed before reset
// (see Codex P4.2 review, non-blocking #2 — reset determinism).
function resetAutoincrementCounters(db) {
  const sequenceTableExists = db
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'")
    .get();
  if (!sequenceTableExists) {
    return;
  }

  const placeholders = AUTOINCREMENT_TABLES.map(() => '?').join(', ');
  db.prepare(`DELETE FROM sqlite_sequence WHERE name IN (${placeholders})`).run(
    ...AUTOINCREMENT_TABLES
  );
}

function seedDatabase(db) {
  db.exec('DELETE FROM order_items');
  db.exec('DELETE FROM orders');
  db.exec('DELETE FROM sessions');
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM products');
  resetAutoincrementCounters(db);

  const users = loadJSON('auth-users.json');
  const insertUser = db.prepare(
    'INSERT INTO users (id, email, password, status) VALUES (?, ?, ?, ?)'
  );
  for (const user of users) {
    insertUser.run(user.id, user.email.toLowerCase(), user.password, user.status);
  }

  const products = loadJSON('products.json');
  const insertProduct = db.prepare(
    'INSERT INTO products (id, name, price, stock_quantity) VALUES (?, ?, ?, ?)'
  );
  for (const product of products) {
    insertProduct.run(product.id, product.name, product.price, product.stock_quantity);
  }

  return { userCount: users.length, productCount: products.length };
}

if (require.main === module) {
  const db = getDatabase(config.dbPath);
  const result = seedDatabase(db);
  console.log(`Seed tamamlandı: ${result.userCount} kullanıcı, ${result.productCount} ürün.`);
  db.close();
}

module.exports = { seedDatabase };
