# Domain: Media / Streaming

**Maturity:** D2 QA_MAPPED (real, deep domain-QA knowledge with a
professional-experience anchor; no dedicated executable lab in this
repository yet — see "Executable scope" below for why and what would
close that gap).

Real (sanitized) professional experience in this exact domain:
`01-SALIM-BURAK-DIGITAL-TWIN/registry/professional-experience.yaml#pro.streaming.sdk-context`
(Mobile SDK / Live Streaming platform QA — mobile/backend/integration
QA, admin panel QA, AWS/MUX/Agora-related config/key/provider flow QA
and integration exposure, provider flow validation, stream
creation/end-to-end testing, REST API automation). AWS/MUX/Agora are
kept strictly as sanitized provider-integration QA exposure — this page
never simulates their proprietary internals and never upgrades that
exposure into a "Cloud Engineer" or "Provider Engineer" claim (per the
Digital Twin's own explicit TR note on this same source data).

## Actors

- **Admin** — configures the streaming provider (API key, environment,
  quality presets) for a channel/account.
- **Broadcaster** — starts and ends a stream, holds the "publish"
  credential.
- **Viewer** — joins a live session as a consumer, holds a
  "subscribe"-only credential.
- **Backend** — the system of record for stream/session state; the
  provider (AWS/MUX/Agora-class service) is the actual media-transport
  layer, not this backend.
- **Provider** — the third-party streaming infrastructure; treated as
  an external dependency with its own failure modes, not something
  this domain's QA re-implements.

## Admin / Config Flow

Provider configuration (API key, region, stream quality tier) is
typically entered once per environment and validated at save time, not
at stream-creation time — a QA risk in itself: an invalid key that
passes a lax "is this a non-empty string" check will only surface as a
failure much later, at the first real stream attempt, which is a worse
place to discover it. **Test strategy**: config validation should fail
fast and specifically (distinguish "malformed key format" from "key
format is valid but provider rejected it" — these need different admin
UI messages and different remediation).

## Provider Abstraction

A well-designed backend does not hardcode one provider's SDK calls
throughout the codebase — it puts a thin abstraction layer between
"create a stream" (the domain concept) and "call MUX's/Agora's specific
API" (the implementation). This is the same architectural principle
`08-SOFTWARE-ARCHITECTURE-FOR-QA/README.md` describes generally, applied
here: the abstraction is what makes a synthetic/fake provider
(`FAKE_PROVIDER_A`) usable for testing without touching real
credentials — the domain logic under test doesn't know or care which
concrete provider sits behind the interface.

## Stream Creation, Sessions, Channels

```
Admin configures provider -> Broadcaster requests a stream ->
Backend calls provider.createStream() -> Provider returns a
stream/session identifier -> Backend persists it -> Viewers join
using that identifier -> Provider pushes realtime events -> Stream
ends (explicit end, or timeout, or broadcaster disconnect)
```

A **session** is one live occurrence of a stream; a **channel** is the
more durable resource a broadcaster owns across multiple sessions
(same channel, many streams over time). Conflating the two is a real,
common domain-modeling bug: "is this viewer count per session or per
channel" is exactly the kind of question that needs an explicit answer
before the data model is built, not discovered from a support ticket
later.

## SDK / Client Integration

The client SDK is the piece a viewer's app embeds to actually render
the stream — it's where connection/reconnection logic and realtime
event handling live on the consumer side. **QA implication**: SDK
behavior often lags or diverges from the backend's documented behavior
(a common real-world pattern: the SDK caches a stale token for longer
than the backend's token TTL) — testing "does the backend behave
correctly" and "does the SDK behave correctly when the backend does"
are two different test suites, not one.

## Viewer Lifecycle

Join → watch → (optionally) leave and rejoin → stream ends. Each
transition is a real test boundary: does joining an already-ended
stream fail cleanly (not with a generic timeout)? Does rejoining after
a network blip resume mid-stream or restart? Is viewer count
decremented reliably on every exit path (explicit leave, app kill,
network drop — three different code paths that must all reach the same
decrement logic)?

## Realtime Events, Connection/Disconnection, Reconnect

This is the domain's sharpest overlap with `22-SYSTEM-PATTERNS/ASYNC-EVENTS.md`
and `NOTIFICATION.md`, which this repository *does* implement and test
(`QA-DEMO-SYSTEM/backend/src/services/events.service.js`,
`websocket-events-advanced.test.js`). The same risk categories those
patterns test for apply directly here:

- **Duplicate events**: a provider retry or a reconnect can re-deliver
  the same event — the consumer must dedupe, the same way this
  repository's `events` table enforces `UNIQUE(order_id, event_type)`
  for `order.paid`.
- **Out-of-order events**: "stream ended" arriving before "stream
  started" (a real possibility under provider-side retry/network
  jitter) must not corrupt state.
- **Reconnect**: a viewer's brief network drop should attempt
  reconnection before declaring the session lost — and the backend
  needs to distinguish "genuinely disconnected" from "reconnecting" so
  viewer-count metrics don't flap on every minor blip.

## Provider Error Handling and Timeout

A QA suite for this domain has to test the *failure* path as
seriously as the happy path: provider unreachable, provider returns a
5xx, provider times out without responding at all (a different failure
mode than an explicit error — the backend needs its own timeout, not
an indefinite wait). Each should map to a distinct, actionable error
for the admin/broadcaster, not a single generic "something went wrong."

## Token / Session Expiration

Streaming tokens are typically short-lived (security requirement: a
leaked viewer token shouldn't grant access indefinitely). **Test
strategy**: token expires mid-stream — does the viewer get a graceful
"your session expired, rejoin" experience, or does playback silently
freeze? This is the same "revoke-after-grant" risk category
`09-MOBILE-QA/README.md` describes for permissions — a resource that
can disappear mid-use is a distinct test case from a resource that's
simply absent from the start.

## State Mismatch (Backend vs. Client)

A real, user-visible bug class: backend says a stream is `live`, the
client SDK reports `connecting` (or vice versa) because of a timing
gap between provider state changing and both sides learning about it.
Test strategy: don't just test each side's state independently — test
the *reconciliation window* (how long can they legitimately disagree,
and does the UI communicate "connecting" honestly during that window
rather than showing a confusing contradiction).

## Security Concerns

- Broadcast (publish) credentials must never be exposed to a viewer —
  a credential-scope bug here is a content-hijacking risk, not a minor
  bug.
- Provider API keys belong server-side only; a key present in any
  client-shipped code or a public repository is a real, severe finding
  (this is precisely why this repository never places real provider
  keys anywhere, even in test fixtures — see the confidentiality
  checklist in `.ai/CODEX-FULL-AUDIT-HANDOFF.md`).
- Stream/session identifiers should not be sequentially guessable
  (an IDOR-class risk directly analogous to `22-SYSTEM-PATTERNS/AUTHORIZATION.md`'s
  BOLA/IDOR coverage, applied to "can I view someone else's private
  stream by guessing its ID").

## Performance Concerns

Viewer-count spikes (a popular stream going viral) are this domain's
signature load-testing scenario — very different from `QA-DEMO-SYSTEM`'s
own order/payment load profile (`04-TOOLS-AND-TECH/04-PERFORMANCE/`),
which is steady, predictable request volume. A streaming load test
needs to model a sudden join burst, not just sustained throughput.

## Observability

Stream health (bitrate, dropped frames, buffer events) is telemetry a
generic HTTP access log doesn't capture — this domain needs its own
observability signal, distinct from `04-TOOLS-AND-TECH/07-OBSERVABILITY/`'s
correlation-ID/access-log approach, which is necessary but not
sufficient here.

## Test Strategy Summary

Functional (join/leave/create/end), negative (invalid config, expired
token, provider error), concurrency (many viewers joining
simultaneously), realtime-correctness (duplicate/out-of-order event
handling), security (credential scope, ID enumeration), and
performance (viewer-spike load) — six distinct test categories, not
one "does streaming work" checkbox.

## Interview Scenarios

- "How would you test that a viewer can't access a stream they're not
  authorized for?" → ID enumeration + credential-scope testing, same
  IDOR/BOLA principle as `22-SYSTEM-PATTERNS/AUTHORIZATION.md`.
- "A stream shows as live on the backend but the client shows
  connecting — how do you investigate?" → the state-mismatch
  reconciliation-window question above; start with timestamps on both
  sides' state transitions, not a guess.
- "How do you load-test a live-streaming join spike differently from a
  typical API load test?" → burst-arrival modeling, not sustained RPS
  (see Performance Concerns above).

## Related System Patterns

`22-SYSTEM-PATTERNS/ASYNC-EVENTS.md`, `NOTIFICATION.md`,
`AUTHENTICATION.md`, `AUTHORIZATION.md` — all directly applicable, with
this domain's own specific event-duplication/ordering and
credential-scope risks layered on top.

## Related Tools

`04-TOOLS-AND-TECH/01-API-AND-CONTRACT/` (REST API automation, real
professional exposure here), WebSocket testing techniques from
`QA-DEMO-SYSTEM/backend/tests/websocket*.test.js` (the closest real
executable analog for realtime-event testing this repository has).

## Executable Scope

**Not yet built.** A real lab for this domain would need a
fake-provider abstraction (`FAKE_PROVIDER_A`/`FAKE_PROVIDER_B`, per the
transformation spec's explicit public-safe-testing rule) implementing
`createStream`/`endStream`/emit-realtime-event, layered the same way
`QA-DEMO-SYSTEM/backend/src/services/events.service.js`'s event system
already works — this is a concrete, scoped next step, tracked here
rather than invented as already done.
