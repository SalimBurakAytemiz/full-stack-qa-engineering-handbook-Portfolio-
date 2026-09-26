# Competency Matrix

Source of truth: [`registry/competency-state.yaml`](registry/competency-state.yaml).
This table is authored to match that file exactly; a generator script
(`scripts/registry/generate-competency-matrix.mjs`) that produces this
table automatically is planned but not yet implemented in this
increment — until it exists, treat the YAML as canonical if the two
ever disagree.

Legend — **Knowledge:** AWARE < WORKING < INDEPENDENT < ADVANCED.
**Professional:** NONE < OBSERVED < PARTICIPATED < EXECUTED < OWNED.
**Repository:** NOT_PRACTICED < DOCUMENTED < IMPLEMENTED < EXECUTED < CI_VERIFIED < AUDITED.

| Competency | Knowledge | Professional | Repository |
|---|---|---|---|
| Appium (mobile automation) | INDEPENDENT | execution: EXECUTED, planning: PARTICIPATED, framework: NONE | DOCUMENTED |
| Selenium (web automation) | WORKING | NONE | CI_VERIFIED |
| Playwright (web automation) | WORKING | NONE | CI_VERIFIED |
| JMeter (performance) | WORKING | execution: EXECUTED, framework: NONE | IMPLEMENTED |
| Jenkins (CI/CD) | WORKING | execution: EXECUTED, pipeline-from-scratch: NONE | DOCUMENTED |
| Docker | WORKING | NONE | IMPLEMENTED |
| Elastic (log analysis / RCA) | INDEPENDENT | EXECUTED | NOT_PRACTICED |
| Request correlation / structured logging | INDEPENDENT | NONE | CI_VERIFIED |
| OpenTelemetry / Jaeger | AWARE | NONE | NOT_PRACTICED |
| Security-aware QA (auth/authz/RBAC/IDOR/XSS-SQLi-oriented) | WORKING | PARTICIPATED | CI_VERIFIED |
| Burp Suite | AWARE | NONE | NOT_PRACTICED |
| OWASP ZAP | AWARE | NONE | NOT_PRACTICED |
| SQL for QA / data validation | INDEPENDENT | EXECUTED | CI_VERIFIED |
| GraphQL | INDEPENDENT | EXECUTED | CI_VERIFIED |
| WebSocket / realtime events | INDEPENDENT | EXECUTED | CI_VERIFIED |
| REST API testing | ADVANCED | EXECUTED | CI_VERIFIED |
| Postman / Newman / AJV / JSON Schema | ADVANCED | EXECUTED | CI_VERIFIED |
| React / React Native / Flutter (QA exposure) | WORKING | EXECUTED | NOT_PRACTICED |
| AWS / MUX / Agora (integration/provider QA) | AWARE | PARTICIPATED | NOT_PRACTICED |
| Accessibility testing (axe-core) | WORKING | NONE | CI_VERIFIED |
| Visual regression / pixel-perfect comparison | WORKING | EXECUTED | CI_VERIFIED |
| Locust (load testing) | WORKING | NONE | EXECUTED |

## Reading this table correctly

- A `CI_VERIFIED` repository column does **not** upgrade the professional
  column. Selenium is `CI_VERIFIED` in this repository (a real
  GitHub Actions job runs it against a real browser) but professional
  status stays `NONE` — no professional source confirms it.
- A high professional column does **not** upgrade repository status.
  Elastic is professionally `EXECUTED` (real RCA work) but this
  repository has no Elastic stack to run against — it is
  `NOT_PRACTICED` here by design, and uses correlation-ID/structured
  logging instead (a separate, `CI_VERIFIED` row).
- `IMPLEMENTED` (not `CI_VERIFIED`) on JMeter and Docker means: real
  code/config exists and was validated as far as the environment
  allows, but the underlying runtime (native JMeter execution, Docker
  daemon) was not available to prove end-to-end. See
  `QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/EXECUTION.md`
  and `QA-DEMO-SYSTEM/evidence/PHASE-14-MODERN-QA-LEARNING-LABS/EXECUTION.md`
  for the exact environment-limitation evidence.
