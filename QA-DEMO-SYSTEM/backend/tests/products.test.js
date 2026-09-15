const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');

test('GET /api/products returns seeded products with in-stock and out-of-stock items', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/products`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.products));
  assert.ok(body.products.length >= 3);
  assert.ok(body.products.some((p) => p.in_stock === false));
  assert.ok(body.products.some((p) => p.in_stock === true));
});

test('GET /api/products/:id returns a single product', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/products/1`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.product.id, 1);
});

test('GET /api/products/:id returns 404 for an unknown id', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/products/999999`);
  assert.equal(res.status, 404);
});
