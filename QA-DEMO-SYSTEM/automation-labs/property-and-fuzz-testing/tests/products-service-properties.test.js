'use strict';

// Real property-based tests against QA-DEMO-SYSTEM's REAL, unmodified
// backend service functions (backend/src/services/products.service.js)
// — not a fixture, not a reimplementation. Each test creates a fresh,
// isolated, real in-memory SQLite database (via the backend's own
// getDatabase(':memory:'), same schema, same code path as production)
// and exercises the real getProductById/listProducts functions with
// generated inputs.
// TR: QA-DEMO-SYSTEM'in GERÇEK, değiştirilmemiş backend servis
// fonksiyonlarına karşı gerçek property-based testler — fixture veya
// yeniden-yazım DEĞİLDİR. Her test, backend'in kendi
// getDatabase(':memory:') fonksiyonuyla taze, izole, gerçek bir
// bellek-içi SQLite veritabanı oluşturur.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { gen, shrink, forAll } = require('../lib/property-testing');

const { getDatabase } = require(path.join('..', '..', '..', 'backend', 'src', 'database', 'connection'));
const { listProducts, getProductById } = require(path.join('..', '..', '..', 'backend', 'src', 'services', 'products.service'));

function seedDb(products) {
  const db = getDatabase(':memory:');
  const insert = db.prepare('INSERT INTO products (id, name, price, stock_quantity) VALUES (?, ?, ?, ?)');
  for (const p of products) insert.run(p.id, p.name, p.price, p.stock_quantity);
  return db;
}

// Deterministic generator for a realistic, valid product set: unique
// sequential ids 1..N, random price/stock — mirrors the real shape in
// shared/test-data/products.json without depending on that file's
// exact contents (this must remain valid across any future edit to it).
function genProductSet(rng) {
  const count = rng.intBetween(1, 8);
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Property Test Product ${i + 1}`,
    price: rng.intBetween(1, 100000) / 100,
    stock_quantity: rng.intBetween(0, 50),
  }));
}

test('property: getProductById returns a product whose own id field equals the requested id, for every seeded id', () => {
  const result = forAll(
    genProductSet,
    (products) => {
      const db = seedDb(products);
      return products.every((p) => {
        const found = getProductById(db, p.id);
        return found !== undefined && found.id === p.id;
      });
    },
    { seed: 21, runs: 60 },
  );
  assert.equal(result.passed, true, `real backend function violated an identity property: ${JSON.stringify(result.failingInput)}`);
});

test('property: getProductById returns undefined for any id that was never seeded — never a wrong or fabricated record', () => {
  const result = forAll(
    (rng) => ({ products: genProductSet(rng), queryOffset: rng.intBetween(1, 10000) }),
    ({ products, queryOffset }) => {
      const db = seedDb(products);
      const maxSeededId = Math.max(...products.map((p) => p.id));
      const unseededId = maxSeededId + queryOffset;
      return getProductById(db, unseededId) === undefined;
    },
    { seed: 22, runs: 60 },
  );
  assert.equal(result.passed, true);
});

test('property: in_stock is always exactly (stock_quantity > 0) — the real business rule, for every seeded product', () => {
  const result = forAll(
    genProductSet,
    (products) => {
      const db = seedDb(products);
      return products.every((p) => {
        const found = getProductById(db, p.id);
        return found.in_stock === (p.stock_quantity > 0);
      });
    },
    { seed: 23, runs: 60 },
  );
  assert.equal(result.passed, true);
});

test('property: listProducts returns exactly as many rows as were seeded, sorted ascending by id', () => {
  const result = forAll(
    genProductSet,
    (products) => {
      const db = seedDb(products);
      const listed = listProducts(db);
      if (listed.length !== products.length) return false;
      for (let i = 1; i < listed.length; i += 1) {
        if (listed[i].id <= listed[i - 1].id) return false;
      }
      return true;
    },
    { seed: 24, runs: 60 },
  );
  assert.equal(result.passed, true);
});

test('property: querying the same id twice returns equal data both times (determinism, no hidden mutation)', () => {
  const result = forAll(
    genProductSet,
    (products) => {
      const db = seedDb(products);
      return products.every((p) => {
        const first = getProductById(db, p.id);
        const second = getProductById(db, p.id);
        return JSON.stringify(first) === JSON.stringify(second);
      });
    },
    { seed: 25, runs: 40 },
  );
  assert.equal(result.passed, true);
});

test('property: a deliberately wrong invariant about real data IS caught and shrinks to a small counterexample (real negative-path proof)', () => {
  // Deliberately false claim: every seeded product's price is under 1.00.
  // Constructed to prove this property suite would actually catch a
  // real regression, not just pass vacuously — same "prove the
  // detector detects" discipline as this repository's other labs.
  const result = forAll(
    gen.int(1, 100000),
    (priceCents) => {
      const db = seedDb([{ id: 1, name: 'X', price: priceCents / 100, stock_quantity: 1 }]);
      const found = getProductById(db, 1);
      return found.price < 1.0;
    },
    { seed: 26, runs: 50, shrinker: shrink.int(1) },
  );
  assert.equal(result.passed, false, 'a false claim about real product data must be caught, not silently accepted');
  assert.ok(result.shrunkInput >= 100, 'the shrunk counterexample must still genuinely violate the property (price >= 1.00, i.e. cents >= 100)');
});
