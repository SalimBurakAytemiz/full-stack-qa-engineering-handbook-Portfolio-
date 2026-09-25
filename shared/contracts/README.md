# Shared Contracts Index (Section 27)

This is an index, not a duplicate contract store — "one fact, one owner"
means each contract's real definition stays where the code that enforces
it already lives, and this file only points there.

| Contract | Real definition | Consumer / validator |
|---|---|---|
| REST response shapes | `shared/schemas/{auth,common,health,notifications,orders,products}/*.schema.json` | AJV, wired into `QA-DEMO-SYSTEM/api-tests` (see `evidence.api-tests.newman-ajv-suite`) |
| GraphQL schema | `QA-DEMO-SYSTEM/backend/src/graphql/schema.js` | Backend GraphQL test suite (`QA-DEMO-SYSTEM/backend/tests`) |
| WebSocket events | `QA-DEMO-SYSTEM/backend/src/realtime/websocketServer.js` | Advanced WebSocket event test suite (Phase 6 evidence) |
| Domain events (order.paid, etc.) | `QA-DEMO-SYSTEM/backend/src/services/events.service.js` | Backend integration tests covering event emission |

## Why REST has JSON Schema files and GraphQL/WebSocket/Events don't

REST responses are validated against explicit JSON Schema files because
that is how Postman/Newman/AJV contract testing works (Section 27's REST
category). GraphQL's contract is its own schema language (already a
formal contract, enforced by the GraphQL execution engine itself); adding
a second, redundant JSON Schema layer on top of it would duplicate the
same fact in two places, which the registry's "one fact, one owner" rule
explicitly avoids. WebSocket/event payloads are validated by assertions
in the test suites that consume them rather than a standalone schema
file — there is no third-party contract-testing tool for them in this
repository's stack today (see `01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml`
for related tooling gaps such as Pact).
