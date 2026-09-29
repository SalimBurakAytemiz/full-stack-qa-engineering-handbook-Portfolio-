# Property-Based & Fuzz Testing Lab — Execution Evidence

**Date:** 2026-09-29
**Environment:** sandbox container.

## Run 1 — property tests only, no backend running

**Command:** `node property-and-fuzz-testing/run-property-and-fuzz-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`), backend confirmed down.

**Result:**
```
1..12 (6 framework meta-tests + 6 real product-service property tests)
# pass 12, fail 0
PROPERTY_FUZZ_LAB_FUZZ: NOT_EXECUTED — no backend reachable at http://127.0.0.1:3000
PROPERTY_FUZZ_LAB_STATUS: PARTIAL_EXECUTED
```
Exit code `0`.

## Run 2 — full lab, real backend running

**Command:**
```bash
# from QA-DEMO-SYSTEM/
rm -f backend/data/qa-demo.db
npm run db:seed
node backend/src/server.js &   # confirmed healthy via /api/health
QA_DEMO_BASE_URL=http://127.0.0.1:3000 node automation-labs/property-and-fuzz-testing/run-property-and-fuzz-lab.js
```

**Result:** 12 property tests + 4 fuzz tests, all pass.
`PROPERTY_FUZZ_LAB_STATUS: EXECUTED`, exit code `0`.

## A real backend bug found and fixed during this run

The very first run of `api-fuzz.test.js` against the real backend
**genuinely failed** (2 of 4 tests): a 200,000-character hostile string
value used as a login `email` field, and the same value used as an
orders `payment_token`, both returned `500 {"error":"Sunucu hatası"}`
instead of a real 4xx.

**Root cause, found by direct reproduction** (not guessed): Express's
`express.json()` defaults to a 100KB body-size limit. A payload over
that limit throws a `PayloadTooLargeError` with `err.type ===
'entity.too.large'` — a distinct error type from the JSON-parse-failure
case (`entity.parse.failed`) that `backend/src/middleware/
errorHandler.js`'s `jsonParseErrorHandler` already handled. The
oversized-payload case fell through, unhandled, to the generic 500
handler.

**Fix:** added an explicit `entity.too.large` branch to
`jsonParseErrorHandler`, returning `413 {"error": "İstek gövdesi çok
büyük"}` — the same "client payload error → real 4xx, not a 500"
treatment already applied to the parse-failure case, at the same code
location, same pattern. See `COMMON-MISTAKES.md` in this area's
handbook docs for the full narrative.

**Verification after the fix:**
- `npm test --workspace backend`: 160/160 still pass (no regression).
- The fuzz suite re-run against a freshly restarted backend: 4/4 pass,
  with the two previously-500 cases now correctly returning 413.

## Scope and honesty notes

- `products-service-properties.test.js` exercises
  `backend/src/services/products.service.js`'s real, unmodified
  `getProductById`/`listProducts` functions directly, via a real
  in-memory SQLite database created with the backend's own
  `getDatabase(':memory:')` — same schema, same code path as
  production, not a reimplementation.
- `api-fuzz.test.js` is genuine integration testing against the real,
  running backend — the 413 finding above is real, not staged.
- Not yet CI-verified as of this file's writing — CI wiring is a
  separate, explicitly tracked step.
