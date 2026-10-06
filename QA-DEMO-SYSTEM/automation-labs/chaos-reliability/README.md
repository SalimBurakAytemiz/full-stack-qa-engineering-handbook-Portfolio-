# Chaos / Reliability Engineering Lab

Part of `automation-labs`, alongside the AI Systems Testing lab. This
lab proves QA **techniques** for testing resilience under real,
deliberately-injected failure — bounded retry, hard timeouts, and a
real circuit-breaker state machine — against a deterministic, locally
controlled "unreliable dependency" fixture.

## Scope boundary — read this first

`lib/unreliable-server.js` is **not** a real chaos-engineering tool. It
is a small local HTTP server, started and stopped by this lab itself,
whose failure behavior on each request is driven by a fixed, ordered
fault schedule (`['ok', 'error_500', 'slow', ...]`) — never random.
There is no Chaos Monkey, Gremlin, Litmus, or Toxiproxy here, and no
real network-level fault injection (packet loss, DNS failure, real
latency injection at the OS/network layer). What this lab does prove,
genuinely: a real circuit-breaker state machine, a real bounded-retry
HTTP client with a real per-attempt timeout, and real end-to-end
recovery behavior when a real (if fixture-controlled) dependency comes
back healthy.

## Running

From `QA-DEMO-SYSTEM/automation-labs/`:

```bash
npm run chaos:test          # aggregate runner (run-chaos-lab.js) — CI entry point
npm run chaos:test:unit     # raw node --test output, same suite
```

No network access, no external service, and no environment variables
are required — every server this lab talks to is one it started itself
on an OS-assigned local port.

### Expected output (healthy)

```
1..17
# tests 17
# pass 17
# fail 0
CHAOS_LAB_STATUS: EXECUTED
```
Exit code `0`. A real failure produces `CHAOS_LAB_STATUS:
EXECUTION_BLOCKED`, exit code `1`. The runner can never exit `0`
without printing an explicit status line — see the `process.on('exit',
...)` safety net in `run-chaos-lab.js`, the same pattern already used
by `jmeter/scripts/run-jmeter.js`, `selenium/scripts/run-parallel.js`,
and `ai-systems/run-ai-lab.js`.

## What each file proves

| File | QA technique |
|---|---|
| `lib/unreliable-server.js` | The fault-injection fixture itself — a real HTTP server with deterministic, cycling failure behavior (`ok`/`error_500`/`error_503`/`slow`/`hang`) |
| `lib/circuit-breaker.js` | A real CLOSED/OPEN/HALF_OPEN state machine — opens on a real consecutive-failure threshold, short-circuits calls while open (proven by watching the dependency's own call count stop increasing), and verifies recovery with a real trial call before closing |
| `lib/resilient-client.js` | Bounded retry with backoff, a hard per-attempt timeout (`AbortController`), and composition with the circuit breaker |
| `tests/circuit-breaker.test.js` | The state machine in isolation, using an injectable fake clock — no real sleep, fully deterministic |
| `tests/unreliable-server.test.js` | The fixture's own behavior is itself tested — a fault schedule that lies about its own behavior would invalidate every other test in this lab |
| `tests/resilient-client.test.js` | Retry-then-succeed, retry-exhausted-fails-loudly, real timeout under a hung dependency, and the circuit-breaker call-count proof |
| `tests/chaos-scenario.test.js` | Composed, realistic failure→recovery timelines and an intermittent-fault pattern that must NOT trip the breaker |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for
the competencies this lab backs. `professional: {status: NONE}` unless
an existing, independent professional source already proves otherwise
— repository practice here never substitutes for professional
experience. See `shared/registry/catalog/labs.yaml#lab.chaos-reliability.fault-injection`
for this lab's declared `covers_competencies`.
