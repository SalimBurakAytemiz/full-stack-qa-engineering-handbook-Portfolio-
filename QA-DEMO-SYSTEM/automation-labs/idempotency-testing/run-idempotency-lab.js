'use strict';

// Real aggregate run: starts the real hand-rolled server on a real
// loopback port, drives it with real HTTP requests, and proves
// replay-safety, key independence, and real-concurrency safety —
// each checked against the server's own real side-effect counter,
// not inferred from HTTP status codes alone.
// TR: Gerçek bir loopback port üzerinde GERÇEK sunucuyu başlatan ve
// onu gerçek HTTP istekleriyle süren bir agregat çalıştırmadır.

const { createIdempotentServer } = require('./lib/idempotent-server');
const { createOrder } = require('./lib/idempotent-client');

async function main() {
  const results = [];
  let failures = 0;

  const { server, getSideEffectCount } = createIdempotentServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const missingKey = await createOrder(baseUrl, undefined);
    const missingKeyOk = missingKey.statusCode === 400;
    results.push({ ok: missingKeyOk, label: `missing Idempotency-Key -> real ${missingKey.statusCode} (expected 400)` });
    if (!missingKeyOk) failures += 1;

    const first = await createOrder(baseUrl, 'agg-key-1');
    const replay = await createOrder(baseUrl, 'agg-key-1');
    const replayOk = replay.body.orderId === first.body.orderId && getSideEffectCount() === 1;
    results.push({ ok: replayOk, label: `replay of the same key returns order ${replay.body.orderId} (same as first: ${first.body.orderId}); real side-effect count after 2 requests with 1 key: ${getSideEffectCount()}` });
    if (!replayOk) failures += 1;

    const different = await createOrder(baseUrl, 'agg-key-2');
    const differentOk = different.body.orderId !== first.body.orderId && getSideEffectCount() === 2;
    results.push({ ok: differentOk, label: `a different key creates a separate real order ${different.body.orderId}; real side-effect count now ${getSideEffectCount()}` });
    if (!differentOk) failures += 1;

    const beforeConcurrent = getSideEffectCount();
    const concurrentResponses = await Promise.all(
      Array.from({ length: 10 }, () => createOrder(baseUrl, 'agg-concurrent-key')),
    );
    const concurrentOrderIds = new Set(concurrentResponses.map((r) => r.body.orderId));
    const concurrentOk = concurrentOrderIds.size === 1 && getSideEffectCount() === beforeConcurrent + 1;
    results.push({ ok: concurrentOk, label: `10 real concurrent requests with one new key produced ${concurrentOrderIds.size} distinct real order id(s); real side-effect count increased by ${getSideEffectCount() - beforeConcurrent} (expected 1)` });
    if (!concurrentOk) failures += 1;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('--- Idempotency Testing Lab: real scenario results ---');
  for (const r of results) {
    console.log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.label}`);
  }

  const status = failures === 0 ? 'EXECUTED' : 'FAILED';
  console.log(`\nIDEMPOTENCY_LAB_STATUS: ${status}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error('IDEMPOTENCY_LAB_STATUS: FAILED');
  console.error(err);
  process.exitCode = 1;
});
