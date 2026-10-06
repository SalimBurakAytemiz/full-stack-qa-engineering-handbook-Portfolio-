'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createUnreliableServer } = require('../lib/unreliable-server');
const { createResilientClient, RetriesExhaustedError } = require('../lib/resilient-client');
const { createCircuitBreaker, CircuitOpenError } = require('../lib/circuit-breaker');

test('resilient client: an all-ok dependency succeeds on the first attempt, no retries needed', async () => {
  const srv = createUnreliableServer({ faultSchedule: ['ok'] });
  const baseUrl = await srv.start();
  try {
    const client = createResilientClient({ baseUrl, timeoutMs: 200, retryDelaysMs: [10, 20] });
    const result = await client.call();
    assert.equal(result.status, 'ok');
    assert.equal(srv.getCallCount(), 1, 'a first-try success must not trigger any retry calls');
  } finally {
    await srv.stop();
  }
});

test('resilient client: transient failures are retried and the call eventually succeeds', async () => {
  const srv = createUnreliableServer({ faultSchedule: ['error_500', 'error_500', 'ok'] });
  const baseUrl = await srv.start();
  try {
    const client = createResilientClient({ baseUrl, timeoutMs: 200, retryDelaysMs: [5, 5] });
    const result = await client.call();
    assert.equal(result.status, 'ok');
    assert.equal(srv.getCallCount(), 3, 'exactly 2 failed attempts plus 1 successful attempt must have hit the server');
  } finally {
    await srv.stop();
  }
});

test('resilient client: persistent failure beyond max retries surfaces a real, explicit error — never a silent success', async () => {
  const srv = createUnreliableServer({ faultSchedule: ['error_500'] });
  const baseUrl = await srv.start();
  try {
    const client = createResilientClient({ baseUrl, timeoutMs: 200, retryDelaysMs: [5, 5] });
    await assert.rejects(client.call(), RetriesExhaustedError);
    assert.equal(srv.getCallCount(), 3, 'must attempt exactly 1 + retryDelaysMs.length times, no more');
  } finally {
    await srv.stop();
  }
});

test('resilient client: a hung dependency triggers the client-side timeout budget, not an indefinite wait', async () => {
  const srv = createUnreliableServer({ faultSchedule: ['hang'] });
  const baseUrl = await srv.start();
  try {
    const client = createResilientClient({ baseUrl, timeoutMs: 50, retryDelaysMs: [] });
    const startedAt = Date.now();
    await assert.rejects(client.call(), RetriesExhaustedError);
    const elapsedMs = Date.now() - startedAt;
    assert.ok(elapsedMs < 500, `timeout budget must bound the wait — took ${elapsedMs}ms`);
  } finally {
    await srv.stop();
  }
});

test('resilient client + circuit breaker: once the circuit opens, further calls stop hitting the dependency at all', async () => {
  const srv = createUnreliableServer({ faultSchedule: ['error_500'] });
  const baseUrl = await srv.start();
  try {
    const cb = createCircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 10_000 });
    const client = createResilientClient({ baseUrl, timeoutMs: 100, retryDelaysMs: [], circuitBreaker: cb });

    await assert.rejects(client.call()); // failure 1 -> CLOSED still
    await assert.rejects(client.call()); // failure 2 -> OPENS
    assert.equal(cb.getState(), cb.OPEN);
    const callsBeforeOpenProof = srv.getCallCount();

    // Real chaos-engineering proof: the circuit protects the downstream
    // — subsequent calls must NOT increase the real server's call count.
    await assert.rejects(client.call(), CircuitOpenError);
    await assert.rejects(client.call(), CircuitOpenError);
    assert.equal(srv.getCallCount(), callsBeforeOpenProof, 'the unreliable server must receive zero additional real requests while the circuit is open');
  } finally {
    await srv.stop();
  }
});
