#!/usr/bin/env node
'use strict';

// P5.2 — Schema negative/positive proof runner.
//
// Proves the real, pinned AJV instance (same devDependency/options as
// scripts/run-schema-validation.js) correctly ACCEPTS valid payloads and
// REJECTS malformed ones against the canonical shared/schemas/ files.
// This does not call the running QA Demo System and does not modify
// application code or production responses — it only feeds literal,
// intentionally-crafted fixtures to the compiled validators.
//
// Every case is registered in the CASES array below and printed
// individually, so the total proof count is always exactly
// CASES.length — no manual counting, no drift between this script's
// output and what evidence docs report (see P5.2 Codex review B2).

const path = require('path');
const Ajv = require('ajv');

const SCHEMAS_DIR = path.join(__dirname, '..', '..', '..', 'shared', 'schemas');

const productItemSchema = require(path.join(SCHEMAS_DIR, 'products', 'product-item.schema.json'));
const healthResponseSchema = require(path.join(SCHEMAS_DIR, 'health', 'health-response.schema.json'));
const loginResponseSchema = require(path.join(SCHEMAS_DIR, 'auth', 'login-response.schema.json'));
const productsListResponseSchema = require(path.join(SCHEMAS_DIR, 'products', 'products-list-response.schema.json'));
const productDetailResponseSchema = require(path.join(SCHEMAS_DIR, 'products', 'product-detail-response.schema.json'));
const errorResponseSchema = require(path.join(SCHEMAS_DIR, 'common', 'error-response.schema.json'));

const ajv = new Ajv({ strict: true, allErrors: true });
ajv.addSchema(productItemSchema);

const validateHealth = ajv.compile(healthResponseSchema);
const validateLogin = ajv.compile(loginResponseSchema);
const validateList = ajv.compile(productsListResponseSchema);
const validateDetail = ajv.compile(productDetailResponseSchema);
const validateError = ajv.compile(errorResponseSchema);

// Each case: { category, label, validate, payload, expectValid }
const CASES = [
  // --- HEALTH ---
  { category: 'HEALTH', label: 'valid response ({status:"ok"})', validate: validateHealth, payload: { status: 'ok' }, expectValid: true },
  { category: 'HEALTH', label: 'missing required (status)', validate: validateHealth, payload: {}, expectValid: false },
  { category: 'HEALTH', label: 'wrong type (status: number)', validate: validateHealth, payload: { status: 123 }, expectValid: false },
  { category: 'HEALTH', label: 'wrong value, same type (status: "degraded")', validate: validateHealth, payload: { status: 'degraded' }, expectValid: false },
  { category: 'HEALTH', label: 'null (status: null)', validate: validateHealth, payload: { status: null }, expectValid: false },

  // --- AUTH LOGIN ---
  { category: 'AUTH', label: 'valid response', validate: validateLogin, payload: { token: 'demo-session-abc', user: { id: 1, email: 'test.active01@example.com' } }, expectValid: true },
  { category: 'AUTH', label: 'wrong type (token: number)', validate: validateLogin, payload: { token: 123, user: { id: 1, email: 'x@example.com' } }, expectValid: false },
  { category: 'AUTH', label: 'missing required (token)', validate: validateLogin, payload: { user: { id: 1, email: 'x@example.com' } }, expectValid: false },
  { category: 'AUTH', label: 'null (token: null)', validate: validateLogin, payload: { token: null, user: { id: 1, email: 'x@example.com' } }, expectValid: false },
  { category: 'AUTH', label: 'empty string (token: "")', validate: validateLogin, payload: { token: '', user: { id: 1, email: 'x@example.com' } }, expectValid: false },

  // --- PRODUCTS ---
  { category: 'PRODUCTS', label: 'valid list', validate: validateList, payload: { products: [{ id: 1, name: 'x', price: 1.5, stock_quantity: 1, in_stock: true }] }, expectValid: true },
  { category: 'PRODUCTS', label: 'valid detail', validate: validateDetail, payload: { product: { id: 1, name: 'x', price: 1.5, stock_quantity: 1, in_stock: true } }, expectValid: true },
  { category: 'PRODUCTS', label: 'invalid item type (id as string)', validate: validateList, payload: { products: [{ id: '1', name: 'x', price: 1.5, stock_quantity: 1, in_stock: true }] }, expectValid: false },
  { category: 'PRODUCTS', label: 'null forbidden (stock_quantity: null)', validate: validateDetail, payload: { product: { id: 1, name: 'x', price: 1.5, stock_quantity: null, in_stock: true } }, expectValid: false },
  { category: 'PRODUCTS', label: 'unexpected additional property', validate: validateDetail, payload: { product: { id: 1, name: 'x', price: 1.5, stock_quantity: 1, in_stock: true, extra: 'nope' } }, expectValid: false },
  { category: 'PRODUCTS', label: 'missing required (name)', validate: validateDetail, payload: { product: { id: 1, price: 1.5, stock_quantity: 1, in_stock: true } }, expectValid: false },

  // --- COMMON ERROR (real captured 400/401/404 bodies) ---
  { category: 'ERROR', label: 'real 400 body (POST /api/auth/login, missing password)', validate: validateError, payload: { error: 'Email ve şifre zorunludur.' }, expectValid: true },
  { category: 'ERROR', label: 'real 401 body (POST /api/auth/login, wrong password)', validate: validateError, payload: { error: 'Email veya şifre hatalı' }, expectValid: true },
  { category: 'ERROR', label: 'real 404 body (GET /api/products/9999)', validate: validateError, payload: { error: 'Ürün bulunamadı' }, expectValid: true },
];

let passCount = 0;
let failCount = 0;

console.log(`Total registered cases: ${CASES.length}\n`);

for (const c of CASES) {
  const valid = c.validate(c.payload);
  const ok = valid === c.expectValid;
  ok ? passCount++ : failCount++;
  const status = ok ? 'PROOF-OK' : 'PROOF-BROKEN';
  console.log(`[${status}] [${c.category}] ${c.label} -> valid=${valid} (expected ${c.expectValid})`);
  if (!valid && c.validate.errors) {
    console.log('    errors: ' + JSON.stringify(c.validate.errors));
  }
}

console.log(`\n--- Summary ---`);
console.log(`Total cases: ${CASES.length}`);
console.log(`PROOF-OK: ${passCount}`);
console.log(`PROOF-BROKEN: ${failCount}`);

if (failCount > 0) {
  console.error('\nSchema negative/positive proof run: FAIL — a validator behaved unexpectedly.');
  process.exitCode = 1;
} else {
  console.log('\nSchema negative/positive proof run: PASS');
}
