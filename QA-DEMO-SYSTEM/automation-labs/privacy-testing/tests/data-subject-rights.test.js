'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDataStore } = require('../lib/data-subject-rights-simulator');

function seed() {
  return [
    {
      id: 1,
      name: 'Ayşe Yılmaz',
      email: 'ayse.yilmaz@example.com',
      phone: '05551234567',
      consent: { marketing: true, analytics: false },
      orders: [{ id: 101, total: 249.9 }, { id: 102, total: 89.0 }],
      notifications: [{ id: 1, message: 'Siparişiniz kargoya verildi' }],
    },
    {
      id: 2,
      name: 'Mehmet Demir',
      email: 'mehmet.demir@example.com',
      phone: '05559876543',
      consent: { marketing: false, analytics: true },
      orders: [],
      notifications: [],
    },
  ];
}

test('data subject rights: export returns the complete real record for the requesting user', () => {
  const store = createDataStore(seed());
  const record = store.exportUserData(1);
  assert.equal(record.name, 'Ayşe Yılmaz');
  assert.equal(record.email, 'ayse.yilmaz@example.com');
  assert.equal(record.orders.length, 2);
});

test('data subject rights: export for a user that does not exist returns null, not a fabricated empty record', () => {
  const store = createDataStore(seed());
  assert.equal(store.exportUserData(999), null);
});

test('data subject rights: erasure actually removes the data — a post-erasure export finds nothing, not a stale record', () => {
  const store = createDataStore(seed());
  const erased = store.eraseUserData(1);
  assert.equal(erased, true);
  assert.equal(store.exportUserData(1), null, 'erasure must be real, not merely flagged — the record must be genuinely gone');
});

test('data subject rights: erasing a user that does not exist returns false, not a silent success', () => {
  const store = createDataStore(seed());
  assert.equal(store.eraseUserData(999), false);
});

test('data subject rights: anonymization scrambles PII fields but preserves non-identifying aggregate data (order totals)', () => {
  const store = createDataStore(seed());
  const ok = store.anonymizeUserData(1);
  assert.equal(ok, true);
  const record = store.exportUserData(1);
  assert.equal(record.name, 'REDACTED');
  assert.notEqual(record.email, 'ayse.yilmaz@example.com');
  assert.equal(record.phone, null);
  assert.equal(record.notifications.length, 0, 'notification content is identifying and must not survive anonymization');
  assert.deepEqual(record.orders, [{ id: 101, total: 249.9 }, { id: 102, total: 89.0 }], 'order totals are non-identifying aggregate data and must survive anonymization for legitimate analytics use');
});

test('data subject rights: consent is enforced both ways — granted purposes allowed, ungranted purposes blocked', () => {
  const store = createDataStore(seed());
  assert.equal(store.hasConsent(1, 'marketing'), true);
  assert.equal(store.hasConsent(1, 'analytics'), false);
  assert.equal(store.hasConsent(2, 'marketing'), false);
  assert.equal(store.hasConsent(2, 'analytics'), true);
});

test('data subject rights: consent check for a nonexistent user is false, never a permissive default', () => {
  const store = createDataStore(seed());
  assert.equal(store.hasConsent(999, 'marketing'), false);
});
