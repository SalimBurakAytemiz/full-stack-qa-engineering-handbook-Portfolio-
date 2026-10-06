# Distributed Tracing Lab

A real, hand-rolled tracer (`lib/tracer.js`) and trace-context
propagation layer (`lib/trace-context.js`, loosely modeled on the
W3C `traceparent` header shape) proven over a real network hop: one
real `node:http` server (the "upstream") on a real loopback port,
called by a real HTTP client (the "downstream" — a plain async
function, not a second server) that lives in this same process
(`lib/traced-service.js`) — not a same-process **function call**
standing in for an HTTP boundary.

**Independent review finding F6:** earlier wording on this page (and
in this lab's `EXECUTION.md`, the registry, and the CI job name)
described this as "two real services" / "two real server processes" /
"a separate process boundary proof." That overstated what is actually
built — see "What this does and doesn't prove" below.

## Why a real HTTP request, not a function call

The risk this lab actually tests is that trace context survives
serialization onto an HTTP header and deserialization back out of one
— exactly the step most likely to be implemented wrong (a dropped
header, a case-sensitivity bug, a missing propagation call on one of
several outbound calls a real service makes). Calling two functions
in the same process and checking they share a trace id, with no real
header in between, would not catch that class of bug. This lab
instead starts a real `node:http` server on a real loopback port and
makes a real `http.request` against it — a real request line, real
headers, a real TCP round-trip on loopback — so the header-propagation
proof is genuine, even though both sides run in one process.

## What this does and doesn't prove

- **Does prove**: a `traceparent`-shaped header is correctly formatted,
  sent over a real HTTP request, received, parsed, and used to link a
  child span to its parent — real HTTP serialization and trace-context
  propagation, not asserted from the code but observed from an actual
  network round-trip.
- **Does NOT prove**: a true cross-process or cross-machine boundary.
  Both the "upstream" server and the "downstream" client run inside
  the same Node process and the same CI job — there is no second
  process, no second container, no second machine. A real multi-process
  or multi-service deployment would additionally need to prove context
  survives a process boundary (e.g. two separate `node` processes, or
  two separate containers), which this lab does not attempt.

## What this proves

- A real downstream request's trace id is read back from the real
  upstream server's response body, confirming the `traceparent`
  header genuinely crossed the real network hop intact.
- The real recorded span tree (via an in-memory collector that both
  the downstream and upstream sides write to) has exactly one root
  span and one child span, and the child's `parentSpanId` genuinely
  equals the root's `spanId` — not asserted from the code, but read
  back from what each side actually recorded.
- Two independent real downstream requests produce two distinct,
  non-overlapping real trace ids — no accidental global trace state.
- A request to an endpoint the real upstream server rejects (404)
  records no span at all, proving spans aren't created speculatively
  before a request is known to succeed.

## Scope boundary

- Loosely modeled on the W3C Trace Context `traceparent` format
  (version-traceId-spanId-flags) — this lab does not claim conformance
  to the full W3C Trace Context specification (it has no `tracestate`
  handling, no sampling-flag semantics beyond a fixed value).
- In-memory span collector only — no real exporter to a tracing
  backend (Jaeger, Zipkin, an OTLP collector). This lab proves
  context propagation and span-tree shape, not a production
  observability pipeline.
- Self-contained — never touches the real backend (`backend/src/`).

## Running it

```bash
npm run distributed-tracing:test:unit --workspace automation-labs   # unit tests
npm run distributed-tracing:test --workspace automation-labs        # real aggregate run
```
