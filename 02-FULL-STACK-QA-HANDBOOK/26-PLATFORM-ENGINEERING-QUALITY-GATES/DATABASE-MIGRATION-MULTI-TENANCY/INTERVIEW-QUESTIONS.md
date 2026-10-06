# Interview Questions — Database Migration & Multi-Tenancy Isolation

Every answer is scoped honestly: what this repository's labs actually
prove (repository practice), versus professional experience or
production-grade tooling this doesn't claim. See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "How do you test a database migration before it runs against production data?"

I separate three properties and test each one specifically, rather
than just running the migration once and eyeballing the result.
First, forward application in the right order — tracked in a real
migrations table so a partially-applied set is recoverable. Second,
idempotent re-apply: running the same migration set a second time has
to be a genuine no-op, since in most real deployments the migration
step runs on every deploy, not just the first one. Third, exact
rollback — reversing the most recently applied migration has to
restore the real previous schema, which I check directly against the
database's own schema introspection (`PRAGMA table_info` in SQLite),
not by assuming the rollback code is correct because it compiles.

## "What's the real risk in adding a new column to an existing table?"

Existing rows get `NULL` in the new column unless the migration
backfills them, and any code written against the new column that
assumes it's always populated will break on those old rows. I test
this directly: insert a real row before the migration runs, apply the
migration, then assert the row's new column has the real backfilled
default — not just that the column exists.

## "Would you trust that two `ALTER TABLE` statements work the same way in every SQLite version?"

No — `RENAME COLUMN` and `DROP COLUMN` are both real, version-gated
SQLite features (added in 3.25 and 3.35 respectively), not something
every SQLite build supports. Before relying on either in a migration's
rollback logic, I ran a direct check against this environment's actual
bundled SQLite version to confirm both genuinely work here, rather
than assuming compatibility from general familiarity with SQLite.
That's the same discipline I'd want applied before relying on any
versioned platform feature in a real migration that has to run
correctly in whatever environment actually executes it.

## "How do you test that one tenant's data is actually isolated from another's in a multi-tenant system?"

I make the safe path structural rather than relying on every query
remembering to filter correctly. My scoped repository is constructed
once per tenant, and every method — create, read, list, update,
delete — binds that tenant's id into its SQL internally, so there's no
call site where a caller could pass the wrong tenant id and have it
work. I test the full operation set, not just reads: update and
delete against another tenant's real id have to affect zero rows,
which I verify with a return-value check and a separate follow-up
query confirming the target row is genuinely unchanged — not trusting
the function under test to accurately report its own effect.

## "Isn't it risky to write a deliberately insecure repository, even for testing?"

It's the only way to make the isolation proof mean something. Without
it, "the scoped repository returns null for another tenant's row"
is consistent with two different explanations: the scoping genuinely
works, or the test data was never reachable by that query in the
first place. The unsafe repository exists only inside this lab's own
test suite, is never imported by real application code, and its one
job is to prove — against the exact same real seeded data — that the
row really does exist and really would leak without the scoping. That
negative-path proof is what rules out the second explanation.

## "What wouldn't this approach catch?"

Row-level, query-predicate isolation doesn't protect against a bug in
the application layer that never calls the scoped repository at all —
a raw query written elsewhere that bypasses it entirely. It's also not
the only valid approach to multi-tenancy: separate schemas or
databases per tenant, or database-engine-level row-security policies
(which SQLite doesn't have), are different designs with different
operational tradeoffs. I'd disclose that scope explicitly rather than
imply this one technique is a complete multi-tenancy security
solution on its own.
