'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { checkHealth, checkAuthLogin, checkProductsList } = require('../lib/smoke-checks');

// TR: Her test, backend'in gercek yanit seklini taklit eden MINIMAL bir
// gercek HTTP sunucusu baslatir — fetch veya http modulu mocklanmaz,
// test edilen fonksiyonlar GERCEK bir ag baglantisi uzerinden calisir.
function startFixtureServer(handler) {
  const server = http.createServer(handler);
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ baseUrl: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}

test('checkHealth passes against a real server returning {status: "ok"}', async () => {
  const { baseUrl, close } = await startFixtureServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  });
  try {
    const result = await checkHealth(baseUrl);
    assert.equal(result.ok, true);
  } finally {
    close();
  }
});

test('checkHealth fails against a real server returning a non-200 status', async () => {
  const { baseUrl, close } = await startFixtureServer((req, res) => {
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'down' }));
  });
  try {
    const result = await checkHealth(baseUrl);
    assert.equal(result.ok, false);
  } finally {
    close();
  }
});

test('checkAuthLogin passes against a real server returning a real-shaped token response', async () => {
  const { baseUrl, close } = await startFixtureServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ token: 'real-looking-session-token', user: { id: 1 } }));
  });
  try {
    const result = await checkAuthLogin(baseUrl, 'test@example.com', 'ValidPass123!');
    assert.equal(result.ok, true);
  } finally {
    close();
  }
});

test('checkAuthLogin fails against a real server returning a 401 with no token', async () => {
  const { baseUrl, close } = await startFixtureServer((req, res) => {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid credentials' }));
  });
  try {
    const result = await checkAuthLogin(baseUrl, 'wrong@example.com', 'wrong');
    assert.equal(result.ok, false);
  } finally {
    close();
  }
});

test('checkProductsList passes against a real server returning a real-shaped products array', async () => {
  const { baseUrl, close } = await startFixtureServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ products: [{ id: 1, name: 'Widget' }] }));
  });
  try {
    const result = await checkProductsList(baseUrl);
    assert.equal(result.ok, true);
  } finally {
    close();
  }
});

test('checkProductsList fails against a real server returning a malformed (non-array) body', async () => {
  const { baseUrl, close } = await startFixtureServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ products: 'not-an-array' }));
  });
  try {
    const result = await checkProductsList(baseUrl);
    assert.equal(result.ok, false);
  } finally {
    close();
  }
});
