# Data Tools

## SQL / SQLite (T4 CI_VERIFIED)

**Concepts:** relational data validation as a QA discipline — reading
raw rows directly, independent of whatever the API claims, is the only
way to catch a bug where the API's response and the actual persisted
state disagree.

**Setup:** `QA-DEMO-SYSTEM/backend/` uses `node:sqlite`'s synchronous
`DatabaseSync` API — a deliberate architectural choice that (combined
with Node's single-threaded event loop) is WHY a transaction with no
`await` between `BEGIN` and `COMMIT` can't be interleaved by another
request in the same process, which is the real mechanism behind this
repository's concurrency guarantees (see
`02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/CONCURRENCY.md`).

**QA use cases exercised here:** SELECT/WHERE/JOIN/sort/filter
correctness, CRUD lifecycle, NULL/UNIQUE constraint validation,
financial SUM-aggregate cross-checks against API-reported totals,
timestamp format/monotonicity, orphan-row detection.

**Related labs:** `QA-DEMO-SYSTEM/backend/tests/database-testing.test.js`.
