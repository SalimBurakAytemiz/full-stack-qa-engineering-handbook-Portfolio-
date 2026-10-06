#!/usr/bin/env node
'use strict';

// AI Systems Testing lab — aggregate runner. Mirrors the same
// status-line/exit-code contract already established by
// run-jmeter.js and run-parallel.js in this repository: an explicit
// AI_LAB_STATUS line is always printed, and a run can never exit 0
// without one (see the process.on('exit', ...) safety net below —
// exact same pattern, not a new convention).
//
// AI_TEST_MODE defaults to "mock": every check below runs against the
// deterministic mock provider (lib/mock-provider.js) with zero network
// calls and zero API keys. If AI_TEST_MODE=live is explicitly set, this
// script reports EXTERNALLY_BLOCKED per provider (see lib/live-provider.js)
// rather than silently running mock checks and calling them "live".
// TR: AI_TEST_MODE varsayılanı "mock"tur — ağ çağrısı veya API anahtarı
// olmadan deterministik mock provider'a karşı çalışır. AI_TEST_MODE=live
// açıkça ayarlanırsa, sessizce mock'a düşmek yerine provider başına
// EXTERNALLY_BLOCKED raporlanır.

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const AI_TEST_MODE = process.env.AI_TEST_MODE || 'mock';

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  if (explicitOutcomeReported) return;
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('AI_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

function main() {
  console.log(`AI_LAB_MODE: ${AI_TEST_MODE}`);

  if (AI_TEST_MODE === 'live') {
    const { checkLiveProviderAvailability, PROVIDER_ENV_KEYS } = require('./lib/live-provider');
    for (const provider of Object.keys(PROVIDER_ENV_KEYS)) {
      const { status, reason } = checkLiveProviderAvailability(provider);
      console.log(`AI_LAB_LIVE_PROVIDER[${provider}]: ${status} — ${reason}`);
    }
    console.log('AI_LAB_STATUS: EXTERNALLY_BLOCKED');
    console.log('AI_LAB_BLOCK_REASON: AI_TEST_MODE=live requested but this lab ships no paid-API HTTP client by design (mock-first scope) — see handbook AI-ML-LLM-SYSTEMS-TESTING/02-LLM-AND-PROMPT-TESTING.md');
    reportOutcome(2);
    return;
  }

  // mock mode: run the real deterministic unit suite and surface its
  // real pass/fail result — never a hand-picked subset.
  //
  // node --test <directory> does not reliably recurse on this Node
  // version (it can throw MODULE_NOT_FOUND trying to require() the
  // directory itself) — so, same as the shell-glob invocation used
  // during manual verification (`node --test tests/*.test.js`), the
  // test files are enumerated explicitly and passed as individual
  // file arguments.
  // TR: Bu Node sürümünde `node --test <dizin>` güvenilir şekilde
  // alt dizini taramıyor (dizini require() etmeye çalışıp
  // MODULE_NOT_FOUND fırlatabiliyor) — bu yüzden test dosyaları açıkça
  // listelenip ayrı ayrı argüman olarak geçiriliyor.
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
    console.log('AI_LAB_STATUS: EXECUTED');
    console.log('AI_LAB_SUMMARY: all deterministic mock-mode checks passed (prompt testing, golden eval, structured output, RAG, agent tool-calling, safety/privacy, provider regression, cost/latency budgets, live-provider gating)');
    reportOutcome(0);
  } catch (err) {
    console.log('AI_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`AI_LAB_BLOCK_REASON: one or more deterministic mock-mode checks failed (exit code ${err.status}) — see test output above`);
    reportOutcome(1);
  }
}

main();
