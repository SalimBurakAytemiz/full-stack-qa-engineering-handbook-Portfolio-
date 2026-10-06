'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createBroker } = require('../lib/broker');

test('messages published for the same key are delivered to a handler in publish order', () => {
  const broker = createBroker();
  const received = [];
  broker.subscribe('orders', (envelope) => received.push(envelope.payload));

  broker.publish('orders', { key: 'order-1', payload: 'created' });
  broker.publish('orders', { key: 'order-1', payload: 'paid' });
  broker.publish('orders', { key: 'order-1', payload: 'shipped' });

  assert.deepEqual(received, ['created', 'paid', 'shipped']);
});

test('a handler that fails is retried, and succeeds without reaching the dead-letter queue if it recovers within maxRetries', () => {
  const broker = createBroker();
  let callCount = 0;
  broker.subscribe(
    'orders',
    () => {
      callCount += 1;
      if (callCount < 2) throw new Error('transient failure');
    },
    { maxRetries: 3 },
  );

  broker.publish('orders', { payload: 'x' });

  assert.equal(callCount, 2, 'handler should have been retried exactly once after the first failure');
  assert.deepEqual(broker.getDeadLetterQueue('orders'), []);
});

test('a handler that always fails is routed to the dead-letter queue after maxRetries is exhausted', () => {
  const broker = createBroker();
  let callCount = 0;
  broker.subscribe(
    'orders',
    () => {
      callCount += 1;
      throw new Error('permanent failure');
    },
    { maxRetries: 2, id: 'always-fails' },
  );

  broker.publish('orders', { id: 'poison-message', payload: 'bad' });

  assert.equal(callCount, 3, 'should attempt 1 initial delivery + 2 retries = 3 total calls');
  const dlq = broker.getDeadLetterQueue('orders');
  assert.equal(dlq.length, 1);
  assert.equal(dlq[0].messageId, 'poison-message');
  assert.equal(dlq[0].attempts, 3);
  assert.match(dlq[0].error, /permanent failure/);
});

test('each delivery attempt is recorded in the delivery log, including retries', () => {
  const broker = createBroker();
  let callCount = 0;
  broker.subscribe(
    'notifications',
    () => {
      callCount += 1;
      if (callCount < 3) throw new Error('fail');
    },
    { maxRetries: 5, id: 'retrying-sub' },
  );

  broker.publish('notifications', { id: 'msg-1', payload: 'hi' });

  const log = broker.getDeliveryLog().filter((entry) => entry.messageId === 'msg-1');
  assert.equal(log.length, 3);
  assert.deepEqual(log.map((entry) => entry.attempt), [1, 2, 3]);
});

test('two independent subscribers on the same topic each get their own independent retry/DLQ outcome', () => {
  const broker = createBroker();
  broker.subscribe('orders', () => {}, { id: 'healthy-sub', maxRetries: 1 });
  broker.subscribe(
    'orders',
    () => {
      throw new Error('this subscriber is broken');
    },
    { id: 'broken-sub', maxRetries: 0 },
  );

  broker.publish('orders', { id: 'msg-shared', payload: 'y' });

  assert.deepEqual(broker.getDeadLetterQueue('orders').map((d) => d.messageId), ['msg-shared']);
});
