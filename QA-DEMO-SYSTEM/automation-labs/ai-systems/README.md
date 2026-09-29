# AI Systems Testing Lab (Mock-First)

Part of `automation-labs` (see the workspace's `package.json`), alongside the
Selenium and JMeter labs. This lab proves QA **techniques** for testing
AI/ML/LLM-backed features — prompt testing, golden-set evaluation,
structured-output validation, RAG groundedness/citation checks, agent
tool-call validation, safety/privacy leakage detection, provider/version
regression detection, and cost/latency budget checks — against a fully
deterministic mock provider. It is documentation-indexed (not duplicated)
from `05-EXECUTABLE-LABS/` per this repository's existing mapping-layer
convention; this file is the lab's own run/scope reference.

## Why this lab exists

Real LLM APIs are non-deterministic, cost money, and require credentials.
A CI-safe, reproducible QA lab for AI-backed features needs a provider
whose behavior is 100% known in advance, so that:

- assertions test the *QA harness*, not API flakiness or model drift,
- the suite runs in any environment with zero network access and zero
  API keys, and
- a deliberately "regressed" model version can be constructed to prove
  the regression-detection technique actually catches real drift (see
  `lib/provider-regression.js` and `tests/provider-regression.test.js`).

## Scope boundary (read this before treating any result as more than it is)

`lib/mock-provider.js` is **not** a language model. It is a small,
rule-based, fully deterministic stand-in — pattern matching and fixed
string templates, no embeddings, no statistical model, no randomness.
Every test in this lab proves that a QA *technique* (the eval harness,
the schema validator, the groundedness checker, the injection detector,
the regression comparator) works correctly against a provider whose
behavior is fully known — it does **not** prove anything about a real
LLM's quality, safety, or behavior. `AI_TEST_MODE=live` exists as an
explicit, honest gate (see below) rather than a silent claim that any of
this exercises a real model.

## Running

From `QA-DEMO-SYSTEM/automation-labs/`:

```bash
npm run ai:test          # aggregate runner (run-ai-lab.js) — CI entry point
npm run ai:test:unit     # raw node --test output, same suite
```

`AI_TEST_MODE` defaults to `mock`. Setting `AI_TEST_MODE=live` does **not**
run any test against a real provider — this lab ships no paid-API HTTP
client by design (mock-first scope). Instead it reports each configured
provider's credential availability and exits with
`AI_LAB_STATUS: EXTERNALLY_BLOCKED` (exit code 2) — never a silent
fallback to mock results presented as a live pass. See
`lib/live-provider.js`.

### Expected output (mock mode, healthy)

```
AI_LAB_MODE: mock
... (TAP output for 35 tests) ...
AI_LAB_STATUS: EXECUTED
AI_LAB_SUMMARY: all deterministic mock-mode checks passed (...)
```
Exit code `0`.

### Failure behavior

- A real check failure → `AI_LAB_STATUS: EXECUTION_BLOCKED`, exit code `1`,
  underlying TAP output preserved above the status line.
- `AI_TEST_MODE=live` → `AI_LAB_STATUS: EXTERNALLY_BLOCKED`, exit code `2`.
- The runner can never exit `0` without printing an explicit
  `AI_LAB_STATUS` line — a `process.on('exit', ...)` safety net forces
  `INCOMPLETE_NO_EXPLICIT_RESULT` and exit code `3` otherwise (same
  lifecycle-safety-net pattern as `jmeter/scripts/run-jmeter.js` and
  `selenium/scripts/run-parallel.js`).

## What each file proves

| File | QA technique |
|---|---|
| `tests/prompt-testing.test.js` | Deterministic prompt→response testing, empty-input handling, injection-defense true/false-positive checks |
| `tests/golden-eval.test.js` | Golden-dataset evaluation (exact-match and contains-match scoring) |
| `tests/structured-output.test.js` | JSON-schema validation of structured model output (ajv v8) — parse errors, type errors, additional-property rejection |
| `tests/rag.test.js` | Retrieval correctness, groundedness, citation integrity, hallucination-avoidance-when-nothing-retrieved |
| `tests/agent.test.js` | Tool selection, argument validation before execution, bounded-step-limit loop termination (never runs forever) |
| `tests/safety.test.js` | Secret-shape and PII detection in model output, and redaction |
| `tests/provider-regression.test.js` | Model/version regression detection — `mock-v2-regressed` genuinely drops the customer's name from greetings, which is caught by comparison against the golden dataset (a real, reproducible drift, not a synthetic string match) |
| `tests/cost-latency-budget.test.js` | Token and latency budget validation, including a case engineered to genuinely exceed budget |
| `tests/live-provider.test.js` | Credential-gating logic itself — proves "no key → EXTERNALLY_BLOCKED", never a silent mock-as-live fallback |

## Digital Twin linkage

This lab's registry entry (`shared/registry/catalog/labs.yaml`,
`lab.ai-systems.mock-first-testing` or equivalent id) declares
`covers_competencies` for exactly the competencies it genuinely exercises.
Only those competencies receive a `PRACTICED_IN` relationship to this lab.
Repository-practice maturity reflects what actually ran here
(EXECUTED, backed by this test suite); professional-experience fields for
these competencies remain `NONE` unless proven by an independent
professional source — repository practice never substitutes for
professional experience. See `01-SALIM-BURAK-DIGITAL-TWIN/registry/`.
