# Data Engineering Lab — Execution Evidence

**Date:** 2026-10-02
**Environment:** sandbox container.

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/data-engineering/tests/etl.test.js automation-labs/data-engineering/tests/data-quality.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..13 / # pass 13 / # fail 0`. Exit code `0`.

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/data-engineering/run-data-engineering-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`).

**Actual observed output:**
```
--- ETL output (real, computed from real extracted rows) ---
Revenue by product: [{"product_id":2,"product_name":"Gadget","total_quantity":2,"total_revenue":40},{"product_id":1,"product_name":"Widget","total_quantity":2,"total_revenue":20}]
Order summary by user: [{"user_id":1,"email":"alice@example.com","order_count":1,"total_spent":40},{"user_id":2,"email":"bob@example.com","order_count":1,"total_spent":20}]

--- Data-quality checks against the REAL extracted data (expect zero violations) ---
Real-data violations found: 0

--- Negative-path proofs: each checker against deliberately corrupted synthetic data ---
  [PROVEN] checkReferentialIntegrity catches an orphaned order_item.product_id
  [PROVEN] checkUniqueness catches a duplicate (case-insensitive) email
  [PROVEN] checkOrderTotalsReconcile catches a stored total that disagrees with its order_items
  [PROVEN] checkSchemaDrift catches a deliberately wrong column expectation

DATA_ENGINEERING_LAB_STATUS: EXECUTED
```
Exit code `0`.

## What this run actually proves

- The ETL aggregates (revenue by product: Gadget 40.00, Widget 20.00;
  order summary by user) are computed from real rows read out of a real
  SQLite database (via the backend's own `getDatabase(':memory:')`) —
  the arithmetic above is not hand-typed, it is what `transformRevenueByProduct`
  and `transformOrderSummaryByUser` actually returned for this seed data.
- All four data-quality checks ran against the real, freshly-extracted
  data first and found **zero** violations — proving the checks don't
  cry wolf against clean data.
- All four checks were then independently proven to actually detect what
  they claim to: each negative-path case took the real extracted arrays,
  injected exactly one deliberately corrupted row (an orphaned
  `order_item`, a case-variant duplicate email, a wrong `orders.total`, a
  wrong expected column list), and confirmed the checker's output
  contained the expected violation `type`. All four printed `[PROVEN]`.

## Scope and honesty notes

- `checkReferentialIntegrity`/`checkUniqueness`/`checkOrderTotalsReconcile`
  deliberately run on extracted plain-array data rather than the live,
  constrained database — see `README.md`'s "Why three checks run on
  extracted arrays" section. This is not a workaround for a limitation;
  it is the realistic place these checks add value (an export/replica
  without the source database's constraints).
- `checkSchemaDrift` legitimately needs the live database (via
  `PRAGMA table_info`) since schema drift is a property of the source.
- `lib/expected-schema.js` is hand-maintained, not auto-generated from the
  live schema — see README.md's "A real finding" section for why that
  matters.
- **CI-verified.** The `data-engineering-lab` job in
  `.github/workflows/ci.yml` ran this exact suite on GitHub Actions and
  passed — see
  `https://github.com/SalimBurakAytemiz/full-stack-qa-engineering-handbook-Portfolio-/actions/runs/37078354997`
  (commit `97da16f`, job "Data Engineering lab (real ETL + data-quality
  checks)", conclusion: success). This lab's registry maturity is
  `L4_CI_VERIFIED` / evidence `E4_CI_VERIFIED` on that basis.
