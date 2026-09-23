#!/usr/bin/env node
'use strict';

// P5.5 fix round (Codex delta review, blocker B4) — AJV / JSON Schema
// Validation runner for the Orders & Payment collection.
//
// Reuses the exact P5.2 canonical model (see scripts/run-schema-validation.js
// for the full compatibility-gate rationale — Newman's in-sandbox pm.test()
// cannot reliably resolve a pinned AJV or read shared/schemas/ files, so
// schema validation runs here instead, through Newman's Node API against a
// real, pinned AJV instance reading the canonical schema files directly).
//
// Scope (Codex B4 minimum): a successful order-create response (PAID),
// plus the declined/timeout order-create responses (same schema, different
// enum value — proves the enum is real, not just the happy path), and
// representative error responses across the distinct error status codes
// this collection produces (400 validation error, 409 insufficient stock,
// 401 unauthenticated) — proving shared/schemas/common/error-response.schema.json
// genuinely holds across all of them (the order/error contract does not
// differ per status code here, so no separate order-error schema was
// created — see shared/schemas/orders/order-create-response.schema.json's
// description and P5.5 EXECUTION.md section 9 for the reuse decision).

const path = require('path');
const newman = require('newman');
const Ajv = require('ajv');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const SCHEMAS_DIR = path.join(REPO_ROOT, 'shared', 'schemas');
const COLLECTION_PATH = path.join(__dirname, '..', 'postman', 'collections', 'qa-demo-system-orders-payment.postman_collection.json');
const ENVIRONMENT_PATH = path.join(__dirname, '..', 'postman', 'environments', 'local.postman_environment.json');

const orderCreateResponseSchema = require(path.join(SCHEMAS_DIR, 'orders', 'order-create-response.schema.json'));
const errorResponseSchema = require(path.join(SCHEMAS_DIR, 'common', 'error-response.schema.json'));

const ajv = new Ajv({ strict: true, allErrors: true });

// Request name (as defined in the collection, leaf item.name only — Newman's
// 'request' event does not carry the folder path) -> compiled validator +
// expected Content-Type.
const REQUEST_CHECKS = {
  'Approved payment — order PAID, stock decreases': {
    validate: ajv.compile(orderCreateResponseSchema),
    expectedContentType: 'application/json; charset=utf-8',
  },
  'Declined payment — order created but PAYMENT_FAILED, stock NOT decremented': {
    validate: ajv.compile(orderCreateResponseSchema),
    expectedContentType: 'application/json; charset=utf-8',
  },
  'Timeout payment — order created but PAYMENT_TIMEOUT, stock NOT decremented': {
    validate: ajv.compile(orderCreateResponseSchema),
    expectedContentType: 'application/json; charset=utf-8',
  },
  'Invalid quantity — zero (0)': {
    validate: ajv.compile(errorResponseSchema),
    expectedContentType: 'application/json; charset=utf-8',
  },
  'Insufficient stock — single line exceeds available (qty=6 > 5) -> 409': {
    validate: ajv.compile(errorResponseSchema),
    expectedContentType: 'application/json; charset=utf-8',
  },
  'No token -> 401 (representative gate; full auth matrix already in P5.3)': {
    validate: ajv.compile(errorResponseSchema),
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
    console.log('\n--- P5.5 AJV / Header Validation Results (Orders & Payment) ---');
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
      console.error('\nP5.5 schema validation run: FAIL');
      process.exitCode = 1;
      return;
    }

    console.log('\nP5.5 schema validation run: PASS');
  });
