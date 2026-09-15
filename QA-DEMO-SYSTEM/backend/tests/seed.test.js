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

// --- Non-blocking #2: reset must produce the same deterministic IDs every
// time, even after orders/order_items with AUTOINCREMENT ids were created
// since the last seed (Codex P4.2 review). ---

test('reseeding after activity resets AUTOINCREMENT counters deterministically', () => {
  const db = getDatabase(':memory:');
  seedDatabase(db);

  // Simulate activity that advances the orders/order_items AUTOINCREMENT
  // counters before the next reset.
  const insertOrder = db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)');
  insertOrder.run(1, 'PAID', 10);
  insertOrder.run(1, 'PAID', 20);
  db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)').run(
    1,
    1,
    1,
    10
  );

  seedDatabase(db);

  const productIds = db.prepare('SELECT id FROM products ORDER BY id').all().map((row) => row.id);
  const userIds = db.prepare('SELECT id FROM users ORDER BY id').all().map((row) => row.id);
  assert.deepEqual(productIds, [1, 2, 3, 4]);
  assert.deepEqual(userIds, [1, 2]);

  const orderCount = db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
  const orderItemCount = db.prepare('SELECT COUNT(*) AS count FROM order_items').get().count;
  assert.equal(orderCount, 0);
  assert.equal(orderItemCount, 0);

  // A freshly created order after reset must get id 1 again, proving the
  // AUTOINCREMENT counter (sqlite_sequence) was actually cleared.
  const info = insertOrder.run(1, 'PAID', 10);
  assert.equal(info.lastInsertRowid, 1);

  db.close();
});

// --- Non-blocking #1: CHECK/FOREIGN KEY constraints are actually enforced
// at the database level (PRAGMA foreign_keys = ON), not just declared. ---

test('CHECK constraint rejects negative product stock at the database level', () => {
  const db = getDatabase(':memory:');
  seedDatabase(db);

  assert.throws(() => {
    db.prepare('UPDATE products SET stock_quantity = -1 WHERE id = 1').run();
  });

  db.close();
});

test('CHECK constraint rejects a non-positive order_items quantity', () => {
  const db = getDatabase(':memory:');
  seedDatabase(db);
  db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)').run(1, 'PAID', 10);

  assert.throws(() => {
    db.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (1, 1, 0, 10)'
    ).run();
  });

  db.close();
});

test('FOREIGN KEY constraint rejects an order_item referencing a nonexistent order', () => {
  const db = getDatabase(':memory:');
  seedDatabase(db);

  assert.throws(() => {
    db.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (999999, 1, 1, 10)'
    ).run();
  });

  db.close();
});

// --- P4.3 section 10 (test scenario 10): notification/event seed & reset
// behavior must be deterministic, mirroring the P4.2 order reset guarantee.

test('reseeding clears events and notifications and resets notification ids deterministically', () => {
  const db = getDatabase(':memory:');
  seedDatabase(db);

  db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)').run(1, 'PAID', 10);
  db.prepare(
    'INSERT INTO events (event_id, event_type, user_id, order_id, payload) VALUES (?, ?, ?, ?, ?)'
  ).run('evt-test-1', 'order.paid', 1, 1, '{}');
  const insertNotification = db.prepare(
    'INSERT INTO notifications (user_id, type, message, order_id) VALUES (?, ?, ?, ?)'
  );
  insertNotification.run(1, 'order.paid', 'test message', 1);

  seedDatabase(db);

  const eventCount = db.prepare('SELECT COUNT(*) AS count FROM events').get().count;
  const notificationCount = db.prepare('SELECT COUNT(*) AS count FROM notifications').get().count;
  assert.equal(eventCount, 0);
  assert.equal(notificationCount, 0);

  // A freshly created notification after reset must get id 1 again,
  // proving the AUTOINCREMENT counter was actually cleared.
  db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)').run(1, 'PAID', 10);
  const info = insertNotification.run(1, 'order.paid', 'test message', 1);
  assert.equal(info.lastInsertRowid, 1);

  db.close();
});

test('UNIQUE(order_id, event_type) prevents a duplicate order.paid event at the database level', () => {
  const db = getDatabase(':memory:');
  seedDatabase(db);
  db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)').run(1, 'PAID', 10);
  db.prepare(
    'INSERT INTO events (event_id, event_type, user_id, order_id, payload) VALUES (?, ?, ?, ?, ?)'
  ).run('evt-a', 'order.paid', 1, 1, '{}');

  assert.throws(() => {
    db.prepare(
      'INSERT INTO events (event_id, event_type, user_id, order_id, payload) VALUES (?, ?, ?, ?, ?)'
    ).run('evt-b', 'order.paid', 1, 1, '{}');
  });

  db.close();
});

test('UNIQUE(order_id, type) prevents a duplicate order.paid notification at the database level', () => {
  const db = getDatabase(':memory:');
  seedDatabase(db);
  db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)').run(1, 'PAID', 10);
  db.prepare(
    'INSERT INTO notifications (user_id, type, message, order_id) VALUES (?, ?, ?, ?)'
  ).run(1, 'order.paid', 'first', 1);

  assert.throws(() => {
    db.prepare(
      'INSERT INTO notifications (user_id, type, message, order_id) VALUES (?, ?, ?, ?)'
    ).run(1, 'order.paid', 'second', 1);
  });

  db.close();
});
