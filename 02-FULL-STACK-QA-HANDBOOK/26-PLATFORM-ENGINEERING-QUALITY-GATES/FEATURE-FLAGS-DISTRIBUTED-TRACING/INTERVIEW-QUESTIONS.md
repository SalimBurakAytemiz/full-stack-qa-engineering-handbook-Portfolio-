# Interview Questions — Feature Flags & Progressive Targeting / Distributed Tracing

Every answer is scoped honestly: what this repository's labs actually
prove (repository practice), versus professional experience or
production-grade tooling this doesn't claim. See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "How would you implement a percentage-based feature rollout so the same user always gets the same experience?"

I'd make the decision a deterministic function of something stable —
typically a hash of the flag's key combined with the user's own id —
rather than a random draw on every evaluation. In this repository's
lab, `bucketOf()` hashes `flagKey:userId` with SHA-256 and takes the
result modulo 100, so the same pair always lands in the same bucket
on any process, with nothing persisted anywhere. The alternative,
using `Math.random()` per call, would make the "on/off" state flicker
on every page load for the same user, which defeats the point of a
rollout.

## "How would you test that a 25% rollout actually behaves like 25%?"

Not by checking one user's outcome — that only proves one hash value,
which could be a coincidence. I'd evaluate the flag against a real
sample of many distinct user ids (2000, in this lab) and check the
observed "on" percentage against the configured target with a
deliberate statistical tolerance, not an exact match — a hash-based
bucket shouldn't land exactly on 25% for a finite sample, and a test
that demanded exact equality would be structurally wrong. The
tolerance has to be tight enough to still fail a genuinely broken
implementation (say, one that used `Math.random()` and landed near
50%), which is a design decision I made deliberately before running
the test, documented in `COMMON-MISTAKES.md`.

## "What takes precedence: a flag's percentage rollout or an explicit user override?"

The override, always — and the order among overrides matters too. In
this lab's evaluator, a `denyList` match is checked before an
`allowList` match, before segment rules, before falling through to
the percentage bucket. I proved the most adversarial ordering
explicitly: a user on the `denyList` of a flag that's also at 100%
rollout and would also match a segment rule must still come back
`false` — the deny takes precedence over everything else.

## "How do you prove distributed trace-context propagation actually works, rather than just asserting it in code?"

By making it cross a real HTTP request boundary, not a function call —
though I'd be careful not to overstate that as a process boundary,
since in this lab it isn't one. The "downstream" side is a real HTTP
client (a plain async function, not a server) that makes a real
`http.request` to the one real `node:http` server in the lab (the
"upstream" service), on a real loopback port, carrying a real
`traceparent`-shaped header. The upstream server parses that header
back out of the real incoming request and starts its own child span
using the recovered trace id and parent span id. Both sides run in
the same Node process and the same CI job — there's no second
process, container, or machine here, and I wouldn't claim one when
describing this lab. If I'd tested this with two function calls that
passed the trace context directly instead of going through a real
HTTP request, I'd have proven nothing about the one step most likely
to actually break in a real system — serializing context onto a
header and deserializing it back out correctly on the other side of
an actual network call. Proving a genuine cross-process or
cross-machine boundary would need a second real process (or
container) in the test setup, which this lab doesn't have.

## "How do you verify a span tree has the right parent/child structure?"

I don't assume it from reading the code — I read it back from what
each side actually recorded. Both the downstream and upstream
services write their spans independently to a shared in-memory
collector, and the test queries that collector for all spans sharing
one trace id, then checks the actual count (exactly one root, one
child) and the actual field value (the child's `parentSpanId` equals
the root's real `spanId`). That's checking the real recorded data
from two independent writers, not inferring correctness from static
code review.

## "What wouldn't these two approaches catch in a real production system?"

The feature-flag lab evaluates flags that are already configured in
memory — it doesn't cover a flag-management platform's admin UI,
audit trail, or kill-switch propagation across a running fleet. The
tracing lab's span collector is in-memory and local to one test
process — there's no real export to an actual tracing backend
(Jaeger, Zipkin, an OTLP collector), no cross-host aggregation, and
the `traceparent`-shaped header is loosely modeled on, not fully
conformant with, the W3C Trace Context specification (no
`tracestate` handling). I'd disclose both boundaries explicitly
rather than imply either lab is a complete production platform.
