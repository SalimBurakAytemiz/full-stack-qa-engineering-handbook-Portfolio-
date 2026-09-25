const { test } = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

// Codex fix-campaign B1 (P1, Phase 6): before this fix, createGraphQLHandler
// never received pushNotificationToUser, so a GraphQL createOrder mutation
// that resulted in a PAID order persisted its notification (visible on a
// later GET /api/notifications) but never delivered it over the live
// WebSocket — only REST-created orders did. These tests mirror the existing
// REST WS tests (websocket.test.js) exactly, but drive order creation
// through GraphQL, to prove parity now holds for both transports.

function waitForOpen(ws) {
  return new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
}

function waitForMessage(ws) {
  return new Promise((resolve) => ws.once('message', (data) => resolve(JSON.parse(data.toString()))));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function graphqlRequest(baseUrl, token, query) {
  const res = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

test('GraphQL WS Push: a PAID order created via createOrder is delivered to the owning user over the live WebSocket', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const ws = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => ws.close());
  await waitForOpen(ws);

  const messagePromise = waitForMessage(ws);
  const body = await graphqlRequest(
    ctx.baseUrl,
    token,
    'mutation { createOrder(items: [{product_id: 1, quantity: 1}], payment_token: "TEST-CARD-APPROVED") { id status } }'
  );
  assert.equal(body.data.createOrder.status, 'PAID');

  const message = await messagePromise;
  assert.equal(message.type, 'notification');
  assert.match(message.notification.message, /payment approved/);
  // The pushed notification must correlate to the order this exact mutation
  // created — not merely "some" notification — proving real, not
  // coincidental, delivery.
  assert.equal(message.notification.order_id, body.data.createOrder.id);
});

test("GraphQL WS Push: another connected user does NOT receive someone else's GraphQL-created order notification", async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const tokenA = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const tokenB = await loginAs(ctx.baseUrl, 'test.active02@example.com', 'ValidPass123!');

  const wsB = new WebSocket(`${ctx.wsUrl}?token=${tokenB}`);
  t.after(() => wsB.close());
  await waitForOpen(wsB);

  let receivedByB = false;
  wsB.on('message', () => {
    receivedByB = true;
  });

  const body = await graphqlRequest(
    ctx.baseUrl,
    tokenA,
    'mutation { createOrder(items: [{product_id: 1, quantity: 1}], payment_token: "TEST-CARD-APPROVED") { id status } }'
  );
  assert.equal(body.data.createOrder.status, 'PAID');

  await sleep(100);
  assert.equal(receivedByB, false);
});

test('GraphQL WS Push: a DECLINED order created via GraphQL does not push any realtime message', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const ws = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => ws.close());
  await waitForOpen(ws);

  let received = false;
  ws.on('message', () => {
    received = true;
  });

  const body = await graphqlRequest(
    ctx.baseUrl,
    token,
    'mutation { createOrder(items: [{product_id: 4, quantity: 1}], payment_token: "TEST-CARD-DECLINED") { id status } }'
  );
  assert.equal(body.data.createOrder.status, 'PAYMENT_FAILED');

  await sleep(100);
  assert.equal(received, false);
});

test('GraphQL WS Push: an unauthenticated createOrder mutation is rejected before any push is attempted', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const body = await graphqlRequest(
    ctx.baseUrl,
    null,
    'mutation { createOrder(items: [{product_id: 1, quantity: 1}]) { id } }'
  );

  assert.equal(body.data, null);
  assert.equal(body.errors[0].extensions.code, 'UNAUTHENTICATED');
});

test('GraphQL WS Push: REST-created orders are still delivered after this fix (no regression to the existing transport)', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const ws = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => ws.close());
  await waitForOpen(ws);

  const messagePromise = waitForMessage(ws);
  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  });

  const message = await messagePromise;
  assert.equal(message.type, 'notification');
  assert.match(message.notification.message, /payment approved/);
});
