const assert = require('node:assert/strict');
const { buildChromeDriver } = require('../driver-factory');
const { LoginPage } = require('../pages/LoginPage');
const { ProductsPage } = require('../pages/ProductsPage');
const loginCases = require('../test-data/login-cases.json');

// Phase 10 Selenium lab — "Assertions" + "Reporting" scope items.
// A tiny, real (not simulated) console reporter — no external reporting
// framework dependency is justified for two tests; this mirrors what a
// mocha/jasmine reporter does (collect result, print PASS/FAIL summary,
// exit non-zero on failure) without adding one more dependency for a
// two-test lab.
const EXPECTED_TEST_COUNT = 2;
const DRIVER_STARTUP_TIMEOUT_MS = Number(process.env.SELENIUM_DRIVER_STARTUP_TIMEOUT_MS) || 30_000;
const results = [];

// Codex final-verification fix (F6): a local Windows run was found able to
// execute zero Selenium tests, print none of this file's own status lines,
// and still exit 0 — a silent false-success condition. Root cause class:
// buildChromeDriver()'s underlying `.build()` call has NO bounded timeout
// (a hung chromedriver/browser handshake — a real, plausible Windows
// failure mode: a blocked listening socket, a Defender/firewall prompt, a
// version-mismatch negotiation that never completes) combined with a bare
// `main();` invocation at the bottom of this file with no top-level
// .catch()/exit-code safety net. If ANYTHING failed in a way this script's
// own try/catch blocks didn't anticipate, Node could reach end-of-process
// with `process.exitCode` NEVER explicitly set — and an unset exitCode
// defaults to 0.
//
// Fix, in three independent, defense-in-depth layers (any ONE of them
// alone would already close the specific bug; together they make a silent
// zero-result exit structurally impossible, not merely "less likely"):
//   1. explicitOutcomeReported — set to true only at the exact moments
//      this script prints EXECUTED or EXECUTION_BLOCKED with a real exit
//      code; a process.on('exit') handler checks this and FORCES a
//      distinct non-zero code + an explicit message if it was never set.
//   2. A bounded timeout around driver startup (DRIVER_STARTUP_TIMEOUT_MS)
//      turns a hang into a reported EXECUTION_BLOCKED, never an infinite
//      wait that something external has to kill (and whose killer's own
//      exit-code convention this script has no control over).
//   3. An explicit top-level main().then().catch() plus
//      unhandledRejection/uncaughtException handlers, replacing the bare
//      `main();` call — no error path can bypass this file's own exit-code
//      logic and fall through to Node's default (version-dependent, not
//      something this test should rely on).
//
// TR: Codex, Windows'ta bu script'in SIFIR test çalıştırıp, kendi
// EXECUTED/EXECUTION_BLOCKED durum satırlarından HİÇBİRİNİ yazdırmadan
// exit code 0 ile bitebildiğini kanıtladı — sessiz bir sahte-başarı
// durumu. Kök neden sınıfı: buildChromeDriver()'ın sınırsız (timeout'suz)
// olması + dosyanın en altındaki çıplak `main();` çağrısının hiçbir
// top-level .catch()/exit-code güvenlik ağı taşımaması. Üç bağımsız
// savunma katmanı (yukarıda) bunu YAPISAL olarak imkansız hale getirir.
let explicitOutcomeReported = false;

function reportOutcome(exitCode) {
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}

process.on('exit', () => {
  if (!explicitOutcomeReported) {
    // This line is the actual, literal enforcement of "a silent zero-test
    // exit must be impossible" — it fires on ANY exit path (including ones
    // this file's authors did not anticipate) that did not go through
    // reportOutcome() above.
    console.log('SELENIUM_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    console.log('SELENIUM_LAB_BLOCK_REASON: process reached exit without this script explicitly reporting EXECUTED or EXECUTION_BLOCKED — treated as a failure, never a silent success.');
    process.exitCode = 3;
  }
});

process.on('unhandledRejection', (err) => {
  console.log('SELENIUM_LAB_STATUS: EXECUTION_BLOCKED');
  console.log(`SELENIUM_LAB_BLOCK_REASON: unhandled rejection — ${err && err.stack ? err.stack : err}`);
  reportOutcome(2);
});

process.on('uncaughtException', (err) => {
  console.log('SELENIUM_LAB_STATUS: EXECUTION_BLOCKED');
  console.log(`SELENIUM_LAB_BLOCK_REASON: uncaught exception — ${err && err.stack ? err.stack : err}`);
  reportOutcome(2);
});

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} did not complete within ${ms}ms (bounded timeout — a hang is now a reported failure, never a silent wait)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function runCase(name, fn) {
  const startedAt = Date.now();
  try {
    await fn();
    results.push({ name, status: 'PASS', durationMs: Date.now() - startedAt });
  } catch (err) {
    results.push({ name, status: 'FAIL', durationMs: Date.now() - startedAt, error: err.message });
  }
}

