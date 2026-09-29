'use strict';

// Model/provider regression detection: runs the SAME golden dataset
// against two model versions of the mock provider and reports any case
// whose pass/fail outcome flipped. This is real drift detection against
// a real (if deliberately synthetic) behavioral difference between
// mock-v1 and mock-v2-regressed — see mock-provider.js's
// MODEL_BEHAVIORS — not a hand-wired "always detects a difference" stub.
// TR: AYNI golden dataset'i iki model sürümüne karşı çalıştırıp
// geçti/kaldı sonucu DEĞİŞEN her vakayı raporlar — gerçek bir davranış
// farkına karşı gerçek bir regresyon tespitidir.

const { complete } = require('./mock-provider');
const { runGoldenEval } = require('./eval-harness');

function compareModelVersions(dataset, modelA, modelB) {
  const resultsA = runGoldenEval(dataset, (prompt) => complete({ prompt, model: modelA }).text);
  const resultsB = runGoldenEval(dataset, (prompt) => complete({ prompt, model: modelB }).text);

  const byId = new Map(resultsA.results.map((r) => [r.id, r]));
  const regressions = [];
  for (const rb of resultsB.results) {
    const ra = byId.get(rb.id);
    if (ra && ra.pass && !rb.pass) {
      regressions.push({ id: rb.id, was: 'pass', now: 'fail', modelA, modelB, actualA: ra.actual, actualB: rb.actual });
    }
  }
  return { modelA, modelB, resultsA, resultsB, regressions };
}

module.exports = { compareModelVersions };
