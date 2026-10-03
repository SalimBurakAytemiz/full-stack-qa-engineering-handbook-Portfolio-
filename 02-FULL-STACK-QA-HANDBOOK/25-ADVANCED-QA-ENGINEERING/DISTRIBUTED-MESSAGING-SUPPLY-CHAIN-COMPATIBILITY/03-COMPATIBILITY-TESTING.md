# Compatibility (Backward-Compatibility) Testing QA

## Why this matters for QA

An API's contract is a promise to every existing consumer. Not every
change to a response shape is equally risky: adding a new field is almost
always safe (a well-behaved consumer ignores fields it doesn't know
about); removing a field or changing its type can break every consumer
that reads it. Compatibility testing's job is to tell these two kinds of
change apart automatically, against a frozen record of what the contract
used to be — not to re-review the diff by eye on every release.

## The mechanism: a frozen baseline, not a moving target

`fixtures/baseline-schemas/products-list-response.schema.json` is a
committed, frozen JSON Schema snapshot of the real
`backend/src/routes/products.routes.js` `GET /` response shape — what a
previously-shipped consumer was built against. It is **not** regenerated
from the current code on every run; if it were, the check could never
fail, because it would always be comparing the current shape against
itself. A baseline's value comes entirely from staying fixed while the
real implementation is free to change around it.

## Classifying a change: breaking vs. safe-additive

`lib/compatibility-check.js` validates a current response sample against
the frozen baseline with a real `Ajv` instance, then classifies the
result from AJV's real output:

- **BREAKING** — AJV reports a `required` violation (a field the baseline
  declared as required is missing) or a `type` violation (a field exists
  but its type changed). Either means an existing consumer that depended
  on that field can now fail.
- **SAFE_ADDITIVE** — AJV reports no violation, but a recursive walk of
  the current sample finds keys the baseline schema never declared. A
  well-behaved consumer ignores unknown fields, so this is backward
  compatible by definition — and is **not** flagged as breaking, which is
  exactly as important to prove as the breaking case: a checker that
  cries "breaking!" on every additive change trains its users to ignore
  it.
- **NO_CHANGE** — no violation, no extra keys.

## Proving the detector detects, not just describing it

This lab's aggregate runner does not stop at validating the real current
response (fetched from the real backend service, not a fixture) against
the baseline. It also runs the checker against three deliberately
constructed, clearly labeled candidates built from that same real
response (`lib/simulate-api-change.js`): one with a required field
removed, one with a field's type changed, and one with a brand-new field
added. The real, observed classifications were `BREAKING`, `BREAKING`,
and `SAFE_ADDITIVE` respectively — proof the distinction the checker
claims to make is the distinction it actually makes, run against real
code, not asserted from a description.

## Scope boundary

This is not a general-purpose OpenAPI diffing tool. It covers exactly one
real endpoint's exact real response shape, and does not attempt advanced
JSON Schema keywords (`enum`, `oneOf`, string `format` constraints,
nested `$ref`s). What it demonstrates is real and transferable: compiling
a frozen baseline with a real schema validator, treating `required`/`type`
violations as breaking and extra keys as additive, is the same mechanism
real contract-testing and OpenAPI-diff tools (`openapi-diff`,
`oasdiff`) use under the hood, scaled up to a full specification.
