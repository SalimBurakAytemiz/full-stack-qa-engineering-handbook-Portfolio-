# Database Migration & Schema Evolution Testing Lab

A real, hand-rolled migration runner (`lib/migration-runner.js`) driving
a real in-memory SQLite database (Node's own built-in `node:sqlite` —
the same module the backend uses) through 3 real migrations
(`lib/sample-migrations.js`): create a table, add-a-column-with-backfill,
and rename-a-column.

## What this proves

- **Forward application in version order.** Pending migrations are
  applied lowest-version-first, each recorded in a real
  `schema_migrations` table.
- **Backward-compatible column addition with existing-row backfill
  (independent review finding F7 — not a zero-downtime proof).** The
  add-column migration backfills every existing row in the same
  migration — proven with a real row inserted before the migration
  runs. This proves schema evolution and backfill correctness; it
  does not test application availability under concurrent production
  traffic, so it is not evidence of zero-downtime deployment.
- **Idempotent re-apply.** Running `applyPending()` twice with the same
  migrations list is a genuine no-op the second time; nothing is
  re-executed.
- **Single-step rollback.** `rollbackLast()` reverses exactly the
  highest applied version's real `down()`, never an arbitrary one, and
  the real resulting schema (via `PRAGMA table_info`) is checked, not
  assumed.

## Scope boundary

- This is a migration *runner*, not a migration *generator* — it does
  not diff two schemas and produce migration files automatically.
- Runs against a real in-memory SQLite database; never touches the
  real backend's database file (`backend/data/qa-demo.db`).
- SQLite's `ALTER TABLE ... RENAME COLUMN` and `DROP COLUMN` support
  (used by migration 3's down() and migration 2's down()) were
  verified against the real bundled SQLite version before being relied
  on — see `EXECUTION.md`.

## Running it

```bash
npm run db-migration:test:unit --workspace automation-labs   # 6 unit tests
npm run db-migration:test --workspace automation-labs        # real aggregate run
```
