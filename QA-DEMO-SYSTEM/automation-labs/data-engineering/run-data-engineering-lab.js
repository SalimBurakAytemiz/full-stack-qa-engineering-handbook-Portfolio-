#!/usr/bin/env node
'use strict';

// Real data-engineering lab: seeds a real in-memory SQLite db via the
// backend's own getDatabase(), extracts real rows, runs real ETL
// transforms, and runs real data-quality checks — first against the real
// (clean) extracted data (expect zero violations), then against
// deliberately corrupted synthetic data to prove each checker actually
// detects what it claims to (the same "prove the detector detects"
// discipline used elsewhere in this campaign).
// TR: Gerçek bir bellek-içi SQLite veritabanı tohumlanır, gerçek satırlar
// çıkarılır (extract), gerçek ETL dönüşümleri çalıştırılır, gerçek
// veri-kalitesi kontrolleri önce TEMİZ veriye (sıfır ihlal beklenir),
// sonra kasıtlı olarak BOZULMUŞ sentetik veriye (ihlal YAKALANMALI)
// karşı çalıştırılır.

const path = require('node:path');
const { extract, transformRevenueByProduct, transformOrderSummaryByUser } = require('./lib/etl');
const {
  checkReferentialIntegrity,
  checkUniqueness,
  checkOrderTotalsReconcile,
  checkSchemaDrift,
} = require('./lib/data-quality');
const { EXPECTED_SCHEMA } = require('./lib/expected-schema');

const { getDatabase } = require(path.join(__dirname, '..', '..', 'backend', 'src', 'database', 'connection'));

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('DATA_ENGINEERING_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

function seedRealDb() {
  const db = getDatabase(':memory:');
  db.prepare("INSERT INTO users (id, email, password, status) VALUES (1, 'alice@example.com', 'x', 'ACTIVE')").run();
  db.prepare("INSERT INTO users (id, email, password, status) VALUES (2, 'bob@example.com', 'x', 'ACTIVE')").run();
  db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (1, 'Widget', 10.00, 50)").run();
  db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (2, 'Gadget', 20.00, 30)").run();
  db.prepare("INSERT INTO orders (id, user_id, status, total) VALUES (1, 1, 'PAID', 40.00)").run();
  db.prepare("INSERT INTO orders (id, user_id, status, total) VALUES (2, 2, 'PAID', 20.00)").run();
  db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (1, 1, 2, 10.00)').run();
  db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (1, 2, 1, 20.00)').run();
  db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (2, 2, 1, 20.00)').run();
  return db;
}

function main() {
  const db = seedRealDb();
  const extracted = extract(db);

  console.log('--- ETL output (real, computed from real extracted rows) ---');
  const revenueByProduct = transformRevenueByProduct(extracted);
  console.log('Revenue by product:', JSON.stringify(revenueByProduct));
  const orderSummaryByUser = transformOrderSummaryByUser(extracted);
  console.log('Order summary by user:', JSON.stringify(orderSummaryByUser));

  console.log('\n--- Data-quality checks against the REAL extracted data (expect zero violations) ---');
  const realViolations = [
    ...checkReferentialIntegrity(extracted),
    ...checkUniqueness(extracted),
    ...checkOrderTotalsReconcile(extracted),
    ...checkSchemaDrift(db, EXPECTED_SCHEMA),
  ];
  console.log(`Real-data violations found: ${realViolations.length}`);
  if (realViolations.length > 0) {
    console.log(JSON.stringify(realViolations));
    console.log('\nDATA_ENGINEERING_LAB_STATUS: FAILED — the real, freshly-seeded dataset should be clean but a checker found a violation.');
    reportOutcome(1);
    return;
  }

  console.log('\n--- Negative-path proofs: each checker against deliberately corrupted synthetic data ---');
  const proofs = [
    {
      name: 'checkReferentialIntegrity catches an orphaned order_item.product_id',
      violations: checkReferentialIntegrity({
        orders: extracted.orders,
        orderItems: [...extracted.orderItems, { id: 9999, order_id: 1, product_id: 424242 }],
        products: extracted.products,
        users: extracted.users,
      }),
      expectType: 'ORPHAN_ORDER_ITEM_PRODUCT',
    },
    {
      name: 'checkUniqueness catches a duplicate (case-insensitive) email',
      violations: checkUniqueness({ users: [...extracted.users, { id: 9999, email: 'ALICE@EXAMPLE.COM' }] }),
      expectType: 'DUPLICATE_EMAIL',
    },
    {
      name: 'checkOrderTotalsReconcile catches a stored total that disagrees with its order_items',
      violations: checkOrderTotalsReconcile({
        orders: [...extracted.orders.filter((o) => o.id !== 1), { id: 1, total: 999.99 }],
        orderItems: extracted.orderItems,
      }),
      expectType: 'ORDER_TOTAL_MISMATCH',
    },
    {
      name: 'checkSchemaDrift catches a deliberately wrong column expectation',
      violations: checkSchemaDrift(db, { ...EXPECTED_SCHEMA, products: ['id', 'name', 'price', 'stock_quantity', 'not_a_real_column'] }),
      expectType: 'MISSING_EXPECTED_COLUMN',
    },
  ];

  let allProofsPassed = true;
  for (const proof of proofs) {
    const caught = proof.violations.some((v) => v.type === proof.expectType);
    console.log(`  [${caught ? 'PROVEN' : 'NOT PROVEN'}] ${proof.name}`);
    if (!caught) allProofsPassed = false;
  }

  if (!allProofsPassed) {
    console.log('\nDATA_ENGINEERING_LAB_STATUS: FAILED — at least one checker failed to catch its own deliberately injected issue.');
    reportOutcome(1);
    return;
  }

  console.log('\nDATA_ENGINEERING_LAB_STATUS: EXECUTED');
  reportOutcome(0);
}

main();
