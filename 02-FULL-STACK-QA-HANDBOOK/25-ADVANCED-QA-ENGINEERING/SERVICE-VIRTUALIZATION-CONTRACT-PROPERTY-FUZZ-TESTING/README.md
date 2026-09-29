# Service Virtualization, Contract, Property-Based & Fuzz Testing

**Executable labs:**
`QA-DEMO-SYSTEM/automation-labs/service-virtualization/` (9 consumer-side
tests + 2 real provider-verification tests: a WireMock-style stub
server and consumer-driven contract testing) and
`QA-DEMO-SYSTEM/automation-labs/property-and-fuzz-testing/` (12 property
tests + 4 real fuzz tests against the live backend: a hand-rolled
property-based testing framework and structured API fuzzing).

## Scope boundary — read this first

None of these four techniques are backed by production-grade external
tooling here. The stub server is a real, self-built HTTP server, not
WireMock. The contract verifier is a real, minimal ajv-based
implementation, not the Pact library. The property-based testing
framework is a real, hand-rolled generator/runner/shrinker, not
fast-check or jsverify. The fuzz-testing harness uses fixed, disclosed
hostile-value sets, not AFL/libFuzzer-style coverage-guided mutation.
Each of these is a deliberate scope and dependency-bloat-avoidance
choice (see the Part 2 tooling principle), not an oversight — and each
one still proves the real technique against real targets: the contract
verifier's provider-side test calls the actual running backend, the
property tests exercise the backend's real, unmodified service
functions via a real in-memory database, and the fuzz tests send real
hostile HTTP requests to the real backend.

## A real backend bug found by this milestone's fuzz testing

Fuzzing the real backend's login and orders endpoints found a genuine
bug: an oversized request body fell through to a raw 500 instead of a
correct 413. Fixed at the root cause in
`backend/src/middleware/errorHandler.js` — see `COMMON-MISTAKES.md`.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-SERVICE-VIRTUALIZATION-AND-CONTRACT-TESTING.md` | Stub servers, request matching, stateful scenarios, consumer-driven contract testing |
| `02-PROPERTY-BASED-AND-FUZZ-TESTING.md` | Generative/invariant testing with shrinking, structured hostile-input fuzzing |
| `COMMON-MISTAKES.md` | Real mistakes (and one real backend bug) found and fixed while building these exact labs |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for
the competencies this area adds — every one has
`professional: {status: NONE}` unless an existing, independent
professional source proves otherwise.
