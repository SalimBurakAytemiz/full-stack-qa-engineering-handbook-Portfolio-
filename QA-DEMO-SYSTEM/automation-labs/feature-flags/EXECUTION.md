# Feature Flags Lab — Execution Evidence

**Date:** 2026-10-05
**Environment:** sandbox container.

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/feature-flags/tests/*.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..8 / # pass 8 / # fail 0`. Exit code `0`. All 8 unit
tests passed on the first real run — no defect was found while
building this lab.

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/feature-flags/run-feature-flags-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`).

**Actual observed output:**
```
--- Feature Flags Lab: real scenario results ---
  [PASS] 30% rollout over 5000 real users -> observed 29.42% (expected ~30%)
  [PASS] real repeated evaluation for user-7 is deterministic (both calls: false)
  [PASS] allowList: vip-1 -> true, regular-1 -> false
  [PASS] denyList at 100% rollout: admin-1 -> false, anyone-else -> true
  [PASS] segment targeting at 0% rollout: enterprise plan -> true, free plan -> false

FEATURE_FLAGS_LAB_STATUS: EXECUTED
```
Exit code `0`. The 29.42% observed value for a 30%-configured rollout
is the real output of the real hash-bucketing function over 5000
real distinct synthetic user ids — not rounded or adjusted for this
document.

## What this run actually proves

- A real SHA-256-based bucketing function produces a rollout
  percentage statistically close to its configured target over a
  real 5000-sample run, without ever persisting a per-user decision.
- The same user id evaluated twice against the same flag produces the
  same real answer both times.
- `allowList`/`denyList` overrides and segment-based targeting all
  take real precedence correctly, including the specific adversarial
  case of a denyList entry that would also match a 100%-rollout flag.

## Run 3 — CI-verified

**GitHub Actions run:**
https://github.com/SalimBurakAytemiz/full-stack-qa-engineering-handbook-Portfolio-/actions/runs/37255041775
(commit `e5d2041`), job "Feature Flags lab (deterministic hash-based
rollout)" — conclusion: `success`. All jobs in that run completed
successfully.

This confirms the same `npm run feature-flags:test --workspace
automation-labs` aggregate run (Run 2 above) genuinely passes in the
CI environment, not just locally. On this basis
`lab.feature-flags.deterministic-hash-rollout` and
`evidence.feature-flags.real-lab-run` are elevated to L4_CI_VERIFIED
/ E4_CI_VERIFIED, and
`competency.feature-flags.deterministic-hash-rollout`'s repository
status is elevated to CI_VERIFIED in the Digital Twin registry.

## Scope and honesty notes

- In-memory flag definitions only — not a remote flag-management
  service. See `README.md`'s "Scope boundary" section.
- Self-contained — never touches the real backend (`backend/src/`).
- No real defect was found while building this lab; both the unit
  tests and the aggregate run passed cleanly on their first real
  execution. This is stated plainly rather than inventing a "mistake"
  for `COMMON-MISTAKES.md` where none occurred.
