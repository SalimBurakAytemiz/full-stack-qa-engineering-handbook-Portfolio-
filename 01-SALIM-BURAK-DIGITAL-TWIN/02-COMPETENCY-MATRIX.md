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
| JMeter (performance) | WORKING | execution: EXECUTED, planning: PARTICIPATED, framework: NONE | IMPLEMENTED |
| Jenkins (CI/CD) | WORKING | execution: EXECUTED, pipeline-from-scratch: NONE | DOCUMENTED |
| Docker | WORKING | NONE | IMPLEMENTED |
| Elastic (log analysis / RCA) | INDEPENDENT | EXECUTED | NOT_PRACTICED |
| Request correlation / structured logging | INDEPENDENT | NONE | CI_VERIFIED |
| OpenTelemetry / Jaeger | AWARE | NONE | NOT_PRACTICED |
| Security-aware QA (auth/authz/RBAC/IDOR/XSS-SQLi-oriented) | WORKING | NONE | CI_VERIFIED |
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
| LLM Prompt & Golden-Set Evaluation Testing | WORKING | NONE | CI_VERIFIED |
| Structured-Output & RAG Testing | WORKING | NONE | CI_VERIFIED |
| AI Agent & Tool-Calling Testing | WORKING | NONE | CI_VERIFIED |
| AI Safety, Security & Privacy Testing | WORKING | NONE | CI_VERIFIED |
| AI Provider/Model Regression & Cost-Latency Budget Testing | WORKING | NONE | CI_VERIFIED |
| Chaos Engineering & Fault-Injection Testing | WORKING | NONE | CI_VERIFIED |
| Circuit Breaker & Resilience Pattern Testing | WORKING | NONE | CI_VERIFIED |
| PII / Sensitive-Data Response Scanning | WORKING | NONE | CI_VERIFIED |
| GDPR-Style Data-Subject-Rights Testing | WORKING | NONE | CI_VERIFIED |
| Service Virtualization (WireMock-Style Stub Servers) | WORKING | NONE | CI_VERIFIED |
| Consumer-Driven Contract Testing | WORKING | NONE | CI_VERIFIED |
| Property-Based Testing (Generative/Invariant Testing) | WORKING | NONE | CI_VERIFIED |
| Structured API Fuzz Testing | WORKING | NONE | CI_VERIFIED |
| Mutation Testing (Mutation-Based Test Adequacy) | WORKING | NONE | CI_VERIFIED |
| Testcontainers-Style Container-Based Integration Testing | WORKING | NONE | CI_VERIFIED |
| ETL Pipeline Testing | WORKING | NONE | CI_VERIFIED |
| Data Quality Validation (Referential Integrity, Reconciliation, Schema Drift) | WORKING | NONE | CI_VERIFIED |
| Distributed Messaging — Delivery Semantics, Ordering & Dead-Letter Queues | WORKING | NONE | CI_VERIFIED |
| Idempotent Consumer Design Under At-Least-Once Delivery | WORKING | NONE | CI_VERIFIED |
| SBOM Generation & Vulnerability Auditing | WORKING | NONE | CI_VERIFIED |
| Lockfile Integrity Verification (SRI Hash Coverage) | WORKING | NONE | CI_VERIFIED |
| API Backward-Compatibility & Breaking-Change Detection | WORKING | NONE | CI_VERIFIED |
| Locale-Aware Formatting (Intl Number/Date/Currency) | WORKING | NONE | CI_VERIFIED |
| Unicode Data Integrity (Multi-Byte Round-Trip) | WORKING | NONE | CI_VERIFIED |
| Modern Protocols — Server-Sent Events (Streaming, Reconnection) | WORKING | NONE | CI_VERIFIED |
| Production Verification — Synthetic Monitoring / Smoke Tests | WORKING | NONE | CI_VERIFIED |
| Desktop QA — Cross-Platform Native UI Automation Concepts | WORKING | NONE | DOCUMENTED |
| Release Versioning & Changelog Integrity Testing | WORKING | NONE | CI_VERIFIED |
| Canary Rollout & Automatic Rollback Testing | WORKING | NONE | CI_VERIFIED |
| Database Migration & Schema Evolution Testing | WORKING | NONE | CI_VERIFIED |
| Multi-Tenancy Data Isolation Testing | WORKING | NONE | CI_VERIFIED |
| API Idempotency-Key Replay-Safety Testing | WORKING | NONE | CI_VERIFIED |
| Rate Limiting & Abuse Testing | WORKING | NONE | CI_VERIFIED |

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
- Codex final-verification fix (R1): Security-aware QA's professional
  column was previously `PARTICIPATED`, but no professional-experience
  source actually confirms security-testing participation — the note it
  cited was a self-referential list, not a professional case. Corrected
  to `NONE` (matching `registry/competency-state.yaml`); repository
  practice (real IDOR/XSS/SQLi-oriented tests, `CI_VERIFIED`) is real,
  but it is repository practice, not professional experience — the two
  are independent dimensions and one does not imply the other. See
  `registry/source-provenance.yaml#conflict_log` for the correction
  record.
