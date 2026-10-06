# Interview Questions — Reliability, Chaos & Privacy Testing

Every answer is scoped honestly: what these labs actually prove
(repository practice), versus what they don't claim (professional
experience, or real production chaos/privacy tooling). See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "Have you done chaos engineering professionally?"

No — this is repository-only, technique-level work. I built a
deterministic fault-injection lab (`chaos-reliability/`, 17 passing
tests) with a real circuit-breaker state machine and a real
bounded-retry client, tested against a local fixture server whose
failures I control precisely, never against real infrastructure or
real chaos tooling (no Chaos Monkey/Gremlin/Litmus). I'd be clear that
the resilience-code techniques transfer, but I haven't run a real
game-day exercise against production infrastructure.

## "How do you test a circuit breaker?"

Directly exercise the state machine, not just the happy path: prove it
opens at the real threshold (not one call early or late), prove calls
genuinely stop reaching the dependency while open — I check this by
watching the fixture server's own request count stay flat, not just by
trusting the breaker's internal state — and prove a HALF_OPEN trial
call can go either way: a real recovery closes it, a still-broken
dependency re-opens it immediately rather than optimistically staying
half-open. I used an injectable clock in my unit tests so the
OPEN→HALF_OPEN timing is exact and instant, not raced against a real
sleep.

## "What's the difference between a retry and a circuit breaker, and why use both?"

Retry handles a single call's transient failure by trying again a
bounded number of times. A circuit breaker handles *sustained* failure
across many calls by stopping the client from hammering a dependency
that's clearly down. They compose, but the composition has a subtlety
I actually hit as a real bug: a short-circuited call (breaker OPEN)
isn't a "retries exhausted" outcome — no attempt was actually retried
— so it needs to propagate as its own distinct error, not get wrapped
and disguised as a generic retry failure. My first implementation got
this wrong; my own circuit-breaker integration test caught it.

## "How would you test that a system handles a timeout correctly?"

Construct a dependency that genuinely never responds (not just slow —
actually hangs) and assert the caller's own timeout budget is what
ends the request, within a bounded, verifiable time window — not "it
eventually returned," but "it returned within budget X even though the
dependency never would have." My lab's `unreliable-server.js` has a
dedicated `hang` behavior specifically for this, distinct from `slow`
(which does eventually respond, just late) — testing both separately
catches bugs a single "delay" behavior would miss.

## "How do you test for PII or sensitive-data leakage in an API?"

Recursively scan real response bodies against two things: a denylist
of field names that should never carry a real value (passwords,
tokens, secrets — checking they're either absent or null, since a
`null` field existing structurally isn't the same as it leaking a real
value), and PII-shaped value patterns (email, phone) appearing under
keys that aren't declared as legitimately holding them. The tricky
part is that "sensitive" is endpoint-relative — a login response
legitimately returns a session token, a products listing returning one
anywhere would be a real bug — so the scanner needs a per-endpoint
allowlist, not one global rule. I proved this against QA-DEMO-SYSTEM's
actual running backend, not just a fixture — real login, products, and
notifications responses, genuinely scanned.

## "How would you test a 'right to erasure' (GDPR) feature?"

The assertion that matters isn't that the delete call returns success
— it's that a subsequent read finds nothing, proving the deletion is
real and not a soft-delete flag a later query forgets to check. I'd
also test anonymization as a genuinely separate operation from
erasure: PII fields should be scrambled, but non-identifying aggregate
data (like order totals) should survive for legitimate analytics —
that needs assertions on both what changed and what didn't. Worth
being upfront about: QA-DEMO-SYSTEM's real backend doesn't have these
endpoints, so I built this against a disclosed in-memory fixture
specifically to demonstrate the technique rather than invent backend
functionality this repository doesn't actually have — I'd rather be
honest about that scope than claim more integration depth than exists.
