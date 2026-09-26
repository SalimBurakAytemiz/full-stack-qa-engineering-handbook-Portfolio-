# Evidence Map

Evidence types are not interchangeable (see the wider `06-EVIDENCE/`
system, planned — this page maps what exists today):

- **PROFESSIONAL** — sanitized CV/professional-history statement. Cannot
  be independently verified by a public repository; phrased as
  "professional experience source: user-confirmed professional
  history," never as "verified employer implementation."
- **REPOSITORY** — this repository's own implementation + test +
  execution + result, with a traceable path to the evidence file.
- **LEARNING** — documented knowledge without execution.

## Where the repository evidence actually lives today

All current repository-practice evidence lives under
`QA-DEMO-SYSTEM/evidence/`, organized by the original Phase 0-19
campaign structure:

| Area | Evidence path |
|---|---|
| Backend regression (157/157 last verified) | `QA-DEMO-SYSTEM/backend/tests/` + CI job "Backend unit/integration tests" |
| GraphQL | `evidence/PHASE-6-GRAPHQL-WEBSOCKET-EVENT/EXECUTION.md` |
| Database / SQL | `evidence/PHASE-7-DATABASE-TESTING/EXECUTION.md` |
| Web QA (Playwright) | `evidence/PHASE-8-WEB-MOBILE-QA/EXECUTION.md` |
| Visual & Accessibility | `evidence/PHASE-9-VISUAL-ACCESSIBILITY/EXECUTION.md` |
| Selenium / JMeter / Appium | `evidence/PHASE-10-AUTOMATION-LEARNING-LABS/EXECUTION.md` |
| Security-aware QA | `evidence/PHASE-11-SECURITY-AWARE-QA/EXECUTION.md` |
| CI/CD (real GitHub Actions results) | `evidence/PHASE-12-CICD-ENVIRONMENT/EXECUTION.md` |
| Observability / correlation logging | `evidence/PHASE-13-LOGGING-OBSERVABILITY/EXECUTION.md` |
| Docker / Locust / coverage | `evidence/PHASE-14-MODERN-QA-LEARNING-LABS/EXECUTION.md` |
| Case studies | `evidence/PHASE-15-CASE-STUDIES/` |
| Interview prep | `evidence/PHASE-16-INTERVIEW-PREPARATION/` |
| Fix-campaign history (Codex-audited) | `evidence/PHASE-6-19-FIX-CAMPAIGN/` and `.ai/PHASE-6-19-CODEX-*-MANIFEST.md` |

This is the same evidence trail an independent Codex audit already
reviewed across multiple rounds and found `PASS` on (see
`.ai/PHASE-6-19-CODEX-FIX-DELTA-MANIFEST.md`). It predates this
Digital Twin increment and is not being re-verified here — it is
referenced, not duplicated.

## Evidence maturity (repository proof contract)

E0 CLAIMED → E1 DOCUMENTED → E2 IMPLEMENTED → E3 EXECUTED →
E4 CI_VERIFIED → E5 INDEPENDENTLY_AUDITED.

This Digital Twin increment does not self-declare E5 anywhere — an E5
label requires an actual independent Codex audit record, which is a
step that happens after implementation, not something Claude assigns
to its own work.

## Planned, not yet built

A dedicated `06-EVIDENCE/` registry (`evidence.yaml`, per-type
directories) that formally indexes every evidence item with a stable
ID is specified (Section 31) but not yet implemented in this
increment. Until then, this page and the table above are the index.
