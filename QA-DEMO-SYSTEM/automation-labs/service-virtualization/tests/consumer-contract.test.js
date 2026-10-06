'use strict';

// Consumer-side contract verification: a consumer writes down what it
// expects from a provider (the contract) and tests its own client
// code against a VIRTUALIZED double that returns exactly what the
// contract describes. This does not touch the real backend — see
// provider-contract-verification.test.js for the other half.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createStubServer } = require('../lib/stub-server');
const { productsListContract, loginSuccessContract } = require('../fixtures/contracts');

test('consumer contract: a virtualized products response that matches the contract passes verification', async () => {
  const srv = createStubServer();
  srv.stub(
    { method: 'GET', path: '/api/products' },
    { status: 200, body: { products: [{ id: 1, name: 'Stub Widget', price: 19.99, stock_quantity: 5, in_stock: true }] } },
  );
  const baseUrl = await srv.start();
  try {
    const res = await fetch(`${baseUrl}/api/products`);
    const body = await res.json();
    const result = productsListContract.verify(body);
    assert.equal(result.valid, true, `expected the virtualized response to satisfy the contract: ${JSON.stringify(result.errors)}`);
  } finally {
    await srv.stop();
  }
});

test('consumer contract: a virtualized response that VIOLATES the contract is genuinely caught, not silently accepted', async () => {
  const srv = createStubServer();
  // Deliberately wrong shape — price as a string, and an extra
  // undeclared field — constructed specifically to prove the contract
  // verifier catches a real violation, same "engineer the failure on
  // purpose" discipline as this repository's other labs.
  srv.stub(
    { method: 'GET', path: '/api/products' },
    { status: 200, body: { products: [{ id: 1, name: 'Bad Widget', price: '19.99', stock_quantity: 5, in_stock: true, extra_field: 'unexpected' }] } },
  );
  const baseUrl = await srv.start();
  try {
    const res = await fetch(`${baseUrl}/api/products`);
    const body = await res.json();
    const result = productsListContract.verify(body);
    assert.equal(result.valid, false, 'a price sent as a string and an undeclared extra field must both violate the contract');
    assert.ok(result.errors.length > 0);
  } finally {
    await srv.stop();
  }
});

test('consumer contract: login contract verification against a virtualized double', async () => {
  const srv = createStubServer();
  srv.stub(
    { method: 'POST', path: '/api/auth/login' },
    { status: 200, body: { token: 'demo-session-stub-token', user: { id: 1, email: 'stub@example.com' } } },
  );
  const baseUrl = await srv.start();
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, { method: 'POST', body: '{}' });
    const body = await res.json();
    const result = loginSuccessContract.verify(body);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
  } finally {
    await srv.stop();
  }
});
