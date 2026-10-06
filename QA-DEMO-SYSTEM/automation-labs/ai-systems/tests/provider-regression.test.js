'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const dataset = require('../fixtures/golden-dataset.json');
const { compareModelVersions } = require('../lib/provider-regression');

test('model/provider regression: comparing a model to itself finds zero regressions (positive control)', () => {
  const { regressions } = compareModelVersions(dataset, 'mock-v1', 'mock-v1');
  assert.deepEqual(regressions, []);
});

test('model/provider regression: a real behavioral change (mock-v2-regressed) is detected as a genuine regression', () => {
  const { regressions, resultsB } = compareModelVersions(dataset, 'mock-v1', 'mock-v2-regressed');
  assert.ok(regressions.length > 0, 'the deliberately regressed model version must be caught, not silently accepted');
  assert.ok(regressions.some((r) => r.id === 'golden.greeting.en'), 'the specific case whose behavior actually changed must be named');
  assert.ok(resultsB.failed > 0);
});
