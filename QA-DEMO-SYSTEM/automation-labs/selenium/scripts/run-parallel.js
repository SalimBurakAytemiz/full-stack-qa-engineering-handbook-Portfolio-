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

// --- Test-only fault injection (N2/N4 adversarial regression coverage) ---
// Strict equality against '1' only; a real run never sets these, so none
// can affect production execution. Each flag below drives a STUB driver
// (no real Chrome needed) through a specific lifecycle-failure shape.
// TR: Gerçek bir çalıştırma bu değişkenleri ASLA ayarlamaz. Her bayrak,
// bir STUB driver aracılığıyla belirli bir lifecycle-hata şeklini tetikler.
const forceSessionHangWithHandle = process.env.SELENIUM_TEST_FORCE_SESSION_HANG_WITH_HANDLE === '1';
const forceQuitHang = process.env.SELENIUM_TEST_FORCE_QUIT_HANG === '1';
const forceQuitReject = process.env.SELENIUM_TEST_FORCE_QUIT_REJECT === '1';
const forceMixedCleanupFailure = process.env.SELENIUM_TEST_FORCE_MIXED_CLEANUP_FAILURE === '1';
// N4-R (P2, Codex final-verification): driver.quit() can also reject with
// an Error/WebDriverError whose .message is the EMPTY STRING. Codex proved
// the previous fix used `err.message` itself as the failure flag
// (`if (cleanupError)`), which is falsy for `''` — an empty-message
// rejection was silently lost and the session wrongly reported PASS. These
// flags reproduce that exact shape with stub drivers, independent of the
// message-bearing `forceQuitReject` above.
// TR: driver.quit() ayrıca .message'ı BOŞ STRING olan bir Error/
// WebDriverError ile de reddedebilir. Codex, önceki düzeltmenin
// `err.message`'ın kendisini hata bayrağı olarak kullandığını kanıtladı
// (`if (cleanupError)`) — bu, `''` için falsy'dir, yani boş mesajlı bir
// red sessizce kayboluyordu. Bu bayraklar, stub driver'larla bu şekli
// yeniden üretir.
const forceQuitRejectEmptyError = process.env.SELENIUM_TEST_FORCE_QUIT_REJECT_EMPTY_ERROR === '1';
const forceQuitRejectEmptyWebDriverError = process.env.SELENIUM_TEST_FORCE_QUIT_REJECT_EMPTY_WEBDRIVER_ERROR === '1';
const forceMixedCleanupFailureEmptyWebDriverError = process.env.SELENIUM_TEST_FORCE_MIXED_CLEANUP_FAILURE_EMPTY_WEBDRIVER_ERROR === '1';
const forceAllEmptyCleanupFailure = process.env.SELENIUM_TEST_FORCE_ALL_EMPTY_CLEANUP_FAILURE === '1';
// N4 positive control (item C): a fast, portable (no real Chrome/network
// needed) proof that a batch where every session's action AND cleanup
// genuinely succeed is reported as a clean PASS with no cleanup-failure
// line — independent of the real-Chrome test, which is non-deterministic
// in a sandbox without a matching chromedriver/network access.
const forceAllStubSuccess = process.env.SELENIUM_TEST_FORCE_ALL_STUB_SUCCESS === '1';
const stubMode = forceSessionHangWithHandle || forceQuitHang || forceQuitReject
  || forceQuitRejectEmptyError || forceQuitRejectEmptyWebDriverError
  || forceMixedCleanupFailure || forceMixedCleanupFailureEmptyWebDriverError
  || forceAllEmptyCleanupFailure || forceAllStubSuccess;

// N4-R: a real Selenium rejection type (extends Error, distinct `.name`)
// used to prove the fix is not accidentally keyed off `Error` specifically.
class WebDriverError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WebDriverError';
  }
}

// N4: driver.quit() can fail in two genuinely different ways — it can
// HANG (never settle, and in a real hung-socket case may leave an active
// handle alive) or it can REJECT (settle immediately, but with an error).
// Both must be caught and both must prevent a session from being reported
// PASS. 'ok' is the default/production behavior (quit resolves cleanly).
function buildStubDriver(quitBehavior) {
  return {
    async quit() {
      if (quitBehavior === 'hang') {
        setInterval(() => {}, 60_000); // deliberately leaked handle
        await new Promise(() => {}); // deliberately never resolves
      }
      if (quitBehavior === 'reject') {
        throw new Error('synthetic driver.quit() rejection (regression coverage only)');
      }
      if (quitBehavior === 'reject-empty-error') {
        throw new Error();
      }
      if (quitBehavior === 'reject-empty-webdriver-error') {
        throw new WebDriverError();
      }
    },
  };
}

