'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const dataset = require('../fixtures/golden-dataset.json');
const { complete } = require('../lib/mock-provider');
const { runGoldenEval, scoreCase } = require('../lib/eval-harness');

test('golden dataset evaluation: every case in the real fixture passes against mock-v1 (positive control)', () => {
  const report = runGoldenEval(dataset, (prompt) => complete({ prompt, model: 'mock-v1' }).text);
  assert.equal(report.failed, 0, `expected 0 failures, got: ${JSON.stringify(report.results.filter((r) => !r.pass), null, 2)}`);
  assert.equal(report.passed, dataset.cases.length);
});

test('eval harness exact-match: a wrong classification is correctly scored as a failure', () => {
  const testCase = dataset.cases.find((c) => c.id === 'golden.classification.stock-status');
  const scored = scoreCase(testCase, 'IN_STOCK'); // deliberately wrong for stock_quantity=0
  assert.equal(scored.pass, false, 'exact-match scoring must fail a genuinely wrong answer, not silently pass it');
});

test('eval harness contains-match: a response missing a required keyword is correctly scored as a failure', () => {
  const testCase = dataset.cases.find((c) => c.id === 'golden.greeting.en');
  const scored = scoreCase(testCase, 'Good day to you.');
  assert.equal(scored.pass, false);
  assert.ok(scored.missing.length > 0, 'the missing-keywords list must be populated for a genuine failure');
});
