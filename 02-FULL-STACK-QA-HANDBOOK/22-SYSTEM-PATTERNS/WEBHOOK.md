# Pattern: Webhook

## How it works

Instead of a client polling for state changes, the server proactively
POSTs an event notification to a client-registered URL when something
happens — inverting the normal request direction (the "server" of the
webhook call is actually the original client, and vice versa).

## Why systems use it

Removes polling overhead and latency — the receiving system learns
about an event immediately rather than on its next poll cycle. Common
for third-party integrations (a payment provider notifying your
backend that a charge settled).

## Status in this repository

**Not implemented as an outbound integration; the real-time push this
repository DOES have works differently.** `QA-DEMO-SYSTEM` pushes
`order.paid` notifications to its OWN connected clients over WebSocket
(`22-SYSTEM-PATTERNS/NOTIFICATION.md`) — that's server-to-client
real-time push within one system, not a webhook (server-to-external-
system HTTP callback). No outbound webhook call to a third party, and
no inbound webhook receiver endpoint, exists in this codebase.

## QA Risks (in a system that DOES implement webhooks)

- **No delivery guarantee without retry+backoff**: an HTTP POST that
  fails once (receiver down, network blip) needs a retry strategy
  (`RETRY.md`) or the event is silently lost — webhooks have no
  built-in "the client will just ask again" fallback the way polling
  does.
- **Duplicate delivery**: a webhook sender that retries on ambiguous
  failure (no confirmation received, but the receiver may have
  actually processed it) can deliver the same event twice — the
  receiver MUST be idempotent (`IDEMPOTENCY.md`) about processing a
  webhook payload, the same discipline this repository's real
  `UNIQUE(order_id, event_type)` constraint enforces for its own
  internal event table.
- **Unauthenticated receiver endpoint**: a webhook receiver that
  doesn't verify the sender's signature (typically an HMAC over the
  payload) can be spoofed by anyone who discovers the URL — a real,
  common vulnerability in systems that implement this pattern
  carelessly.
- **Out-of-order delivery**: webhooks can arrive out of the order they
  were sent (different retry timing, different network paths) — the
  same ordering risk `ASYNC-EVENTS.md` and `03-MEDIA-STREAMING/README.md`
  document for this repository's own realtime events.

## Test Strategy

**Positive:** a real event triggers exactly one correctly-signed
webhook delivery. **Negative:** an unsigned or incorrectly-signed
webhook payload is rejected by the receiver. **Idempotency:** the same
webhook payload delivered twice (simulating a sender retry) produces
one processed effect, not two. **Ordering:** out-of-order delivery of
two related events doesn't corrupt receiver-side state.

## Related System Patterns

`IDEMPOTENCY.md`, `RETRY.md`, `ASYNC-EVENTS.md` — a webhook receiver is
essentially this repository's own event-processing discipline, applied
to events arriving from outside the system instead of from within it.

## Related Domains

Media/Streaming (a provider webhook confirming stream-processing
complete), Insurance (a payment-processor webhook confirming premium
payment), any domain integrating third-party payment/provider systems.
