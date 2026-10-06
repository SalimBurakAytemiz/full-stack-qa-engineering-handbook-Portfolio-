'use strict';

// Real-backend fuzz testing — sends genuinely malformed/hostile HTTP
// request bodies to the ACTUAL running QA-DEMO-SYSTEM API and asserts
// the one invariant that matters most for input-validation fuzzing:
// the server must NEVER crash into an unhandled state (a raw 500 with
// no body, a hung connection, a dropped socket) — every response must
// be a well-formed JSON object with a real HTTP status, even for the
// most hostile input this file constructs. Requires a running backend
// at QA_DEMO_BASE_URL (default http://127.0.0.1:3000), same convention
// as the Selenium and privacy-testing labs.
// TR: Gerçek, çalışan QA-DEMO-SYSTEM API'sine gerçekten bozuk/düşman
// HTTP istek gövdeleri gönderir ve tek, en önemli değişmezi
// (invariant) doğrular: sunucu ASLA işlenmemiş bir duruma çökmemelidir
// — her yanıt gerçek bir HTTP status koduyla birlikte iyi biçimlendirilmiş
// bir JSON nesnesi olmalıdır.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MALFORMED_JSON_BODIES, loginFuzzBodies, ordersFuzzBodies } = require('../lib/fuzz-generators');

const BASE_URL = process.env.QA_DEMO_BASE_URL || 'http://127.0.0.1:3000';
const TEST_EMAIL = 'test.active01@example.com';
const TEST_PASSWORD = 'ValidPass123!';

async function assertNeverCrashes(res) {
  assert.ok(res.status < 500 || res.status === 500, 'must receive a real HTTP response, not a dropped connection');
  assert.notEqual(res.status, undefined);
  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    assert.fail(`response body must always be valid JSON, even for hostile input — got: ${text.slice(0, 200)}`);
  }
  if (res.status >= 400) {
    assert.equal(typeof parsed.error, 'string', `every error response must carry a real, non-empty error string — got: ${JSON.stringify(parsed)}`);
  }
  // The one truly disqualifying outcome: a genuine 500 means either an
  // unhandled exception reached errorHandler.js (still graceful, but a
  // real input-validation gap worth knowing about) or worse. None of
  // this file's deliberately-invalid inputs should ever reach that —
  // every one of them should be caught by real, existing validation
  // and rejected with 400/401, not fall through to a 500.
  assert.notEqual(res.status, 500, `hostile input must be rejected by real validation (400/401), never fall through to a 500: ${JSON.stringify(parsed)}`);
}

test('fuzz: malformed (not even valid) JSON bodies are always rejected with 400 and a real JSON error, never a 500', async () => {
  for (const rawBody of MALFORMED_JSON_BODIES) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: rawBody,
    });
    await assertNeverCrashes(res);
    assert.equal(res.status, 400, `malformed JSON body ${JSON.stringify(rawBody)} must be a 400, got ${res.status}`);
  }
});

test('fuzz: hostile-but-valid-JSON login payloads never crash the server (400/401/413 only)', async () => {
  for (const body of loginFuzzBodies()) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    await assertNeverCrashes(res);
    // 413 is the real, correct outcome for an oversized body (e.g. the
    // 200,000-character hostile string value) — see the errorHandler.js
    // fix this exact fuzz run found and drove (entity.too.large was
    // previously falling through to a raw 500; see COMMON-MISTAKES.md).
    assert.ok([400, 401, 413].includes(res.status), `hostile login body ${JSON.stringify(body).slice(0, 100)} got unexpected status ${res.status}`);
  }
});

test('fuzz: hostile orders payloads (against a real, valid session) are always rejected by real validation, never crash the server', async () => {
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  assert.equal(loginRes.status, 200, 'fuzz test setup requires a real, valid login to obtain a session token');
  const { token } = await loginRes.json();

  for (const body of ordersFuzzBodies()) {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    await assertNeverCrashes(res);
    // 413 for the oversized payment_token value — same real,
    // errorHandler.js-level fix as the login case above.
    assert.ok([400, 413].includes(res.status), `hostile orders body ${JSON.stringify(body).slice(0, 100)} must be a 400 (or 413 if oversized), got ${res.status}`);
  }
});

test('fuzz: the server is still healthy and responsive after every hostile request in this file — no crash, no hang, no resource leak strong enough to break health', async () => {
  const res = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
});