async function runOneSession(index, baseUrl) {
  const startedAt = Date.now();
  let driver;
  try {
    if (stubMode) {
      let quitBehavior = 'ok';
      if (forceQuitHang) quitBehavior = 'hang';
      else if (forceQuitReject) quitBehavior = 'reject';
      else if (forceQuitRejectEmptyError) quitBehavior = 'reject-empty-error';
      else if (forceQuitRejectEmptyWebDriverError) quitBehavior = 'reject-empty-webdriver-error';
      else if (forceMixedCleanupFailure) quitBehavior = index === 0 ? 'reject' : 'ok';
      else if (forceMixedCleanupFailureEmptyWebDriverError) quitBehavior = index === 1 ? 'reject-empty-webdriver-error' : 'ok';
      else if (forceAllEmptyCleanupFailure) quitBehavior = 'reject-empty-webdriver-error';
      driver = buildStubDriver(quitBehavior);
    } else {
      driver = await withTimeout(buildDriver('chrome'), DRIVER_STARTUP_TIMEOUT_MS, `session[${index}] driver startup`);
    }
  } catch (err) {
    return { index, status: 'EXECUTION_BLOCKED', durationMs: Date.now() - startedAt, error: err.message };
  }

  let actionStatus = 'PASS';
  let actionError;
  try {
    if (forceSessionHangWithHandle && index === 0) {
      await withTimeout(
        (async () => {
          setInterval(() => {}, 60_000); // deliberately leaked handle
          await new Promise(() => {}); // deliberately never resolves
        })(),
        TEST_ACTION_TIMEOUT_MS,
        `session[${index}] test action`
      );
    } else if (!stubMode) {
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
    }
    // else: the other stub scenarios (forceQuitHang/forceQuitReject/
    // forceMixedCleanupFailure) synthesize an instant-pass action —
    // their whole point is to isolate a CLEANUP failure, not an action
    // failure.
  } catch (err) {
    actionStatus = 'FAIL';
    actionError = err.message;
  }

  // N4: Codex proved a session whose actions passed could still be
  // reported PASS even when its own driver.quit() timed out or rejected
  // — the failure was logged as a NOTE only, never fed back into the
  // session's result. Cleanup is now tracked as its own explicit outcome,
  // always attempted (bounded, as before), and factored into the final
  // status below — a session cannot be a clean PASS if its required
  // cleanup never reached a supported terminal state.
  // TR: Codex, aksiyonları BAŞARILI olan bir session'ın, driver.quit()
  // zaman aşımına uğrasa veya reddedilse bile hâlâ PASS raporlanabildiğini
  // kanıtladı — hata yalnızca bir NOTE olarak loglanıyor, session'ın
  // sonucuna hiç YANSITILMIYORDU. Cleanup artık kendi açık sonucuyla
  // izlenir ve nihai duruma dahil edilir.
  //
  // N4-R (Codex final-verification): the *existence* of a driver.quit()
  // rejection determines cleanup failure — never `err.message`. A prior
  // version used `cleanupError = err.message` as BOTH the diagnostic text
  // AND (via `if (cleanupError)`) the failure flag, so a rejection with an
  // empty `.message` (a bare `new Error()`, or a Selenium WebDriverError
  // instance with no message) was silently treated as success. The
  // boolean below is set unconditionally inside the catch block; message
  // content is derived separately and only ever affects diagnostic text,
  // with a safe non-empty fallback when the thrown error carries none.
  // TR: Cleanup başarısızlığını `err.message` DEĞİL, red'in VAR OLMASI
  // belirler. Önceki sürüm `err.message`'ı hem tanı metni hem de (
  // `if (cleanupError)` üzerinden) başarısızlık bayrağı olarak
  // kullanıyordu — bu yüzden `.message`'ı boş olan bir red (çıplak
  // `new Error()` veya mesajsız bir WebDriverError) sessizce başarı
  // sayılıyordu. Aşağıdaki boolean, catch bloğunun içinde KOŞULSUZ
  // olarak ayarlanır; mesaj içeriği yalnızca tanı metnini etkiler.
  let cleanupFailed = false;
  let cleanupError;
  try {
    // N2: cleanup is bounded here too — the previous version called
    // driver.quit() with no timeout at all, so a hung quit() for any
    // ONE session could hang the entire Promise.all batch.
    await withTimeout(driver.quit(), CLEANUP_TIMEOUT_MS, `session[${index}] driver.quit()`);
  } catch (err) {
    cleanupFailed = true; // an exception occurred — this alone is failure.
    const rawMessage = err && typeof err.message === 'string' ? err.message : '';
    cleanupError = rawMessage.length > 0
      ? rawMessage
      : `cleanup rejected without message (${(err && (err.name || err.constructor?.name)) || 'unknown error type'})`;
  }

  const durationMs = Date.now() - startedAt;
  if (actionStatus === 'FAIL') {
    return { index, status: 'FAIL', durationMs, error: actionError, cleanupError: cleanupFailed ? cleanupError : undefined };
  }
  if (cleanupFailed) {
    return { index, status: 'CLEANUP_FAILED', durationMs, error: cleanupError };
  }
  return { index, status: 'PASS', durationMs };
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
  const cleanupFailed = results.filter((r) => r.status === 'CLEANUP_FAILED').length;
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
  if (cleanupFailed > 0) {
    // N4: a run must not be reported as a clean overall success when one
    // or more sessions' required cleanup did not reach a supported
    // terminal state, even if every session's own test actions passed —
    // named explicitly here, not just buried in the per-session lines
    // above, so an aggregate-only reader still sees it.
    const failedIndexes = results.filter((r) => r.status === 'CLEANUP_FAILED').map((r) => r.index).join(', ');
    console.log(`SELENIUM_PARALLEL_CLEANUP_FAILURES: ${cleanupFailed}/${results.length} — session(s) [${failedIndexes}] did not complete required cleanup within its bounded timeout/without rejecting`);
  }
  reportOutcome(failed > 0 || blocked > 0 || cleanupFailed > 0 ? 1 : 0);
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
