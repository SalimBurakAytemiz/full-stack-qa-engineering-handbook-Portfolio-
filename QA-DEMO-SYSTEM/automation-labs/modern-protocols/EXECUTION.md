# Modern Protocols Lab — Execution Evidence

**Date:** 2026-10-03
**Environment:** sandbox container.

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/modern-protocols/tests/sse.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..3 / # pass 3 / # fail 0`. Exit code `0`.

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/modern-protocols/run-modern-protocols-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`).

**Actual observed output:**
```
--- Modern Protocols Lab: real scenario results ---
  [PASS] a real SSE stream delivers every event, in order, with correct id/event/data framing ([{"id":1,"event":"order.created"},{"id":2,"event":"order.paid"},{"id":3,"event":"order.shipped"}])
  [PASS] events genuinely arrive progressively over real wall-clock time, not all at once (gap1=40ms, gap2=40ms)
  [PASS] a real reconnection with Last-Event-ID only receives events after that id, never a replay ([3,4])

MODERN_PROTOCOLS_LAB_STATUS: EXECUTED
```
Exit code `0`.

## What this run actually proves

- The real SSE server produced real `id:`/`event:`/`data:` frames over
  an actual HTTP response, and the real client's streaming parser
  recovered all three events in the correct order with the correct
  event names — not a canned fixture claiming "it would work."
- The gap between the real timestamps the client recorded for
  consecutive events (`gap1=40ms, gap2=40ms`) matches the server's
  configured 40ms inter-event delay almost exactly. A buffered (non-
  streaming) response would have produced a gap near 0ms regardless of
  the server's delay — this is direct, timed evidence that the events
  were delivered progressively over the real connection, not batched.
- Reconnecting with `Last-Event-ID: 2` against a real 4-event stream
  returned exactly events `[3, 4]` — proof the server's reconnection
  logic genuinely filters by id rather than replaying everything or
  ignoring the header.

## Scope and honesty notes

- Minimal, hand-rolled SSE — not a production library; no automatic
  client reconnection timer or `retry:` field handling. See `README.md`'s
  "Scope boundary" section.
- Never modifies the real backend (`backend/src/`) — fully self-contained.
- Not yet CI-verified as of this file's writing — CI wiring is a
  separate, explicitly tracked step (see `.github/workflows/ci.yml`'s
  `modern-protocols-lab` job once added).
