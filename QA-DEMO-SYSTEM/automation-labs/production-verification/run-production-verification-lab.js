#!/usr/bin/env node
'use strict';

// Real production-verification lab: a synthetic-monitoring/smoke-test
// runner that makes real HTTP requests against a real running backend
// (health, auth login, products list), times each against a disclosed
// latency budget, retries transient failures, and prints an explicit
// GO / GO_DEGRADED / NO_GO verdict. Needs a running backend at
// QA_DEMO_BASE_URL; if none is reachable, this is honestly reported as
// NOT_EXECUTED — never silently skipped, never a faked pass. Same
// honest-degraded-mode pattern as this repository's other labs that
// need a real running server (e.g. property-and-fuzz-testing).
// TR: Gercek bir production-verification laboratuvari: GERCEK calisan
// bir backend'e karsi gercek HTTP istekleri yapan bir sentetik-izleme
// calistiricisi. Sunucu erisilemezse NOT_EXECUTED olarak dürüstçe
// raporlanır — asla sessizce atlanmaz, asla sahte bir PASS üretilmez.

const path = require('node:path');
const { timedCheck, overallVerdict, retry } = require('./lib/synthetic-monitor');
const { checkHealth, checkAuthLogin, checkProductsList } = require('./lib/smoke-checks');

const BASE_URL = process.env.QA_DEMO_BASE_URL || 'http://127.0.0.1:3000';
const AUTH_USERS = require(path.join(__dirname, '..', '..', '..', 'shared', 'test-data', 'auth-users.json'));

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  if (explicitOutcomeReported) return;
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('PRODUCTION_VERIFICATION_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

async function isServerReachable() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`--- Production Verification Lab: real synthetic checks against ${BASE_URL} ---`);

  if (!(await isServerReachable())) {
    console.log(`No backend reachable at ${BASE_URL} — this part of the lab is honestly NOT_EXECUTED, not skipped.`);
    console.log('\nPRODUCTION_VERIFICATION_LAB_STATUS: NOT_EXECUTED');
    reportOutcome(0);
    return;
  }

  const user = AUTH_USERS[0];
  const results = [];
  results.push(await timedCheck('health check', () => retry(() => checkHealth(BASE_URL), { retries: 2, delayMs: 200 }), 500));
  results.push(await timedCheck('auth login (real seeded user)', () => retry(() => checkAuthLogin(BASE_URL, user.email, user.password), { retries: 2, delayMs: 200 }), 800));
  results.push(await timedCheck('products list', () => retry(() => checkProductsList(BASE_URL), { retries: 2, delayMs: 200 }), 800));

  for (const r of results) {
    console.log(`  [${r.verdict}] ${r.name} — elapsed=${r.elapsedMs}ms (${r.detail})`);
  }

  const verdict = overallVerdict(results);
  console.log(`\nPRODUCTION_VERIFICATION_LAB_VERDICT: ${verdict}`);

  if (verdict === 'NO_GO') {
    console.log('PRODUCTION_VERIFICATION_LAB_STATUS: FAILED');
    reportOutcome(1);
    return;
  }
  console.log('PRODUCTION_VERIFICATION_LAB_STATUS: EXECUTED');
  reportOutcome(0);
}

main();
