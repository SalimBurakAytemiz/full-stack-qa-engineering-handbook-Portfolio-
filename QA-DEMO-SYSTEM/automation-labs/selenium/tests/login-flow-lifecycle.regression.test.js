const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

// Codex final-verification regression coverage (F6): proves the three
// completion-control guarantees login-flow.test.js now makes, against the
// REAL script via real child-process exit codes — not by reasoning about
// the code, by actually running it under each condition.
const SCRIPT = path.join(__dirname, 'login-flow.test.js');

function run(env) {
  try {
    const stdout = execFileSync('node', [SCRIPT], {
      env: { ...process.env, ...env },
      encoding: 'utf8',
      timeout: 20_000,
    });
    return { code: 0, stdout };
  } catch (err) {
    // execFileSync throws on non-zero exit; err.status is the real exit code.
    return { code: err.status, stdout: err.stdout, stderr: err.stderr, timedOut: err.signal === 'SIGTERM' && err.status === null };
  }
}

test('F6 regression: a forced silent-exit attempt (process.exit(0) before any explicit outcome) is still reported non-zero', () => {
  const result = run({ SELENIUM_TEST_FORCE_SILENT_EXIT: '1' });
  assert.notEqual(result.code, 0, 'the process.on(\'exit\') safety net must override a bare process.exit(0) and force a non-zero code — a silent zero-test exit must be impossible');
});

test('F6 regression: a hung driver-startup is reported as a bounded, explicit EXECUTION_BLOCKED, not an infinite hang', () => {
  const result = run({ SELENIUM_TEST_FORCE_HANG: '1', SELENIUM_DRIVER_STARTUP_TIMEOUT_MS: '2000' });
  assert.notEqual(result.code, 0, 'a hung driver startup must exit non-zero, never 0');
  assert.match(result.stdout || '', /SELENIUM_LAB_STATUS: EXECUTION_BLOCKED/, 'a bounded timeout must produce the explicit EXECUTION_BLOCKED status line, not silence');
});

test('F6 regression: the real, unmodified code path never exits 0 without an explicit EXECUTED/2-of-2-passed status (works in both this sandbox\'s EXECUTION_BLOCKED environment and a CI runner with real Chrome)', () => {
  // Deliberately portable across two real, different environments: this
  // sandbox (no compatible chromedriver/Chromium pairing — see
  // driver-factory.js) reports EXECUTION_BLOCKED; a GitHub Actions runner
  // with real Chrome reports EXECUTED with 2/2 passed. Either real outcome
  // is acceptable — what must NEVER happen is exit 0 with neither status
  // line printed, which is exactly the bug this fix closes.
  const result = run({});
  const stdout = result.stdout || '';
  const blocked = /SELENIUM_LAB_STATUS: EXECUTION_BLOCKED/.test(stdout);
  const executed = /SELENIUM_LAB_STATUS: EXECUTED/.test(stdout);
  assert.ok(blocked || executed, `real run must print an explicit status line (got neither) — stdout: ${stdout}`);
  if (blocked) {
    assert.notEqual(result.code, 0, 'EXECUTION_BLOCKED must exit non-zero');
  } else {
    assert.match(stdout, /SELENIUM_LAB_SUMMARY: 2\/2 passed/, 'a real EXECUTED run must report the full expected test count');
    assert.equal(result.code, 0, 'a genuine 2/2 pass must exit 0');
  }
});
