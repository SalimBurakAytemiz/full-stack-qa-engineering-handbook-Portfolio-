'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { complete } = require('../lib/mock-provider');

const TOKEN_BUDGET = 200; // max tokens (in + out) allowed per call in this lab's fixture scope
const LATENCY_BUDGET_MS = 5000;

test('token/cost budget validation: a normal prompt stays within the declared token budget', () => {
  const out = complete({ prompt: 'Say hello to a customer named Ayşe in English.' });
  const totalTokens = out.tokensIn + out.tokensOut;
  assert.ok(totalTokens <= TOKEN_BUDGET, `expected <= ${TOKEN_BUDGET} tokens, got ${totalTokens}`);
});

test('token/cost budget validation: an oversized prompt is correctly flagged as exceeding budget (real, not synthetic)', () => {
  const hugePrompt = `Summarize in one short sentence: ${'word '.repeat(500)}.`;
  const out = complete({ prompt: hugePrompt });
  const totalTokens = out.tokensIn + out.tokensOut;
  assert.ok(totalTokens > TOKEN_BUDGET, 'the oversized fixture must genuinely exceed the budget so the check has something real to catch');
});

test('latency budget validation: a mock call completes well within the latency budget', () => {
  const out = complete({ prompt: 'Say hello to a customer named Zeynep in English.' });
  assert.ok(out.latencyMs < LATENCY_BUDGET_MS, `expected < ${LATENCY_BUDGET_MS}ms, got ${out.latencyMs}ms`);
});
