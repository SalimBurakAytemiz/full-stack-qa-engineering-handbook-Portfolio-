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

// Codex final-verification fix (F6, then N2): timeout budgets for every
// phase of the run, each independently overridable so tests can exercise
// them fast without waiting out production-sized defaults. See the
// WHOLE_RUN_DEADLINE_MS comment below for why these four numbers must be
// read TOGETHER, not independently.
// TR: Her aşama için ayrı, bağımsız olarak override edilebilir zaman
// aşımı bütçeleri — böylece testler production boyutundaki varsayılanları
// beklemeden hızlı çalışabilir. Bu dört sayının neden BİRLİKTE
// okunması gerektiği aşağıdaki WHOLE_RUN_DEADLINE_MS yorumunda açıklanır.
const DRIVER_STARTUP_TIMEOUT_MS = Number(process.env.SELENIUM_DRIVER_STARTUP_TIMEOUT_MS) || 30_000;
const TEST_ACTION_TIMEOUT_MS = Number(process.env.SELENIUM_TEST_ACTION_TIMEOUT_MS) || 20_000;
const CLEANUP_TIMEOUT_MS = Number(process.env.SELENIUM_CLEANUP_TIMEOUT_MS) || 15_000;

// N2: a WHOLE-RUN deadline covering driver startup + every test action +
// cleanup, all together — not just the driver-startup phase. Codex proved
// that bounding ONLY driver startup was insufficient: a hang inside
// navigation/an assertion/driver.quit() was each its own unbounded wait.
// The default is the sum of the per-phase budgets above (worst case if
// every phase legitimately used its full budget) plus a fixed buffer —
// so a real, slow-but-honest run never trips it, but ANY hang anywhere
// in the run (including one this file's authors did not anticipate) is
// still caught by a single, simple, outer bound.
// TR: Yalnızca driver startup'ı sınırlamak YETERSİZDİ — Codex, navigasyon
// içinde veya bir assertion'da veya driver.quit()'te oluşan bir hang'in
// HER BİRİNİN kendi başına sınırsız bir bekleyiş olduğunu kanıtladı.
// Varsayılan değer, yukarıdaki aşama bütçelerinin TOPLAMI + sabit bir
// tampondur — dürüst-ama-yavaş gerçek bir çalıştırma bunu asla
// tetiklemez, ama çalıştırmanın HERHANGİ bir yerindeki bir hang (bu
// dosyanın yazarlarının öngörmediği bir yer dahil) yine de tek, basit,
// dış bir sınır tarafından yakalanır.
const WHOLE_RUN_DEADLINE_MS = Number(process.env.SELENIUM_WHOLE_RUN_DEADLINE_MS)
  || (DRIVER_STARTUP_TIMEOUT_MS + (TEST_ACTION_TIMEOUT_MS * EXPECTED_TEST_COUNT) + CLEANUP_TIMEOUT_MS + 10_000);

// N2: after an outcome is reported, ANY external caller (an npm script, a
// CI job step, a parent test supervisor) must eventually see this process
// exit — but Node only exits on its own once the event loop is empty, and
// a hung third-party call (a stuck socket, an unresolved chromedriver
// handshake, a leaked timer) can keep the event loop non-empty FOREVER
// even after we have already decided and logged the outcome. Setting
// process.exitCode alone does NOT force termination — it only says
// "if/when the process does exit naturally, use this code." This grace
// timer is the actual guarantee: give a short window for a clean exit
// (so stdout can flush), then call process.exit() unconditionally. It is
// unref()'d so it never ITSELF keeps the process alive or delays a clean
// exit that would have happened anyway.
// TR: process.exitCode ayarlamak TEK BAŞINA süreci SONLANDIRMAZ — yalnızca
// "eğer/ne zaman doğal olarak biterse hangi kodla bitsin"i belirler. Asıl
// garanti BUDUR: kısa bir "temiz çıkış" penceresi tanı (stdout flush
// edebilsin diye), ardından KOŞULSUZ process.exit() çağır. unref()
// edilmiştir — bu yüzden KENDİSİ süreci canlı tutmaz veya zaten
// gerçekleşecek olan temiz bir çıkışı geciktirmez.
const HARD_EXIT_GRACE_MS = Number(process.env.SELENIUM_HARD_EXIT_GRACE_MS) || 3_000;

const results = [];

