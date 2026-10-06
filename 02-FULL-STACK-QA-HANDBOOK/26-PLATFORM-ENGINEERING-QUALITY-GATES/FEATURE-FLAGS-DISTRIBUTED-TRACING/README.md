# Feature Flags & Progressive Targeting / Distributed Tracing

**Executable labs:**
`QA-DEMO-SYSTEM/automation-labs/feature-flags/` (8 unit tests + a real
aggregate run proving deterministic percentage rollout, allow/deny-list
overrides, and segment targeting) and
`QA-DEMO-SYSTEM/automation-labs/distributed-tracing/` (12 unit tests +
a real aggregate run proving trace-context propagation over a real
HTTP hop — one real `node:http` server plus one real HTTP client, both
in the same process; see that lab's `README.md` "What this does and
doesn't prove" section — this does not prove a separate-process
boundary, independent review finding F6).

## Scope boundary — read this first

Feature flags here means the real client-side *evaluation algorithm*
a flag SDK runs (hashing, overrides, segment matching) — not a
flag-management platform (LaunchDarkly, Split, a database-backed admin
UI) and not audit/scheduling/kill-switch tooling. Distributed tracing
here means real trace-context propagation and span-tree shape, loosely
modeled on the W3C `traceparent` header — not full W3C Trace Context
spec conformance, and not a real export to a tracing backend (Jaeger,
Zipkin, OTLP). Each lab's own `README.md` "Scope boundary" section
states this in full.

## What makes both proofs genuine, not diagrams

Both labs intentionally exercise the exact mechanism that would be
easy to get wrong and easy to fake in documentation instead of code:

- The feature-flags lab doesn't just assert "a 25% rollout works" —
  it evaluates a real hash-based bucketing function against 2000 real
  distinct synthetic user ids and checks the real observed percentage
  lands within a real statistical tolerance of the configured value.
- The distributed-tracing lab doesn't call two functions in one
  process and claim that proves propagation — it starts a second real
  `node:http` server on a real loopback port and sends a real HTTP
  request to it, so the trace context genuinely crosses a network
  hop, which is the one step most likely to actually break (a dropped
  header, a case-sensitivity bug) in a real multi-service system.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-FEATURE-FLAGS-AND-PROGRESSIVE-TARGETING.md` | Deterministic hash-based rollout, override precedence, segment targeting, the real statistical proof |
| `02-DISTRIBUTED-TRACING.md` | Trace-context propagation design, the real cross-service HTTP proof, span-tree shape verification |
| `COMMON-MISTAKES.md` | Real mistakes found and fixed while building these exact labs (or an honest statement that none occurred) |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
competencies this area adds — every one has `professional: {status: NONE}`
unless an existing, independent professional source proves otherwise.
