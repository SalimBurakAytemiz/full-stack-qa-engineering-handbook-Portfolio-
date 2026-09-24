const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getDatabase } = require('../src/database/connection');
const { seedDatabase } = require('../src/database/seed');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

// Phase 7 — Database Testing. Demonstrates the database itself used as a QA
// Test Oracle / Data Validation source: real SQL (SELECT/WHERE/JOIN/
// filtering/sorting), CRUD state, data integrity (NULL/UNIQUE), financial
// and timestamp validation, and one UI→DB end-to-end trace.
//
// This file does NOT re-test what tests/seed.test.js and tests/events.test.js
// already cover at the raw-SQL level (CHECK/FOREIGN KEY constraints,
// UNIQUE(order_id, event_type)/UNIQUE(order_id, type), AUTOINCREMENT reset
// determinism) — see EXECUTION.md section 1 for the full scope-to-test
// cross-reference, including what is covered elsewhere.

function freshDb() {
  const db = getDatabase(':memory:');
  seedDatabase(db);
  return db;
}

// --- SQL: SELECT / WHERE / Filtering ---

test('SQL SELECT + WHERE: filters in-stock products only', () => {
  const db = freshDb();
  const inStock = db.prepare('SELECT id, name FROM products WHERE stock_quantity > 0').all();
  db.close();

  // Seed data (shared/test-data/products.json): product id=2 has
  // stock_quantity 0, the other three are > 0.
  assert.equal(inStock.length, 3);
  assert.ok(!inStock.some((p) => p.id === 2));
});

test('SQL SELECT + WHERE: filters users by status', () => {
  const db = freshDb();
  // Seed users are all ACTIVE; insert one SUSPENDED user directly to prove
  // the WHERE filter genuinely discriminates, not just "returns everything".
  db.prepare('INSERT INTO users (email, password, status) VALUES (?, ?, ?)').run(
    'suspended.user@example.com',
    'Whatever123!',
    'SUSPENDED'
  );

  const active = db.prepare("SELECT id FROM users WHERE status = 'ACTIVE'").all();
  const suspended = db.prepare("SELECT id FROM users WHERE status = 'SUSPENDED'").all();
  db.close();

  assert.equal(active.length, 2);
  assert.equal(suspended.length, 1);
});

// --- SQL: JOIN ---

test('SQL JOIN: order_items joined to products maps correct product name/price for a real order', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const created = await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 3, quantity: 2 }], payment_token: 'TEST-CARD-APPROVED' }),
  }).then((r) => r.json());

  const rows = ctx.db
    .prepare(
      `SELECT oi.quantity, oi.unit_price, p.name AS product_name, p.price AS current_price
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`
    )
    .all(created.order.id);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].product_name, 'QA Demo Monitör');
  assert.equal(rows[0].quantity, 2);
  // unit_price is a captured historical price at order time — must equal
  // the product's current price here (no price change occurred mid-test),
  // but is a DIFFERENT column from products.price by design (an order must
  // not retroactively change if the catalog price later changes).
  assert.equal(rows[0].unit_price, rows[0].current_price);
});

test('SQL JOIN: orders joined to users returns the correct owning email, never a cross-user row', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const tokenA = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  });

  const rows = ctx.db
    .prepare(
      `SELECT o.id AS order_id, u.email
       FROM orders o
       JOIN users u ON u.id = o.user_id`
    )
    .all();

  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, 'test.active01@example.com');
});

// --- SQL: Sorting ---

test('SQL ORDER BY: products sort ascending and descending by price', () => {
  const db = freshDb();
  const asc = db.prepare('SELECT price FROM products ORDER BY price ASC').all().map((r) => r.price);
  const desc = db.prepare('SELECT price FROM products ORDER BY price DESC').all().map((r) => r.price);
  db.close();

  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  assert.deepEqual(desc, [...asc].reverse());
});

test('SQL ORDER BY: most recently created order comes first with DESC', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const first = await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  }).then((r) => r.json());
  const second = await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 3, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  }).then((r) => r.json());

  const rows = ctx.db.prepare('SELECT id FROM orders ORDER BY id DESC').all();
  // Sorted by id DESC (monotonic surrogate for creation order — see
  // Timestamp Validation below for why id, not created_at, is the reliable
  // ordering key at SQLite's second-level timestamp granularity).
  assert.deepEqual(rows.map((r) => r.id), [second.order.id, first.order.id]);
});

// --- CRUD State Validation ---

test('CRUD lifecycle: INSERT -> SELECT -> UPDATE -> DELETE on a fresh product row', () => {
  const db = freshDb();

  const insertInfo = db
    .prepare('INSERT INTO products (name, price, stock_quantity) VALUES (?, ?, ?)')
    .run('CRUD Test Widget', 9.99, 10);
  const newId = insertInfo.lastInsertRowid;

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(newId);
  assert.equal(created.name, 'CRUD Test Widget');
  assert.equal(created.stock_quantity, 10);

  db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(3, newId);
  const updated = db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(newId);
  assert.equal(updated.stock_quantity, 3);

  // Safe to hard-delete: this row was just created in this test and has no
  // dependent order_items (a seeded product WOULD be unsafe to delete this
  // way, since order_items.product_id is a FOREIGN KEY).
  db.prepare('DELETE FROM products WHERE id = ?').run(newId);
  const afterDelete = db.prepare('SELECT * FROM products WHERE id = ?').get(newId);
  assert.equal(afterDelete, undefined);

  db.close();
});

// --- Data Integrity: Null Validation ---

