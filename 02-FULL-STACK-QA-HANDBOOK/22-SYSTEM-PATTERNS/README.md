# System Patterns

Reusable, cross-domain patterns every backend system relies on. Each is
documented once here — domains and labs link to it rather than
re-explaining it, per the "one fact, one owner" rule.

## Status

The master taxonomy lists 22 patterns. Nine have real, substantive
documentation below, each linked to real executable evidence in this
repository. The remaining thirteen are listed as `NOT YET WRITTEN`
rather than stubbed.

| Pattern | Status | Real evidence in this repo |
|---|---|---|
| [Authentication](AUTHENTICATION.md) | Written | `QA-DEMO-SYSTEM/backend/src/services/auth.service.js`, security.test.js |
| [Authorization](AUTHORIZATION.md) | Written | GraphQL `requireUserId`, REST `resolveSession`, IDOR/BOLA tests |
| [Idempotency](IDEMPOTENCY.md) | Written | orders.service.js transaction, events.service.js dedup |
| [Concurrency](CONCURRENCY.md) | Written | order-concurrency.test.js (2-way/5-way race) |
| [Payment](PAYMENT.md) | Written | payment.service.js (deterministic fake tokens) |
| [Notification](NOTIFICATION.md) | Written | notifications.service.js, WebSocket push |
| [Async Events](ASYNC-EVENTS.md) | Written | events.service.js, websocket-events-advanced.test.js |
| [Retry](RETRY.md) | Written | JMeter/Selenium CI retry policy, N4 fail-safe pattern |
| [Rate Limiting](RATE-LIMITING.md) | Written | Documented as NOT_IMPLEMENTED in this repo (real gap, stated honestly) |
| Search | NOT YET WRITTEN | — |
| Pagination | NOT YET WRITTEN | — |
| File Upload | NOT YET WRITTEN | — |
| Import/Export | NOT YET WRITTEN | — |
| Timeout | NOT YET WRITTEN | — |
| State Machine | NOT YET WRITTEN | (concept used in `PAYMENT.md`/order state, not yet its own page) |
| Cache | NOT YET WRITTEN | — |
| Audit Log | NOT YET WRITTEN | — |
| Webhook | NOT YET WRITTEN | — |
| Third-Party Integration | NOT YET WRITTEN | — |
| Scheduled Jobs | NOT YET WRITTEN | — |
| Feature Flags | NOT YET WRITTEN | — |
| Localization | NOT YET WRITTEN | — |
| Multi-Tenancy | NOT YET WRITTEN | — |

## Structure used per pattern

How it works · Why systems use it · QA risks · Failure behavior · Test
strategy (positive/negative/edge) · Security implications ·
Performance implications · Observability needs · Automation candidates
· Related domains · Related labs.
