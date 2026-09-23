#!/usr/bin/env node
'use strict';

// P5.7 — API → DB Validation runner.
//
// WHY THIS EXISTS: every prior P5.x package (P5.1-P5.6) proved that the
// HTTP response looks correct. None of them opened the database itself.
// This script closes exactly that gap — for each scenario it calls the
// real, running API (via fetch, against the same server every other
// P5.x package targets) and then reads the real SQLite file the server
// itself writes to, through a read-only connection, and compares the
// two. It never writes to the database — resets happen exclusively
// through the existing, canonical `npm run db:seed` (run externally,
// before this script), and every query here is a SELECT.
//
// This is not Postman/Newman-based: Newman has no SQL capability, and
// P5.2's compatibility-gate finding (see run-schema-validation.js) already
// established that Newman's own sandbox cannot be trusted with a pinned
// dependency either. A small, purpose-built Node script — using only
// Node's built-in `node:sqlite` and `fetch`, no new framework or
// dependency — is the minimal tool that can actually do this job.
//
// Scenarios run in a fixed sequential order within a single DB
// lifetime (mirroring how a Postman collection's requests share
// collection variables) — later scenarios depend on state captured by
// earlier ones. The very first scenario is the rejected-request
// atomicity gate; nothing else runs until it passes.

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const config = require(path.join(__dirname, '..', '..', 'backend', 'src', 'config'));
const DB_PATH = config.dbPath;

function openDb() {
  return new DatabaseSync(DB_PATH, { readOnly: true, open: true });
}

