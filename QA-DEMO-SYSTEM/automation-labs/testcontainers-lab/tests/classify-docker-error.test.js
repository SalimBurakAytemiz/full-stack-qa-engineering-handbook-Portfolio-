'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { looksLikeNoDockerDaemon } = require('../lib/classify-docker-error');

test('recognizes the real ECONNREFUSED/ENOENT docker.sock message observed in this sandbox', () => {
  const real = "connect ENOENT /var/run/docker.sock";
  assert.equal(looksLikeNoDockerDaemon(real), true);
});

test('recognizes "Cannot connect to the Docker daemon"', () => {
  assert.equal(looksLikeNoDockerDaemon('Cannot connect to the Docker daemon at unix:///var/run/docker.sock'), true);
});

test('recognizes testcontainers\' own "no working strategy" message', () => {
  assert.equal(
    looksLikeNoDockerDaemon('Could not find a working container runtime strategy'),
    true,
  );
});

test('does NOT classify an unrelated application error as a missing-daemon error (negative case)', () => {
  assert.equal(looksLikeNoDockerDaemon('TypeError: cannot read properties of undefined'), false);
  assert.equal(looksLikeNoDockerDaemon('assertion failed: expected 200, got 404'), false);
});

test('handles a non-string/undefined input without throwing', () => {
  assert.equal(looksLikeNoDockerDaemon(undefined), false);
  assert.equal(looksLikeNoDockerDaemon(null), false);
});
