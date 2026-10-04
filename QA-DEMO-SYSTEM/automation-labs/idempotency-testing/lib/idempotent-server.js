'use strict';

// A real, hand-rolled HTTP server over Node's own http module —
// self-contained, never touches the real backend (backend/src). It
// requires a real Idempotency-Key header on POST /orders (Stripe's
// own real convention) and uses lib/idempotency-store.js to guarantee
// the real "create an order" side effect runs exactly once per key.
// TR: Node'un kendi http modülü üzerinde elle yazılmış, GERÇEK bir
// HTTP sunucusudur — kendi kendine yeterlidir, gerçek backend'e
// (backend/src) hiç dokunmaz.

const http = require('node:http');
const { createIdempotencyStore } = require('./idempotency-store');

function createIdempotentServer() {
  const store = createIdempotencyStore();
  let sideEffectCount = 0;
  let nextOrderId = 1000;

  function realCreateOrderSideEffect() {
    // The real side effect this entire lab exists to protect: every
    // genuine invocation increments a real counter and allocates a
    // real, never-reused order id — exactly the kind of effect that
    // must never happen twice for one logical request.
    sideEffectCount += 1;
    const orderId = nextOrderId;
    nextOrderId += 1;
    return { orderId };
  }

  const server = http.createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/orders') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not found' }));
      return;
    }

    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Idempotency-Key header is required' }));
      return;
    }

    store
      .handle(idempotencyKey, realCreateOrderSideEffect)
      .then((result) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ orderId: result.orderId, idempotencyKey }));
      })
      .catch((err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
  });

  function getSideEffectCount() {
    return sideEffectCount;
  }

  return { server, getSideEffectCount, store };
}

module.exports = { createIdempotentServer };
