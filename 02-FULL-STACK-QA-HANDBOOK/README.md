# Full Stack QA Handbook

What a Full Stack QA Engineer should know — API, database, web, mobile,
integration, automation, performance, security, observability, CI/CD,
release, test management, and QA leadership. This is knowledge-base
content, not a personal claim: see
[`01-SALIM-BURAK-DIGITAL-TWIN/`](../01-SALIM-BURAK-DIGITAL-TWIN/) for
what any specific person actually knows/did/practiced.

## How to read this index

Each row is one of the 24 target topics. **Location** points to where
the real content for that topic actually lives today — inside this
folder (content migrated from the repository's original Phase 0-5
build), inside `QA-DEMO-SYSTEM/evidence/` (content produced by the
Phase 6-19 executable campaign), or marked `NOT YET WRITTEN` where
neither exists. No row is left implying content that isn't there —
that is exactly the "empty placeholder folder" problem this migration
removed (21 `.gitkeep`-only folders were deleted rather than kept as
fake progress).

| # | Topic | Location | Status |
|---|---|---|---|
| 1 | QA Foundations | [`00-QA-FOUNDATIONS/`](00-QA-FOUNDATIONS/) | Full (18 docs) |
| 2 | Product / Requirement Analysis | [`01-REQUIREMENT-ANALYSIS/`](01-REQUIREMENT-ANALYSIS/) | Full (13 docs) |
| 3 | Risk & Test Design | [`02-RISK-BASED-TESTING/`](02-RISK-BASED-TESTING/), [`03-TEST-DESIGN/`](03-TEST-DESIGN/) | Full (9 + 28 docs) |
| 4 | Manual / Exploratory QA | [`04-MANUAL-TESTING/`](04-MANUAL-TESTING/) | Thin (1 doc) |
| 5 | Software Architecture for QA | — | NOT YET WRITTEN |
| 6 | API & Service Testing | [`07-API-TESTING/`](07-API-TESTING/) + `../QA-DEMO-SYSTEM/evidence/P5-API-TESTING/`, `PHASE-6-GRAPHQL-WEBSOCKET-EVENT/` | Full |
| 7 | Database & Data Testing | `../QA-DEMO-SYSTEM/evidence/PHASE-7-DATABASE-TESTING/` | Full |
| 8 | Web QA | `../QA-DEMO-SYSTEM/evidence/PHASE-8-WEB-MOBILE-QA/`, `PHASE-9-VISUAL-ACCESSIBILITY/` | Full |
| 9 | Mobile QA | `../QA-DEMO-SYSTEM/evidence/PHASE-8-WEB-MOBILE-QA/MOBILE-LEARNING.md` | Learning-only (no device/emulator infra available) |
| 10 | Integration & Event Testing | `../QA-DEMO-SYSTEM/evidence/PHASE-6-GRAPHQL-WEBSOCKET-EVENT/` | Full |
| 11 | Automation Engineering | `../QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/`, [`05-EXECUTABLE-LABS/`](../05-EXECUTABLE-LABS/) (planned) | Full (Selenium/Appium/JMeter) |
| 12 | Performance & Reliability | `../QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/` (JMeter), `PHASE-14-MODERN-QA-LEARNING-LABS/` (Locust) | Full |
| 13 | Security-Aware QA | `../QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/` | Full |
| 14 | Observability & RCA | `../QA-DEMO-SYSTEM/evidence/PHASE-13-LOGGING-OBSERVABILITY/` | Full |
| 15 | CI/CD & Quality Gates | `../QA-DEMO-SYSTEM/evidence/PHASE-12-CICD-ENVIRONMENT/` | Full (real GitHub Actions) |
| 16 | Environment / Container / Cloud QA | `../QA-DEMO-SYSTEM/evidence/PHASE-12-CICD-ENVIRONMENT/ENVIRONMENT-CONCEPTS.md`, `PHASE-14-MODERN-QA-LEARNING-LABS/` (Docker) | Full (Docker execution environment-blocked, documented as such) |
| 17 | Release & Production QA | `../QA-DEMO-SYSTEM/evidence/PHASE-19-CLEAN/`, `PHASE-15-CASE-STUDIES/case-study-06-production-incident-investigation.md` | Full |
| 18 | Test Management | [`05-TEST-MANAGEMENT/`](05-TEST-MANAGEMENT/) | Full (31 docs) |
| 19 | QA Metrics & Reporting | `05-TEST-MANAGEMENT/14-QA-METRICS.md` (partial coverage inside Test Management) | Partial — no dedicated topic yet |
| 20 | Agile QA & Ownership | — | NOT YET WRITTEN |
| 21 | QA Leadership | — | NOT YET WRITTEN |
| 22 | System Patterns | [`22-SYSTEM-PATTERNS/`](22-SYSTEM-PATTERNS/) | Partial (priority patterns only — see that folder's README) |
| 23 | Modern QA Engineering | `../QA-DEMO-SYSTEM/evidence/PHASE-14-MODERN-QA-LEARNING-LABS/` | Full |
| 24 | Learning Paths | — | NOT YET WRITTEN |

## Additional topic, real and substantial, not in the 24-item list

- **Defect Management** — [`06-DEFECT-MANAGEMENT/`](06-DEFECT-MANAGEMENT/)
  (41 docs). The master taxonomy doesn't list this as a separate
  numbered topic; it is folded conceptually into QA Foundations / Test
  Management, but its existing content is substantial enough to keep
  as its own folder rather than force-merge it.

## Why some topics are `NOT YET WRITTEN` rather than stubbed

A `.gitkeep`-only folder claiming to be a chapter is worse than no
folder at all — it looks like progress and isn't. Topics without real
content are named here, honestly, as missing, rather than represented
by an empty directory.
