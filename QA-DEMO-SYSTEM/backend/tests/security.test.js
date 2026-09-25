const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

// Phase 11 — Security-Aware QA. Extends the auth/authorization coverage
// already established in Phase 5 (P5.3) with security-specific lenses:
// IDOR/BOLA, XSS-oriented validation, SQL Injection-oriented validation,
// Mass Assignment, and Sensitive Data exposure. Does not re-prove what
// P5.3 already proved (generic auth error, 404-not-403 ownership denial)
// — see EXECUTION.md section 1 for the full cross-reference.

async function createOrder(baseUrl, token, body) {
  return fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

// --- IDOR / BOLA ---

test('IDOR: a non-numeric order id does not leak data or crash, resolves to a clean 404', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await fetch(`${ctx.baseUrl}/api/orders/abc`, { headers: { Authorization: `Bearer ${token}` } });

  // Number('abc') is NaN; the route must not throw a 500 or leak an
  // internal error — it must behave exactly like "not found".
  assert.equal(res.status, 404);
});

test('IDOR: a negative order id resolves to a clean 404, not an internal error', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await fetch(`${ctx.baseUrl}/api/orders/-1`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res.status, 404);
});

test('IDOR: sequential order-id enumeration across two users never crosses ownership', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const tokenA = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const tokenB = await loginAs(ctx.baseUrl, 'test.active02@example.com', 'ValidPass123!');

  const created = await createOrder(ctx.baseUrl, tokenA, {
    items: [{ product_id: 1, quantity: 1 }],
    payment_token: 'TEST-CARD-APPROVED',
  }).then((r) => r.json());

  // Enumerate a small range of ids around the real one as user B — none
  // may ever return user A's order data.
  for (let id = created.order.id - 2; id <= created.order.id + 2; id += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await fetch(`${ctx.baseUrl}/api/orders/${id}`, { headers: { Authorization: `Bearer ${tokenB}` } });
    if (id === created.order.id) {
      assert.equal(res.status, 404, `user B must never see user A's real order ${id}`);
    } else {
      assert.ok([404].includes(res.status), `unexpected status ${res.status} for id ${id}`);
    }
  }
});

// --- XSS-oriented validation ---
// This API has NO user-controlled free-text field that is ever echoed back
// into a rendered page (product names come from seed data, not user
// input; order items are numeric ids/quantities). The realistic XSS
// surface here is the login form's email/password fields — proven to
// never be reflected in the response, only a constant generic message.

test('XSS-oriented: a script-tag payload in the email field is never reflected in the response body', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const payload = '<script>alert(1)</script>';
  const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: payload, password: 'irrelevant' }),
  });
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.error, 'Email veya şifre hatalı');
  assert.ok(!JSON.stringify(body).includes('<script>'), 'payload must never be reflected back');
});

test('XSS-oriented: an HTML-injection payload as an unrecognized payment_token IS reflected in the JSON error, but the frontend never renders it unsafely', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const payload = '<img src=x onerror=alert(1)>';
  const res = await createOrder(ctx.baseUrl, token, {
    items: [{ product_id: 1, quantity: 1 }],
    payment_token: payload,
  });
  const body = await res.json();

  // GENUINE finding (not the initial assumption of this test — see
  // EXECUTION.md section 3): simulatePayment() rejects any token it does
  // not recognize with 400 "Bilinmeyen test payment token: <token>",
  // interpolating the raw client-supplied token straight into the JSON
  // error message. The payload IS present in the API response.
  assert.equal(res.status, 400);
  assert.ok(body.error.includes(payload), 'documents the real reflection — this is the finding, not a bug in the test');

  // This is NOT an exploitable XSS end-to-end: the only frontend page
  // that reads API error strings (frontend/js/login.js) assigns them via
  // `errorEl.textContent`, never `innerHTML` (verified in source) — and
  // this app's frontend has no order-creation UI at all (see Phase 8
  // EXECUTION.md), so this specific error can never even reach a
  // rendered page in the current frontend. Recorded as a non-blocking
  // hardening note (generic error message, no raw reflection) in
  // EXECUTION.md section 3, not as a blocker.
});

