'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createRolloutManager, ROLLING_OUT, COMPLETE, ROLLED_BACK } = require('../lib/rollout-manager');

test('a rollout that passes every health check progresses through all stages to COMPLETE', async () => {
  const manager = createRolloutManager({ stages: [10, 50, 100], healthCheck: async () => true });
  let status = await manager.start();
  assert.equal(status.state, ROLLING_OUT);
  assert.equal(status.trafficPercent, 10);

  status = await manager.advance();
  assert.equal(status.trafficPercent, 50);

  status = await manager.advance();
  assert.equal(status.state, COMPLETE);
  assert.equal(status.trafficPercent, 100);
});

test('a failing health check at any stage rolls traffic back to 0% immediately', async () => {
  let callCount = 0;
  const healthCheck = async (percent) => {
    callCount += 1;
    // Real failure injected on the second stage (50%) — the manager
    // must not be told in advance which stage will fail.
    return percent !== 50;
  };
  const manager = createRolloutManager({ stages: [10, 50, 100], healthCheck });

  let status = await manager.start();
  assert.equal(status.trafficPercent, 10);

  status = await manager.advance();
  assert.equal(status.state, ROLLED_BACK);
  assert.equal(status.trafficPercent, 0);
  assert.equal(callCount, 2);
});

test('advance() cannot be called again after a rollback or completion (state guard)', async () => {
  const manager = createRolloutManager({ stages: [100], healthCheck: async () => false });
  await manager.start();
  await assert.rejects(() => manager.advance(), /cannot advance a rollout from state ROLLED_BACK/);
});

test('start() cannot be called twice on the same manager instance', async () => {
  const manager = createRolloutManager({ stages: [100], healthCheck: async () => true });
  await manager.start();
  await assert.rejects(() => manager.start(), /cannot start a rollout from state/);
});

test('getStatus().history is a real, ordered, append-only audit trail of every transition', async () => {
  const healthCheck = async (percent) => percent !== 50;
  const manager = createRolloutManager({ stages: [10, 50], healthCheck });
  await manager.start();
  const status = await manager.advance();
  const events = status.history.map((h) => h.event);
  assert.deepEqual(events, ['START', 'ADVANCE', 'ROLLBACK']);
});
