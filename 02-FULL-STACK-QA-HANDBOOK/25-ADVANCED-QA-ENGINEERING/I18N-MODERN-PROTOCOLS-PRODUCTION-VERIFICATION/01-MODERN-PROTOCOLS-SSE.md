# Modern Protocols: Server-Sent Events

## Why this matters for QA

A REST API test proves a request got a correct response. It says
nothing about a server pushing data to a client over time — the
category of "modern protocol" this lab covers. Server-Sent Events (SSE)
is the simplest real example: a long-lived HTTP response that stays open
and streams discrete, framed events to the client as they happen,
instead of the client polling repeatedly. Testing it correctly requires
proving something a buffered-response test never has to: that events
actually arrive *progressively*, over real time, not all at once when
the connection finally closes.

## The real wire protocol, not a description of one

An SSE response is plain HTTP with `Content-Type: text/event-stream`.
Each event is one or more lines followed by a blank line:

```
id: 2
event: order.paid
data: {"orderId":1}

```

`lib/sse-server.js` writes exactly this framing by hand over Node's own
`http` module — no SSE library — and `lib/sse-client.js` parses the raw
streamed bytes as they arrive, splitting on the blank-line terminator,
rather than waiting for the whole response to buffer.

## Proving progressive delivery, not asserting it

The single easiest mistake in testing a streaming protocol is to assert
on the *final* collected result and call it done — that would pass
identically whether the server streamed the events over real time or
buffered them all and sent them in one burst at the end. This lab closes
that gap by recording a real `Date.now()` timestamp for every event as
the client parses it, then asserting the real **gap between consecutive
timestamps** is at least as large as the server's configured per-event
delay. A buffered response would produce gaps near 0ms regardless of
that delay — the real, observed ~40ms gaps for a 40ms configured delay
are direct, timed evidence of genuine progressive delivery.

## Last-Event-ID: proving reconnection logic, not just happy-path streaming

A real SSE client that loses its connection is expected to reconnect and
send the id of the last event it successfully received in a
`Last-Event-ID` header, so the server can resume from there without
replaying everything. `lib/sse-server.js` implements exactly this: it
filters its event list down to only ids greater than the header's value
before streaming. The lab proves this concretely — reconnecting with
`Last-Event-ID: 2` against a 4-event stream returns exactly `[3, 4]`,
never a replay of `[1, 2, 3, 4]` and never an empty stream from
misreading the header.

## Scope boundary

This is a minimal, hand-rolled implementation — no automatic
client-side reconnection timer, no `retry:` field handling, no
multiplexed topics over one connection. It does not cover gRPC, HTTP/2
server push, or WebRTC. SSE was chosen specifically because it is
implementable correctly over plain HTTP/1.1 with zero added
dependencies while still exercising a genuinely different wire protocol
than this repository's existing REST/GraphQL/WebSocket surface — and
because it never requires modifying the real backend to demonstrate.
