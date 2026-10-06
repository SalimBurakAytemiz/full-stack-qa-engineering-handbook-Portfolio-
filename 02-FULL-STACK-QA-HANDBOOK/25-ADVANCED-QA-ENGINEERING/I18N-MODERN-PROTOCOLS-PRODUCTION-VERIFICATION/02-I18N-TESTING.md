# Internationalization (i18n) Testing

## Two genuinely different concerns, often conflated

"i18n testing" is often treated as one vague bucket. This lab treats it
as two separate, independently testable mechanisms:

1. **Locale-aware formatting** — does a number, date, or currency value
   render correctly for a given locale's real conventions (decimal and
   grouping separators, currency symbol placement, calendar month
   names)?
2. **Unicode data integrity** — does a non-ASCII string survive being
   stored and retrieved unchanged, regardless of script or byte width?

A system can pass one and fail the other independently — a backend can
store Turkish text perfectly while a frontend formats dates in the
wrong order, or vice versa. Testing them as one blurred concept hides
which one actually broke.

## Locale-aware formatting: delegate to the real platform API, never hand-roll it

`lib/locale-formatting.js` is a thin wrapper around Node's own built-in
`Intl.NumberFormat` and `Intl.DateTimeFormat` — deliberately with no
hand-rolled formatting logic of its own. Locale-correct formatting is
exactly the kind of domain (decimal separators, currency symbol
spacing, month names in dozens of languages) a project should never
reimplement; the real skill is calling the real platform API correctly
and verifying its real output, not reinventing it.

### A real finding this exposed

A first draft of this lab's currency test hard-coded
`'1.234,50 €'` as the expected German-locale output, using a regular
space. It failed. The real `Intl.NumberFormat('de-DE', {style:
'currency', currency: 'EUR'})` output uses a **non-breaking space**
(`U+00A0`) in that exact position — a real detail of German ICU
currency formatting. The test was corrected to assert the real
character (`'1.234,50 €'`). This is the actual value of testing
against the real API instead of a hand-maintained fixture: a fixture
would have been written to match whatever the author assumed was
correct and would never have caught this; calling the real `Intl` API
surfaced the real behavior immediately.

## Unicode data integrity: prove it with real multi-byte data, not ASCII

`lib/unicode-roundtrip.js` writes a real row into the backend's real
`products` table (via the same `getDatabase()` the backend itself uses)
and reads it back through the real `getProductById()` service function,
asserting byte-for-byte equality. The lab runs this with four
deliberately varied real strings — Turkish (dotted/dotless-i and
cedilla characters), Japanese (a non-Latin script), an emoji (characters
outside the Basic Multilingual Plane, meaning a 4-byte UTF-8 sequence
rather than 1–3 bytes), and Arabic (a right-to-left script) — because
each category stresses a different real failure mode: case-folding
rules, non-Latin collation, 4-byte-boundary truncation, and
bidirectional text handling, respectively. A round-trip test using only
ASCII or only one script would miss all of this.

## Scope boundary

This does not test a real UI's RTL/LTR layout, a pluralization-rule
library (`Intl.PluralRules`, ICU `MessageFormat`), or a
translation-key coverage scanner. It covers exactly the two mechanisms
above, each proven against a real platform API or a real storage layer
— never a hand-written fixture pretending to be formatted or stored
text.
