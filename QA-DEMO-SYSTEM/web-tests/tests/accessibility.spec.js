const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { login } = require('./helpers');

// Phase 9 — Accessibility (WCAG concepts, Contrast, Accessibility Labels,
// Keyboard Navigation, Focus). Uses @axe-core/playwright (MPL-2.0,
// industry-standard automated accessibility engine — dependency-policy
// check: no lighter-weight alternative exists for real WCAG rule
// evaluation; MPL-2.0 is file-level copyleft, safe as a devDependency test
// tool with no distribution of modified axe-core source).
//
// Real screen-reader SOFTWARE automation (NVDA/VoiceOver actually reading
// the page aloud) is NOT covered — no such software is installed/runnable
// in this headless container. What IS covered, genuinely: the ARIA/
// accessible-name/label structure those screen readers depend on — see
// EXECUTION.md section 4.

test('WCAG: the login page has no automatically-detectable accessibility violations', async ({ page }) => {
  await page.goto('/index.html');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('WCAG: the products page (logged in) has no automatically-detectable accessibility violations', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('Contrast: the login page passes the WCAG color-contrast rule', async ({ page }) => {
  await page.goto('/index.html');
  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('Accessibility Labels: the email and password fields have real, correctly-associated accessible names', async ({ page }) => {
  await page.goto('/index.html');
  // toHaveAccessibleName resolves the SAME accessible-name computation a
  // screen reader uses (label[for], aria-label, aria-labelledby, etc.) —
  // this is the real underlying mechanism "Screen Reader controls" and
  // "Accessibility Labels" both depend on, verified directly rather than
  // simulated.
  await expect(page.getByTestId('login-email')).toHaveAccessibleName('E-posta');
  await expect(page.getByTestId('login-password')).toHaveAccessibleName('Şifre');
});

test('Keyboard Navigation + Focus: Tab order on the login page reaches email -> password -> submit in sequence', async ({ page }) => {
  await page.goto('/index.html');

  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('login-email')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByTestId('login-password')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByTestId('login-submit')).toBeFocused();
});

test('Keyboard Navigation: the login form can be fully submitted using only the keyboard (no mouse)', async ({ page }) => {
  await page.goto('/index.html');

  await page.getByTestId('login-email').focus();
  await page.keyboard.type('test.active01@example.com');
  await page.keyboard.press('Tab');
  await page.keyboard.type('ValidPass123!');
  await page.keyboard.press('Enter');

  await page.waitForURL('**/products.html');
});
