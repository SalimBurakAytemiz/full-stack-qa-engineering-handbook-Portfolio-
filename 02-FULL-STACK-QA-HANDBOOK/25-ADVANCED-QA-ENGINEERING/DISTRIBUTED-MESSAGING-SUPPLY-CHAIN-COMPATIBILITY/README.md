# Distributed Messaging, Supply Chain Security & Compatibility Testing QA

**Executable labs:**
`QA-DEMO-SYSTEM/automation-labs/distributed-messaging/` (8 unit tests + a
real aggregate run proving ordering, dead-letter routing, and the
idempotent-vs-non-idempotent consumer double-apply bug),
`QA-DEMO-SYSTEM/automation-labs/supply-chain-security/` (14 unit tests + a
real run of `npm sbom` and `npm audit` against this actual repository),
and `QA-DEMO-SYSTEM/automation-labs/compatibility-testing/` (4 unit tests
+ a real run validating the real backend's current response shape
against a frozen baseline contract).

## Scope boundary — read this first

Distributed messaging here is a minimal, hand-rolled, in-process pub/sub
broker — not Kafka, RabbitMQ, or SQS; no persistence, network,
partitioning, or real backoff delay. Supply chain security here reuses
npm's own **built-in** `npm sbom` and `npm audit` commands (no SBOM or
SCA dependency added) rather than a commercial SCA tool — it does not do
license-compliance checking or typosquatting detection. Compatibility
testing here covers exactly one real endpoint shape with a frozen JSON
Schema baseline and real AJV validation — not a generic OpenAPI diffing
engine. Each choice is disclosed in its own lab's `README.md` "Scope
boundary" section, consistent with this campaign's "avoid dependency
bloat, prefer a minimal real implementation — or the real library when no
reasonable substitute exists" principle.

## Three real findings this milestone

1. **A real, observed double-application bug.** The distributed-messaging
   lab ran the exact same simulated at-least-once redelivery (the side
   effect runs, then the handler throws) through two real consumer
   implementations differing only in a dedup check. The non-idempotent one
   really did apply its side effect twice (`appliedCount=2`); the
   idempotent one applied it exactly once (`appliedCount=1`). This is the
   single most common real bug at-least-once delivery semantics cause, and
   this lab reproduces it rather than asserting it from a diagram. See
   `01-DISTRIBUTED-MESSAGING.md`.
2. **A disclosed, not hidden, dependency-vulnerability count.** The
   supply-chain-security lab's real `npm audit` run found 24 vulnerable
   advisories across the full dependency graph (all dev-only, mostly the
   pre-existing `newman`/`postman` chain plus `testcontainers`'s own
   chain) and 0 in the production-only scope (`--omit=dev`). Both numbers
   are reported side by side, not just the flattering one. See
   `02-SUPPLY-CHAIN-SECURITY.md`.
3. **A real false-positive avoided by design, not luck.** While building
   the lockfile-integrity checker, a diagnostic run against this
   repository's real `package-lock.json` found 4 entries with a
   `resolved` field but no `integrity` hash — all 4 turned out to be this
   repo's own local npm workspaces (`link: true`), never downloaded, never
   able to carry an integrity hash. The checker explicitly excludes
   `link: true` entries, verified by a dedicated test. See
   `02-SUPPLY-CHAIN-SECURITY.md` and
   `automation-labs/supply-chain-security/EXECUTION.md`.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-DISTRIBUTED-MESSAGING.md` | At-least-once delivery, ordering, retries, dead-letter queues, idempotent consumers |
| `02-SUPPLY-CHAIN-SECURITY.md` | SBOM generation, vulnerability auditing, cross-referencing, lockfile integrity |
| `03-COMPATIBILITY-TESTING.md` | Backward-compatibility contracts, breaking vs. additive change classification |
| `COMMON-MISTAKES.md` | Real mistakes found and fixed while building these exact labs |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
competencies this area adds — every one has `professional: {status: NONE}`
unless an existing, independent professional source proves otherwise.
