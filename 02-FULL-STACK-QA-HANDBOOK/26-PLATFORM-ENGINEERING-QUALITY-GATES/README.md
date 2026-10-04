# 26 — Platform Engineering & Quality Gates

**Status: additional topic area, not in the original 24-item table, and
separate from `25-ADVANCED-QA-ENGINEERING/`** (Part 2's area) — this is
Part 3, added the same way `25-ADVANCED-QA-ENGINEERING` was added
alongside the base 24 and Part 2's own subtopics: genuinely new
content indexed alongside the existing numbered list, not squeezed
into an existing slot.

This area covers platform-level QA concerns that sit beneath or around
individual features: database schema evolution, tenant data isolation,
API replay-safety and abuse resistance, progressive feature targeting,
and distributed request tracing. Each subtopic follows the same
discipline as the rest of this handbook: real executable labs where a
lab is claimed (see `05-EXECUTABLE-LABS/README.md`), explicit
scope-boundary disclosure where a lab is deliberately simplified, and
a hard line between **repository practice** and **professional
experience** — the two are never conflated. See
`01-SALIM-BURAK-DIGITAL-TWIN/README.md` and `02-COMPETENCY-MATRIX.md`
for the full three-dimension model.

## Subtopics

| Folder | Status |
|---|---|
| `DATABASE-MIGRATION-MULTI-TENANCY/` | Added — real executable db-migration-testing + multi-tenancy-isolation labs, see below |

This folder grows incrementally, each addition backed by real,
executed work, never a documentation-only placeholder claiming more
than exists.

## Database Migration & Multi-Tenancy Data Isolation

Executable labs:
`QA-DEMO-SYSTEM/automation-labs/db-migration-testing/` (a real,
hand-rolled migration runner driving a real in-memory SQLite database
through 3 real migrations — create table, add-column-with-backfill,
rename-column — proving forward application, zero-downtime backfill,
idempotent re-apply, and exact single-step rollback), and
`QA-DEMO-SYSTEM/automation-labs/multi-tenancy-isolation/` (a real
tenant-scoped data-access layer proven against a real SQLite database
seeded with two real tenants' rows, including a deliberately unsafe
comparison repository that proves what a cross-tenant leak actually
looks like).

Read `DATABASE-MIGRATION-MULTI-TENANCY/README.md` first — it states the
scope boundary (a migration runner, not a migration generator; row-level
query-predicate tenant isolation, not database-level mechanisms like
separate schemas or RLS policies) that every other document in that
subfolder assumes.

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
competencies this area adds — every one has `professional: {status: NONE}`
unless an existing, independent professional source proves otherwise.
