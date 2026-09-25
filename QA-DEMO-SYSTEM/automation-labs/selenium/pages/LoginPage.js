const { By, until } = require('selenium-webdriver');

// Phase 10 Selenium lab — "Page Object Model" + "Locators" + "Waits" scope
// items. Locators mirror the SAME data-testid attributes the Phase 8
// Playwright suite already uses (frontend/index.html) — one real,
// stable locator contract shared across both tools, not two competing
// invented ones.
class LoginPage {
  constructor(driver, baseUrl) {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

  async open() {
    await this.driver.get(`${this.baseUrl}/index.html`);
    // Explicit wait: the page must be interactive (email field present)
    // before any further action — never a blind sleep().
    await this.driver.wait(until.elementLocated(By.css('[data-testid="login-email"]')), 10_000);
  }

  async login(email, password) {
    await this.driver.findElement(By.css('[data-testid="login-email"]')).sendKeys(email);
    await this.driver.findElement(By.css('[data-testid="login-password"]')).sendKeys(password);
    await this.driver.findElement(By.css('[data-testid="login-submit"]')).click();
  }

  async waitForError() {
    const el = await this.driver.wait(until.elementLocated(By.css('[data-testid="login-error"]')), 5_000);
    await this.driver.wait(until.elementIsVisible(el), 5_000);
    return el.getText();
  }

  async waitForNavigationToProducts() {
    await this.driver.wait(until.urlContains('products.html'), 10_000);
  }
}

module.exports = { LoginPage };
