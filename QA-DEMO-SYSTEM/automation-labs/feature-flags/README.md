# Feature Flags & Progressive Targeting Lab

A real, hand-rolled feature-flag evaluation engine (`lib/flag-evaluator.js`,
Node's own `crypto` module, no SDK) proving deterministic percentage
rollout, allow/deny-list overrides, and attribute-based segment
targeting — all against real evaluated outcomes, not a diagram of how
a flag system is "supposed to" behave.

## Why hashing, not randomness

A flag that uses `Math.random()` to decide "is this user in the 30%
rollout?" gives a different answer every time it's asked, for the
same user. That breaks the one property a feature flag absolutely
needs: the same user must see the same behavior on every request,
every page load, every service instance — otherwise you get a UI that
flickers between two versions of itself. `bucketOf()` instead hashes
the flag key together with the user's own stable identifier
(`sha256(flagKey:userId)`), so the same pair always lands in the same
bucket, computed independently on any process, with nothing persisted
anywhere.

## What this proves

- **Determinism**: the same flag + the same `userId` produces the
  same real answer across 20 repeated real evaluations.
- **Statistical correctness of the rollout**: a 25% configured
  rollout evaluated against 2000 real distinct synthetic user ids
  lands within 3 percentage points of 25% — not exactly 25% (that
  would be suspicious for a hash-based bucket), but genuinely close,
  checked by actually counting real outcomes, not asserted by
  assumption.
- **Override precedence**: an `allowList` entry is on even at 0%
  rollout; a `denyList` entry is off even at 100% rollout and even
  when it would also match a segment rule — proven as two independent
  real evaluations, not inferred from the code.
- **Segment targeting**: a context-attribute rule (e.g. `plan:
  "enterprise"`) turns a flag on at 0% rollout for a matching context
  and off for a non-matching one.

## Scope boundary

- In-memory flag definitions only — no remote flag-management service
  (LaunchDarkly, Split, a database-backed admin UI). This lab proves
  the *evaluation algorithm* a real flag service's SDK would run
  client-side, not a full flag-management platform.
- No flag-change audit trail, scheduling, or kill-switch propagation
  across a running fleet — this lab evaluates flags that are already
  configured, not the operational tooling around changing them.
- Self-contained — never touches the real backend (`backend/src/`).

## Running it

```bash
npm run feature-flags:test:unit --workspace automation-labs   # unit tests
npm run feature-flags:test --workspace automation-labs        # real aggregate run
```
