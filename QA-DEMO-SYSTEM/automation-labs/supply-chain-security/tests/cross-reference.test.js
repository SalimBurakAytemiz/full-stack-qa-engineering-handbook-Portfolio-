'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { crossReferenceVulnerabilitiesWithSbom } = require('../lib/cross-reference');

test('a vulnerable package present in the SBOM is traced, not flagged as a gap', () => {
  const result = crossReferenceVulnerabilitiesWithSbom(['lodash'], ['lodash', 'express']);
  assert.deepEqual(result.tracedInSbom, ['lodash']);
  assert.deepEqual(result.notInSbom, []);
});

test('a vulnerable package absent from the SBOM is a real visibility gap', () => {
  const result = crossReferenceVulnerabilitiesWithSbom(['shadow-dep'], ['lodash', 'express']);
  assert.deepEqual(result.tracedInSbom, []);
  assert.deepEqual(result.notInSbom, ['shadow-dep']);
});

test('an empty vulnerability list produces no findings at all', () => {
  const result = crossReferenceVulnerabilitiesWithSbom([], ['lodash']);
  assert.deepEqual(result.tracedInSbom, []);
  assert.deepEqual(result.notInSbom, []);
});

test('mixed traced and untraced packages are partitioned correctly', () => {
  const result = crossReferenceVulnerabilitiesWithSbom(['a', 'b', 'c'], ['a', 'c']);
  assert.deepEqual(result.tracedInSbom, ['a', 'c']);
  assert.deepEqual(result.notInSbom, ['b']);
});
