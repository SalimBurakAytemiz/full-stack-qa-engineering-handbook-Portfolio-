const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');
const { createNotificationFromOrderPaidEvent } = require('../src/services/notifications.service');

async function createOrder(baseUrl, token, items, paymentToken) {
  return fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, payment_token: paymentToken }),
  });
}

test('a PAID order persists a notification for the owning user', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const orderRes = await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 1 }], 'TEST-CARD-APPROVED');
  const order = await orderRes.json();

  const res = await fetch(`${ctx.baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.notifications.length, 1);
  assert.equal(body.notifications[0].order_id, order.order.id);
  assert.equal(body.notifications[0].type, 'order.paid');
  assert.match(body.notifications[0].message, /payment approved/);
  assert.equal(body.notifications[0].is_read, 0);
});

test('a DECLINED order does not create a notification', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  await createOrder(ctx.baseUrl, token, [{ product_id: 3, quantity: 1 }], 'TEST-CARD-DECLINED');

  const res = await fetch(`${ctx.baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();

  assert.equal(body.notifications.length, 0);
});

test('a TIMEOUT order does not create a notification', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  await createOrder(ctx.baseUrl, token, [{ product_id: 4, quantity: 1 }], 'TEST-CARD-TIMEOUT');

  const res = await fetch(`${ctx.baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();

  assert.equal(body.notifications.length, 0);
});

test("another user cannot see a different user's notifications", async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const tokenA = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const tokenB = await loginAs(ctx.baseUrl, 'test.active02@example.com', 'ValidPass123!');

  await createOrder(ctx.baseUrl, tokenA, [{ product_id: 1, quantity: 1 }], 'TEST-CARD-APPROVED');

  const res = await fetch(`${ctx.baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.notifications.length, 0);
});

test('anonymous access to GET /api/notifications is rejected with 401', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/notifications`);
  assert.equal(res.status, 401);
});

test('a forged token is rejected on GET /api/notifications with 401', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/notifications`, {
    headers: { Authorization: 'Bearer forged-totally-made-up-token' },
  });
  assert.equal(res.status, 401);
});

test('the notifications table rejects a duplicate order.paid notification for the same order', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const orderRes = await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 1 }], 'TEST-CARD-APPROVED');
  const order = await orderRes.json();

  // Simple, deterministic duplicate-prevention guard (UNIQUE(order_id,
  // type) — see notifications.service.js) — not a general idempotency
  // system.
  assert.throws(() => {
    createNotificationFromOrderPaidEvent(ctx.db, {
      orderId: order.order.id,
      userId: 1,
      eventType: 'order.paid',
      total: 10,
    });
  });
});
