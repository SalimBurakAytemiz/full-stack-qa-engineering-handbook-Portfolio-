# E-Commerce — QA Risk Catalog

| Risk | Real finding in this repository? | Where |
|---|---|---|
| Overselling (two orders win the last unit) | Yes — found and fixed (B8) | `evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-5-B8-B9-consistency.md` |
| GraphQL mutation bypassing a REST-only side effect | Yes — found and fixed (B1: GraphQL `createOrder` never pushed the WebSocket notification REST did) | `evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-1-B1-B7.md` |
| Cross-user notification leakage | Tested, not found (isolation holds) | `graphql-websocket-notification.test.js` |
| Payment-token value reflected in raw error response | Found, verified non-exploitable end-to-end, documented as hardening note | Phase 11 evidence |
| Order total mismatch between API and DB | Tested, not found | `database-testing.test.js` |
| Malformed request crashing the access-log middleware | Yes — found and fixed (N4: `decodeURIComponent` unguarded) | `evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-9-N4-malformed-query-regression.md` |

This table intentionally lists real historical findings, not a
generic risk list — every row is traceable to an actual test and,
where applicable, an actual fix commit.
