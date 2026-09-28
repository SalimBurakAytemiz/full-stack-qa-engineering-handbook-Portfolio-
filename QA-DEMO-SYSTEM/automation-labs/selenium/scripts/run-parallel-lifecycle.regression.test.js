const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

// N2 adversarial regression coverage for run-parallel.js — the same class
// of proof as login-flow-lifecycle.regression.test.js, but for the
// parallel runner: item H.3 ("parallel sessions start and one or more
// hang") explicitly requires its own coverage, separate from the single-
// session script.
const SCRIPT = path.join(__dirname, 'run-parallel.js');

// Mirrors login-flow-lifecycle.regression.test.js's reasoning — must be
// safely above this script's own production WHOLE_RUN_DEADLINE_MS default
// (30_000 + 20_000*3 + 15_000 + 10_000 = 115_000 here, since this script
// has 3 parallel sessions instead of 2 sequential cases) so a real,
// no-override run is never killed by the supervisor before the script's
// own timeout contract completes.
const PRODUCTION_WHOLE_RUN_DEADLINE_MS = 30_000 + 20_000 * 3 + 15_000 + 10_000; // = 115_000
const DEFAULT_SUPERVISOR_TIMEOUT_MS = PRODUCTION_WHOLE_RUN_DEADLINE_MS + 15_000;

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
    const timedOut = err.signal === 'SIGTERM' && err.status === null;
    return { code: err.status, stdout: err.stdout, stderr: err.stderr, timedOut, elapsedMs: Date.now() - startedAt };
  }
}

test('N2 regression: one hung session (with a real leaked handle) inside a parallel batch still terminates deterministically, non-zero, without blocking the other sessions', () => {
  const result = run(
    { SELENIUM_TEST_FORCE_SESSION_HANG_WITH_HANDLE: '1', SELENIUM_TEST_ACTION_TIMEOUT_MS: '1000', SELENIUM_HARD_EXIT_GRACE_MS: '500', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' },
    10_000
  );
  const stdout = result.stdout || '';
  assert.notEqual(result.code, 0, 'a batch with one hung/failed session must exit non-zero');
  assert.match(stdout, /session\[0\] \[FAIL\]/, 'the hung session must be reported as an explicit FAIL, not silently dropped');
  assert.match(stdout, /session\[1\] \[PASS\]/, 'a session unrelated to the injected hang must still complete normally');
  assert.match(stdout, /session\[2\] \[PASS\]/, 'a session unrelated to the injected hang must still complete normally');
  assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 2\/3 passed/);
  assert.equal(result.timedOut, false, 'the script itself must terminate — the supervisor must never need to force-kill it');
  assert.ok(result.elapsedMs < 6_000, `expected self-termination well under 6s, got ${result.elapsedMs}ms — a leaked handle in one session must not keep the whole process alive`);
});

// N4 adversarial regression coverage — Codex proved a session whose
// actions PASSED could still be reported PASS overall even when its own
// driver.quit() timed out (item A) or rejected (item B), or when one
// session's cleanup failed inside an otherwise-successful parallel batch
// (item D). These four tests prove the actual AGGREGATE contract (exit
// code, per-session status, explicit CLEANUP_FAILURES line) — not merely
// that an error line was printed somewhere in stdout.

