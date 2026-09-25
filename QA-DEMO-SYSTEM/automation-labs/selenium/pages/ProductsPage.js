const { By, until } = require('selenium-webdriver');

// Phase 10 Selenium lab — Page Object Model for frontend/products.html.
class ProductsPage {
  constructor(driver) {
    this.driver = driver;
  }

  async waitForProductList() {
    await this.driver.wait(until.elementLocated(By.css('[data-testid="product-item"]')), 10_000);
  }

  async getProductNames() {
    const items = await this.driver.findElements(By.css('[data-testid="product-name"]'));
    return Promise.all(items.map((el) => el.getText()));
  }
}

module.exports = { ProductsPage };