async function main() {
  const baseUrl = process.env.QA_DEMO_BASE_URL || 'http://127.0.0.1:4400';

  let driver;
  try {
    // Test-only fault injection (regression coverage for F6 — see
    // login-flow-lifecycle.regression.test.js). Both flags are inert
    // unless explicitly set; neither can affect a real run.
    if (process.env.SELENIUM_TEST_FORCE_HANG === '1') {
      await withTimeout(new Promise(() => {}), DRIVER_STARTUP_TIMEOUT_MS, 'Chrome driver/browser startup');
    }
    if (process.env.SELENIUM_TEST_FORCE_SILENT_EXIT === '1') {
      // Simulates the ORIGINAL bug directly: something exits the process
      // without ever going through this file's own reportOutcome() calls.
      // The process.on('exit') safety net above must still force a
      // non-zero code even here.
      process.exit(0);
    }
    driver = await withTimeout(buildChromeDriver(), DRIVER_STARTUP_TIMEOUT_MS, 'Chrome driver/browser startup');
  } catch (err) {
    // See driver-factory.js and EXECUTION.md for the verified root cause
    // (chromedriver/Chromium major-version mismatch, driver download
    // blocked by network policy) — or, on a different machine, a real
    // startup timeout caught by withTimeout() above. Either way this is
    // reported distinctly from a normal test FAIL — an infrastructure
    // block, not a defect in this lab's code or in the application under
    // test — and it is now IMPOSSIBLE for this branch to fall through
    // without setting an explicit exit code.
    console.log('SELENIUM_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`SELENIUM_LAB_BLOCK_REASON: ${err.message}`);
    reportOutcome(2);
    return;
  }

  try {
    await runCase('valid credentials log in and reach the products page', async () => {
      const loginPage = new LoginPage(driver, baseUrl);
      await loginPage.open();
      await loginPage.login(loginCases.valid.email, loginCases.valid.password);
      await loginPage.waitForNavigationToProducts();

      const productsPage = new ProductsPage(driver);
      await productsPage.waitForProductList();
      const names = await productsPage.getProductNames();
      assert.ok(names.includes('QA Demo Klavye'), `expected seeded product in list, got: ${names.join(', ')}`);
    });

    await runCase('invalid credentials show the real backend error message', async () => {
      const loginPage = new LoginPage(driver, baseUrl);
      await loginPage.open();
      await loginPage.login(loginCases.invalid.email, loginCases.invalid.password);
      const errorText = await loginPage.waitForError();
      assert.equal(errorText, 'Email veya şifre hatalı');
    });
  } finally {
    try {
      await withTimeout(driver.quit(), 15_000, 'driver.quit()');
    } catch (err) {
      // A stuck quit() must not itself become a silent hang/false-success —
      // log it, but do not let it prevent the real result below from being
      // reported (the tests themselves already ran to completion by now).
      console.log(`SELENIUM_LAB_NOTE: driver.quit() did not complete cleanly: ${err.message}`);
    }
  }

  console.log('SELENIUM_LAB_STATUS: EXECUTED');
  for (const r of results) {
    console.log(`  [${r.status}] ${r.name} (${r.durationMs}ms)${r.error ? ` — ${r.error}` : ''}`);
  }
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`SELENIUM_LAB_SUMMARY: ${results.length - failed}/${results.length} passed`);

  if (results.length !== EXPECTED_TEST_COUNT) {
    // Fewer (or more) results than the lab actually defines is itself an
    // incomplete-execution condition — never treated as a silent PASS.
    console.log(`SELENIUM_LAB_BLOCK_REASON: expected ${EXPECTED_TEST_COUNT} test results, got ${results.length} — incomplete execution.`);
    reportOutcome(2);
    return;
  }

  reportOutcome(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  // Defense-in-depth layer 3 (see the block comment above) — replaces the
  // previous bare `main();` call, which had no top-level rejection
  // handling at all.
  console.log('SELENIUM_LAB_STATUS: EXECUTION_BLOCKED');
  console.log(`SELENIUM_LAB_BLOCK_REASON: unhandled error in main() — ${err && err.stack ? err.stack : err}`);
  reportOutcome(2);
});
