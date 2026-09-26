const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const WebSocket = require('ws');
const Ajv = require('ajv');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

// TR: WebSocket mesaj yapısındaki alan değişikliklerini consumer
// testlerinden önce contract seviyesinde yakalar. `websocket.test.js`
// yalnızca birkaç alanı (`type`, `notification.message`) assert eder —
// bu, örn. `notification.id`'nin türü değişse veya beklenmeyen bir alan
// eklense fark edilmeyeceği anlamına gelir. Bu dosya, gerçek push
// mesajını VE gerçek `events` tablosuna yazılan `order.paid` payload'unu
// `shared/contracts/`'taki CANONICAL JSON Schema'lara karşı AJV ile
// doğrular — şema ile gerçek davranış arasındaki her fark burada patlar.
const ajv = new Ajv({ allErrors: true, strict: false });

function loadSchema(relPath) {
  const full = path.join(__dirname, '..', '..', '..', 'shared', 'contracts', relPath);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

const validateNotificationPush = ajv.compile(loadSchema('websocket/notification-push-message.schema.json'));
const validateOrderPaidEvent = ajv.compile(loadSchema('events/order-paid.schema.json'));

function waitForOpen(ws) {
  return new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
}

test('contract drift: the real WebSocket notification push message matches the canonical schema', async (t) => {
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
  const valid = validateNotificationPush(message);

  assert.equal(
    valid,
    true,
    `Real push message no longer matches shared/contracts/websocket/notification-push-message.schema.json: ${JSON.stringify(validateNotificationPush.errors)}`
  );
});

test('contract drift: the real order.paid event payload persisted in the DB matches the canonical schema', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');

  await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' }),
  });

  const row = ctx.db.prepare("SELECT payload FROM events WHERE event_type = 'order.paid' ORDER BY created_at DESC, event_id DESC LIMIT 1").get();
  assert.ok(row, 'expected an order.paid event row to have been persisted');

  const payload = JSON.parse(row.payload);
  const valid = validateOrderPaidEvent(payload);

  assert.equal(
    valid,
    true,
    `Real order.paid event payload no longer matches shared/contracts/events/order-paid.schema.json: ${JSON.stringify(validateOrderPaidEvent.errors)}`
  );
});
