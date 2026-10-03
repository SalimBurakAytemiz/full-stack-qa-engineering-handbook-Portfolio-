#!/usr/bin/env node
'use strict';

// Real compatibility-testing lab: gets the REAL current GET /api/products
// response shape from the real backend service (a real in-memory SQLite
// db via the backend's own getDatabase() + the real listProducts()
// function — not a hand-written fixture), validates it against a frozen
// baseline JSON Schema contract, then proves the checker actually
// distinguishes a breaking change from a safe additive change by running
// it against deliberately mutated candidates.
// TR: Gercek bir geriye-donuk-uyumluluk laboratuvari: backend'in GERCEK
// servis fonksiyonundan GERCEK bir GET /api/products yanit seklini alir,
// dondurulmus bir baseline JSON Schema'ya karsi dogrular, ardindan
// denetleyicinin kirici bir degisikligi guvenli bir ekleme
// degisiklikten gercekten ayirt ettigini kasitli mutasyonlarla kanitlar.

const path = require('node:path');
const fs = require('node:fs');
const Ajv = require('ajv');
const { checkCompatibility } = require('./lib/compatibility-check');
const { simulateFieldRemoved, simulateTypeChanged, simulateFieldAdded } = require('./lib/simulate-api-change');

const { getDatabase } = require(path.join(__dirname, '..', '..', 'backend', 'src', 'database', 'connection'));
const { listProducts } = require(path.join(__dirname, '..', '..', 'backend', 'src', 'services', 'products.service'));

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('COMPATIBILITY_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

function seedRealDb() {
  const db = getDatabase(':memory:');
  db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (1, 'Widget', 10.00, 50)").run();
  db.prepare("INSERT INTO products (id, name, price, stock_quantity) VALUES (2, 'Gadget', 20.00, 0)").run();
  return db;
}

function main() {
  const baselineSchema = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'fixtures', 'baseline-schemas', 'products-list-response.schema.json'), 'utf8'),
  );
  const ajv = new Ajv();

  // Real current response shape — from the real backend service, not a fixture.
  const db = seedRealDb();
  const realCurrentResponse = { products: listProducts(db) };

  const checks = [];

  // 1. The REAL current response must still be compatible with the frozen baseline.
  const realResult = checkCompatibility(ajv, baselineSchema, realCurrentResponse);
  checks.push({
    name: 'the real current GET /api/products response is compatible with the frozen baseline contract',
    pass: realResult.classification !== 'BREAKING',
    detail: `classification=${realResult.classification}`,
  });

  // 2. A simulated removed-field candidate must be caught as BREAKING.
  const removedFieldCandidate = simulateFieldRemoved(realCurrentResponse, 'in_stock');
  const removedResult = checkCompatibility(ajv, baselineSchema, removedFieldCandidate);
  checks.push({
    name: 'a simulated removed required field ("in_stock") is detected as BREAKING',
    pass: removedResult.classification === 'BREAKING',
    detail: `classification=${removedResult.classification}, errors=${JSON.stringify(removedResult.breakingErrors.map((e) => e.message))}`,
  });

  // 3. A simulated type-changed candidate must be caught as BREAKING.
  const typeChangedCandidate = simulateTypeChanged(realCurrentResponse, 'price', '10.00');
  const typeResult = checkCompatibility(ajv, baselineSchema, typeChangedCandidate);
  checks.push({
    name: 'a simulated field type change ("price" number -> string) is detected as BREAKING',
    pass: typeResult.classification === 'BREAKING',
    detail: `classification=${typeResult.classification}, errors=${JSON.stringify(typeResult.breakingErrors.map((e) => e.message))}`,
  });

  // 4. A simulated additive-field candidate must be classified SAFE_ADDITIVE, never BREAKING.
  const additiveFieldCandidate = simulateFieldAdded(realCurrentResponse, 'currency', 'USD');
  const additiveResult = checkCompatibility(ajv, baselineSchema, additiveFieldCandidate);
  checks.push({
    name: 'a simulated new field ("currency") is detected as SAFE_ADDITIVE, not falsely flagged as breaking',
    pass: additiveResult.classification === 'SAFE_ADDITIVE' && additiveResult.additiveFields.includes('products[].currency'),
    detail: `classification=${additiveResult.classification}, additiveFields=${JSON.stringify(additiveResult.additiveFields)}`,
  });

  console.log('--- Compatibility Testing Lab: real scenario results ---');
  for (const c of checks) {
    console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.name} (${c.detail})`);
  }

  const allPassed = checks.every((c) => c.pass);
  if (!allPassed) {
    console.log('\nCOMPATIBILITY_LAB_STATUS: FAILED');
    reportOutcome(1);
    return;
  }
  console.log('\nCOMPATIBILITY_LAB_STATUS: EXECUTED');
  reportOutcome(0);
}

main();
