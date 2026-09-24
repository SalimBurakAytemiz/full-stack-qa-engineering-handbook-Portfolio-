const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

// Phase 13 — Logging / Observability. Proves the request-correlation
// contract requestContext.js adds: every response carries a real,
// unique X-Request-Id, so a client-reported bug ("my request failed at
// 14:32") can be traced to its exact server-side access-log line
// (Root Cause Isolation) without guessing from timestamps alone.

test('every response includes a real X-Request-Id header, in UUID format', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/health`);
  const requestId = res.headers.get('x-request-id');

  assert.ok(requestId, 'X-Request-Id header must be present');
  assert.match(requestId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
});

test('two concurrent requests receive two different request ids (never reused/collided)', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const [resA, resB] = await Promise.all([
    fetch(`${ctx.baseUrl}/api/health`),
    fetch(`${ctx.baseUrl}/api/products`),
  ]);

  const idA = resA.headers.get('x-request-id');
  const idB = resB.headers.get('x-request-id');
  assert.ok(idA && idB);
  assert.notEqual(idA, idB, 'each request must get its own correlation id');
});

test('X-Request-Id is present even on error responses (404/401), not only successful ones', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const notFoundRes = await fetch(`${ctx.baseUrl}/api/does-not-exist`);
  assert.equal(notFoundRes.status, 404);
  assert.ok(notFoundRes.headers.get('x-request-id'), 'even a 404 must carry a request id for root-cause isolation');

  const unauthorizedRes = await fetch(`${ctx.baseUrl}/api/notifications`);
  assert.equal(unauthorizedRes.status, 401);
  assert.ok(unauthorizedRes.headers.get('x-request-id'), 'even a 401 must carry a request id');
});

test('the access-log line records the real mounted path, not a router-internal stripped fragment', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const logLines = [];
  const originalLog = console.log;
  console.log = (...args) => {
    logLines.push(args.join(' '));
    originalLog(...args);
  };
  try {
    await fetch(`${ctx.baseUrl}/api/products`);
  } finally {
    console.log = originalLog;
  }

  // Regression lock for a real bug found during implementation: reading
  // req.path lazily inside the async 'finish' handler logged "/" instead
  // of "/api/products", because Express temporarily rewrites req.url
  // while inside a nested router and none of this app's handlers call
  // next() on success to trigger the restore before 'finish' fires. Fixed
  // by capturing req.originalUrl synchronously up front (see
  // requestContext.js) — this test locks the correct behavior in.
  const line = logLines.find((l) => l.includes('[http]') && l.includes('GET'));
  assert.ok(line, 'expected an [http] access-log line for the GET request');
  assert.match(line, /path=\/api\/products(?!\S)/, `access log must record the real path: ${line}`);
});

test('a real request lifecycle (login) produces a distinct request id from the request it triggers next', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const loginRes = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.active01@example.com', password: 'ValidPass123!' }),
  });
  const loginRequestId = loginRes.headers.get('x-request-id');
  const { token } = await loginRes.json();

  const productsRes = await fetch(`${ctx.baseUrl}/api/products`, { headers: { Authorization: `Bearer ${token}` } });
  const productsRequestId = productsRes.headers.get('x-request-id');

  assert.ok(loginRequestId && productsRequestId);
  assert.notEqual(loginRequestId, productsRequestId);
});
