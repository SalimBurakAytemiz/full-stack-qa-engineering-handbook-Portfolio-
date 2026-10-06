'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createRateLimitedServer } = require('../lib/rate-limited-server');
const { ping } = require('../lib/ping-client');

function fakeClock(startAt = 0) {
  let current = startAt;
  return { now: () => current, advance: (ms) => { current += ms; } };
}

async function withServer(options, fn) {
  const instance = createRateLimitedServer(options);
  await new Promise((resolve) => instance.server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${instance.server.address().port}`;
  try {
    await fn({ baseUrl, ...instance });
  } finally {
    await new Promise((resolve) => instance.server.close(resolve));
  }
}

test('requests within capacity succeed with a real 200', async () => {
  const clock = fakeClock();
  await withServer({ capacity: 3, refillRatePerMs: 0, now: clock.now }, async ({ baseUrl }) => {
    const r1 = await ping(baseUrl);
    const r2 = await ping(baseUrl);
    const r3 = await ping(baseUrl);
    assert.equal(r1.statusCode, 200);
    assert.equal(r2.statusCode, 200);
    assert.equal(r3.statusCode, 200);
  });
});

test('a request exceeding capacity gets a real 429, never a silently dropped or slow response', async () => {
  const clock = fakeClock();
  await withServer({ capacity: 2, refillRatePerMs: 0, now: clock.now }, async ({ baseUrl, getAcceptedCount, getRejectedCount }) => {
    await ping(baseUrl);
    await ping(baseUrl);
    const over = await ping(baseUrl);

    assert.equal(over.statusCode, 429);
    assert.equal(over.body.error, 'rate limit exceeded');
    assert.equal(getAcceptedCount(), 2);
    assert.equal(getRejectedCount(), 1);
  });
});

test('after enough real (fake-clock) time passes, the bucket refills and a previously-429 request now succeeds', async () => {
  const clock = fakeClock();
  await withServer({ capacity: 1, refillRatePerMs: 0.01, now: clock.now }, async ({ baseUrl }) => {
    const first = await ping(baseUrl);
    assert.equal(first.statusCode, 200);

    const tooSoon = await ping(baseUrl);
    assert.equal(tooSoon.statusCode, 429);

    clock.advance(100); // 1 token per 100ms at refillRatePerMs 0.01
    const afterRefill = await ping(baseUrl);
    assert.equal(afterRefill.statusCode, 200, 'a real refill after real elapsed time must allow the next request through');
  });
});
