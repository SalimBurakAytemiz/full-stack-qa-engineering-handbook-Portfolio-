# Pattern: Cache

## How it works

A frequently-read, expensive-to-compute or expensive-to-fetch value is
stored in a faster-access layer (in-memory, Redis, a CDN) and served
from there until it's invalidated or expires, avoiding recomputation on
every request.

## Why systems use it

Trades staleness risk for speed and reduced load on the underlying
data source — a deliberate, tunable tradeoff, not a free win.

## Status in this repository

**Not implemented.** Every `GET /api/products` call hits SQLite
directly — verified against
`QA-DEMO-SYSTEM/backend/src/services/products.service.js`, which has
no caching layer at all. This absence is itself referenced elsewhere in
this repository as a real, deliberate architectural fact (see
`08-SOFTWARE-ARCHITECTURE-FOR-QA/README.md`'s own Caching section) —
this page is the pattern-level detail that Handbook topic summarizes.

## QA Risks

- **Stale-read after write**: a write (e.g. `PATCH` to update stock)
  that doesn't invalidate the corresponding cache key means readers
  see outdated data — the single most common cache bug, and the
  hardest to catch without an explicit test for it.
- **Cache-key collision**: two logically different resources
  (different user, different locale) mapping to the same cache key
  because the key doesn't include enough context — a serious
  cross-user data-leak risk if the cached value is user-specific.
- **Fail-open vs. fail-closed on cache unavailability**: if the cache
  layer itself is down, does the system fall back to the real data
  source (fail-open, slower but correct) or fail the request entirely
  (fail-closed)? Both are defensible; a test suite needs to pin down
  which is intended.
- **Thundering herd on expiration**: many concurrent requests for the
  same just-expired key all missing the cache simultaneously and
  hitting the underlying data source at once — a real, well-known
  failure mode.

## Test Strategy

**Positive:** cached value returned on a repeat read without hitting
the underlying source (verifiable via a mock/spy on the data layer, or
timing). **Negative:** a write correctly invalidates the affected cache
key — the single test case that matters most. **Edge:** cache
unavailable (verify the fail-open/fail-closed decision), TTL boundary
(a read exactly at expiration).

## Related System Patterns

`CONCURRENCY.md` (thundering herd is a concurrency problem), `STATE-MACHINE.md`
(a cached entity's state must invalidate correctly on every legal
transition, not just some).

## Related Domains

Any domain with high-read, low-write-frequency data — E-Commerce
product catalogs are the canonical example.
