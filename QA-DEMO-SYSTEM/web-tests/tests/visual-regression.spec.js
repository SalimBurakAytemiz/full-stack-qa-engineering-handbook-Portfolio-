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
//
// Windows baseline / run policy (Codex fix-campaign B3): Playwright's
// default snapshot naming already includes the platform in the filename
// (see the committed `*-chromium-linux.png` files — this is Playwright's
// own snapshotPathTemplate behavior, not something this repo configured).
// This repo's canonical, actually-executed environment is Linux — this
// sandboxed dev session AND the real GitHub Actions CI (.github/workflows/
// ci.yml, `runs-on: ubuntu-latest` for all 3 jobs, verified) both run on
// Linux, so only `-chromium-linux.png` baselines exist, and none are
// claimed to have PASSED on Windows (none have ever been executed there).
// If this suite were ever run on a real Windows machine, Playwright would
// look for a `*-chromium-win32.png` baseline, find none, and FAIL CLOSED
// with "snapshot doesn't exist" — the safe default — rather than silently
// comparing against the wrong-platform Linux baseline. No code change was
// needed to get this fail-safe behavior; it is documented here because
// Codex's audit found the policy itself undocumented, not because the
// mechanism was broken.
//
// Codex fix-campaign B3 (P2, Phase 9): the original production assertions
// used maxDiffPixelRatio: 0.01 — 1% of the FULL 1280x720 viewport, i.e.
// up to 9,216 tolerated differing pixels. The suite's OWN negative-control
// test below found, empirically, that this exact 1% ratio was loose
// enough to NOT catch a genuinely different page's content — a real false
// negative risk Codex's audit flagged independently. Re-probed here: this
// app has no CSS animations/transitions (grep-verified) and, run against
// the real committed baselines with maxDiffPixels: 0 (zero tolerance),
// BOTH pages compared byte-for-byte identical with no diff at all — this
// specific browser build renders deterministically, no anti-aliasing
// jitter exists to "absorb" in the first place. An absolute pixel cap
// (maxDiffPixels, viewport-size-independent) replaces the old 1% ratio,
// tightened to a small fixed safety margin rather than a percentage that
// scales with page size.
const VISUAL_DIFF_TOLERANCE = { maxDiffPixels: 25 };

test('Visual Regression: the login page matches its baseline screenshot (Pixel Perfect / Threshold-Tolerance)', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page).toHaveScreenshot('login-page.png', VISUAL_DIFF_TOLERANCE);
});

test('Visual Regression: the products page matches its baseline screenshot', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');
  await expect(page).toHaveScreenshot('products-page.png', {
    ...VISUAL_DIFF_TOLERANCE,
    // The notification list is dynamic (depends on which other tests ran
    // earlier in this same server lifetime, and on realtime WS timing) —
    // masking it is the standard visual-regression technique for
    // intentionally-dynamic regions, not a way to hide a real bug: every
    // OTHER pixel on the page (layout, product data, styling) is still
    // compared at full strictness.
    mask: [page.getByTestId('notification-list')],
  });
});

// --- Controlled meaningful-difference proof: proves the NEW tightened
// tolerance actually catches a real, moderately-sized visual change on
// the SAME page — stronger evidence than the negative-control below,
// which only proves two DIFFERENT pages are told apart. The change is
// injected at runtime via addStyleTag (never by editing frontend source
// — this must never touch the canonical page under test, per the
// campaign's "controlled proof, don't corrupt the source" rule). ---

test('Visual Regression [controlled proof]: a deliberate, moderate visual change on the login page IS caught at the new tolerance', async ({ page }) => {
  test.fail(true, 'intentionally injecting a real visual change into an otherwise-correct page — a mismatch is EXPECTED, proving the tightened tolerance is sensitive enough to catch it');

  await page.goto('/index.html');
  // A realistic-scale regression: e.g. a button's background color
  // silently changing, or a heading disappearing — not a page swap, a
  // small element-level change, the exact class of bug a loose full-page
  // ratio can miss.
  await page.addStyleTag({ content: '[data-testid="login-submit"] { background: #ff00ff !important; }' });
  await expect(page).toHaveScreenshot('login-page.png', VISUAL_DIFF_TOLERANCE);
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