function withDb(fn) {
  const db = openDb();
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

const results = [];
let currentScenario = null;

function record(label, pass, detail) {
  currentScenario.assertions.push({ label, pass, detail });
  if (!pass) currentScenario.failed = true;
}

function assertEqual(actual, expected, label) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  record(label, pass, pass ? `= ${JSON.stringify(actual)}` : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertTrue(cond, label, detail) {
  record(label, Boolean(cond), detail || (cond ? 'true' : 'false'));
}

async function scenario(name, fn) {
  currentScenario = { name, assertions: [], failed: false };
  results.push(currentScenario);
  try {
    await fn();
  } catch (err) {
    record('scenario threw an unexpected error', false, err.stack || String(err));
  }
  return currentScenario;
}

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  return body.token;
}

async function createOrder(token, body) {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch (_e) {
    json = null;
  }
  return { status: res.status, body: json };
}

async function getNotifications(token) {
  const res = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

function dbCounts(db) {
  return {
    orders: db.prepare('SELECT count(*) AS c FROM orders').get().c,
    order_items: db.prepare('SELECT count(*) AS c FROM order_items').get().c,
    notifications: db.prepare('SELECT count(*) AS c FROM notifications').get().c,
    events: db.prepare('SELECT count(*) AS c FROM events').get().c,
  };
}

function stockOf(db, productId) {
  return db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(productId).stock_quantity;
}

async function run() {
  // --- readiness check ---
  try {
    const health = await fetch(`${BASE_URL}/api/health`);
    if (!health.ok) throw new Error(`unexpected status ${health.status}`);
  } catch (err) {
    console.error(`Sunucuya ulaşılamadı (${BASE_URL}/api/health): ${err.message}`);
    console.error('Önce `npm run dev` (veya `node --watch src/server.js`) ile sunucuyu ayağa kaldırın.');
    process.exitCode = 1;
    return;
  }

  const userAToken = await login('test.active01@example.com', 'ValidPass123!');
  const userBToken = await login('test.active02@example.com', 'ValidPass123!');

  // ---------------------------------------------------------------
  // S0. Baseline determinism (right after a fresh db:seed)
  // ---------------------------------------------------------------
  await scenario('S0. Baseline determinism (post db:seed)', async () => {
    withDb((db) => {
      const counts = dbCounts(db);
      assertEqual(counts.orders, 0, 'orders table is empty after db:seed');
      assertEqual(counts.order_items, 0, 'order_items table is empty after db:seed');
      assertEqual(counts.notifications, 0, 'notifications table is empty after db:seed');
      assertEqual(counts.events, 0, 'events table is empty after db:seed');
      const users = db.prepare('SELECT count(*) AS c FROM users').get().c;
      assertEqual(users, 2, 'users table has exactly the 2 seeded deterministic users');
      const stocks = db.prepare('SELECT id, stock_quantity FROM products ORDER BY id').all();
      assertEqual(stocks, [
        { id: 1, stock_quantity: 25 },
        { id: 2, stock_quantity: 0 },
        { id: 3, stock_quantity: 5 },
        { id: 4, stock_quantity: 12 },
      ], 'product stock matches shared/test-data/products.json exactly');
    });
  });

  // ---------------------------------------------------------------
  // S1. GATE — rejected request (unknown product_id) -> zero write
  // ---------------------------------------------------------------
  const gate = await scenario('S1. GATE — unknown product_id request produces zero DB writes', async () => {
    const before = withDb(dbCounts);
    const beforeStock4 = withDb((db) => stockOf(db, 4));

    const { status, body } = await createOrder(userAToken, {
      items: [{ product_id: 99999, quantity: 1 }],
      payment_token: 'TEST-CARD-APPROVED',
    });
    assertEqual(status, 400, 'API rejects with 400');
    assertEqual(body && body.error, 'Ürün bulunamadı: 99999', 'API error message matches source contract');

    const after = withDb(dbCounts);
    const afterStock4 = withDb((db) => stockOf(db, 4));
    assertEqual(after, before, 'orders/order_items/notifications/events counts unchanged (zero write)');
    assertEqual(afterStock4, beforeStock4, 'product stock unchanged');
  });

  if (gate.failed) {
    console.error('\nGATE (S1) FAILED — suite\'in geri kalanına geçilmiyor.');
    printSummary();
    process.exitCode = 1;
    return;
  }

  // ---------------------------------------------------------------
  // S2. Approved order — full API <-> DB trace (also proves duplicate
  // line aggregation persistence, B1 regression, at the DB level)
  // ---------------------------------------------------------------
  let approvedOrderId;
  let approvedOrderCreatedAt;
  await scenario('S2. Approved order — full API<->DB trace + duplicate-line aggregation DB proof', async () => {
    const beforeStock1 = withDb((db) => stockOf(db, 1));

    // Same aggregation shape P5.5 proved API-visible (2+3=5, product 1):
    // proving it here at the DB row level closes that package's own
    // "kaynak kodu okuması, doğrudan SQL ile doğrulanmadı" gap.
    const { status, body } = await createOrder(userAToken, {
      items: [
        { product_id: 1, quantity: 2 },
        { product_id: 1, quantity: 3 },
      ],
      payment_token: 'TEST-CARD-APPROVED',
    });
    assertEqual(status, 201, 'API returns 201');
    assertEqual(body.order.status, 'PAID', 'API order.status is PAID');
    approvedOrderId = body.order.id;

    withDb((db) => {
      const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(approvedOrderId);
      assertTrue(Boolean(row), 'order row exists in DB', row ? JSON.stringify(row) : 'no row found');
      if (row) {
        assertEqual(row.user_id, 1, 'order.user_id in DB matches authenticated USER A (seeded id 1)');
        assertEqual(row.status, 'PAID', 'order.status in DB matches API response');
        assertEqual(row.total, body.order.total, 'order.total in DB matches API response');
        approvedOrderCreatedAt = row.created_at;
      }

      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(approvedOrderId);
      assertEqual(items.length, 1, 'exactly ONE order_items row (Map-based aggregation, not two separate rows)');
      if (items.length === 1) {
        assertEqual(items[0].product_id, 1, 'aggregated row product_id is 1');
        assertEqual(items[0].quantity, 5, 'aggregated row quantity is 5 (2+3), proven via direct SQL not API inference');
        assertEqual(items[0].unit_price, 149.9, 'aggregated row unit_price matches product 1 price');
      }

      const afterStock1 = stockOf(db, 1);
      assertEqual(afterStock1, beforeStock1 - 5, 'product 1 stock decreased by exactly the aggregated quantity (5), read via direct SQL');
    });
  });

  // ---------------------------------------------------------------
  // S3. Insufficient stock -> zero write
  // ---------------------------------------------------------------
  await scenario('S3. Insufficient stock request -> zero DB write', async () => {
    const before = withDb(dbCounts);
    const beforeStock3 = withDb((db) => stockOf(db, 3));

    const { status } = await createOrder(userAToken, {
      items: [{ product_id: 3, quantity: 6 }],
      payment_token: 'TEST-CARD-APPROVED',
    });
    assertEqual(status, 409, 'API rejects with 409');

    const after = withDb(dbCounts);
    const afterStock3 = withDb((db) => stockOf(db, 3));
    assertEqual(after, before, 'orders/order_items/notifications/events counts unchanged');
    assertEqual(afterStock3, beforeStock3, 'product 3 stock unchanged');
  });

  // ---------------------------------------------------------------
  // S4. Representative invalid quantity -> zero write (risk-based, not
  // the full P5.5 matrix — "2" (string), true (boolean), null)
  // ---------------------------------------------------------------
  for (const [label, quantity] of [['string "2"', '2'], ['boolean true', true], ['null', null]]) {
    await scenario(`S4. Invalid quantity (${label}) -> zero DB write`, async () => {
      const before = withDb(dbCounts);
      const beforeStock1 = withDb((db) => stockOf(db, 1));

      const { status } = await createOrder(userAToken, {
        items: [{ product_id: 1, quantity }],
        payment_token: 'TEST-CARD-APPROVED',
      });
      assertEqual(status, 400, 'API rejects with 400');

      const after = withDb(dbCounts);
      const afterStock1 = withDb((db) => stockOf(db, 1));
      assertEqual(after, before, 'orders/order_items/notifications/events counts unchanged');
      assertEqual(afterStock1, beforeStock1, 'product 1 stock unchanged');
    });
  }

  // ---------------------------------------------------------------
  // S5. Invalid payment_token (false, 0) -> zero write
  // ---------------------------------------------------------------
  for (const [label, paymentToken] of [['false', false], ['0', 0]]) {
    await scenario(`S5. Invalid payment_token (${label}) -> zero DB write`, async () => {
      const before = withDb(dbCounts);
      const beforeStock4 = withDb((db) => stockOf(db, 4));

      const { status } = await createOrder(userAToken, {
        items: [{ product_id: 4, quantity: 1 }],
        payment_token: paymentToken,
      });
      assertEqual(status, 400, 'API rejects with 400');

      const after = withDb(dbCounts);
      const afterStock4 = withDb((db) => stockOf(db, 4));
      assertEqual(after, before, 'orders/order_items/notifications/events counts unchanged');
      assertEqual(afterStock4, beforeStock4, 'product 4 stock unchanged');
    });
  }

  // ---------------------------------------------------------------
  // S6. Malformed JSON -> zero write
  // ---------------------------------------------------------------
  await scenario('S6. Malformed JSON body -> zero DB write', async () => {
    const before = withDb(dbCounts);

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userAToken}` },
      body: '{ this is not valid JSON',
    });
    assertEqual(res.status, 400, 'API rejects with 400');

    const after = withDb(dbCounts);
    assertEqual(after, before, 'orders/order_items/notifications/events counts unchanged');
  });

  // ---------------------------------------------------------------
  // S7. Declined payment -> order + order_items ARE persisted, stock/
  // notification/event are NOT (this is the real contract, confirmed
  // by reading orders.service.js — declined/timeout are not a
  // zero-write case, only approved-only side effects are skipped)
  // ---------------------------------------------------------------
  let declinedOrderId;
  await scenario('S7. Declined payment — order+order_items persisted, stock/notification/event are not', async () => {
    const beforeStock4 = withDb((db) => stockOf(db, 4));
    const beforeNotif = withDb((db) => db.prepare('SELECT count(*) AS c FROM notifications').get().c);

    const { status, body } = await createOrder(userAToken, {
      items: [{ product_id: 4, quantity: 1 }],
      payment_token: 'TEST-CARD-DECLINED',
    });
    assertEqual(status, 201, 'API returns 201 (declined is not an HTTP error)');
    assertEqual(body.order.status, 'PAYMENT_FAILED', 'API order.status is PAYMENT_FAILED');
    declinedOrderId = body.order.id;

    withDb((db) => {
      const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(declinedOrderId);
      assertTrue(Boolean(row), 'order row EXISTS in DB (declined is NOT a zero-write case)');
      if (row) assertEqual(row.status, 'PAYMENT_FAILED', 'order.status in DB is PAYMENT_FAILED');

      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(declinedOrderId);
      assertEqual(items.length, 1, 'order_items row EXISTS for the declined order');

      const afterStock4 = stockOf(db, 4);
      assertEqual(afterStock4, beforeStock4, 'product 4 stock unchanged (declined never reaches decrementStock)');

      const afterNotif = db.prepare('SELECT count(*) AS c FROM notifications').get().c;
      assertEqual(afterNotif, beforeNotif, 'notifications count unchanged');
      const notifForOrder = db.prepare('SELECT count(*) AS c FROM notifications WHERE order_id = ?').get(declinedOrderId).c;
      assertEqual(notifForOrder, 0, 'no notification row correlated to the declined order_id');
      const eventForOrder = db.prepare('SELECT count(*) AS c FROM events WHERE order_id = ?').get(declinedOrderId).c;
      assertEqual(eventForOrder, 0, 'no event row correlated to the declined order_id');
    });
  });

  // ---------------------------------------------------------------
  // S8. Timeout payment — same contract as declined
  // ---------------------------------------------------------------
  let timeoutOrderId;
  await scenario('S8. Timeout payment — order+order_items persisted, stock/notification/event are not', async () => {
    const beforeStock4 = withDb((db) => stockOf(db, 4));

    const { status, body } = await createOrder(userAToken, {
      items: [{ product_id: 4, quantity: 1 }],
      payment_token: 'TEST-CARD-TIMEOUT',
    });
    assertEqual(status, 201, 'API returns 201 (timeout is not an HTTP error)');
    assertEqual(body.order.status, 'PAYMENT_TIMEOUT', 'API order.status is PAYMENT_TIMEOUT');
    timeoutOrderId = body.order.id;

    withDb((db) => {
      const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(timeoutOrderId);
      assertTrue(Boolean(row), 'order row EXISTS in DB (timeout is NOT a zero-write case)');
      if (row) assertEqual(row.status, 'PAYMENT_TIMEOUT', 'order.status in DB is PAYMENT_TIMEOUT');

      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(timeoutOrderId);
      assertEqual(items.length, 1, 'order_items row EXISTS for the timeout order');

      const afterStock4 = stockOf(db, 4);
      assertEqual(afterStock4, beforeStock4, 'product 4 stock unchanged');

      const notifForOrder = db.prepare('SELECT count(*) AS c FROM notifications WHERE order_id = ?').get(timeoutOrderId).c;
      assertEqual(notifForOrder, 0, 'no notification row correlated to the timeout order_id');
      const eventForOrder = db.prepare('SELECT count(*) AS c FROM events WHERE order_id = ?').get(timeoutOrderId).c;
      assertEqual(eventForOrder, 0, 'no event row correlated to the timeout order_id');
    });
  });

  // ---------------------------------------------------------------
  // S9. Notification API <-> DB correlation (for S2's approved order)
  // ---------------------------------------------------------------
  await scenario('S9. Notification — API response <-> DB row correlation (S2 order)', async () => {
    const apiNotifs = await getNotifications(userAToken);
    const apiMatch = apiNotifs.notifications.find((n) => n.order_id === approvedOrderId);
    assertTrue(Boolean(apiMatch), 'API GET /api/notifications contains a notification for the S2 order_id');

    withDb((db) => {
      const dbRow = db.prepare('SELECT * FROM notifications WHERE order_id = ?').get(approvedOrderId);
      assertTrue(Boolean(dbRow), 'DB notifications row exists for the S2 order_id');
      if (apiMatch && dbRow) {
        assertEqual(dbRow.id, apiMatch.id, 'notification id matches between API and DB');
        assertEqual(dbRow.type, apiMatch.type, 'notification type matches between API and DB');
        assertEqual(dbRow.message, apiMatch.message, 'notification message matches between API and DB');
        assertEqual(dbRow.is_read, apiMatch.is_read, 'notification is_read matches between API and DB (both integer 0)');
        assertEqual(dbRow.created_at, apiMatch.created_at, 'notification created_at matches between API and DB');
        assertEqual(dbRow.user_id, 1, 'DB notification.user_id is USER A (not exposed via API, checked here only)');
      }
    });
  });

  // ---------------------------------------------------------------
  // S10. Duplicate notification DB check — a second, distinct PAID
  // order must not merge into or duplicate the S2 notification row
  // ---------------------------------------------------------------
  let secondApprovedOrderId;
  await scenario('S10. Duplicate notification DB check — second distinct PAID order', async () => {
    const { status, body } = await createOrder(userAToken, {
      items: [{ product_id: 4, quantity: 1 }],
      payment_token: 'TEST-CARD-APPROVED',
    });
    assertEqual(status, 201, 'API returns 201 for the second approved order');
    secondApprovedOrderId = body.order.id;

    withDb((db) => {
      const firstOrderNotifs = db.prepare('SELECT * FROM notifications WHERE order_id = ?').all(approvedOrderId);
      const secondOrderNotifs = db.prepare('SELECT * FROM notifications WHERE order_id = ?').all(secondApprovedOrderId);
      assertEqual(firstOrderNotifs.length, 1, 'exactly one persisted notification row for the FIRST order (not duplicated by the second)');
      assertEqual(secondOrderNotifs.length, 1, 'exactly one persisted notification row for the SECOND order');
      if (firstOrderNotifs[0] && secondOrderNotifs[0]) {
        assertTrue(firstOrderNotifs[0].id !== secondOrderNotifs[0].id, 'the two notification rows are different records (different ids)');
      }
    });
  });

  // ---------------------------------------------------------------
  // S11. Ownership DB check — USER B's own order never gets attributed
  // to USER A, and vice versa. Product 3 still has stock headroom (5
  // seeded, only touched by S3's rejected insufficient-stock attempt
  // above, which is a zero-write case).
  // ---------------------------------------------------------------
  await scenario('S11. Ownership DB check — USER B order/notification correctly attributed', async () => {
    const { status, body } = await createOrder(userBToken, {
      items: [{ product_id: 3, quantity: 1 }],
      payment_token: 'TEST-CARD-APPROVED',
    });
    assertEqual(status, 201, 'API returns 201 for USER B order');
    const userBOrderId = body.order.id;

    withDb((db) => {
      const orderRow = db.prepare('SELECT user_id FROM orders WHERE id = ?').get(userBOrderId);
      assertEqual(orderRow.user_id, 2, 'USER B order.user_id in DB is USER B (seeded id 2)');

      const notifRow = db.prepare('SELECT user_id FROM notifications WHERE order_id = ?').get(userBOrderId);
      assertTrue(Boolean(notifRow), 'notification row exists for USER B order');
      if (notifRow) assertEqual(notifRow.user_id, 2, 'notification.user_id in DB is USER B, not USER A');

      const userAOwnsIt = db.prepare('SELECT count(*) AS c FROM orders WHERE id = ? AND user_id = 1').get(userBOrderId).c;
      assertEqual(userAOwnsIt, 0, 'USER A is never attributed as owner of USER B order');
    });
  });

  // ---------------------------------------------------------------
  // S12. Relational integrity — no orphan rows after everything above
  // ---------------------------------------------------------------
  await scenario('S12. Relational integrity — no orphan rows', async () => {
    withDb((db) => {
      const orphanItems = db
        .prepare('SELECT count(*) AS c FROM order_items oi LEFT JOIN orders o ON o.id = oi.order_id WHERE o.id IS NULL')
        .get().c;
      assertEqual(orphanItems, 0, 'no order_items row references a non-existent order');

      const orphanNotifs = db
        .prepare(
          'SELECT count(*) AS c FROM notifications n LEFT JOIN orders o ON o.id = n.order_id WHERE n.order_id IS NOT NULL AND o.id IS NULL'
        )
        .get().c;
      assertEqual(orphanNotifs, 0, 'no notifications row references a non-existent order');

      const orphanEvents = db
        .prepare(
          'SELECT count(*) AS c FROM events e LEFT JOIN orders o ON o.id = e.order_id WHERE e.order_id IS NOT NULL AND o.id IS NULL'
        )
        .get().c;
      assertEqual(orphanEvents, 0, 'no events row references a non-existent order');

      const orphanItemProducts = db
        .prepare('SELECT count(*) AS c FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE p.id IS NULL')
        .get().c;
      assertEqual(orphanItemProducts, 0, 'no order_items row references a non-existent product');

      const orphanOrderUsers = db
        .prepare('SELECT count(*) AS c FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE u.id IS NULL')
        .get().c;
      assertEqual(orphanOrderUsers, 0, 'no orders row references a non-existent user');
    });
  });

  // ---------------------------------------------------------------
  // S13. Constraint definitions — structural inspection only (no
  // attempt to violate a constraint from this read-only script)
  // ---------------------------------------------------------------
  await scenario('S13. Constraint definitions present in schema (structural, read-only)', async () => {
    withDb((db) => {
      const ddl = db
        .prepare("SELECT name, sql FROM sqlite_master WHERE type = 'table'")
        .all()
        .reduce((acc, row) => ({ ...acc, [row.name]: row.sql }), {});

      assertTrue(/CHECK\s*\(stock_quantity\s*>=\s*0\)/.test(ddl.products || ''), 'products.stock_quantity has CHECK (>= 0)');
      assertTrue(/CHECK\s*\(quantity\s*>\s*0\)/.test(ddl.order_items || ''), 'order_items.quantity has CHECK (> 0)');
      assertTrue(/CHECK\s*\(is_read\s*IN\s*\(0,\s*1\)\)/.test(ddl.notifications || ''), 'notifications.is_read has CHECK (IN (0,1))');
      assertTrue(/UNIQUE\s*\(order_id,\s*type\)/.test(ddl.notifications || ''), 'notifications has UNIQUE(order_id, type)');
      assertTrue(/UNIQUE\s*\(order_id,\s*event_type\)/.test(ddl.events || ''), 'events has UNIQUE(order_id, event_type)');
      assertTrue(/user_id INTEGER NOT NULL REFERENCES users\(id\)/.test(ddl.orders || ''), 'orders.user_id REFERENCES users(id)');
      assertTrue(/order_id INTEGER NOT NULL REFERENCES orders\(id\)/.test(ddl.order_items || ''), 'order_items.order_id REFERENCES orders(id)');
      assertTrue(/product_id INTEGER NOT NULL REFERENCES products\(id\)/.test(ddl.order_items || ''), 'order_items.product_id REFERENCES products(id)');
    });
  });

  printSummary();

  const anyFailed = results.some((r) => r.failed);
  if (anyFailed) {
    process.exitCode = 1;
  }
}

function printSummary() {
  console.log('\n--- P5.7 API -> DB Validation Results ---');
  let totalAssertions = 0;
  let failedAssertions = 0;
  for (const r of results) {
    console.log(`\n${r.failed ? 'FAIL' : 'PASS'}  ${r.name}`);
    for (const a of r.assertions) {
      totalAssertions++;
      if (!a.pass) failedAssertions++;
      console.log(`  ${a.pass ? '✓' : '✗'}  ${a.label} — ${a.detail}`);
    }
  }
  const scenarioCount = results.length;
  const failedScenarios = results.filter((r) => r.failed).length;
  console.log(`\n--- Summary ---`);
  console.log(`Scenarios: ${scenarioCount} (failed: ${failedScenarios})`);
  console.log(`Assertions: ${totalAssertions} (failed: ${failedAssertions})`);
  console.log(failedAssertions === 0 ? '\nP5.7 API -> DB validation run: PASS' : '\nP5.7 API -> DB validation run: FAIL');
}

run();
