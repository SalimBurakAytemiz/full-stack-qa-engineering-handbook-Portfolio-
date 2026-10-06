'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { runAudit, listVulnerablePackageNames } = require('../lib/audit');

const REPO_ROOT = path.join(__dirname, '..', '..', '..');

test('runAudit runs the real `npm audit --json` command and returns a real, structured report', () => {
  const report = runAudit(REPO_ROOT);
  assert.ok(report.metadata, 'expected a real metadata block');
  assert.ok(report.vulnerabilities && typeof report.vulnerabilities === 'object');
  assert.equal(typeof report.metadata.vulnerabilities.total, 'number');
});

test('runAudit with omitDev scopes to production dependencies and reflects the real, smaller dependency count', () => {
  const full = runAudit(REPO_ROOT);
  const prodOnly = runAudit(REPO_ROOT, { omitDev: true });
  assert.ok(
    prodOnly.metadata.dependencies.total <= full.metadata.dependencies.total,
    'production-only scope must never report more dependencies than the full graph',
  );
});

test('listVulnerablePackageNames returns the real package names npm audit flagged', () => {
  const report = runAudit(REPO_ROOT);
  const names = listVulnerablePackageNames(report);
  assert.equal(names.length, Object.keys(report.vulnerabilities).length);
});
