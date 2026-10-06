#!/usr/bin/env node
'use strict';

// Property-Based & Fuzz Testing lab — aggregate runner. Same status-
// line/exit-code contract and lifecycle-safety-net pattern as this
// repository's other labs.
//
// Two genuinely different parts: (1) the property-testing framework's
// own meta-tests plus real property tests against the real backend's
// product service (via an in-memory SQLite db — no server needed,
// always run); (2) real-API fuzz testing (api-fuzz.test.js), which
// needs a running backend at QA_DEMO_BASE_URL. If none is reachable,
// part 2 is honestly reported as NOT_EXECUTED — never silently
// skipped, never a fake pass.
// TR: İki GERÇEKTEN farklı parça: (1) sunucu gerektirmeyen property
// testleri, her zaman çalışır; (2) çalışan bir backend'e karşı gerçek
// API fuzz testi. Sunucu erişilemezse, bu kısım dürüstçe NOT_EXECUTED
// olarak raporlanır.

const path = require('node:path');
const { execFileSync } = require('node:child_process');

const BASE_URL = process.env.QA_DEMO_BASE_URL || 'http://127.0.0.1:3000';

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  if (explicitOutcomeReported) return;
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('PROPERTY_FUZZ_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
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
  const testsDir = path.join(__dirname, 'tests');
  const propertyFiles = [
    path.join(testsDir, 'property-testing-framework.test.js'),
    path.join(testsDir, 'products-service-properties.test.js'),
  ];
  const fuzzFile = path.join(testsDir, 'api-fuzz.test.js');

  try {
    execFileSync(process.execPath, ['--test', ...propertyFiles], { stdio: 'inherit' });
  } catch (err) {
    console.log('PROPERTY_FUZZ_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`PROPERTY_FUZZ_LAB_BLOCK_REASON: property checks failed (exit code ${err.status}) — see test output above`);
    reportOutcome(1);
    return;
  }

  const reachable = await isServerReachable();
  if (!reachable) {
    console.log(`PROPERTY_FUZZ_LAB_FUZZ: NOT_EXECUTED — no backend reachable at ${BASE_URL} (start it first: node backend/src/server.js)`);
    console.log('PROPERTY_FUZZ_LAB_STATUS: PARTIAL_EXECUTED');
    console.log('PROPERTY_FUZZ_LAB_SUMMARY: property-testing framework + real backend product-service properties passed; real-API fuzz testing was NOT executed (no server reachable) — honestly reported, not silently skipped');
    reportOutcome(0);
    return;
  }

  try {
    execFileSync(process.execPath, ['--test', fuzzFile], { stdio: 'inherit' });
    console.log('PROPERTY_FUZZ_LAB_STATUS: EXECUTED');
    console.log('PROPERTY_FUZZ_LAB_SUMMARY: all deterministic checks passed, including real-API fuzz testing against a live backend');
    reportOutcome(0);
  } catch (err) {
    console.log('PROPERTY_FUZZ_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`PROPERTY_FUZZ_LAB_BLOCK_REASON: fuzz testing found a real crash/gap (exit code ${err.status}) — see test output above`);
    reportOutcome(1);
  }
}

main();
