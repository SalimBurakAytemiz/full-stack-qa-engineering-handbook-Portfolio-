# 05-EXECUTABLE-LABS — QA Reference Platform

## Architecture decision: mapping layer, not a code move

The master transformation spec asks for `QA-DEMO-SYSTEM` to be refactored
into a modular `QA-REFERENCE-PLATFORM` with `TEST-PACKS/` and
`AUTOMATION-LABS/` structure. This directory implements that as a
**documented mapping layer over the existing, unmoved `QA-DEMO-SYSTEM`
code**, not a physical directory move.

Reason: `QA-DEMO-SYSTEM` is a real, working, CI-verified system —
157 backend tests passing, the repository's current multi-job GitHub
Actions QA pipeline (see `.github/workflows/ci.yml` for the current job
set — deliberately not restated as a fixed number here, since an
earlier count went stale as the workflow grew), Playwright,
Selenium, JMeter, and API contract suites all wired to real npm scripts
and real relative `require()`/import paths. A file-system-level move (or
copy) risks breaking those paths and workspace boundaries (npm
workspaces reference `QA-DEMO-SYSTEM/backend`, `QA-DEMO-SYSTEM/api-tests`,
etc. by path in `QA-DEMO-SYSTEM/package.json`) for a purely cosmetic
reorganization. The Handbook migration (`02-FULL-STACK-QA-HANDBOOK/`)
used `git mv` because it moved *inert markdown*; this is *executable
code with a passing CI pipeline*, so the same operation carries real
regression risk for no functional gain.

`shared/registry/catalog/labs.yaml` and `06-EVIDENCE/evidence.yaml` are
the actual TEST-PACK/AUTOMATION-LAB catalog (Section 22-30) — each entry
has a stable `lab.*` id, a maturity level (L0-L5), and a real path into
`QA-DEMO-SYSTEM`. That registry, not a folder move, is what makes the
lab catalog navigable and machine-checkable (see
`npm run registry:validate`).

## TEST-PACKS (real path → catalog id)

| Test Pack | Real location | Catalog id | Maturity |
|---|---|---|---|
| Backend API (REST/GraphQL/WebSocket) | `QA-DEMO-SYSTEM/backend` | `lab.backend-api.rest-graphql-websocket` | L4_CI_VERIFIED |
| API Contract (Postman/Newman/AJV) | `QA-DEMO-SYSTEM/api-tests` | `lab.api-contract.postman-newman-ajv` | L4_CI_VERIFIED |
| Database / SQL validation | `QA-DEMO-SYSTEM/backend` (db-tests within the backend workspace) | `lab.database.sql-validation` | L4_CI_VERIFIED |

## AUTOMATION-LABS (real path → catalog id)

