'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createTracer, createInMemoryCollector } = require('../lib/tracer');

function fakeClock(startAt = 1000) {
  let current = startAt;
  return { now: () => current, advance: (ms) => { current += ms; } };
}

test('startSpan() with no parent context starts a genuinely new trace', () => {
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector });
  const span = tracer.startSpan('root-op');
  assert.equal(span.parentSpanId, null);
  assert.match(span.traceId, /^[0-9a-f]{32}$/);
});

test('a child span reuses the parent real traceId and records the parent spanId', () => {
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector });
  const root = tracer.startSpan('root-op');
  const child = tracer.startSpan('child-op', { traceId: root.traceId, parentSpanId: root.spanId });

  assert.equal(child.traceId, root.traceId);
  assert.equal(child.parentSpanId, root.spanId);
  assert.notEqual(child.spanId, root.spanId);
});

test('end() records the real span to the collector exactly once and sets a real endTime >= startTime', () => {
  const clock = fakeClock();
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector, now: clock.now });

  const span = tracer.startSpan('timed-op');
  clock.advance(25);
  span.end();

  const recorded = collector.getSpans();
  assert.equal(recorded.length, 1);
  assert.equal(recorded[0].startTime, 1000);
  assert.equal(recorded[0].endTime, 1025);
  assert.ok(recorded[0].endTime >= recorded[0].startTime);
});

test('end() throws on a real double-end and does not record the span a second time', () => {
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector });
  const span = tracer.startSpan('op');
  span.end();
  assert.throws(() => span.end(), /already ended/);
  assert.equal(collector.getSpans().length, 1);
});

test('getTraceSpans() returns only the real spans belonging to one trace', () => {
  const collector = createInMemoryCollector();
  const tracer = createTracer({ collector });
  const traceA = tracer.startSpan('a-root');
  tracer.startSpan('a-child', { traceId: traceA.traceId, parentSpanId: traceA.spanId }).end();
  traceA.end();

  const traceB = tracer.startSpan('b-root');
  traceB.end();

  assert.equal(collector.getTraceSpans(traceA.traceId).length, 2);
  assert.equal(collector.getTraceSpans(traceB.traceId).length, 1);
});
