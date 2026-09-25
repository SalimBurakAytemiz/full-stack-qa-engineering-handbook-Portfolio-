# Pattern: Timeout

## How it works

Any call that depends on another system (a downstream API, a database
query, a provider integration) is bounded by a maximum wait time —
after which the caller gives up and handles the failure explicitly,
rather than waiting indefinitely.

## Why systems use it

Without a timeout, one slow or hung dependency can cascade into the
entire calling chain hanging — a single stuck downstream call
shouldn't be able to exhaust every connection/thread the caller has.

## Status in this repository

**Partially implicit, not explicitly tested.** `QA-DEMO-SYSTEM`'s
backend calls its own SQLite database synchronously (no network hop,
so no realistic timeout scenario exists there) and has no outbound
call to a genuine third-party dependency in its executable scope — the
domain pages that DO model third-party dependencies
(`03-MEDIA-STREAMING/README.md`'s provider-timeout risk,
`01-FINANCIAL-SERVICES/INSURANCE/README.md`) describe this pattern
conceptually without a repository lab behind it. Node's own default
HTTP client/server timeouts apply implicitly but are not explicitly
configured or tested anywhere in this codebase.

## QA risks (in a system that DOES implement it explicitly)

- **Timeout too long**: defeats the pattern's purpose — a caller still
  waits long enough to exhaust its own resources before giving up.
- **Timeout too short**: a legitimately slow-but-successful operation
  (a large report generation, a cold-start dependency) gets killed
  and retried unnecessarily, wasting more resources than it saves.
- **No distinction between "timed out" and "failed"**: these are
  different facts a caller needs — a timeout doesn't tell you whether
  the downstream operation actually completed after the caller gave
  up (a real source of duplicate-side-effect bugs, directly connected
  to `IDEMPOTENCY.md` — a timed-out request that actually succeeded
  server-side, retried by the client, needs the server's own
  idempotency guarantee to avoid a double-charge).
- **Timeout not applied consistently**: one code path has a timeout,
  a similar path elsewhere doesn't — inconsistency that only surfaces
  under real production load, not in normal testing.

## Test Strategy

**Positive:** a call completing well within the timeout succeeds
normally. **Negative:** a call exceeding the timeout is aborted with a
specific, actionable error (not a generic hang or crash). **Edge:** a
call completing *just barely* within the timeout window (flaky-test
risk if the boundary is too tight to test deterministically — this is
a real test-design problem, not just a system-design one).

## Related System Patterns

Directly composes with `RETRY.md` (a timed-out call is often the
trigger for a retry) and `IDEMPOTENCY.md` (as described above — a
retry after an ambiguous timeout needs idempotency to be safe).

## Related Domains

Media/Streaming (provider timeout), Insurance (third-party
underwriting/payment-processor timeout), any domain integrating a
third-party dependency.
