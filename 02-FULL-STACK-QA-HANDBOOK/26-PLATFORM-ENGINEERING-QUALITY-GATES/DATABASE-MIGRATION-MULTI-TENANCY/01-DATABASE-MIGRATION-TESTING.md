# Database Migration & Schema Evolution Testing

## Three properties a migration runner actually needs, proven separately

A migration system is often "tested" by running it once and checking
the final schema looks right. That misses the properties that matter
in a real deployment, each of which this lab proves with a dedicated
real scenario rather than one combined check:

1. **Forward application in the right order**, against a real
   database, tracked in a real `schema_migrations` table.
2. **Idempotent re-apply** — running the same migration set a second
   time must be a genuine no-op, because in a real deployment the
   migration step often runs on every deploy, not just the first one.
3. **Exact, reversible rollback** — rolling back must reverse exactly
   the most recently applied migration's real `down()`, and the
   resulting schema must be checked directly (via `PRAGMA
   table_info`), not inferred from the migration code reading
   correctly.

## Zero-downtime column addition means backfilling in the same migration

`lib/sample-migrations.js`'s second migration adds a `category` column
to an existing table. The real backward-compatibility risk a naive
version of this migration would have: existing rows get a `NULL`
category, and any code written against the new column that assumes
it's always populated would break on old rows. The migration's `up()`
runs the `UPDATE ... SET category = 'uncategorized' WHERE category IS
NULL` backfill in the same step as the `ALTER TABLE ADD COLUMN` —
`migration-runner.test.js` proves this concretely by inserting a real
row *before* the migration runs, then asserting its `category` is the
real backfilled default afterward, not `NULL`.

## A real finding: verify SQLite feature support before relying on it

`ALTER TABLE ... RENAME COLUMN` (added in SQLite 3.25.0) and `ALTER
TABLE ... DROP COLUMN` (added in SQLite 3.35.0) are both
version-gated — an older SQLite build would reject them, which would
make migration 2's and migration 3's `down()` functions silently
wrong in that environment. Before writing those `down()` functions, a
direct real check was run against this environment's actual bundled
SQLite version (via Node's own `node:sqlite` module) to confirm both
operations genuinely succeed here, rather than assuming compatibility
from general SQLite documentation. See `EXECUTION.md` in the lab
directory for the exact check and its real output.

## Scope boundary

This is a migration *runner* — it applies, tracks, and rolls back
migrations whose `up()`/`down()` are hand-written real SQL. It is not
a migration *generator*: it does not diff a current schema against a
target schema and produce migration files automatically (the way
tools like Prisma Migrate or Django's `makemigrations` do). It also
never touches the real backend's actual database file — every
migration in this lab runs against a fresh, real in-memory SQLite
database created for that test or run.
