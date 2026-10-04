# DB Migration Testing Lab — Execution Evidence

**Date:** 2026-10-04
**Environment:** sandbox container, Node 22 (`node:sqlite`, experimental).

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/db-migration-testing/tests/*.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..6 / # pass 6 / # fail 0`. Exit code `0`.

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/db-migration-testing/run-db-migration-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`).

**Actual observed output:**
```
--- DB Migration Testing Lab: real scenario results ---
  [PASS] applyPending() applied migrations in order: [1,2,3]
  [PASS] category column is real and queryable after migration 2 (observed: "gadgets")
  [PASS] re-running applyPending() with the same migrations applied 0 more (real idempotent re-apply)
  [PASS] rollbackLast() reversed version 3, applied versions now [1,2]
  [PASS] after rollback, real column list is ["id","name","price","category"]

DB_MIGRATION_LAB_STATUS: EXECUTED
```
Exit code `0`. (A real `ExperimentalWarning: SQLite is an experimental
feature` is printed by Node itself — the same warning the backend's own
test suite already tolerates; not a lab defect.)

## A real finding, not an assumption

Before writing migration 2's and migration 3's `down()` functions, a
direct check was run against this environment's real bundled SQLite
version to confirm `ALTER TABLE ... DROP COLUMN` and
`ALTER TABLE ... RENAME COLUMN` are actually supported (both are
SQLite-version-gated features — not universally available):

```bash
node -e "
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT)');
db.exec('ALTER TABLE t ADD COLUMN category TEXT');
db.exec('ALTER TABLE t RENAME COLUMN name TO full_name');
db.exec('ALTER TABLE t DROP COLUMN category');
"
```
All three real operations succeeded in this environment, which is why
the migrations rely on them directly rather than the older
table-rebuild workaround (create new table, copy rows, drop old table,
rename) that pre-3.25/pre-3.35 SQLite would have required.

## What this run actually proves

- A real migration runner correctly orders, applies, tracks, and rolls
  back real schema changes against a real SQLite database — not a
  description of what a migration runner should do.
- The idempotent-re-apply and rollback-is-exact-and-reversible
  properties were each proven by observing real `PRAGMA table_info`
  output before and after, not assumed from the migration code alone.

## Scope and honesty notes

- Migration runner only — does not diff schemas or generate migration
  files automatically. See `README.md`'s "Scope boundary" section.
- Not yet CI-verified as of this file's writing — CI wiring is a
  separate, explicitly tracked step (see `.github/workflows/ci.yml`'s
  `db-migration-testing-lab` job once added).
