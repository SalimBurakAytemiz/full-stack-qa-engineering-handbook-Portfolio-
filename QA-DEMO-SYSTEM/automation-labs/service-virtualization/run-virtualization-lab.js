#!/usr/bin/env node
'use strict';

// Service Virtualization & Contract Testing lab — aggregate runner.
// Same status-line/exit-code contract and lifecycle-safety-net pattern
// as this repository's other labs.
//
// Two genuinely different parts: (1) the stub server + consumer-side
// contract verification — fully self-contained, no real backend
// needed, always run; (2) provider-side contract verification
// (provider-contract-verification.test.js), which needs a running
// backend at QA_DEMO_BASE_URL. If none is reachable, part 2 is
// honestly reported as NOT_EXECUTED.
// TR: İki GERÇEKTEN farklı parça: (1) sunucu gerektirmeyen stub
// server + tüketici-taraflı sözleşme doğrulaması; (2) çalışan bir
// backend'e karşı sağlayıcı-taraflı sözleşme doğrulaması.

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
    console.log('VIRTUALIZATION_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
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
  const consumerFiles = [
    path.join(testsDir, 'stub-server.test.js'),
    path.join(testsDir, 'consumer-contract.test.js'),
  ];
  const providerFile = path.join(testsDir, 'provider-contract-verification.test.js');

  try {
    execFileSync(process.execPath, ['--test', ...consumerFiles], { stdio: 'inherit' });
  } catch (err) {
    console.log('VIRTUALIZATION_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`VIRTUALIZATION_LAB_BLOCK_REASON: consumer-side checks failed (exit code ${err.status}) — see test output above`);
    reportOutcome(1);
    return;
  }

  const reachable = await isServerReachable();
  if (!reachable) {
    console.log(`VIRTUALIZATION_LAB_PROVIDER: NOT_EXECUTED — no backend reachable at ${BASE_URL} (start it first: node backend/src/server.js)`);
    console.log('VIRTUALIZATION_LAB_STATUS: PARTIAL_EXECUTED');
    console.log('VIRTUALIZATION_LAB_SUMMARY: stub server + consumer-side contract verification passed; provider-side verification was NOT executed (no server reachable) — honestly reported, not silently skipped');
    reportOutcome(0);
    return;
  }

  try {
    execFileSync(process.execPath, ['--test', providerFile], { stdio: 'inherit' });
    console.log('VIRTUALIZATION_LAB_STATUS: EXECUTED');
    console.log('VIRTUALIZATION_LAB_SUMMARY: all deterministic checks passed, including real provider-side contract verification against a live backend');
    reportOutcome(0);
  } catch (err) {
    console.log('VIRTUALIZATION_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`VIRTUALIZATION_LAB_BLOCK_REASON: provider contract verification failed (exit code ${err.status}) — the real backend's response diverges from the consumer's documented contract`);
    reportOutcome(1);
  }
}

main();
