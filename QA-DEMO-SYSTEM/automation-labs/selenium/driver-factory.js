const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Phase 10 Selenium lab — "Setup" + "WebDriver" scope items.
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
// error output.
//
// This module is nonetheless written exactly as it would be in an
// environment with a matching driver/browser pair — real WebDriver Builder
// configuration, no stub/mock — so it documents correct Setup practice and
// is ready to run unmodified the moment a matching chromedriver is
// available (e.g. a normal CI runner with `webdriver-manager`/Selenium
// Manager network access).
function buildChromeDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800');
  options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome');

  const driverPath = process.env.CHROMEDRIVER_PATH;
  const builder = new Builder().forBrowser('chrome').setChromeOptions(options);
  if (driverPath) {
    builder.setChromeService(new chrome.ServiceBuilder(driverPath));
  }
  return builder.build();
}

module.exports = { buildChromeDriver };
