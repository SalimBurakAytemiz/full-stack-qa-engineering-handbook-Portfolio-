'use strict';

// Real-backend integration test — scans ACTUAL responses from the
// real QA-DEMO-SYSTEM API (not a fixture) for accidental sensitive-field
// or PII leakage. Requires a running backend at QA_DEMO_BASE_URL
// (default http://127.0.0.1:3000), same convention as the Selenium
// lab. This file is intentionally excluded from `privacy:test:unit`
// (which needs no server) and is run instead by run-privacy-lab.js,
// which checks server reachability first and reports an honest
// NOT_EXECUTED status if no server is available, rather than crashing
// or silently skipping.
// TR: GERÇEK QA-DEMO-SYSTEM API'sinden GERÇEK yanıtları tarar (fixture
// değil) — beklenmeyen hassas alan/PII sızıntısı için. Çalışan bir
// backend gerektirir (QA_DEMO_BASE_URL, varsayılan
// http://127.0.0.1:3000), Selenium lab'ı ile aynı kural.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scanForLeakage } = require('../lib/pii-response-scanner');

const BASE_URL = process.env.QA_DEMO_BASE_URL || 'http://127.0.0.1:3000';
// Real seeded credentials — shared/test-data/auth-users.json.
const TEST_EMAIL = 'test.active01@example.com';
const TEST_PASSWORD = 'ValidPass123!';

test('privacy scan: the real login response leaks no unexpected sensitive field or PII (token/email are the only, expected exceptions)', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();

  // Explicit, direct assertion beyond the heuristic scanner: the real
  // response shape (backend/src/services/auth.service.js) returns only
  // { id, email } for `user` — never the password itself.
  assert.equal(Object.prototype.hasOwnProperty.call(body.user, 'password'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(body.user, 'password_hash'), false);

  const findings = scanForLeakage(body, { expectedSensitiveKeys: ['token'], allowedPiiKeys: ['email'] });
  assert.deepEqual(findings, [], `login response must not leak any unexpected sensitive field or PII: ${JSON.stringify(findings)}`);
});

test('privacy scan: the real public products listing leaks no sensitive field or unexpected PII', async () => {
  const res = await fetch(`${BASE_URL}/api/products`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.products) && body.products.length > 0, 'the real seeded product catalog must be non-empty for this scan to mean anything');

  const findings = scanForLeakage(body);
  assert.deepEqual(findings, [], `public products response must not leak anything: ${JSON.stringify(findings)}`);
});

test('privacy scan: the real authenticated notifications response for one user leaks no sensitive field or unexpected PII', async () => {
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  const { token } = await loginRes.json();

  const res = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.notifications), 'notifications response must be the real array shape');

  const findings = scanForLeakage(body);
  assert.deepEqual(findings, [], `authenticated notifications response must not leak anything: ${JSON.stringify(findings)}`);
});
