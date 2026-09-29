# Security Tools

## Security-Aware QA testing (T4 CI_VERIFIED — via node:test, not a dedicated scanner)

This repository's security testing is code-level, not tool-based: real
IDOR/BOLA-oriented, XSS-oriented, SQLi-oriented, mass-assignment, and
sensitive-data tests in
`QA-DEMO-SYSTEM/backend/tests/security.test.js`, mapped to OWASP API
Security Top 10 in
`QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/OWASP-API-TOP-10-MAPPING.md`.

## Burp Suite (T0 INDEXED)

GUI proxy/scanner tool for manual and semi-automated security testing.
Not installed/practiced in this repository — a documented gap, not
silently implied by the security testing above.

## OWASP ZAP (T0 INDEXED)

Same status as Burp Suite — a documented gap.
