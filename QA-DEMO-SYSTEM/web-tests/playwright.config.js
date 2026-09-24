const path = require('node:path');
const { defineConfig, devices } = require('@playwright/test');

// Phase 8 — Web QA. Runs real Playwright tests against the REAL Express
// server (backend/src/server.js), which serves the real vanilla frontend
// as static files (see backend/src/app.js) — no mock server, no stub DOM.
//
// A dedicated, disposable DB file is used (never the shared dev DB, never
// :memory: — the server process outlives any single test) so the suite
// always starts from the same deterministic seeded state. It is under
// backend/data/, already covered by QA-DEMO-SYSTEM/.gitignore.
const TEST_DB_PATH = path.join(__dirname, '..', 'backend', 'data', 'playwright-test.db');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  // No retries: a flaky-looking result must be investigated as a real bug,
  // never silently re-run into a false PASS (Evidence Integrity).
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4300',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node ${path.join(__dirname, 'scripts', 'reset-and-start-server.js')}`,
    url: 'http://127.0.0.1:4300/api/health',
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      PORT: '4300',
      DB_PATH: TEST_DB_PATH,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // PLAYWRIGHT_CHROMIUM_PATH pins a specific binary (used in this
        // repo's sandboxed dev session, where PLAYWRIGHT_SKIP_BROWSER_
        // DOWNLOAD=1 is set and only a pre-installed Chromium revision is
        // available — see EXECUTION.md "Cross-Browser Testing"). Leaving
        // it unset (e.g. in CI, see .github/workflows/ci.yml) lets
        // Playwright resolve its own normally-installed browser, so this
        // config is portable rather than hardcoded to one machine.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : {},
      },
    },
  ],
});
