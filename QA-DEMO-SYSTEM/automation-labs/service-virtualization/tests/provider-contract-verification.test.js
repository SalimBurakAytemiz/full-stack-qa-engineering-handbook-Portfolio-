'use strict';

// Provider-side contract verification: the SAME contract the consumer
// test verified a virtualized double against (fixtures/contracts.js)
// is now verified against the REAL, running QA-DEMO-SYSTEM backend's
// ACTUAL response. This is genuine consumer-driven contract testing —
// if this file passes, the provider's real behavior is verifiably in
// agreement with the consumer's documented expectations, not just
// "looks similar." Requires a running backend at QA_DEMO_BASE_URL
// (default http://127.0.0.1:3000), same convention as the Selenium
// and privacy-testing labs.
// TR: Tüketici testinin sanallaştırılmış bir çifte karşı doğruladığı
// AYNI sözleşme, şimdi GERÇEK, çalışan QA-DEMO-SYSTEM backend'inin
// GERÇEK yanıtına karşı doğrulanır.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { productsListContract, loginSuccessContract } = require('../fixtures/contracts');

const BASE_URL = process.env.QA_DEMO_BASE_URL || 'http://127.0.0.1:3000';
const TEST_EMAIL = 'test.active01@example.com';
const TEST_PASSWORD = 'ValidPass123!';

test('provider verification: the real GET /api/products response satisfies the SAME contract the consumer test verified', async () => {
  const res = await fetch(`${BASE_URL}/api/products`);
  assert.equal(res.status, 200);
  const body = await res.json();
  const result = productsListContract.verify(body);
  assert.equal(result.valid, true, `real provider response violates the consumer contract: ${JSON.stringify(result.errors)}`);
});

test('provider verification: the real POST /api/auth/login response satisfies the SAME contract the consumer test verified', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  const result = loginSuccessContract.verify(body);
  assert.equal(result.valid, true, `real provider response violates the consumer contract: ${JSON.stringify(result.errors)}`);
});
