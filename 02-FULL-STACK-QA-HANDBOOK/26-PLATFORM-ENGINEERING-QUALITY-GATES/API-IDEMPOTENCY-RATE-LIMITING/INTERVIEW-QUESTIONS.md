# Interview Questions — API Idempotency-Key Replay-Safety & Rate Limiting

Every answer is scoped honestly: what this repository's labs actually
prove (repository practice), versus professional experience or
production-grade tooling this doesn't claim. See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "How would you test that an idempotent API endpoint is actually safe to retry?"

I'd separate two cases that look similar but aren't: sequential replay
and genuine concurrent racing. A sequential test — call the endpoint
twice in a row with the same key, assert the second call doesn't
duplicate the side effect — is necessary but not sufficient, because a
naive "check if the key exists, then act" implementation passes it
while still being racy. The test that actually matters fires several
real requests with the same key concurrently (via `Promise.all`, not
a loop with awaits in between) and asserts exactly one side effect
ran. In this repository's lab I used 10 concurrent requests at both
the store level and the full HTTP level to prove that.

## "What's wrong with a 'check if this key exists, then run the operation' idempotency implementation?"

It has a race window between the check and the act: two concurrent
calls can both see "key doesn't exist yet" before either has recorded
anything, and both proceed to run the real side effect. The fix I used
is to store the in-flight **promise** itself under the key
synchronously, before the side effect has settled — so a second
concurrent caller sees the key already present and receives the same
promise the first caller is already waiting on, rather than racing to
decide whether to start a new operation.

## "Why would you choose a token bucket over a simple request counter with a reset timer for rate limiting?"

A fixed-window counter has a real boundary problem: a client can
exhaust its allowance right before a window resets and immediately
exhaust a fresh allowance right after, getting roughly double the
intended rate across that boundary. A token bucket refills
continuously based on actual elapsed time rather than resetting on a
fixed boundary, so there's no edge to burst across — the tokens
available at any instant depend only on real elapsed time since the
last check.

## "How do you test refill behavior in a rate limiter without making your test suite slow with real sleeps?"

I inject the clock as a parameter (defaulting to `Date.now`) and pass
a fake clock with an `advance(ms)` method in tests. That makes the
refill proof deterministic and fast — advancing the fake clock by
exactly the time needed for one token to refill, then asserting the
very next request succeeds — without a single real `setTimeout` or
`sleep` in the test suite. I used the same pattern earlier in this
repository's chaos-engineering and release-engineering labs.

## "Tell me about a real bug you actually hit building one of these labs."

Building the token bucket, I first validated `refillRatePerMs > 0`,
treating zero the same as a missing or negative value. But a refill
rate of exactly zero is legitimate — a bucket that never refills, a
one-time allowance — and my own test suite needed that exact
configuration to isolate pure-capacity behavior from refill behavior.
Running the tests produced two real failures before I caught it and
relaxed the check to `>= 0`, rejecting only genuinely negative rates.
It's a small bug, but it's a real one I hit while building this, not
a scenario I constructed after the fact for this document.

## "What wouldn't these two approaches catch in a real production system?"

The idempotency store is in-memory and single-process — a real
production implementation serving multiple instances behind a load
balancer, or needing the guarantee to survive a restart, needs a
shared persistent store (Redis, or a database table with a unique
constraint on the key). The rate limiter enforces one shared bucket;
a real multi-tenant API needs a bucket per client or API key, which
this lab doesn't implement. I'd disclose both boundaries explicitly
rather than imply either lab is a complete production-ready
implementation on its own.
