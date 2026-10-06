'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { timedCheck, overallVerdict, retry } = require('../lib/synthetic-monitor');

test('a check that succeeds within budget is classified PASS', async () => {
  const result = await timedCheck('fast-ok', async () => ({ ok: true }), 1000);
  assert.equal(result.verdict, 'PASS');
  assert.equal(result.ok, true);
  assert.equal(result.withinBudget, true);
});

test('a check that succeeds but exceeds its budget is classified SLOW, never conflated with FAIL', async () => {
  const result = await timedCheck('slow-but-ok', async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
    return { ok: true };
  }, 10);
  assert.equal(result.verdict, 'SLOW');
  assert.equal(result.ok, true, 'a slow check is still functionally OK, not a failure');
});

test('a check that returns ok:false is classified FAIL regardless of how fast it returned', async () => {
  const result = await timedCheck('fast-fail', async () => ({ ok: false, detail: 'simulated down' }), 1000);
  assert.equal(result.verdict, 'FAIL');
});

test('a check whose function throws is classified FAIL, never an uncaught crash of the monitor itself', async () => {
  const result = await timedCheck('throws', async () => {
    throw new Error('connection refused');
  }, 1000);
  assert.equal(result.verdict, 'FAIL');
  assert.match(result.detail, /connection refused/);
});

test('overallVerdict is NO_GO if any check FAILed, even if others PASSed', () => {
  const verdict = overallVerdict([{ verdict: 'PASS' }, { verdict: 'FAIL' }, { verdict: 'PASS' }]);
  assert.equal(verdict, 'NO_GO');
});

test('overallVerdict is GO_DEGRADED if nothing FAILed but something was SLOW', () => {
  const verdict = overallVerdict([{ verdict: 'PASS' }, { verdict: 'SLOW' }]);
  assert.equal(verdict, 'GO_DEGRADED');
});

test('overallVerdict is GO only when every check PASSed', () => {
  const verdict = overallVerdict([{ verdict: 'PASS' }, { verdict: 'PASS' }]);
  assert.equal(verdict, 'GO');
});

test('retry gives up and returns the last real failing result after exhausting its budget (proves it does not retry forever)', async () => {
  let attempts = 0;
  const result = await retry(async () => {
    attempts += 1;
    return { ok: false, detail: `attempt ${attempts}` };
  }, { retries: 2, delayMs: 5 });
  assert.equal(attempts, 3, '1 initial attempt + 2 retries = 3 total calls');
  assert.equal(result.ok, false);
});

test('retry returns as soon as a real attempt succeeds, without using its full retry budget', async () => {
  let attempts = 0;
  const result = await retry(async () => {
    attempts += 1;
    return { ok: attempts === 2 };
  }, { retries: 5, delayMs: 5 });
  assert.equal(attempts, 2, 'should stop immediately once an attempt succeeds, not keep retrying');
  assert.equal(result.ok, true);
});
