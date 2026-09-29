# E-Commerce — Test Strategy

## What's actually tested, by layer

- **API (REST + GraphQL):** `graphql.test.js`,
  `graphql-websocket-notification.test.js` — both transports tested
  independently, including a REST-path regression lock so the GraphQL
  addition couldn't silently break REST.
- **Database:** `database-testing.test.js` — SELECT/WHERE/JOIN, CRUD
  lifecycle, financial SUM cross-check, orphan-row checks.
- **Concurrency:** `order-concurrency.test.js` — real simultaneous
  HTTP requests, not sequential retries.
- **Web UI:** Playwright — functional, visual regression, accessibility,
  UI-to-DB validation (`web-tests/tests/`).
- **Security:** `security.test.js` — IDOR/BOLA, XSS/SQLi-oriented,
  mass assignment.
- **Performance:** JMeter (deterministic fail-gate), Locust (real load
  run — 549 requests, 0 failures, 22 real orders placed).

## Explicit scope boundary

No cart/checkout UI exists to test (frontend has no such flow). No
returns/refunds UI or backend logic exists. These are documented gaps,
not silently assumed coverage.
