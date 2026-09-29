'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { checkLiveProviderAvailability } = require('../lib/live-provider');

test('live provider gating: without an API key, availability is EXTERNALLY_BLOCKED, never a silent mock fallback presented as real', () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const result = checkLiveProviderAvailability('openai');
    assert.equal(result.status, 'EXTERNALLY_BLOCKED');
    assert.match(result.reason, /OPENAI_API_KEY/);
  } finally {
    if (originalKey !== undefined) process.env.OPENAI_API_KEY = originalKey;
  }
});

test('live provider gating: an unknown provider name is also EXTERNALLY_BLOCKED, not a crash', () => {
  const result = checkLiveProviderAvailability('some-unsupported-provider');
  assert.equal(result.status, 'EXTERNALLY_BLOCKED');
  assert.match(result.reason, /unknown provider/);
});
