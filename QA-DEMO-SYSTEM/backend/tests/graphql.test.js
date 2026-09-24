const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

// Phase 6 — GraphQL layer test suite. Exercises Query, Mutation, error
// handling, and data mapping against the real GraphQL endpoint (POST
// /graphql), which itself reuses the exact same services (products/orders/
// auth) already covered by the REST test suites — this suite verifies the
// GraphQL TRANSPORT and TYPE MAPPING, not a second copy of business rules.

async function gql(baseUrl, query, { variables, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  return { status: res.status, body: await res.json() };
}

// --- Query ---

test('GraphQL Query: health returns "ok"', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { status, body } = await gql(ctx.baseUrl, '{ health }');
  assert.equal(status, 200);
  assert.equal(body.data.health, 'ok');
  assert.equal(body.errors, undefined);
});

test('GraphQL Query: products returns all seeded products with correct field mapping', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { body } = await gql(ctx.baseUrl, '{ products { id name price stock_quantity in_stock } }');
  const { products } = body.data;
  assert.equal(products.length, 4);

  const product1 = products.find((p) => p.id === 1);
  assert.equal(product1.name, 'QA Demo Klavye');
  assert.equal(typeof product1.price, 'number');
  assert.equal(product1.stock_quantity, 25);
  assert.equal(product1.in_stock, true);

  // Data mapping check: product id=2 is the seeded out-of-stock item —
  // in_stock must be a real computed boolean (stock_quantity > 0), not a
  // pass-through of some unrelated DB column.
  const product2 = products.find((p) => p.id === 2);
  assert.equal(product2.stock_quantity, 0);
  assert.equal(product2.in_stock, false);
});

test('GraphQL Query: product(id) returns null (not an error) for a well-formed, non-existent id', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { status, body } = await gql(ctx.baseUrl, '{ product(id: 9999) { id name } }');
  assert.equal(status, 200);
  assert.equal(body.data.product, null);
  assert.equal(body.errors, undefined);
});

test('GraphQL Query: product(id) with a real id returns the correct product', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { body } = await gql(ctx.baseUrl, '{ product(id: 3) { id name stock_quantity } }');
  assert.equal(body.data.product.id, 3);
  assert.equal(body.data.product.name, 'QA Demo Monitör');
});

test('GraphQL Query: me returns null when unauthenticated (not an error)', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { status, body } = await gql(ctx.baseUrl, '{ me { id email } }');
  assert.equal(status, 200);
  assert.equal(body.data.me, null);
  assert.equal(body.errors, undefined);
});

test('GraphQL Query: me returns the authenticated user when a valid token is sent', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const { body } = await gql(ctx.baseUrl, '{ me { id email } }', { token });
  assert.equal(body.data.me.id, 1);
  assert.equal(body.data.me.email, 'test.active01@example.com');
});

test('GraphQL Query: order(id) requires auth — unauthenticated request errors, HTTP still 200', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { status, body } = await gql(ctx.baseUrl, '{ order(id: 1) { id status } }');
  assert.equal(status, 200);
  // `order` is a NULLABLE field in the schema, so a thrown resolver error
  // nulls out just that field (data: { order: null }) rather than
  // propagating to data: null — that null-bubbling only happens through a
  // chain of NON-NULL (`!`) fields per the GraphQL spec. This is correct
  // GraphQL error-propagation behavior, not a resolver bug.
  assert.equal(body.data.order, null);
  assert.equal(body.errors[0].message, 'Yetkilendirme gerekli');
  assert.equal(body.errors[0].extensions.code, 'UNAUTHENTICATED');
});

test('GraphQL Query: order(id) enforces ownership — another user cannot fetch it (returns null, not someone else\'s data)', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const tokenA = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const tokenB = await loginAs(ctx.baseUrl, 'test.active02@example.com', 'ValidPass123!');

  const created = await gql(
    ctx.baseUrl,
    'mutation { createOrder(items: [{product_id: 1, quantity: 1}], payment_token: "TEST-CARD-APPROVED") { id } }',
    { token: tokenA }
  );
  const orderId = created.body.data.createOrder.id;

  const { body } = await gql(ctx.baseUrl, `{ order(id: ${orderId}) { id status } }`, { token: tokenB });
  assert.equal(body.data.order, null);
  assert.equal(body.errors, undefined);
});

