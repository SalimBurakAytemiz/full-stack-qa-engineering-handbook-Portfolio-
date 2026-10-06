'use strict';

// Real aggregate run: builds a real flag-evaluator instance and drives
// it through the same scenarios the unit tests cover, printing the
// real observed results — no mocked hash function, no fabricated
// distribution.
// TR: Gerçek bir flag-evaluator örneği oluşturup aynı senaryoları
// gerçek çalıştıran bir agregat koşudur.

const { createFlagEvaluator } = require('./lib/flag-evaluator');

function main() {
  const results = [];
  let failures = 0;

  const evaluator = createFlagEvaluator({
    'new-checkout': { percentage: 30 },
    'vip-dashboard': { percentage: 0, allowList: ['vip-1'] },
    'maintenance-block': { percentage: 100, denyList: ['admin-1'] },
    'enterprise-feature': { percentage: 0, segments: [{ plan: 'enterprise' }] },
  });

  const sampleSize = 5000;
  let onCount = 0;
  for (let i = 0; i < sampleSize; i += 1) {
    if (evaluator.evaluate('new-checkout', { userId: `user-${i}` })) onCount += 1;
  }
  const observedPercentage = (onCount / sampleSize) * 100;
  const rolloutOk = Math.abs(observedPercentage - 30) < 2;
  results.push({ ok: rolloutOk, label: `30% rollout over ${sampleSize} real users -> observed ${observedPercentage.toFixed(2)}% (expected ~30%)` });
  if (!rolloutOk) failures += 1;

  const deterministic = evaluator.evaluate('new-checkout', { userId: 'user-7' });
  const stillDeterministic = evaluator.evaluate('new-checkout', { userId: 'user-7' });
  const determinismOk = deterministic === stillDeterministic;
  results.push({ ok: determinismOk, label: `real repeated evaluation for user-7 is deterministic (both calls: ${deterministic})` });
  if (!determinismOk) failures += 1;

  const vipOn = evaluator.evaluate('vip-dashboard', { userId: 'vip-1' });
  const regularOff = evaluator.evaluate('vip-dashboard', { userId: 'regular-1' });
  const allowListOk = vipOn === true && regularOff === false;
  results.push({ ok: allowListOk, label: `allowList: vip-1 -> ${vipOn}, regular-1 -> ${regularOff}` });
  if (!allowListOk) failures += 1;

  const adminBlocked = evaluator.evaluate('maintenance-block', { userId: 'admin-1' });
  const othersBlocked = evaluator.evaluate('maintenance-block', { userId: 'anyone-else' });
  const denyListOk = adminBlocked === false && othersBlocked === true;
  results.push({ ok: denyListOk, label: `denyList at 100% rollout: admin-1 -> ${adminBlocked}, anyone-else -> ${othersBlocked}` });
  if (!denyListOk) failures += 1;

  const enterpriseOn = evaluator.evaluate('enterprise-feature', { userId: 'u1', plan: 'enterprise' });
  const freeOff = evaluator.evaluate('enterprise-feature', { userId: 'u2', plan: 'free' });
  const segmentOk = enterpriseOn === true && freeOff === false;
  results.push({ ok: segmentOk, label: `segment targeting at 0% rollout: enterprise plan -> ${enterpriseOn}, free plan -> ${freeOff}` });
  if (!segmentOk) failures += 1;

  console.log('--- Feature Flags Lab: real scenario results ---');
  for (const r of results) {
    console.log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.label}`);
  }

  const status = failures === 0 ? 'EXECUTED' : 'FAILED';
  console.log(`\nFEATURE_FLAGS_LAB_STATUS: ${status}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main();
