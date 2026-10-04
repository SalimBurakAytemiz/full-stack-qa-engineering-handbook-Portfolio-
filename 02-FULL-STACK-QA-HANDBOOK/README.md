# Full Stack QA Handbook

What a Full Stack QA Engineer should know — API, database, web, mobile,
integration, automation, performance, security, observability, CI/CD,
release, test management, and QA leadership. This is knowledge-base
content, not a personal claim: see
[`01-SALIM-BURAK-DIGITAL-TWIN/`](../01-SALIM-BURAK-DIGITAL-TWIN/) for
what any specific person actually knows/did/practiced.

## How to read this index

Each row is one of the 24 target topics, all now carrying real,
non-placeholder canonical content. **Location** points to where that
content actually lives — inside this folder, inside
`QA-DEMO-SYSTEM/evidence/` (content produced by the Phase 6-19
executable campaign), or a combination. Coverage depth is
intentionally uneven (a topic backed by real executable evidence has
more to say than one that's pure concept) — that's honest variation,
not incompleteness; no row implies content that isn't there.

| # | Topic | Location | Coverage |
|---|---|---|---|
| 1 | QA Foundations | [`00-QA-FOUNDATIONS/`](00-QA-FOUNDATIONS/) | 18 docs |
| 2 | Product / Requirement Analysis | [`01-REQUIREMENT-ANALYSIS/`](01-REQUIREMENT-ANALYSIS/) | 13 docs |
| 3 | Risk & Test Design | [`02-RISK-BASED-TESTING/`](02-RISK-BASED-TESTING/), [`03-TEST-DESIGN/`](03-TEST-DESIGN/) | 9 + 28 docs |
| 4 | Manual / Exploratory QA | [`04-MANUAL-TESTING/`](04-MANUAL-TESTING/) | SBTM, heuristics (SFDPOT/CRUD), bug advocacy, scripted-vs-exploratory |
| 5 | Software Architecture for QA | [`08-SOFTWARE-ARCHITECTURE-FOR-QA/`](08-SOFTWARE-ARCHITECTURE-FOR-QA/) | Client-server, monolith-vs-microservices, sync/async, gateway, caching, event-driven — each grounded in `QA-DEMO-SYSTEM`'s real architecture |
| 6 | API & Service Testing | [`07-API-TESTING/`](07-API-TESTING/) + `../QA-DEMO-SYSTEM/evidence/P5-API-TESTING/`, `PHASE-6-GRAPHQL-WEBSOCKET-EVENT/` | Full, executable |
| 7 | Database & Data Testing | `../QA-DEMO-SYSTEM/evidence/PHASE-7-DATABASE-TESTING/` | Full, executable |
| 8 | Web QA | `../QA-DEMO-SYSTEM/evidence/PHASE-8-WEB-MOBILE-QA/`, `PHASE-9-VISUAL-ACCESSIBILITY/` | Full, executable |
| 9 | Mobile QA | [`09-MOBILE-QA/`](09-MOBILE-QA/) | App types, device matrix, permissions, lifecycle, network conditions, push/deep-links, automation strategy — knowledge-level, honestly disclosed as not repository-executable |
| 10 | Integration & Event Testing | `../QA-DEMO-SYSTEM/evidence/PHASE-6-GRAPHQL-WEBSOCKET-EVENT/` | Full, executable |
| 11 | Automation Engineering | `../QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/`, [`05-EXECUTABLE-LABS/`](../05-EXECUTABLE-LABS/) | Full (Selenium/Appium/JMeter) |
| 12 | Performance & Reliability | `../QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/` (JMeter), `PHASE-14-MODERN-QA-LEARNING-LABS/` (Locust) | Full, executable |
| 13 | Security-Aware QA | `../QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/` | Full |
| 14 | Observability & RCA | `../QA-DEMO-SYSTEM/evidence/PHASE-13-LOGGING-OBSERVABILITY/` | Full, executable |
| 15 | CI/CD & Quality Gates | `../QA-DEMO-SYSTEM/evidence/PHASE-12-CICD-ENVIRONMENT/` | Full, real GitHub Actions |
| 16 | Environment / Container / Cloud QA | `../QA-DEMO-SYSTEM/evidence/PHASE-12-CICD-ENVIRONMENT/ENVIRONMENT-CONCEPTS.md`, `PHASE-14-MODERN-QA-LEARNING-LABS/` (Docker) | Full (Docker execution environment-blocked, documented as such) |
| 17 | Release & Production QA | `../QA-DEMO-SYSTEM/evidence/PHASE-19-CLEAN/`, `PHASE-15-CASE-STUDIES/case-study-06-production-incident-investigation.md` | Full |
| 18 | Test Management | [`05-TEST-MANAGEMENT/`](05-TEST-MANAGEMENT/) | 31 docs |
| 19 | QA Metrics & Reporting | [`19-QA-METRICS-AND-REPORTING/`](19-QA-METRICS-AND-REPORTING/) + `05-TEST-MANAGEMENT/14-QA-METRICS.md` | Metrics (existing) + reporting artifacts (HTML reports, contextualized-metric pattern, evidence maturity scale) |
| 20 | Agile QA & Ownership | [`20-AGILE-QA-AND-OWNERSHIP/`](20-AGILE-QA-AND-OWNERSHIP/) | DoR/DoD, shift-left, acceptance criteria, ceremonies, whole-team ownership mechanics |
| 21 | QA Leadership | [`21-QA-LEADERSHIP/`](21-QA-LEADERSHIP/) | Test strategy ownership, quality-gate design, ship/no-ship calls, mentoring, upward reporting |
| 22 | System Patterns | [`22-SYSTEM-PATTERNS/`](22-SYSTEM-PATTERNS/) | 23/23 patterns written at real depth (see that folder's own status table for each pattern's real IMPLEMENTED/NOT_IMPLEMENTED/NOT_APPLICABLE/DOCUMENTED_ONLY status) |
| 23 | Modern QA Engineering | `../QA-DEMO-SYSTEM/evidence/PHASE-14-MODERN-QA-LEARNING-LABS/` | Full |
| 24 | Learning Paths | [`24-LEARNING-PATHS/`](24-LEARNING-PATHS/) | 6 specialization paths, each built from real `gap.*` registry entries, not a generic curriculum |

## Additional topics, real and substantial, not in the 24-item list

- **Defect Management** — [`06-DEFECT-MANAGEMENT/`](06-DEFECT-MANAGEMENT/)
  (41 docs). The master taxonomy doesn't list this as a separate
  numbered topic; it is folded conceptually into QA Foundations / Test
  Management, but its existing content is substantial enough to keep
  as its own folder rather than force-merge it.

- **Advanced QA Engineering** — [`25-ADVANCED-QA-ENGINEERING/`](25-ADVANCED-QA-ENGINEERING/).
  Next-generation QA practices beyond the base 24 topics. Currently
  covers **AI/ML/LLM Systems Testing** in real depth — a genuine,
  executable, deterministic mock-first lab
  (`QA-DEMO-SYSTEM/automation-labs/ai-systems/`, 35 passing tests
  across prompt testing, golden-set evaluation, structured-output
  validation, RAG groundedness/citation checks, agent tool-calling,
  safety/privacy leakage detection, and provider-regression detection)
  with matching handbook docs at
  [`25-ADVANCED-QA-ENGINEERING/AI-ML-LLM-SYSTEMS-TESTING/`](25-ADVANCED-QA-ENGINEERING/AI-ML-LLM-SYSTEMS-TESTING/).
  Also covers **Reliability, Chaos Engineering & Privacy Testing** —
  two more genuine, executable labs
  (`QA-DEMO-SYSTEM/automation-labs/chaos-reliability/`, 17 passing
  tests: a real circuit-breaker state machine, bounded-retry/timeout
  client, and composed failure-recovery scenarios against a
  deterministic fault-injection fixture; and
  `QA-DEMO-SYSTEM/automation-labs/privacy-testing/`, 17 passing tests:
  a recursive sensitive-field/PII response scanner — including real
  integration against the live backend — plus a disclosed GDPR-style
  data-subject-rights fixture) with matching handbook docs at
  [`25-ADVANCED-QA-ENGINEERING/RELIABILITY-CHAOS-PRIVACY-TESTING/`](25-ADVANCED-QA-ENGINEERING/RELIABILITY-CHAOS-PRIVACY-TESTING/).
  Also covers **Service Virtualization, Contract, Property-Based &
  Fuzz Testing** — two more genuine, executable labs
  (`QA-DEMO-SYSTEM/automation-labs/service-virtualization/`, 11 passing
  tests: a real WireMock-style stub server plus consumer-driven
  contract testing verified both against a virtualized double and the
  real, running backend; and
  `QA-DEMO-SYSTEM/automation-labs/property-and-fuzz-testing/`, 16
  passing tests: a real hand-rolled property-based testing framework
  applied to the backend's real service functions, plus fuzz testing
  against the real, running API that found and drove the fix for a
  genuine backend bug — an oversized request body was falling through
  to a raw 500 instead of a proper 413) with matching handbook docs at
  [`25-ADVANCED-QA-ENGINEERING/SERVICE-VIRTUALIZATION-CONTRACT-PROPERTY-FUZZ-TESTING/`](25-ADVANCED-QA-ENGINEERING/SERVICE-VIRTUALIZATION-CONTRACT-PROPERTY-FUZZ-TESTING/).
  Also covers **Mutation Testing, Testcontainers & Data Engineering** —
  three more genuine, executable labs
  (`QA-DEMO-SYSTEM/automation-labs/mutation-testing/`: a real, hand-rolled
  mutation generator run against the backend's real, unmodified
  `products.service.js`, including a genuine equivalent-mutant finding;
  `QA-DEMO-SYSTEM/automation-labs/testcontainers-lab/`: the real
  `testcontainers` npm package starting a real Docker container,
  honestly `EXTERNALLY_BLOCKED` in this no-daemon sandbox; and
  `QA-DEMO-SYSTEM/automation-labs/data-engineering/`: real ETL plus four
  real data-quality checks — referential integrity, uniqueness,
  reconciliation, schema drift — each proven to actually detect what it
  claims to) with matching handbook docs at
  [`25-ADVANCED-QA-ENGINEERING/MUTATION-TESTING-TESTCONTAINERS-DATA-ENGINEERING/`](25-ADVANCED-QA-ENGINEERING/MUTATION-TESTING-TESTCONTAINERS-DATA-ENGINEERING/).
  Also covers **Distributed Messaging, Supply Chain Security &
  Compatibility Testing** — three more genuine, executable labs
  (`QA-DEMO-SYSTEM/automation-labs/distributed-messaging/`: a real,
  hand-rolled in-process pub/sub broker proving ordering, dead-letter
  routing, and a real observed non-idempotent-consumer double-application
  bug versus an idempotent fix on the same simulated failure;
  `QA-DEMO-SYSTEM/automation-labs/supply-chain-security/`: npm's own
  built-in `npm sbom` and `npm audit` run for real against this actual
  repository — 76 real SBOM components, 24 full-graph vs. 0
  production-only vulnerabilities, both disclosed, plus a
  lockfile-integrity checker that correctly excludes this repo's own
  local workspace packages; and
  `QA-DEMO-SYSTEM/automation-labs/compatibility-testing/`: a frozen
  baseline JSON Schema contract validated against the backend's real
  current response shape, with breaking-vs-additive classification
  proven against deliberately constructed candidates) with matching
  handbook docs at
  [`25-ADVANCED-QA-ENGINEERING/DISTRIBUTED-MESSAGING-SUPPLY-CHAIN-COMPATIBILITY/`](25-ADVANCED-QA-ENGINEERING/DISTRIBUTED-MESSAGING-SUPPLY-CHAIN-COMPATIBILITY/).
  Also covers **i18n, Modern Protocols & Production Verification** —
  three more genuine, executable labs
  (`QA-DEMO-SYSTEM/automation-labs/i18n-testing/`: real locale-distinct
  formatting via Node's own `Intl` API plus a real Unicode round-trip —
  Turkish, Japanese, an emoji outside the Basic Multilingual Plane, and
  right-to-left Arabic — through the backend's real database and
  service layer, including a real finding that German ICU currency
  formatting uses a non-breaking space the lab's first test draft
  missed;
  `QA-DEMO-SYSTEM/automation-labs/modern-protocols/`: a real,
  hand-rolled Server-Sent Events server and client proving genuine
  progressive delivery timed against real wall-clock gaps and correct
  `Last-Event-ID` reconnection semantics; and
  `QA-DEMO-SYSTEM/automation-labs/production-verification/`: a real
  synthetic-monitoring smoke-test runner against a real running
  backend, classifying each check as PASS/SLOW/FAIL rather than a
  single boolean, with an honest `NOT_EXECUTED` result when no backend
  is reachable) with matching handbook docs at
  [`25-ADVANCED-QA-ENGINEERING/I18N-MODERN-PROTOCOLS-PRODUCTION-VERIFICATION/`](25-ADVANCED-QA-ENGINEERING/I18N-MODERN-PROTOCOLS-PRODUCTION-VERIFICATION/).
  Also covers **Desktop QA & Advanced Release Engineering** — one more
  genuine, executable lab
  (`QA-DEMO-SYSTEM/automation-labs/release-engineering/`: a real
  hand-rolled semver 2.0.0 parser/comparator and Keep-a-Changelog
  structural checker, run against this repository's own real
  `CHANGELOG.md` and all 6 real workspace `package.json` files, plus a
  real canary-rollout state machine proving both pass-through-to-100%
  and automatic-rollback-on-a-real-injected-failure with the same
  unmodified code), with Desktop QA documented LEARNING-only (the same
  infrastructure-gap class as Mobile/Appium — no real desktop
  application exists in this repository to automate), and matching
  handbook docs at
  [`25-ADVANCED-QA-ENGINEERING/DESKTOP-QA-RELEASE-ENGINEERING/`](25-ADVANCED-QA-ENGINEERING/DESKTOP-QA-RELEASE-ENGINEERING/).
  Professional experience for this whole area is explicitly `NONE` in
  the Digital Twin registry — this is repository practice only,
  disclosed as such throughout (see each folder's `README.md`
  scope-boundary note). This completes Part 2 (Milestones 2.1-2.7, all
  CI-verified — see `.ai/PART-2-FINAL-REPORT.md`).

- **Platform Engineering & Quality Gates** — [`26-PLATFORM-ENGINEERING-QUALITY-GATES/`](26-PLATFORM-ENGINEERING-QUALITY-GATES/).
  Part 3 — platform-level QA concerns beneath or around individual
  features. Currently covers **Database Migration & Multi-Tenancy
  Data Isolation** — two genuine, executable labs
  (`QA-DEMO-SYSTEM/automation-labs/db-migration-testing/`: a real,
  hand-rolled migration runner driving a real in-memory SQLite
  database through 3 real migrations, proving forward application,
  zero-downtime column-addition backfill, idempotent re-apply, and
  exact single-step rollback; and
  `QA-DEMO-SYSTEM/automation-labs/multi-tenancy-isolation/`: a real
  tenant-scoped data-access layer proven against a real SQLite
  database seeded with two real tenants' rows, including a
  deliberately unsafe comparison repository that proves the real
  cross-tenant leak the safe one prevents) with matching handbook docs
  at
  [`26-PLATFORM-ENGINEERING-QUALITY-GATES/DATABASE-MIGRATION-MULTI-TENANCY/`](26-PLATFORM-ENGINEERING-QUALITY-GATES/DATABASE-MIGRATION-MULTI-TENANCY/).
  Also covers **API Idempotency-Key Replay-Safety & Rate Limiting** —
  two more genuine, executable labs
  (`QA-DEMO-SYSTEM/automation-labs/idempotency-testing/`: a real,
  hand-rolled HTTP server implementing Stripe's own real
  `Idempotency-Key` convention, backed by an in-flight-promise store
  proven safe under a genuine 10-way concurrent race; and
  `QA-DEMO-SYSTEM/automation-labs/rate-limiting/`: a real hand-rolled
  token-bucket limiter backing a real HTTP server, proven to accept
  within capacity, reject over capacity with a real `429`, and refill
  correctly over real elapsed time via an injected fake clock) with
  matching handbook docs at
  [`26-PLATFORM-ENGINEERING-QUALITY-GATES/API-IDEMPOTENCY-RATE-LIMITING/`](26-PLATFORM-ENGINEERING-QUALITY-GATES/API-IDEMPOTENCY-RATE-LIMITING/).
  Professional experience for this area is explicitly `NONE` in the
  Digital Twin registry — repository practice only. Further
  platform-engineering subtopics are planned but not yet added.

## What "meaningful canonical coverage" means here

None of the 24 topics above is a heading, a TODO, or a shallow stub.
Coverage depth still varies honestly by topic — `22-SYSTEM-PATTERNS/`
has all 23/23 pattern pages written at real depth, but "written" does
not mean "implemented in this repository's codebase": each page states
its own real status (see that folder's own status table), and roughly
half are honestly `NOT_IMPLEMENTED` or `NOT_APPLICABLE` — a verified,
stated gap, not a padded claim of completeness the codebase doesn't
have. Mobile QA (#9) is knowledge-level by necessity (no
device/emulator infrastructure has ever existed in this repository's
build environment) rather than padded with fabricated execution
evidence. Every topic ties into the registry where a real link exists —
competencies, domains, tools, system patterns, labs, or evidence — not
as decoration but because that's how a reader traces a knowledge claim
back to something checkable.
