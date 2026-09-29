# Pattern: Notification

## How it works

A backend event (order paid, etc.) triggers a message to a user through
one or more channels — in this repository's reference platform, a
persisted notification row plus a live WebSocket push to that specific
user, wired through `notifications.service.js` and
`websocketServer.js`.

## Why systems use it

Users need to know something happened without polling; the system also
needs a durable record independent of whether the user was online at
the moment it happened.

## QA risks

- Notification delivered to the wrong user (isolation failure)
- Real-time push fires but nothing is persisted (user who wasn't
  online loses it permanently)
- Duplicate notification for a single event (see `IDEMPOTENCY.md`)
- Notification fires for a business state that shouldn't trigger one
  (e.g. a DECLINED order silently notifying as if paid)

## Failure behavior

If the live push fails (user offline, socket not connected), the
persisted record must still exist and be fetchable later — push
delivery is an optimization, not the source of truth.

## Test strategy

**Positive:** event → notification persisted AND pushed to the
correct, connected user.
**Negative:** event for a DIFFERENT user's order must never appear in
this user's notification stream (cross-user isolation).
**Edge:** event fires with no live connection at all → notification
still persisted and later fetchable; a DECLINED (non-paid) order must
NOT trigger a "paid" notification.

## Security implications

Cross-user notification leakage is a data-isolation bug with real
privacy impact, not a cosmetic one.

## Performance implications

Push delivery should not block the request that triggered it — this
repository's implementation fires the notification asynchronously
relative to the HTTP response.

## Observability

Each notification should be traceable to the event and request that
caused it (correlation ID chain: request → event → notification).

## Automation candidates

High — deterministic given a controlled event trigger and a real
WebSocket client in the test.

## Related domains

E-Commerce (order status), FinTech (transaction/balance alerts),
Streaming (realtime viewer/session events).

## Related labs

`QA-DEMO-SYSTEM/backend/tests/graphql-websocket-notification.test.js`,
`QA-DEMO-SYSTEM/backend/tests/websocket-events-advanced.test.js`,
`QA-DEMO-SYSTEM/web-tests/tests/realtime-notification.spec.js`.
