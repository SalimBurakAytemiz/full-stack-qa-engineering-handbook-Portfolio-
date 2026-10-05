'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { newTraceId, newSpanId, formatTraceParent, parseTraceParent } = require('../lib/trace-context');

test('newTraceId() and newSpanId() produce distinct real hex ids of the expected length', () => {
  const traceId = newTraceId();
  const spanId = newSpanId();
  assert.match(traceId, /^[0-9a-f]{32}$/);
  assert.match(spanId, /^[0-9a-f]{16}$/);
  assert.notEqual(newTraceId(), traceId, 'two real calls must not collide');
});

test('formatTraceParent() and parseTraceParent() round-trip a real traceId/spanId pair', () => {
  const traceId = newTraceId();
  const spanId = newSpanId();
  const header = formatTraceParent({ traceId, spanId });
  const parsed = parseTraceParent(header);
  assert.deepEqual(parsed, { traceId, parentSpanId: spanId, flags: '01' });
});

test('parseTraceParent() returns null for a malformed or missing header, never throws', () => {
  assert.equal(parseTraceParent(undefined), null);
  assert.equal(parseTraceParent(''), null);
  assert.equal(parseTraceParent('not-a-real-header'), null);
  assert.equal(parseTraceParent('01-short-short-01'), null);
});
