# Foundations: Why AI/ML/LLM Testing Is Different (and What Stays the Same)

## What changes

Traditional software testing assumes a deterministic function: given
input X, the same output Y every time. An ML or LLM-backed component
breaks that assumption in three ways a QA engineer has to account for:

1. **Non-determinism.** The same prompt can produce different output
   across calls (temperature, sampling, model updates). A test suite
   that asserts exact-string equality against a real model will be
   flaky by construction — not because the test is wrong, but because
   the assumption behind it is wrong.
2. **No single "correct" output.** Many valid summaries, phrasings, or
   classifications can all be acceptable. Testing shifts from
   "equals expected" to "scores acceptably against defined criteria"
   (see `02-LLM-AND-PROMPT-TESTING.md` — exact-match vs. contains-match
   vs. rubric scoring).
3. **The model itself can regress silently.** A provider-side model
   update, a fine-tune, or a prompt-template change can degrade quality
   without any code change in the calling system. Traditional
   regression testing (re-run the same suite, diff the result) still
   works here — the target of comparison changes from "did the code
   change" to "did the model's behavior change" (see
   `06-OBSERVABILITY-COST-AND-RELEASE-TESTING.md`).

## What stays the same

- **Boundary and equivalence-class thinking** still applies: a
  classification prompt has the same positive/negative/edge-case
  structure as any other classifier under test.
- **Regression discipline** still applies — golden datasets are just a
  regression suite whose "expected" side tolerates a range of valid
  answers instead of one exact string.
- **The "no fake PASS" discipline is, if anything, more important here**:
  a loosely-worded assertion (e.g. "output contains any of these ten
  words") can silently stop catching real regressions. This lab's own
  `provider-regression.test.js` originally had exactly this bug — see
  `COMMON-MISTAKES.md` for the real story.

## This lab's approach

`QA-DEMO-SYSTEM/automation-labs/ai-systems/lib/mock-provider.js` replaces
the non-deterministic part (the model) with a deterministic, rule-based
stand-in, so every other QA technique in this subfolder can be tested
without fighting non-determinism. This is a deliberate simplification,
disclosed everywhere it matters — see the scope-boundary note in this
subfolder's `README.md`. Testing a real model would additionally require
statistical acceptance thresholds (e.g. "pass rate over N runs must
exceed X%") rather than the single-run pass/fail this lab uses; that
technique is described but not executed here (no live provider is called
in canonical CI — see `AI_TEST_MODE=live` gating in
`02-LLM-AND-PROMPT-TESTING.md`).

## Classical ML testing (not covered by this lab)

Testing a classical ML model (e.g. a churn classifier, a fraud-scoring
model) — data/label quality checks, train/test/validation split
integrity, drift detection on live traffic, fairness/bias metrics across
protected groups — is a genuinely distinct discipline from LLM/prompt
testing and is **not** exercised by this lab. Knowledge of these
concepts exists at `AWARE` level only; no executable lab and no
professional experience back a stronger claim. See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
exact status.
