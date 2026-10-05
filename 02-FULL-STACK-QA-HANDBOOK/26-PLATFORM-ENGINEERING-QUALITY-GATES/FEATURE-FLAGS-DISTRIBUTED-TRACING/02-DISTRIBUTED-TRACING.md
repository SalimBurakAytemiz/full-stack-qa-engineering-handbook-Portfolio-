# Distributed Tracing

## Why propagation has to be proven across a real network hop

Distributed tracing exists to answer one question across many
services: "which of these spans, running in different processes,
belong to the same logical request?" The answer depends entirely on
a piece of context — the trace id, and the calling span's id —
surviving serialization onto an outbound request and deserialization
back out of it on the receiving side. A test that calls two functions
in the same process and checks they share a trace id proves nothing
about that serialization step, because there wasn't one. This lab's
real proof (`automation-labs/distributed-tracing/lib/traced-service.js`)
starts a second, genuinely separate `node:http` server on its own
real loopback port, and the "downstream" side sends it a real HTTP
request carrying a real `traceparent`-shaped header:

```js
const traceParentHeader = formatTraceParent({ traceId: rootSpan.traceId, spanId: rootSpan.spanId });
```

The upstream server parses that header back out of the real incoming
request and starts its own child span with the recovered `traceId`
and `parentSpanId` — proving the context genuinely crossed the wire.

## Why the span tree is checked by shape, not assumed

`lib/tracer.js`'s `createInMemoryCollector()` is written into by both
the downstream and the upstream side independently — neither one
knows what the other recorded. The real proof reads that shared
collector back and checks the actual resulting shape: exactly one
root span (no parent), exactly one child span, and the child's
`parentSpanId` genuinely equal to the root's real `spanId`. This is
the same discipline as the multi-tenancy lab's negative-path proof
earlier in this part: the positive claim ("propagation works") means
more because it's checked against real recorded data from two
independent writers, not inferred from reading the code once.

## What "loosely modeled on W3C Trace Context" means here

`lib/trace-context.js`'s `formatTraceParent()`/`parseTraceParent()`
produce and parse a `version-traceId-spanId-flags` string shaped like
the real W3C `traceparent` header, because that's a reasonable,
recognizable format — but this lab does not implement `tracestate`,
multi-vendor trace-state merging, or the spec's full sampling-flag
semantics. It borrows the shape, not the full specification.

## What this does not prove

The span collector is in-memory and local to the single test process
driving both the "downstream" and "upstream" services — there is no
real export to an actual tracing backend (Jaeger, Zipkin, an OTLP
collector), no cross-process or cross-host span aggregation, and no
sampling strategy beyond "trace everything." This lab proves the
propagation mechanism and the resulting tree shape, not a production
observability pipeline.

## Running it

```bash
npm run distributed-tracing:test:unit --workspace automation-labs   # unit tests
npm run distributed-tracing:test --workspace automation-labs        # real aggregate run
```

See `EXECUTION.md` in the lab's own directory for the actual observed
output of both runs.
