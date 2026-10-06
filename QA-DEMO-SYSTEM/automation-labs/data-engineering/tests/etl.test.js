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

// Real payment-status regression (independent review finding F2): a
// PAYMENT_FAILED or PAYMENT_TIMEOUT order never collected real money and
// must never be counted as revenue or spend. These four cases exercise
// the real status mapping the backend actually writes
// (STATUS_BY_PAYMENT_RESULT in backend/src/services/orders.service.js):
// PAID, PAYMENT_FAILED, PAYMENT_TIMEOUT.

function seedDbWithOrders(getDatabase, orderSpecs) {
  const db = getDatabase(':memory:');
  db.prepare("INSERT INTO users (id, email, password, status) VALUES (1, 'a@example.com', 'x', 'ACTIVE')").run();
  db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (1, 'Widget', 149.90, 50)").run();
  orderSpecs.forEach((spec, index) => {
    const orderId = index + 1;
    db.prepare('INSERT INTO orders (id, user_id, status, total) VALUES (?, 1, ?, ?)').run(orderId, spec.status, 149.9);
    db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, 1, 1, 149.90)').run(orderId);
  });
  return db;
}

test('all PAYMENT_FAILED orders produce zero revenue and zero spend — a failed order is not a sale', () => {
  const db = seedDbWithOrders(getDatabase, [{ status: 'PAYMENT_FAILED' }, { status: 'PAYMENT_FAILED' }]);
  const extracted = extract(db);
  const revenue = transformRevenueByProduct(extracted);
  const summary = transformOrderSummaryByUser(extracted);
  assert.deepEqual(revenue, [], 'two failed orders at 149.90 each must contribute 0 product revenue, not 299.80');
  assert.deepEqual(summary, [], 'two failed orders must produce zero user spend summary rows');
});

test('all PAYMENT_TIMEOUT orders produce zero revenue and zero spend — a timed-out order is not a sale', () => {
  const db = seedDbWithOrders(getDatabase, [{ status: 'PAYMENT_TIMEOUT' }, { status: 'PAYMENT_TIMEOUT' }]);
  const extracted = extract(db);
  const revenue = transformRevenueByProduct(extracted);
  const summary = transformOrderSummaryByUser(extracted);
  assert.deepEqual(revenue, [], 'two timed-out orders at 149.90 each must contribute 0 product revenue, not 299.80');
  assert.deepEqual(summary, [], 'two timed-out orders must produce zero user spend summary rows');
});

test('a mix of PAID, PAYMENT_FAILED and PAYMENT_TIMEOUT orders counts only the real PAID one', () => {
  const db = seedDbWithOrders(getDatabase, [
    { status: 'PAID' },
    { status: 'PAYMENT_FAILED' },
    { status: 'PAYMENT_TIMEOUT' },
  ]);
  const extracted = extract(db);
  const revenue = transformRevenueByProduct(extracted);
  const summary = transformOrderSummaryByUser(extracted);
  assert.equal(revenue.length, 1);
  assert.equal(revenue[0].total_quantity, 1, 'only the 1 real PAID order item counts, not all 3');
  assert.equal(revenue[0].total_revenue, 149.9);
  assert.equal(summary.length, 1);
  assert.equal(summary[0].order_count, 1, 'order_count reflects only the 1 real completed purchase, not all 3 attempts');
  assert.equal(summary[0].total_spent, 149.9);
});

test('all PAID orders are counted in full, as a real baseline comparison against the failed/timeout cases above', () => {
  const db = seedDbWithOrders(getDatabase, [{ status: 'PAID' }, { status: 'PAID' }]);
  const extracted = extract(db);
  const revenue = transformRevenueByProduct(extracted);
  const summary = transformOrderSummaryByUser(extracted);
  assert.equal(revenue[0].total_quantity, 2);
  assert.equal(revenue[0].total_revenue, 299.8);
  assert.equal(summary[0].order_count, 2);
  assert.equal(summary[0].total_spent, 299.8);
});
