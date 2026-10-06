'use strict';

// Deterministic hostile-input generators for real-API fuzz testing —
// fixed, disclosed value sets, never true randomness, so a discovered
// failure is always reproducible on the next run. This is a QA
// TECHNIQUE demonstration (structured, seeded/fixed fuzzing of real
// HTTP input validation), not a claim of production-grade fuzzing
// infrastructure (no AFL/libFuzzer/coverage-guided mutation).
// TR: Gerçek API fuzz testi için deterministik, düşman (hostile) girdi
// üreticileri — sabit, açıkça beyan edilmiş değer kümeleri, asla
// gerçek rastgelelik. Bulunan bir hata HER ZAMAN bir sonraki
// çalıştırmada tekrar üretilebilir.

const MALFORMED_JSON_BODIES = [
  '{',
  '{"email": }',
  '[1,2,3',
  'not json at all',
  '',
  '{"email": "a@b.com" "password": "x"}',
  '\u0000\u0000\u0000',
  '{"a": 1,}',
];

const HOSTILE_STRING_VALUES = [
  '',
  'a'.repeat(200000),
  '\u0000',
  '🔥'.repeat(1000),
  "' OR '1'='1",
  '<script>alert(1)</script>',
  '../../../../etc/passwd',
  'null',
  '{}',
  '[]',
  '-0',
  '￿￿',
];

const HOSTILE_TYPE_VALUES = [null, true, false, [], {}, [1, 2, 3], { a: 1 }, 0, -1, 1.5];

function loginFuzzBodies() {
  const bodies = [];
  for (const email of [...HOSTILE_STRING_VALUES, ...HOSTILE_TYPE_VALUES]) {
    bodies.push({ email, password: 'ValidPass123!' });
  }
  for (const password of [...HOSTILE_STRING_VALUES, ...HOSTILE_TYPE_VALUES]) {
    bodies.push({ email: 'test.active01@example.com', password });
  }
  bodies.push({});
  bodies.push({ email: 'test.active01@example.com' });
  bodies.push({ password: 'ValidPass123!' });
  return bodies;
}

// Each of these is deliberately invalid per backend/src/services/orders
// .service.js's real, read validation rules (isPositiveInteger,
// aggregateItems) — every one of them must be rejected with 400, never
// crash the server into a 500.
function ordersFuzzBodies() {
  const badItemsVariants = [
    null,
    undefined,
    'not-an-array',
    123,
    {},
    [],
    [null],
    [{}],
    [{ product_id: 'x', quantity: 1 }],
    [{ product_id: 1, quantity: 'x' }],
    [{ product_id: 1, quantity: -1 }],
    [{ product_id: 1, quantity: 1.5 }],
    [{ product_id: 1, quantity: 0 }],
    [{ product_id: -1, quantity: 1 }],
    [{ product_id: 0, quantity: 1 }],
    [{ product_id: 1.5, quantity: 1 }],
  ];
  const bodies = badItemsVariants.map((items) => ({ items }));
  for (const badToken of [...HOSTILE_STRING_VALUES, ...HOSTILE_TYPE_VALUES]) {
    bodies.push({ items: [{ product_id: 1, quantity: 1 }], payment_token: badToken });
  }
  bodies.push({});
  return bodies;
}

module.exports = { MALFORMED_JSON_BODIES, HOSTILE_STRING_VALUES, HOSTILE_TYPE_VALUES, loginFuzzBodies, ordersFuzzBodies };
