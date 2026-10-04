# Common Mistakes (Real Ones, From Building These Labs)

## 1. Rejecting a legitimate zero as if it were a missing input

The first draft of `rate-limiting/lib/token-bucket.js` validated its
constructor input with `refillRatePerMs > 0` — treating zero as
invalid, the same way a missing or negative value would be. But the
first draft of the unit tests needed to construct several "no refill,
capacity-only" buckets with `refillRatePerMs: 0`, specifically to
isolate pure-capacity behavior (consume up to capacity, then always
fail) from refill behavior in individual test cases. Running those
tests immediately produced two real failures —
`createTokenBucket requires a positive refillRatePerMs` — because the
validation rejected a configuration that is actually legitimate: a
bucket that never refills is a real, valid use case (a one-time
allowance), not an error condition. The fix changed the check from
`refillRatePerMs > 0` to `refillRatePerMs >= 0` (reject only negative
rates), and the "rejects" test was rewritten to explicitly assert all
three cases: a non-positive capacity throws, a negative refill rate
throws, and a zero refill rate does **not** throw. See
`rate-limiting/EXECUTION.md` in the lab's own directory for the exact
failing-then-passing test output.

## What this is, and isn't

This was a real validation bug caught by a real test run, documented
here exactly as it happened — not a hypothetical scenario invented for
this document. The idempotency-testing lab's design (the in-flight
promise store, the required-header check, the exactly-once-under-
concurrency guarantee) did not surface a comparable real defect during
its own build: its unit tests, including both 10-way concurrent-race
tests, passed on their first real run. That is worth stating plainly
rather than inventing a second "mistake" to report where none actually
occurred.
