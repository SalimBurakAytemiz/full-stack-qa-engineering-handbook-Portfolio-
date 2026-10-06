#!/usr/bin/env node
'use strict';

// Real distributed-messaging lab: exercises the hand-rolled broker and
// both consumer implementations through one combined scenario, then
// gates PASS/FAIL on the real, observed outcomes — never a canned
// result.
// TR: Elle yazılmış broker ve iki consumer implementasyonunu birleşik
// bir senaryo üzerinden GERÇEKTEN çalıştırır; PASS/FAIL kararı GERÇEK,
// gözlemlenen sonuçlara dayanır.

const { createBroker } = require('./lib/broker');
const { createNonIdempotentConsumer, createIdempotentConsumer } = require('./lib/idempotent-consumer');

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('DISTRIBUTED_MESSAGING_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

function main() {
  const checks = [];

  // 1. Ordering within a key.
  {
    const broker = createBroker();
    const received = [];
    broker.subscribe('orders', (e) => received.push(e.payload));
    ['created', 'paid', 'shipped', 'delivered'].forEach((payload) => broker.publish('orders', { key: 'order-1', payload }));
    const ordered = JSON.stringify(received) === JSON.stringify(['created', 'paid', 'shipped', 'delivered']);
    checks.push({ name: 'ordering within a key is preserved', pass: ordered, detail: JSON.stringify(received) });
  }

  // 2. At-least-once delivery + dead-letter queue for a poison message.
  {
    const broker = createBroker();
    broker.subscribe(
      'notifications',
      () => {
        throw new Error('always fails');
      },
      { maxRetries: 2 },
    );
    broker.publish('notifications', { id: 'poison-1', payload: 'bad' });
    const dlq = broker.getDeadLetterQueue('notifications');
    const inDlq = dlq.length === 1 && dlq[0].messageId === 'poison-1' && dlq[0].attempts === 3;
    checks.push({ name: 'a permanently-failing message lands in the dead-letter queue after exhausting retries', pass: inDlq, detail: JSON.stringify(dlq) });
  }

  // 3. The real non-idempotent-vs-idempotent comparison.
  {
    const broker = createBroker();
    const bad = createNonIdempotentConsumer();
    const good = createIdempotentConsumer();
    broker.subscribe('payments', bad.handle, { id: 'bad', maxRetries: 1 });
    broker.publish('payments', { id: 'payment-1', payload: {} });

    const broker2 = createBroker();
    broker2.subscribe('payments', good.handle, { id: 'good', maxRetries: 1 });
    broker2.publish('payments', { id: 'payment-1', payload: {} });

    const doubleApplied = bad.getAppliedCount() === 2;
    const appliedOnce = good.getAppliedCount() === 1;
    checks.push({ name: 'non-idempotent consumer double-applies under retry (proves the bug is real)', pass: doubleApplied, detail: `appliedCount=${bad.getAppliedCount()}` });
    checks.push({ name: 'idempotent consumer applies exactly once despite the same retry (proves the fix)', pass: appliedOnce, detail: `appliedCount=${good.getAppliedCount()}` });
  }

  console.log('--- Distributed Messaging Lab: real scenario results ---');
  for (const c of checks) {
    console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.name} (${c.detail})`);
  }

  const allPassed = checks.every((c) => c.pass);
  if (!allPassed) {
    console.log('\nDISTRIBUTED_MESSAGING_LAB_STATUS: FAILED');
    reportOutcome(1);
    return;
  }
  console.log('\nDISTRIBUTED_MESSAGING_LAB_STATUS: EXECUTED');
  reportOutcome(0);
}

main();
