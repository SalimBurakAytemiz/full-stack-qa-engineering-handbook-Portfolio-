#!/usr/bin/env node
'use strict';

// Real mutation testing against the real, unmodified backend module
// (backend/src/services/products.service.js), never written to on disk —
// each mutant is written only to a throwaway scratch file and required
// from there. See README.md for the full scope-boundary disclosure.
// TR: GERÇEK backend modülüne karşı GERÇEK mutation testing — hedef dosya
// DİSKTE HİÇ DEĞİŞTİRİLMEZ; her mutant yalnızca geçici bir scratch
// dosyasına yazılır.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { generateMutants } = require('./lib/mutate');
const { buildAssertions, buildBaselineAssertions } = require('./lib/assertions');

const TARGET_PATH = path.join(__dirname, '..', '..', 'backend', 'src', 'services', 'products.service.js');
const { getDatabase } = require(path.join(__dirname, '..', '..', 'backend', 'src', 'database', 'connection'));

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('MUTATION_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

function runAssertionsAgainst(mod, assertions) {
  const failures = [];
  for (const a of assertions) {
    try {
      a.run(mod);
    } catch (err) {
      failures.push({ name: a.name, error: err.message });
    }
  }
  return failures;
}

function runMutationPass(originalSource, assertionsBuilder, label) {
  const assertions = assertionsBuilder({ getDatabase });
  const mutants = generateMutants(originalSource);
  const results = [];
  const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mutation-lab-'));

  try {
    for (const mutant of mutants) {
      if (mutant.status === 'SKIPPED_PATTERN_NOT_FOUND') {
        results.push({ ...mutant, outcome: 'SKIPPED' });
        continue;
      }
      const mutantFile = path.join(scratchDir, `${mutant.id}.js`);
      fs.writeFileSync(mutantFile, mutant.mutatedSource, 'utf8');
      let outcome;
      let detail = '';
      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const mutatedMod = require(mutantFile);
        const failures = runAssertionsAgainst(mutatedMod, assertions);
        if (failures.length > 0) {
          outcome = 'KILLED';
          detail = failures.map((f) => f.name).join(', ');
        } else {
          outcome = 'SURVIVED';
        }
      } catch (err) {
        outcome = 'KILLED';
        detail = `threw: ${err.message}`;
      }
      results.push({ ...mutant, outcome, detail });
    }
  } finally {
    fs.rmSync(scratchDir, { recursive: true, force: true });
  }

  const generated = results.filter((r) => r.outcome !== 'SKIPPED');
  const killed = generated.filter((r) => r.outcome === 'KILLED');
  const survived = generated.filter((r) => r.outcome === 'SURVIVED');
  const skipped = results.filter((r) => r.outcome === 'SKIPPED');
  const score = generated.length > 0 ? killed.length / generated.length : 0;

  console.log(`\n--- ${label} ---`);
  for (const r of results) {
    console.log(`  [${r.outcome}] ${r.id} — ${r.description}${r.detail ? ` (${r.detail})` : ''}`);
  }
  console.log(`MUTATION_SCORE (${label}): ${killed.length}/${generated.length} killed (${(score * 100).toFixed(1)}%)`);
  if (skipped.length > 0) {
    console.log(`  ${skipped.length} mutator(s) SKIPPED — target pattern not found in current source.`);
  }

  return { results, generated, killed, survived, skipped, score };
}

function main() {
  if (!fs.existsSync(TARGET_PATH)) {
    console.log(`MUTATION_LAB_ERROR: target file not found at ${TARGET_PATH}`);
    reportOutcome(1);
    return;
  }
  const originalSource = fs.readFileSync(TARGET_PATH, 'utf8');

  // Baseline sanity: the REAL, unmutated module must pass every assertion
  // (both batteries), or no mutation score is meaningful.
  const realMod = require(TARGET_PATH);
  const baselineRealFailures = runAssertionsAgainst(realMod, buildBaselineAssertions({ getDatabase }));
  const strengthenedRealFailures = runAssertionsAgainst(realMod, buildAssertions({ getDatabase }));
  if (baselineRealFailures.length > 0 || strengthenedRealFailures.length > 0) {
    console.log('MUTATION_LAB_ERROR: the REAL (unmutated) module failed its own assertions — aborting, no mutation score computed.');
    for (const f of [...baselineRealFailures, ...strengthenedRealFailures]) console.log(`  - ${f.name}: ${f.error}`);
    reportOutcome(1);
    return;
  }
  console.log('MUTATION_LAB: baseline (unmutated, real module) passed both assertion batteries.');

  // Pass 1 — documents a real mutation-testing finding: with the exact
  // test-coverage pattern M2.3's property test used (ids always inserted
  // in ascending order), the ORDER BY removal mutant is expected to
  // survive. This pass does NOT gate pass/fail — it is reported for the
  // finding's own sake.
  const baselinePass = runMutationPass(originalSource, buildBaselineAssertions, 'baseline battery (mirrors M2.3 coverage gap)');

  // Pass 2 — the real PASS/FAIL decision. Strengthened battery closes the
  // gap found in pass 1 by inserting out of id order.
  const strengthenedPass = runMutationPass(originalSource, buildAssertions, 'strengthened battery (real gate)');

  console.log('');
  const survivedBaseline = baselinePass.survived.some((s) => s.id === 'sql-order-by-removed');
  const survivedStrengthened = strengthenedPass.survived.some((s) => s.id === 'sql-order-by-removed');
  if (survivedBaseline && !survivedStrengthened) {
    console.log(
      'MUTATION_LAB_FINDING: sql-order-by-removed SURVIVED the baseline battery (mirrors the M2.3 property test coverage gap) but is KILLED by the strengthened, out-of-id-order battery — a real test-suite gap, found and closed in this milestone.',
    );
  } else if (survivedBaseline && survivedStrengthened) {
    console.log(
      'MUTATION_LAB_FINDING: sql-order-by-removed SURVIVED both batteries, including the strengthened one that inserts rows out of id order. This is a real example of the classic "equivalent mutant" problem: for this exact query shape (a full scan of a table whose rowid IS the id, no secondary index), the current SQLite engine returns rows in rowid order regardless of ORDER BY, so no black-box behavioral test — however thorough — can observe a difference. The ORDER BY clause is still correct to keep (it is the only thing making the order a documented guarantee rather than an undefined implementation detail that could change if SQLite\'s query planner ever did), but this mutant cannot be killed from outside. See COMMON-MISTAKES.md for the full writeup.',
    );
  } else {
    console.log(
      'MUTATION_LAB_NOTE: sql-order-by-removed was killed by both batteries on this run (did not reproduce as a survivor) — no equivalent-mutant finding to report this time; the strengthened-battery score below is still the real gate.',
    );
  }

  const MINIMUM_SCORE = 0.8;
  if (strengthenedPass.score < MINIMUM_SCORE) {
    console.log(
      `\nMUTATION_LAB_STATUS: FAILED (strengthened-battery score ${(strengthenedPass.score * 100).toFixed(1)}% below minimum ${(MINIMUM_SCORE * 100).toFixed(1)}%)`,
    );
    if (strengthenedPass.survived.length > 0) {
      console.log('Surviving mutants (real test-suite gaps, reported honestly, not hidden):');
      for (const s of strengthenedPass.survived) console.log(`  - ${s.id}: ${s.description}`);
    }
    reportOutcome(1);
    return;
  }
  console.log('\nMUTATION_LAB_STATUS: EXECUTED');
  reportOutcome(0);
}

main();
