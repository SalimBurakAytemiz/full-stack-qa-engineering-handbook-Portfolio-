'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { extract, transformRevenueByProduct, transformOrderSummaryByUser } = require('../lib/etl');

const { getDatabase } = require(path.join('..', '..', '..', 'backend', 'src', 'database', 'connection'));

function seedRealDb() {
  const db = getDatabase(':memory:');
  db.prepare("INSERT INTO users (id, email, password, status) VALUES (1, 'a@example.com', 'x', 'ACTIVE')").run();
  db.prepare("INSERT INTO users (id, email, password, status) VALUES (2, 'b@example.com', 'x', 'ACTIVE')").run();
  db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (1, 'Widget', 10.00, 5)").run();
  db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (2, 'Gadget', 20.00, 5)").run();
  db.prepare("INSERT INTO orders (id, user_id, status, total) VALUES (1, 1, 'PAID', 40.00)").run();
  db.prepare("INSERT INTO orders (id, user_id, status, total) VALUES (2, 2, 'PAID', 20.00)").run();
  db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (1, 1, 2, 10.00)').run();
  db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (1, 2, 1, 20.00)').run();
  db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (2, 2, 1, 20.00)').run();
  return db;
}

test('extract() reads real rows from a real in-memory db via the backend\'s own getDatabase', () => {
  const db = seedRealDb();
  const extracted = extract(db);
  assert.equal(extracted.users.length, 2);
  assert.equal(extracted.products.length, 2);
  assert.equal(extracted.orders.length, 2);
  assert.equal(extracted.orderItems.length, 3);
});

test('transformRevenueByProduct correctly aggregates quantity and revenue per product, sorted descending', () => {
  const db = seedRealDb();
  const extracted = extract(db);
  const result = transformRevenueByProduct(extracted);
  assert.equal(result.length, 2);
  // Gadget: 1 (order 1) + 1 (order 2) = 2 units * 20.00 = 40.00
  // Widget: 2 units * 10.00 = 20.00
  assert.equal(result[0].product_id, 2);
  assert.equal(result[0].total_quantity, 2);
  assert.equal(result[0].total_revenue, 40.0);
  assert.equal(result[1].product_id, 1);
  assert.equal(result[1].total_revenue, 20.0);
});

test('transformOrderSummaryByUser correctly aggregates order count and spend per user', () => {
  const db = seedRealDb();
  const extracted = extract(db);
  const result = transformOrderSummaryByUser(extracted);
  assert.equal(result.length, 2);
  const byUser = new Map(result.map((r) => [r.user_id, r]));
  assert.equal(byUser.get(1).order_count, 1);
  assert.equal(byUser.get(1).total_spent, 40.0);
  assert.equal(byUser.get(2).order_count, 1);
  assert.equal(byUser.get(2).total_spent, 20.0);
});

test('transformRevenueByProduct returns an empty array for no order items (negative/edge case)', () => {
  const result = transformRevenueByProduct({ products: [], orderItems: [] });
  assert.deepEqual(result, []);
});
