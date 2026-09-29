# Property-Based & Fuzz Testing Lab

Part of `automation-labs`. This lab proves two related QA techniques:
generative, invariant-driven property-based testing (against REAL,
unmodified backend service functions), and hostile-input fuzz testing
(against the REAL, running backend API).

## Scope boundary — read this first

`lib/property-testing.js` is a real, hand-rolled generator/runner/
shrinker — not a wrapper around fast-check/jsverify (this repository
avoids dependency bloat and prefers building/understanding the
technique over a black-box library). It is not a claim of matching a
mature library's feature set (no combinators beyond `int`/`oneOf`/
`arrayOf`, no automatic type-driven generation) — it is deliberately
scoped to demonstrate the core technique correctly: seeded
reproducibility, and shrinking to a minimal counterexample.

`lib/fuzz-generators.js` produces fixed, disclosed hostile-value sets —
never true randomness — so any discovered failure is reproducible on
the next run. This is a QA **technique** demonstration (structured
fuzzing of real HTTP input validation), not a claim of production-grade
fuzzing infrastructure (no AFL/libFuzzer/coverage-guided mutation).

**Both target real, unmodified production code** — `products-service-
properties.test.js` exercises `backend/src/services/products.service.js`
directly (via a real in-memory SQLite db, same schema and code path as
production), and `api-fuzz.test.js` sends real HTTP requests to the
real, running backend.

## A real bug this lab found and fixed

Fuzzing the real backend found a genuine bug: an oversized request body
(over Express's default 100kb limit) threw a `PayloadTooLargeError` that
`backend/src/middleware/errorHandler.js`'s `jsonParseErrorHandler` did
not check for, so it fell through to a raw 500 instead of the correct
413. Fixed at the root cause — see `COMMON-MISTAKES.md` in this area's
handbook docs for the full story.

## Running

From `QA-DEMO-SYSTEM/automation-labs/`:

```bash
npm run property-fuzz:test:unit   # property-testing framework + real backend product-service properties — no server needed
npm run property-fuzz:test        # aggregate runner (run-property-and-fuzz-lab.js) — CI entry point
```

The aggregate runner always runs the property-based tests first (no
server needed — they use an in-memory database). It then checks
whether a backend is reachable at `QA_DEMO_BASE_URL` (default
`http://127.0.0.1:3000`) and, if so, also runs the real-API fuzz tests.
If not, it reports `PROPERTY_FUZZ_LAB_FUZZ: NOT_EXECUTED` explicitly —
never a silent skip.

To exercise the full lab locally:
```bash
# from QA-DEMO-SYSTEM/
npm run db:seed
node backend/src/server.js &
QA_DEMO_BASE_URL=http://127.0.0.1:3000 npm run property-fuzz:test --workspace automation-labs
```

## What each file proves

| File | QA technique |
|---|---|
| `lib/property-testing.js` | The generator/runner/shrinker machinery itself — seeded PRNG, `forAll`, integer/array generators, integer/array shrinkers |
| `tests/property-testing-framework.test.js` | The framework's own correctness — reproducibility, a true property genuinely passing, a false property being caught, and shrinking converging to the EXACT minimal counterexample (a real bug in the shrink-step budget was found and fixed here) |
| `tests/products-service-properties.test.js` | Real property tests against `backend/src/services/products.service.js`'s real, unmodified `getProductById`/`listProducts`, via a real in-memory SQLite db |
| `lib/fuzz-generators.js` | Deterministic malformed-JSON and hostile-value generators for login and orders payloads |
| `tests/api-fuzz.test.js` | Real fuzz testing against the live backend — malformed JSON, hostile field types/values, and a post-fuzz health check proving the server never crashed |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for
the competencies this lab backs. `professional: {status: NONE}` unless
independently proven otherwise.
