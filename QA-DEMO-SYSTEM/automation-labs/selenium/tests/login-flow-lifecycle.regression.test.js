const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

// Codex final-verification regression coverage (F6, then N2): proves the
// completion-control guarantees login-flow.test.js makes, against the
// REAL script via real child-process exit codes and real wall-clock
// timing — not by reasoning about the code, by actually running it under
// each condition and measuring how long it genuinely takes to terminate.
const SCRIPT = path.join(__dirname, 'login-flow.test.js');

// N2 (item G, timeout contract consistency): Codex found the previous
// version of this file used a fixed 20s supervisor timeout while the
// script's own DEFAULT driver-startup timeout was 30s — meaning, for the
// real (no-override) path, this supervisor could SIGTERM the child BEFORE
// the child's own documented timeout contract had a chance to complete,
// masking the child's own graceful EXECUTION_BLOCKED reporting behind a
// forced kill instead. The script's production WHOLE_RUN_DEADLINE_MS
// default is DRIVER_STARTUP(30s) + TEST_ACTION(20s)*2 + CLEANUP(15s) +
// 10s buffer = 95s — so the supervisor default here must be safely ABOVE
// that, not an arbitrary smaller number chosen independently.
// TR: Önceki sürüm, script'in KENDİ varsayılan driver-startup timeout'u
// 30s iken sabit 20s'lik bir supervisor timeout kullanıyordu — bu, gerçek
// (override'sız) yol için supervisor'ın, child'ın kendi zaman aşımı
// sözleşmesi TAMAMLANMADAN önce onu SIGTERM ile öldürebileceği anlamına
// geliyordu. Script'in production WHOLE_RUN_DEADLINE_MS varsayılanı 95s'dir
// — bu yüzden buradaki supervisor varsayılanı bunun GÜVENLE ÜZERİNDE
// olmalıdır, bağımsız seçilmiş rastgele bir sayı değil.
const PRODUCTION_WHOLE_RUN_DEADLINE_MS = 30_000 + 20_000 * 2 + 15_000 + 10_000; // = 95_000, mirrors login-flow.test.js's own default formula
const DEFAULT_SUPERVISOR_TIMEOUT_MS = PRODUCTION_WHOLE_RUN_DEADLINE_MS + 15_000; // comfortable margin above the child's own worst-case contract

function run(env, supervisorTimeoutMs = DEFAULT_SUPERVISOR_TIMEOUT_MS) {
  const startedAt = Date.now();
  try {
    const stdout = execFileSync('node', [SCRIPT], {
      env: { ...process.env, ...env },
      encoding: 'utf8',
      timeout: supervisorTimeoutMs,
    });
    return { code: 0, stdout, elapsedMs: Date.now() - startedAt, timedOut: false };
  } catch (err) {
    // execFileSync throws on non-zero exit; err.status is the real exit code.
    const timedOut = err.signal === 'SIGTERM' && err.status === null;
    return { code: err.status, stdout: err.stdout, stderr: err.stderr, timedOut, elapsedMs: Date.now() - startedAt };
  }
}

test('F6 regression: a forced silent-exit attempt (process.exit(0) before any explicit outcome) is still reported non-zero', () => {
  const result = run({ SELENIUM_TEST_FORCE_SILENT_EXIT: '1' }, 10_000);
  assert.notEqual(result.code, 0, 'the process.on(\'exit\') safety net must override a bare process.exit(0) and force a non-zero code — a silent zero-test exit must be impossible');
  assert.equal(result.timedOut, false, 'this must terminate on its own, not be killed by the supervisor timeout');
});

