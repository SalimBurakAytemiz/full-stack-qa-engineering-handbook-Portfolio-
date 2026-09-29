# Pattern: Async Events

## How it works

A backend action doesn't directly call every downstream consumer —
instead it emits an event, and consumers (notification, analytics,
audit) react independently. This repository's `events.service.js`
creates an `order.paid` event, which `notifications.service.js`
consumes; both are decoupled from the original request/response cycle.

## Why systems use it

Decoupling: the order-creation code doesn't need to know or care how
many things react to "order paid" — new consumers can be added without
touching the producer.

## QA risks

- Event ordering not guaranteed (a later event processed before an
  earlier one)
- Duplicate event delivery (see `IDEMPOTENCY.md`)
- Event silently dropped (producer thinks it emitted, no consumer ever
  received it — often invisible without correlation tracing)
- Event payload doesn't actually match the state that triggered it
  (stale data captured before a subsequent write)

## Failure behavior

A dropped or failed event should be detectable (via absence — "an
order was paid but no notification exists" — not just via consumer-side
errors, which won't fire if the event never arrived at all).

## Test strategy

**Positive:** action → event → each expected consumer effect observed
independently (not just "the event object was constructed").
**Negative:** an action that should NOT emit the event (e.g. a
DECLINED order) genuinely doesn't.
**Edge:** ordering and duplication — does the system correctly handle
the same event delivered twice, or two related events arriving out of
order.

## Security implications

Event payloads are a common place for sensitive data to leak into logs
or downstream systems that don't need it — same discipline as
`OBSERVABILITY-AND-RCA`.

## Performance implications

Event processing should not block the producing request's response —
verified in this repository by the notification tests that assert a
notification exists even when no live client connection was present at
emission time.

## Observability

A correlation ID should thread through producer → event → every
consumer, so "did X actually cause Y" is provable from logs, not
inferred.

## Automation candidates

High — trigger the producing action, then assert on each consumer's
observable effect (DB row, WebSocket message) independently.

## Related domains

E-Commerce, FinTech, Streaming (all event-heavy by nature).

## Related labs

`QA-DEMO-SYSTEM/backend/src/services/events.service.js`,
`QA-DEMO-SYSTEM/backend/tests/websocket-events-advanced.test.js`.
