# Reliability, Chaos Engineering & Privacy Testing

**Executable labs:**
`QA-DEMO-SYSTEM/automation-labs/chaos-reliability/` (17 deterministic
tests: fault-injection fixture, circuit breaker, resilient client,
composed chaos scenarios) and
`QA-DEMO-SYSTEM/automation-labs/privacy-testing/` (17 tests: PII/
sensitive-field response scanner — including real integration against
the live backend — and a disclosed GDPR-style data-subject-rights
fixture).

## Scope boundary — read this first

Neither lab uses real production chaos-engineering or privacy-scanning
infrastructure. `chaos-reliability` builds its own deterministic,
locally-controlled "unreliable dependency" fixture rather than using
Chaos Monkey, Gremlin, Litmus, or Toxiproxy — no real network-level
fault injection is performed. `privacy-testing` genuinely scans real
backend API responses (real integration, not a fixture, for that
part), but its GDPR data-subject-rights testing runs against a
disclosed in-memory fixture, not real backend endpoints — QA-DEMO-SYSTEM
has no `/api/users/:id/export` or `/api/users/:id/erase` route, and
none was invented to inflate this area's evidence.

Both labs still prove real, transferable QA techniques: a genuine
circuit-breaker state machine and bounded-retry client tested against
real HTTP failures, and a genuine recursive PII/sensitive-field
scanner tested against both synthetic fixtures and a real running
system.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-CHAOS-ENGINEERING-AND-RESILIENCE-TESTING.md` | Fault injection, circuit breakers, bounded retry/timeout, composed failure-recovery scenarios |
| `02-PRIVACY-AND-GDPR-STYLE-TESTING.md` | Sensitive-field/PII response scanning, data-subject-rights (access/erasure/anonymization/consent) testing |
| `COMMON-MISTAKES.md` | Real mistakes made and fixed while building these exact labs |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for
the competencies this area adds — every one has
`professional: {status: NONE}` unless an existing, independent
professional source proves otherwise. Repository-practice status
reflects real, executed test runs only (see
`01-SALIM-BURAK-DIGITAL-TWIN/registry/evidence.yaml` and
`shared/registry/catalog/labs.yaml`).