| Automation Lab | Real location | Catalog id | Maturity |
|---|---|---|---|
| Web — Playwright | `QA-DEMO-SYSTEM/web-tests` | `lab.web-automation.playwright` | L3_AUTOMATED |
| Web — Selenium | `QA-DEMO-SYSTEM/automation-labs/selenium` | `lab.web-automation.selenium` | L4_CI_VERIFIED |
| Performance — JMeter | `QA-DEMO-SYSTEM/automation-labs/jmeter` | `lab.performance.jmeter` | L3_AUTOMATED |
| Performance — Locust | `QA-DEMO-SYSTEM/automation-labs/locust` | `lab.performance.locust` | L2_TESTED |
| Security — OWASP mapping | `QA-DEMO-SYSTEM/backend/tests/security.test.js` + `QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/` | `lab.security.owasp-mapping` | L1_IMPLEMENTED |
| CI/CD — GitHub Actions | `.github/workflows/ci.yml` | `lab.cicd.github-actions` | L4_CI_VERIFIED |
| AI Systems Testing — mock-first | `QA-DEMO-SYSTEM/automation-labs/ai-systems` | `lab.ai-systems.mock-first-testing` | L4_CI_VERIFIED |
| Chaos/Reliability — fault injection | `QA-DEMO-SYSTEM/automation-labs/chaos-reliability` | `lab.chaos-reliability.fault-injection` | L4_CI_VERIFIED |
| Privacy Testing — PII scan + data-subject-rights | `QA-DEMO-SYSTEM/automation-labs/privacy-testing` | `lab.privacy-testing.pii-and-data-subject-rights` | L4_CI_VERIFIED |
| Service Virtualization & Contract Testing | `QA-DEMO-SYSTEM/automation-labs/service-virtualization` | `lab.service-virtualization.stub-and-contract-testing` | L4_CI_VERIFIED |
| Property-Based & Fuzz Testing | `QA-DEMO-SYSTEM/automation-labs/property-and-fuzz-testing` | `lab.property-and-fuzz-testing.generative-and-api-fuzzing` | L4_CI_VERIFIED |
| Mutation Testing | `QA-DEMO-SYSTEM/automation-labs/mutation-testing` | `lab.mutation-testing.real-mutants-vs-real-tests` | L4_CI_VERIFIED |
| Testcontainers | `QA-DEMO-SYSTEM/automation-labs/testcontainers-lab` | `lab.testcontainers.real-container-lifecycle` | L4_CI_VERIFIED |
| Data Engineering — ETL & Data Quality | `QA-DEMO-SYSTEM/automation-labs/data-engineering` | `lab.data-engineering.etl-and-data-quality` | L4_CI_VERIFIED |
| Distributed Messaging — broker + idempotent consumer | `QA-DEMO-SYSTEM/automation-labs/distributed-messaging` | `lab.distributed-messaging.broker-and-idempotent-consumer` | L4_CI_VERIFIED |
| Supply Chain Security — SBOM + audit + lockfile integrity | `QA-DEMO-SYSTEM/automation-labs/supply-chain-security` | `lab.supply-chain-security.sbom-audit-lockfile` | L4_CI_VERIFIED |
| Compatibility Testing — breaking-change detection | `QA-DEMO-SYSTEM/automation-labs/compatibility-testing` | `lab.compatibility-testing.breaking-change-detection` | L4_CI_VERIFIED |
| i18n Testing — Intl locale formatting + Unicode round-trip | `QA-DEMO-SYSTEM/automation-labs/i18n-testing` | `lab.i18n-testing.locale-formatting-and-unicode-roundtrip` | L4_CI_VERIFIED |
| Modern Protocols — Server-Sent Events | `QA-DEMO-SYSTEM/automation-labs/modern-protocols` | `lab.modern-protocols.server-sent-events` | L4_CI_VERIFIED |
| Production Verification — synthetic smoke-test monitor | `QA-DEMO-SYSTEM/automation-labs/production-verification` | `lab.production-verification.synthetic-smoke-monitor` | L4_CI_VERIFIED |
| Release Engineering — semver/changelog integrity + canary rollout | `QA-DEMO-SYSTEM/automation-labs/release-engineering` | `lab.release-engineering.semver-changelog-and-canary-rollout` | L4_CI_VERIFIED |
| Database Migration & Schema Evolution Testing | `QA-DEMO-SYSTEM/automation-labs/db-migration-testing` | `lab.db-migration-testing.real-sqlite-migration-runner` | L4_CI_VERIFIED |
| Multi-Tenancy Data Isolation Testing | `QA-DEMO-SYSTEM/automation-labs/multi-tenancy-isolation` | `lab.multi-tenancy-isolation.tenant-scoped-repository` | L4_CI_VERIFIED |
| API Idempotency-Key Replay-Safety Testing | `QA-DEMO-SYSTEM/automation-labs/idempotency-testing` | `lab.idempotency-testing.in-flight-promise-store` | L3_AUTOMATED |
| Rate Limiting & Abuse Testing — token bucket | `QA-DEMO-SYSTEM/automation-labs/rate-limiting` | `lab.rate-limiting.token-bucket-limiter` | L3_AUTOMATED |

