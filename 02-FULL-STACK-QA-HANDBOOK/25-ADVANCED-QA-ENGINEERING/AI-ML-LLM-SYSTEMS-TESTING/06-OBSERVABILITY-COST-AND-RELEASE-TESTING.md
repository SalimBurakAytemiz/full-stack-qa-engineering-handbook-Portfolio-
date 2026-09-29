# Observability, Cost, and Release Testing for AI Systems

**Executable evidence:** `ai-systems/tests/cost-latency-budget.test.js`,
`ai-systems/tests/provider-regression.test.js`,
`ai-systems/lib/provider-regression.js`,
`ai-systems/tests/live-provider.test.js`, `ai-systems/lib/live-provider.js`.

## Token/cost budget validation

Every `complete()` call in `mock-provider.js` returns `tokensIn`,
`tokensOut`, and `latencyMs`, computed deterministically (proportional to
input/output length, not random) so budget checks are reproducible.
`cost-latency-budget.test.js` asserts:

- a normal prompt stays within a declared token budget,
- a **deliberately oversized** prompt genuinely exceeds it (constructed
  with `'word '.repeat(500)`, not asserted against a made-up number —
  the fixture is engineered so the check has something real to catch),
  and
- a mock call completes well within a declared latency budget.

The token-count math here is a simple, disclosed proxy
(`Math.ceil(text.length / 4)`), not real tokenizer output and not real
per-token pricing — a genuine cost-testing pipeline would use the
provider's actual tokenizer and pricing table. That gap is named rather
than left implicit.

## Provider/model-version regression detection

`lib/provider-regression.js`'s `compareModelVersions(dataset, modelA,
modelB)` runs the golden dataset against two model identifiers and
diffs the results. Two model behaviors exist in `MODEL_BEHAVIORS`:

- `mock-v1` — the baseline.
- `mock-v2-regressed` — deliberately drops the customer's name from
  greeting responses, which breaks `golden.greeting.en`'s
  `expected_contains` check for the name. This is a genuine,
  reproducible behavioral difference against the golden dataset, not a
  synthetic string match — see `COMMON-MISTAKES.md` for the earlier,
  broken version of this design (a prefix-drop that didn't actually
  break any case) and how it was found and fixed.

Two tests cover this:

- **Positive control:** comparing a model to itself finds zero
  regressions — proves the comparator doesn't produce false positives.
- **Real regression detected:** comparing `mock-v1` to
  `mock-v2-regressed` finds `golden.greeting.en` named as a regression,
  and the regressed run's `resultsB.failed > 0`.

This is the same discipline as classical release-regression testing
(run the same suite against the new version, diff the result) applied to
a model/provider version instead of an application version — directly
relevant to catching a silent quality drop after a provider-side model
update or a prompt-template change, without needing every case to be a
carefully hand-tuned rubric.

## Live-provider gating (release-readiness for real API usage)

`lib/live-provider.js`'s `checkLiveProviderAvailability(provider)` checks
whether the relevant API-key environment variable
(`PROVIDER_ENV_KEYS` — `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
`GEMINI_API_KEY`) is set. Without a key: `EXTERNALLY_BLOCKED`, never a
silent fallback to a mock result presented as a live pass. An unknown
provider name: also `EXTERNALLY_BLOCKED`, not a crash. This is the same
"no fake PASS" principle applied at the release-gating level: a CI
pipeline that would otherwise need real credentials to prove live
integration reports its actual, honest status (`EXTERNALLY_BLOCKED`
rather than `NOT_EXECUTED` being silently swallowed into a green
build) instead of skipping the check silently.

## Observability this lab does NOT implement

Real production AI observability (trace-level prompt/response logging,
per-request cost dashboards, drift-detection alerting over live traffic,
p95/p99 latency SLOs) is not implemented here — this lab covers only the
deterministic budget-check and regression-comparison techniques that
transfer directly to building that kind of pipeline.
