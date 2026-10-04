# Idempotency Testing Lab — Execution Evidence

**Date:** 2026-10-04
**Environment:** sandbox container.

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/idempotency-testing/tests/*.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..9 / # pass 9 / # fail 0`. Exit code `0`. Covers
`idempotency-store.test.js` (4, including a real 10-way concurrent
race at the store level) and `idempotent-server.test.js` (5, including
a real 10-way concurrent race over real HTTP).

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/idempotency-testing/run-idempotency-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`).

**Actual observed output:**
```
--- Idempotency Testing Lab: real scenario results ---
  [PASS] missing Idempotency-Key -> real 400 (expected 400)
  [PASS] replay of the same key returns order 1000 (same as first: 1000); real side-effect count after 2 requests with 1 key: 1
  [PASS] a different key creates a separate real order 1001; real side-effect count now 2
  [PASS] 10 real concurrent requests with one new key produced 1 distinct real order id(s); real side-effect count increased by 1 (expected 1)

IDEMPOTENCY_LAB_STATUS: EXECUTED
```
Exit code `0`.

## What this run actually proves

- The real server rejects a request with no `Idempotency-Key` header.
- A real replay of the same key returns the exact same real order id
  the first request produced, with the real side-effect counter
  staying at 1 — not incrementing a second time.
- A different key produces a genuinely separate real order, and the
  counter increases accordingly.
- 10 real HTTP requests fired concurrently (`Promise.all`, not a
  sequential loop) with the same brand-new key all observed the same
  single real order id, and the real side-effect counter increased by
  exactly 1 — proving the store's in-flight-promise design correctly
  handles a genuine race, not just sequential replays.

## Scope and honesty notes

- In-memory store only — not a production-grade distributed store
  (Redis, a unique-constrained database table). See `README.md`'s
  "Scope boundary" section.
- Self-contained — never touches the real backend (`backend/src/`).
- Not yet CI-verified as of this file's writing — CI wiring is a
  separate, explicitly tracked step (see `.github/workflows/ci.yml`'s
  `idempotency-testing-lab` job once added).