test('GraphQL Query: order(id) returns full nested items data mapping for the owner', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const created = await gql(
    ctx.baseUrl,
    'mutation { createOrder(items: [{product_id: 1, quantity: 2}], payment_token: "TEST-CARD-APPROVED") { id } }',
    { token }
  );
  const orderId = created.body.data.createOrder.id;

  const { body } = await gql(
    ctx.baseUrl,
    `{ order(id: ${orderId}) { id status total items { product_id product_name quantity unit_price } } }`,
    { token }
  );
  const { order } = body.data;
  assert.equal(order.status, 'PAID');
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].product_id, 1);
  assert.equal(order.items[0].quantity, 2);
  assert.equal(order.items[0].product_name, 'QA Demo Klavye');
});

// --- Mutation: login ---

test('GraphQL Mutation: login with valid credentials returns a real token and user', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { body } = await gql(
    ctx.baseUrl,
    'mutation { login(email: "test.active01@example.com", password: "ValidPass123!") { token user { id email } } }'
  );
  assert.match(body.data.login.token, /^demo-session-/);
  assert.equal(body.data.login.user.email, 'test.active01@example.com');
});

test('GraphQL Mutation: login with wrong password errors with the same generic message as REST (no info leak)', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { status, body } = await gql(
    ctx.baseUrl,
    'mutation { login(email: "test.active01@example.com", password: "WrongPass999!") { token } }'
  );
  assert.equal(status, 200);
  assert.equal(body.data, null);
  assert.equal(body.errors[0].message, 'Email veya şifre hatalı');
});

test('GraphQL Mutation: login with an unregistered email gives the SAME generic message (no info leak)', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { body } = await gql(
    ctx.baseUrl,
    'mutation { login(email: "nobody@example.com", password: "WrongPass999!") { token } }'
  );
  assert.equal(body.errors[0].message, 'Email veya şifre hatalı');
});

// --- Mutation: createOrder — error handling parity with REST ---

test('GraphQL Mutation: createOrder rejects insufficient stock with the same message as REST', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const { body } = await gql(
    ctx.baseUrl,
    'mutation { createOrder(items: [{product_id: 3, quantity: 999}], payment_token: "TEST-CARD-APPROVED") { id } }',
    { token }
  );
  assert.equal(body.data, null);
  assert.match(body.errors[0].message, /Yetersiz stok/);
  assert.equal(body.errors[0].extensions.status, 409);
});

test('GraphQL Mutation: createOrder rejects an unknown product_id', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const { body } = await gql(
    ctx.baseUrl,
    'mutation { createOrder(items: [{product_id: 99999, quantity: 1}]) { id } }',
    { token }
  );
  assert.match(body.errors[0].message, /Ürün bulunamadı/);
  assert.equal(body.errors[0].extensions.status, 400);
});

test('GraphQL Mutation: createOrder — omitted payment_token defaults to approved (same as REST default)', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const { body } = await gql(
    ctx.baseUrl,
    'mutation { createOrder(items: [{product_id: 1, quantity: 1}]) { status } }',
    { token }
  );
  assert.equal(body.data.createOrder.status, 'PAID');
});

test('GraphQL Mutation: createOrder — explicit null payment_token is REJECTED, never silently defaulted', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const { body } = await gql(
    ctx.baseUrl,
    'mutation { createOrder(items: [{product_id: 1, quantity: 1}], payment_token: null) { status } }',
    { token }
  );
  assert.equal(body.data, null);
  assert.match(body.errors[0].message, /payment_token/);
});

test('GraphQL Mutation: createOrder declined payment persists as PAYMENT_FAILED, does not throw', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const { body } = await gql(
    ctx.baseUrl,
    'mutation { createOrder(items: [{product_id: 4, quantity: 1}], payment_token: "TEST-CARD-DECLINED") { id status total } }',
    { token }
  );
  assert.equal(body.errors, undefined);
  assert.equal(body.data.createOrder.status, 'PAYMENT_FAILED');
});

// --- GraphQL-level validation errors (query itself malformed) ---

test('GraphQL: a query requesting a field that does not exist on the schema returns a validation error, HTTP 200', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const { status, body } = await gql(ctx.baseUrl, '{ thisFieldDoesNotExist }');
  assert.equal(status, 200);
  assert.equal(body.data, undefined);
  assert.ok(body.errors.length > 0);
  assert.match(body.errors[0].message, /Cannot query field/);
});

test('GraphQL: a request with no "query" field at all is a transport-level 400, not a GraphQL errors[] entry', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notAQuery: true }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(Array.isArray(body.errors));
});
