'use strict';

const http = require('node:http');

function ping(baseUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL('/ping', baseUrl);
    const req = http.request(url, { method: 'GET' }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = { ping };
