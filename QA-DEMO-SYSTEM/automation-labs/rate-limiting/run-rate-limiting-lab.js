'use strict';

// Real aggregate run: starts the real hand-rolled rate-limited server
// on a real loopback port, drives it with real HTTP requests, and
// proves accept/reject/refill behavior against the server's own real
// accepted/rejected counters — using a real injectable fake clock so
// the refill proof is deterministic and fast, never a real sleep.
// TR: Gerçek bir loopback port üzerinde GERÇEK rate-limit sunucusunu
// başlatan ve onu gerçek HTTP istekleriyle süren bir agregat
// çalıştırmadır.

const { createRateLimitedServer } = require('./lib/rate-limited-server');
const { ping } = require('./lib/ping-client');

function fakeClock(startAt = 0) {
  let current = startAt;
  return { now: () => current, advance: (ms) => { current += ms; } };
}

async function main() {
  const results = [];
  let failures = 0;
  const clock = fakeClock();

  const { server, getAcceptedCount, getRejectedCount } = createRateLimitedServer({
    capacity: 2,
    refillRatePerMs: 0.01, // 1 token per 100ms
    now: clock.now,
  });
  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const r1 = await ping(baseUrl);
    const r2 = await ping(baseUrl);
    const withinCapacityOk = r1.statusCode === 200 && r2.statusCode === 200;
    results.push({ ok: withinCapacityOk, label: `2 real requests within capacity 2 -> real statuses ${r1.statusCode}, ${r2.statusCode}` });
    if (!withinCapacityOk) failures += 1;

    const over = await ping(baseUrl);
    const overOk = over.statusCode === 429 && getRejectedCount() === 1;
    results.push({ ok: overOk, label: `a 3rd real request over capacity -> real status ${over.statusCode}; real rejected count: ${getRejectedCount()}` });
    if (!overOk) failures += 1;

    clock.advance(100);
    const afterRefill = await ping(baseUrl);
    const refillOk = afterRefill.statusCode === 200 && getAcceptedCount() === 3;
    results.push({ ok: refillOk, label: `after advancing the real fake clock by 100ms, the next real request -> status ${afterRefill.statusCode}; real accepted count: ${getAcceptedCount()}` });
    if (!refillOk) failures += 1;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('--- Rate Limiting Lab: real scenario results ---');
  for (const r of results) {
    console.log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.label}`);
  }

  const status = failures === 0 ? 'EXECUTED' : 'FAILED';
  console.log(`\nRATE_LIMITING_LAB_STATUS: ${status}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error('RATE_LIMITING_LAB_STATUS: FAILED');
  console.error(err);
  process.exitCode = 1;
});
