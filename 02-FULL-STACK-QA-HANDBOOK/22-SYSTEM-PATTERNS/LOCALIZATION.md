# Pattern: Localization

## How it works

User-facing content (strings, dates, numbers, currency) is rendered
according to the user's locale rather than hardcoded to one
language/region — typically via a translation-key lookup plus
locale-aware formatting, not string concatenation.

## Why systems use it

Any product serving more than one language/region needs this as
infrastructure, not as a per-screen afterthought — retrofitting it
onto a codebase that hardcoded English strings throughout is
significantly more expensive than designing for it from the start.

## Status in this repository

**Not implemented at the application level; documented in depth as
domain knowledge.** `QA-DEMO-SYSTEM`'s frontend and API responses are
English-only, hardcoded (`Order #123 payment approved.` in
`notifications.service.js`, for one real example). The QA-methodology
depth this pattern needs is instead covered where a real professional
anchor exists:
`03-DOMAINS/04-MOBILE-DIGITAL-PLATFORMS/README.md`'s Country-Specific
Behavior and Test Data/Country-Toggling sections, grounded in real
professional experience (`pro.mobile.defacto-like`). This page is the
general pattern-level summary; that domain page is the deeper,
professionally-grounded treatment — kept separate per "one fact, one
owner."

## QA Risks

- **String concatenation instead of templated translation**: building
  a sentence by concatenating translated fragments breaks the moment
  a language's grammar reorders those fragments differently than the
  source language does — template-based translation (`{0} paid {1}` )
  avoids this; concatenation doesn't.
- **Hardcoded pluralization rules**: "1 item" / "2 items" English
  pluralization logic doesn't generalize — many languages have more
  than two plural forms, and a translation system that only supports
  singular/plural will produce grammatically wrong output for those
  languages.
- **Overflow/truncation**: translated strings are usually longer than
  source-language strings (see
  `03-DOMAINS/04-MOBILE-DIGITAL-PLATFORMS/README.md`) — a UI that
  wasn't tested with real translated content only discovers this in
  production.
- **Untranslated fallback leakage**: a missing translation key silently
  falling back to a raw key name (`error.payment.declined`) shown to
  an end user, instead of at minimum falling back to a default
  language's real text.

## Test Strategy

**Positive:** each supported locale renders correctly with real
(not lorem-ipsum) translated content. **Negative:** a missing
translation key falls back sensibly, not to a raw key or blank space.
**Edge:** pseudo-localization (deliberately over-long, accented test
strings used specifically to surface overflow/truncation bugs before
real translations exist), right-to-left layout if any supported locale
requires it.

## Related System Patterns

None of the other 21 patterns directly, but localization QA compounds
with `PAGINATION.md`/`CACHE.md` (a locale-specific cache key or sort
order is a real, easy-to-miss combination bug).

## Related Domains

Mobile / Multi-Country (the real, professionally-grounded treatment of
this pattern in this repository).
