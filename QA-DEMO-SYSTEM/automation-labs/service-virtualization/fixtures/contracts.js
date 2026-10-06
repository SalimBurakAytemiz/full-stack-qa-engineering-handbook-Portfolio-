'use strict';

// The contracts themselves — defined ONCE and imported by both the
// consumer-side test (against a virtualized double) and the
// provider-side test (against the real running backend). This is the
// entire point of consumer-driven contract testing: both sides are
// checked against the exact same expectation, so a real drift between
// what the consumer expects and what the provider actually returns is
// caught, not two independently-drifting schemas that happen to look
// similar.
// TR: Sözleşmelerin kendisi — BİR KEZ tanımlanır, hem tüketici-taraflı
// teste (sanallaştırılmış bir çifte karşı) hem sağlayıcı-taraflı teste
// (gerçek çalışan backend'e karşı) aynı dosyadan import edilir.

const { defineContract } = require('../lib/contract');

const productsListContract = defineContract('GET /api/products', {
  type: 'object',
  required: ['products'],
  additionalProperties: false,
  properties: {
    products: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'price', 'stock_quantity', 'in_stock'],
        additionalProperties: false,
        properties: {
          id: { type: 'integer', minimum: 1 },
          name: { type: 'string', minLength: 1 },
          price: { type: 'number', minimum: 0 },
          stock_quantity: { type: 'integer', minimum: 0 },
          in_stock: { type: 'boolean' },
        },
      },
    },
  },
});

const loginSuccessContract = defineContract('POST /api/auth/login (200)', {
  type: 'object',
  required: ['token', 'user'],
  additionalProperties: false,
  properties: {
    token: { type: 'string', minLength: 1 },
    user: {
      type: 'object',
      required: ['id', 'email'],
      additionalProperties: false,
      properties: {
        id: { type: 'integer', minimum: 1 },
        email: { type: 'string', minLength: 1 },
      },
    },
  },
});

module.exports = { productsListContract, loginSuccessContract };
