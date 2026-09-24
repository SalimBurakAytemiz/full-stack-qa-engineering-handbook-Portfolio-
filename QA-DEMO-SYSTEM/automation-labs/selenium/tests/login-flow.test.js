const assert = require('node:assert/strict');
const { buildChromeDriver } = require('../driver-factory');
const { LoginPage } = require('../pages/LoginPage');
const { ProductsPage } = require('../pages/ProductsPage');
const loginCases = require('../test-data/login-cases.json');

// Phase 10 Selenium lab — "Assertions" + "Reporting" scope items.
// A tiny, real (not simulated) console reporter — no external reporting
// framework dependency is justified for two tests; this mirrors what a
// mocha/jasmine reporter does (collect result, print PASS/FAIL summary,
// exit non-zero on failure) without adding one more dependency for a
// two-test lab.
const results = [];

async function runCase(name, fn) {
  const startedAt = Date.now();
  try {
    await fn();
    results.push({ name, status: 'PASS', durationMs: Date.now() - startedAt });
  } catch (err) {
    results.push({ name, status: 'FAIL', durationMs: Date.now() - startedAt, error: err.message });
  }
}

async function main() {
  const baseUrl = process.env.QA_DEMO_BASE_URL || 'http://127.0.0.1:4400';

  let driver;
  try {
    driver = await buildChromeDriver();
  } catch (err) {
    // See driver-factory.js and EXECUTION.md for the verified root cause
    // (chromedriver/Chromium major-version mismatch, driver download
    // blocked by network policy). This is reported distinctly from a
    // normal test FAIL — it is an infrastructure block, not a defect in
    // this lab's code or in the application under test.
    console.log('SELENIUM_LAB_STATUS: EXECUTION_BLOCKED');
    console.log(`SELENIUM_LAB_BLOCK_REASON: ${err.message}`);
    process.exitCode = 2;
    return;
  }

  try {
    await runCase('valid credentials log in and reach the products page', async () => {
      const loginPage = new LoginPage(driver, baseUrl);
      await loginPage.open();
      await loginPage.login(loginCases.valid.email, loginCases.valid.password);
      await loginPage.waitForNavigationToProducts();

      const productsPage = new ProductsPage(driver);
      await productsPage.waitForProductList();
      const names = await productsPage.getProductNames();
      assert.ok(names.includes('QA Demo Klavye'), `expected seeded product in list, got: ${names.join(', ')}`);
    });

    await runCase('invalid credentials show the real backend error message', async () => {
      const loginPage = new LoginPage(driver, baseUrl);
      await loginPage.open();
      await loginPage.login(loginCases.invalid.email, loginCases.invalid.password);
      const errorText = await loginPage.waitForError();
      assert.equal(errorText, 'Email veya şifre hatalı');
    });
  } finally {
    await driver.quit();
  }

  console.log('SELENIUM_LAB_STATUS: EXECUTED');
  for (const r of results) {
    console.log(`  [${r.status}] ${r.name} (${r.durationMs}ms)${r.error ? ` — ${r.error}` : ''}`);
  }
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`SELENIUM_LAB_SUMMARY: ${results.length - failed}/${results.length} passed`);
  process.exitCode = failed > 0 ? 1 : 0;
}

main();
