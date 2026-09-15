const { test } = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

function waitForOpen(ws) {
  return new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('an authenticated client can connect to the realtime WebSocket', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const ws = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => ws.close());

  await waitForOpen(ws);
  assert.equal(ws.readyState, WebSocket.OPEN);
});

test('a connection with a missing or invalid token is rejected', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const ws = new WebSocket(`${ctx.wsUrl}?token=forged-totally-made-up-token`);
  t.after(() => ws.close());

  const outcome = await new Promise((resolve) => {
    ws.once('open', () => resolve('opened'));
    ws.once('unexpected-response', () => resolve('rejected'));
    ws.once('error', () => resolve('rejected'));
  });

  assert.equal(outcome, 'rejected');
});

test('a connection to a non-/ws path is rejected', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const wsUrl = ctx.wsUrl.replace('/ws', '/not-ws');
  const ws = new WebSocket(`${wsUrl}?token=${token}`);
  t.after(() => ws.close());

  const outcome = await new Promise((resolve) => {
    ws.once('open', () => resolve('opened'));
    ws.once('unexpected-response', () => resolve('rejected'));
    ws.once('error', () => resolve('rejected'));
  });

  assert.equal(outcome, 'rejected');
});

test('the owning user receives a realtime notification when their order is paid', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const ws = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  t.after(() => ws.close());
  await waitForOpen(ws);

  const messagePromise = new Promise((resolve) => {
    ws.once('message', (data) => resolve(JSON.parse(data.toString())));
  });

  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  });

  const message = await messagePromise;
  assert.equal(message.type, 'notification');
  assert.match(message.notification.message, /Order #\d+ payment approved\./);
});

test("another connected user does not receive someone else's notification", async (t) => {
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

  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  });

  await sleep(100);
  assert.equal(receivedByB, false);
});

test('a DECLINED order does not push any realtime message', async (t) => {
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

  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 3, quantity: 1 }], payment_token: 'TEST-CARD-DECLINED' }),
  });

  await sleep(100);
  assert.equal(received, false);
});

test('closing a connection removes it from the connected-user set', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const ws = new WebSocket(`${ctx.wsUrl}?token=${token}`);
  await waitForOpen(ws);

  assert.equal(ctx.realtime.connectedUserCount(), 1);

  await new Promise((resolve) => {
    ws.once('close', resolve);
    ws.close();
  });
  await sleep(50);

  assert.equal(ctx.realtime.connectedUserCount(), 0);
});

test('an order created without any live connection still persists a fetchable notification', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');

  const res = await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  });
  assert.equal(res.status, 201);

  const notificationsRes = await fetch(`${ctx.baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await notificationsRes.json();
  assert.equal(body.notifications.length, 1);
});
