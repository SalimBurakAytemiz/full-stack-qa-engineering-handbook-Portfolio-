# API Idempotency-Key Replay-Safety Lab

A real, hand-rolled HTTP server (`lib/idempotent-server.js`, over
Node's own `http` module) implementing Stripe's own real
`Idempotency-Key` header convention for `POST /orders`, backed by a
real idempotency store (`lib/idempotency-store.js`) that guarantees
the real "create an order" side effect runs **exactly once** per key —
including when multiple requests for the same key genuinely race.

## The core design choice

`lib/idempotency-store.js` stores the **in-flight promise itself**
under each key, not just a completed result. That is what makes this
a genuine concurrency-safe guarantee rather than a "check if it
exists, then act" race: when 10 real concurrent requests arrive with
the same key before any of them has finished, all 10 receive the
exact same promise — so the real side-effect function is invoked
exactly once, not once-per-request-that-happened-to-check-first.

## What this proves

- A request with no `Idempotency-Key` header is rejected with a real
  `400` — this server treats the header as required for this
  operation, the same way Stripe's real API does.
- Replaying the identical key returns the identical real order id,
  with the real side-effect counter unchanged.
- A different key creates a genuinely separate real order.
- **10 real concurrent HTTP requests with the same key** — fired via
  `Promise.all`, not sequentially — produce exactly one real order id
  and exactly one real side-effect increment. This is the test that
  actually exercises the race the store's design is meant to prevent;
  the sequential-replay test alone would not catch a store that only
  handles non-overlapping calls correctly.

## Scope boundary

- In-memory store only — a real idempotency implementation backing a
  real production service would need a persistent, shared store
  (Redis, a database table with a unique constraint) so the guarantee
  survives a process restart or holds across multiple server
  instances. This lab proves the *algorithm*, not a
  production-grade distributed store.
- Self-contained — a hand-rolled server over Node's own `http` module,
  never touches the real backend (`backend/src/`).

## Running it

```bash
npm run idempotency:test:unit --workspace automation-labs   # 9 unit tests
npm run idempotency:test --workspace automation-labs        # real aggregate run
```
