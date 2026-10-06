'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCircuitBreaker, CircuitOpenError } = require('../lib/circuit-breaker');

// A tiny, fully controllable fake clock — no real sleep anywhere in
// this file, so state transitions are proven deterministically and
// instantly, not by racing a real timer.
function fakeClock(startMs = 0) {
  let t = startMs;
  return { now: () => t, advance: (ms) => { t += ms; } };
}

test('circuit breaker: starts CLOSED and allows calls through', async () => {
  const cb = createCircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });
  assert.equal(cb.getState(), cb.CLOSED);
  const result = await cb.execute(async () => 'ok');
  assert.equal(result, 'ok');
  assert.equal(cb.getState(), cb.CLOSED);
});

test('circuit breaker: opens after reaching the failure threshold, not before', async () => {
  const cb = createCircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });
  const failingFn = async () => { throw new Error('downstream failed'); };

  await assert.rejects(cb.execute(failingFn));
  assert.equal(cb.getState(), cb.CLOSED, 'must not open after only 1 failure with threshold 3');
  await assert.rejects(cb.execute(failingFn));
  assert.equal(cb.getState(), cb.CLOSED, 'must not open after only 2 failures with threshold 3');
  await assert.rejects(cb.execute(failingFn));
  assert.equal(cb.getState(), cb.OPEN, 'must open on the 3rd consecutive failure');
});

test('circuit breaker: while OPEN, calls fail fast WITHOUT invoking the wrapped function', async () => {
  const clock = fakeClock();
  const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 5000, now: clock.now });
  await assert.rejects(cb.execute(async () => { throw new Error('fail'); }));
  assert.equal(cb.getState(), cb.OPEN);

  let calls = 0;
  const fn = async () => { calls += 1; return 'should not run'; };
  await assert.rejects(cb.execute(fn), CircuitOpenError);
  assert.equal(calls, 0, 'the wrapped function must never be invoked while the circuit is open and the reset timeout has not elapsed');
});

test('circuit breaker: transitions to HALF_OPEN after resetTimeoutMs, and a successful trial call closes it', async () => {
  const clock = fakeClock();
  const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, now: clock.now });
  await assert.rejects(cb.execute(async () => { throw new Error('fail'); }));
  assert.equal(cb.getState(), cb.OPEN);

  clock.advance(1000);
  const result = await cb.execute(async () => 'trial-succeeded');
  assert.equal(result, 'trial-succeeded');
  assert.equal(cb.getState(), cb.CLOSED, 'a successful HALF_OPEN trial call must close the circuit');
});

test('circuit breaker: a failed HALF_OPEN trial call re-opens the circuit immediately', async () => {
  const clock = fakeClock();
  const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, now: clock.now });
  await assert.rejects(cb.execute(async () => { throw new Error('fail'); }));
  assert.equal(cb.getState(), cb.OPEN);

  clock.advance(1000);
  await assert.rejects(cb.execute(async () => { throw new Error('trial also fails'); }));
  assert.equal(cb.getState(), cb.OPEN, 'a failed trial must re-open the circuit, not leave it half-open or closed');
});
