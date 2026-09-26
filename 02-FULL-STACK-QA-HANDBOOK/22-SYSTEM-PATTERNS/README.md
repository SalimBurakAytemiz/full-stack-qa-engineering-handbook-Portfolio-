# System Patterns

Reusable, cross-domain patterns every backend system relies on. Each is
documented once here — domains and labs link to it rather than
re-explaining it, per the "one fact, one owner" rule.

## Status

All 23 patterns in the master taxonomy now have real, substantive
documentation — none is a heading, a TODO, or a shallow stub. Depth
still varies honestly: 9 patterns are backed by real, executable
evidence in this repository (marked IMPLEMENTED below); the remaining
14 are real QA knowledge for patterns this repository's own
`QA-DEMO-SYSTEM` does not implement, each explicitly stating that and
grounding its risk/test-strategy content in transferable methodology
rather than fabricated evidence.

| Pattern | Status | Real evidence in this repo |
|---|---|---|
| [Authentication](AUTHENTICATION.md) | IMPLEMENTED | `QA-DEMO-SYSTEM/backend/src/services/auth.service.js`, security.test.js |
| [Authorization](AUTHORIZATION.md) | IMPLEMENTED | GraphQL `requireUserId`, REST `resolveSession`, IDOR/BOLA tests |
| [Idempotency](IDEMPOTENCY.md) | IMPLEMENTED | orders.service.js transaction, events.service.js dedup |
| [Concurrency](CONCURRENCY.md) | IMPLEMENTED | order-concurrency.test.js (2-way/5-way race) |
| [Payment](PAYMENT.md) | IMPLEMENTED | payment.service.js (deterministic fake tokens) |
| [Notification](NOTIFICATION.md) | IMPLEMENTED | notifications.service.js, WebSocket push |
| [Async Events](ASYNC-EVENTS.md) | IMPLEMENTED | events.service.js, websocket-events-advanced.test.js |
| [Retry](RETRY.md) | IMPLEMENTED | JMeter/Selenium CI retry policy, N4 fail-safe pattern |
| [State Machine](STATE-MACHINE.md) | IMPLEMENTED | orders.status transitions (the general technique behind Payment/Idempotency above) |
| [Rate Limiting](RATE-LIMITING.md) | NOT_IMPLEMENTED | Real, stated gap — verified no rate-limiting middleware exists |
| [Search](SEARCH.md) | NOT_IMPLEMENTED | No query/filter parameter on any endpoint — verified |
| [Pagination](PAGINATION.md) | NOT_IMPLEMENTED | `GET /api/products` returns the full unpaginated list — verified |
| [File Upload](FILE-UPLOAD.md) | NOT_IMPLEMENTED | API surface is entirely JSON, no multipart endpoint — verified |
| [Import / Export](IMPORT-EXPORT.md) | NOT_IMPLEMENTED | No bulk import/export endpoint — verified |
| [Timeout](TIMEOUT.md) | NOT_APPLICABLE (no real dependency) | No outbound third-party call exists in this repo's executable scope |
| [Cache](CACHE.md) | NOT_IMPLEMENTED | Every product read hits SQLite directly — verified |
| [Audit Log](AUDIT-LOG.md) | NOT_IMPLEMENTED | The `events` table is structurally similar but serves notifications, not compliance auditing — see the page's own honest distinction |
| [Webhook](WEBHOOK.md) | NOT_IMPLEMENTED | No outbound webhook or inbound receiver endpoint exists |
| [Third-Party Integration](THIRD-PARTY-INTEGRATION.md) | MODELED SYNTHETICALLY | payment.service.js's deterministic fake-token design is the real, deliberate example |
| [Scheduled Jobs](SCHEDULED-JOBS.md) | NOT_IMPLEMENTED | No cron/scheduled job exists — every code path is request-triggered |
| [Feature Flags](FEATURE-FLAGS.md) | NOT_IMPLEMENTED | Tracked as `gap.release.feature-flags` |
| [Localization](LOCALIZATION.md) | NOT_IMPLEMENTED at app level | Real professional-grounded treatment lives in `03-DOMAINS/04-MOBILE-DIGITAL-PLATFORMS/` instead |
| [Multi-Tenancy](MULTI-TENANCY.md) | NOT_IMPLEMENTED | Single-tenant by design — no tenant concept exists |

## Structure used per pattern

How it works · Why systems use it · Status in this repository · QA
risks · Failure behavior (where relevant) · Test strategy
(positive/negative/edge) · Security implications · Performance
implications · Observability (where relevant) · Related system
patterns · Related domains.

## Why the NOT_IMPLEMENTED patterns are still worth documenting in depth

A pattern this repository doesn't implement is still real QA knowledge
a Full Stack QA Engineer needs — and several of them (Search, Cache,
Multi-Tenancy) directly generalize a risk category this repository
*does* implement and test for a narrower case (IDOR/BOLA in
`AUTHORIZATION.md` generalizes directly to Multi-Tenancy's
cross-tenant leakage risk, for instance). Each page states its
NOT_IMPLEMENTED status plainly rather than implying repository
evidence that doesn't exist — the same discipline this repository
applies everywhere claim-integrity matters.
