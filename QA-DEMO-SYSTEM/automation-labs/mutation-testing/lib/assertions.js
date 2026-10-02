'use strict';

// A fixed, deterministic battery of real behavioral checks run against
// backend/src/services/products.service.js — either the real module or a
// mutant of it. Each check throws on violation; the mutation runner treats
// a throw as "mutant killed" and a clean pass of every check as "survived".
// TR: Hem GERÇEK modüle hem de bir mutant'a karşı çalıştırılan, sabit,
// deterministik bir davranış kontrol seti. Bir fırlatma (throw) "mutant
// öldürüldü" anlamına gelir.

const assert = require('node:assert/strict');

function sharedAssertions({ getDatabase }) {
  return [
    {
      name: 'in_stock-false-when-stock-quantity-zero',
      run(mod) {
        const db = getDatabase(':memory:');
        db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (1, 'A', 9.99, 0)").run();
        const found = mod.getProductById(db, 1);
        assert.equal(found.in_stock, false);
      },
    },
    {
      name: 'in_stock-true-at-stock-quantity-one-boundary',
      run(mod) {
        const db = getDatabase(':memory:');
        db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (1, 'A', 9.99, 1)").run();
        const found = mod.getProductById(db, 1);
        assert.equal(found.in_stock, true);
      },
    },
    {
      name: 'getProductById-returns-strict-undefined-for-missing-id',
      run(mod) {
        const db = getDatabase(':memory:');
        const found = mod.getProductById(db, 999);
        assert.equal(found, undefined);
        assert.notEqual(found, null);
      },
    },
    {
      name: 'getProductById-identity',
      run(mod) {
        const db = getDatabase(':memory:');
        db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (5, 'B', 1.00, 3)").run();
        const found = mod.getProductById(db, 5);
        assert.equal(found.id, 5);
      },
    },
  ];
}

// TR: BASELINE kasıtlı olarak M2.3'teki property test'in üretici
// fonksiyonuyla AYNI boşluğu taşır — id'ler her zaman artan sırada
// eklenir, bu yüzden ORDER BY kaldırma mutant'ı muhtemelen HAYATTA KALIR
// (SQLite rowid-sıralı taramayı "tesadüfen" doğru sırada döndürür). Bu,
// gizlenecek bir kusur değil — mutation testing'in GERÇEK değerini
// göstermek için burada BİLEREK bırakıldı (bkz. EXECUTION.md "Mutation
// testing finding").
function buildBaselineAssertions({ getDatabase }) {
  return [
    ...sharedAssertions({ getDatabase }),
    {
      name: 'listProducts-sorted-ascending-id-order-insertion (baseline — mirrors the M2.3 property test coverage gap)',
      run(mod) {
        const db = getDatabase(':memory:');
        const insert = db.prepare('INSERT INTO products (id, name, price, stock_quantity) VALUES (?, ?, ?, ?)');
        insert.run(1, 'A', 1.0, 1);
        insert.run(2, 'B', 2.0, 1);
        insert.run(3, 'C', 3.0, 1);
        const listed = mod.listProducts(db);
        assert.deepEqual(listed.map((p) => p.id), [1, 2, 3]);
      },
    },
  ];
}

// Strengthened: inserts out of id order, so a correct implementation can
// only pass by genuinely sorting (i.e. by actually relying on ORDER BY).
// This is the battery the lab's real PASS/FAIL decision is based on.
function buildAssertions({ getDatabase }) {
  return [
    ...sharedAssertions({ getDatabase }),
    {
      name: 'listProducts-sorted-ascending-even-when-inserted-out-of-id-order (strengthened)',
      run(mod) {
        const db = getDatabase(':memory:');
        const insert = db.prepare('INSERT INTO products (id, name, price, stock_quantity) VALUES (?, ?, ?, ?)');
        insert.run(3, 'C', 3.0, 1);
        insert.run(1, 'A', 1.0, 1);
        insert.run(2, 'B', 2.0, 1);
        const listed = mod.listProducts(db);
        assert.deepEqual(listed.map((p) => p.id), [1, 2, 3]);
      },
    },
  ];
}

module.exports = { buildAssertions, buildBaselineAssertions };
