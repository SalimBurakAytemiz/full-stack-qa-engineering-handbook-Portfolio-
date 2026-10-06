'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parse, isValid, compare, classifyBump, isUnstableApi } = require('../lib/semver');

test('parse() extracts major/minor/patch/prerelease/build from a real version string', () => {
  const v = parse('2.5.1-beta.3+build.7');
  assert.equal(v.major, 2);
  assert.equal(v.minor, 5);
  assert.equal(v.patch, 1);
  assert.deepEqual(v.prerelease, ['beta', '3']);
  assert.deepEqual(v.build, ['build', '7']);
});

test('isValid() rejects genuinely malformed version strings', () => {
  assert.equal(isValid('1.2'), false);
  assert.equal(isValid('v1.2.3'), false);
  assert.equal(isValid('1.2.3.4'), false);
  assert.equal(isValid('1.2.3'), true);
});

test('compare() orders standard MAJOR.MINOR.PATCH bumps correctly', () => {
  assert.equal(compare('1.0.0', '2.0.0'), -1);
  assert.equal(compare('1.2.0', '1.1.9'), 1);
  assert.equal(compare('1.2.3', '1.2.3'), 0);
});

test('compare() gives a prerelease lower precedence than the same version without one', () => {
  assert.equal(compare('1.0.0-alpha', '1.0.0'), -1);
  assert.equal(compare('1.0.0', '1.0.0-alpha'), 1);
});

test('compare() orders prerelease identifiers per spec clause 11 (numeric < alphanumeric, then lexical)', () => {
  assert.equal(compare('1.0.0-alpha', '1.0.0-alpha.1'), -1);
  assert.equal(compare('1.0.0-alpha.1', '1.0.0-alpha.beta'), -1);
  assert.equal(compare('1.0.0-alpha.beta', '1.0.0-beta'), -1);
  assert.equal(compare('1.0.0-1', '1.0.0-2'), -1);
});

test('compare() ignores build metadata for precedence, per spec clause 10', () => {
  assert.equal(compare('1.0.0+build1', '1.0.0+build2'), 0);
});

test('classifyBump() reports MAJOR/MINOR/PATCH correctly for a stable (>=1.0.0) package', () => {
  assert.equal(classifyBump('1.2.3', '2.0.0'), 'MAJOR');
  assert.equal(classifyBump('1.2.3', '1.3.0'), 'MINOR');
  assert.equal(classifyBump('1.2.3', '1.2.4'), 'PATCH');
  assert.equal(classifyBump('1.2.3', '1.2.3'), 'SAME');
  assert.equal(classifyBump('1.2.3', '1.2.2'), 'DOWNGRADE');
});

test('classifyBump() classifies a 0.x -> 0.(x+1) bump as a genuine MINOR change, not MAJOR', () => {
  // This is the repository's own real situation (every workspace is
  // 0.1.0): the major field never changes here, so field-by-field
  // comparison correctly reports MINOR, not MAJOR. isUnstableApi()
  // below is the separate signal for the SemVer clause 4 caveat.
  assert.equal(classifyBump('0.1.0', '0.2.0'), 'MINOR');
});

test('isUnstableApi() reports true for every 0.y.z version (SemVer clause 4) and false at or above 1.0.0', () => {
  assert.equal(isUnstableApi('0.1.0'), true);
  assert.equal(isUnstableApi('0.9.9'), true);
  assert.equal(isUnstableApi('1.0.0'), false);
  assert.equal(isUnstableApi('2.3.4'), false);
});
