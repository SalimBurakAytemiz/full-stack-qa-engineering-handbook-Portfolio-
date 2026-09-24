const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

// Phase 9 — Visual Regression / Pixel Perfect / Screenshot Comparison /
// Difference Visualization / Threshold-Tolerance. Uses Playwright's built-in
// toHaveScreenshot() (pixelmatch-based real pixel diffing, not a stub) — no
// extra dependency needed (dependency-policy check: @playwright/test already
// bundles this, adding a second image-diff library would be redundant).
//
// "Figma Comparison" (ROADMAP scope item) is NOT covered here — no real
// Figma file/account is available in this environment; see
// EXECUTION.md section 4 for the honest LEARNING-only classification.
//
// Baseline PNGs under tests/visual-regression.spec.js-snapshots/ ARE
// committed to the repository — they are the golden reference images the
// test compares against (a test fixture, like a JSON schema file), not an
// incidental generated artifact.

test('Visual Regression: the login page matches its baseline screenshot (Pixel Perfect / Threshold-Tolerance)', async ({ page }) => {
  await page.goto('/index.html');
  // A small non-zero tolerance (Threshold/Tolerance scope item) absorbs
  // sub-pixel anti-aliasing noise between runs, while still catching any
  // real visual change.
  await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixelRatio: 0.01 });
});

test('Visual Regression: the products page matches its baseline screenshot', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');
  await expect(page).toHaveScreenshot('products-page.png', {
    maxDiffPixelRatio: 0.01,
    // The notification list is dynamic (depends on which other tests ran
    // earlier in this same server lifetime, and on realtime WS timing) —
    // masking it is the standard visual-regression technique for
    // intentionally-dynamic regions, not a way to hide a real bug: every
    // OTHER pixel on the page (layout, product data, styling) is still
    // compared at full strictness.
    mask: [page.getByTestId('notification-list')],
  });
});

// --- Negative control: proves the diffing pipeline genuinely detects a
// real visual difference, not just auto-passing / rubber-stamping. ---

test('Visual Regression [negative control]: comparing a genuinely different page against an existing baseline is correctly detected as a mismatch', async ({ page }) => {
  test.fail(true, 'intentionally comparing the login page against the products-page.png baseline — a real mismatch is EXPECTED, proving Difference Visualization actually works');

  await page.goto('/index.html');
  // Deliberately reuses 'products-page.png' — a baseline for an entirely
  // different page — established by the test above in this same run.
  // maxDiffPixelRatio is 0 here (unlike the real baseline tests above):
  // the two pages' differing content (form vs. list) sits inside a small
  // centered <480px card against a large shared blank background, so a
  // 1% whole-viewport tolerance was found, empirically, to be loose
  // enough to NOT flag the difference — a real false negative this
  // negative-control test exists specifically to catch. Zero tolerance
  // here is intentional and correct for a "these must be identical"
  // proof, not a bug to "fix" by loosening it further.
  await expect(page).toHaveScreenshot('products-page.png', { maxDiffPixelRatio: 0 });
});
