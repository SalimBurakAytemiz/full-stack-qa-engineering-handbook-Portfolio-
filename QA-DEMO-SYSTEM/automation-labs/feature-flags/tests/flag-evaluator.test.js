'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFlagEvaluator, bucketOf } = require('../lib/flag-evaluator');

test('evaluate() is deterministic — the same flag and userId always produce the same answer', () => {
  const evaluator = createFlagEvaluator({ beta: { percentage: 50 } });
  const first = evaluator.evaluate('beta', { userId: 'user-42' });
  for (let i = 0; i < 20; i += 1) {
    assert.equal(evaluator.evaluate('beta', { userId: 'user-42' }), first, 'repeated real evaluations must not flip');
  }
});

test('evaluate() throws on an unknown flag key or a missing userId', () => {
  const evaluator = createFlagEvaluator({ beta: { percentage: 50 } });
  assert.throws(() => evaluator.evaluate('does-not-exist', { userId: 'user-1' }), /unknown flag/);
  assert.throws(() => evaluator.evaluate('beta', {}), TypeError);
});

test('a 0% rollout is real off for every real user, and 100% is real on for every real user', () => {
  const evaluator = createFlagEvaluator({ off: { percentage: 0 }, on: { percentage: 100 } });
  for (let i = 0; i < 50; i += 1) {
    assert.equal(evaluator.evaluate('off', { userId: `user-${i}` }), false);
    assert.equal(evaluator.evaluate('on', { userId: `user-${i}` }), true);
  }
});

test('a 25% rollout over 2000 real distinct users lands within a real statistical tolerance of 25%', () => {
  const evaluator = createFlagEvaluator({ partial: { percentage: 25 } });
  const sampleSize = 2000;
  let onCount = 0;
  for (let i = 0; i < sampleSize; i += 1) {
    if (evaluator.evaluate('partial', { userId: `user-${i}` })) onCount += 1;
  }
  const observedPercentage = (onCount / sampleSize) * 100;
  assert.ok(
    Math.abs(observedPercentage - 25) < 3,
    `observed ${observedPercentage}% is too far from the configured 25% rollout (sample size ${sampleSize})`
  );
});

test('an allowList entry is on regardless of the configured percentage', () => {
  const evaluator = createFlagEvaluator({ beta: { percentage: 0, allowList: ['vip-user'] } });
  assert.equal(evaluator.evaluate('beta', { userId: 'vip-user' }), true);
  assert.equal(evaluator.evaluate('beta', { userId: 'regular-user' }), false);
});

test('a denyList entry is off even when it matches a segment or a 100% rollout', () => {
  const evaluator = createFlagEvaluator({
    beta: { percentage: 100, denyList: ['banned-user'] },
  });
  assert.equal(evaluator.evaluate('beta', { userId: 'banned-user' }), false);
  assert.equal(evaluator.evaluate('beta', { userId: 'normal-user' }), true);
});

test('a segment rule turns the flag on for a matching context even at 0% rollout', () => {
  const evaluator = createFlagEvaluator({
    beta: { percentage: 0, segments: [{ country: 'TR', plan: 'enterprise' }] },
  });
  assert.equal(evaluator.evaluate('beta', { userId: 'u1', country: 'TR', plan: 'enterprise' }), true);
  assert.equal(evaluator.evaluate('beta', { userId: 'u2', country: 'TR', plan: 'free' }), false);
  assert.equal(evaluator.evaluate('beta', { userId: 'u3', country: 'US', plan: 'enterprise' }), false);
});

test('bucketOf() always returns a real integer in [0, 100)', () => {
  for (let i = 0; i < 500; i += 1) {
    const bucket = bucketOf('some-flag', `user-${i}`);
    assert.ok(Number.isInteger(bucket) && bucket >= 0 && bucket < 100, `bucket ${bucket} out of range`);
  }
});
