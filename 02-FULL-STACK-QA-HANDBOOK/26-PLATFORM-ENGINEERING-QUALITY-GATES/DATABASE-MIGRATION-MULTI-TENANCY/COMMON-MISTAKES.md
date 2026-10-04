# Common Mistakes (Real Ones, From Building These Labs)

## 1. Assuming SQLite feature support instead of checking it

Before writing migration 2's and migration 3's `down()` functions, the
first instinct was to rely on `ALTER TABLE ... DROP COLUMN` and `ALTER
TABLE ... RENAME COLUMN` purely from general SQLite familiarity. Both
are real, version-gated features (3.35.0 and 3.25.0 respectively) —
not something every SQLite build supports. The actual approach was to
run a direct real check against this environment's bundled
`node:sqlite` version first, confirming both operations genuinely
succeed here, before writing a single line of migration code that
depends on them. Relying on general knowledge of a feature instead of
checking the real, specific environment is exactly the kind of gap
that produces a migration that works in development and silently
breaks in a different deployment target.

## 2. A check that would have passed either way

The first draft of the aggregate runner's post-migration-2 check read
`backfilled.category === 'uncategorized' || backfilled.category ===
null`. That assertion is structurally useless: it is `true` whether
the backfill worked correctly, failed silently and left the column
`NULL`, or anything else landed in between — an `||` across the exact
two outcomes a backfill check needs to distinguish between means the
check cannot fail no matter what the code under test actually does.
This was caught during review, before the check was ever run against
real output, and the fix was to insert a row with an explicit,
specific value and assert that exact value comes back unchanged —
replacing a check that could not fail with one that actually could.

## What these two have in common

Both mistakes replaced a specific, falsifiable real check with
something more convenient: trusting general knowledge instead of
checking this exact environment, and writing an assertion loose enough
to pass regardless of outcome instead of one that actually
distinguishes success from failure. Unlike earlier milestones in this
campaign, none of this milestone's other scenarios (migration
ordering, idempotent re-apply, rollback exactness, tenant-scoped CRUD
isolation, the unsafe-repository leak proof) surfaced a real defect on
first run — all of them passed cleanly the first time they were
executed against real data, which is itself worth stating plainly
rather than inventing a "mistake" to report where none occurred.
