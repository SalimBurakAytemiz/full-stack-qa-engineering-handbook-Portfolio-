# AI Systems Testing Lab — Execution Evidence

**Date:** 2026-09-29
**Command:** `node --test ai-systems/tests/*.test.js` (raw suite) and
`node ai-systems/run-ai-lab.js` (aggregate runner, `AI_TEST_MODE=mock`,
the default) — both run from `QA-DEMO-SYSTEM/automation-labs/`.
**Environment:** sandbox container, no network access required, no API
keys set.

## Result

```
1..35
# tests 35
# suites 0
# pass 35
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

`run-ai-lab.js` (mock mode): `AI_LAB_STATUS: EXECUTED`, exit code `0`.
`run-ai-lab.js` (`AI_TEST_MODE=live`): `AI_LAB_STATUS: EXTERNALLY_BLOCKED`
for all three configured providers (openai/anthropic/gemini — no API key
set for any), exit code `2` — verified as a genuine gate, not a stub.

## Breakdown by file (9 files, 35 tests)

| File | Tests |
|---|---|
| `prompt-testing.test.js` | 6 |
| `golden-eval.test.js` | 3 |
| `structured-output.test.js` | 4 |
| `rag.test.js` | 5 |
| `agent.test.js` | 6 |
| `safety.test.js` | 4 |
| `provider-regression.test.js` | 2 |
| `cost-latency-budget.test.js` | 3 |
| `live-provider.test.js` | 2 |

## Real bugs found and fixed during this run (not hidden)

Three real defects were found by actually executing this suite (not by
code review) and fixed at the root cause — full detail in the handbook's
`COMMON-MISTAKES.md` for this area:

1. A golden-dataset fixture (`golden.refusal.unsafe`) asserted a
   substring not present in the real refusal text — fixed by correcting
   the fixture to match real code.
2. `structured-output.test.js` initially failed because this workspace's
   dependency tree resolved a stale, hoisted `ajv@6` instead of the
   `ajv@8` declared in `automation-labs/package.json` — fixed by running
   `npm install --workspace automation-labs` so the workspace materializes
   its own local v8 copy.
3. `run-ai-lab.js`'s aggregate runner initially failed with
   `MODULE_NOT_FOUND` when passed the tests directory directly to
   `node --test` (this Node version does not recurse a bare directory
   argument the way shell-glob-expanded file arguments do) — fixed by
   enumerating `*.test.js` files explicitly.
4. `provider-regression.test.js`'s "regressed" model version
   (`mock-v2-regressed`) initially didn't actually break any golden case
   — a real test-design bug, found by running the suite and reading the
   actual `regressions: []` output, not by inspection — fixed by
   redesigning which behavior the regressed version changes.

## Scope and honesty notes

- No real LLM API was called. `AI_TEST_MODE=mock` (default) is the only
  mode this evidence covers as "executed" — `live` mode is proven to
  correctly report `EXTERNALLY_BLOCKED`, not proven to call a real
  provider (it never attempts to).
- This is a local, manual execution — **not yet CI-verified**. CI wiring
  for this lab (mock-mode only, `.github/workflows/ci.yml`) is a
  separate, explicitly tracked step; until a GitHub Actions run of this
  exact suite is confirmed, this lab's registry maturity stays at
  `L3_AUTOMATED` / evidence `E3_EXECUTED`, not `L4_CI_VERIFIED` /
  `E4_CI_VERIFIED`.
