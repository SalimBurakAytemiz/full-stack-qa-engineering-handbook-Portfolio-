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
        // Pre-installed Chromium in this sandboxed environment — see
        // EXECUTION.md "Cross-Browser Testing" section for why Firefox/
        // WebKit are NOT run here (not installed, no download available).
        launchOptions: { executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' },
      },
    },
  ],
});
