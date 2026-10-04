'use strict';

const http = require('node:http');

// A minimal real HTTP client — real TCP requests against the real
// server started in the test, not a mocked fetch.
function createOrder(baseUrl, idempotencyKey) {
  return new Promise((resolve, reject) => {
    const url = new URL('/orders', baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (idempotencyKey !== undefined) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const req = http.request(
      url,
      { method: 'POST', headers },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

module.exports = { createOrder };
