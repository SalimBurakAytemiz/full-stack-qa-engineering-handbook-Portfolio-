# Software Architecture for QA

A QA engineer doesn't need to design the architecture, but not
understanding it means missing whole classes of risk. Every
architectural decision creates a specific testing implication.

## Client-Server Boundary

Where does validation actually happen? `QA-DEMO-SYSTEM`'s frontend is a
vanilla static site with no client-side framework — its own
`auth-login.spec.js` explicitly tests that the *server* rejects invalid
credentials (`Network Inspection: the login submit issues a real POST
/api/auth/login and the UI reacts to its actual response`), not just
that the UI shows an error. That distinction matters: client-only
validation is a UX nicety, not a security boundary — an API test suite
bypassing the UI entirely (`QA-DEMO-SYSTEM/api-tests/`) is what proves
the server actually enforces its own rules.

## Monolith vs. Microservices — what changes for QA

`QA-DEMO-SYSTEM`'s backend is a single Express process (monolith) —
REST, GraphQL, and WebSocket all served from one `app.js`, one
in-process SQLite connection, no network hop between "services." This
is a deliberate, disclosed simplification (see `05-EXECUTABLE-LABS/README.md`),
and it changes what testing has to prove:

| | Monolith (this repo) | Microservices |
|---|---|---|
| Data consistency | A single DB transaction (`orders.service.js`'s order-creation is one SQLite transaction) | Requires a saga/compensation pattern — a distributed-transaction test, not a single-transaction one |
| Contract testing | Useful but lower-stakes (same codebase, same deploy) | Essential — services deployed independently need `shared/contracts/`-style drift detection just to avoid breaking each other, which is why this repository's registry already builds that machinery (Section 27) even at monolith scale |
| Test environment | One process to start (`reset-and-start-server.js`) | Needs service virtualization/mocking for anything not under test — a real gap this repository doesn't have to solve, tracked as a learning area in `01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml#gap.service-virtualization` |
| Failure isolation | One process crashing takes everything down | A QA question becomes "does service A's failure cascade to B," not just "does A work" |

## Synchronous vs. Asynchronous Flows

`QA-DEMO-SYSTEM`'s order-payment flow is synchronous (the API call
returns the order result directly); the resulting notification is
asynchronous (persisted immediately, pushed over WebSocket
best-effort, fetchable later via REST regardless). This is exactly why
`22-SYSTEM-PATTERNS/ASYNC-EVENTS.md` and `NOTIFICATION.md` exist as
separate patterns from `PAYMENT.md` — a QA engineer has to test the
sync path (does the API return the right thing) and the async path
(does the notification eventually arrive, and does its ABSENCE at
delivery time still leave the data recoverable) as genuinely different
risk categories, not one "did it work" checkbox. `websocket.test.js`'s
"an order created without any live connection still persists a
fetchable notification" test is exactly this distinction made concrete.

## API Gateway / Single Entry Point Concepts

This repository has no separate API gateway (Express IS the entry
point), but the QA-relevant concepts it would introduce — rate
limiting, centralized auth, request routing — map directly onto real,
disclosed gaps and patterns here: `22-SYSTEM-PATTERNS/RATE-LIMITING.md`
(`NOT_IMPLEMENTED`, a real gap) and `AUTHENTICATION.md`/`AUTHORIZATION.md`
(implemented, centrally in `requireAuth`/`resolveSession`, not
duplicated per-route).

## Caching

No caching layer exists in `QA-DEMO-SYSTEM` — every `GET /api/products`
call hits SQLite directly. That absence is itself a testable fact worth
knowing conceptually: a cache introduces staleness risk (does a
`PATCH` invalidate the right cache key?) and a whole new failure mode
(cache unavailable — does the app fail open or fail closed?) that this
repository's architecture simply doesn't have to test for. Tracked as
`gap.service-virtualization`'s sibling concept, not fabricated as
implemented.

## Event-Driven / Message-Queue Concepts

`events.service.js`'s `order.paid` event (persisted to an `events`
table with a `UNIQUE(order_id, event_type)` constraint) is a minimal,
in-process analog of a message queue's core QA concern: **persisted-event
uniqueness / deduplication at the storage layer**. Codex post-audit
correction (P2-06): this constraint does NOT, by itself, guarantee
**exactly-once delivery** to a consumer — that would require the
delivery/transport layer itself (WebSocket push here) to also be
exactly-once, which this repository's implementation is not (the push
is a single best-effort send, no consumer ack/retry/redelivery
protocol — closer to at-least-once-or-none than a guaranteed delivery
semantic). What the unique constraint *does* give a real message-queue
architecture is the same deduplication guarantee a consumer-side
idempotency key provides against **at-least-once delivery with
possible redelivery** (the far more common real-world queue guarantee,
e.g. Kafka, RabbitMQ, SQS — both queue names tracked as knowledge gaps
in `gaps.yaml`): the storage layer suppresses a duplicate *processing*
attempt even if the message itself is delivered more than once.
**Processing idempotency** (this repository's real, tested property —
see `IDEMPOTENCY.md`) and **delivery exactly-once-ness** (a property of
the transport/consumer protocol, not tested or claimed here) are two
different guarantees at two different layers; testing this pattern
(`ASYNC-EVENTS.md`) generalizes the deduplication half directly to a
real message-queue system, not the delivery-semantics half.

## Why this matters for test strategy, not just trivia

Every row above answers the same underlying QA question: **what has to
be true for this system to behave correctly, and what's the cheapest
place to prove it?** A monolith's data-consistency guarantee can be
proven with one transaction test; a microservices one needs contract
tests plus a saga test. Knowing which architecture you're testing tells
you which risk category to spend effort on — this is the actual
practical payoff of "architecture awareness for QA," not an abstract
diagram-reading exercise.
