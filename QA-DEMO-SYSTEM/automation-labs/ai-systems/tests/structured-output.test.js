'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { completeStructured } = require('../lib/mock-provider');
const { validateStructuredOutput } = require('../lib/schema-validator');

const ORDER_LINE_SCHEMA = {
  type: 'object',
  required: ['quantity', 'item'],
  properties: {
    quantity: { type: 'integer', minimum: 1 },
    item: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

test('structured output: a well-formed order line produces schema-valid JSON', () => {
  const text = completeStructured({ prompt: '2x QA Demo Klavye.' });
  const { valid, parsed, errors } = validateStructuredOutput(text, ORDER_LINE_SCHEMA);
  assert.equal(valid, true, `expected valid, got errors: ${JSON.stringify(errors)}`);
  assert.equal(parsed.quantity, 2);
  assert.equal(parsed.item, 'QA Demo Klavye');
});

test('structured output: an unparseable model response is caught as a parse error, not silently coerced', () => {
  const text = completeStructured({ prompt: 'gibberish with no order line shape' });
  const { valid, parseError } = validateStructuredOutput(text, ORDER_LINE_SCHEMA);
  assert.equal(valid, false);
  assert.ok(parseError, 'a genuinely malformed response must surface a parse error');
});

test('structured output: valid JSON that violates the schema (wrong type) is rejected', () => {
  const { valid, errors } = validateStructuredOutput('{"quantity": "two", "item": "QA Demo Mouse"}', ORDER_LINE_SCHEMA);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.instancePath === '/quantity'));
});

test('structured output: an unexpected additional property is rejected (additionalProperties: false)', () => {
  const { valid, errors } = validateStructuredOutput('{"quantity": 1, "item": "X", "note": "unexpected"}', ORDER_LINE_SCHEMA);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.keyword === 'additionalProperties'));
});
