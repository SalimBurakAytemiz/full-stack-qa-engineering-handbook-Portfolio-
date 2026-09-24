const { test } = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

// Phase 6 — advanced WebSocket/event-system coverage. The base connect/auth/
// isolation/persistence behavior is already covered by tests/websocket.test.js
// (P4.3-era suite); this file ADDS coverage for Reconnect, strict Payload
// Validation, Duplicate Events at the WS-delivery layer, Event Ordering
// across rapid multi-order sequences, and Inbound Events (proving the
// server's push-only architecture) — it does not repeat existing cases.

function waitForOpen(ws) {
  return new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
}

function waitForClose(ws) {
  return new Promise((resolve) => ws.once('close', resolve));
}

function waitForMessage(ws) {
  return new Promise((resolve) => ws.once('message', (data) => resolve(JSON.parse(data.toString()))));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createOrder(baseUrl, token, { productId = 1, quantity = 1, paymentToken = 'TEST-CARD-APPROVED' } = {}) {
  const res = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: productId, quantity }], payment_token: paymentToken }),
  });
  return res.json();
}

// --- Reconnect ---

test('WS Reconnect: after closing and reconnecting with the same token, the user is re-tracked and receives new pushes', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');

  const ws1 = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  await waitForOpen(ws1);
  assert.equal(ctx.realtime.connectedUserCount(), 1);

  await new Promise((resolve) => {
    ws1.once('close', resolve);
    ws1.close();
  });
  await sleep(50);
  // The old socket must be fully unregistered — not just closed client-side —
  // before the reconnect, otherwise a stale entry would mask a tracking bug.
  assert.equal(ctx.realtime.connectedUserCount(), 0);

  const ws2 = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => ws2.close());
  await waitForOpen(ws2);
  assert.equal(ctx.realtime.connectedUserCount(), 1);

  const messagePromise = waitForMessage(ws2);
  await createOrder(ctx.baseUrl, token);
  const message = await messagePromise;

  assert.equal(message.type, 'notification');
  assert.match(message.notification.message, /payment approved/);
});

// --- Payload Validation ---

test('WS Payload Validation: the pushed notification message matches the exact expected schema, field by field', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const ws = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => ws.close());
  await waitForOpen(ws);

  const messagePromise = waitForMessage(ws);
  const created = await createOrder(ctx.baseUrl, token, { productId: 1, quantity: 1 });
  const message = await messagePromise;

  // Top-level envelope: exactly { type, notification } — nothing extra.
  assert.deepEqual(Object.keys(message).sort(), ['notification', 'type']);
  assert.equal(message.type, 'notification');

  const { notification } = message;
  assert.deepEqual(
    Object.keys(notification).sort(),
    ['id', 'is_read', 'message', 'order_id', 'type', 'user_id']
  );
  assert.equal(typeof notification.id, 'number');
  assert.equal(typeof notification.user_id, 'number');
  assert.equal(notification.type, 'order.paid');
  assert.equal(typeof notification.message, 'string');
  assert.equal(notification.message, `Order #${created.order.id} payment approved.`);
  assert.equal(notification.order_id, created.order.id);
  // Freshly created — never pre-marked read.
  assert.equal(notification.is_read, 0);
});

// --- Duplicate Events (WS-delivery layer) ---
// Distinct from P5.7's DB-layer duplicate-event proof: this proves the
// *delivery* fan-out itself never double-sends to one socket and never
// cross-delivers to a second, unrelated live socket for the same user.

test('WS Duplicate Events: a single order-paid event delivers exactly one message per live connection for that user, never more', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');

  // Two simultaneous connections for the SAME user (e.g. two open browser tabs).
  const wsA = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  const wsB = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => {
    wsA.close();
    wsB.close();
  });
  await Promise.all([waitForOpen(wsA), waitForOpen(wsB)]);
  assert.equal(ctx.realtime.connectedUserCount(), 1, 'still one tracked user, two sockets');

  const receivedA = [];
  const receivedB = [];
  wsA.on('message', (data) => receivedA.push(JSON.parse(data.toString())));
  wsB.on('message', (data) => receivedB.push(JSON.parse(data.toString())));

  await createOrder(ctx.baseUrl, token);
  await sleep(150);

  assert.equal(receivedA.length, 1, 'socket A must receive exactly one copy, not zero or duplicated');
  assert.equal(receivedB.length, 1, 'socket B must receive exactly one copy, not zero or duplicated');
  assert.equal(receivedA[0].notification.order_id, receivedB[0].notification.order_id);
});

// --- Event Ordering ---

test('WS Event Ordering: rapid sequential orders push notifications in the same order they were created', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const ws = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => ws.close());
  await waitForOpen(ws);

  const received = [];
  ws.on('message', (data) => received.push(JSON.parse(data.toString())));

  const createdOrderIds = [];
  // Sequential + awaited: the route pushes synchronously before responding
  // (see orders.routes.js), so awaiting each fetch in turn is what actually
  // guarantees creation order — this is not a timing assumption.
  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const created = await createOrder(ctx.baseUrl, token, { productId: 1, quantity: 1 });
    createdOrderIds.push(created.order.id);
  }

  await sleep(150);

  assert.equal(received.length, 3);
  const receivedOrderIds = received.map((m) => m.notification.order_id);
  assert.deepEqual(receivedOrderIds, createdOrderIds);
});

// --- Inbound Events ---
// Proves the realtime layer is genuinely push-only, per the ROADMAP Phase 6
// "Inbound Events" scope item — there is no ws.on('message', ...) handler
// anywhere in websocketServer.js for messages FROM the client, so sending one
// must be a silent no-op: no crash, no echo/ack/response, no effect on the
// connection or on other users, and the server must still work normally
// afterwards.

test('WS Inbound Events: the server is push-only — a client-sent message produces no response and does not affect the connection', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const ws = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => ws.close());
  await waitForOpen(ws);

  let receivedAnything = false;
  ws.on('message', () => {
    receivedAnything = true;
  });

  ws.send(JSON.stringify({ type: 'ping', hello: 'server, are you listening?' }));
  ws.send('not even valid JSON {{{');
  await sleep(150);

  assert.equal(receivedAnything, false, 'server must not echo/ack/respond to any inbound client message');
  assert.equal(ws.readyState, WebSocket.OPEN, 'sending unexpected inbound data must not drop the connection');
  assert.equal(ctx.realtime.connectedUserCount(), 1, 'connection tracking must be unaffected by inbound messages');

  // The server must still function normally afterwards — a malformed inbound
  // message must not have left the connection or the realtime layer in a
  // broken state.
  const messagePromise = waitForMessage(ws);
  await createOrder(ctx.baseUrl, token);
  const message = await messagePromise;
  assert.equal(message.type, 'notification');
});
