# Tools & Technology

Maturity model (independent of any person's knowledge of the tool —
see the Digital Twin for that): T0 INDEXED → T1 DOCUMENTED →
T2 EXAMPLE_AVAILABLE → T3 EXECUTED → T4 CI_VERIFIED → T5 AUDITED.

Fact ownership: this section documents each tool's CONCEPTS/SETUP/
USE-CASES; the Digital Twin's `tool-state.yaml` owns the categorization
(TOOL vs. TECHNOLOGY vs. PLATFORM vs. PROTOCOL) and links here.

| Category | Highest-maturity tool | Maturity |
|---|---|---|
| [API & Contract](01-API-AND-CONTRACT/) | Postman/Newman/AJV | T4 CI_VERIFIED |
| [Web Automation](02-WEB-AUTOMATION/) | Playwright, Selenium | T4 CI_VERIFIED |
| [Mobile Automation](03-MOBILE-AUTOMATION/) | Appium | T1 DOCUMENTED (no device/emulator infra) |
| [Performance](04-PERFORMANCE/) | JMeter, Locust | T3 EXECUTED (JMeter native runtime environment-blocked; fail-gate logic T4) |
| [CI/CD](05-CI-CD/) | GitHub Actions | T4 CI_VERIFIED |
| [Data](06-DATA/) | SQL / SQLite | T4 CI_VERIFIED |
| [Observability](07-OBSERVABILITY/) | Correlation-ID logging | T4 CI_VERIFIED |
| [Security](08-SECURITY/) | — | T1 DOCUMENTED (Burp/ZAP not practiced here) |
| [Dev & Environment](09-DEV-AND-ENVIRONMENT/) | Git/GitHub | T4 CI_VERIFIED; Docker T2 (syntax-valid, daemon unavailable) |
| [Visual & Design](10-VISUAL-AND-DESIGN/) | Playwright visual regression, axe-core | T4 CI_VERIFIED |
| [Project/QA Management](11-PROJECT-QA-MANAGEMENT/) | — | T0/T1 (no executable equivalent applies) |
