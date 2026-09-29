'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createStubServer } = require('../lib/stub-server');

test('stub server: a registered matcher returns its canned response', async () => {
  const srv = createStubServer();
  srv.stub({ method: 'GET', path: '/products' }, { status: 200, body: { products: [{ id: 1 }] } });
  const baseUrl = await srv.start();
  try {
    const res = await fetch(`${baseUrl}/products`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { products: [{ id: 1 }] });
  } finally {
    await srv.stop();
  }
});

test('stub server: an unmatched request is a real, loud failure (501 + diagnostic body), never a silent 200', async () => {
  const srv = createStubServer();
  srv.stub({ method: 'GET', path: '/products' }, { status: 200, body: {} });
  const baseUrl = await srv.start();
  try {
    const res = await fetch(`${baseUrl}/completely-unregistered-path`);
    assert.equal(res.status, 501);
    const body = await res.json();
    assert.equal(body.error, 'NO_STUB_REGISTERED');
    assert.equal(srv.getUnmatchedRequests().length, 1);
    assert.equal(srv.getUnmatchedRequests()[0].url, '/completely-unregistered-path');
  } finally {
    await srv.stop();
  }
});

test('stub server: bodyContains matching only matches requests whose body actually contains the substring', async () => {
  const srv = createStubServer();
  srv.stub({ method: 'POST', path: '/login', bodyContains: '"email":"vip@example.com"' }, { status: 200, body: { role: 'vip' } });
  const baseUrl = await srv.start();
  try {
    const vipRes = await fetch(`${baseUrl}/login`, { method: 'POST', body: JSON.stringify({ email: 'vip@example.com' }) });
    assert.equal(vipRes.status, 200);
    assert.deepEqual(await vipRes.json(), { role: 'vip' });

    const otherRes = await fetch(`${baseUrl}/login`, { method: 'POST', body: JSON.stringify({ email: 'someone-else@example.com' }) });
    assert.equal(otherRes.status, 501, 'a body that does not match the registered substring must not match this stub');
  } finally {
    await srv.stop();
  }
});

test('stub server: a sequenced (stateful) stub advances through each response in order, then repeats the last one', async () => {
  const srv = createStubServer();
  srv.stub({ method: 'GET', path: '/payment-status' }, [
    { status: 200, body: { status: 'pending' } },
    { status: 200, body: { status: 'processing' } },
    { status: 200, body: { status: 'approved' } },
  ]);
  const baseUrl = await srv.start();
  try {
    const r1 = await (await fetch(`${baseUrl}/payment-status`)).json();
    const r2 = await (await fetch(`${baseUrl}/payment-status`)).json();
    const r3 = await (await fetch(`${baseUrl}/payment-status`)).json();
    const r4 = await (await fetch(`${baseUrl}/payment-status`)).json();
    assert.deepEqual([r1.status, r2.status, r3.status, r4.status], ['pending', 'processing', 'approved', 'approved']);
  } finally {
    await srv.stop();
  }
});

test('stub server: every request (matched or not) is recorded in the call log — real verification, not just canned responses', async () => {
  const srv = createStubServer();
  srv.stub({ method: 'GET', path: '/ok' }, { status: 200, body: {} });
  const baseUrl = await srv.start();
  try {
    await fetch(`${baseUrl}/ok`);
    await fetch(`${baseUrl}/not-registered`);
    const log = srv.getCallLog();
    assert.equal(log.length, 2);
    assert.deepEqual(log.map((c) => c.url), ['/ok', '/not-registered']);
  } finally {
    await srv.stop();
  }
});

test('stub server: reset() clears stubs, call log, and unmatched-request history', async () => {
  const srv = createStubServer();
  srv.stub({ method: 'GET', path: '/ok' }, { status: 200, body: {} });
  const baseUrl = await srv.start();
  try {
    await fetch(`${baseUrl}/ok`);
    srv.reset();
    assert.equal(srv.getCallLog().length, 0);
    const res = await fetch(`${baseUrl}/ok`);
    assert.equal(res.status, 501, 'the stub itself must also be cleared by reset(), not just the logs');
  } finally {
    await srv.stop();
  }
});
