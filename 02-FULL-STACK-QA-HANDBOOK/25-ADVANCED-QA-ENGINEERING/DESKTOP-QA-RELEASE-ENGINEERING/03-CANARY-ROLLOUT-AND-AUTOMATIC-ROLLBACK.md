# Canary Rollout & Automatic Rollback Testing

## The property under test: does a bad release actually get stopped?

A progressive (canary) rollout's entire value proposition is a single
testable property: **a release that fails its health check at any
stage must never reach 100% traffic, and must be automatically pulled
back** — without a human needing to notice and intervene first. This
is a behavioral property, not a configuration fact, so it has to be
proven by actually running the state machine through both an all-pass
and a real-failure scenario, not by reading its code and reasoning
that it "should" work.

## A real state machine, not a diagram

`lib/rollout-manager.js` implements a real, staged canary rollout:
configurable traffic-percentage stages (default `[10, 50, 100]`), a
real health-check call before every stage advance, and immediate
rollback to `0%` traffic the instant one health check reports
unhealthy. The health-check function and clock are both injectable —
the same testability discipline this repository's
`chaos-reliability/lib/circuit-breaker.js` already established —
specifically so tests can inject a real, controlled failure at an
exact stage and observe the real resulting state transition, without
needing a real traffic-shifting proxy or a real sleep.

## Proving both outcomes with the same unmodified code

`tests/rollout-manager.test.js` and the aggregate runner both exercise
two deliberately opposite real scenarios against the exact same
`createRolloutManager()` implementation:

- **All stages healthy:** the manager advances `10% -> 50% -> 100%`
  and reaches `COMPLETE`.
- **A real injected failure exactly at the 50% stage:** the manager
  advances to `10%` successfully, then the health check at `50%`
  reports `false` — and the very next `advance()` call observably sets
  `trafficPercent` back to `0%` and the state to `ROLLED_BACK`, never
  reaching `50%` traffic.

Proving only the happy path (as a less careful test suite might) would
miss the entire point of a canary rollout — the mechanism matters
specifically *because* of what it does when something fails, so the
failure scenario is not optional coverage; it is the primary thing
under test.

## The audit trail is part of the contract, not an afterthought

`getStatus().history` is a real, ordered, append-only list of every
transition (`START`, `ADVANCE`, `ROLLBACK`, `COMPLETE`) with a real
timestamp from the injectable clock. `tests/rollout-manager.test.js`
asserts the exact event sequence for the rollback scenario
(`['START', 'ADVANCE', 'ROLLBACK']`) — in a real deployment system,
this audit trail is what an on-call engineer or a post-incident review
actually reads, so testing its exact shape (not just the final state)
is itself part of testing the feature correctly, not test-code
decoration.

## Scope boundary

`lib/rollout-manager.js` never shifts real network traffic, never
calls a real load balancer or service mesh API, and is not a
replacement for a real deployment orchestration platform (Argo
Rollouts, Spinnaker, AWS CodeDeploy, Kubernetes' own rolling-update
controller). It models the orchestration *decision logic* — when to
advance, when to roll back — in isolation, which is exactly the part
of a canary rollout that is feasible to test deterministically without
real infrastructure, and exactly the part most likely to contain a
real bug if written carelessly (an off-by-one in stage advancement, a
race between a slow health check and a stage timeout, a rollback that
rolls back to the wrong percentage).
