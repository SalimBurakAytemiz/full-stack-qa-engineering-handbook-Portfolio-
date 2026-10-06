#!/usr/bin/env node
'use strict';

// Privacy Testing lab — aggregate runner. Same status-line/exit-code
// contract and lifecycle-safety-net pattern as the other labs in this
// repository (run-jmeter.js, run-parallel.js, run-ai-lab.js,
// run-chaos-lab.js).
//
// This lab has two genuinely different parts:
//  1. Unit tests (pii-scanner-unit, data-subject-rights) — fully
//     self-contained, no server, always run.
//  2. A real-backend integration test (api-response-privacy) that
//     scans ACTUAL responses from a running QA-DEMO-SYSTEM backend —
//     requires a server at QA_DEMO_BASE_URL (default
//     http://127.0.0.1:3000, same convention as the Selenium lab).
// If no server is reachable, part 2 is honestly reported as
// NOT_EXECUTED (a real, disclosed gap) — never silently skipped and
// never presented as a pass it didn't earn.
// TR: Bu lab'ın iki GERÇEKTEN farklı parçası var: (1) sunucu
// gerektirmeyen, her zaman çalışan unit testler, (2) çalışan bir
// backend'e karşı GERÇEK yanıtları tarayan entegrasyon testi. Sunucu
// erişilemezse, bu kısım dürüstçe NOT_EXECUTED olarak raporlanır —
// asla sessizce atlanmaz veya hak etmediği bir PASS gibi sunulmaz.

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
    console.log('PRIVACY_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
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
  const unitFiles = [
    path.join(testsDir, 'pii-scanner-unit.test.js'),
    path.join(testsDir, 'data-subject-rights.test.js'),
  ];
  const integrationFile = path.join(testsDir, 'api-response-privacy.test.js');

  try {
    execFileSync(process.execPath, ['--test', ...unitFiles], { stdio: 'inherit' });
  } catch (err) {
    console.log('PRIVACY_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`PRIVACY_LAB_BLOCK_REASON: unit checks failed (exit code ${err.status}) — see test output above`);
    reportOutcome(1);
    return;
  }

  const reachable = await isServerReachable();
  if (!reachable) {
    console.log(`PRIVACY_LAB_INTEGRATION: NOT_EXECUTED — no backend reachable at ${BASE_URL} (start it first: node backend/src/server.js)`);
    console.log('PRIVACY_LAB_STATUS: PARTIAL_EXECUTED');
    console.log('PRIVACY_LAB_SUMMARY: unit checks (PII scanner logic, data-subject-rights simulator) passed; real-backend response scan was NOT executed (no server reachable) — this is honestly reported, not silently skipped');
    reportOutcome(0);
    return;
  }

  try {
    execFileSync(process.execPath, ['--test', integrationFile], { stdio: 'inherit' });
    console.log('PRIVACY_LAB_STATUS: EXECUTED');
    console.log('PRIVACY_LAB_SUMMARY: all deterministic checks passed, including a real-backend response scan for sensitive-field/PII leakage');
    reportOutcome(0);
  } catch (err) {
    console.log('PRIVACY_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`PRIVACY_LAB_BLOCK_REASON: real-backend privacy scan failed (exit code ${err.status}) — see test output above`);
    reportOutcome(1);
  }
}

main();
