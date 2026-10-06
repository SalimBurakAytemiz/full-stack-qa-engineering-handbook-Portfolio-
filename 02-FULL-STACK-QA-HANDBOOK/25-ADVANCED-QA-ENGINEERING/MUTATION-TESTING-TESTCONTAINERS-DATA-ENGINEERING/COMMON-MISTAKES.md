# Common Mistakes (Real Ones, From Building These Labs)

## 1. Assuming a surviving mutant always means "weak test"

The first run of the mutation-testing lab's `sql-order-by-removed`
mutant survived the baseline assertion battery — the same reaction a
mutation-testing newcomer has is "the test must be too weak, strengthen
it." A genuinely stronger battery was built (inserting rows out of id
order, specifically to defeat an implementation that merely happens to
look sorted) and run against the **same** mutant.

**It survived that too.** That ruled out "the test wasn't strong enough"
and pointed at the real cause: the SQLite engine in this environment
returns this exact query's rows in `rowid` order regardless of
`ORDER BY`, for a full scan of a table whose `rowid` is the `id` with no
secondary index — a genuine equivalent mutant, not a test gap. Reporting
this honestly (both battery results, the investigation, and the real
conclusion) rather than quietly deciding "good enough, 83% mutation
score, ship it" is the actual point of this lab. See
`01-MUTATION-TESTING.md`'s "equivalent-mutant problem" section.

## 2. Forgetting that `testcontainers`'s own detection IS the honest-degraded-mode logic

The first instinct when adding the Testcontainers lab was to write a
pre-flight check — shell out to `docker info`, parse its exit code,
decide in advance whether to attempt the real test. That would have
worked, but it duplicates logic `testcontainers` itself already has (it
tries several real strategies to find a working Docker runtime and
throws a specific, real error — `Could not find a working container
runtime strategy` — when none work). The lab was built instead to just
**attempt the real thing** and classify the **real** error it gets back
(`lib/classify-docker-error.js`), which is both less code and more
honest: it reports exactly what actually happened, not a prediction made
before trying.

## 3. The schema-drift check's expectation almost regenerated itself

An early version of `lib/expected-schema.js` was tempting to write as a
function that read the live schema and returned its own column list —
convenient, always in sync, never "stale." That would have made
`checkSchemaDrift` permanently return zero violations, because it would
always be comparing the schema against itself. The whole point of a
drift check is that its expectation is a **separate, independently
maintained** artifact that *can* fall out of sync with reality — so
`expected-schema.js` was written by hand instead, and
`data-quality.test.js`'s negative case (a deliberately wrong expected
column list) proves the check still has real teeth.

## 4. The order-totals reconciliation check needed care with floating-point

An early version of `checkOrderTotalsReconcile` compared the stored
total and the recomputed total with strict `===`. Real floating-point
arithmetic (`quantity * unit_price` summed across several rows) does not
always land on the exact same bit pattern as a total computed and stored
at a different time, even when both are "correct" to any sane business
definition. A small tolerance (`0.005`) was added before this shipped,
and the test suite's positive case (checking the real, clean extracted
data) is what caught that the naive `===` version would have produced
false positives.

## 5. Treating every order as a sale, regardless of whether it was paid for

`lib/etl.js`'s `transformRevenueByProduct` and
`transformOrderSummaryByUser` originally summed every order and
order_item unconditionally. This passed every test and every CI run in
this repository, because every seed dataset this lab's own tests and
aggregate runner used happened to only contain `PAID` orders — so the
bug never had an input that could expose it. The real backend writes
two other order statuses for a real payment attempt that did not
collect money, `PAYMENT_FAILED` and `PAYMENT_TIMEOUT`
(`STATUS_BY_PAYMENT_RESULT` in
`backend/src/services/orders.service.js`), and neither transform ever
excluded them. Like item 5 in
`DISTRIBUTED-MESSAGING-SUPPLY-CHAIN-COMPATIBILITY/COMMON-MISTAKES.md`,
this one was **not** caught during the original build — an
independent Codex review of the finished lab found it, with a
concrete reproduction (2 unpaid orders at 149.90 each reporting
299.80 of revenue that never occurred). The fix scopes both
aggregates to `status === 'PAID'` only, and 4 new regression tests
(all-failed, all-timeout, mixed, all-paid) plus a new aggregate-runner
proof exercise the exact failed/timeout case the original tests never
had an input for. See `automation-labs/data-engineering/EXECUTION.md`'s
"Run 3" section.

## What these five have in common

Each one looks, at first glance, like it should be fixed by making a
check or a tool *do more* (detect more docker states in advance, trust
the schema more, compare numbers more strictly, sum every row without
asking what it represents). In every case, the real fix was the
opposite: trust the real tool's own real signal (testcontainers' own
error), keep the check's power honest by keeping its expectation
independent (the schema snapshot), match the precision tolerance to
the actual arithmetic involved rather than an unrealistic ideal, and
ask what a row's own status field actually means before summing it as
money collected.
