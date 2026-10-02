'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  checkReferentialIntegrity,
  checkUniqueness,
  checkOrderTotalsReconcile,
  checkSchemaDrift,
} = require('../lib/data-quality');
const { EXPECTED_SCHEMA } = require('../lib/expected-schema');

const { getDatabase } = require(path.join('..', '..', '..', 'backend', 'src', 'database', 'connection'));

test('checkReferentialIntegrity reports zero violations for real, consistent extracted data', () => {
  const violations = checkReferentialIntegrity({
    orders: [{ id: 1, user_id: 1 }],
    orderItems: [{ id: 1, order_id: 1, product_id: 1 }],
    products: [{ id: 1 }],
    users: [{ id: 1 }],
  });
  assert.deepEqual(violations, []);
});

test('checkReferentialIntegrity DOES catch an order_item pointing at a non-existent product (negative proof)', () => {
  const violations = checkReferentialIntegrity({
    orders: [{ id: 1, user_id: 1 }],
    orderItems: [{ id: 1, order_id: 1, product_id: 9999 }],
    products: [{ id: 1 }],
    users: [{ id: 1 }],
  });
  assert.equal(violations.length, 1);
  assert.equal(violations[0].type, 'ORPHAN_ORDER_ITEM_PRODUCT');
});

test('checkReferentialIntegrity DOES catch an order pointing at a non-existent user (negative proof)', () => {
  const violations = checkReferentialIntegrity({
    orders: [{ id: 1, user_id: 9999 }],
    orderItems: [],
    products: [],
    users: [{ id: 1 }],
  });
  assert.equal(violations.length, 1);
  assert.equal(violations[0].type, 'ORPHAN_ORDER_USER');
});

test('checkUniqueness reports zero violations for distinct emails', () => {
  const violations = checkUniqueness({ users: [{ id: 1, email: 'a@example.com' }, { id: 2, email: 'b@example.com' }] });
  assert.deepEqual(violations, []);
});

test('checkUniqueness DOES catch a duplicate email, case-insensitively (negative proof)', () => {
  const violations = checkUniqueness({
    users: [
      { id: 1, email: 'a@example.com' },
      { id: 2, email: 'A@EXAMPLE.COM' },
    ],
  });
  assert.equal(violations.length, 1);
  assert.equal(violations[0].type, 'DUPLICATE_EMAIL');
});

test('checkOrderTotalsReconcile reports zero violations when stored total matches recomputed total', () => {
  const violations = checkOrderTotalsReconcile({
    orders: [{ id: 1, total: 20.0 }],
    orderItems: [{ order_id: 1, quantity: 2, unit_price: 10.0 }],
  });
  assert.deepEqual(violations, []);
});

test('checkOrderTotalsReconcile DOES catch a stored total that does not match its order_items (negative proof)', () => {
  const violations = checkOrderTotalsReconcile({
    orders: [{ id: 1, total: 999.99 }],
    orderItems: [{ order_id: 1, quantity: 2, unit_price: 10.0 }],
  });
  assert.equal(violations.length, 1);
  assert.equal(violations[0].type, 'ORDER_TOTAL_MISMATCH');
  assert.equal(violations[0].recomputed_total, 20.0);
});

test('checkSchemaDrift reports zero violations against the real, live schema with the current EXPECTED_SCHEMA', () => {
  const db = getDatabase(':memory:');
  const violations = checkSchemaDrift(db, EXPECTED_SCHEMA);
  assert.deepEqual(violations, []);
});

test('checkSchemaDrift DOES catch a deliberately wrong expectation (negative proof: expects a column that does not exist, and omits one that does)', () => {
  const db = getDatabase(':memory:');
  const wrongExpectation = {
    ...EXPECTED_SCHEMA,
    products: ['id', 'name', 'price', 'stock_quantity', 'a_column_that_does_not_exist'],
  };
  const violations = checkSchemaDrift(db, wrongExpectation);
  const types = violations.map((v) => v.type);
  assert.ok(types.includes('MISSING_EXPECTED_COLUMN'));
  assert.ok(types.includes('UNEXPECTED_NEW_COLUMN'));
});
