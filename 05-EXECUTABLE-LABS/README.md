# 05-EXECUTABLE-LABS — QA Reference Platform

## Architecture decision: mapping layer, not a code move

The master transformation spec asks for `QA-DEMO-SYSTEM` to be refactored
into a modular `QA-REFERENCE-PLATFORM` with `TEST-PACKS/` and
`AUTOMATION-LABS/` structure. This directory implements that as a
**documented mapping layer over the existing, unmoved `QA-DEMO-SYSTEM`
code**, not a physical directory move.

Reason: `QA-DEMO-SYSTEM` is a real, working, CI-verified system —
157 backend tests passing, a 4-job GitHub Actions pipeline, Playwright,
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
