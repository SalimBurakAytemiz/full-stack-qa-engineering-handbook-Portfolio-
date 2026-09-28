const assert = require('node:assert/strict');
const { buildDriver } = require('../driver-factory');
const { LoginPage } = require('../pages/LoginPage');
const { ProductsPage } = require('../pages/ProductsPage');
const loginCases = require('../test-data/login-cases.json');

// Codex fix-campaign B4 (P2, Phase 10) — "Parallel Execution" scope item.
// Previously entirely absent (the Phase 10 evidence's own table admitted
// this: "Parallel Execution / Cross Browser / Selenium Grid / CI/CD —
// YOK"), while the top-level classification still read "CODE COMPLETE" —
// an overclaim Codex's audit correctly flagged. This script is real,
// independent-session parallel execution: N separate WebDriver sessions
// run the SAME login flow CONCURRENTLY via Promise.all, each with its own
// browser instance — not N sequential runs dressed up as parallel.

const PARALLEL_SESSION_COUNT = 3;

// TR: Bu dört zaman aşımı bütçesi login-flow.test.js ile BİLEREK AYNI
// isimlere ve aynı varsayılan değerlere sahiptir (N2, "timeout contract
// consistency") — iki script farklı sayılar kullansaydı, "Selenium
// lifecycle sözleşmesi" tek bir gerçek olmaktan çıkar, dosyaya göre
// değişen belirsiz bir kavrama dönüşürdü.
const DRIVER_STARTUP_TIMEOUT_MS = Number(process.env.SELENIUM_DRIVER_STARTUP_TIMEOUT_MS) || 30_000;
const TEST_ACTION_TIMEOUT_MS = Number(process.env.SELENIUM_TEST_ACTION_TIMEOUT_MS) || 20_000;
const CLEANUP_TIMEOUT_MS = Number(process.env.SELENIUM_CLEANUP_TIMEOUT_MS) || 15_000;

// N2: a whole-run deadline covering the ENTIRE parallel batch (every
// session's startup + action + cleanup, run concurrently). Each session
// is already individually bounded below, so under normal conditions this
// never fires — it exists as the same outer safety net login-flow.test.js
// has, in case a future change to this file's control flow ever lets an
// unbounded wait slip past the per-session bounds unnoticed.
// TR: Her session zaten kendi içinde sınırlıdır — bu dış sınır, normal
// koşullarda hiç tetiklenmez. Var olma nedeni, bu dosyaya gelecekte
// yapılacak bir değişikliğin per-session sınırların dışında sınırsız bir
// bekleyişi fark edilmeden sızdırma ihtimaline karşı bir GÜVENLİK AĞIdır
// — login-flow.test.js'teki aynı desenin burasıdır.
const WHOLE_RUN_DEADLINE_MS = Number(process.env.SELENIUM_WHOLE_RUN_DEADLINE_MS)
  || (DRIVER_STARTUP_TIMEOUT_MS + (TEST_ACTION_TIMEOUT_MS * PARALLEL_SESSION_COUNT) + CLEANUP_TIMEOUT_MS + 10_000);

// N2: Node only exits once the event loop is empty — setting
// process.exitCode alone does not FORCE termination. If a hung
// buildDriver()/driver.quit() call (or, in the fault-injection tests
// below, a deliberately leaked timer) leaves a real active handle alive
// after we have already decided and logged the outcome, nothing would
// otherwise make the process actually terminate. This grace timer gives
// a short window for a natural, clean exit (so stdout flushes), then
// calls process.exit() unconditionally; it is unref()'d so it never
// itself delays or causes an exit that would not otherwise happen.
// TR: process.exitCode ayarlamak TEK BAŞINA süreci SONLANDIRMAZ. Bu
// zamanlayıcı, gerçek/sızdırılmış bir aktif handle hâlâ canlıyken bile
// sürecin KESİN olarak sonlanmasını garanti eder — unref() edilmiştir,
// bu yüzden zaten gerçekleşecek olan temiz bir çıkışı geciktirmez.
const HARD_EXIT_GRACE_MS = Number(process.env.SELENIUM_HARD_EXIT_GRACE_MS) || 3_000;

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  if (explicitOutcomeReported) return; // first outcome wins
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
  const forceExitTimer = setTimeout(() => process.exit(exitCode), HARD_EXIT_GRACE_MS);
  forceExitTimer.unref();
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    // TR: sıfır-sonuç sahte-başarı YASAKTIR — açık bir EXECUTED/
    // EXECUTION_BLOCKED raporu OLMADAN sürecin bitmesi her zaman FAIL
    // sayılır, asla sessiz bir 0 değil.
    console.log('SELENIUM_PARALLEL_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});
process.on('unhandledRejection', (err) => {
  console.log('SELENIUM_PARALLEL_STATUS: EXECUTION_BLOCKED');
  console.log(`SELENIUM_PARALLEL_BLOCK_REASON: unhandled rejection — ${err && err.stack ? err.stack : err}`);
  reportOutcome(2);
});
process.on('uncaughtException', (err) => {
  console.log('SELENIUM_PARALLEL_STATUS: EXECUTION_BLOCKED');
  console.log(`SELENIUM_PARALLEL_BLOCK_REASON: uncaught exception — ${err && err.stack ? err.stack : err}`);
  reportOutcome(2);
});

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} did not complete within ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// --- Test-only fault injection (N2 adversarial regression coverage) ---
// Strict equality against '1' only; a real run never sets this, so it
// cannot affect production execution. When set, ALL sessions use a stub
// driver (no real Chrome needed) and session[0] specifically hangs with a
// real leaked handle — proving that one hung session inside a parallel
// batch still terminates deterministically, and does not prevent the
// other sessions (or the whole process) from reaching a real result.
// TR: Gerçek bir çalıştırma bu değişkeni ASLA ayarlamaz. Ayarlandığında
// TÜM session'lar stub driver kullanır ve session[0] gerçek bir sızdırılmış
// handle ile hang eder — paralel bir grup içindeki TEK bir hung session'ın
// bile sürecin deterministik olarak sonlanmasını ENGELLEMEDİĞİNİ kanıtlar.
const forceSessionHangWithHandle = process.env.SELENIUM_TEST_FORCE_SESSION_HANG_WITH_HANDLE === '1';

