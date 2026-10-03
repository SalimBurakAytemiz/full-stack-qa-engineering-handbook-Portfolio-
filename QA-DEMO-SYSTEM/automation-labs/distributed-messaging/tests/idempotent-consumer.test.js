'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createBroker } = require('../lib/broker');
const { createNonIdempotentConsumer, createIdempotentConsumer } = require('../lib/idempotent-consumer');

test('a NON-idempotent consumer double-applies its side effect when at-least-once delivery retries it (the real bug)', () => {
  const broker = createBroker();
  const consumer = createNonIdempotentConsumer();
  broker.subscribe('payments', consumer.handle, { maxRetries: 1 });

  broker.publish('payments', { id: 'payment-42', payload: { amount: 100 } });

  assert.equal(
    consumer.getAppliedCount(),
    2,
    'non-idempotent handler applies the side effect on both the failed first attempt and the successful retry',
  );
});

test('an IDEMPOTENT consumer applies its side effect exactly once despite the same at-least-once retry (the real fix)', () => {
  const broker = createBroker();
  const consumer = createIdempotentConsumer();
  broker.subscribe('payments', consumer.handle, { maxRetries: 1 });

  broker.publish('payments', { id: 'payment-42', payload: { amount: 100 } });

  assert.equal(
    consumer.getAppliedCount(),
    1,
    'idempotent handler must dedupe by message id and apply the side effect exactly once',
  );
});

test('an idempotent consumer still applies the side effect once per DISTINCT message id (dedup is per-id, not global)', () => {
  const broker = createBroker();
  const consumer = createIdempotentConsumer();
  broker.subscribe('payments', consumer.handle, { maxRetries: 1 });

  broker.publish('payments', { id: 'payment-1', payload: { amount: 10 } });
  broker.publish('payments', { id: 'payment-2', payload: { amount: 20 } });

  assert.equal(consumer.getAppliedCount(), 2);
});
