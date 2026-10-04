'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createIdempotentServer } = require('../lib/idempotent-server');
const { createOrder } = require('../lib/idempotent-client');

async function withServer(fn) {
  const { server, getSideEffectCount } = createIdempotentServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn({ baseUrl, getSideEffectCount });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('a request with no Idempotency-Key header is rejected with a real 400', async () => {
  await withServer(async ({ baseUrl }) => {
    const res = await createOrder(baseUrl, undefined);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /Idempotency-Key/);
  });
});

test('the first request with a real key creates a real order (side effect runs once)', async () => {
  await withServer(async ({ baseUrl, getSideEffectCount }) => {
    const res = await createOrder(baseUrl, 'order-key-1');
    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.body.orderId, 'number');
    assert.equal(getSideEffectCount(), 1);
  });
});

test('replaying the exact same Idempotency-Key returns the identical cached order, with NO duplicate side effect', async () => {
  await withServer(async ({ baseUrl, getSideEffectCount }) => {
    const first = await createOrder(baseUrl, 'order-key-2');
    const replay = await createOrder(baseUrl, 'order-key-2');

    assert.equal(replay.statusCode, 200);
    assert.equal(replay.body.orderId, first.body.orderId, 'a replay must return the SAME real order, not a new one');
    assert.equal(getSideEffectCount(), 1, 'the real side effect must not run a second time for a replayed key');
  });
});

test('a different Idempotency-Key creates a genuinely separate real order', async () => {
  await withServer(async ({ baseUrl, getSideEffectCount }) => {
    const a = await createOrder(baseUrl, 'order-key-3a');
    const b = await createOrder(baseUrl, 'order-key-3b');

    assert.notEqual(a.body.orderId, b.body.orderId);
    assert.equal(getSideEffectCount(), 2);
  });
});

test('10 real concurrent requests with the same key over real HTTP produce exactly one real order', async () => {
  await withServer(async ({ baseUrl, getSideEffectCount }) => {
    const responses = await Promise.all(
      Array.from({ length: 10 }, () => createOrder(baseUrl, 'concurrent-key')),
    );

    const orderIds = new Set(responses.map((r) => r.body.orderId));
    assert.equal(orderIds.size, 1, 'all 10 real concurrent requests must observe the SAME real order id');
    assert.equal(getSideEffectCount(), 1, 'the real side effect must run exactly once despite 10 real concurrent HTTP requests');
  });
});
