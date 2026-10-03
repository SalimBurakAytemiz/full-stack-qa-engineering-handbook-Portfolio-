'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createSseServer } = require('../lib/sse-server');
const { connectAndCollect } = require('../lib/sse-client');

test('a real SSE stream delivers every event, in order, with the correct id/event/data framing', async () => {
  const srv = createSseServer({
    events: [
      { id: 1, event: 'order.created', data: '{"orderId":1}' },
      { id: 2, event: 'order.paid', data: '{"orderId":1}' },
      { id: 3, event: 'order.shipped', data: '{"orderId":1}' },
    ],
    intervalMs: 10,
  });
  const baseUrl = await srv.start();
  try {
    const events = await connectAndCollect(baseUrl);
    assert.equal(events.length, 3);
    assert.deepEqual(events.map((e) => e.id), [1, 2, 3]);
    assert.deepEqual(events.map((e) => e.event), ['order.created', 'order.paid', 'order.shipped']);
    assert.equal(events[0].data, '{"orderId":1}');
  } finally {
    await srv.stop();
  }
});

test('events genuinely arrive progressively over real wall-clock time, not all at once', async () => {
  const srv = createSseServer({
    events: [
      { id: 1, data: 'first' },
      { id: 2, data: 'second' },
      { id: 3, data: 'third' },
    ],
    intervalMs: 40,
  });
  const baseUrl = await srv.start();
  try {
    const events = await connectAndCollect(baseUrl);
    const gap1 = events[1].receivedAtMs - events[0].receivedAtMs;
    const gap2 = events[2].receivedAtMs - events[1].receivedAtMs;
    // TR: Gercek bir zamanlayici araligi kullaniyoruz (40ms) — bufferlanmis
    // bir yanitta bu farklar ~0ms olurdu. Sistem zamanlama gurultusu icin
    // gevsek bir alt sinir (20ms) kullaniyoruz.
    assert.ok(gap1 >= 20, `expected a real delay between event 1 and 2, got ${gap1}ms`);
    assert.ok(gap2 >= 20, `expected a real delay between event 2 and 3, got ${gap2}ms`);
  } finally {
    await srv.stop();
  }
});

test('a real reconnection with Last-Event-ID only receives events AFTER that id, never a replay of already-seen events', async () => {
  const srv = createSseServer({
    events: [
      { id: 1, data: 'first' },
      { id: 2, data: 'second' },
      { id: 3, data: 'third' },
      { id: 4, data: 'fourth' },
    ],
    intervalMs: 5,
  });
  const baseUrl = await srv.start();
  try {
    const events = await connectAndCollect(baseUrl, { lastEventId: 2 });
    assert.deepEqual(events.map((e) => e.id), [3, 4]);
  } finally {
    await srv.stop();
  }
});
