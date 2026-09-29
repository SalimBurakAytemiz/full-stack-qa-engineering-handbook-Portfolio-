#!/usr/bin/env node
'use strict';

// Chaos/Reliability lab — aggregate runner. Same status-line/exit-code
// contract and lifecycle-safety-net pattern already established by
// run-jmeter.js, run-parallel.js, and run-ai-lab.js in this repository.
// Fully self-contained — the "unreliable dependency" is a local fixture
// server this lab starts and stops itself, so no external service, no
// network access, and no real chaos-engineering infrastructure
// (Chaos Monkey/Gremlin/Litmus/Toxiproxy) is required or used.
// TR: run-jmeter.js/run-parallel.js/run-ai-lab.js ile AYNI durum
// satırı/exit-code sözleşmesi ve lifecycle safety-net deseni. "Unreliable
// dependency" bu lab'ın kendisinin başlatıp durdurduğu yerel bir
// fixture sunucusudur — dış servis, ağ erişimi veya gerçek bir chaos
// altyapısı gerekmez.

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  if (explicitOutcomeReported) return;
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('CHAOS_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

function main() {
  try {
    const testsDir = path.join(__dirname, 'tests');
    const testFiles = fs
      .readdirSync(testsDir)
      .filter((f) => f.endsWith('.test.js'))
      .sort()
      .map((f) => path.join(testsDir, f));
    if (testFiles.length === 0) {
      throw new Error(`no *.test.js files found in ${testsDir}`);
    }
    execFileSync(process.execPath, ['--test', ...testFiles], { stdio: 'inherit' });
    console.log('CHAOS_LAB_STATUS: EXECUTED');
    console.log('CHAOS_LAB_SUMMARY: all deterministic fault-injection checks passed (unreliable-server fixture, circuit breaker state machine, resilient client retry/timeout, composed chaos recovery scenarios)');
    reportOutcome(0);
  } catch (err) {
    console.log('CHAOS_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`CHAOS_LAB_BLOCK_REASON: one or more deterministic checks failed (exit code ${err.status}) — see test output above`);
    reportOutcome(1);
  }
}

main();
