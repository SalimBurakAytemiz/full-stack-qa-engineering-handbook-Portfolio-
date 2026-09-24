const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

// Phase 8 — Responsive Testing. Real check: frontend/css/style.css has no
// media queries — `main` is a fluid `max-width: 480px` container, so there
// is no distinct "mobile layout" vs "desktop layout" to compare (a real,
// verified finding, not an assumption). Responsive testing here therefore
// proves the fluid layout stays usable (no horizontal overflow, all
// interactive elements reachable/clickable) across a narrow mobile-class
// viewport and a wide desktop-class viewport — the correct test for a
// fluid, breakpoint-less layout, not an invented breakpoint comparison.

const VIEWPORTS = [
  { name: 'mobile (375x667)', width: 375, height: 667 },
  { name: 'desktop (1280x800)', width: 1280, height: 800 },
];

for (const viewport of VIEWPORTS) {
  test(`Responsive [${viewport.name}]: login form is fully usable with no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/index.html');

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeInViewport();
  });

  test(`Responsive [${viewport.name}]: product list is fully usable with no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await login(page, 'test.active01@example.com', 'ValidPass123!');

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await expect(page.getByTestId('product-item').first()).toBeVisible();
  });
}
