# System Patterns

Reusable, cross-domain patterns every backend system relies on. Each is
documented once here — domains and labs link to it rather than
re-explaining it, per the "one fact, one owner" rule.

## Status

All 23 patterns in the master taxonomy now have real, substantive
documentation — none is a heading, a TODO, or a shallow stub. Depth
still varies honestly, and the table below is the CURRENT rendering of
`shared/registry/catalog/patterns.yaml` (the canonical source — if the
two ever disagree, the YAML wins): **13 IMPLEMENTED** (backed by real,
executable evidence in this repository) and **10 NOT_IMPLEMENTED** (a
real, verified gap in this repository). 13 + 10 = 23.

Four of the 13 IMPLEMENTED patterns (Retry, Timeout, Feature Flags,
Multi-Tenancy — independent review finding F4) are implemented **only**
in an ISOLATED EXECUTABLE LAB under `QA-DEMO-SYSTEM/automation-labs/`,
never in the MAIN QA-DEMO BACKEND (`QA-DEMO-SYSTEM/backend/src`): the
main backend still has no retry mechanism, no outbound call to time
out, no feature-flag system, and remains single-tenant by design,
exactly as before. Each of those four rows' "Real evidence" column and
linked page state this scope distinction explicitly — do not read
IMPLEMENTED here as "the main demo backend gained this feature."

| Pattern | Status | Real evidence in this repo |
|---|---|---|
| [Authentication](AUTHENTICATION.md) | IMPLEMENTED | `QA-DEMO-SYSTEM/backend/src/services/auth.service.js`, security.test.js |
| [Authorization](AUTHORIZATION.md) | IMPLEMENTED | GraphQL `requireUserId`, REST `resolveSession`, IDOR/BOLA tests |
| [Idempotency](IDEMPOTENCY.md) | IMPLEMENTED | orders.service.js transaction, events.service.js dedup |
| [Concurrency](CONCURRENCY.md) | IMPLEMENTED | order-concurrency.test.js (2-way/5-way race) |
| [Payment](PAYMENT.md) | IMPLEMENTED | payment.service.js (deterministic fake tokens) |
| [Notification](NOTIFICATION.md) | IMPLEMENTED | notifications.service.js, WebSocket push |
| [Async Events](ASYNC-EVENTS.md) | IMPLEMENTED | events.service.js, websocket-events-advanced.test.js |
| [Retry](RETRY.md) | IMPLEMENTED (ISOLATED LAB only) | MAIN BACKEND (`backend/src`): no retry mechanism, unchanged. ISOLATED LAB: chaos-reliability's `lib/resilient-client.js` (bounded retry + backoff) and distributed-messaging's `lib/broker.js` (retry budget before dead-lettering), both CI-verified — see RETRY.md's "Related labs" section |
| [State Machine](STATE-MACHINE.md) | IMPLEMENTED | orders.status transitions (the general technique behind Payment/Idempotency above) |
| [Rate Limiting](RATE-LIMITING.md) | NOT_IMPLEMENTED | Real, stated gap — verified no rate-limiting middleware exists |
| [Search](SEARCH.md) | NOT_IMPLEMENTED | No query/filter parameter on any endpoint — verified |
| [Pagination](PAGINATION.md) | NOT_IMPLEMENTED | `GET /api/products` returns the full unpaginated list — verified |
| [File Upload](FILE-UPLOAD.md) | NOT_IMPLEMENTED | API surface is entirely JSON, no multipart endpoint — verified |
| [Import / Export](IMPORT-EXPORT.md) | NOT_IMPLEMENTED | No bulk import/export endpoint — verified |
| [Timeout](TIMEOUT.md) | IMPLEMENTED (ISOLATED LAB only) | MAIN BACKEND (`backend/src`): no outbound third-party call to time out, unchanged. ISOLATED LAB: chaos-reliability's `lib/resilient-client.js` (real per-call AbortController timeout) and production-verification's real `AbortSignal.timeout()` checks against the running backend, both CI-verified — see TIMEOUT.md's "Related labs" section |
| [Cache](CACHE.md) | NOT_IMPLEMENTED | Every product read hits SQLite directly — verified |
| [Audit Log](AUDIT-LOG.md) | NOT_IMPLEMENTED | The `events` table is structurally similar but serves notifications, not compliance auditing — see the page's own honest distinction |
| [Webhook](WEBHOOK.md) | NOT_IMPLEMENTED | No outbound webhook or inbound receiver endpoint exists |
| [Third-Party Integration](THIRD-PARTY-INTEGRATION.md) | IMPLEMENTED | payment.service.js's deterministic fake-token design is a real, deliberate synthetic integration point |
| [Scheduled Jobs](SCHEDULED-JOBS.md) | NOT_IMPLEMENTED | No cron/scheduled job exists — every code path is request-triggered |
| [Feature Flags](FEATURE-FLAGS.md) | IMPLEMENTED (ISOLATED LAB only) | MAIN BACKEND (`backend/src`): no feature-flag system, unchanged (`gap.release.feature-flags` remains a real main-backend gap). ISOLATED LAB: feature-flags lab's `lib/flag-evaluator.js` (deterministic hash rollout, allowList/denyList, segment targeting), CI-verified — see FEATURE-FLAGS.md's "Related labs" section |
| [Localization](LOCALIZATION.md) | NOT_IMPLEMENTED at app level | Real professional-grounded treatment lives in `03-DOMAINS/04-MOBILE-DIGITAL-PLATFORMS/` instead |
| [Multi-Tenancy](MULTI-TENANCY.md) | IMPLEMENTED (ISOLATED LAB only) | MAIN BACKEND (`backend/src`): single-tenant by design, no tenant concept, unchanged. ISOLATED LAB: multi-tenancy-isolation lab's `lib/tenant-scoped-repository.js` (real tenant-scoped CRUD isolation + a deliberately unsafe comparison repository proving a real cross-tenant leak), CI-verified — see MULTI-TENANCY.md's "Related labs" section |

## Structure used per pattern

How it works · Why systems use it · Status in this repository · QA
risks · Failure behavior (where relevant) · Test strategy
(positive/negative/edge) · Security implications · Performance
implications · Observability (where relevant) · Related system
patterns · Related domains.

## Why the NOT_IMPLEMENTED patterns are still worth documenting in depth

A pattern the MAIN QA-DEMO BACKEND doesn't implement is still real QA
knowledge a Full Stack QA Engineer needs — and several of them
(Search, Cache) directly generalize a risk category this repository
*does* implement and test for a narrower case (IDOR/BOLA in
`AUTHORIZATION.md` generalizes directly to Multi-Tenancy's
cross-tenant leakage risk, which the multi-tenancy-isolation ISOLATED
LAB now also exercises directly — see the table above). Each
NOT_IMPLEMENTED page states that status plainly rather than implying
repository evidence that doesn't exist — the same discipline this
repository applies everywhere claim-integrity matters.