async function runOneSession(index, baseUrl) {
  const startedAt = Date.now();
  let driver;
  try {
    driver = forceSessionHangWithHandle
      ? { async quit() {} }
      : await withTimeout(buildDriver('chrome'), DRIVER_STARTUP_TIMEOUT_MS, `session[${index}] driver startup`);
  } catch (err) {
    return { index, status: 'EXECUTION_BLOCKED', durationMs: Date.now() - startedAt, error: err.message };
  }

  let result;
  try {
    if (forceSessionHangWithHandle) {
      if (index === 0) {
        await withTimeout(
          (async () => {
            setInterval(() => {}, 60_000); // deliberately leaked handle
            await new Promise(() => {}); // deliberately never resolves
          })(),
          TEST_ACTION_TIMEOUT_MS,
          `session[${index}] test action`
        );
      }
      result = { index, status: 'PASS', durationMs: Date.now() - startedAt };
    } else {
      // N2: the login/navigation/assertion action is bounded the same
      // way driver startup is — an unbounded action was one of the gaps
      // Codex found (only driver startup had a timeout before).
      await withTimeout((async () => {
        const loginPage = new LoginPage(driver, baseUrl);
        await loginPage.open();
        await loginPage.login(loginCases.valid.email, loginCases.valid.password);
        await loginPage.waitForNavigationToProducts();

        const productsPage = new ProductsPage(driver);
        await productsPage.waitForProductList();
        const names = await productsPage.getProductNames();
        assert.ok(names.includes('QA Demo Klavye'), `expected seeded product in list, got: ${names.join(', ')}`);
      })(), TEST_ACTION_TIMEOUT_MS, `session[${index}] test action`);
      result = { index, status: 'PASS', durationMs: Date.now() - startedAt };
    }
  } catch (err) {
    result = { index, status: 'FAIL', durationMs: Date.now() - startedAt, error: err.message };
  } finally {
    if (driver) {
      try {
        // N2: cleanup is bounded here too — the previous version called
        // driver.quit() with no timeout at all, so a hung quit() for any
        // ONE session could hang the entire Promise.all batch.
        await withTimeout(driver.quit(), CLEANUP_TIMEOUT_MS, `session[${index}] driver.quit()`);
      } catch (err) {
        console.log(`SELENIUM_PARALLEL_NOTE: session[${index}] driver.quit() did not complete cleanly: ${err.message}`);
      }
    }
  }
  return result;
}

async function runParallelSessions() {
  const baseUrl = process.env.QA_DEMO_BASE_URL || 'http://127.0.0.1:4400';

  // The concurrency itself is the point of this script: all N sessions
  // are started together, not one after another.
  const startedAt = Date.now();
  const results = await Promise.all(
    Array.from({ length: PARALLEL_SESSION_COUNT }, (_, i) => runOneSession(i, baseUrl))
  );
  const wallClockMs = Date.now() - startedAt;

  console.log(`SELENIUM_PARALLEL_SESSIONS: ${PARALLEL_SESSION_COUNT}`);
  console.log(`SELENIUM_PARALLEL_WALL_CLOCK_MS: ${wallClockMs}`);
  for (const r of results) {
    console.log(`  session[${r.index}] [${r.status}] (${r.durationMs}ms)${r.error ? ` — ${r.error}` : ''}`);
  }

  const blocked = results.filter((r) => r.status === 'EXECUTION_BLOCKED').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const passed = results.filter((r) => r.status === 'PASS').length;

  if (blocked === results.length) {
    console.log('SELENIUM_PARALLEL_STATUS: EXECUTION_BLOCKED (all sessions)');
    reportOutcome(2);
    return;
  }
  if (results.length !== PARALLEL_SESSION_COUNT) {
    console.log(`SELENIUM_PARALLEL_STATUS: INCOMPLETE — expected ${PARALLEL_SESSION_COUNT} results, got ${results.length}`);
    reportOutcome(2);
    return;
  }

  console.log(`SELENIUM_PARALLEL_SUMMARY: ${passed}/${results.length} passed`);
  reportOutcome(failed > 0 || blocked > 0 ? 1 : 0);
}

async function main() {
  // N2: see WHOLE_RUN_DEADLINE_MS comment above — this races the whole
  // parallel batch against one outer bound, funneling a timeout into
  // main().catch() below exactly like any other unhandled error.
  await withTimeout(runParallelSessions(), WHOLE_RUN_DEADLINE_MS, 'whole parallel Selenium run (all sessions)');
}

main().catch((err) => {
  console.log('SELENIUM_PARALLEL_STATUS: EXECUTION_BLOCKED');
  console.log(`SELENIUM_PARALLEL_BLOCK_REASON: unhandled error in main() — ${err && err.stack ? err.stack : err}`);
  reportOutcome(2);
});
