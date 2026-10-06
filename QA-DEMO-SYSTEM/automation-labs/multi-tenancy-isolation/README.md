# Multi-Tenancy Data Isolation Lab

A real tenant-scoped data-access layer (`lib/tenant-scoped-repository.js`)
proven against a real SQLite database seeded with two real tenants'
rows, plus a deliberately unsafe comparison repository
(`lib/unsafe-repository.js`) that proves what a cross-tenant leak
actually looks like when tenant scoping is forgotten.

## The core design choice

Every query in the scoped repository includes a real `tenant_id = ?`
predicate bound to the tenant the repository was constructed for — the
caller never passes `tenant_id` per call. This is a structural choice:
there is no code path in the scoped repository where a caller could
forget to scope a query, because the scoping isn't a parameter the
caller controls — it's baked into the repository instance itself.

## What this proves

- `getById()` returns `null` for another tenant's real row — not an
  error, not someone else's data.
- `list()` returns only the calling tenant's real rows.
- `update()`/`remove()` against another tenant's id affect **0** real
  rows — proven by both the return value and a direct follow-up query
  confirming the target row is unchanged.
- The **negative-path proof**: `lib/unsafe-repository.js` is a second,
  deliberately unscoped repository used only in this lab's own test
  suite, proving that *without* the scoping, the exact same `getById()`
  call against the exact same real seeded data genuinely returns
  another tenant's row. This is what makes the positive-path proof
  mean something — the isolation is shown to be a property of the
  real code, not an untested assumption.

## Scope boundary

- Row-level, query-predicate tenant isolation only — this does not
  implement or test database-level isolation mechanisms (separate
  schemas per tenant, PostgreSQL row-level security policies, separate
  physical databases per tenant).
- `lib/unsafe-repository.js` is test-only scaffolding for the negative
  proof above — it is never imported by any real application code and
  must never be used as a template for one.

## Running it

```bash
npm run multi-tenancy:test:unit --workspace automation-labs   # 6 unit tests
npm run multi-tenancy:test --workspace automation-labs        # real aggregate run
```
