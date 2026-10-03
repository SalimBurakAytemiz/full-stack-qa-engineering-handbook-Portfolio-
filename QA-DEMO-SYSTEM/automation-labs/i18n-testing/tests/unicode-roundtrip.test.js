'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { roundTripProductName } = require('../lib/unicode-roundtrip');

const { getDatabase } = require(path.join(__dirname, '..', '..', '..', 'backend', 'src', 'database', 'connection'));
const productsService = require(path.join(__dirname, '..', '..', '..', 'backend', 'src', 'services', 'products.service'));

test('a Turkish string with dotless-i and cedilla characters survives a real insert/select round-trip unchanged', () => {
  const db = getDatabase(':memory:');
  const result = roundTripProductName(db, 'Çağla Gömlek Boyası', productsService);
  assert.equal(result.matches, true, `expected "${result.written}", got "${result.read}"`);
});

test('a Japanese (non-Latin script) string survives a real insert/select round-trip unchanged', () => {
  const db = getDatabase(':memory:');
  const result = roundTripProductName(db, 'こんにちは製品', productsService);
  assert.equal(result.matches, true, `expected "${result.written}", got "${result.read}"`);
});

test('an emoji (characters outside the Basic Multilingual Plane, 4-byte UTF-8) survives a real insert/select round-trip unchanged', () => {
  const db = getDatabase(':memory:');
  const result = roundTripProductName(db, 'Celebration 🎉🚀 Bundle', productsService);
  assert.equal(result.matches, true, `expected "${result.written}", got "${result.read}"`);
});

test('an Arabic (right-to-left script) string survives a real insert/select round-trip unchanged', () => {
  const db = getDatabase(':memory:');
  const result = roundTripProductName(db, 'منتج تجريبي', productsService);
  assert.equal(result.matches, true, `expected "${result.written}", got "${result.read}"`);
});
