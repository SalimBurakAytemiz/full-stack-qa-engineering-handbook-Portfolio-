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
