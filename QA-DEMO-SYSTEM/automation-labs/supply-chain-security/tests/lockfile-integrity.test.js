'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { checkLockfileIntegrity } = require('../lib/lockfile-integrity');

test('a real registry-resolved package with an integrity hash is not a violation', () => {
  const lock = {
    packages: {
      '': { name: 'root' },
      'node_modules/left-pad': {
        version: '1.3.0',
        resolved: 'https://registry.npmjs.org/left-pad/-/left-pad-1.3.0.tgz',
        integrity: 'sha512-abc123==',
      },
    },
  };
  const result = checkLockfileIntegrity(lock);
  assert.equal(result.checked, 1);
  assert.deepEqual(result.violations, []);
});

test('a real registry-resolved package MISSING its integrity hash is flagged as a violation (the real gap this checker exists to catch)', () => {
  const lock = {
    packages: {
      '': { name: 'root' },
      'node_modules/suspicious-pkg': {
        version: '2.0.0',
        resolved: 'https://registry.npmjs.org/suspicious-pkg/-/suspicious-pkg-2.0.0.tgz',
      },
    },
  };
  const result = checkLockfileIntegrity(lock);
  assert.equal(result.violations.length, 1);
  assert.equal(result.violations[0].path, 'node_modules/suspicious-pkg');
});

test('a local workspace entry (link: true, no integrity) is excluded, not flagged — proves no false positive', () => {
  const lock = {
    packages: {
      '': { name: 'root' },
      'node_modules/backend': { resolved: 'backend', link: true },
    },
  };
  const result = checkLockfileIntegrity(lock);
  assert.equal(result.checked, 0);
  assert.deepEqual(result.violations, []);
  assert.deepEqual(result.excludedLocalWorkspaces, ['node_modules/backend']);
});

test('an entry with no resolved field at all (e.g. the root entry) is skipped entirely', () => {
  const lock = {
    packages: {
      '': { name: 'root', version: '0.1.0' },
    },
  };
  const result = checkLockfileIntegrity(lock);
  assert.equal(result.checked, 0);
  assert.deepEqual(result.violations, []);
});

test('this repository\'s own real package-lock.json has zero integrity violations', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const lockPath = path.join(__dirname, '..', '..', '..', 'package-lock.json');
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const result = checkLockfileIntegrity(lock);
  assert.ok(result.checked > 0, 'expected to have actually checked real registry-resolved entries');
  assert.deepEqual(result.violations, [], `found real integrity violations: ${JSON.stringify(result.violations)}`);
});
