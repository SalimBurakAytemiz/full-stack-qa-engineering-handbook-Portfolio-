'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scanForLeakage } = require('../lib/pii-response-scanner');

test('pii scanner: a sensitive field with a real value is detected', () => {
  const findings = scanForLeakage({ user: { id: 1, password_hash: '$2b$10$abc...' } });
  assert.ok(findings.some((f) => f.key === 'password_hash' && f.reason === 'sensitive_field_present'));
});

test('pii scanner: ordinary data with no sensitive keys and no PII-shaped values produces zero findings (no false positives)', () => {
  const findings = scanForLeakage({ product: { id: 1, name: 'QA Demo Klavye', price: 499.9, stock_quantity: 12 } });
  assert.deepEqual(findings, []);
});

test('pii scanner: a sensitive key present but null is NOT flagged (structurally present, not actually leaking a value)', () => {
  const findings = scanForLeakage({ user: { id: 1, password_hash: null, token: undefined } });
  assert.deepEqual(findings, []);
});

test('pii scanner: an expected sensitive key for this endpoint (e.g. a login response returning "token") is suppressed', () => {
  const findings = scanForLeakage(
    { token: 'demo-session-abc123', user: { id: 1, email: 'ayse@example.com' } },
    { expectedSensitiveKeys: ['token'], allowedPiiKeys: ['email'] },
  );
  assert.deepEqual(findings, []);
});

test('pii scanner: a sensitive key NOT declared as expected for this endpoint is still flagged, even alongside an expected one', () => {
  const findings = scanForLeakage(
    { token: 'demo-session-abc123', user: { id: 1, password_hash: 'leaked!' } },
    { expectedSensitiveKeys: ['token'] },
  );
  assert.equal(findings.length, 1);
  assert.equal(findings[0].key, 'password_hash');
});

test('pii scanner: leakage found deep inside a nested array of objects is still detected (real recursive traversal, not a shallow scan)', () => {
  const findings = scanForLeakage({
    orders: [
      { id: 1, total: 100 },
      { id: 2, total: 200, customer: { name: 'Zeynep', notes: 'contact at zeynep.demo@example.com please' } },
    ],
  });
  assert.ok(findings.some((f) => f.path === 'orders[1].customer.notes' && f.reason === 'unexpected_pii_email'));
});

test('pii scanner: a PII-shaped value under an allowlisted key is not flagged, but the SAME shape under an unexpected key is', () => {
  const findings = scanForLeakage(
    { profile: { email: 'ayse@example.com', bio: 'reach me at ayse.personal@example.com instead' } },
    { allowedPiiKeys: ['email'] },
  );
  assert.equal(findings.length, 1);
  assert.equal(findings[0].key, 'bio');
});
