# Data Engineering Lab

Real ETL and data-quality testing against the real backend database schema
(`users` / `products` / `orders` / `order_items`, from
`backend/src/database/schema.js`).

## What this lab actually does

`lib/etl.js`:
- `extract(db)` reads real rows from a real SQLite db (seeded via the
  backend's own `getDatabase(':memory:')`) into plain arrays — the shape
  a pipeline has right after extracting from the OLTP database into a
  staging/warehouse area.
- `transformRevenueByProduct` / `transformOrderSummaryByUser` are pure
  functions over those arrays, computing real aggregates (quantity and
  revenue per product; completed-purchase count and spend per user) —
  both scoped to `orders.status === 'PAID'` only. A `PAYMENT_FAILED` or
  `PAYMENT_TIMEOUT` order (the only other two statuses the real
  backend ever writes — see `STATUS_BY_PAYMENT_RESULT` in
  `backend/src/services/orders.service.js`) never collected real
  money and is deliberately excluded from both revenue and spend; see
  `EXECUTION.md`'s "Run 3" section for the real bug this fixed.

`lib/data-quality.js` — four real checks, three of them deliberately
operating on the **extracted, unconstrained** row arrays rather than the
live database:
- `checkReferentialIntegrity` — every `order_items.order_id`/`product_id`
  and `orders.user_id` must resolve to a real row.
- `checkUniqueness` — no two users share an email (case-insensitive).
- `checkOrderTotalsReconcile` — every order's stored `total` must match
  `sum(quantity * unit_price)` recomputed from its own `order_items`
  (tolerance `0.005` for floating-point).
- `checkSchemaDrift` — compares the **live** database's actual columns
  (via `PRAGMA table_info`) against `lib/expected-schema.js`'s
  hand-maintained snapshot.

## Why three checks run on extracted arrays, not the live DB

The live `QA-DEMO-SYSTEM` database already enforces foreign keys and a
`UNIQUE` constraint on `users.email` (see `schema.js`) — so a bad row like
an orphaned `order_item` literally cannot be inserted there; SQLite
rejects it at write time. That is exactly why these checks are built to
run on **extracted** data instead: a real downstream consumer of this
data (a CSV export, an analytics replica, a bulk-loaded warehouse table)
usually does **not** carry the source database's constraints with it, and
that is precisely where these checks earn their keep. This is a
deliberate design decision, not an oversight — see `EXECUTION.md` for how
it was proven.

## A real finding: schema drift is hand-maintained, not self-fulfilling

`lib/expected-schema.js` is **not** generated from the live schema
automatically. A schema-drift checker that always regenerates its own
expectation from the thing it's checking can never find drift — it would
always agree with itself. `checkSchemaDrift` only has teeth because
`expected-schema.js` is a separately hand-written snapshot that must be
updated by a human when the real schema changes; until then, a real
divergence is caught. `tests/data-quality.test.js` proves both directions:
the real schema against the real (current) expectation reports zero
drift, and the real schema against a deliberately wrong expectation
reports both a missing and an unexpected column.

## Scope boundary

- This is not Airflow/dbt/Great Expectations — there is no DAG scheduler,
  no incremental/CDC extraction, no external warehouse. It is a minimal,
  real, in-process ETL + data-quality check set, proving the testing
  concepts (extract real data, transform it, validate it, prove the
  validators actually validate) against this repository's real schema.
- The dataset is small and synthetic, seeded directly in
  `run-data-engineering-lab.js` for repeatability — not the full
  `shared/test-data/` fixture set the rest of the repo uses, since this
  lab's seed needs full control over referential shape to run its
  negative-path proofs deterministically.

## Run it

```bash
# from QA-DEMO-SYSTEM/ — no backend server needed, uses a real in-memory db
node automation-labs/data-engineering/run-data-engineering-lab.js
node --test automation-labs/data-engineering/tests/etl.test.js automation-labs/data-engineering/tests/data-quality.test.js
```
