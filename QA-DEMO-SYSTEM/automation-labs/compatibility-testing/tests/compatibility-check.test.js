'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const Ajv = require('ajv');
const { checkCompatibility } = require('../lib/compatibility-check');
const { simulateFieldRemoved, simulateTypeChanged, simulateFieldAdded } = require('../lib/simulate-api-change');

const baselineSchema = {
  type: 'object',
  required: ['products'],
  properties: {
    products: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'price', 'in_stock'],
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          price: { type: 'number' },
          in_stock: { type: 'boolean' },
        },
      },
    },
  },
};

const realSample = {
  products: [{ id: 1, name: 'Widget', price: 10, in_stock: true }],
};

test('a sample matching the baseline exactly is classified NO_CHANGE', () => {
  const ajv = new Ajv();
  const result = checkCompatibility(ajv, baselineSchema, realSample);
  assert.equal(result.classification, 'NO_CHANGE');
  assert.equal(result.valid, true);
});

test('removing a required field is classified BREAKING (proves a removed field is caught)', () => {
  const ajv = new Ajv();
  const candidate = simulateFieldRemoved(realSample, 'in_stock');
  const result = checkCompatibility(ajv, baselineSchema, candidate);
  assert.equal(result.classification, 'BREAKING');
  assert.ok(result.breakingErrors.some((e) => e.keyword === 'required'));
});

test('changing a field\'s type is classified BREAKING (proves a type change is caught)', () => {
  const ajv = new Ajv();
  const candidate = simulateTypeChanged(realSample, 'price', '10.00');
  const result = checkCompatibility(ajv, baselineSchema, candidate);
  assert.equal(result.classification, 'BREAKING');
  assert.ok(result.breakingErrors.some((e) => e.keyword === 'type'));
});

test('adding a brand-new field is classified SAFE_ADDITIVE, not BREAKING (proves additive changes are not false-flagged)', () => {
  const ajv = new Ajv();
  const candidate = simulateFieldAdded(realSample, 'currency', 'USD');
  const result = checkCompatibility(ajv, baselineSchema, candidate);
  assert.equal(result.classification, 'SAFE_ADDITIVE');
  assert.deepEqual(result.additiveFields, ['products[].currency']);
});