test('F6 regression: a hung driver-startup is reported as a bounded, explicit EXECUTION_BLOCKED, not an infinite hang', () => {
  const result = run({ SELENIUM_TEST_FORCE_HANG: '1', SELENIUM_DRIVER_STARTUP_TIMEOUT_MS: '2000', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' }, 10_000);
  assert.notEqual(result.code, 0, 'a hung driver startup must exit non-zero, never 0');
  assert.match(result.stdout || '', /SELENIUM_LAB_STATUS: EXECUTION_BLOCKED/, 'a bounded timeout must produce the explicit EXECUTION_BLOCKED status line, not silence');
  assert.equal(result.timedOut, false, 'this must terminate on its own, not be killed by the supervisor timeout');
});

// N2 (item H.1): the driver-startup hang above uses a bare, handle-free
// Promise — it proves the TIMEOUT fires, but not that the process can
// actually TERMINATE afterward when a real active handle (a timer, in
// this simulation — standing in for a real stuck socket/child-process
// pipe a hung chromedriver handshake might leave behind) is still alive.
// Node does not exit on its own while any such handle remains; only the
// hard-exit-grace mechanism in reportOutcome() can force it. The
// generous 6s ceiling here is a real assertion, not a formality: without
// that mechanism this process would hang forever, well past 6s.
test('N2 regression: a driver-startup hang that leaves a real active handle (timer) alive still terminates deterministically, non-zero, within a bounded time', () => {
  const result = run(
    { SELENIUM_TEST_FORCE_HANG_WITH_HANDLE: '1', SELENIUM_DRIVER_STARTUP_TIMEOUT_MS: '1000', SELENIUM_HARD_EXIT_GRACE_MS: '500', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' },
    10_000
  );
  assert.notEqual(result.code, 0, 'a hung driver startup with a leaked handle must still exit non-zero, never 0 and never hang');
  assert.match(result.stdout || '', /SELENIUM_LAB_STATUS: EXECUTION_BLOCKED/);
  assert.equal(result.timedOut, false, 'the script itself must terminate — the supervisor must never need to force-kill it');
  assert.ok(result.elapsedMs < 6_000, `expected self-termination well under 6s (1s timeout + 0.5s hard-exit grace + overhead), got ${result.elapsedMs}ms — a leaked handle must not be able to keep the process alive`);
});

// N2 (item H.2): "execution starts but driver.get or equivalent hangs
// while an active handle remains" — the SAME guarantee, but for the
// execution phase (after a driver already exists), bounded by
// TEST_ACTION_TIMEOUT_MS rather than DRIVER_STARTUP_TIMEOUT_MS.
test('N2 regression: an execution-phase hang that leaves a real active handle alive still terminates deterministically, non-zero, within a bounded time', () => {
  const result = run(
    { SELENIUM_TEST_FORCE_EXECUTION_HANG_WITH_HANDLE: '1', SELENIUM_TEST_ACTION_TIMEOUT_MS: '1000', SELENIUM_HARD_EXIT_GRACE_MS: '500', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' },
    10_000
  );
  assert.notEqual(result.code, 0, 'an execution-phase hang with a leaked handle must exit non-zero, never 0');
  assert.match(result.stdout || '', /SELENIUM_LAB_STATUS: EXECUTED/, 'this scenario reaches the reporting phase (the driver "built" via the test-only stub) — the hang is inside a bounded test case, not driver startup');
  assert.match(result.stdout || '', /SELENIUM_LAB_SUMMARY: 0\/1 passed/);
  assert.equal(result.timedOut, false, 'the script itself must terminate — the supervisor must never need to force-kill it');
  assert.ok(result.elapsedMs < 6_000, `expected self-termination well under 6s, got ${result.elapsedMs}ms`);
});

// N2 (item H.4): "cleanup/quit hangs" — driver.quit() itself hangs and
// leaks a handle. Per the success contract, cleanup not reaching a
// supported terminal state means the run cannot be reported as a clean
// success even though the (synthetic) test action passed.
test('N2 regression: a cleanup (driver.quit()) hang that leaves a real active handle alive still terminates deterministically, non-zero, within a bounded time', () => {
  const result = run(
    { SELENIUM_TEST_FORCE_QUIT_HANG: '1', SELENIUM_CLEANUP_TIMEOUT_MS: '1000', SELENIUM_HARD_EXIT_GRACE_MS: '500', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' },
    10_000
  );
  assert.notEqual(result.code, 0, 'a hung cleanup must result in a non-success outcome even if the test action itself passed — cleanup must reach a supported terminal state for success to be reported');
  assert.match(result.stdout || '', /SELENIUM_LAB_NOTE: driver\.quit\(\) did not complete cleanly/);
  assert.match(result.stdout || '', /cleanup \(driver\.quit\(\)\) did not complete within its bounded timeout/);
  assert.equal(result.timedOut, false, 'the script itself must terminate — the supervisor must never need to force-kill it');
  assert.ok(result.elapsedMs < 6_000, `expected self-termination well under 6s, got ${result.elapsedMs}ms`);
});

test('F6/N2 regression: the real, unmodified code path never exits 0 without an explicit EXECUTED/2-of-2-passed status (works in both this sandbox\'s EXECUTION_BLOCKED environment and a CI runner with real Chrome)', () => {
  // Deliberately portable across two real, different environments: this
  // sandbox (no compatible chromedriver/Chromium pairing — see
  // driver-factory.js) reports EXECUTION_BLOCKED; a GitHub Actions runner
  // with real Chrome reports EXECUTED with 2/2 passed. Either real outcome
  // is acceptable — what must NEVER happen is exit 0 with neither status
  // line printed, which is exactly the bug this fix closes. No env
  // overrides here — this exercises the actual PRODUCTION timeout
  // defaults, which is exactly why the supervisor timeout above must be
  // safely larger than PRODUCTION_WHOLE_RUN_DEADLINE_MS.
  const result = run({});
  const stdout = result.stdout || '';
  const blocked = /SELENIUM_LAB_STATUS: EXECUTION_BLOCKED/.test(stdout);
  const executed = /SELENIUM_LAB_STATUS: EXECUTED/.test(stdout);
  assert.ok(blocked || executed, `real run must print an explicit status line (got neither) — stdout: ${stdout}`);
  assert.equal(result.timedOut, false, 'the child must report its own outcome within its documented contract — the supervisor must never need to force-kill it before that contract completes');
  if (blocked) {
    assert.notEqual(result.code, 0, 'EXECUTION_BLOCKED must exit non-zero');
  } else {
    assert.match(stdout, /SELENIUM_LAB_SUMMARY: 2\/2 passed/, 'a real EXECUTED run must report the full expected test count');
    assert.equal(result.code, 0, 'a genuine 2/2 pass must exit 0');
  }
});
