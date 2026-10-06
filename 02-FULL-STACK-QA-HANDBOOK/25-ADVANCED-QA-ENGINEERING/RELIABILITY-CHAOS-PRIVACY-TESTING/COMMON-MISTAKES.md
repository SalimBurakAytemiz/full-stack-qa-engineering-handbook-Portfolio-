# Common Mistakes (Real Ones, From Building These Labs)

Item 1 below is a real bug that was actually written, caught by
running the real test suite (not by inspection), and fixed at the root
cause. Item 2 is a different, also-real kind of mistake this
repository's discipline exists to prevent: a design trap noticed and
avoided *before* being built, not a bug found after the fact — kept
here because the reasoning matters as much as the fix would have.

## 1. A short-circuited call disguised as "retries exhausted"

`resilient-client.js`'s `call()` originally wrapped **every** final
failure — including a `CircuitOpenError` from a short-circuited call —
in a generic `RetriesExhaustedError`. `resilient-client.test.js`'s
circuit-breaker integration test asserted the specific error type
(`assert.rejects(client.call(), CircuitOpenError)`) and this caught it:
the actually-thrown error was `RetriesExhaustedError` wrapping the
`CircuitOpenError`'s message, not the `CircuitOpenError` itself — found
by running the suite (1 real failure out of 17), not by inspection.

The root cause was a category error: a short-circuited call is not a
"retries exhausted" outcome at all — no attempt was actually retried
against the dependency, the circuit breaker prevented that on purpose.
Wrapping it as if it were the same kind of failure hid the distinction
a caller genuinely needs (should I back off and try a fallback, or
should I treat this the same as a normal transient failure?).

**Fix:** `call()` now re-throws a `CircuitOpenError` as-is instead of
wrapping it, preserving the distinction.

## 2. The design trap of inventing backend endpoints to inflate evidence maturity

While designing the privacy-testing lab's GDPR data-subject-rights
tests, the natural-seeming next step would have been to add real
`/api/users/:id/export` and `/api/users/:id/erase` routes to the
backend so the tests could be "real E4 integration tests" like the PII
response scanner's tests are. That path was not taken: adding backend
functionality that QA-DEMO-SYSTEM doesn't actually have, purely to make
a QA lab's own evidence look more mature, is exactly the kind of
invented capability this repository's broader discipline exists to
prevent (see the master truth rule — repository evidence must never be
inflated past what was actually done).

**Decision:** `data-subject-rights-simulator.js` was built and
disclosed as an explicit in-memory fixture from the start, with the
real limitation (no such backend endpoints exist) stated directly in
the file's own header comment, this area's `README.md`, and the topic
doc. The QA technique is still real and still transfers — the lab is
honest about testing the technique against a fixture rather than
implying it tests real backend functionality that isn't there.

## What these two have in common

The first was found by running the real test suite and reading the
actual thrown error type — no amount of re-reading the code caught it
in advance. The second was avoided by asking "does this repository's
real backend actually do this?" before writing any code, rather than
building toward a stronger-sounding evidence claim first and
justifying it after. Both are instances of the same discipline this
handbook applies throughout: run the real thing, and never let the
desire for a more impressive-sounding result shape what gets built.
