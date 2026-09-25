# Domain: Mobile / Digital Platforms — Multi-Country & Localization

**Maturity:** D2 QA_MAPPED (real, deep domain-QA knowledge with a
professional-experience anchor; no dedicated multi-country executable
lab in this repository — see "Executable scope").

Real (sanitized) professional experience in this domain:
`01-SALIM-BURAK-DIGITAL-TWIN/registry/professional-experience.yaml#pro.mobile.defacto-like`
(Flutter → React Native migration QA, feature-parity validation,
five-country QA context, country-specific behavior/localization/
payment-methods validation, country-specific OMS integrations, Figma
comparison, Python pixel-perfect/screenshot comparison). For general
mobile QA knowledge not specific to this multi-country context, see
`02-FULL-STACK-QA-HANDBOOK/09-MOBILE-QA/` — this page is the domain/
professional-context page, that one is the knowledge-base page, kept
separate per "one fact, one owner."

## Actors

- **End user**, scoped to one specific country/locale — the actual
  subject of every test case below; "does it work" only means
  something once you specify *for which country*.
- **Country-specific backend/OMS**, where order routing, payment
  method availability, and language differ per market.
- **Platform team**, owning the shared codebase (React Native/Flutter)
  that all countries build from — the source of both efficiency (one
  codebase) and risk (one bug ships to every country at once).

## Feature Parity and Platform Migration

A platform rewrite (Flutter → React Native, or any similar migration)
is a QA activity in its own right, distinct from testing a single new
feature: the deliverable is "the new platform does everything the old
one did," which means the test basis is the *old platform's actual
behavior*, not the new platform's spec (specs drift from reality; the
old app is the ground truth). **Real risk pattern**: a feature
implemented as a quick native-module shortcut on the old platform gets
silently dropped in the rewrite because it was never in the shared
design doc, only in the old code. A feature-parity test matrix is built
by walking the OLD app screen by screen, not by reading a requirements
document.

## Country-Specific Behavior

The same binary, five different real-world behaviors:

| Concern | Real risk |
|---|---|
| Payment methods | A payment method valid in Country A wrongly offered (or wrongly hidden) in Country B — both directions are bugs |
| OMS/order routing | Order-fulfillment logic that branches per country is an easy place for a country flag to be read from the wrong config |
| Language/localization | Translated strings are usually longer than source-language strings — UI must handle overflow/truncation, not just the happy-path language |
| Currency/date/number formatting | A date or amount rendered in the wrong locale format is a correctness bug (a user could misread `03/04` as March 4 or April 3), not a cosmetic one |
| Legal/regulatory content | Terms-of-service, tax-display rules, and similar country-mandated content differ — missing this is a compliance risk, not just a QA miss |

## Test Data and Country Toggling

The practical mechanic behind all of the above: a test suite for this
domain needs to run the *same* test case under multiple country
configurations, asserting different expected values per country — the
test logic doesn't change, the expected-data fixture does. This is the
same principle as this repository's own `shared/test-data/` fixtures
(`auth-users.json`, `products.json`) parameterizing real test runs,
scaled up to "one fixture set per country" instead of one global
fixture set.

## Visual / Pixel-Perfect Comparison Across Locales

The same screen renders correctly in one locale and breaks in another
(longer strings, right-to-left layouts) — this is why Figma-vs-build
comparison and pixel-perfect diffing were real, professional QA tools
in this exact context (`pro.mobile.defacto-like`). The closest
executable analog in this repository is
`QA-DEMO-SYSTEM/web-tests/tests/visual-regression.spec.js` (Playwright
`toHaveScreenshot`, with the deliberate controlled-failure/negative-
control tests proving the tolerance actually catches a real change —
see `.ai/TEST-STATUS.md`) — the same underlying technique, applied to
one locale here rather than several.

## Accessibility Considerations

Localization and accessibility interact in ways easy to miss: a
translated string that overflows its container can also break a
screen-reader's expected reading order, and RTL layouts need their own
accessibility pass (tab order, focus order) distinct from the LTR
baseline. `QA-DEMO-SYSTEM/web-tests/tests/accessibility.spec.js`'s
axe-core-based approach (`04-TOOLS-AND-TECH/10-VISUAL-AND-DESIGN/README.md`'s
sibling accessibility coverage) is the same category of tooling this
domain would need per-locale, not a one-time single-language check.

## Release and Production Validation

A multi-country release is rarely a single "ship to everyone" event —
staged rollout per country/region is common specifically so a
country-specific bug (a payment method misconfigured for one market)
has a blast radius of one country, not five. Production validation
after a staged release needs country-scoped smoke tests, not one
global smoke test.

## Mobile Automation Strategy for This Domain

Device-matrix testing (`02-FULL-STACK-QA-HANDBOOK/09-MOBILE-QA/README.md`)
gets a second dimension here: device × country. A device-farm approach
(BrowserStack App Automate, Firebase Test Lab) is the practical way to
avoid multiplying physical devices by five countries' worth of
locale/region settings — this is a real, disclosed automation-strategy
gap in this repository (no device farm access here), not a
professional-experience claim.

## Appium: Professional Execution vs. From-Scratch Framework

Kept deliberately distinct, per the Digital Twin's own three-dimension
model: real professional Appium execution and result analysis exists
(`pro.mobile.defacto-like`, `pro.fintech.stablex-like`); authoring an
Appium automation framework from scratch, professionally, does not —
see `01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml#gap.appium.framework-from-scratch`.
This page does not blur that line to make the domain sound more
executable than it is.

## Interview Scenarios

- "How do you test feature parity during a platform migration?" → walk
  the OLD app's real behavior screen by screen as the test basis, not
  the new platform's spec document (specs drift; the running app
  doesn't lie).
- "A payment method shows in the wrong country — how would this bug
  typically originate?" → a country-flag/config read from the wrong
  source, or a fallback/default rule that silently applies globally —
  start by tracing where the country context is actually set, not by
  guessing at the payment logic itself.
- "How do you keep a visual regression suite from becoming five times
  the maintenance burden across five countries?" → parameterize the
  fixture data (country config), not the test logic — same test file,
  different expected-value inputs, matching this repository's own
  `shared/test-data/` pattern.

## Related System Patterns

`22-SYSTEM-PATTERNS/AUTHENTICATION.md`, `AUTHORIZATION.md`, `PAYMENT.md`
— all apply per-country with country-specific variation layered on top
(a payment method that's a `PAYMENT.md`-style deterministic-token flow
in one country might be an entirely different integration in another).

## Related Tools

`04-TOOLS-AND-TECH/10-VISUAL-AND-DESIGN/` (Figma comparison, Python
visual diff — real professional tools in this exact context),
`04-TOOLS-AND-TECH/03-MOBILE-AUTOMATION/` (Appium).

## Executable Scope

**Not yet built.** A real lab for this domain would parameterize
`QA-DEMO-SYSTEM`'s existing order/payment/visual-regression tests by a
`country` fixture dimension — a concrete, scoped extension of
already-working infrastructure, not a new system. Tracked here as a
real next step rather than invented as already done.
