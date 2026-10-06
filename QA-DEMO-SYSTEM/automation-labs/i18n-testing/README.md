# i18n Testing Lab

Real tests of two internationalization QA concerns: locale-aware
formatting and Unicode data integrity. Both use real mechanisms — Node's
own built-in `Intl` API (full ICU data) and the backend's own real
database/service layer — never a hand-written fixture pretending to be
formatted or stored text.

## What this lab actually does

- `lib/locale-formatting.js` wraps Node's real `Intl.NumberFormat` and
  `Intl.DateTimeFormat` for currency, date, and number formatting. There
  is no hand-rolled formatting logic here deliberately — locale-correct
  formatting (decimal/grouping separators, currency symbol placement and
  spacing, calendar month names) is exactly the kind of thing a project
  should never reimplement.
- `lib/unicode-roundtrip.js` writes a real row containing a multi-byte
  string into the real backend's `products` table (via the same
  `getDatabase()` the backend itself uses) and reads it back through the
  real `getProductById()` service function, asserting byte-for-byte
  equality — proving the real storage/retrieval path does not mangle
  non-ASCII text.
- `run-i18n-lab.js` runs both checks together: two locales' currency and
  date output are confirmed to genuinely differ (not the same string
  reused for every locale), and four real multi-byte strings (Turkish,
  Japanese, an emoji outside the Basic Multilingual Plane, and
  right-to-left Arabic) each round-trip through the real `products`
  table unchanged.

## A real finding from building this lab

German ICU currency formatting (`Intl.NumberFormat('de-DE', {style:
'currency', currency: 'EUR'})`) places a **non-breaking space**
(`U+00A0`), not a regular space, between the number and the `€` symbol.
A first draft of this lab's test hard-coded a regular space and failed
against the real `Intl` output — exactly the kind of mismatch a
hand-written i18n fixture would have hidden by construction, and that
calling the real API surfaces for free. See `COMMON-MISTAKES.md`.

## Scope boundary

This lab does not test a real UI's text direction (RTL/LTR layout),
pluralization-rule libraries (ICU `MessageFormat`/`Intl.PluralRules`),
or a translation-key coverage scanner — it covers exactly two real,
testable mechanisms: locale-correct formatting via Node's own `Intl`, and
Unicode data integrity through the backend's own real storage layer.

## Run it

```bash
# from QA-DEMO-SYSTEM/automation-labs/ — no backend server needed, in-process
node i18n-testing/run-i18n-lab.js
node --test i18n-testing/tests/*.test.js
```
