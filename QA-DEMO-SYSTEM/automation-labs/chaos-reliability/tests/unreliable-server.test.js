'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createUnreliableServer } = require('../lib/unreliable-server');

test('unreliable server: a fixed fault schedule is applied in order and then cycles', async () => {
  const srv = createUnreliableServer({ faultSchedule: ['ok', 'error_500', 'ok'] });
  const baseUrl = await srv.start();
  try {
    const r1 = await fetch(baseUrl);
    assert.equal(r1.status, 200);
    const r2 = await fetch(baseUrl);
    assert.equal(r2.status, 500);
    const r3 = await fetch(baseUrl);
    assert.equal(r3.status, 200);
    const r4 = await fetch(baseUrl); // schedule cycles: index 3 % 3 = 0 -> 'ok'
    assert.equal(r4.status, 200);
    assert.equal(srv.getCallCount(), 4);
  } finally {
    await srv.stop();
  }
});

test('unreliable server: error_503 behavior responds with a real 503', async () => {
  const srv = createUnreliableServer({ faultSchedule: ['error_503'] });
  const baseUrl = await srv.start();
  try {
    const res = await fetch(baseUrl);
    assert.equal(res.status, 503);
  } finally {
    await srv.stop();
  }
});

test('unreliable server: slow behavior genuinely delays the response by the configured amount', async () => {
  const srv = createUnreliableServer({ faultSchedule: ['slow'], slowDelayMs: 60 });
  const baseUrl = await srv.start();
  try {
    const startedAt = Date.now();
    const res = await fetch(baseUrl);
    const elapsedMs = Date.now() - startedAt;
    assert.equal(res.status, 200);
    assert.ok(elapsedMs >= 60, `expected a genuine >=60ms delay, got ${elapsedMs}ms`);
  } finally {
    await srv.stop();
  }
});

test('unreliable server: hang behavior never responds — a client-side timeout is what must end the request', async () => {
  const srv = createUnreliableServer({ faultSchedule: ['hang'] });
  const baseUrl = await srv.start();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 80);
    await assert.rejects(fetch(baseUrl, { signal: controller.signal }));
    clearTimeout(timer);
  } finally {
    await srv.stop();
  }
});

test('unreliable server: rejects an unknown fault behavior at construction time, not silently', () => {
  assert.throws(() => createUnreliableServer({ faultSchedule: ['not-a-real-behavior'] }));
});
