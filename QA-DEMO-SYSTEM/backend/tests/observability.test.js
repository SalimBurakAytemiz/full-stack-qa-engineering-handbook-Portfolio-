const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');
const { redactSensitiveQuery, safeDecodeURIComponent } = require('../src/middleware/requestContext');

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

// Codex fix-campaign B6 (P2, Phase 13): requestContext was registered
// AFTER express.json()/jsonParseErrorHandler, so a malformed-JSON request
// never reached it — jsonParseErrorHandler is error-handling middleware
// that responds directly (no next()), so the response had no
// X-Request-Id and no access-log line at all. Fixed by moving
// requestContext to run first (see app.js) — it has no dependency on the
// parsed body, so every response, including a parse failure, now carries
// a real correlation id.
test('malformed JSON still returns 400 with a real X-Request-Id header (regression lock for B6)', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ this is not valid JSON',
  });

  assert.equal(res.status, 400);
  const requestId = res.headers.get('x-request-id');
  assert.ok(requestId, 'a malformed-JSON 400 response must still carry X-Request-Id');
  assert.match(requestId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

  const body = await res.json();
  assert.equal(body.error, 'Geçersiz JSON gövdesi');
});

test('malformed JSON still produces an [http] access-log line with the real request id and path', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const logLines = [];
  const originalLog = console.log;
  console.log = (...args) => {
    logLines.push(args.join(' '));
    originalLog(...args);
  };

  let requestId;
  try {
    const res = await fetch(`${ctx.baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ still not valid JSON',
    });
    requestId = res.headers.get('x-request-id');
  } finally {
    console.log = originalLog;
  }

  const line = logLines.find((l) => l.includes('[http]') && l.includes(`request_id=${requestId}`));
  assert.ok(line, 'expected an [http] access-log line correlated to the malformed-JSON response');
  assert.match(line, /status=400/);
  assert.match(line, /path=\/api\/orders(?!\S)/);
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

// --- N4 (Codex final fix round, non-blocking): access-log query redaction ---

test('redactSensitiveQuery: a normal path with no query string is unchanged', () => {
  assert.equal(redactSensitiveQuery('/api/products'), '/api/products');
});

test('redactSensitiveQuery: a non-sensitive query value is preserved verbatim (observability not destroyed)', () => {
  assert.equal(redactSensitiveQuery('/api/products?category=keyboards&sort=price'), '/api/products?category=keyboards&sort=price');
});

test('redactSensitiveQuery: token/password/secret/api_key/auth-named query values are redacted, key names kept', () => {
  assert.equal(redactSensitiveQuery('/ws?token=SUPER-SECRET-VALUE'), '/ws?token=<redacted>');
  assert.equal(redactSensitiveQuery('/x?password=hunter2'), '/x?password=<redacted>');
  assert.equal(redactSensitiveQuery('/x?client_secret=abc123'), '/x?client_secret=<redacted>');
  assert.equal(redactSensitiveQuery('/x?api_key=abc123'), '/x?api_key=<redacted>');
  assert.equal(redactSensitiveQuery('/x?Authorization=Bearer%20abc'), '/x?Authorization=<redacted>');
});

test('redactSensitiveQuery: a mix of sensitive and normal keys — only the sensitive one is redacted', () => {
  assert.equal(
    redactSensitiveQuery('/api/products?category=keyboards&token=SUPER-SECRET-VALUE&sort=price'),
    '/api/products?category=keyboards&token=<redacted>&sort=price'
  );
});

test('a real request with a sensitive-looking query value never appears raw in the access log', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const logLines = [];
  const originalLog = console.log;
  console.log = (...args) => {
    logLines.push(args.join(' '));
    originalLog(...args);
  };
  try {
    // No real route reads req.query, so this is functionally identical to
    // a plain GET — the point here is ONLY what the access log records.
    await fetch(`${ctx.baseUrl}/api/products?token=SUPER-SECRET-DO-NOT-LOG&category=keyboards`);
  } finally {
    console.log = originalLog;
  }

  const line = logLines.find((l) => l.includes('[http]') && l.includes('GET'));
  assert.ok(line, 'expected an [http] access-log line');
  assert.ok(!line.includes('SUPER-SECRET-DO-NOT-LOG'), `raw sensitive value must never appear in the log: ${line}`);
  assert.match(line, /token=<redacted>/);
  // Non-sensitive key is still fully visible — redaction didn't destroy
  // observability value.
  assert.match(line, /category=keyboards/);
});

// --- N4 (Codex final fix round, 2. re-review — GERÇEK regresyon): malformed
// percent-encoding in a query key must never crash the redaction helper or
// change the route's own response. ---

test('safeDecodeURIComponent: valid percent-encoding decodes normally', () => {
  assert.equal(safeDecodeURIComponent('hello%20world'), 'hello world');
  assert.equal(safeDecodeURIComponent('token'), 'token');
});

test('safeDecodeURIComponent: malformed percent-encoding returns undefined instead of throwing', () => {
  assert.doesNotThrow(() => safeDecodeURIComponent('x%ZZ'));
  assert.equal(safeDecodeURIComponent('x%ZZ'), undefined);
  assert.equal(safeDecodeURIComponent('%'), undefined);
});

test('redactSensitiveQuery: a malformed percent-encoded key never throws and fails closed (redacted placeholder)', () => {
  assert.doesNotThrow(() => redactSensitiveQuery('/api/products?x%ZZ=1'));
  assert.equal(redactSensitiveQuery('/api/products?x%ZZ=1'), '/api/products?<invalid-encoding>=<redacted>');
});

test('redactSensitiveQuery: a malformed key mixed with normal keys only fails closed on the bad pair', () => {
  assert.equal(
    redactSensitiveQuery('/api/products?category=keyboards&x%ZZ=1&sort=price'),
    '/api/products?category=keyboards&<invalid-encoding>=<redacted>&sort=price'
  );
});

test('a real request with malformed query percent-encoding does not 500 — route behavior is preserved (regression lock)', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  // Before the fix, decodeURIComponent(key) threw a URIError synchronously
  // inside requestContext (before next() was called), which Express routed
  // to the generic errorHandler (always 500) — masking whatever /api/products
  // would actually have returned. A plain GET /api/products returns 200; if
  // this request also returns 200, the logging middleware did not alter the
  // route's real behavior.
  const baselineRes = await fetch(`${ctx.baseUrl}/api/products`);
  const malformedRes = await fetch(`${ctx.baseUrl}/api/products?x%ZZ=1`);

  assert.equal(baselineRes.status, 200);
  assert.equal(malformedRes.status, baselineRes.status, 'a malformed query string must not change the route\'s own status code');
  assert.ok(malformedRes.headers.get('x-request-id'), 'the request must still be correlated normally, not diverted to the generic error handler');
});

test('a real request with malformed query percent-encoding produces a safe, non-crashing access-log line', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const logLines = [];
  const originalLog = console.log;
  console.log = (...args) => {
    logLines.push(args.join(' '));
    originalLog(...args);
  };
  let res;
  try {
    res = await fetch(`${ctx.baseUrl}/api/products?x%ZZ=1`);
  } finally {
    console.log = originalLog;
  }

  assert.equal(res.status, 200);
  const line = logLines.find((l) => l.includes('[http]') && l.includes('GET'));
  assert.ok(line, 'expected an [http] access-log line even for a malformed query string');
  assert.match(line, /<invalid-encoding>=<redacted>/);
  assert.match(line, /status=200/);
});

test('a real request with a normal query string is unaffected by the malformed-key fail-closed path', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/products?page=1`);
  assert.equal(res.status, 200);
});

test('a real request with a sensitive api_key query value never appears raw in the access log', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const logLines = [];
  const originalLog = console.log;
  console.log = (...args) => {
    logLines.push(args.join(' '));
    originalLog(...args);
  };
  try {
    await fetch(`${ctx.baseUrl}/api/products?api_key=abc123`);
  } finally {
    console.log = originalLog;
  }

  const line = logLines.find((l) => l.includes('[http]') && l.includes('GET'));
  assert.ok(line, 'expected an [http] access-log line');
  assert.ok(!line.includes('abc123'), `raw api_key value must never appear in the log: ${line}`);
  assert.match(line, /api_key=<redacted>/);
});
