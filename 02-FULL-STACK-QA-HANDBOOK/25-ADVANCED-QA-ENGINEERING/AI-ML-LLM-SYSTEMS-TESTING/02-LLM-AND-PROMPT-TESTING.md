# LLM and Prompt Testing

**Executable evidence:** `ai-systems/tests/prompt-testing.test.js`,
`ai-systems/tests/golden-eval.test.js`, `ai-systems/lib/eval-harness.js`,
`ai-systems/fixtures/golden-dataset.json`.

## Prompt testing

A prompt is an input contract, same as an API request body — it deserves
the same positive/negative/edge-case treatment:

- **Positive:** a well-formed prompt produces the expected class of
  response (`prompt-testing.test.js`: a benign classification prompt
  returns the deterministic expected answer).
- **Determinism check:** the same prompt run twice must produce an
  identical result under the mock provider — this is what makes the
  suite CI-safe (a real model would instead need a statistical
  acceptance check, not exact-repeat equality).
- **Negative/edge:** an empty prompt is a real input error, not a
  silently-accepted empty response — `mock-provider.js`'s `complete()`
  throws rather than returning `''`.
- **Injection-defense, both directions:** a known jailbreak-style
  pattern (`"ignore all previous instructions..."`) must be refused, and
  — just as important — a benign prompt that happens to contain the
  word "ignore" in an unrelated sense must **not** be falsely refused.
  Both are asserted in `prompt-testing.test.js`; testing only the
  refusal case and never the false-positive case is a common, incomplete
  version of this technique.

## Golden-dataset evaluation

`fixtures/golden-dataset.json` holds `{id, prompt, expected_contains,
expected_exact}` cases. `lib/eval-harness.js`'s `runGoldenEval()` scores
each case:

- `expected_exact` — the output must equal this string exactly (used for
  closed-set classification, e.g. `IN_STOCK` / `OUT_OF_STOCK`).
- `expected_contains` — the output must contain every listed substring
  (used where multiple valid phrasings exist, e.g. a greeting or a
  summary).

Both scoring modes are deliberately loose in one dimension (contains
allows phrasing variation) and strict in another (every listed substring
is mandatory, case-normalized) — the fixture design itself is a QA
decision, and a badly-designed fixture is a real risk: see
`COMMON-MISTAKES.md` for a case where a `expected_contains` fixture
didn't actually match the real refusal text, and another where a
regression scenario didn't actually break any case's contains-match
check. Both were caught by running the suite and reading the real
failure, not by inspection alone.

## Why this needs no API key

Every check above runs against `lib/mock-provider.js` — deterministic,
rule-based, zero network calls. `AI_TEST_MODE=mock` is the default and
the only mode canonical CI exercises.

## `AI_TEST_MODE=live`

Setting `AI_TEST_MODE=live` does not attempt to call a real provider —
this lab ships no paid-API HTTP client by design (mock-first scope, see
this subfolder's `README.md`). It instead reports credential
availability per provider (`lib/live-provider.js`,
`PROVIDER_ENV_KEYS` — openai/anthropic/gemini) and exits
`EXTERNALLY_BLOCKED`. This is a deliberate, honest design choice: a
missing credential must never silently become a passing mock result
presented as a live one.

## What a real integration would add on top of this

- Statistical pass-rate thresholds instead of single-run exact checks
  (e.g. "≥95% of N runs must score acceptable").
- Cost tracking against real per-token pricing (this lab's
  `cost-latency-budget.test.js` uses a fixed synthetic token-budget
  constant, not real pricing — see `06-OBSERVABILITY-COST-AND-RELEASE-TESTING.md`).
- Handling genuine model non-determinism in the scoring function itself
  (e.g. semantic-similarity scoring instead of substring matching).

None of the above is implemented here; each is named so the gap is
explicit rather than silently absent.
