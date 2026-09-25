const { test } = require('node:test');
const assert = require('node:assert/strict');
const { GraphQLError } = require('graphql');
const { maskUnexpectedErrors } = require('../src/graphql');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

// Phase 18 self-audit hardening. A real gap was found while re-reviewing
// the GraphQL handler: unlike the REST side (errorHandler.js, which always
// returns a generic 'Sunucu hatası' for unexpected errors), the GraphQL
// handler passed every resolver error's raw message straight through —
// an unexpected internal exception (e.g. a raw DB driver error) would have
// leaked its message to the client. No currently-reachable resolver path
// triggers this (schema-level type coercion + service-layer validation
// already reject malformed input before it reaches a resolver), which is
// why this is tested at the unit level (real GraphQLError instances, real
// function) rather than end-to-end through a fabricated crashing resolver.

test('maskUnexpectedErrors: an error with a recognized extensions.code is passed through unchanged', () => {
  const original = new GraphQLError('Yetkilendirme gerekli', {
    extensions: { code: 'UNAUTHENTICATED' },
    path: ['order'],
  });
  const result = maskUnexpectedErrors({ data: { order: null }, errors: [original] });
  assert.equal(result.errors[0], original);
  assert.equal(result.errors[0].message, 'Yetkilendirme gerekli');
});

test('maskUnexpectedErrors: a validation error (no path) is never masked, even without a known code', () => {
  const validationError = new GraphQLError('Cannot query field "x" on type "Query".');
  // Real graphql() behavior for validation errors: no `data` key at all.
  const result = maskUnexpectedErrors({ errors: [validationError] });
  assert.equal(result.errors[0], validationError);
  assert.equal(result.errors[0].message, 'Cannot query field "x" on type "Query".');
});

test('maskUnexpectedErrors: an unrecognized execution-phase error (has a path, no known code) is replaced with a generic message', () => {
  const internalError = new GraphQLError('SQLITE_CONSTRAINT: NOT NULL constraint failed: users.email', {
    path: ['me'],
  });
  const result = maskUnexpectedErrors({ data: { me: null }, errors: [internalError] });

  assert.notEqual(result.errors[0], internalError);
  assert.equal(result.errors[0].message, 'Sunucu hatası');
  assert.equal(result.errors[0].extensions.code, 'INTERNAL_SERVER_ERROR');
  // The path is preserved so the client can still tell which field failed,
  // exactly as a real unmasked resolver error would.
  assert.deepEqual(result.errors[0].path, ['me']);
  // The real message must never leak, under any field name.
  assert.ok(!JSON.stringify(result).includes('SQLITE_CONSTRAINT'));
});

test('maskUnexpectedErrors: a result with no errors is returned unchanged', () => {
  const result = { data: { health: 'ok' } };
  assert.equal(maskUnexpectedErrors(result), result);
});

// --- Integration-level regression lock: the real, already-existing error
// paths must still surface their real messages end-to-end after this
// change (not accidentally masked). ---

test('integration: a real UNAUTHENTICATED resolver error still surfaces its real message through the live endpoint', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ order(id: 1) { id } }' }),
  });
  const body = await res.json();
  assert.equal(body.errors[0].message, 'Yetkilendirme gerekli');
  assert.equal(body.errors[0].extensions.code, 'UNAUTHENTICATED');
});

test('integration: a real BAD_REQUEST resolver error (insufficient stock) still surfaces its real message', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await fetch(`${ctx.baseUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: 'mutation { createOrder(items: [{product_id: 3, quantity: 999}]) { id } }',
    }),
  });
  const body = await res.json();
  assert.match(body.errors[0].message, /Yetersiz stok/);
});

test('integration: a real query-validation error (unknown field) still surfaces its real message', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ thisFieldDoesNotExist }' }),
  });
  const body = await res.json();
  assert.match(body.errors[0].message, /Cannot query field/);
});
