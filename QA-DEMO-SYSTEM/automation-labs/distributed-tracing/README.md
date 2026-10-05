# Distributed Tracing Lab

A real, hand-rolled tracer (`lib/tracer.js`) and trace-context
propagation layer (`lib/trace-context.js`, loosely modeled on the
W3C `traceparent` header shape) proven across a real network hop
between two real `node:http` services (`lib/traced-service.js`) — not
a same-process function call standing in for a service boundary.

## Why a real second server, not a function call

The entire point of distributed tracing is correlating work that
happens in *different processes*, usually on different machines. A
test that calls two functions in the same process and checks they
share a trace id would not actually prove the context survives
serialization onto an HTTP header and deserialization back out of
one — it's exactly the step most likely to be implemented wrong (a
dropped header, a case-sensitivity bug, a missing propagation call on
one of several outbound calls a real service makes). This lab starts
a second real `node:http` server on a real loopback port and makes a
real HTTP request to it, so the propagation proof is genuine.

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
