'use strict';

// Composed, deterministic chaos scenarios — fixed fault schedules, never
// random — proving the resilience stack (circuit breaker + resilient
// client + unreliable server) behaves correctly end-to-end across a
// realistic failure-then-recovery timeline, not just in isolated unit
// tests.
// TR: Sabit (asla rastgele olmayan) hata programları ile bileşik chaos
// senaryoları — dayanıklılık yığınının (circuit breaker + resilient
// client + unreliable server) gerçekçi bir hata-sonra-toparlanma
// zaman çizelgesinde uçtan uca doğru davrandığını kanıtlar.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createUnreliableServer } = require('../lib/unreliable-server');
const { createResilientClient } = require('../lib/resilient-client');
const { createCircuitBreaker } = require('../lib/circuit-breaker');

test('chaos scenario: a dependency that fails, opens the circuit, then recovers — the client resumes serving real responses without manual intervention', async () => {
  // Real schedule: 3 failures (enough to open a threshold-2 breaker),
  // then permanently healthy. This models a real, bounded outage.
  const srv = createUnreliableServer({ faultSchedule: ['error_500', 'error_500', 'error_500', 'ok'] });
  const baseUrl = await srv.start();
  try {
    const cb = createCircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 60 });
    const client = createResilientClient({ baseUrl, timeoutMs: 100, retryDelaysMs: [], circuitBreaker: cb });

    await assert.rejects(client.call()); // call 1: error_500, failure 1
    await assert.rejects(client.call()); // call 2: error_500, failure 2 -> OPEN
    assert.equal(cb.getState(), cb.OPEN);

    await assert.rejects(client.call()); // circuit OPEN, short-circuited — no real call
    assert.equal(srv.getCallCount(), 2, 'the short-circuited call must not have reached the server');

    // Real wait for the reset timeout to elapse — short and bounded,
    // consistent with this repository's other real-timer-based tests.
    await new Promise((resolve) => setTimeout(resolve, 70));

    // By now the schedule has moved to index 2 (error_500, the 3rd
    // fault) on the HALF_OPEN trial call — proving the breaker doesn't
    // assume recovery, it VERIFIES it with a real call.
    await assert.rejects(client.call());
    assert.equal(cb.getState(), cb.OPEN, 'a failed HALF_OPEN trial must re-open the circuit, not assume recovery');

    await new Promise((resolve) => setTimeout(resolve, 70));
    // Schedule index 3 -> 'ok': the real recovery call.
    const result = await client.call();
    assert.equal(result.status, 'ok');
    assert.equal(cb.getState(), cb.CLOSED, 'a successful HALF_OPEN trial must close the circuit — real recovery, not a guess');
  } finally {
    await srv.stop();
  }
});

test('chaos scenario: an intermittent (non-consecutive) fault pattern never reaches the failure threshold and the circuit stays CLOSED throughout', async () => {
  // Every other call fails, but never enough CONSECUTIVE failures to
  // trip a threshold-3 breaker — a real, meaningful distinction from
  // the sustained-outage scenario above.
  const srv = createUnreliableServer({ faultSchedule: ['ok', 'error_500', 'ok', 'error_500', 'ok', 'error_500'] });
  const baseUrl = await srv.start();
  try {
    const cb = createCircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 10_000 });
    const client = createResilientClient({ baseUrl, timeoutMs: 100, retryDelaysMs: [5], circuitBreaker: cb });

    for (let i = 0; i < 3; i += 1) {
      const result = await client.call();
      assert.equal(result.status, 'ok');
    }
    assert.equal(cb.getState(), cb.CLOSED, 'consecutive-failure threshold must never trip on an alternating ok/error pattern that the retry layer already absorbs');
  } finally {
    await srv.stop();
  }
});
