#!/usr/bin/env node
'use strict';

// Real supply-chain-security lab: generates a real CycloneDX SBOM for the
// backend workspace, runs a real npm audit (full graph and production-only),
// cross-references audit findings against the SBOM, and checks the real
// package-lock.json for integrity-hash coverage. Every number below is
// observed from this run, not pre-decided.
// TR: Gercek bir tedarik zinciri guvenligi laboratuvari: backend workspace
// icin gercek bir CycloneDX SBOM uretir, gercek bir npm audit calistirir,
// bulgulari SBOM ile capraz referanslar ve gercek package-lock.json'daki
// integrity hash kapsamini kontrol eder.

const path = require('node:path');
const fs = require('node:fs');
const { generateSbom, listComponentNames } = require('./lib/sbom');
const { runAudit, listVulnerablePackageNames } = require('./lib/audit');
const { crossReferenceVulnerabilitiesWithSbom } = require('./lib/cross-reference');
const { checkLockfileIntegrity } = require('./lib/lockfile-integrity');

const REPO_ROOT = path.join(__dirname, '..', '..');

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('SUPPLY_CHAIN_SECURITY_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

function main() {
  const checks = [];

  // 1. Real SBOM generation for the backend workspace.
  const sbomDoc = generateSbom('backend', REPO_ROOT);
  const sbomComponentNames = listComponentNames(sbomDoc);
  checks.push({
    name: 'a real CycloneDX SBOM is generated for the backend workspace with at least one component',
    pass: sbomDoc.bomFormat === 'CycloneDX' && sbomComponentNames.length > 0,
    detail: `bomFormat=${sbomDoc.bomFormat}, components=${sbomComponentNames.length}`,
  });

  // 2. Real full-graph audit (includes devDependencies) and real production-only audit.
  const fullAudit = runAudit(REPO_ROOT);
  const prodAudit = runAudit(REPO_ROOT, { omitDev: true });
  checks.push({
    name: 'production-only audit scope never reports more vulnerabilities than the full dependency graph',
    pass: prodAudit.metadata.vulnerabilities.total <= fullAudit.metadata.vulnerabilities.total,
    detail: `full=${fullAudit.metadata.vulnerabilities.total}, prodOnly=${prodAudit.metadata.vulnerabilities.total}`,
  });

  // 3. Cross-reference: every vulnerable PRODUCTION package must be traceable in the backend SBOM.
  const prodVulnNames = listVulnerablePackageNames(prodAudit);
  const crossRef = crossReferenceVulnerabilitiesWithSbom(prodVulnNames, sbomComponentNames);
  checks.push({
    name: 'every production-scoped vulnerable package (if any) is traceable in the backend SBOM — no blind spot',
    pass: crossRef.notInSbom.length === 0,
    detail: `prodVulnerable=${prodVulnNames.length}, tracedInSbom=${crossRef.tracedInSbom.length}, notInSbom=${JSON.stringify(crossRef.notInSbom)}`,
  });

  // 4. Real lockfile integrity check against the real package-lock.json.
  const lockfileDoc = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package-lock.json'), 'utf8'));
  const integrityResult = checkLockfileIntegrity(lockfileDoc);
  checks.push({
    name: 'every externally-fetched lockfile entry carries an integrity hash (local workspace links correctly excluded)',
    pass: integrityResult.violations.length === 0,
    detail: `checked=${integrityResult.checked}, excludedLocalWorkspaces=${integrityResult.excludedLocalWorkspaces.length}, violations=${JSON.stringify(integrityResult.violations)}`,
  });

  console.log('--- Supply Chain Security Lab: real scenario results ---');
  for (const c of checks) {
    console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.name} (${c.detail})`);
  }
  console.log(
    `\n  Full-graph audit (incl. dev): ${fullAudit.metadata.vulnerabilities.total} vulnerable advisories across ${fullAudit.metadata.dependencies.total} dependencies.`,
  );
  console.log(
    `  Production-only audit: ${prodAudit.metadata.vulnerabilities.total} vulnerable advisories across ${prodAudit.metadata.dependencies.total} dependencies.`,
  );
  console.log(
    `  Excluded local workspace links (correctly not flagged): ${integrityResult.excludedLocalWorkspaces.join(', ')}`,
  );

  const allPassed = checks.every((c) => c.pass);
  if (!allPassed) {
    console.log('\nSUPPLY_CHAIN_SECURITY_LAB_STATUS: FAILED');
    reportOutcome(1);
    return;
  }
  console.log('\nSUPPLY_CHAIN_SECURITY_LAB_STATUS: EXECUTED');
  reportOutcome(0);
}

main();
