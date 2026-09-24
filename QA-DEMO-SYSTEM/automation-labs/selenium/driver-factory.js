const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

// Phase 10 Selenium lab — "Setup" + "WebDriver" + "Cross Browser" +
// "Selenium Grid" scope items.
//
// KNOWN, VERIFIED ENVIRONMENT CONSTRAINT (see EXECUTION.md section 2 for
// the full investigation): this sandboxed container ships chromedriver
// 147.x (/opt/node22/bin/chromedriver) but only Chromium 141.x is
// installed (/opt/pw-browsers/chromium-1194, the same browser Phase 8/9's
// Playwright suite uses). chromedriver refuses to launch a browser more
// than a few major versions behind it. Selenium Manager's own driver
// auto-download, and a direct `npm install chromedriver@141`, were BOTH
// tried in this session and BOTH failed because
// googlechromelabs.github.io is not on this environment's network
// allowlist (proxy returns 403). This is a real, verified infrastructure
// limitation, not a guess — see EXECUTION.md for the exact commands and
// error output. No Firefox binary is installed in this sandbox either
// (verified: `which firefox geckodriver` finds neither), so cross-browser
// execution is equally blocked here — the code below is nonetheless real
// and would run on a normal machine/CI runner with the matching
// browsers/drivers present.
//
// Codex fix-campaign B4 (P2, Phase 10): the PREVIOUS version of this file
// hardcoded a Linux-only sandbox path
// (/opt/pw-browsers/chromium-1194/chrome-linux/chrome) as the DEFAULT
// Chrome binary — not just a documented override, but the fallback used
// whenever CHROME_BINARY_PATH was unset. On any other machine (a normal
// CI runner, a Windows/macOS dev box) with a real Chrome install at a
// different path, this default was actively WRONG, not merely "not set
// for that platform" — it would force Selenium to look for a browser at
// a path that plainly does not exist there, when the correct portable
// behavior is to let Selenium Manager auto-discover the installed
// browser. Fixed: the binary path is now ONLY set when
// CHROME_BINARY_PATH is explicitly provided (this sandbox's dev session
// continues to pass it — see README/EXECUTION.md); everywhere else,
// standard Selenium Manager browser discovery is used, exactly as it
// would be on Windows, macOS, or a normal Linux CI runner.
function applyGridServer(builder) {
  const gridUrl = process.env.SELENIUM_GRID_URL;
  if (gridUrl) {
    builder.usingServer(gridUrl);
  }
  return builder;
}

function buildChromeDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800');
  // Only override the binary path when explicitly told to — never a
  // hardcoded platform-specific default (Codex fix-campaign B4).
  if (process.env.CHROME_BINARY_PATH) {
    options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH);
  }

  const driverPath = process.env.CHROMEDRIVER_PATH;
  const builder = new Builder().forBrowser('chrome').setChromeOptions(options);
  if (driverPath) {
    builder.setChromeService(new chrome.ServiceBuilder(driverPath));
  }
  return applyGridServer(builder).build();
}

// Cross Browser scope item: a real Firefox/geckodriver path through the
// same Builder API, parallel to buildChromeDriver() — no new dependency,
// selenium-webdriver bundles Firefox support already. Same portability
// discipline: no hardcoded platform-specific binary default.
function buildFirefoxDriver() {
  const options = new firefox.Options();
  options.addArguments('-headless');
  if (process.env.FIREFOX_BINARY_PATH) {
    options.setBinary(process.env.FIREFOX_BINARY_PATH);
  }

  const driverPath = process.env.GECKODRIVER_PATH;
  const builder = new Builder().forBrowser('firefox').setFirefoxOptions(options);
  if (driverPath) {
    builder.setFirefoxService(new firefox.ServiceBuilder(driverPath));
  }
  return applyGridServer(builder).build();
}

// Generic entry point used by the parallel-execution runner (Parallel
// Execution scope item) so it can build N independent sessions, optionally
// across different browsers, without duplicating this file's logic.
function buildDriver(browserName = 'chrome') {
  if (browserName === 'firefox') {
    return buildFirefoxDriver();
  }
  return buildChromeDriver();
}

module.exports = { buildChromeDriver, buildFirefoxDriver, buildDriver };
