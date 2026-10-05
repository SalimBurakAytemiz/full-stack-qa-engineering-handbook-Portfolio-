'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createTracer, createInMemoryCollector } = require('../lib/tracer');
const { createUpstreamService, runDownstreamRequest } = require('../lib/traced-service');

async function withUpstream(tracer, fn) {
  const { server } = createUpstreamService({ tracer });
  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('a real downstream request to a real upstream HTTP service propagates the real trace id across the network hop', async () => {
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector });

  await withUpstream(tracer, async (baseUrl) => {
    const { rootSpan, upstreamResponse } = await runDownstreamRequest({ tracer, upstreamBaseUrl: baseUrl });

    assert.equal(upstreamResponse.statusCode, 200);
    assert.equal(
      upstreamResponse.body.traceId,
      rootSpan.traceId,
      'the real upstream span must share the real downstream root span\'s traceId'
    );
  });
});

test('the real recorded span tree has exactly one root and one real child whose parentSpanId is the root\'s spanId', async () => {
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector });

  await withUpstream(tracer, async (baseUrl) => {
    const { rootSpan } = await runDownstreamRequest({ tracer, upstreamBaseUrl: baseUrl });

    const spans = collector.getTraceSpans(rootSpan.traceId);
    assert.equal(spans.length, 2, 'exactly one downstream root span and one upstream child span must be recorded');

    const root = spans.find((s) => s.name === 'downstream.handle-request');
    const child = spans.find((s) => s.name === 'upstream.work');
    assert.ok(root && child, 'both the real root and real child spans must be present');
    assert.equal(root.parentSpanId, null);
    assert.equal(child.parentSpanId, root.spanId, 'the real child span must record the real root span as its parent');
  });
});

test('two real independent downstream requests produce two real distinct, non-overlapping traces', async () => {
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector });

  await withUpstream(tracer, async (baseUrl) => {
    const first = await runDownstreamRequest({ tracer, upstreamBaseUrl: baseUrl });
    const second = await runDownstreamRequest({ tracer, upstreamBaseUrl: baseUrl });

    assert.notEqual(first.rootSpan.traceId, second.rootSpan.traceId);
    assert.equal(collector.getTraceSpans(first.rootSpan.traceId).length, 2);
    assert.equal(collector.getTraceSpans(second.rootSpan.traceId).length, 2);
  });
});

test('a request to an unknown path on the real upstream server gets a real 404, not a silently propagated trace', async () => {
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector });
  const http = require('node:http');

  await withUpstream(tracer, async (baseUrl) => {
    const response = await new Promise((resolve, reject) => {
      http.get(`${baseUrl}/does-not-exist`, (res) => {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
      }).on('error', reject);
    });
    assert.equal(response.statusCode, 404);
    assert.equal(collector.getSpans().length, 0, 'no span should be recorded for a request the upstream service rejected');
  });
});
