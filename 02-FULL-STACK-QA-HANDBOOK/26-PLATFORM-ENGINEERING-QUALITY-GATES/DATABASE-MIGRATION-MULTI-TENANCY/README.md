# Database Migration & Multi-Tenancy Data Isolation

**Executable labs:**
`QA-DEMO-SYSTEM/automation-labs/db-migration-testing/` (6 unit tests +
a real aggregate run proving forward migration, backward-compatible
column-addition backfill for existing rows, idempotent re-apply, and
exact rollback against a real in-memory SQLite database — this proves
schema evolution and backfill correctness, not application
availability under concurrent production traffic, so it is not a
zero-downtime-deployment proof; independent review finding F7) and
`QA-DEMO-SYSTEM/automation-labs/multi-tenancy-isolation/` (6 unit
tests + a real aggregate run proving full CRUD tenant isolation,
including a deliberately unsafe comparison repository that proves the
real leak the safe one prevents).

## Scope boundary — read this first

Database migration testing here means a real migration *runner* —
applying, tracking, and rolling back real schema changes against a
real SQLite database — not a migration *generator* that diffs two
schemas and produces migration files automatically. Multi-tenancy
isolation here means row-level, query-predicate tenant scoping — every
query includes a real `tenant_id = ?` predicate — not database-level
isolation mechanisms (separate schemas or physical databases per
tenant, PostgreSQL row-level security policies). Each choice is
disclosed in its own lab's `README.md` "Scope boundary" section.

## Two real findings this milestone

1. **A real SQLite-version check, not an assumption.** Before relying
   on `ALTER TABLE ... RENAME COLUMN` and `ALTER TABLE ... DROP
   COLUMN` in migration down() functions, a real check was run against
   this environment's bundled SQLite version to confirm both are
   actually supported — both are SQLite-version-gated features that
   an older SQLite build would reject. See
   `01-DATABASE-MIGRATION-TESTING.md`.
2. **A real, provable negative path.** The multi-tenancy lab doesn't
   just assert its scoped repository is safe — it includes a
   deliberately unsafe comparison repository and proves, against the
   exact same real seeded data, that it genuinely leaks another
   tenant's row when tenant scoping is forgotten. The positive-path
   proof means something specifically because the negative path was
   also shown to be real, not hypothetical. See
   `02-MULTI-TENANCY-ISOLATION-TESTING.md`.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-DATABASE-MIGRATION-TESTING.md` | Migration runner design, forward/idempotent/rollback properties, the real SQLite-version finding |
| `02-MULTI-TENANCY-ISOLATION-TESTING.md` | Structural tenant scoping, the CRUD isolation proof, the real negative-path leak demonstration |
| `COMMON-MISTAKES.md` | Real mistakes found and fixed while building these exact labs |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
competencies this area adds — every one has `professional: {status: NONE}`
unless an existing, independent professional source proves otherwise.