The AI Systems Testing lab is Part 2's first addition —
`AI_TEST_MODE=mock` is its default and only canonical-CI mode: no real
LLM API, no API key, deterministic (see the lab's own `README.md` for
the scope boundary and `02-FULL-STACK-QA-HANDBOOK/25-ADVANCED-QA-ENGINEERING/AI-ML-LLM-SYSTEMS-TESTING/`
for the matching handbook content). Its 5 covered competencies all have
`professional: {status: NONE}` in the Digital Twin registry — genuinely
new, repository-only ground, not inflated into professional experience.

The Chaos/Reliability and Privacy Testing labs are Part 2 Milestone
2.2's addition — see each lab's own `README.md` for its scope boundary
(a locally-controlled fault-injection fixture, not real chaos
infrastructure; a disclosed in-memory fixture for GDPR-style
data-subject-rights testing, since QA-DEMO-SYSTEM's real backend has no
such endpoints) and `02-FULL-STACK-QA-HANDBOOK/25-ADVANCED-QA-ENGINEERING/RELIABILITY-CHAOS-PRIVACY-TESTING/`
for the matching handbook content. All 4 covered competencies have
`professional: {status: NONE}` in the Digital Twin registry.

The Service Virtualization/Contract and Property-Based/Fuzz Testing
labs are Part 2 Milestone 2.3's addition — see each lab's own
`README.md` for its scope boundary (a self-built stub server and
ajv-based contract verifier rather than WireMock/Pact; a hand-rolled
property-testing framework rather than fast-check; fixed, disclosed
fuzz-value sets rather than coverage-guided mutation) and
`02-FULL-STACK-QA-HANDBOOK/25-ADVANCED-QA-ENGINEERING/SERVICE-VIRTUALIZATION-CONTRACT-PROPERTY-FUZZ-TESTING/`
for the matching handbook content. The fuzz-testing lab found and drove
the fix for a real bug in `backend/src/middleware/errorHandler.js`
(oversized request bodies returning 500 instead of 413). All 4 covered
competencies have `professional: {status: NONE}` in the Digital Twin
registry.

The Mutation Testing, Testcontainers, and Data Engineering labs are Part
2 Milestone 2.4's addition — see each lab's own `README.md` for its
scope boundary (a minimal, text-based mutation generator rather than
Stryker/PIT, including a genuine equivalent-mutant finding documented
honestly rather than hidden; the real `testcontainers` library,
deliberately, since no reasonable minimal substitute exists; a minimal
in-process ETL/data-quality check set rather than Airflow/dbt/Great
Expectations) and
`02-FULL-STACK-QA-HANDBOOK/25-ADVANCED-QA-ENGINEERING/MUTATION-TESTING-TESTCONTAINERS-DATA-ENGINEERING/`
for the matching handbook content. The Testcontainers lab reports
`EXTERNALLY_BLOCKED` in this sandbox (no reachable Docker daemon) but
genuinely reported `EXECUTED` in its GitHub Actions `ubuntu-latest` CI
run, which does have one (real container, real mapped port, real `200`
response — see the lab's own `EXECUTION.md`). All competencies these
three labs cover have `professional: {status: NONE}` in the Digital Twin
registry.

Mobile (Appium) has no lab entry: there is no real device/emulator
infrastructure in this repository, and Section 47's anti-placeholder
rule means an empty `automation-labs/appium/` folder is not created just
to claim coverage — see `01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml#gap.appium.repo-device-evidence`
and the Digital Twin's `09-GAP-AND-LEARNING-MAP.md`.

## Running the labs

All real run commands are the existing `QA-DEMO-SYSTEM` npm workspace
scripts — see `QA-DEMO-SYSTEM/package.json` and
`QA-DEMO-SYSTEM/ARCHITECTURE.md`. This directory does not duplicate or
wrap those commands; it only indexes them.

## Full architecture, case studies, and phase-by-phase evidence

See `QA-DEMO-SYSTEM/ARCHITECTURE.md` and `QA-DEMO-SYSTEM/evidence/` for
the complete build history (Phases 4-19) that produced the code this
directory indexes.
