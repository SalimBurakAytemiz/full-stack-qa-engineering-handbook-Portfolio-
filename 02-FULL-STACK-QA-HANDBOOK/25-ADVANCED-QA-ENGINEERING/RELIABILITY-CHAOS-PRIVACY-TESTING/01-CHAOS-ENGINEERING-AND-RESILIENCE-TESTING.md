# Chaos Engineering & Resilience Testing

**Executable evidence:** `chaos-reliability/tests/*.test.js`,
`chaos-reliability/lib/unreliable-server.js`,
`chaos-reliability/lib/circuit-breaker.js`,
`chaos-reliability/lib/resilient-client.js`.

## What chaos engineering actually tests

Real chaos engineering injects real failures into a real system
(kill a pod, add real network latency, drop packets) and observes
whether the system degrades gracefully. This lab does not do that —
see the scope-boundary note in this subfolder's `README.md`. What it
does test, genuinely, is the **resilience code** that a real chaos
experiment would be validating: does a circuit breaker actually open
under sustained failure, does a client actually stop retrying
eventually, does a hung dependency actually get abandoned instead of
hanging the caller forever, and does the system actually recover once
the dependency comes back.

## The fault-injection fixture

`lib/unreliable-server.js` is a real local HTTP server whose behavior
per request is driven by a fixed, ordered fault schedule —
`['ok', 'error_500', 'slow', 'hang', ...]`, cycling, never random. This
determinism matters for the same reason the AI Systems Testing lab's
mock provider is deterministic (see
`../AI-ML-LLM-SYSTEMS-TESTING/README.md`): a flaky chaos test that
sometimes catches a bug and sometimes doesn't is worse than no test —
it trains the team to ignore failures. `tests/unreliable-server.test.js`
tests the fixture itself, because a fault schedule that lies about its
own behavior would invalidate every other test in this lab.

## Circuit breaker

`lib/circuit-breaker.js` is a real CLOSED → OPEN → HALF_OPEN state
machine, not a description of one:

- **CLOSED**: calls go through; consecutive failures are counted.
- **OPEN**: reached after a real consecutive-failure threshold. Calls
  fail fast — the wrapped function is never invoked. This is proven,
  not asserted by inspection: `resilient-client.test.js`'s circuit
  breaker integration test watches the real unreliable-server's own
  call count and asserts it stops increasing once the circuit opens.
- **HALF_OPEN**: after a reset timeout, one trial call is allowed. A
  successful trial closes the circuit; a failed trial re-opens it
  immediately. `tests/circuit-breaker.test.js` proves both branches
  using an injectable fake clock, so the state transitions are exact
  and instant rather than raced against a real timer.

## Resilient client: retry + timeout + circuit breaker, composed

`lib/resilient-client.js` combines three independent concerns:

- **Bounded retry with backoff** — a fixed, declared number of retry
  delays; retries stop, they do not continue indefinitely.
- **A hard per-attempt timeout** (`AbortController`) — covers both a
  `slow` response (arrives late but the client has already moved on)
  and a `hang` response (never arrives at all; only the client's own
  timeout budget ends the wait).
- **Circuit breaker integration** — a short-circuited call is
  recognized as fundamentally different from a retriable failure and
  is never retried, and propagates its own distinct error type rather
  than being disguised as a generic "retries exhausted" failure (see
  `COMMON-MISTAKES.md` for a real bug this exact distinction caught).

## Composed chaos scenarios

`tests/chaos-scenario.test.js` goes beyond isolated unit behavior to
prove two realistic timelines:

1. A **sustained outage** (several consecutive failures) opens the
   circuit, a failed recovery trial keeps it open, and a genuine
   recovery (the dependency actually starts responding again) closes
   it — proven end-to-end against the real fixture server, not
   asserted piecewise.
2. An **intermittent, non-consecutive** fault pattern (every other call
   fails) never reaches the consecutive-failure threshold and the
   circuit correctly stays CLOSED throughout — a real, meaningful
   distinction from scenario 1 that a naive "count total failures"
   breaker implementation would get wrong.

## What real chaos engineering would add on top of this

Real infrastructure-level fault injection (killing processes,
degrading real network links, exhausting real resources), statistical
game-day exercises across a distributed system, and blast-radius
containment are not implemented or claimed here — this lab covers the
resilience-code testing layer beneath those practices.
