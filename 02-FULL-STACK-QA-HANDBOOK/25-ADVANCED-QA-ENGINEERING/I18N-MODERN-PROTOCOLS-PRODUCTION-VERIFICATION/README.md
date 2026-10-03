# i18n, Modern Protocols & Production Verification QA

**Executable labs:**
`QA-DEMO-SYSTEM/automation-labs/i18n-testing/` (7 unit tests + a real
run proving locale-distinct formatting via Node's real `Intl` API and a
real Unicode round-trip through the backend's real database),
`QA-DEMO-SYSTEM/automation-labs/modern-protocols/` (3 unit tests + a
real hand-rolled Server-Sent Events server/client proving real
progressive delivery and reconnection semantics), and
`QA-DEMO-SYSTEM/automation-labs/production-verification/` (15 unit
tests + a real synthetic-monitoring run against a real running backend,
with an honest `NOT_EXECUTED` result when no backend is reachable).

## Scope boundary — read this first

i18n testing here covers two real, testable mechanisms — Node's own
built-in `Intl` API for locale-aware formatting, and Unicode data
integrity through the backend's own real storage layer — not a UI
RTL/LTR layout test or a translation-key coverage scanner. Modern
protocols here means a minimal, hand-rolled Server-Sent Events
implementation, not gRPC, HTTP/2 server push, or WebRTC, and never
modifies the real backend (`backend/src/`) — it is fully self-contained,
consistent with this campaign's pattern of standalone `automation-labs/`
fixtures. Production verification here means a real synthetic smoke
test with a disclosed latency budget, not a commercial monitoring
platform (Pingdom, Datadog Synthetics) with geographic probes or
alerting integration. Each choice is disclosed in its own lab's
`README.md` "Scope boundary" section.

## Three real findings this milestone

1. **A real, observed ICU formatting detail.** The i18n lab's first
   currency-formatting test failed against a hand-typed expected string
   — Node's real `Intl` output for German currency formatting uses a
   non-breaking space (`U+00A0`), not a regular space, before the `€`
   symbol. The test was corrected to assert the real character, and the
   mismatch itself is exactly the kind of detail a hand-written i18n
   fixture would have gotten "right" by construction while calling the
   real API surfaced it immediately. See `COMMON-MISTAKES.md`.
2. **A real, timed proof that SSE delivery is progressive, not
   buffered.** The modern-protocols lab measured the real wall-clock gap
   between consecutively-received events and confirmed it matches the
   server's configured inter-event delay — direct, timed evidence
   against the alternative explanation that the client simply read one
   buffered response. See `01-MODERN-PROTOCOLS-SSE.md`.
3. **A real distinction between "down" and "slow," proven, not just
   described.** The production-verification lab's synthetic monitor
   classifies a successful-but-over-budget check as `SLOW`, never
   conflated with `FAIL` — and a dedicated test proves a slow check is
   still reported as functionally OK. See
   `03-PRODUCTION-VERIFICATION.md`.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-MODERN-PROTOCOLS-SSE.md` | Server-Sent Events wire protocol, progressive delivery, Last-Event-ID reconnection |
| `02-I18N-TESTING.md` | Locale-aware formatting via Intl, Unicode data integrity, the non-breaking-space finding |
| `03-PRODUCTION-VERIFICATION.md` | Synthetic monitoring, PASS/SLOW/FAIL classification, honest degraded mode |
| `COMMON-MISTAKES.md` | Real mistakes found and fixed while building these exact labs |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
competencies this area adds — every one has `professional: {status: NONE}`
unless an existing, independent professional source proves otherwise.
