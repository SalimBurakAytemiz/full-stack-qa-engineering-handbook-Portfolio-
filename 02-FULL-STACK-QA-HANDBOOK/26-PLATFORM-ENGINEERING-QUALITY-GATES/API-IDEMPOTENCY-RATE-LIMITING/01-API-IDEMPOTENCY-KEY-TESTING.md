# API Idempotency-Key Replay-Safety Testing

## Why idempotency keys exist

A client that POSTs "create an order" and never receives a response —
because the connection dropped, the client crashed, or a proxy timed
out — cannot tell whether the order was actually created. The
correct, safe action is to retry. But a retry that re-executes the
same side effect produces a duplicate order, a duplicate charge, a
duplicate email. The `Idempotency-Key` header convention (the same
one Stripe's real API uses) solves this: the client generates one key
per logical operation and sends it on every retry of that operation;
the server guarantees the side effect runs exactly once per key, no
matter how many times the request is repeated.

## What the lab actually builds

`QA-DEMO-SYSTEM/automation-labs/idempotency-testing/lib/idempotent-server.js`
is a real, hand-rolled HTTP server (Node's own `http` module, no
framework) exposing `POST /orders`. It requires a real
`Idempotency-Key` header — a request without one gets a real `400`,
not a silently-processed anonymous request. The server delegates the
exactly-once guarantee to
`lib/idempotency-store.js`, a standalone module with no HTTP
dependency at all, so the concurrency-safety guarantee can be — and
is — tested at two independent levels: the store alone, and the full
HTTP server.

## The core design choice: store the promise, not the result

```js
function handle(key, executeFn) {
  if (entries.has(key)) {
    return entries.get(key);
  }
  const promise = Promise.resolve().then(executeFn);
  entries.set(key, promise);
  return promise;
}
```

A naive "idempotency store" might check `if (!results.has(key))`,
run the side effect, then store the result — a classic
check-then-act race: two concurrent calls can both pass the `has()`
check before either has stored anything, and both end up running the
real side effect. Storing the **in-flight promise itself**, before
the side effect has even settled, closes that window: the second
concurrent call sees the key already present (because `entries.set()`
ran synchronously, before any `await`) and receives the exact same
promise the first call is already waiting on — so the side effect
genuinely runs once, not once-per-caller-that-got-there-first.

## The proof that actually matters: a genuine race, not a sequential replay

A test that calls the server twice in a row with the same key, and
checks the second call didn't duplicate the order, does **not** prove
the store is concurrency-safe — it only proves sequential replay is
safe, which a much simpler (and racy) implementation would also pass.
The lab's real proof is the 10-way concurrent test:

```js
const requests = Array.from({ length: 10 }, () => createOrder(baseUrl, sameKey));
const responses = await Promise.all(requests);
```

All 10 real HTTP requests are fired before any of them has a chance
to complete, exercising the actual race the in-flight-promise design
exists to prevent. The test asserts all 10 responses carry the same
single real order id, and the server's real side-effect counter
increased by exactly 1 — not 10, and not some unpredictable number in
between. This same pattern (10-way `Promise.all` race) is applied at
both the store level (`idempotency-store.test.js`) and the full
HTTP-server level (`idempotent-server.test.js`).

## What this does not prove

The store is in-memory and lives inside a single process. A real
production idempotency implementation backing a service that runs
multiple instances behind a load balancer, or that needs the
guarantee to survive a process restart, needs a shared, persistent
store — typically Redis with a `SETNX`-style atomic check, or a
database table with a unique constraint on the idempotency key column.
This lab proves the *algorithm* (store the in-flight operation, not
just the completed result) in a setting small enough to verify
directly against a real concurrent race; it does not claim to be a
drop-in production idempotency layer.

## Running it

```bash
npm run idempotency:test:unit --workspace automation-labs   # 9 unit tests
npm run idempotency:test --workspace automation-labs        # real aggregate run
```

See `EXECUTION.md` in the lab's own directory for the actual observed
output of both runs.
