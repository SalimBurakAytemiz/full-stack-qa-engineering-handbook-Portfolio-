# AI/ML/LLM Systems Testing

**Executable lab:** `QA-DEMO-SYSTEM/automation-labs/ai-systems/` (35
deterministic Node test-runner tests across 9 files, run via
`npm run ai:test` — see that lab's own `README.md` for exact commands
and expected output).

## Scope boundary — read this first

Every document in this subfolder, and the lab itself, demonstrates QA
**technique**, not a real AI/ML system. `lib/mock-provider.js` is a small,
rule-based, fully deterministic stand-in with no embeddings, no
statistics, no randomness — not a language model. `AI_TEST_MODE=mock` is
the default and the only mode the canonical CI job runs (no paid API
calls, no API keys required, ever, for canonical CI). `AI_TEST_MODE=live`
is an honest gate: it reports credential availability per provider and
exits `EXTERNALLY_BLOCKED` — this lab ships no live-provider HTTP client
by design. See `lib/live-provider.js` and `tests/live-provider.test.js`.

This distinction matters for an interview-honest reason: the techniques
below (golden-set evaluation, structured-output validation, groundedness
checking, agent tool-call validation, safety/privacy scanning,
provider-regression detection) transfer directly to testing a real LLM
integration — the mock only stands in for the unpredictable, costly,
non-deterministic part (the model itself), not for the QA discipline
around it.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-FOUNDATIONS-AND-CLASSICAL-ML-TESTING.md` | Why classical ML/AI testing differs from deterministic software testing; what stays the same |
| `02-LLM-AND-PROMPT-TESTING.md` | Prompt testing, golden datasets, exact/contains-match scoring, injection-defense testing |
| `03-STRUCTURED-OUTPUT-AND-RAG-TESTING.md` | JSON-schema-validated model output; retrieval-augmented generation groundedness and citation-integrity testing |
| `04-AGENT-AND-TOOL-CALLING-TESTING.md` | Tool selection, argument validation, bounded-loop termination for agentic systems |
| `05-SAFETY-SECURITY-PRIVACY-TESTING.md` | Secret/PII leakage detection in model output, redaction, prompt-injection defense |
| `06-OBSERVABILITY-COST-AND-RELEASE-TESTING.md` | Token/latency budget validation, provider/model-version regression detection |
| `COMMON-MISTAKES.md` | Real mistakes made and fixed while building this exact lab, not generic advice |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, each answer honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
competencies this area adds. Every one of them has
`professional: {status: NONE}` — this lab is genuinely new,
never-professionally-used ground, and the Digital Twin registry says so
explicitly rather than letting repository work imply professional history
it does not have. Repository-practice status reflects real, executed test
runs (see `01-SALIM-BURAK-DIGITAL-TWIN/registry/evidence.yaml` and
`shared/registry/catalog/labs.yaml`), never inflated to a maturity level
the work hasn't actually reached.
