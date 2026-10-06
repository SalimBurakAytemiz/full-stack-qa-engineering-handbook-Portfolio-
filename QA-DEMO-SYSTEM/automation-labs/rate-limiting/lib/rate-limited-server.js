'use strict';

// A real, hand-rolled HTTP server over Node's own http module —
// self-contained, never touches the real backend (backend/src). Every
// GET /ping request draws one real token from a real shared
// lib/token-bucket.js instance; a request that finds the bucket empty
// gets a real 429, never a silently-slow or silently-dropped response.
const http = require('node:http');
const { createTokenBucket } = require('./token-bucket');

function createRateLimitedServer({ capacity, refillRatePerMs, now }) {
  const bucket = createTokenBucket({ capacity, refillRatePerMs, now });
  let acceptedCount = 0;
  let rejectedCount = 0;

  const server = http.createServer((req, res) => {
    if (req.method !== 'GET' || req.url !== '/ping') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not found' }));
      return;
    }

    if (bucket.tryConsume(1)) {
      acceptedCount += 1;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      rejectedCount += 1;
      res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '1' });
      res.end(JSON.stringify({ error: 'rate limit exceeded' }));
    }
  });

  return {
    server,
    bucket,
    getAcceptedCount: () => acceptedCount,
    getRejectedCount: () => rejectedCount,
  };
}

module.exports = { createRateLimitedServer };
