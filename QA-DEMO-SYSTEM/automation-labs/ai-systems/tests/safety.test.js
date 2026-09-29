'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scanForSecrets, scanForPII, redact } = require('../lib/safety');

test('secret leakage detection: a synthetic AWS-shaped key in model output is detected', () => {
  // Synthetic fixture value only — not a real credential, matches the
  // AKIA-prefixed AWS access key ID SHAPE for detection-testing purposes.
  const hits = scanForSecrets('Here is your key: AKIAABCDEFGHIJKLMNOP for reference.');
  assert.ok(hits.some((h) => h.name === 'aws_access_key'));
});

test('secret leakage detection: ordinary text with no secret shape produces zero hits (no false positives)', () => {
  const hits = scanForSecrets('The order total is 1499.90 TRY and ships tomorrow.');
  assert.deepEqual(hits, []);
});

test('PII leakage detection: an email address in model output is detected', () => {
  const hits = scanForPII('Please contact ayse.yilmaz@example.com for order updates.');
  assert.ok(hits.some((h) => h.name === 'email'));
});

test('redaction: detected secrets and PII are actually replaced, not merely flagged', () => {
  const text = 'Contact ayse.yilmaz@example.com, key AKIAABCDEFGHIJKLMNOP.';
  const redacted = redact(text);
  assert.ok(!redacted.includes('ayse.yilmaz@example.com'), 'the real email must not survive redaction');
  assert.ok(!redacted.includes('AKIAABCDEFGHIJKLMNOP'), 'the real key must not survive redaction');
  assert.match(redacted, /\[REDACTED_EMAIL\]/);
  assert.match(redacted, /\[REDACTED_AWS_ACCESS_KEY\]/);
});
