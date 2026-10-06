# Multi-Tenancy Isolation Lab — Execution Evidence

**Date:** 2026-10-04
**Environment:** sandbox container, Node 22 (`node:sqlite`, experimental).

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/multi-tenancy-isolation/tests/*.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..6 / # pass 6 / # fail 0`. Exit code `0`.

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/multi-tenancy-isolation/run-multi-tenancy-lab.js`
(from `QA-DEMO-SYSTEM/`) — independent review finding F8: this run's cwd was previously misdocumented as `QA-DEMO-SYSTEM/automation-labs/`, which combined with this exact command would resolve to a nonexistent doubled path (automation-labs/automation-labs/...); corrected to match the command's own automation-labs/ prefix.

**Actual observed output:**
```
--- Multi-Tenancy Isolation Lab: real scenario results ---
  [PASS] scoped getById(tenant B's id) from tenant A returns null (observed: null)
  [PASS] scoped list() returns exactly 1 row per tenant (A=1, B=1)
  [PASS] scoped update() against tenant B's id from tenant A affected 0 real row(s)
  [PASS] scoped remove() against tenant B's id from tenant A affected 0 real row(s); tenant B's row still exists: true
  [PASS] the deliberately unsafe repository genuinely leaks tenant B's row (observed title: "B Secret") — the real negative-path proof

MULTI_TENANCY_LAB_STATUS: EXECUTED
```
Exit code `0`.

## What this run actually proves

- Two real tenants' rows were seeded into one real SQLite database.
  Every scoped-repository operation against another tenant's real id
  — read, list, update, delete — was independently verified to affect
  0 rows or return `null`, each confirmed with a direct follow-up query
  rather than trusting the return value alone.
- The unsafe comparison repository's `getById()` call against the
  exact same real data **genuinely returned tenant B's row** — this is
  the real negative-path proof that the isolation demonstrated above
  is a property of the scoped repository's real code, not an artifact
  of how the test data happened to be shaped.

## Scope and honesty notes

- Row-level, query-predicate isolation only — not database-level
  mechanisms (separate schemas/databases per tenant, RLS policies).
  See `README.md`'s "Scope boundary" section.
- `lib/unsafe-repository.js` is test-only scaffolding, never used by
  real application code.

## Run 3 — CI-verified

GitHub Actions run
[`37165865596`](https://github.com/SalimBurakAytemiz/full-stack-qa-engineering-handbook-Portfolio-/actions/runs/37165865596)
(commit `36a01d5`), job **"Multi-Tenancy Isolation lab (tenant-scoped
repository + negative-path leak proof)"** — `conclusion: success`. The
same `npm run multi-tenancy:test --workspace automation-labs` command
confirmed above ran against GitHub Actions' real `ubuntu-latest`
runner with the same observed output.
