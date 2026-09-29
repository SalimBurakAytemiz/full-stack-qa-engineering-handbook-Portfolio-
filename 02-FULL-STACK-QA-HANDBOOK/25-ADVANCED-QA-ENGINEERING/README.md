# 25 — Advanced QA Engineering

**Status: additional topic area, not in the original 24-item table** (see
root `README.md`'s topic table for the base 24; this folder is added the
same way `06-DEFECT-MANAGEMENT` was — genuinely new content indexed
alongside the numbered list, not squeezed into an existing slot).

This area covers next-generation QA engineering practices that go beyond
the foundational 00–09/19–24 topics: testing AI/ML/LLM-backed systems,
chaos/reliability engineering, service virtualization, advanced contract
and property-based testing, mutation testing, data-engineering QA,
distributed messaging, supply-chain security, modern protocols, and
production-verification/progressive-delivery testing.

Each subtopic here follows the same discipline as the rest of this
handbook: real executable labs where a lab is claimed (see
`05-EXECUTABLE-LABS/README.md`), explicit scope-boundary disclosure where
a lab is deliberately simplified (e.g. a deterministic mock instead of a
real paid API), and a hard line between **repository practice** (what was
actually implemented and executed here) and **professional experience**
(what was done for pay, under real production constraints, for a real
employer) — the two are never conflated. See
`01-SALIM-BURAK-DIGITAL-TWIN/README.md` and `02-COMPETENCY-MATRIX.md` for
the full three-dimension model (Knowledge / Professional Experience /
Repository Practice).

## Subtopics

| Folder | Status |
|---|---|
| `AI-ML-LLM-SYSTEMS-TESTING/` | Added — real executable mock-first lab, see below |
| `RELIABILITY-CHAOS-PRIVACY-TESTING/` | Added — real executable chaos/reliability + privacy labs, see below |
| `SERVICE-VIRTUALIZATION-CONTRACT-PROPERTY-FUZZ-TESTING/` | Added — real executable service-virtualization/contract + property-based/fuzz labs, see below |

Further subtopics (mutation testing, data-engineering QA, messaging,
supply-chain security, modern protocols, production verification) are
planned but not yet added in this pass — this folder grows
incrementally, each addition backed by real, executed work, never a
documentation-only placeholder claiming more than exists.

## AI/ML/LLM Systems Testing

Executable lab: `QA-DEMO-SYSTEM/automation-labs/ai-systems/` (see its own
`README.md` for run instructions). Mapped into the lab catalog per this
repository's existing mapping-layer convention — see
`05-EXECUTABLE-LABS/README.md`.

Read `AI-ML-LLM-SYSTEMS-TESTING/README.md` first — it states the scope
boundary (deterministic mock, not a real model) that every other document
in that subfolder assumes.

## Reliability, Chaos Engineering & Privacy Testing

Executable labs: `QA-DEMO-SYSTEM/automation-labs/chaos-reliability/`
(fault injection, circuit breaker, resilient client) and
`QA-DEMO-SYSTEM/automation-labs/privacy-testing/` (PII/sensitive-field
response scanning — including real integration against the live
backend — plus a disclosed GDPR-style data-subject-rights fixture).

Read `RELIABILITY-CHAOS-PRIVACY-TESTING/README.md` first — it states
the scope boundary (a locally-controlled fault-injection fixture, not
real chaos-engineering infrastructure; a disclosed fixture for
data-subject-rights testing, since the real backend has no such
endpoints) that every other document in that subfolder assumes.

## Service Virtualization, Contract, Property-Based & Fuzz Testing

Executable labs: `QA-DEMO-SYSTEM/automation-labs/service-virtualization/`
(a real WireMock-style stub server + consumer-driven contract testing,
verified both against a virtualized double and against the real,
running backend) and
`QA-DEMO-SYSTEM/automation-labs/property-and-fuzz-testing/` (a real,
hand-rolled property-based testing framework applied to the backend's
real service functions, plus structured fuzz testing against the real,
running API — which found and drove the fix for a real backend bug,
see that area's `COMMON-MISTAKES.md`).

Read `SERVICE-VIRTUALIZATION-CONTRACT-PROPERTY-FUZZ-TESTING/README.md`
first — it states the scope boundary (self-built stub server and
contract verifier rather than WireMock/Pact; a hand-rolled
property-testing framework rather than fast-check; fixed, disclosed
fuzz-value sets rather than coverage-guided mutation) that every other
document in that subfolder assumes.
