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
| 22 | System Patterns | [`22-SYSTEM-PATTERNS/`](22-SYSTEM-PATTERNS/) | 9/22 patterns written at real depth (see that folder's own status table); remainder honestly marked NOT YET WRITTEN |
| 23 | Modern QA Engineering | `../QA-DEMO-SYSTEM/evidence/PHASE-14-MODERN-QA-LEARNING-LABS/` | Full |
| 24 | Learning Paths | [`24-LEARNING-PATHS/`](24-LEARNING-PATHS/) | 6 specialization paths, each built from real `gap.*` registry entries, not a generic curriculum |

## Additional topic, real and substantial, not in the 24-item list

- **Defect Management** — [`06-DEFECT-MANAGEMENT/`](06-DEFECT-MANAGEMENT/)
  (41 docs). The master taxonomy doesn't list this as a separate
  numbered topic; it is folded conceptually into QA Foundations / Test
  Management, but its existing content is substantial enough to keep
  as its own folder rather than force-merge it.

## What "meaningful canonical coverage" means here

None of the 24 topics above is a heading, a TODO, or a shallow stub.
Coverage depth still varies honestly by topic — `22-SYSTEM-PATTERNS/`
states its own 9/22 sub-coverage rather than claiming completeness it
doesn't have, and Mobile QA (#9) is knowledge-level by necessity (no
device/emulator infrastructure has ever existed in this repository's
build environment) rather than padded with fabricated execution
evidence. Every topic ties into the registry where a real link exists —
competencies, domains, tools, system patterns, labs, or evidence — not
as decoration but because that's how a reader traces a knowledge claim
back to something checkable.
