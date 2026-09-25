# Pattern: Feature Flags

## How it works

A runtime toggle controls whether a code path is active — for a
specific user, a percentage of traffic, or globally — without a
redeploy. Distinct from an environment variable set once at deploy time:
a feature flag can change mid-session, per-request.

## Why systems use it

Decouples deployment from release (ship the code dark, enable it
later), enables gradual rollout (`Related System Patterns` below), and
lets a broken feature be disabled instantly without a rollback.

## Status in this repository

**Not implemented.** No feature-flag system exists in
`QA-DEMO-SYSTEM` — every code path is either always active or not
present at all (this repository's own documented gaps —
`gap.release.feature-flags` in
`01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml` — record this
honestly).

## QA Risks

- **Flag-combination explosion**: with N independent flags, there are
  2^N possible states — a real, practical test-design problem
  (`03-TEST-DESIGN/`'s combinatorial-testing techniques apply directly
  here, since testing every combination is usually infeasible and a
  risk-based subset must be chosen deliberately).
- **Stale flag cleanup**: a flag left in the codebase long after its
  rollout is complete becomes dead code that still has to be reasoned
  about — a real, common source of confusing bugs ("is this path even
  reachable anymore?").
- **Flag evaluated inconsistently within one request**: if a flag's
  value is checked twice during the same request (e.g. once in
  routing, once in a downstream service) and its value could
  theoretically change between those checks, the two checks can
  disagree — a subtle, hard-to-reproduce bug class.
- **Default-on-error behavior**: if the flag-evaluation service itself
  is unreachable, does the flag default to on or off? This needs to be
  a deliberate, tested decision, not an accident of implementation.

## Test Strategy

**Positive:** flag on and flag off, each producing the correct
behavior. **Negative:** flag-service unavailable (verify the
default-on-error decision). **Combinatorial:** a risk-based subset of
multi-flag combinations, not an exhaustive 2^N sweep. **Consistency:**
the same flag evaluated multiple times within one logical request
returns the same value throughout.

## Related System Patterns

Directly enables canary and staged rollout (a flag targeting a
percentage of traffic IS a canary release mechanism) — the same
staged-rollout principle `04-MOBILE-DIGITAL-PLATFORMS/README.md`
describes for multi-country release strategy, implemented via flags
rather than a full separate deployment.

## Related Domains

Any domain doing staged/gradual feature rollout — Multi-Country Mobile
(country-by-country rollout) is the most natural fit among this
repository's own domain pages.