test('N4 regression (item A): actions PASS but driver.quit() never resolves on every session -> overall exit non-zero, no PASS summary claim', () => {
  const result = run(
    { SELENIUM_TEST_FORCE_QUIT_HANG: '1', SELENIUM_CLEANUP_TIMEOUT_MS: '1000', SELENIUM_HARD_EXIT_GRACE_MS: '500', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' },
    10_000
  );
  const stdout = result.stdout || '';
  assert.notEqual(result.code, 0, 'a batch where every session\'s cleanup hangs must exit non-zero even though every action passed');
  assert.match(stdout, /session\[0\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[1\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[2\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 0\/3 passed/, 'a session with hung cleanup must never be counted in "passed"');
  assert.match(stdout, /SELENIUM_PARALLEL_CLEANUP_FAILURES: 3\/3/, 'the aggregate must explicitly name the cleanup-failure count, not just log a per-session NOTE');
  assert.equal(result.timedOut, false, 'no external supervisor may be required to terminate the runner — it must self-terminate');
  assert.ok(result.elapsedMs < 6_000, `expected self-termination well under 6s despite real leaked handles, got ${result.elapsedMs}ms`);
});

test('N4 regression (item B): actions PASS but driver.quit() rejects on every session -> overall exit non-zero, no PASS summary claim', () => {
  const result = run({ SELENIUM_TEST_FORCE_QUIT_REJECT: '1', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' }, 10_000);
  const stdout = result.stdout || '';
  assert.notEqual(result.code, 0, 'a batch where every session\'s cleanup rejects must exit non-zero even though every action passed');
  assert.match(stdout, /session\[0\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[1\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[2\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 0\/3 passed/);
  assert.match(stdout, /SELENIUM_PARALLEL_CLEANUP_FAILURES: 3\/3/);
  assert.equal(result.timedOut, false, 'no external supervisor may be required to terminate the runner');
});

test('N4 regression (item D): mixed batch — 2 sessions fully succeed, 1 session\'s cleanup fails -> overall exit non-zero, failed session named', () => {
  const result = run({ SELENIUM_TEST_FORCE_MIXED_CLEANUP_FAILURE: '1', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' }, 10_000);
  const stdout = result.stdout || '';
  assert.notEqual(result.code, 0, 'one session\'s cleanup failure must make the WHOLE batch non-zero, even with 2 genuine full successes');
  assert.match(stdout, /session\[0\] \[CLEANUP_FAILED\]/, 'the specific failed session must be identified');
  assert.match(stdout, /session\[1\] \[PASS\]/);
  assert.match(stdout, /session\[2\] \[PASS\]/);
  assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 2\/3 passed/, 'the cleanup-failed session must not be counted as passed');
  assert.match(stdout, /SELENIUM_PARALLEL_CLEANUP_FAILURES: 1\/3 — session\(s\) \[0\]/, 'the aggregate line must name exactly which session\'s cleanup failed');
  assert.equal(result.timedOut, false, 'no external supervisor may be required to terminate the runner');
});

test('N4 regression (item C, positive control): when actions AND cleanup all genuinely succeed, the aggregate is a clean PASS with no cleanup-failure line', () => {
  // Fast, portable (no real Chrome/network needed) positive control,
  // independent of the real-Chrome test below (which is non-deterministic
  // in a sandbox without a matching chromedriver/network access).
  const result = run({ SELENIUM_TEST_FORCE_ALL_STUB_SUCCESS: '1' }, 10_000);
  const stdout = result.stdout || '';
  assert.equal(result.code, 0, 'a batch where every session\'s action and cleanup genuinely succeed must exit 0');
  assert.match(stdout, /session\[0\] \[PASS\]/);
  assert.match(stdout, /session\[1\] \[PASS\]/);
  assert.match(stdout, /session\[2\] \[PASS\]/);
  assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 3\/3 passed/);
  assert.doesNotMatch(stdout, /SELENIUM_PARALLEL_CLEANUP_FAILURES/, 'a genuinely clean run must never claim a cleanup failure that was not injected');
});

// N4-R adversarial regression coverage (Codex final-verification) —
// Codex proved the N4 fix above was itself incomplete: it used
// `err.message` as BOTH the diagnostic text and (via `if (cleanupError)`)
// the failure flag, so a driver.quit() rejection whose `.message` is the
// empty string (a bare `new Error()`, or a Selenium WebDriverError with no
// message) was silently treated as cleanup success. These four tests
// (items B, C, D, E of the mandatory regression list) reproduce that exact
// shape; item A (message-bearing reject) is already covered by the "N4
// regression (item B)" test above, and items F/G (cleanup timeout+handle,
// positive control) by the "N4 regression (item A)"/"(item C)" tests above.

test('N4-R regression (item B): driver.quit() rejects with an empty-message Error() on every session -> overall exit non-zero, failure not silently lost', () => {
  const result = run({ SELENIUM_TEST_FORCE_QUIT_REJECT_EMPTY_ERROR: '1', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' }, 10_000);
  const stdout = result.stdout || '';
  assert.notEqual(result.code, 0, 'an empty-message cleanup rejection must not be swallowed by falsy-string truthiness — the batch must still fail');
  assert.match(stdout, /session\[0\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[1\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[2\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 0\/3 passed/, 'an empty-message cleanup rejection must never be counted as passed');
  assert.match(stdout, /SELENIUM_PARALLEL_CLEANUP_FAILURES: 3\/3/);
  assert.match(stdout, /cleanup rejected without message/, 'an empty err.message must fall back to a safe, non-empty diagnostic derived from the error type — never converted into a missing failure state');
});

test('N4-R regression (item C): driver.quit() rejects with an empty-message WebDriverError on every session -> overall exit non-zero, failure not silently lost', () => {
  const result = run({ SELENIUM_TEST_FORCE_QUIT_REJECT_EMPTY_WEBDRIVER_ERROR: '1', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' }, 10_000);
  const stdout = result.stdout || '';
  assert.notEqual(result.code, 0, 'a real Selenium-shaped rejection type (WebDriverError) with an empty message must still fail the batch');
  assert.match(stdout, /session\[0\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[1\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[2\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 0\/3 passed/);
  assert.match(stdout, /SELENIUM_PARALLEL_CLEANUP_FAILURES: 3\/3/);
  assert.match(stdout, /cleanup rejected without message \(WebDriverError\)/, 'the safe fallback diagnostic must be derived from the real error type name, not a generic Error label');
});

test('N4-R regression (item D): mixed batch — session[1]\'s cleanup rejects with an empty-message WebDriverError, sessions[0] and [2] fully succeed -> overall exit non-zero, session[1] named', () => {
  const result = run({ SELENIUM_TEST_FORCE_MIXED_CLEANUP_FAILURE_EMPTY_WEBDRIVER_ERROR: '1', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' }, 10_000);
  const stdout = result.stdout || '';
  assert.notEqual(result.code, 0, 'one session\'s empty-message cleanup failure must make the whole batch non-zero, even with 2 genuine full successes');
  assert.match(stdout, /session\[0\] \[PASS\]/);
  assert.match(stdout, /session\[1\] \[CLEANUP_FAILED\]/, 'the empty-message rejection must still be recognized and attributed to the correct session');
  assert.match(stdout, /session\[2\] \[PASS\]/);
  assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 2\/3 passed/, 'the cleanup-failed session must not be counted as passed merely because its message was empty');
  assert.match(stdout, /SELENIUM_PARALLEL_CLEANUP_FAILURES: 1\/3 — session\(s\) \[1\]/, 'the aggregate line must name exactly which session\'s cleanup failed');
});

test('N4-R regression (item E): all three sessions\' cleanup rejects with an empty-message error -> 0/3 successful, overall exit non-zero', () => {
  const result = run({ SELENIUM_TEST_FORCE_ALL_EMPTY_CLEANUP_FAILURE: '1', SELENIUM_WHOLE_RUN_DEADLINE_MS: '10000' }, 10_000);
  const stdout = result.stdout || '';
  assert.notEqual(result.code, 0, 'three genuine (if empty-message) cleanup failures must never be reported as a passing batch');
  assert.match(stdout, /session\[0\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[1\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /session\[2\] \[CLEANUP_FAILED\]/);
  assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 0\/3 passed/);
  assert.match(stdout, /SELENIUM_PARALLEL_CLEANUP_FAILURES: 3\/3/);
});

test('N2/F6 regression: the real, unmodified parallel path never exits 0 without an explicit status line (works in both this sandbox\'s EXECUTION_BLOCKED environment and a CI runner with real Chrome)', () => {
  const result = run({});
  const stdout = result.stdout || '';
  const blocked = /SELENIUM_PARALLEL_STATUS: EXECUTION_BLOCKED/.test(stdout);
  const hasSummary = /SELENIUM_PARALLEL_SUMMARY:/.test(stdout);
  assert.ok(blocked || hasSummary, `real run must print an explicit status line (got neither) — stdout: ${stdout}`);
  assert.equal(result.timedOut, false, 'the child must report its own outcome within its documented contract — the supervisor must never need to force-kill it');
  if (blocked) {
    assert.notEqual(result.code, 0, 'EXECUTION_BLOCKED must exit non-zero');
  } else {
    assert.match(stdout, /SELENIUM_PARALLEL_SUMMARY: 3\/3 passed/, 'a real all-sessions-pass run must report the full expected session count');
    assert.equal(result.code, 0, 'a genuine 3/3 pass must exit 0');
  }
});
