'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createIdempotencyStore } = require('../lib/idempotency-store');

test('handle() calls executeFn exactly once for a given key across sequential calls', async () => {
  const store = createIdempotencyStore();
  let callCount = 0;
  const executeFn = async () => { callCount += 1; return { value: callCount }; };

  const first = await store.handle('key-1', executeFn);
  const second = await store.handle('key-1', executeFn);

  assert.equal(callCount, 1);
  assert.equal(first.value, 1);
  assert.equal(second.value, 1);
});

test('handle() calls executeFn exactly once for a given key across real concurrent (racing) calls', async () => {
  const store = createIdempotencyStore();
  let callCount = 0;
  const executeFn = async () => {
    callCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { value: callCount };
  };

  // Fire 10 real concurrent calls with the SAME key before any of
  // them resolves — this is the real race this lab exists to prove
  // is handled correctly, not just the simpler sequential-replay case.
  const results = await Promise.all(
    Array.from({ length: 10 }, () => store.handle('racing-key', executeFn)),
  );

  assert.equal(callCount, 1, 'the real side effect must run exactly once despite 10 concurrent callers');
  assert.ok(results.every((r) => r.value === 1));
});

test('handle() calls executeFn independently for different keys', async () => {
  const store = createIdempotencyStore();
  let callCount = 0;
  const executeFn = async () => { callCount += 1; return callCount; };

  const a = await store.handle('key-a', executeFn);
  const b = await store.handle('key-b', executeFn);

  assert.equal(callCount, 2);
  assert.notEqual(a, b);
});

test('has() and size() reflect real store state', async () => {
  const store = createIdempotencyStore();
  assert.equal(store.has('x'), false);
  assert.equal(store.size(), 0);
  await store.handle('x', async () => 1);
  assert.equal(store.has('x'), true);
  assert.equal(store.size(), 1);
});
