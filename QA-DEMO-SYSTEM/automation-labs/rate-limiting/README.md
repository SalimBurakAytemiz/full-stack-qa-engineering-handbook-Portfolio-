# Rate Limiting & Abuse Testing Lab

A real, hand-rolled token-bucket rate limiter (`lib/token-bucket.js`)
backing a real HTTP server (`lib/rate-limited-server.js`, over Node's
own `http` module) that enforces it on `GET /ping`. The clock is
injectable, so refill behavior is proven deterministically via a real
fake clock — never a real `sleep`.

## Why token-bucket, and why a continuous (not stepped) refill

A token bucket refills continuously based on real elapsed time
(`tokens = min(capacity, tokens + elapsedMs * refillRatePerMs)`), not
on a fixed-interval reset. That is a real, meaningful design choice:
a fixed-window counter ("100 requests per minute, reset every 60s")
lets a client burst up to 2x its real intended rate right at a window
boundary (right before AND right after the reset). A continuous
token-bucket refill does not have that boundary-burst problem.

## What this proves

- Requests within capacity succeed with a real `200`.
- A request that finds the bucket empty gets a real `429` — never a
  silently dropped connection or an artificially slowed response —
  checked against the server's own real accepted/rejected counters,
  not just the HTTP status code of one request in isolation.
- After enough real elapsed time (via the injected fake clock) passes,
  the bucket genuinely refills and a request that would have been
  rejected a moment earlier now succeeds.
- Refill never exceeds the configured real capacity, even after a
  very large amount of elapsed time.

## Scope boundary

- Single shared bucket (one logical client) — a real production rate
  limiter protecting a multi-tenant API would key buckets per
  client/API-key/IP, which this lab does not implement; it proves the
  bucket *algorithm*, not a full per-client limiting middleware.
- Self-contained — never touches the real backend (`backend/src/`).

## Running it

```bash
npm run rate-limiting:test:unit --workspace automation-labs   # 8 unit tests
npm run rate-limiting:test --workspace automation-labs        # real aggregate run
```