// --- SQL Injection-oriented validation ---
// Every query in this codebase uses parameterized statements
// (db.prepare(...).run(?)/.get(?)) — see services/*.js. These tests prove
// the OBSERVABLE behavior a real attacker would see, not just re-read the
// source for "?" placeholders.

test('SQLi-oriented: a classic OR-1=1 payload in the login email field does not bypass authentication', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "' OR '1'='1", password: "' OR '1'='1" }),
  });
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.error, 'Email veya şifre hatalı');
});

test('SQLi-oriented: a SQL payload as product_id is rejected as a type error, not executed as SQL', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, {
    items: [{ product_id: '1 OR 1=1', quantity: 1 }],
    payment_token: 'TEST-CARD-APPROVED',
  });
  const body = await res.json();

  // aggregateItems() requires product_id to be a positive INTEGER
  // (isPositiveInteger) — a string, even one that "looks numeric-ish",
  // is rejected outright before any query runs.
  assert.equal(res.status, 400);
  assert.match(body.error, /product_id pozitif bir tam sayı olmalıdır/);
});

test("SQLi-oriented: a single-quote payload in a product lookup id does not error the server or leak data", async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/products/1'--`);
  // Number("1'--") is NaN — the route's Number(req.params.id) coercion
  // means this can only ever resolve to "not found", never to a broken
  // query string concatenation (there is none — the driver is parameterized).
  assert.equal(res.status, 404);
});

// --- Mass Assignment ---

test('Mass Assignment: an injected user_id in the request body cannot make an order belong to a different user', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const tokenA = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, tokenA, {
    items: [{ product_id: 1, quantity: 1 }],
    payment_token: 'TEST-CARD-APPROVED',
    user_id: 2, // attempting to impersonate user 2
  });
  const body = await res.json();
  assert.equal(res.status, 201);

  // The route destructures only { items, payment_token } from req.body
  // (see orders.routes.js) and always uses req.userId (from the verified
  // session, never the client body) as the owning user — the injected
  // user_id field is silently ignored, not something to "reject" with an
  // error, since it is simply never read.
  const dbOrder = ctx.db.prepare('SELECT user_id FROM orders WHERE id = ?').get(body.order.id);
  assert.equal(dbOrder.user_id, 1, 'order must belong to the authenticated user, not the injected user_id');
});

test('Mass Assignment: an injected status/total in the request body cannot override the server-computed values', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const res = await createOrder(ctx.baseUrl, token, {
    items: [{ product_id: 1, quantity: 1 }],
    payment_token: 'TEST-CARD-DECLINED',
    status: 'PAID',
    total: 0.01,
  });
  const body = await res.json();

  // Declined payment must still produce PAYMENT_FAILED at the real price
  // (149.90), never the client-supplied 'PAID'/0.01 — createOrder()
  // computes both from server-side product data and the real payment
  // simulation result, and never reads req.body.status/total at all.
  assert.equal(body.order.status, 'PAYMENT_FAILED');
  assert.equal(body.order.total, 149.9);
});

// --- Sensitive Data exposure ---

test('Sensitive Data: the login response never includes the password field', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.active01@example.com', password: 'ValidPass123!' }),
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.user.password, undefined);
  assert.ok(!JSON.stringify(body).includes('ValidPass123!'), 'the raw password must never be echoed back');
});

test('Sensitive Data: no endpoint response in a full order+notification flow ever includes a password field', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const orderRes = await createOrder(ctx.baseUrl, token, {
    items: [{ product_id: 1, quantity: 1 }],
    payment_token: 'TEST-CARD-APPROVED',
  }).then((r) => r.json());

  const productsRes = await fetch(`${ctx.baseUrl}/api/products`).then((r) => r.json());
  const notificationsRes = await fetch(`${ctx.baseUrl}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

  const combined = JSON.stringify({ orderRes, productsRes, notificationsRes });
  assert.ok(!combined.toLowerCase().includes('"password"'), 'no response may ever contain a password field');
});
