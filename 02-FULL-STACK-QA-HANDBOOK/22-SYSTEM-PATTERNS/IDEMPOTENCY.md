# Pattern: Idempotency

## How it works

The same operation, submitted twice (client retry, duplicate network
delivery, duplicate event), must produce the same end state as
submitting it once — not double-apply. In this repository's order
flow, the transaction inside `orders.service.js` runs `BEGIN` →
stock/total validation → write → `COMMIT` with no `await` in between,
which (given Node's single-threaded event loop and `node:sqlite`'s
synchronous API) is what actually makes the "exactly one winner"
concurrency guarantee hold — see `CONCURRENCY.md` for the mechanism,
this page for the *idempotency* angle specifically.

## Why systems use it

Networks retry. Clients retry. Message queues redeliver. A system that
isn't idempotent under retry either double-charges, double-decrements
stock, or double-processes an event.

## QA risks

- Duplicate event processed twice (double notification, double
  balance change)
- Retry-after-timeout actually succeeded server-side the first time,
  client retries, and the system doesn't recognize it's the same
  logical operation
- Idempotency key (if used) not actually enforced at the data layer
  (race between check-and-insert)

## Failure behavior

A duplicate submission should either be a safe no-op (return the
original result) or be explicitly rejected as a duplicate — never
silently re-execute the side effect.

## Test strategy

**Positive:** single submission → single effect.
**Negative/edge:** the exact same request submitted twice
(sequentially and concurrently) → effect happens exactly once. This
repository's `order-concurrency.test.js` is a concurrency-flavored
version of this: two/five simultaneous requests for the last unit of
stock, asserting exactly one 201/PAID winner and the rest 409, with
final stock landing at exactly 0 — not `-1` or `1`.

## Security implications

A missing idempotency guard on a payment or balance-changing operation
is a direct financial-impact bug, not just a UX annoyance.

## Performance implications

Idempotency checks (e.g. a dedup lookup) must not become the
bottleneck they were meant to protect against.

## Observability

Log both "processed" and "recognized as duplicate, no-op'd" as
distinct, visible outcomes — a system that can't tell you it dedup'd
something can't prove idempotency is actually working.

## Automation candidates

High — deterministic, scriptable via concurrent HTTP requests
(`Promise.all`), no manual timing tricks needed.

## Related domains

FinTech (transaction/ledger idempotency), Commerce (order/stock
idempotency).

## Related labs

`QA-DEMO-SYSTEM/backend/tests/order-concurrency.test.js`.
