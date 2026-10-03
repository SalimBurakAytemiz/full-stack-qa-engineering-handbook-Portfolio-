#!/usr/bin/env node
'use strict';

// Real i18n lab: exercises Node's real Intl API across several real
// locales, and proves a real Unicode round-trip through the backend's
// real in-memory SQLite db and real service functions — never a
// hand-written fixture pretending to be formatted or stored text.
// TR: Gercek bir i18n laboratuvari: Node'un GERCEK Intl API'sini birkac
// gercek locale uzerinde calistirir ve backend'in GERCEK bellek-ici
// SQLite veritabani ile GERCEK bir Unicode gidis-donusunu kanitlar.

const path = require('node:path');
const { formatCurrency, formatLongDate, formatNumber } = require('./lib/locale-formatting');
const { roundTripProductName } = require('./lib/unicode-roundtrip');

const { getDatabase } = require(path.join(__dirname, '..', '..', 'backend', 'src', 'database', 'connection'));
const productsService = require(path.join(__dirname, '..', '..', 'backend', 'src', 'services', 'products.service'));

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('I18N_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

function main() {
  const checks = [];

  // 1. Real locale-distinct currency formatting.
  const trCurrency = formatCurrency('tr-TR', 'TRY', 1234.5);
  const deCurrency = formatCurrency('de-DE', 'EUR', 1234.5);
  checks.push({
    name: 'currency formatting genuinely differs between tr-TR and de-DE (not the same string reused)',
    pass: trCurrency !== deCurrency,
    detail: `tr-TR=${JSON.stringify(trCurrency)}, de-DE=${JSON.stringify(deCurrency)}`,
  });

  // 2. Real locale-distinct date formatting.
  const date = new Date('2026-01-15T00:00:00Z');
  const trDate = formatLongDate('tr-TR', date);
  const enDate = formatLongDate('en-US', date);
  checks.push({
    name: 'long-date formatting genuinely differs between tr-TR and en-US (real month names, real word order)',
    pass: trDate !== enDate,
    detail: `tr-TR=${JSON.stringify(trDate)}, en-US=${JSON.stringify(enDate)}`,
  });

  // 3. Real locale-distinct number grouping.
  const usNumber = formatNumber('en-US', 1234567.89);
  const deNumber = formatNumber('de-DE', 1234567.89);
  checks.push({
    name: 'number grouping/decimal separators genuinely differ between en-US and de-DE',
    pass: usNumber !== deNumber,
    detail: `en-US=${JSON.stringify(usNumber)}, de-DE=${JSON.stringify(deNumber)}`,
  });

  // 4. Real Unicode round-trip through the real backend db + service layer.
  const db = getDatabase(':memory:');
  const samples = [
    { label: 'Turkish', value: 'Çağla Gömlek Boyası' },
    { label: 'Japanese', value: 'こんにちは製品' },
    { label: 'emoji (non-BMP, 4-byte UTF-8)', value: 'Celebration 🎉🚀 Bundle' },
    { label: 'Arabic (RTL)', value: 'منتج تجريبي' },
  ];
  for (const sample of samples) {
    const result = roundTripProductName(db, sample.value, productsService);
    checks.push({
      name: `${sample.label} string survives a real insert/select round-trip through the real products table unchanged`,
      pass: result.matches,
      detail: `written=${JSON.stringify(result.written)}, read=${JSON.stringify(result.read)}`,
    });
  }

  console.log('--- i18n Lab: real scenario results ---');
  for (const c of checks) {
    console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.name} (${c.detail})`);
  }

  const allPassed = checks.every((c) => c.pass);
  if (!allPassed) {
    console.log('\nI18N_LAB_STATUS: FAILED');
    reportOutcome(1);
    return;
  }
  console.log('\nI18N_LAB_STATUS: EXECUTED');
  reportOutcome(0);
}

main();
