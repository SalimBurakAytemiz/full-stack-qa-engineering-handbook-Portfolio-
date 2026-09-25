# API & Contract Tools

## Postman / Newman / AJV / JSON Schema (T4 CI_VERIFIED)

**Concepts:** Postman authors a request collection manually or via
scripting; Newman runs that same collection headlessly (in CI, no
GUI); AJV validates a JSON response against a JSON Schema
programmatically — the three compose into a contract-testing pipeline
where the schema is the actual assertion, not a human eyeballing a
response body.

**Setup in this repository:** `QA-DEMO-SYSTEM/api-tests/` — collections
under `collections/`, schemas under `../shared/schemas/`, Node wrapper
scripts that run Newman then AJV-validate each response.

**QA use cases:** contract regression (does the API still return the
shape consumers depend on), negative/positive schema proof
(`schema-negative-proof.js` — LOCAL/STATIC, deliberately doesn't hit a
live server, to prove the schema itself rejects invalid shapes
independent of server behavior), live end-to-end validation against a
running, freshly-seeded server (5 of 6 suites in this repo).

**Common mistakes (real ones found in this repository's own history):**
conflating a schema's LOCAL/STATIC validation with LIVE execution
against a server (B9 finding, fixed); running suites back-to-back
without the required `db:seed` reset between them, producing a false
failure that looks like a regression but isn't (documented in Phase 19
evidence).

**Related labs:** `QA-DEMO-SYSTEM/api-tests/`.
**Related evidence:** `QA-DEMO-SYSTEM/evidence/P5-API-TESTING/`.

## GraphQL (protocol, not a tool — T4 CI_VERIFIED)

See `02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/` for GraphQL-specific
QA patterns (this repo's GraphQL layer reuses the same REST services —
no duplicated business logic between transports, tested explicitly via
a REST-path regression lock alongside every GraphQL test).

## Swagger/OpenAPI (T1 DOCUMENTED)

Referenced in professional context (FinTech case) but no OpenAPI spec
file exists in this repository's own API surface.
