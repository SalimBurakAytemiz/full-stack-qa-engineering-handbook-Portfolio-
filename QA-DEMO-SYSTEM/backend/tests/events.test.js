const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');
const { createOrderPaidEvent } = require('../src/services/events.service');

async function createOrder(baseUrl, token, items, paymentToken) {
  return fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, payment_token: paymentToken }),
  });
}

test('a PAID order emits exactly one order.paid event with a well-formed contract', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 1 }], 'TEST-CARD-APPROVED');
  const body = await res.json();

  const events = ctx.db.prepare('SELECT * FROM events WHERE order_id = ?').all(body.order.id);
  assert.equal(events.length, 1);

  const event = events[0];
  assert.equal(event.event_type, 'order.paid');
  assert.equal(typeof event.event_id, 'string');
  assert.ok(event.event_id.length > 0);
  assert.equal(event.user_id, 1);
  assert.equal(event.order_id, body.order.id);
  assert.ok(event.created_at);

  const payload = JSON.parse(event.payload);
  assert.equal(payload.orderId, body.order.id);
  assert.equal(payload.userId, 1);
  assert.equal(typeof payload.total, 'number');
});

test('a DECLINED order does not emit an order.paid event', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 3, quantity: 1 }], 'TEST-CARD-DECLINED');
  const body = await res.json();

  const events = ctx.db.prepare('SELECT * FROM events WHERE order_id = ?').all(body.order.id);
  assert.equal(events.length, 0);
});

test('a TIMEOUT order does not emit an order.paid event', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 4, quantity: 1 }], 'TEST-CARD-TIMEOUT');
  const body = await res.json();

  const events = ctx.db.prepare('SELECT * FROM events WHERE order_id = ?').all(body.order.id);
  assert.equal(events.length, 0);
});

test('event_id values are unique across multiple paid orders', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 1 }], 'TEST-CARD-APPROVED');
  await createOrder(ctx.baseUrl, token, [{ product_id: 3, quantity: 1 }], 'TEST-CARD-APPROVED');

  const eventIds = ctx.db
    .prepare('SELECT event_id FROM events')
    .all()
    .map((row) => row.event_id);

  assert.equal(eventIds.length, 2);
  assert.equal(new Set(eventIds).size, 2);
});

test('the events table rejects a duplicate order.paid event for the same order', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 1 }], 'TEST-CARD-APPROVED');
  const body = await res.json();

  // Simple, deterministic duplicate-prevention guard (UNIQUE(order_id,
  // event_type) — see events.service.js) — not a general idempotency
  // system.
  assert.throws(() => {
    createOrderPaidEvent(ctx.db, { orderId: body.order.id, userId: 1, total: 10 });
  });
});
