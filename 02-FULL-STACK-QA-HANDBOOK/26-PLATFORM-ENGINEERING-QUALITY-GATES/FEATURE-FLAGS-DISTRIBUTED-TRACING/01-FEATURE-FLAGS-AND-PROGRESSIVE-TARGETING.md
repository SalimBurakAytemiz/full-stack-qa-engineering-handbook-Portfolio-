# Feature Flags & Progressive Targeting

## Why a feature flag needs to be deterministic, not random

A feature flag's whole job is deciding, for a given user and a given
flag, whether a piece of behavior is on. If that decision used
`Math.random()`, the same user would get a different answer on their
next page load, their next API call, every time the flag is
evaluated again. That's not progressive rollout — it's a UI that
flickers. The fix is to make the decision a deterministic function of
something stable: the flag's own key and the user's own id.
`QA-DEMO-SYSTEM/automation-labs/feature-flags/lib/flag-evaluator.js`
does this with `bucketOf()`:

```js
const hash = crypto.createHash('sha256').update(`${flagKey}:${identifier}`).digest('hex');
return parseInt(hash.slice(0, 8), 16) % 100;
```

Hashing the key and the identifier together, then taking the result
modulo 100, produces a number in `[0, 100)` that is the same every
time for the same flag/user pair, computed independently on any
process, with nothing persisted anywhere — no database row saying
"user X is in the rollout."

## Why the real test checks a distribution, not just a boolean

A unit test that checks "is `bucketOf('flag', 'user-1')` less than
25?" only proves one user's outcome, which could be a coincidence of
that one hash value. The lab's real proof evaluates the same 25%
rollout against 2000 real distinct synthetic user ids and checks that
the real observed `on` percentage lands within 3 points of 25% — not
exactly 25% (a hash-based bucket shouldn't land exactly on the
target; that would itself be suspicious), but close enough to prove
the bucketing function's distribution genuinely approximates the
configured rate.

## Override precedence: allow/deny lists and segments

A real flag system needs escape hatches beyond percentage rollout:
force a specific user on regardless of their bucket (an internal
tester, a beta customer who asked in), or force a user off regardless
of a 100% rollout (someone who reported a bug with the new behavior).
The evaluator checks `denyList` first, then `allowList`, then segment
rules, and only falls through to the percentage bucket if none of
those match — proven as independent real evaluations in
`run-feature-flags-lab.js`, including the adversarial case of a
denyList entry that would otherwise also match a 100%-rollout flag.

## What this does not prove

This lab evaluates flags that are already configured in memory — it
doesn't implement a flag-management service, an admin UI for
changing flag definitions, an audit trail of who changed what, or
kill-switch propagation across a running fleet of service instances.
A real flag platform (LaunchDarkly, Split, a homegrown
database-backed one) adds all of that operational tooling around the
same core evaluation algorithm this lab proves.

## Running it

```bash
npm run feature-flags:test:unit --workspace automation-labs   # unit tests
npm run feature-flags:test --workspace automation-labs        # real aggregate run
```

See `EXECUTION.md` in the lab's own directory for the actual observed
output of both runs.