test('NULL Validation: NOT NULL rejects a user row with a null email', () => {
  const db = freshDb();
  assert.throws(() => {
    db.prepare('INSERT INTO users (email, password, status) VALUES (?, ?, ?)').run(null, 'Pass123!', 'ACTIVE');
  });
  db.close();
});

test('NULL Validation: NOT NULL rejects an order row with a null status', () => {
  const db = freshDb();
  assert.throws(() => {
    db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)').run(1, null, 10);
  });
  db.close();
});

// --- Data Integrity: Duplicate Validation (users.email — a UNIQUE not
// already exercised by seed.test.js, which covers events/notifications) ---

test('Duplicate Validation: UNIQUE rejects a second user row with an already-used email', () => {
  const db = freshDb();
  assert.throws(() => {
    db.prepare('INSERT INTO users (email, password, status) VALUES (?, ?, ?)').run(
      'test.active01@example.com',
      'AnotherPass123!',
      'ACTIVE'
    );
  });
  db.close();
});

// --- Financial Data Validation ---

test('Financial Data Validation: orders.total matches SUM(order_items.quantity * unit_price) for every order', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  // Multi-line order: two different products in one order.
  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      items: [
        { product_id: 1, quantity: 2 },
        { product_id: 4, quantity: 1 },
      ],
      payment_token: 'TEST-CARD-APPROVED',
    }),
  });
  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 3, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  });

  // The database itself is the test oracle here: a single SQL aggregate
  // query proves financial consistency across every order, without the
  // test needing to know the individual product prices.
  const mismatches = ctx.db
    .prepare(
      `SELECT o.id, o.total, SUM(oi.quantity * oi.unit_price) AS computed_total
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       HAVING ABS(o.total - computed_total) > 0.001`
    )
    .all();

  assert.equal(mismatches.length, 0, `financial mismatch found: ${JSON.stringify(mismatches)}`);

  const orderCount = ctx.db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
  assert.equal(orderCount, 2);
});

// --- Timestamp Validation ---

test('Timestamp Validation: created_at columns follow SQLite CURRENT_TIMESTAMP format', () => {
  const db = freshDb();
  const user = db.prepare('SELECT created_at FROM users WHERE id = 1').get();
  const product = db.prepare('SELECT created_at FROM products WHERE id = 1').get();
  db.close();

  // "YYYY-MM-DD HH:MM:SS" — NOT ISO 8601/RFC3339 (no "T", no timezone
  // suffix). This is SQLite's real CURRENT_TIMESTAMP default output, and
  // matches the same finding already documented for notifications in
  // P5.6's EXECUTION.md.
  const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  assert.match(user.created_at, pattern);
  assert.match(product.created_at, pattern);
});

test('Timestamp Validation: sequential order inserts have non-decreasing id and created_at', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  });
  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 3, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  });

  const rows = ctx.db.prepare('SELECT id, created_at FROM orders ORDER BY id ASC').all();
  assert.equal(rows.length, 2);
  // SQLite CURRENT_TIMESTAMP has only second-level granularity, so two
  // orders created within the same second CAN share an identical
  // created_at value — the assertion is therefore non-decreasing (>=),
  // never strictly increasing, which would be a false assumption.
  assert.ok(rows[1].created_at >= rows[0].created_at);
});

// --- UI -> DB Validation ---

test('UI -> DB Validation: a full login+order user flow produces DB rows exactly matching what the UI would render', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  // Simulates the real sequence a browser UI drives: log in, view products
  // (only in-stock ones would be purchasable in the UI), place an order.
  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');

  const productsBody = await fetch(`${ctx.baseUrl}/api/products`).then((r) => r.json());
  const purchasable = productsBody.products.find((p) => p.in_stock && p.id === 1);
  assert.ok(purchasable, 'test fixture assumption: product 1 must be in stock');

  const orderRes = await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: purchasable.id, quantity: 3 }], payment_token: 'TEST-CARD-APPROVED' }),
  });
  const orderBody = await orderRes.json();
  assert.equal(orderRes.status, 201);

  // What the UI's "order confirmation" screen would show comes from the
  // API response; the database is queried independently (test oracle) to
  // prove that response is not fabricated/inconsistent with real storage.
  const dbOrder = ctx.db.prepare('SELECT status, total FROM orders WHERE id = ?').get(orderBody.order.id);
  const dbItems = ctx.db
    .prepare('SELECT product_id, quantity, unit_price FROM order_items WHERE order_id = ?')
    .all(orderBody.order.id);
  const dbProductAfter = ctx.db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(purchasable.id);

  assert.equal(dbOrder.status, orderBody.order.status);
  assert.equal(dbOrder.total, orderBody.order.total);
  assert.equal(dbItems.length, 1);
  assert.equal(dbItems[0].quantity, 3);
  // Stock in the DB must reflect the purchase (25 - 3 = 22 for product 1).
  assert.equal(dbProductAfter.stock_quantity, purchasable.stock_quantity - 3);
});

// --- Test Data Preparation ---

test('Test Data Preparation: seeded product rows exactly match the canonical shared/test-data/products.json source', () => {
  const db = freshDb();
  // node:sqlite rows come back as null-prototype objects; spread into a
  // plain object so deepEqual compares only own enumerable properties, not
  // prototype identity (which is irrelevant to this data-correctness check).
  const dbProducts = db
    .prepare('SELECT id, name, price, stock_quantity FROM products ORDER BY id')
    .all()
    .map((row) => ({ ...row }));
  db.close();

  const sourcePath = path.join(__dirname, '..', '..', '..', 'shared', 'test-data', 'products.json');
  const sourceProducts = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

  assert.deepEqual(dbProducts, sourceProducts);
});
