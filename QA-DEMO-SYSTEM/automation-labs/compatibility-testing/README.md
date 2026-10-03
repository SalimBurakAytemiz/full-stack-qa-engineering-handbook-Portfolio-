# Compatibility Testing Lab

Real backward-compatibility / breaking-change detection for the backend's
`GET /api/products` response shape, using a frozen baseline JSON Schema
contract and a real AJV validator — plus a real demonstration that the
checker correctly tells a **breaking** change apart from a **safe,
additive** one.

## What this lab actually does

- `fixtures/baseline-schemas/products-list-response.schema.json` is a
  frozen snapshot of the real `backend/src/routes/products.routes.js`
  `GET /` response shape, as a committed contract a prior API consumer
  would have been built against.
- `lib/compatibility-check.js` validates a current response sample
  against that baseline with a real `Ajv` instance, then classifies the
  result:
  - **BREAKING** — AJV found a `required` or `type` violation: a field a
    consumer depended on is missing or changed shape.
  - **SAFE_ADDITIVE** — no violation, but the current sample has extra
    fields the baseline never declared (recursively walked, not just at
    the top level).
  - **NO_CHANGE** — no violation, no extra fields.
- `run-compatibility-lab.js` gets the **real current** response shape
  from the real backend service (`listProducts()` against a real
  in-memory SQLite db via the backend's own `getDatabase()` — not a
  hand-written fixture), confirms it is still compatible with the frozen
  baseline, then runs the checker against three **deliberately,
  explicitly labeled** mutated candidates (`lib/simulate-api-change.js`)
  to prove detection: a removed required field, a changed field type, and
  a newly added field — never presented as real future API changes, only
  as simulated inputs used to prove the detector detects.

## Scope boundary

This is not a generic schema-diffing engine and does not attempt to diff
arbitrary OpenAPI documents or handle every JSON Schema keyword (`enum`,
`oneOf`, format constraints, etc. are out of scope). It covers exactly one
real endpoint's exact real shape, which is enough to prove the real
mechanism — compile a baseline schema with AJV, classify `required`/`type`
violations as breaking, and recursively diff extra object keys as
additive — actually works against real code, not a diagram.

## Run it

```bash
# from QA-DEMO-SYSTEM/automation-labs/ — no backend server needed, in-process
node compatibility-testing/run-compatibility-lab.js
node --test compatibility-testing/tests/compatibility-check.test.js
```
