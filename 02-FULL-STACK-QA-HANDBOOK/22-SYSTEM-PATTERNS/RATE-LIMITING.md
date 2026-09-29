# Pattern: Rate Limiting

## How it works

A system caps how many requests a client (by IP, account, or token) can
make in a time window, rejecting excess requests (usually HTTP 429)
rather than letting unlimited load through.

## Why systems use it

Protects against brute-force credential attacks, scraping, and
accidental client-side retry storms (see `RETRY.md`).

## Status in this repository

**Not implemented.** `QA-DEMO-SYSTEM`'s backend has no rate-limiting
middleware — verified directly (`grep` across the middleware/routes
found no such logic), documented honestly during the Phase 11
security-aware QA work rather than silently assumed or invented. This
page exists so the pattern is documented even though this repository
has no working example of it yet — see `09-GAP-AND-LEARNING-MAP.md`
in the Digital Twin for the same gap recorded at the personal-knowledge
level.

## QA risks (in a system that DOES implement it)

- Rate limit keyed on the wrong dimension (per-IP when it should be
  per-account, allowing a distributed attacker to bypass it entirely)
- Limit too loose to actually stop brute-force, or too tight and
  blocking legitimate bursty use
- No distinction between a legitimate retry-after-error and an attack
  pattern
- Rate-limit state itself becomes a shared bottleneck under load

## Failure behavior

A rate-limited request should return a clear, standard status (429)
with a `Retry-After` hint where practical — not a generic 500 or a
silent timeout.

## Test strategy

**Positive:** requests under the limit succeed normally.
**Negative:** requests over the limit are rejected with the correct
status, and legitimate requests resume once the window resets.
**Edge:** boundary request (exactly at the limit), and the specific
keying dimension (per-account vs. per-IP) actually being enforced as
designed.

## Security implications

This is fundamentally a security control — its absence (as in this
repository) is itself a documented finding, not a neutral gap.

## Performance implications

The rate-limit check itself must be fast and must not become a
single point of contention under legitimate high load.

## Observability

Rate-limit rejections are a security-relevant signal worth their own
metric, distinct from generic error rates.

## Automation candidates

High, once implemented — deterministic given a controlled request
rate.

## Related domains

FinTech, Identity/Security (any authentication endpoint).
