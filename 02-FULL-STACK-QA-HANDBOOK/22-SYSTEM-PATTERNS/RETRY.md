# Pattern: Retry

## How it works

A failed operation is attempted again, either by the client, an
automation framework, or the system itself — usually with a bounded
count and often with backoff. Retry only helps if the underlying
operation is safe to repeat (see `IDEMPOTENCY.md`); retrying a
non-idempotent operation turns a transient failure into a duplicate
side effect.

## Why systems use it (and why test automation uses it carefully)

Transient failures (network blip, momentary contention) shouldn't be
treated the same as a real defect. But blind retries in a test suite
can also hide a real, reproducible bug behind a "passed on retry"
result — this repository's own campaign explicitly rejected that
shortcut (see the CI-babysitting discipline: re-run only to confirm a
suspected flake is a flake, never to paper over an unconfirmed
failure).

## QA risks

- Retrying a non-idempotent write (double-charge, double-decrement)
- Retry count/backoff not actually bounded (infinite retry loop)
- A flaky test "fixed" by retrying it instead of fixing the root cause
- Retry masking a real, deterministic regression as a transient failure

## Failure behavior

After exhausting retries, the caller must receive a clear final failure
— not a silent, indefinite hang.

## Test strategy

**Positive:** transient failure → retry → eventual success, with the
side effect happening exactly once (not once per attempt).
**Negative:** retry exhausted → clean, explicit failure surfaced.
**Edge:** retrying a genuinely non-idempotent operation must either be
prevented or must be made idempotent first — this is a design
question a test can surface but not fix.

## Security implications

Aggressive automated retry against an auth endpoint is indistinguishable
from a brute-force attempt — rate limiting (see `RATE-LIMITING.md`)
is the usual mitigating pattern.

## Performance implications

Retry storms (many clients retrying simultaneously after a shared
failure) can turn a small outage into a much larger one — backoff and
jitter exist specifically to prevent this.

## Observability

Each retry attempt should be distinguishable in logs from a fresh
request, with a shared correlation ID across the attempts.

## Automation candidates

The retry mechanism itself is a good automation candidate (inject a
controlled transient failure, assert eventual success and single side
effect); using retries to stabilize a flaky test is not a substitute
for fixing the flake.

## Related domains

FinTech (payment retry), Commerce (checkout retry).

## Related labs

`QA-DEMO-SYSTEM/automation-labs/jmeter/scripts/run-jmeter.js` (fail
gate does NOT auto-retry — it reports the real result, on principle).
