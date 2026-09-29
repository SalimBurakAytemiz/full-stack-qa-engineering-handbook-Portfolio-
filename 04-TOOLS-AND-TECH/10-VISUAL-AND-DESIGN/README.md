# Visual & Design Tools

## Playwright visual regression (T4 CI_VERIFIED)

`toHaveScreenshot()`-based baseline comparison — see
`04-TOOLS-AND-TECH/02-WEB-AUTOMATION/README.md` for the tolerance-bug
finding (B3) and its fix.

## axe-core (T4 CI_VERIFIED)

Accessibility rule engine integrated into the Playwright suite
(`web-tests/tests/accessibility.spec.js`) — WCAG2A/AA, color-contrast,
accessible-name, and keyboard-navigation checks. Genuinely found 0
violations on this repository's pages (not suppressed — verified by
checking the rule set actually ran).

## Figma comparison / Python Pixel Perfect (T1 DOCUMENTED — professional practice)

Real professional practice recorded in the Digital Twin
(`competency-state.yaml#competency.web.visual-testing`); no equivalent
tooling exists as repository code here — Playwright's own visual
regression is this repository's executable equivalent.
