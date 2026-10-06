'use strict';

// Real aggregate run: validates this repository's OWN real
// CHANGELOG.md and the 6 real workspace package.json files, then
// proves the canary rollout manager's pass-through and rollback
// behavior against two real (in-process, hand-rolled) scenarios.
// TR: Bu reponun KENDİ GERÇEK CHANGELOG.md ve 6 gerçek workspace
// package.json dosyasına karşı GERÇEK bir agregat çalıştırmadır.

const fs = require('node:fs');
const path = require('node:path');
const { isValid, isUnstableApi, classifyBump } = require('./lib/semver');
const { checkChangelog } = require('./lib/changelog-check');
const { createRolloutManager } = require('./lib/rollout-manager');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const WORKSPACE_PACKAGE_JSON_PATHS = [
  'package.json',
  'QA-DEMO-SYSTEM/package.json',
  'QA-DEMO-SYSTEM/backend/package.json',
  'QA-DEMO-SYSTEM/api-tests/package.json',
  'QA-DEMO-SYSTEM/automation-labs/package.json',
  'QA-DEMO-SYSTEM/web-tests/package.json',
];

function readWorkspaceVersions() {
  return WORKSPACE_PACKAGE_JSON_PATHS.map((relPath) => {
    const absPath = path.join(REPO_ROOT, relPath);
    const pkg = JSON.parse(fs.readFileSync(absPath, 'utf8'));
    return { relPath, name: pkg.name, version: pkg.version };
  });
}

async function main() {
  const results = [];
  let failures = 0;

  // --- Real check 1: every real workspace package.json has a valid semver version ---
  const workspaces = readWorkspaceVersions();
  for (const ws of workspaces) {
    const ok = isValid(ws.version);
    if (!ok) failures += 1;
    results.push({
      ok,
      label: `${ws.relPath} version "${ws.version}" is valid semver`,
    });
  }

  const unstableCount = workspaces.filter((ws) => isUnstableApi(ws.version)).length;
  results.push({
    ok: true,
    label: `${unstableCount}/${workspaces.length} real workspaces are under SemVer clause 4 (major=0, API explicitly unstable) — informational, not a failure`,
  });

  // --- Real check 2: structural validation of this repo's own real CHANGELOG.md ---
  const changelogPath = path.join(REPO_ROOT, 'CHANGELOG.md');
  const changelogMarkdown = fs.readFileSync(changelogPath, 'utf8');
  const changelogResult = checkChangelog(changelogMarkdown);
  results.push({
    ok: changelogResult.ok,
    label: `real CHANGELOG.md structural check: ${changelogResult.headings.length} headings parsed, ${changelogResult.violations.length} violation(s)`,
  });
  if (!changelogResult.ok) {
    failures += 1;
    for (const v of changelogResult.violations) {
      results.push({ ok: false, label: `  [${v.rule}] ${v.detail}` });
    }
  }

  // --- Real check 3: version-bump classification sanity on the repo's own real version ---
  const rootVersion = workspaces[0].version;
  const nextPatch = rootVersion.replace(/(\d+)$/, (n) => String(Number(n) + 1));
  const bump = classifyBump(rootVersion, nextPatch);
  results.push({
    ok: bump === 'PATCH',
    label: `classifyBump(real root version "${rootVersion}" -> "${nextPatch}") = ${bump}`,
  });
  if (bump !== 'PATCH') failures += 1;

  // --- Real check 4: canary rollout — full pass-through ---
  const successManager = createRolloutManager({ stages: [10, 50, 100], healthCheck: async () => true });
  await successManager.start();
  await successManager.advance();
  const successStatus = await successManager.advance();
  const successOk = successStatus.state === 'COMPLETE' && successStatus.trafficPercent === 100;
  results.push({
    ok: successOk,
    label: `canary rollout with all-healthy checks reaches COMPLETE at 100% traffic (observed: state=${successStatus.state}, traffic=${successStatus.trafficPercent}%)`,
  });
  if (!successOk) failures += 1;

  // --- Real check 5: canary rollout — automatic rollback on a real injected failure at the 50% stage ---
  const rollbackManager = createRolloutManager({
    stages: [10, 50, 100],
    healthCheck: async (percent) => percent !== 50,
  });
  await rollbackManager.start();
  const rollbackStatus = await rollbackManager.advance();
  const rollbackOk = rollbackStatus.state === 'ROLLED_BACK' && rollbackStatus.trafficPercent === 0;
  results.push({
    ok: rollbackOk,
    label: `canary rollout with a failing health check at 50% automatically rolls back to 0% traffic (observed: state=${rollbackStatus.state}, traffic=${rollbackStatus.trafficPercent}%, history=${JSON.stringify(rollbackStatus.history.map((h) => h.event))})`,
  });
  if (!rollbackOk) failures += 1;

  console.log('--- Release Engineering Lab: real scenario results ---');
  for (const r of results) {
    console.log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.label}`);
  }

  const status = failures === 0 ? 'EXECUTED' : 'FAILED';
  console.log(`\nRELEASE_ENGINEERING_LAB_STATUS: ${status}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error('RELEASE_ENGINEERING_LAB_STATUS: FAILED');
  console.error(err);
  process.exitCode = 1;
});
