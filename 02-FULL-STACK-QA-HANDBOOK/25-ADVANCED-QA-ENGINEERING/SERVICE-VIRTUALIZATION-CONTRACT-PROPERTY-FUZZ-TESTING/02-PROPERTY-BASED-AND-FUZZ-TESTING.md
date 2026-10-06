# Property-Based & Fuzz Testing

**Executable evidence:**
`property-and-fuzz-testing/lib/property-testing.js`,
`property-and-fuzz-testing/lib/fuzz-generators.js`,
`property-and-fuzz-testing/tests/*.test.js`.

## Property-based testing: invariants, not examples

Example-based testing asserts "given this specific input, expect this
specific output." Property-based testing instead asserts an invariant
that must hold for a whole *class* of inputs — "for any valid product
set, `getProductById` never returns a record whose `id` doesn't match
what was asked for" — and generates many inputs to try to break it.

`lib/property-testing.js` is a real, hand-rolled implementation of the
core machinery:

- **A seeded PRNG** (`mulberry32`) — the same seed always produces the
  same sequence of generated inputs. This is the single most important
  practical property of a property-testing framework: a failure found
  in CI must be exactly reproducible locally, or it's nearly useless
  for debugging.
- **`forAll(generator, property, {seed, runs})`** — runs the property
  against many generated inputs, stopping at the first failure.
- **Shrinking** — once a failure is found, the framework doesn't just
  report the (possibly large, unreadable) input that happened to fail
  first; it searches for a smaller input that still fails. A property
  false for "n > 100" might first fail on a randomly-generated 8734 —
  shrinking narrows that down to the true boundary, 101, which is a
  far more useful bug report.

### A real bug in the framework itself, found by testing it

`tests/property-testing-framework.test.js`'s shrinking test initially
asserted the shrunk value would be exactly 101 and failed — the
default shrink-step budget (100) was too small for the binary-then-
linear shrink strategy to fully converge from a large starting
counterexample, so it stopped early at 129. Fixed by raising the
default budget and adding a single-step "decrement toward target"
candidate to the shrinker, guaranteeing convergence to the exact
boundary. See `COMMON-MISTAKES.md`.

### Applied to real backend code

`tests/products-service-properties.test.js` doesn't test a toy
example — it property-tests `backend/src/services/products.service.js`'s
real, unmodified `getProductById`/`listProducts` functions, using a
real in-memory SQLite database created via the backend's own
`getDatabase(':memory:')`. Six properties are checked, including one
deliberately-false claim about real product data, constructed to prove
the property suite would actually catch a real regression (the same
"prove the detector detects" discipline used throughout this
repository).

## Fuzz testing: hostile input against a real, running API

`lib/fuzz-generators.js` produces fixed, disclosed sets of malformed
JSON bodies and hostile field values (oversized strings, wrong types,
negative numbers, SQL/XSS-shaped strings, null bytes) — deterministic,
not random, so a discovered failure is reproducible.
`tests/api-fuzz.test.js` sends every one of them to the real, running
backend's `/api/auth/login` and `/api/orders` endpoints and checks the
one invariant that matters most: **the server must never crash into an
unhandled state** — always a real HTTP status and a well-formed JSON
body, never a raw 500 for input real validation should have caught.

### A real backend bug this fuzz run found and fixed

The very first run against the live backend genuinely failed: a
200,000-character hostile string value (used as both an `email` and a
`payment_token`) returned `500` instead of a real 4xx. Root cause,
found by direct reproduction: Express's default 100KB body-size limit
throws a `PayloadTooLargeError` with a different error type
(`entity.too.large`) than the JSON-parse-failure case the backend
already handled — so it fell through to the generic 500 handler. Fixed
in `backend/src/middleware/errorHandler.js` by adding the missing
branch, at the same location, following the exact same pattern already
used for the parse-failure case. Full narrative in `COMMON-MISTAKES.md`.

## What real property-based/fuzz tooling would add on top of this

A mature library (fast-check, QuickCheck, Hypothesis) offers far richer
generator combinators, automatic type-driven generation, and more
sophisticated shrinking strategies. Production fuzzing tooling
(AFL, libFuzzer, coverage-guided mutation) discovers hostile inputs
automatically by observing code-coverage feedback, rather than a fixed,
hand-picked value set. Neither is implemented here — this lab covers
the underlying technique both categories of tooling automate.
