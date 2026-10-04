'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createTokenBucket } = require('../lib/token-bucket');

function fakeClock(startAt = 0) {
  let current = startAt;
  return {
    now: () => current,
    advance: (ms) => { current += ms; },
  };
}

test('tryConsume() succeeds while tokens remain, using a real fake-clock-driven refill', () => {
  const clock = fakeClock();
  const bucket = createTokenBucket({ capacity: 3, refillRatePerMs: 0, now: clock.now });

  assert.equal(bucket.tryConsume(), true);
  assert.equal(bucket.tryConsume(), true);
  assert.equal(bucket.tryConsume(), true);
  assert.equal(bucket.tryConsume(), false, 'a 4th consume with no refill must fail');
});

test('tryConsume() fails without deducting tokens when the bucket is empty', () => {
  const clock = fakeClock();
  const bucket = createTokenBucket({ capacity: 1, refillRatePerMs: 0, now: clock.now });

  assert.equal(bucket.tryConsume(), true);
  assert.equal(bucket.tryConsume(), false);
  assert.equal(bucket.tryConsume(), false, 'tokens must stay at 0, not go negative or recover on their own');
});

test('the bucket genuinely refills over real elapsed time (via the injected clock), not on a fixed timer tick', () => {
  const clock = fakeClock();
  const bucket = createTokenBucket({ capacity: 2, refillRatePerMs: 0.01, now: clock.now }); // 1 token per 100ms

  assert.equal(bucket.tryConsume(), true);
  assert.equal(bucket.tryConsume(), true);
  assert.equal(bucket.tryConsume(), false, 'empty immediately after consuming capacity');

  clock.advance(50);
  assert.equal(bucket.tryConsume(), false, 'half the refill time has passed — still not enough for one token');

  clock.advance(50); // total 100ms elapsed since the bucket emptied
  assert.equal(bucket.tryConsume(), true, 'a full 100ms has passed — exactly one token should be available');
});

test('refill never exceeds the real configured capacity', () => {
  const clock = fakeClock();
  const bucket = createTokenBucket({ capacity: 2, refillRatePerMs: 1, now: clock.now });

  clock.advance(1000); // far more real time than needed to overflow capacity
  assert.equal(bucket.getTokens(), 2, 'tokens must cap at capacity, never exceed it');
});

test('createTokenBucket() rejects a non-positive capacity or a negative refill rate (a zero refill rate is valid — a bucket that never refills)', () => {
  assert.throws(() => createTokenBucket({ capacity: 0, refillRatePerMs: 1 }), TypeError);
  assert.throws(() => createTokenBucket({ capacity: 1, refillRatePerMs: -1 }), TypeError);
  assert.doesNotThrow(() => createTokenBucket({ capacity: 1, refillRatePerMs: 0 }));
});
