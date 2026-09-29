# Web Automation Tools

## Playwright (T4 CI_VERIFIED)

**Concepts:** browser automation via the Chrome DevTools Protocol (and
equivalents for Firefox/WebKit), with built-in auto-waiting — reduces
the flaky-wait-for-element class of bug common in older frameworks.

**Setup:** `QA-DEMO-SYSTEM/web-tests/` — `playwright.config.js`
(portable via `PLAYWRIGHT_CHROMIUM_PATH`, not hardcoded to one
sandbox's path — a real portability bug this repository found and
fixed).

**QA use cases exercised here:** functional flows, network
inspection, storage/cookies, accessibility (axe-core integration),
visual regression, UI-to-DB cross-validation (DB read as test oracle,
never used to bypass a UI action).

**Common mistakes found in this repository's own history:** a visual
regression tolerance (`maxDiffPixelRatio: 0.01`) loose enough to miss
a real, deliberately-injected difference (B3, fixed by switching to an
absolute `maxDiffPixels` threshold plus a controlled-difference proof
test).

**Related labs:** `QA-DEMO-SYSTEM/web-tests/`.

## Selenium (T4 CI_VERIFIED via GitHub Actions; sandbox-blocked locally)

**Concepts:** WebDriver-protocol browser automation; predates
Playwright, still the most widely deployed cross-language automation
standard.

**Setup:** `QA-DEMO-SYSTEM/automation-labs/selenium/` — driver factory,
Page Object Model, a parallel-execution runner.

**Real, documented environment split:** this exact code is
`EXECUTION_BLOCKED` in the sandbox this repository was built in
(chromedriver/Chromium version mismatch, no network access to fetch a
matching driver) but runs and passes for real on GitHub Actions'
`ubuntu-latest` runners (2/2, job log read directly, not assumed) — a
genuine example of "the same code, two different environments, two
different real outcomes," documented rather than smoothed over.

**Common mistakes found here:** a driver-factory that silently fell
back to a hardcoded sandbox-only Linux Chrome path when an env var was
unset — would have been actively wrong on any other machine (B4,
fixed).

**Related labs:** `QA-DEMO-SYSTEM/automation-labs/selenium/`.