// Codex final-verification fix (F6): a local Windows run was found able to
// execute zero Selenium tests, print none of this file's own status lines,
// and still exit 0 — a silent false-success condition. Root cause class:
// buildChromeDriver()'s underlying `.build()` call has NO bounded timeout
// (a hung chromedriver/browser handshake — a real, plausible Windows
// failure mode: a blocked listening socket, a Defender/firewall prompt, a
// version-mismatch negotiation that never completes) combined with a bare
// `main();` invocation at the bottom of this file with no top-level
// .catch()/exit-code safety net.
//
// N2 follow-up: bounding driver startup alone was still not a COMPLETE
// lifecycle guarantee. Codex proved a second, deeper problem: even once a
// timeout correctly fires and this script logs EXECUTION_BLOCKED, the
// THIRD-PARTY promise we raced against (buildChromeDriver(), driver.quit())
// is never cancelled — it keeps running, and whatever active handle it
// holds (a socket, a timer, a child process pipe) can keep Node's event
// loop alive indefinitely. A "bounded timeout" that still leaves the
// process hanging afterward has not actually solved the problem. See
// reportOutcome()'s hard-exit-grace timer above and WHOLE_RUN_DEADLINE_MS
// for the two additions that close this.
let explicitOutcomeReported = false;

function reportOutcome(exitCode) {
  if (explicitOutcomeReported) return; // first outcome wins — never double-report or schedule a second hard-exit timer
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
  const forceExitTimer = setTimeout(() => process.exit(exitCode), HARD_EXIT_GRACE_MS);
  forceExitTimer.unref();
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

// N2: every test action (navigation, form fill, assertion) is bounded the
// same way driver startup is — a hang inside `fn()` is caught here, not
// only at the outer whole-run level, so a single stuck action is recorded
// as that ONE case's failure rather than needing the coarser whole-run
// deadline to catch it.
// TR: Her test aksiyonu (navigasyon, form doldurma, assertion) driver
// startup ile AYNI şekilde sınırlıdır — `fn()` içindeki bir hang, yalnızca
// dış whole-run seviyesinde değil, BURADA yakalanır.
async function runCase(name, fn) {
  const startedAt = Date.now();
  try {
    await withTimeout(Promise.resolve().then(fn), TEST_ACTION_TIMEOUT_MS, `test case "${name}"`);
    results.push({ name, status: 'PASS', durationMs: Date.now() - startedAt });
  } catch (err) {
    results.push({ name, status: 'FAIL', durationMs: Date.now() - startedAt, error: err.message });
  }
}

// --- Test-only fault-injection stubs (N2 adversarial regression coverage) ---
// A stub driver is used ONLY when one of the SELENIUM_TEST_FORCE_* flags
// below is explicitly set to '1' — every check is a strict equality
// against a specific value, never a truthy/env-presence check, and CI/a
// real run never sets these, so this code path cannot affect production
// execution. The stub still runs through the REAL runCase/withTimeout/
// reportOutcome/hard-exit machinery — it only replaces the Chrome
// dependency, which the adversarial tests must not require.
// TR: Stub driver YALNIZCA aşağıdaki SELENIUM_TEST_FORCE_* bayraklarından
// biri kesin olarak '1'e eşitse kullanılır — her kontrol belirli bir
// değere karşı KESİN eşitliktir, hiçbir zaman bir "truthy/var mı" kontrolü
// değildir, ve gerçek bir çalıştırma bu değişkenleri asla ayarlamaz — bu
// yüzden bu kod yolu production çalıştırmasını ETKİLEYEMEZ.
function buildStubDriver({ quitHangsWithLeakedHandle }) {
  return {
    async quit() {
      if (quitHangsWithLeakedHandle) {
        setInterval(() => {}, 60_000); // deliberately leaked handle — simulates a real stuck socket/timer a misbehaving driver.quit() might leave behind
        await new Promise(() => {}); // deliberately never resolves
      }
    },
  };
}

async function runSeleniumLab() {
  const baseUrl = process.env.QA_DEMO_BASE_URL || 'http://127.0.0.1:4400';

  const forceQuitHang = process.env.SELENIUM_TEST_FORCE_QUIT_HANG === '1';
  const forceExecutionHangWithHandle = process.env.SELENIUM_TEST_FORCE_EXECUTION_HANG_WITH_HANDLE === '1';
  const stubMode = forceQuitHang || forceExecutionHangWithHandle;

  let driver;
  try {
    // Test-only fault injection (regression coverage for F6/N2 — see
    // login-flow-lifecycle.regression.test.js). Every flag is inert
    // unless explicitly set; none can affect a real run.
    if (process.env.SELENIUM_TEST_FORCE_HANG === '1') {
      await withTimeout(new Promise(() => {}), DRIVER_STARTUP_TIMEOUT_MS, 'Chrome driver/browser startup');
    }
    if (process.env.SELENIUM_TEST_FORCE_HANG_WITH_HANDLE === '1') {
      // N2: unlike the plain hang above (a Promise with no handle at all),
      // this ALSO leaks a real Node timer handle — proving the hard-exit
      // grace timer in reportOutcome() actually forces termination even
      // when a genuine active handle would otherwise keep the process
      // alive forever, not just when there happens to be nothing left to
      // wait on.
      setInterval(() => {}, 60_000); // deliberately leaked handle
      await withTimeout(new Promise(() => {}), DRIVER_STARTUP_TIMEOUT_MS, 'Chrome driver/browser startup (handle-leak simulation)');
    }
    if (process.env.SELENIUM_TEST_FORCE_SILENT_EXIT === '1') {
      // Simulates the ORIGINAL bug directly: something exits the process
      // without ever going through this file's own reportOutcome() calls.
      // The process.on('exit') safety net above must still force a
      // non-zero code even here.
      process.exit(0);
    }
    driver = stubMode
      ? buildStubDriver({ quitHangsWithLeakedHandle: forceQuitHang })
      : await withTimeout(buildChromeDriver(), DRIVER_STARTUP_TIMEOUT_MS, 'Chrome driver/browser startup');
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

  let cleanupTimedOut = false;
  try {
    if (forceExecutionHangWithHandle) {
      // N2: proves the SAME guarantee as the driver-startup handle-leak
      // case above, but for the EXECUTION phase (after a driver already
      // exists) — a hang inside a test action, with a real leaked handle,
      // must still be bounded (TEST_ACTION_TIMEOUT_MS) and the process
      // must still terminate (hard-exit grace), exactly as Codex's
      // "driver.get or equivalent hangs while an active handle remains"
      // scenario requires.
      await runCase('synthetic execution-phase hang with leaked handle (regression coverage only)', async () => {
        setInterval(() => {}, 60_000); // deliberately leaked handle
        await new Promise(() => {}); // deliberately never resolves
      });
    } else if (forceQuitHang) {
      // The action itself succeeds quickly here — only driver.quit()
      // below (via the stub) is instrumented to hang.
      await runCase('synthetic quit-hang setup case (regression coverage only)', async () => {});
    } else {
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
    }
  } finally {
    try {
      // N2: cleanup is bounded the same way every other phase is — a
      // hanging driver.quit() must not be able to hang the whole process.
      await withTimeout(driver.quit(), CLEANUP_TIMEOUT_MS, 'driver.quit()');
    } catch (err) {
      // A stuck quit() must not itself become a silent hang/false-success —
      // log it, and (below) treat it as cleanup NOT reaching a supported
      // terminal state, which means the run cannot be reported as a clean
      // success even if the test actions themselves passed.
      cleanupTimedOut = true;
      console.log(`SELENIUM_LAB_NOTE: driver.quit() did not complete cleanly (bounded, not a hang): ${err.message}`);
    }
  }

  console.log('SELENIUM_LAB_STATUS: EXECUTED');
  for (const r of results) {
    console.log(`  [${r.status}] ${r.name} (${r.durationMs}ms)${r.error ? ` — ${r.error}` : ''}`);
  }
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`SELENIUM_LAB_SUMMARY: ${results.length - failed}/${results.length} passed`);

  // Stub scenarios intentionally run a different (smaller) case count than
  // the real lab's contract — the real path's EXPECTED_TEST_COUNT is
  // unchanged and still strictly enforced.
  const expectedCount = stubMode ? results.length : EXPECTED_TEST_COUNT;
  if (results.length !== expectedCount) {
    // Fewer (or more) results than the lab actually defines is itself an
    // incomplete-execution condition — never treated as a silent PASS.
    console.log(`SELENIUM_LAB_BLOCK_REASON: expected ${expectedCount} test results, got ${results.length} — incomplete execution.`);
    reportOutcome(2);
    return;
  }

  if (cleanupTimedOut) {
    // N2 success contract: exit 0 requires cleanup to reach the supported
    // terminal state, not merely for the test actions to have passed.
    console.log('SELENIUM_LAB_BLOCK_REASON: cleanup (driver.quit()) did not complete within its bounded timeout — a run cannot be reported as a clean success when cleanup itself never reached a supported terminal state.');
    reportOutcome(2);
    return;
  }

  reportOutcome(failed > 0 ? 1 : 0);
}

async function main() {
  // N2: the whole-run deadline wraps EVERYTHING (driver startup + test
  // actions + cleanup) in one outer bound. If it fires, the rejection
  // flows into main().catch() below exactly like any other unhandled
  // error — EXECUTION_BLOCKED, non-zero exit, hard-exit-guaranteed
  // termination.
  await withTimeout(runSeleniumLab(), WHOLE_RUN_DEADLINE_MS, 'whole Selenium run (driver startup + tests + cleanup)');
}

main().catch((err) => {
  // Defense-in-depth layer 3 (see the block comment above) — replaces the
  // previous bare `main();` call, which had no top-level rejection
  // handling at all.
  console.log('SELENIUM_LAB_STATUS: EXECUTION_BLOCKED');
  console.log(`SELENIUM_LAB_BLOCK_REASON: unhandled error in main() — ${err && err.stack ? err.stack : err}`);
  reportOutcome(2);
});
