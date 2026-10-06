# Multi-Tenancy Data Isolation Testing

## Make the safe path structural, not a convention

The easiest way for a cross-tenant data leak to happen in a real
multi-tenant system is a forgotten `WHERE tenant_id = ?` clause in one
query out of many. `lib/tenant-scoped-repository.js` is deliberately
designed so that mistake isn't possible to make at the call site: the
repository is constructed once per tenant (`createScopedRepository(db,
tenantId)`), and every method — `create`, `getById`, `list`, `update`,
`remove` — binds that same `tenantId` into its SQL internally. A
caller cannot pass a different tenant's id and have it accidentally
work, because `tenant_id` is never a parameter the caller supplies per
call in the first place.

## Proving isolation means proving every operation, not just reads

A shallow version of this lab might prove only that `getById()` can't
read another tenant's row. This lab proves isolation across the full
operation set a real repository exposes:

- `getById()` returns `null` for another tenant's real row.
- `list()` returns only the calling tenant's real rows (proven with
  both tenants holding different row counts, so an isolation bug
  would show up as a wrong count, not just a wrong row).
- `update()` and `remove()` against another tenant's real id each
  affect **0** rows — checked via the real `changes` count AND a
  direct follow-up query confirming the target row is genuinely
  unchanged, not assuming the operation's return value alone tells
  the whole story.

## The negative-path proof is what makes the positive-path proof mean something

`lib/unsafe-repository.js` is a second, deliberately unscoped
repository that exists for exactly one purpose: proving, against the
*same real seeded data* used for every positive-path test, that a
`getById()` call with no tenant scoping at all genuinely returns
another tenant's confidential row. Without this negative-path proof,
"the scoped repository returns null for another tenant's row" could
just mean the test data was never actually reachable in the first
place — the unsafe repository's real, observed leak is what confirms
the row genuinely exists and genuinely was blocked specifically by the
scoping logic, not by some other accident of the test setup.

## Scope boundary

This lab proves row-level, query-predicate tenant isolation — a
single shared table with a `tenant_id` column, scoped at the query
layer. It does not implement or test database-level isolation
mechanisms: separate schemas per tenant, separate physical databases
per tenant, or PostgreSQL-style row-level security policies enforced
by the database engine itself (SQLite has no RLS feature). Those are
different, also-valid approaches to multi-tenancy with different
operational tradeoffs, out of scope here.
