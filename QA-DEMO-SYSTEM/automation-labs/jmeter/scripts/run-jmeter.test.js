const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseJtl, determineExitCode } = require('./run-jmeter');

// Codex fix-campaign B5 — deterministic verification of the fail-gate
// LOGIC, independent of the `jmeter` binary itself (which cannot run in
// this sandbox — see EXECUTION.md for the XStream/libxstream root cause,
// re-verified this session). These fixture .jtl files are synthetic but
// structurally real JMeter CSV JTL output (header row + comma-separated
// values, matching this project's ResultCollector saveConfig fields) —
// they exist specifically so the gate's PASS/FAIL DECISION can be proven
// correct without depending on a blocked runtime.

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

test('a JTL where every sample succeeded -> gate exit code 0 (PASS)', () => {
  const content = fs.readFileSync(path.join(FIXTURES_DIR, 'passing-run.jtl'), 'utf-8');
  const outcome = parseJtl(content);
  assert.equal(outcome.malformed, false);
  assert.equal(outcome.total, 4);
  assert.equal(outcome.failed, 0);
  assert.equal(determineExitCode(outcome), 0);
});

test('a JTL with a functional assertion failure -> gate exit code 1 (FAIL)', () => {
  const content = fs.readFileSync(path.join(FIXTURES_DIR, 'failing-run.jtl'), 'utf-8');
  const outcome = parseJtl(content);
  assert.equal(outcome.total, 4);
  assert.equal(outcome.failed, 2);
  const loginFailure = outcome.failedRows.find((r) => r.label === 'POST /api/auth/login');
  assert.ok(loginFailure, 'expected the login row to be reported as a failed sample');
  assert.match(loginFailure.failureMessage, /demo-session-/);
  assert.equal(determineExitCode(outcome), 1);
});

test('the SAME failing JTL also demonstrates a duration/threshold assertion failure being caught by the same gate — not just functional failures', () => {
  const content = fs.readFileSync(path.join(FIXTURES_DIR, 'failing-run.jtl'), 'utf-8');
  const outcome = parseJtl(content);
  const durationFailure = outcome.failedRows.find((r) => r.label === 'GET /api/products');
  assert.ok(durationFailure, 'expected the slow /api/products row to be reported as a failed sample');
  assert.match(durationFailure.failureMessage, /3000ms|too slow/i);
});

test('an empty JTL file -> gate exit code 1 (never a silent pass)', () => {
  const outcome = parseJtl('');
  assert.equal(outcome.malformed, true);
  assert.equal(determineExitCode(outcome), 1);
});

test('a JTL missing the "success" column -> gate exit code 1 (never a silent pass)', () => {
  const outcome = parseJtl('timeStamp,elapsed,label\n1,2,GET /x\n');
  assert.equal(outcome.malformed, true);
  assert.equal(determineExitCode(outcome), 1);
});

test('a JTL with a header row but zero data rows -> gate exit code 1 (a run that executed nothing is not a pass)', () => {
  const outcome = parseJtl('timeStamp,elapsed,label,success\n');
  assert.equal(outcome.total, 0);
  assert.equal(determineExitCode(outcome), 1);
});

test('parseCsvLine correctly handles a quoted failureMessage containing a comma (real JMeter CSV escaping)', () => {
  const outcome = parseJtl(
    'timeStamp,elapsed,label,success,failureMessage\n1,2,GET /x,false,"expected 200, got 500"\n'
  );
  assert.equal(outcome.failed, 1);
  assert.equal(outcome.failedRows[0].failureMessage, 'expected 200, got 500');
});
