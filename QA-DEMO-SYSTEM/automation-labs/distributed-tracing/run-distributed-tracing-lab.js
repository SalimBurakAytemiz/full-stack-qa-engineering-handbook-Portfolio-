'use strict';

// Real aggregate run: starts a real upstream HTTP server on a real
// loopback port, drives a real downstream request through it, and
// proves trace-context propagation against the tracer's own real
// in-memory collector — never a diagram of a span tree.
// TR: Gerçek bir loopback port üzerinde gerçek bir upstream HTTP
// sunucusu başlatan ve trace-bağlamı yayılımını kanıtlayan gerçek bir
// agregat çalıştırmadır.

const { createTracer, createInMemoryCollector } = require('./lib/tracer');
const { createUpstreamService, runDownstreamRequest } = require('./lib/traced-service');

async function main() {
  const results = [];
  let failures = 0;
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector });

  const { server } = createUpstreamService({ tracer });
  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const { rootSpan, upstreamResponse } = await runDownstreamRequest({ tracer, upstreamBaseUrl: baseUrl });

    const propagationOk = upstreamResponse.statusCode === 200 && upstreamResponse.body.traceId === rootSpan.traceId;
    results.push({ ok: propagationOk, label: `real downstream request -> upstream status ${upstreamResponse.statusCode}; traceId propagated correctly: ${propagationOk}` });
    if (!propagationOk) failures += 1;

    const spans = collector.getTraceSpans(rootSpan.traceId);
    const root = spans.find((s) => s.name === 'downstream.handle-request');
    const child = spans.find((s) => s.name === 'upstream.work');
    const treeOk = spans.length === 2 && child && child.parentSpanId === root.spanId;
    results.push({ ok: treeOk, label: `real span tree for this trace has ${spans.length} span(s); child.parentSpanId === root.spanId: ${child ? child.parentSpanId === root.spanId : 'N/A'}` });
    if (!treeOk) failures += 1;

    const second = await runDownstreamRequest({ tracer, upstreamBaseUrl: baseUrl });
    const distinctTracesOk = second.rootSpan.traceId !== rootSpan.traceId;
    results.push({ ok: distinctTracesOk, label: `a second real downstream request produced a distinct real traceId: ${distinctTracesOk}` });
    if (!distinctTracesOk) failures += 1;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('--- Distributed Tracing Lab: real scenario results ---');
  for (const r of results) {
    console.log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.label}`);
  }

  const status = failures === 0 ? 'EXECUTED' : 'FAILED';
  console.log(`\nDISTRIBUTED_TRACING_LAB_STATUS: ${status}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error('DISTRIBUTED_TRACING_LAB_STATUS: FAILED');
  console.error(err);
  process.exitCode = 1;
});
