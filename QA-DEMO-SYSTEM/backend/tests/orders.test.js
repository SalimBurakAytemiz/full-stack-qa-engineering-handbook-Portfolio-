const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

async function createOrder(baseUrl, token, items, paymentToken) {
  return fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ items, payment_token: paymentToken }),
  });
}

test('approved payment token creates a PAID order and decrements stock', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 2 }], 'TEST-CARD-APPROVED');
  const body = await res.json();

  assert.equal(res.status, 201);
  assert.equal(body.order.status, 'PAID');

  const product = await fetch(`${ctx.baseUrl}/api/products/1`).then((r) => r.json());
  assert.equal(product.product.stock_quantity, 23);
});

test('declined payment token leaves order as PAYMENT_FAILED and stock unchanged', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 3, quantity: 1 }], 'TEST-CARD-DECLINED');
  const body = await res.json();

  assert.equal(res.status, 201);
  assert.equal(body.order.status, 'PAYMENT_FAILED');

  const product = await fetch(`${ctx.baseUrl}/api/products/3`).then((r) => r.json());
  assert.equal(product.product.stock_quantity, 5);
});

test('timeout payment token leaves order as PAYMENT_TIMEOUT and stock unchanged', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 4, quantity: 1 }], 'TEST-CARD-TIMEOUT');
  const body = await res.json();

  assert.equal(res.status, 201);
  assert.equal(body.order.status, 'PAYMENT_TIMEOUT');

  const product = await fetch(`${ctx.baseUrl}/api/products/4`).then((r) => r.json());
  assert.equal(product.product.stock_quantity, 12);
});

test('omitting payment_token defaults to the approved pattern', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 1 }], undefined);
  const body = await res.json();

  assert.equal(res.status, 201);
  assert.equal(body.order.status, 'PAID');
});

test('creating an order without a valid session token returns 401', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await createOrder(ctx.baseUrl, null, [{ product_id: 1, quantity: 1 }], 'TEST-CARD-APPROVED');
  assert.equal(res.status, 401);
});

test('ordering more than the available stock returns 409', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 2, quantity: 1 }], 'TEST-CARD-APPROVED');
  assert.equal(res.status, 409);
});

test('GET /api/orders/:id returns the order with its items for the owning user', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const createRes = await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 1 }], 'TEST-CARD-APPROVED');
  const created = await createRes.json();

  const res = await fetch(`${ctx.baseUrl}/api/orders/${created.order.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.order.id, created.order.id);
  assert.equal(body.order.items.length, 1);
  assert.equal(body.order.items[0].product_id, 1);
});

test('GET /api/orders/:id returns 404 for an order belonging to another user', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const ownerToken = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const createRes = await createOrder(ctx.baseUrl, ownerToken, [{ product_id: 1, quantity: 1 }], 'TEST-CARD-APPROVED');
  const created = await createRes.json();

  const otherToken = await loginAs(ctx.baseUrl, 'test.active02@example.com', 'ValidPass123!');
  const res = await fetch(`${ctx.baseUrl}/api/orders/${created.order.id}`, {
    headers: { Authorization: `Bearer ${otherToken}` },
  });

  assert.equal(res.status, 404);
});
