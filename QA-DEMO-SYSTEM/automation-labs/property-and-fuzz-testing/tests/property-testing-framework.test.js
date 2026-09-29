'use strict';

// Tests the property-testing framework itself, the same discipline
// this repository already applied to unreliable-server.js (chaos lab)
// and pii-response-scanner.js (privacy lab): a fixture/framework that
// lies about its own behavior would invalidate every property test
// built on top of it.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { makeRng, gen, shrink, forAll } = require('../lib/property-testing');

test('property framework: the same seed produces the exact same sequence of generated values (reproducibility)', () => {
  const rng1 = makeRng(42);
  const rng2 = makeRng(42);
  const seq1 = Array.from({ length: 10 }, () => rng1.intBetween(0, 1000));
  const seq2 = Array.from({ length: 10 }, () => rng2.intBetween(0, 1000));
  assert.deepEqual(seq1, seq2, 'identical seeds must produce identical sequences — this is what makes a failing property run replayable');
});

test('property framework: different seeds produce different sequences (real randomness, not a constant)', () => {
  const rng1 = makeRng(1);
  const rng2 = makeRng(2);
  const seq1 = Array.from({ length: 10 }, () => rng1.intBetween(0, 1_000_000));
  const seq2 = Array.from({ length: 10 }, () => rng2.intBetween(0, 1_000_000));
  assert.notDeepEqual(seq1, seq2);
});

test('property framework: a true property genuinely passes across all generated runs', () => {
  // Real property: addition is commutative — genuinely true for all
  // integers, so this must pass for every one of the 200 generated pairs.
  const result = forAll(
    gen.arrayOf(gen.int(-1000, 1000), { minLength: 2, maxLength: 2 }),
    ([a, b]) => a + b === b + a,
    { seed: 7, runs: 200 },
  );
  assert.equal(result.passed, true);
});

test('property framework: a deliberately false property is caught, not silently accepted', () => {
  // Deliberately broken "property": claims every generated integer is
  // even. Constructed specifically to prove the framework catches a
  // real counterexample — same "engineer the failure on purpose"
  // discipline as this repository's other labs.
  const result = forAll(
    gen.int(0, 1000),
    (n) => n % 2 === 0,
    { seed: 3, runs: 50 },
  );
  assert.equal(result.passed, false, 'a false property over a range including odd numbers must be caught');
  assert.equal(result.failingInput % 2, 1, 'the raw failing input itself must actually violate the property');
});

test('property framework: shrinking finds a minimal failing case, not just the first-found (possibly large) counterexample', () => {
  // Property fails for any n > 100. Without shrinking, the first
  // counterexample the seeded sequence happens to hit could be, say,
  // 743 — a far less readable bug report than the true boundary, 101.
  const result = forAll(
    gen.int(0, 10_000),
    (n) => n <= 100,
    { seed: 11, runs: 500, shrinker: shrink.int(0) },
  );
  assert.equal(result.passed, false);
  assert.ok(result.shrunkInput > 100, 'the shrunk value must still be a genuine counterexample');
  assert.ok(result.shrunkInput <= result.failingInput, 'shrinking must never produce a LARGER counterexample than the one it started from');
  // The true minimal counterexample for "n <= 100" over non-negative
  // integers is exactly 101 — a real, verifiable claim, not a vague
  // "smaller is better" assertion.
  assert.equal(result.shrunkInput, 101, `expected shrinking to reach the exact minimal counterexample 101, got ${result.shrunkInput}`);
});

test('property framework: an exception thrown by the property itself counts as a genuine failure, not a crash of the test runner', () => {
  const result = forAll(
    gen.int(-10, 10),
    (n) => {
      if (n === 0) throw new Error('division by zero, deliberately');
      return 100 / n !== undefined;
    },
    { seed: 5, runs: 50, shrinker: shrink.int(0) },
  );
  // With seed 5 over [-10,10] across 50 runs, 0 is certain to appear.
  assert.equal(result.passed, false);
  assert.ok(result.error instanceof Error);
});
