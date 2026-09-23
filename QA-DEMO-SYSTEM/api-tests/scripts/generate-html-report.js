#!/usr/bin/env node
'use strict';

// P5.8 — Newman HTML reporting runner.
//
// Wraps newman.run() (Node API, same library already used for the AJV
// wrapper scripts — see run-schema-validation.js) with the htmlextra
// reporter to generate a browser-openable HTML report per suite. This adds
// reporting only: no collection, assertion, or request-order changes. Exit
// code always mirrors Newman's own PASS=0/FAIL=non-zero semantics —
// "a report file was generated" is never treated as "the test passed".
//
// P5.7 (scripts/run-api-db-validation.js) is a standalone Node/SQLite
// script, not a Newman collection, and is intentionally out of scope here.

const path = require('path');
const { execFileSync } = require('child_process');
const newman = require('newman');

const API_TESTS_DIR = path.join(__dirname, '..');
const COLLECTIONS_DIR = path.join(API_TESTS_DIR, 'postman', 'collections');
const ENVIRONMENT_PATH = path.join(API_TESTS_DIR, 'postman', 'environments', 'local.postman_environment.json');
const REPORTS_DIR = path.join(API_TESTS_DIR, 'reports');
const BACKEND_DIR = path.join(API_TESTS_DIR, '..', 'backend');

// The reset step used to shell out to "npm run db:seed". On Windows, npm's
// real binary is a .cmd shim, and Node's own child_process (fixed for
// CVE-2024-27980) refuses to launch a .bat/.cmd file via execFileSync
// without shell:true — so neither plain "npm" nor "npm.cmd" is a reliable,
// shell-free cross-platform launch target. db:seed's own script
// (backend/package.json) is just "node src/database/seed.js" with no shell
// features (no &&, no globbing, no env expansion), so npm is skipped
// entirely: this runs the same Node binary that is already executing this
// script (process.execPath — never hardcoded, resolved by Node itself)
// directly against the resolved seed script path. No .cmd/.bat file is
// ever launched, so there is nothing for shell:true to work around.
const RESET_SCRIPT_PATH = path.join(BACKEND_DIR, 'src', 'database', 'seed.js');

// Redact the Authorization header (real session/JWT token) from every
// generated report by default. Request/response BODIES are otherwise left
// untouched — synthetic payment tokens (TEST-CARD-APPROVED/DECLINED/
// TIMEOUT) and deterministic test-user identifiers must stay visible so a
// reader can see the suite genuinely used synthetic, non-production data.
const SKIP_HEADERS = 'Authorization';

// POST /api/auth/login's response BODY (not just its headers) contains the
// real runtime session token (`demo-session-<uuid>`, see
// backend/src/services/auth.service.js), and its REQUEST body contains the
// deterministic synthetic test password in plaintext (e.g. "ValidPass123!",
// see the collections' own login request bodies). skipHeaders only strips
// header rows, so each suite's login/bootstrap request AND response bodies
// are hidden here by exact request name (case-insensitive match against
// item.name) — the only bodies hidden are the login/bootstrap ones; every
// other request/response body stays visible for debugging.
const LOGIN_REQUEST_NAMES = {
  public: ['POST /api/auth/login (valid, deterministic test user)'],
  auth: ['Login as User A (test.active01)', 'Login as User B (test.active02)'],
  products: [],
  orders: ['Login as User A (test.active01)'],
  notifications: ['Login as User A (test.active01)', 'Login as User B (test.active02)'],
};

const SUITES = {
  public: {
    collectionFile: 'qa-demo-system-public.postman_collection.json',
    title: 'QA Demo System - Public API Report',
    browserTitle: 'Public API Report',
    outputFile: 'public-api-report.html',
    requiresReset: false,
  },
  auth: {
    collectionFile: 'qa-demo-system-protected.postman_collection.json',
    title: 'QA Demo System - Auth & Authorization API Report',
    browserTitle: 'Auth API Report',
    outputFile: 'auth-api-report.html',
    requiresReset: false,
  },
  products: {
    collectionFile: 'qa-demo-system-public.postman_collection.json',
    folder: 'Products',
    title: 'QA Demo System - Products API Report',
    browserTitle: 'Products API Report',
    outputFile: 'products-api-report.html',
    requiresReset: false,
  },
  orders: {
    collectionFile: 'qa-demo-system-orders-payment.postman_collection.json',
    title: 'QA Demo System - Orders & Payment API Report',
    browserTitle: 'Orders & Payment API Report',
    outputFile: 'orders-payment-api-report.html',
    requiresReset: true,
  },
  notifications: {
    collectionFile: 'qa-demo-system-notifications.postman_collection.json',
    title: 'QA Demo System - Notifications API Report',
    browserTitle: 'Notifications API Report',
    outputFile: 'notifications-api-report.html',
    requiresReset: true,
  },
};

function resetDatabase() {
  console.log('\n[reset] node src/database/seed.js (backend)');
  execFileSync(process.execPath, [RESET_SCRIPT_PATH], { cwd: BACKEND_DIR, stdio: 'inherit' });
}

function runSuite(key) {
  const config = SUITES[key];
  if (!config) {
    throw new Error(`Unknown suite "${key}". Valid: ${Object.keys(SUITES).join(', ')}`);
  }

  if (config.requiresReset) {
    resetDatabase();
  }

  const collectionPath = path.join(COLLECTIONS_DIR, config.collectionFile);
  const outputPath = path.join(REPORTS_DIR, config.outputFile);
  const loginRequestNames = LOGIN_REQUEST_NAMES[key];

  const runOptions = {
    collection: require(collectionPath),
    environment: require(ENVIRONMENT_PATH),
    reporters: ['cli', 'htmlextra'],
    reporter: {
      htmlextra: {
        export: outputPath,
        title: config.title,
        browserTitle: config.browserTitle,
        skipHeaders: SKIP_HEADERS,
        hideRequestBody: loginRequestNames,
        hideResponseBody: loginRequestNames,
      },
    },
  };
  if (config.folder) {
    runOptions.folder = config.folder;
  }

  return new Promise((resolve) => {
    newman.run(runOptions, (err, summary) => {
      const failed = Boolean(err) || summary.run.failures.length > 0;
      if (err) {
        console.error(`[${key}] Newman run error: ${err.message}`);
      }
      console.log(`\n[${key}] report written to ${path.relative(process.cwd(), outputPath)}`);
      console.log(`[${key}] result: ${failed ? 'FAIL' : 'PASS'}`);
      resolve({ key, failed });
    });
  });
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error(`Usage: node generate-html-report.js <${Object.keys(SUITES).join('|')}|all>`);
    process.exitCode = 1;
    return;
  }

  const keys = target === 'all' ? Object.keys(SUITES) : [target];
  const results = [];

  for (const key of keys) {
    // Sequential, not parallel: stateful suites (orders/notifications) each
    // reset the DB immediately before they run, so overlapping runs would
    // corrupt each other's before/after stock assertions.
    // eslint-disable-next-line no-await-in-loop
    const result = await runSuite(key);
    results.push(result);
  }

  console.log('\n--- P5.8 HTML Report Run Summary ---');
  for (const r of results) {
    console.log(`${r.failed ? 'FAIL' : 'PASS'}  ${r.key}`);
  }

  const anyFailed = results.some((r) => r.failed);
  process.exitCode = anyFailed ? 1 : 0;
}

main();
