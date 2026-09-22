#!/usr/bin/env node
'use strict';

// P5.2 — AJV / JSON Schema Validation runner.
//
// WHY THIS EXISTS (compatibility gate result, evidence in
// evidence/P5-API-TESTING/P5.2-AJV-SCHEMA/EXECUTION.md):
// Postman/Newman's in-sandbox pm.test() scripts CAN call require('ajv')
// without throwing, but the module resolved there is whatever AJV
// happens to be nearest in Newman's own internal dependency chain
// (currently ajv@6.15.0, pulled in transitively via
// postman-runtime -> postman-request -> har-validator) — NOT the
// ajv@^8.20.0 this package explicitly pins as a devDependency. Pinning
// our own AJV version therefore does not control what actually runs
// inside a pm.test() script, and the sandbox has no working fs/require
// access to the canonical shared/schemas/ files (only require('<npm
// package name>') resolves; relative-path require and fs.readFileSync
// both fail there). Embedding schemas as literals inside pm.test()
// scripts was rejected for the same reason: no way to reliably keep an
// in-sandbox copy synchronized with the canonical file using a
// pinned/controlled AJV.
//
// This script instead runs the exact same collection/environment
// through Newman's Node API (real Node.js process, no sandbox), and
// validates each captured response with a real, pinned AJV instance
// that requires the canonical shared/schemas/**/*.schema.json files
// directly — single source of truth, no duplication, no drift.
//
// AJV options are explicit and intentional: strict + allErrors for
// clear diagnostics; removeAdditional / coerceTypes / useDefaults are
// deliberately NOT set — this validator only observes, it must never
// mutate the response under test.

const path = require('path');
const newman = require('newman');
const Ajv = require('ajv');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const SCHEMAS_DIR = path.join(REPO_ROOT, 'shared', 'schemas');
const COLLECTION_PATH = path.join(__dirname, '..', 'postman', 'collections', 'qa-demo-system-public.postman_collection.json');
const ENVIRONMENT_PATH = path.join(__dirname, '..', 'postman', 'environments', 'local.postman_environment.json');

const productItemSchema = require(path.join(SCHEMAS_DIR, 'products', 'product-item.schema.json'));
const healthResponseSchema = require(path.join(SCHEMAS_DIR, 'health', 'health-response.schema.json'));
const loginResponseSchema = require(path.join(SCHEMAS_DIR, 'auth', 'login-response.schema.json'));
const productsListResponseSchema = require(path.join(SCHEMAS_DIR, 'products', 'products-list-response.schema.json'));
const productDetailResponseSchema = require(path.join(SCHEMAS_DIR, 'products', 'product-detail-response.schema.json'));

const ajv = new Ajv({ strict: true, allErrors: true });
// product-item.schema.json is added once so products-list-response and
// product-detail-response can $ref it (real schema reuse, not copy/paste).
ajv.addSchema(productItemSchema);

// Request name (as defined in the collection) -> compiled validator +
// expected CURRENT headers (bkz. 07-API-TESTING/README.md — Header
// Validation Standardı: yalnızca sistemin gerçekten ürettiği header'lar
// zorunlu tutulur).
const REQUEST_CHECKS = {
  'GET /api/health': {
    validate: ajv.compile(healthResponseSchema),
    expectedContentType: 'application/json; charset=utf-8',
  },
  'POST /api/auth/login (valid, deterministic test user)': {
    validate: ajv.compile(loginResponseSchema),
    expectedContentType: 'application/json; charset=utf-8',
  },
  'GET /api/products': {
    validate: ajv.compile(productsListResponseSchema),
    expectedContentType: 'application/json; charset=utf-8',
  },
  'GET /api/products/:id (deterministic existing product)': {
    validate: ajv.compile(productDetailResponseSchema),
    expectedContentType: 'application/json; charset=utf-8',
  },
};

const results = [];

function formatAjvErrors(errors) {
  return (errors || [])
    .map((e) => `instancePath="${e.instancePath}" keyword=${e.keyword} message=${e.message}`)
    .join('; ');
}

newman
  .run({
    collection: require(COLLECTION_PATH),
    environment: require(ENVIRONMENT_PATH),
    reporters: 'cli',
  })
  .on('request', (err, args) => {
    if (err) {
      results.push({ name: args.item.name, ok: false, reason: `Newman request error: ${err.message}` });
      return;
    }

    const name = args.item.name;
    const check = REQUEST_CHECKS[name];
    if (!check) {
      return; // this request has no schema/header check defined
    }

    const contentType = args.response.headers.get('Content-Type');
    if (contentType !== check.expectedContentType) {
      results.push({
        name,
        ok: false,
        reason: `Content-Type mismatch: expected "${check.expectedContentType}", got "${contentType}"`,
      });
      return;
    }

    let body;
    try {
      body = JSON.parse(args.response.stream.toString());
    } catch (e) {
      results.push({ name, ok: false, reason: `Response body is not valid JSON: ${e.message}` });
      return;
    }

    const valid = check.validate(body);
    if (!valid) {
      results.push({ name, ok: false, reason: `Schema validation failed: ${formatAjvErrors(check.validate.errors)}` });
      return;
    }

    results.push({ name, ok: true, reason: 'schema + Content-Type PASS' });
  })
  .on('done', (err, summary) => {
    console.log('\n--- P5.2 AJV / Header Validation Results ---');
    for (const r of results) {
      console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name} — ${r.reason}`);
    }

    const missing = Object.keys(REQUEST_CHECKS).filter((name) => !results.some((r) => r.name === name));
    for (const name of missing) {
      results.push({ name, ok: false, reason: 'request did not run (not found in collection or Newman error)' });
      console.log(`FAIL  ${name} — request did not run`);
    }

    const anyFailed = results.some((r) => !r.ok);
    const newmanFailed = Boolean(err) || summary.run.failures.length > 0;

    console.log(`\nNewman functional assertions (status code, from pm.test): ${newmanFailed ? 'FAIL' : 'PASS'}`);
    console.log(`AJV schema + Content-Type validations: ${anyFailed ? 'FAIL' : 'PASS'}`);

    if (newmanFailed || anyFailed) {
      console.error('\nP5.2 schema validation run: FAIL');
      process.exitCode = 1;
      return;
    }

    console.log('\nP5.2 schema validation run: PASS');
  });
