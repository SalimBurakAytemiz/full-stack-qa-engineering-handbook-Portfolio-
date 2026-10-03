# Modern Protocols Lab (Server-Sent Events)

A real test of the Server-Sent Events (SSE) wire protocol — hand-rolled,
not a library wrapper — proving three things a QA engineer actually
needs to verify about an SSE integration: correct event framing and
ordering, genuine progressive delivery over real wall-clock time, and
correct `Last-Event-ID` reconnection semantics.

## What this lab actually does

- `lib/sse-server.js` is a real HTTP server (Node's own `http` module)
  that speaks the actual `text/event-stream` wire format: `id: <n>`,
  optionally `event: <type>`, `data: <payload>`, and a blank line
  terminating each event — written one event at a time with a real
  `setTimeout` delay between them. It honors a real `Last-Event-ID`
  request header by only sending events with a higher id, exactly as a
  real SSE server is expected to for reconnection.
- `lib/sse-client.js` is a real client that opens the connection with
  Node's own `http.get`, parses the **raw streamed bytes** as they
  arrive — never waiting for the response to fully buffer — splitting on
  the blank-line event terminator and recording a real `Date.now()`
  timestamp for each parsed event.
- `run-modern-protocols-lab.js` proves, against the real server and
  client together: (1) every event arrives in order with correct
  framing, (2) the gap between consecutively-received events' real
  timestamps is at least as large as the server's configured delay —
  proof the events were not buffered into one response — and (3) a
  reconnect with `Last-Event-ID` receives only the events after that id.

## Scope boundary

This is a minimal, hand-rolled SSE implementation — not a production
SSE library (no automatic client-side reconnection timer, no `retry:`
field handling, no multiplexed topics). It does not cover gRPC, HTTP/2
server push, or WebRTC — SSE was chosen because it is implementable
correctly over plain HTTP/1.1 with zero added dependencies while still
exercising a genuinely different wire protocol than this repository's
existing REST/GraphQL/WebSocket surface. This lab never modifies the
real backend (`backend/src/`) — it is fully self-contained, consistent
with this campaign's pattern of standalone `automation-labs/` fixtures.

## Run it

```bash
# from QA-DEMO-SYSTEM/automation-labs/ — no backend server needed, self-contained
node modern-protocols/run-modern-protocols-lab.js
node --test modern-protocols/tests/sse.test.js
```
