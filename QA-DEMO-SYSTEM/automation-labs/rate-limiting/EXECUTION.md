# Rate Limiting Lab — Execution Evidence

**Date:** 2026-10-04
**Environment:** sandbox container.

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/rate-limiting/tests/*.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..8 / # pass 8 / # fail 0`. Exit code `0`. Covers
`token-bucket.test.js` (5) and `rate-limited-server.test.js` (3).

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/rate-limiting/run-rate-limiting-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`).

**Actual observed output:**
```
--- Rate Limiting Lab: real scenario results ---
  [PASS] 2 real requests within capacity 2 -> real statuses 200, 200
  [PASS] a 3rd real request over capacity -> real status 429; real rejected count: 1
  [PASS] after advancing the real fake clock by 100ms, the next real request -> status 200; real accepted count: 3

RATE_LIMITING_LAB_STATUS: EXECUTED
```
Exit code `0`.

## A real finding, not a hypothetical one

The first draft of `lib/token-bucket.js` required `refillRatePerMs >
0` (strictly positive), and the first draft of the unit tests tried
to construct several "no refill, capacity-only" test buckets with
`refillRatePerMs: 0` to isolate the pure-capacity behavior from
refill behavior. Running the tests immediately failed —
`createTokenBucket requires a positive refillRatePerMs` — because 0
does not satisfy `> 0`. This was a real design conflict caught by a
real test run, not a hypothetical: a refill rate of exactly 0 is a
legitimate configuration (a bucket that never refills, i.e. a
one-time allowance), so the validation was wrong to reject it. The
fix changed the check to `refillRatePerMs >= 0` (reject only
negative rates) and the capacity-only tests now construct validly.
See `COMMON-MISTAKES.md` in the handbook for the general lesson.

## What this run actually proves

- The real server accepts requests within the real configured
  capacity and rejects the next one with a real `429`, checked
  against the server's own real accepted/rejected counters.
- Advancing a real injected fake clock by exactly the time needed for
  one token to refill (100ms at this test's configured rate) makes
  the very next real request succeed — proving the refill math is
  tied to real elapsed time, not a guess.

## Run 3 — CI-verified

**GitHub Actions run:**
https://github.com/SalimBurakAytemiz/full-stack-qa-engineering-handbook-Portfolio-/actions/runs/37204986576
(commit `7440151`), job "Rate Limiting lab (token-bucket limiter +
HTTP server)" — conclusion: `success`. All 28 jobs in that run
completed successfully.

This confirms the same `npm run rate-limiting:test --workspace
automation-labs` aggregate run (Run 2 above) genuinely passes in the
CI environment, not just locally. On this basis
`lab.rate-limiting.token-bucket-limiter` and
`evidence.rate-limiting.real-lab-run` are elevated to L4_CI_VERIFIED
/ E4_CI_VERIFIED, and
`competency.rate-limiting.token-bucket-abuse-prevention`'s repository
status is elevated to CI_VERIFIED in the Digital Twin registry.

## Scope and honesty notes

- Single shared bucket — not per-client/per-API-key limiting. See
  `README.md`'s "Scope boundary" section.
