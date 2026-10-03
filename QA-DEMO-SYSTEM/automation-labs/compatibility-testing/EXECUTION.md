# Compatibility Testing Lab — Execution Evidence

**Date:** 2026-10-02
**Environment:** sandbox container.

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/compatibility-testing/tests/compatibility-check.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..4 / # pass 4 / # fail 0`. Exit code `0`.

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/compatibility-testing/run-compatibility-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`).

**Actual observed output:**
```
--- Compatibility Testing Lab: real scenario results ---
  [PASS] the real current GET /api/products response is compatible with the frozen baseline contract (classification=NO_CHANGE)
  [PASS] a simulated removed required field ("in_stock") is detected as BREAKING (classification=BREAKING, errors=["must have required property 'in_stock'"])
  [PASS] a simulated field type change ("price" number -> string) is detected as BREAKING (classification=BREAKING, errors=["must be number"])
  [PASS] a simulated new field ("currency") is detected as SAFE_ADDITIVE, not falsely flagged as breaking (classification=SAFE_ADDITIVE, additiveFields=["products[].currency"])

COMPATIBILITY_LAB_STATUS: EXECUTED
```
Exit code `0`. (A `node:sqlite` experimental-feature warning prints on
stderr from the backend's real SQLite module — expected, not an error.)

## What this run actually proves

- The real backend's real current response shape (fetched by actually
  calling `listProducts()` against a real seeded in-memory db, not a
  fixture) is still compatible with the frozen baseline contract —
  `classification=NO_CHANGE`, no drift from what a prior consumer was
  built against.
- Three deliberately mutated candidates, each built from that same real
  response, were run through the exact same checker:
  - Removing `in_stock` → real AJV `required` violation → `BREAKING`.
  - Changing `price` from a number to a string → real AJV `type`
    violation → `BREAKING`.
  - Adding a new `currency` field → no AJV violation, but a real detected
    extra key → `SAFE_ADDITIVE`, correctly NOT flagged as breaking.
- The distinction between "breaking" and "safe additive" is not asserted
  from a diagram — it is the real, observed output of running the same
  function against three different real inputs.

## Scope and honesty notes

- Covers exactly one real endpoint shape (`GET /api/products`); see
  `README.md`'s "Scope boundary" section for what is deliberately out of
  scope (arbitrary OpenAPI diffing, advanced JSON Schema keywords).
- Not yet CI-verified as of this file's writing — CI wiring is a separate,
  explicitly tracked step (see `.github/workflows/ci.yml`'s
  `compatibility-testing-lab` job once added).
