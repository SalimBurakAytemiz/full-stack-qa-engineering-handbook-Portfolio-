# Chaos / Reliability Lab — Execution Evidence

**Date:** 2026-09-29
**Command:** `node --test chaos-reliability/tests/*.test.js` (raw suite)
and `node chaos-reliability/run-chaos-lab.js` (aggregate runner) — both
from `QA-DEMO-SYSTEM/automation-labs/`.
**Environment:** sandbox container. No network access, no external
service, no environment variables required — every server involved is
started by the test suite itself on an OS-assigned local port.

## Result

```
1..17
# tests 17
# suites 0
# pass 17
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

`run-chaos-lab.js`: `CHAOS_LAB_STATUS: EXECUTED`, exit code `0`.

## Breakdown by file (4 files, 17 tests)

| File | Tests |
|---|---|
| `circuit-breaker.test.js` | 5 |
| `unreliable-server.test.js` | 5 |
| `resilient-client.test.js` | 5 |
| `chaos-scenario.test.js` | 2 |

## A real bug found and fixed during this run

`resilient-client.js`'s `call()` originally wrapped **every** final
failure in `RetriesExhaustedError`, including a `CircuitOpenError` from
a short-circuited call. `resilient-client.test.js`'s circuit-breaker
integration test asserted the specific error type
(`assert.rejects(client.call(), CircuitOpenError)`) and caught this: the
real thrown error was `RetriesExhaustedError` wrapping the
`CircuitOpenError`'s message, not the `CircuitOpenError` itself — found
by running the suite (1 real failure out of 17), not by inspection.
Root cause: a short-circuited call is not a "retries exhausted"
outcome (no attempt was actually retried against the dependency), so
wrapping it was itself the bug. **Fix:** `call()` now re-throws a
`CircuitOpenError` as-is instead of wrapping it.

## Scope and honesty notes

- The "unreliable dependency" is a local fixture server this lab
  starts and stops itself (`lib/unreliable-server.js`), with a fixed,
  deterministic fault schedule — never random, never a real external
  service. This is a controlled harness for exercising resilience
  code, not a claim of real production chaos-engineering practice
  (no Chaos Monkey/Gremlin/Litmus/Toxiproxy involved or claimed).
- `circuit-breaker.test.js` uses an injectable fake clock so
  OPEN→HALF_OPEN transitions are proven without any real sleep;
  `chaos-scenario.test.js` and part of `resilient-client.test.js` do
  use short, bounded real timers (tens of milliseconds) consistent
  with this repository's other real-timer-based tests.
- Not yet CI-verified as of this file's writing — CI wiring is a
  separate, explicitly tracked step (see the Part 2 Milestone 2.2
  commit history for when this lab's registry maturity was elevated
  to CI_VERIFIED, mirroring Milestone 2.1's own two-step pattern).
