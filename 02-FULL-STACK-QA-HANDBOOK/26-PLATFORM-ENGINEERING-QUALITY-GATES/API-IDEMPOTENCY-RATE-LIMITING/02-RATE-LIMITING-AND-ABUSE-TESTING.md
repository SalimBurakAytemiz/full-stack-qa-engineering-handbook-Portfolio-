# Rate Limiting & Abuse Testing

## Why token-bucket, and why that's a real design decision to test

A rate limiter's job is to bound how fast a client can consume a
resource. The simplest implementation — a fixed-window counter
("allow 100 requests per 60-second window, reset the counter every
60 seconds") — has a real, well-known flaw: a client can send 100
requests in the last second of one window and another 100 in the
first second of the next, for 200 requests inside roughly one second,
twice the intended rate. A token bucket avoids this because it
refills **continuously** based on real elapsed time rather than
resetting on a fixed boundary:

```js
tokens = Math.min(capacity, tokens + elapsedMs * refillRatePerMs);
```

There's no reset edge to burst across — the available tokens at any
instant depend only on how much real time has passed since the last
check, not on which side of a window boundary the clock happens to be.

## What the lab actually builds

`QA-DEMO-SYSTEM/automation-labs/rate-limiting/lib/token-bucket.js`
implements exactly that continuous-refill bucket, with an injectable
clock (`now`, defaulting to `Date.now`) so the refill math can be
proven deterministically with a fake clock instead of a real `sleep`
— the same pattern already established in Part 2's
`chaos-reliability/lib/circuit-breaker.js` and
`release-engineering/lib/rollout-manager.js`.
`lib/rate-limited-server.js` is a real, hand-rolled HTTP server
(Node's own `http` module) that enforces the bucket on `GET /ping`:
a request that finds the bucket empty gets a real `429` with a
`Retry-After: 1` header, not a dropped connection or an artificially
delayed response.

## What the real tests prove

- Requests within capacity succeed with a real `200`.
- A request that exceeds capacity gets a real `429`, checked against
  the server's own real accepted/rejected counters — not just the
  status code of one isolated request.
- Advancing a real injected fake clock by exactly the time needed for
  one token to refill makes the very next real request succeed,
  proving the refill is tied to real elapsed time.
- Refill never exceeds the configured capacity, even after a very
  large amount of elapsed time (`getTokens()` stays capped).

## A real finding: zero is a legitimate refill rate

The first draft of `createTokenBucket()` validated
`refillRatePerMs > 0` — strictly positive. The first draft of the
unit tests needed several "capacity-only, no refill" buckets
(`refillRatePerMs: 0`) to isolate pure-capacity behavior from refill
behavior in individual tests. Running those tests immediately failed
with `createTokenBucket requires a positive refillRatePerMs`, because
`0` does not satisfy `> 0`. This was a real conflict surfaced by a
real test run: a refill rate of exactly zero is a legitimate
configuration — a one-time allowance that never replenishes — so the
validation was wrong to reject it. The fix relaxed the check to
`refillRatePerMs >= 0`, rejecting only negative rates, and the
capacity-only tests construct validly. See `COMMON-MISTAKES.md` for
the full account and `EXECUTION.md` in the lab's own directory for
the exact failing-then-passing test output.

## What this does not prove

The lab enforces a single shared bucket — one logical client. A real
production rate limiter protecting a multi-tenant API keys a separate
bucket per client, API key, or IP address, which this lab does not
implement; it proves the bucket *algorithm* under a real HTTP server,
not a complete per-client rate-limiting middleware.

## Running it

```bash
npm run rate-limiting:test:unit --workspace automation-labs   # 8 unit tests
npm run rate-limiting:test --workspace automation-labs        # real aggregate run
```

See `EXECUTION.md` in the lab's own directory for the actual observed
output of both runs.
