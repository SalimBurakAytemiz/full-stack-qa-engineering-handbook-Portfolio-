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

// --- Blocker B1: duplicate product lines must be aggregated, not treated
// per-row, when validating stock (Codex P4.2 review). ---

test('duplicate product lines over stock: 409, no order created, stock untouched', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  // product 1 has stock_quantity=25; 20 + 20 = 40 aggregated demand > 25.
  const res = await createOrder(
    ctx.baseUrl,
    token,
    [
      { product_id: 1, quantity: 20 },
      { product_id: 1, quantity: 20 },
    ],
    'TEST-CARD-APPROVED'
  );

  assert.equal(res.status, 409);

  const product = await fetch(`${ctx.baseUrl}/api/products/1`).then((r) => r.json());
  assert.equal(product.product.stock_quantity, 25);

  const orderCount = ctx.db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
  assert.equal(orderCount, 0);
});

test('duplicate product lines within stock: aggregated quantity is fulfilled once', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  // product 1 has stock_quantity=25; 10 + 10 = 20 aggregated demand <= 25.
  const res = await createOrder(
    ctx.baseUrl,
    token,
    [
      { product_id: 1, quantity: 10 },
      { product_id: 1, quantity: 10 },
    ],
    'TEST-CARD-APPROVED'
  );
  const body = await res.json();

  assert.equal(res.status, 201);
  assert.equal(body.order.status, 'PAID');

  const product = await fetch(`${ctx.baseUrl}/api/products/1`).then((r) => r.json());
  assert.equal(product.product.stock_quantity, 5);
});

// --- Blocker B3: strict type validation for quantity/product_id — no
// string/boolean/array/object/float coercion (Codex P4.2 review). ---

const INVALID_QUANTITIES = [true, false, [2], {}, null, '2', '1.5', 1.5, 0, -1];

for (const invalidQuantity of INVALID_QUANTITIES) {
  test(`quantity ${JSON.stringify(invalidQuantity)} is rejected with 400, no mutation`, async (t) => {
    const ctx = startTestServer();
    t.after(() => ctx.close());

    const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
    const res = await createOrder(
      ctx.baseUrl,
      token,
      [{ product_id: 1, quantity: invalidQuantity }],
      'TEST-CARD-APPROVED'
    );
    assert.equal(res.status, 400);

    const product = await fetch(`${ctx.baseUrl}/api/products/1`).then((r) => r.json());
    assert.equal(product.product.stock_quantity, 25);

    const orderCount = ctx.db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
    assert.equal(orderCount, 0);
  });
}

const INVALID_PRODUCT_IDS = [true, false, [1], {}, null, '1', 1.5, 0, -1];

for (const invalidProductId of INVALID_PRODUCT_IDS) {
  test(`product_id ${JSON.stringify(invalidProductId)} is rejected with 400, no mutation`, async (t) => {
    const ctx = startTestServer();
    t.after(() => ctx.close());

    const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
    const res = await createOrder(
      ctx.baseUrl,
      token,
      [{ product_id: invalidProductId, quantity: 1 }],
      'TEST-CARD-APPROVED'
    );
    assert.equal(res.status, 400);

    const orderCount = ctx.db.prepare('SELECT COUNT(*) AS count FROM orders').get().count;
    assert.equal(orderCount, 0);
  });
}

// --- Non-blocking #4: payment_token must be explicit — only a genuinely
// omitted field defaults; null/false/0/"" are invalid, not "missing". ---

const INVALID_PAYMENT_TOKENS = [null, false, 0, ''];

for (const invalidToken of INVALID_PAYMENT_TOKENS) {
  test(`payment_token ${JSON.stringify(invalidToken)} is rejected with 400, not silently defaulted`, async (t) => {
    const ctx = startTestServer();
    t.after(() => ctx.close());

    const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
    const res = await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 1 }], invalidToken);
    assert.equal(res.status, 400);
  });
}

test('an unrecognized payment_token string is rejected with 400', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, [{ product_id: 1, quantity: 1 }], 'NOT-A-REAL-TOKEN');
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.match(body.error, /Bilinmeyen test payment token/);
});

// --- Non-blocking #5: malformed JSON must be 400, not the generic 500. ---

test('malformed JSON body returns 400, not 500', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: '{ this is not valid json',
  });

  assert.equal(res.status, 400);
});
