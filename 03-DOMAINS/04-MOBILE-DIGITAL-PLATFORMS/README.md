# Domain: Mobile / Digital Platforms — Multi-Country & Localization

**Maturity:** D1 DOCUMENTED.

## QA risk catalog (multi-country mobile)

| Risk | Why it matters |
|---|---|
| Feature drift between platform rewrites | A migration (e.g. Flutter → React Native) can silently drop a feature present on the old stack |
| Localization string overflow/truncation | Translated strings are often longer than the source language; UI must handle it, not just the happy-path language |
| Country-specific payment method missing/misrouted | A payment method valid in one country wrongly offered (or wrongly hidden) in another |
| Country-specific OMS integration mismatch | Order routing logic that differs per country is a common, easy-to-miss regression source |
| Locale-dependent date/number formatting | A date/amount rendered in the wrong locale format is a correctness bug, not cosmetic |
| Visual regression across countries | The same screen can render correctly in one locale and break in another (longer strings, RTL layouts) |

## Testing approach

Figma-vs-build comparison and pixel-perfect screenshot diffing (see
`02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/` — visual regression is
covered as part of the E-Commerce domain's real Playwright
`visual-regression.spec.js`, the closest executable analog in this
repository; no dedicated multi-country lab exists here).

## Professional context

Real (sanitized) professional experience in this domain:
`01-SALIM-BURAK-DIGITAL-TWIN/registry/professional-experience.yaml#pro.mobile.defacto-like`.
