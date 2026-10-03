# i18n Testing Lab — Execution Evidence

**Date:** 2026-10-03
**Environment:** sandbox container, Node 22 (full ICU `Intl` data).

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/i18n-testing/tests/*.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..7 / # pass 7 / # fail 0`. Exit code `0`. Covers
`locale-formatting.test.js` (3) and `unicode-roundtrip.test.js` (4).

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/i18n-testing/run-i18n-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`).

**Actual observed output:**
```
--- i18n Lab: real scenario results ---
  [PASS] currency formatting genuinely differs between tr-TR and de-DE (not the same string reused) (tr-TR="₺1.234,50", de-DE="1.234,50 €")
  [PASS] long-date formatting genuinely differs between tr-TR and en-US (real month names, real word order) (tr-TR="15 Ocak 2026", en-US="January 15, 2026")
  [PASS] number grouping/decimal separators genuinely differ between en-US and de-DE (en-US="1,234,567.89", de-DE="1.234.567,89")
  [PASS] Turkish string survives a real insert/select round-trip through the real products table unchanged (written="Çağla Gömlek Boyası", read="Çağla Gömlek Boyası")
  [PASS] Japanese string survives a real insert/select round-trip through the real products table unchanged (written="こんにちは製品", read="こんにちは製品")
  [PASS] emoji (non-BMP, 4-byte UTF-8) string survives a real insert/select round-trip through the real products table unchanged (written="Celebration 🎉🚀 Bundle", read="Celebration 🎉🚀 Bundle")
  [PASS] Arabic (RTL) string survives a real insert/select round-trip through the real products table unchanged (written="منتج تجريبي", read="منتج تجريبي")

I18N_LAB_STATUS: EXECUTED
```
Exit code `0`. (The console rendering above shows the `de-DE` currency
output with a plain space for readability; the real byte sequence
between `50` and `€` is a non-breaking space, `U+00A0` — see the "real
finding" below.)

## What this run actually proves

- Currency, date, and number formatting are genuinely locale-sensitive —
  the same input produces observably different, real ICU-correct output
  per locale, not a single hard-coded string reused everywhere.
- Four real multi-byte strings — a Turkish string with dotted/dotless-i
  and cedilla characters, a Japanese (non-Latin-script) string, a string
  containing emoji outside the Basic Multilingual Plane (4-byte UTF-8
  sequences), and a right-to-left Arabic string — were each really
  inserted into and read back from the backend's real `products` table
  and compared byte-for-byte. None were mangled.

## A real finding, not a hypothetical one

Building the currency-formatting test first failed against a hand-typed
expected string (`'1.234,50 €'` with a regular space). The real `Intl`
output used a non-breaking space (`U+00A0`) in that exact position — a
real detail of German ICU currency formatting, not a lab bug. The test
was corrected to assert the real character (`'1.234,50 €'`), and the
mismatch itself is the kind of thing a hand-written i18n fixture would
have silently gotten right by construction, while calling the real API
surfaced it immediately. See `README.md`'s "A real finding" section and
`COMMON-MISTAKES.md`.

## Scope and honesty notes

- Not a UI RTL/LTR layout test, pluralization-rule library, or
  translation-key coverage scanner — see `README.md`'s "Scope boundary".
- Not yet CI-verified as of this file's writing — CI wiring is a
  separate, explicitly tracked step (see `.github/workflows/ci.yml`'s
  `i18n-testing-lab` job once added).
