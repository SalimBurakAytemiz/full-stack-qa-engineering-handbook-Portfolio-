#!/usr/bin/env node
'use strict';

// Real modern-protocols lab: starts a real HTTP server speaking the real
// Server-Sent Events wire protocol, connects a real client to it, and
// proves three things a QA engineer actually needs to verify about an
// SSE integration: correct event framing/ordering, genuine progressive
// delivery over real wall-clock time, and correct Last-Event-ID
// reconnection semantics (no replay of already-seen events).
// TR: Gercek bir modern-protokoller laboratuvari: gercek Server-Sent
// Events tel protokolunu konusan gercek bir HTTP sunucusu baslatir,
// GERCEK bir istemciyi ona baglar.

const { createSseServer } = require('./lib/sse-server');
const { connectAndCollect } = require('./lib/sse-client');

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('MODERN_PROTOCOLS_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

async function main() {
  const checks = [];

  // 1. Correct framing, ordering, and content.
  {
    const srv = createSseServer({
      events: [
        { id: 1, event: 'order.created', data: '{"orderId":1}' },
        { id: 2, event: 'order.paid', data: '{"orderId":1}' },
        { id: 3, event: 'order.shipped', data: '{"orderId":1}' },
      ],
      intervalMs: 15,
    });
    const baseUrl = await srv.start();
    try {
      const events = await connectAndCollect(baseUrl);
      const ok = events.length === 3 && events.map((e) => e.event).join(',') === 'order.created,order.paid,order.shipped';
      checks.push({ name: 'a real SSE stream delivers every event, in order, with correct id/event/data framing', pass: ok, detail: JSON.stringify(events.map((e) => ({ id: e.id, event: e.event }))) });
    } finally {
      await srv.stop();
    }
  }

  // 2. Genuine progressive delivery over real wall-clock time.
  {
    const srv = createSseServer({ events: [{ id: 1, data: 'a' }, { id: 2, data: 'b' }, { id: 3, data: 'c' }], intervalMs: 40 });
    const baseUrl = await srv.start();
    try {
      const events = await connectAndCollect(baseUrl);
      const gap1 = events[1].receivedAtMs - events[0].receivedAtMs;
      const gap2 = events[2].receivedAtMs - events[1].receivedAtMs;
      const ok = gap1 >= 20 && gap2 >= 20;
      checks.push({ name: 'events genuinely arrive progressively over real wall-clock time, not all at once', pass: ok, detail: `gap1=${gap1}ms, gap2=${gap2}ms` });
    } finally {
      await srv.stop();
    }
  }

  // 3. Last-Event-ID reconnection semantics.
  {
    const srv = createSseServer({ events: [{ id: 1, data: 'a' }, { id: 2, data: 'b' }, { id: 3, data: 'c' }, { id: 4, data: 'd' }], intervalMs: 5 });
    const baseUrl = await srv.start();
    try {
      const events = await connectAndCollect(baseUrl, { lastEventId: 2 });
      const ok = events.map((e) => e.id).join(',') === '3,4';
      checks.push({ name: 'a real reconnection with Last-Event-ID only receives events after that id, never a replay', pass: ok, detail: JSON.stringify(events.map((e) => e.id)) });
    } finally {
      await srv.stop();
    }
  }

  console.log('--- Modern Protocols Lab: real scenario results ---');
  for (const c of checks) {
    console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.name} (${c.detail})`);
  }

  const allPassed = checks.every((c) => c.pass);
  if (!allPassed) {
    console.log('\nMODERN_PROTOCOLS_LAB_STATUS: FAILED');
    reportOutcome(1);
    return;
  }
  console.log('\nMODERN_PROTOCOLS_LAB_STATUS: EXECUTED');
  reportOutcome(0);
}

main();
