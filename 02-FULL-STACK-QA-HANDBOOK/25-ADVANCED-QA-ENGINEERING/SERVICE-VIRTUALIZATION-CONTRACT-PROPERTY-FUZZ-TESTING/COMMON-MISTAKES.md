# Common Mistakes (Real Ones, From Building These Labs)

Every item below is a real bug — two in this milestone's own new code,
and one in QA-DEMO-SYSTEM's real backend — found by actually running
the tests and fixed at the root cause, not by inspection.

## 1. A real backend bug: oversized request bodies crashed into a 500 instead of a 413

Fuzzing the live backend's login and orders endpoints found a genuine
failure: a 200,000-character hostile string value returned
`500 {"error":"Sunucu hatası"}`. Direct reproduction (a plain `fetch`
call with the same oversized body, isolated from the rest of the fuzz
suite) confirmed the exact cause: Express's `express.json()` defaults
to a 100KB body-size limit, and a payload over that limit throws a
`PayloadTooLargeError` with `err.type === 'entity.too.large'` — a
distinct error type from the JSON-parse-failure case
(`entity.parse.failed`) that `backend/src/middleware/errorHandler.js`'s
`jsonParseErrorHandler` already handled correctly. The oversized-body
case simply wasn't checked for, so it fell through to the generic 500
handler.

**Fix:** added an explicit `entity.too.large` branch, returning
`413 {"error": "İstek gövdesi çok büyük"}` — the exact same
"client-payload-error → real 4xx, never a 500" treatment already
applied one branch above it, for the parse-failure case. Verified: the
full backend regression suite (160/160) still passes after the fix,
and the fuzz suite, re-run against a freshly restarted backend, now
passes 4/4 with the two previously-500 cases correctly returning 413.

This is the clearest example in this entire Part 2 campaign of why
fuzz testing against a REAL running system — not a fixture — matters:
this bug existed in already-shipped, already-reviewed backend code
from Part 1, and nothing before this fuzz run had ever sent it a
request large enough to trigger it.

## 2. The property-testing framework's own shrinker didn't converge to the exact boundary

`property-testing-framework.test.js`'s shrinking test asserted that
shrinking a false property ("n <= 100") from a random large
counterexample would converge to exactly 101, the true minimal
counterexample. The first run of this test genuinely failed: shrinking
stopped at 129, not 101.

**Root cause:** the shrinker only tried binary-halving toward the
target (0). Halving from a value like 125 lands on 62 — which no
longer fails the property (62 ≤ 100) — so the shrink loop had nowhere
useful to go and gave up one step too early, at a value that still
overshot the real boundary. The default step budget (100) also wasn't
generous enough for a linear walk to close the remaining gap even
where one existed.

**Fix:** added a "decrement by one toward target" candidate to the
integer shrinker (so a binary jump that overshoots the boundary can
still be walked down to it one step at a time), and raised the default
`maxShrinkSteps` from 100 to 1000. Re-run: shrinking now reliably
converges to exactly 101 regardless of the starting counterexample's
magnitude.

## 3. Fuzz-test assertions initially didn't account for a legitimate, distinct status code

After fixing bug #1 above, the fuzz test's own assertions (written
before the fix existed) still only allowed `400`/`401` — so the
now-correct `413` responses caused the *test* to fail, even though the
backend was now behaving correctly. Updated the assertions to allow
`413` specifically for the oversized-value cases, with a comment
pointing at the real fix that made it the correct expected outcome —
not a loosened assertion hiding a gap, but the test catching up to a
genuinely fixed and more precise real behavior.

## What these three have in common

All three were found by running the actual tests and reading the
actual failure — a wrong status code, a wrong shrunk value, a stale
assertion — never by re-reading code and assuming it was correct. The
first one, in particular, is the entire point of this milestone: real
fuzz testing against a real system exists specifically to surface bugs
that inspection alone would never have found.
