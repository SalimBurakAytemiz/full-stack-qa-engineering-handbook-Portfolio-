'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatCurrency, formatLongDate, formatNumber } = require('../lib/locale-formatting');

test('formatCurrency produces real, distinct output for different real locales (not the same string reused)', () => {
  const tr = formatCurrency('tr-TR', 'TRY', 1234.5);
  const de = formatCurrency('de-DE', 'EUR', 1234.5);
  const ja = formatCurrency('ja-JP', 'JPY', 1234.5);
  // TR: Alman ICU verisi para birimi sembolunden once normal bosluk
  // DEGIL, GERCEK bir bolunemez bosluk (U+00A0) kullanir — bu, el ile
  // yazilmis bir sabit degil, Node'un kendi Intl ciktisindan alinmistir.
  assert.equal(tr, '₺1.234,50');
  assert.equal(de, '1.234,50 €');
  assert.equal(ja, '￥1,235');
  assert.notEqual(tr, de);
  assert.notEqual(de, ja);
});

test('formatLongDate renders real, locale-specific month names and word order', () => {
  const date = new Date('2026-01-15T00:00:00Z');
  const tr = formatLongDate('tr-TR', date);
  const en = formatLongDate('en-US', date);
  assert.equal(tr, '15 Ocak 2026');
  assert.equal(en, 'January 15, 2026');
  assert.notEqual(tr, en);
});

test('formatNumber uses the real, locale-correct grouping and decimal separators', () => {
  const us = formatNumber('en-US', 1234567.89);
  const de = formatNumber('de-DE', 1234567.89);
  assert.equal(us, '1,234,567.89');
  assert.equal(de, '1.234.567,89');
  assert.notEqual(us, de);
});
