const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { getDatabase } = require('../../backend/src/database/connection');
const { login } = require('./helpers');

// Codex fix-campaign B2 (P2, Phase 7): the backend test previously named
// "UI -> DB Validation" (backend/tests/database-testing.test.js) never
// touched a browser or the DOM — it drove the flow entirely with raw
// fetch() calls, which is an API->DB test wearing a UI->DB label. That
// backend test has been renamed/reclassified accordingly (see its own
// comment). THIS file is the real replacement: genuine browser actions
// (Playwright `page`, real clicks/fills/navigation) followed by a direct
// database read used ONLY as the test oracle — never to perform the
// action itself, which would be the same bypass Codex flagged.
//
// Scope honesty: this app's frontend (frontend/js/*.js) has NO
// order-creation/checkout UI at all — only login and product browsing
// (already documented in realtime-notification.spec.js, Phase 8). A
// browser-driven order-creation->DB flow is therefore not physically
// possible against this app, and is NOT claimed here. This suite proves
// UI->DB for the two flows that genuinely have a UI: login (session
// persistence) and product browsing (rendered data fidelity).

const TEST_DB_PATH = path.join(__dirname, '..', '..', 'backend', 'data', 'playwright-test.db');

test('UI -> DB: a real browser login persists a matching session row, not just a client-side token', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');

  // The token the real login UI stored client-side (sessionStorage, set by
  // frontend/js/login.js on a successful submit) — read via the browser's
  // own API, not fabricated by the test.
  const uiToken = await page.evaluate(() => sessionStorage.getItem('qa_demo_token'));
  expect(uiToken).toBeTruthy();

  // Database read is the test ORACLE ONLY — the login itself was driven
  // entirely through the UI form above, nothing here re-performs it via
  // HTTP.
  const db = getDatabase(TEST_DB_PATH);
  try {
    const row = db
      .prepare(
        `SELECT s.token, u.email
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token = ?`
      )
      .get(uiToken);
    expect(row).toBeTruthy();
    expect(row.email).toBe('test.active01@example.com');
  } finally {
    db.close();
  }
});

test('UI -> DB: the products rendered by a real browser exactly match the underlying database rows', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');
  // login() already waits for navigation to products.html, where
  // products.js's loadProducts() has run and populated the DOM.

  const domItems = await page.getByTestId('product-item').all();
  expect(domItems.length).toBeGreaterThan(0);

  const domProducts = [];
  for (const item of domItems) {
    domProducts.push({
      name: await item.getByTestId('product-name').innerText(),
      price: await item.getByTestId('product-price').innerText(),
      stockLabel: await item.getByTestId('product-stock').innerText(),
    });
  }

  const db = getDatabase(TEST_DB_PATH);
  let dbProducts;
  try {
    dbProducts = db.prepare('SELECT name, price, stock_quantity FROM products ORDER BY id').all();
  } finally {
    db.close();
  }

  expect(domProducts.length).toBe(dbProducts.length);
  for (let i = 0; i < dbProducts.length; i += 1) {
    expect(domProducts[i].name).toBe(dbProducts[i].name);
    expect(domProducts[i].price).toBe(`${dbProducts[i].price.toFixed(2)} TL`);
    expect(domProducts[i].stockLabel).toBe(dbProducts[i].stock_quantity > 0 ? 'Stokta' : 'Stok Yok');
  }
});
