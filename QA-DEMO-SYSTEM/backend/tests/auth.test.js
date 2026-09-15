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
