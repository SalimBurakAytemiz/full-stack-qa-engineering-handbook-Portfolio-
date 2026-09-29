# Pattern: Concurrency

## How it works

Two or more requests race for the same resource at (approximately) the
same time. The system must resolve the race deterministically — one
winner, defined losers, no lost updates, no double-spend of a shared
resource (stock, balance, seat).

## Why systems use it (or rather, why QA must test for it)

Concurrency bugs are invisible in single-request manual testing and
only appear under real simultaneous load — which is exactly why they
survive into production disproportionately often.

## QA risks

- Lost update (two writers, one silently overwrites the other)
- Overselling (two orders both succeed for the last unit of stock)
- Deadlock/timeout under contention
- A "concurrency-safe" claim resting only on single-transaction
  atomicity tests, never on two genuinely separate concurrent requests

## Failure behavior

Under contention, exactly one request should win per unit of contended
resource; the rest should fail with a clear, correct status (409, not
500), and the resource's final state should be internally consistent
(stock never negative, balance never double-decremented).

## Test strategy

**Positive:** two non-conflicting concurrent requests both succeed.
**Negative/edge:** two (or five) requests racing for the SAME last unit
of a scarce resource, fired via real concurrent HTTP (`Promise.all`),
asserting exactly one winner and a correct final state — this is
precisely what this repository's `order-concurrency.test.js` does, and
it exists because an earlier case-study claim of "concurrency-safe" was
found to rest only on single-transaction tests, not genuine
concurrency (see `evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-5-B8-B9-consistency.md`).

## Security implications

A race condition in a payment or authorization check is a security bug,
not just a reliability bug (e.g. two requests both passing a balance
check before either debits).

## Performance implications

Locking/transaction strategy that fixes correctness can introduce
contention/latency under real concurrent load — worth load-testing
together (see `PAYMENT.md` and the JMeter/Locust labs).

## Observability

A losing request's rejection reason (which constraint it lost to)
should be distinguishable in logs from an unrelated failure.

## Automation candidates

High, but requires genuinely concurrent test execution — sequential
retries do not exercise this pattern at all, which is a common false
sense of coverage.

## Related domains

FinTech (balance/ledger races), Commerce (stock/checkout races).

## Related labs

`QA-DEMO-SYSTEM/backend/tests/order-concurrency.test.js`,
`QA-DEMO-SYSTEM/automation-labs/locust/locustfile.py` (`place_order`
task under real concurrent load).
