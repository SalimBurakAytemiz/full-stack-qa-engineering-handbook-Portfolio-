const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');

test('valid login returns 200 and a token', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.active01@example.com', password: 'ValidPass123!' }),
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(body.token);
  assert.equal(body.user.email, 'test.active01@example.com');
});

test('invalid password returns 401 with generic BR-AUTH-003 message', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.active01@example.com', password: 'WrongPass999!' }),
  });
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.error, 'Email veya şifre hatalı');
});

test('unknown user returns the same generic message as invalid password', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.notregistered@example.com', password: 'AnyPass123!' }),
  });
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.error, 'Email veya şifre hatalı');
});

// --- Blocker B2: session tokens must be unpredictable and unique per
// login, not derived from user id + timestamp (Codex P4.2 review). ---

test('two logins by the same user produce different, unpredictable tokens', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const login = () =>
    fetch(`${ctx.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test.active01@example.com', password: 'ValidPass123!' }),
    }).then((r) => r.json());

  const [first, second] = await Promise.all([login(), login()]);

  assert.notEqual(first.token, second.token);
  // Not the old predictable "demo-session-<userId>-<timestamp>" shape.
  assert.doesNotMatch(first.token, /^demo-session-\d+-\d+$/);
  assert.doesNotMatch(second.token, /^demo-session-\d+-\d+$/);
});

test('a valid session token is accepted on a protected route', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const loginRes = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.active01@example.com', password: 'ValidPass123!' }),
  });
  const { token } = await loginRes.json();

  const res = await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }] }),
  });

  assert.equal(res.status, 201);
});

test('a forged/made-up token is rejected with 401 on a protected route', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  const res = await fetch(`${ctx.baseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer forged-totally-made-up-token',
    },
    body: JSON.stringify({ items: [{ product_id: 1, quantity: 1 }] }),
  });

  assert.equal(res.status, 401);
});
