'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { generateSbom, listComponentNames } = require('../lib/sbom');

const REPO_ROOT = path.join(__dirname, '..', '..', '..');

test('generateSbom runs the real `npm sbom` command and returns a real CycloneDX document for the backend workspace', () => {
  const doc = generateSbom('backend', REPO_ROOT);
  assert.equal(doc.bomFormat, 'CycloneDX');
  assert.ok(Array.isArray(doc.components));
  assert.ok(doc.components.length > 0, 'expected the real backend workspace to have real production dependencies listed');
});

test('listComponentNames extracts real component names from a real SBOM', () => {
  const doc = generateSbom('backend', REPO_ROOT);
  const names = listComponentNames(doc);
  assert.equal(names.length, doc.components.length);
  assert.ok(names.every((n) => typeof n === 'string' && n.length > 0));
});
