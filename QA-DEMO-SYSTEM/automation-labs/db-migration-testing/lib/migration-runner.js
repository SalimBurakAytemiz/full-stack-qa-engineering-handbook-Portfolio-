'use strict';

// A real migration runner — not a diagram of one. Tracks applied
// migrations in a real `schema_migrations` table inside the real
// SQLite database it is given (Node's own built-in node:sqlite, the
// same module the backend itself uses), applies pending migrations
// in version order, and can roll back the most recently applied one.
// TR: Bu bir diyagram DEĞİL, GERÇEK bir migration runner'dır.
// Uygulanan migration'lar gerçek bir `schema_migrations` tablosunda
// takip edilir.

function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function getAppliedVersions(db) {
  ensureMigrationsTable(db);
  const rows = db.prepare('SELECT version FROM schema_migrations ORDER BY version').all();
  return rows.map((r) => r.version);
}

// Applies every migration in `migrations` whose version is not yet
// recorded in schema_migrations, in ascending version order. Running
// this twice in a row with the same migrations list is a genuine
// no-op the second time — nothing in `migrations` is re-executed —
// which is the real idempotent-re-apply property this lab proves.
function applyPending(db, migrations) {
  ensureMigrationsTable(db);
  const applied = new Set(getAppliedVersions(db));
  const sorted = [...migrations].sort((a, b) => a.version - b.version);
  const appliedThisRun = [];

  for (const migration of sorted) {
    if (applied.has(migration.version)) continue;
    migration.up(db);
    db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)').run(
      migration.version,
      migration.name,
    );
    appliedThisRun.push(migration.version);
  }
  return appliedThisRun;
}

// Rolls back exactly the single highest-version migration currently
// recorded as applied, calling its real down() against the real db,
// then removing its schema_migrations row. Throws if nothing is
// applied, or if the given migrations list has no matching entry —
// never silently no-ops a rollback that was actually requested.
function rollbackLast(db, migrations) {
  ensureMigrationsTable(db);
  const applied = getAppliedVersions(db);
  if (applied.length === 0) {
    throw new Error('rollbackLast() called with no applied migrations');
  }
  const lastVersion = applied[applied.length - 1];
  const migration = migrations.find((m) => m.version === lastVersion);
  if (!migration) {
    throw new Error(`rollbackLast() could not find migration definition for applied version ${lastVersion}`);
  }
  migration.down(db);
  db.prepare('DELETE FROM schema_migrations WHERE version = ?').run(lastVersion);
  return lastVersion;
}

module.exports = { ensureMigrationsTable, getAppliedVersions, applyPending, rollbackLast };
