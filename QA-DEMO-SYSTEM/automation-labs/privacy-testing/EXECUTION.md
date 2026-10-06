# Privacy Testing Lab — Execution Evidence

**Date:** 2026-09-29
**Environment:** sandbox container.

## Run 1 — unit suite only, no backend running

**Command:** `node privacy-testing/run-privacy-lab.js` (from
`QA-DEMO-SYSTEM/automation-labs/`), backend confirmed down beforehand
(`curl http://localhost:3000/api/health` → connection refused).

**Result:**
```
1..14
# tests 14
# pass 14
# fail 0
PRIVACY_LAB_INTEGRATION: NOT_EXECUTED — no backend reachable at http://127.0.0.1:3000 (start it first: node backend/src/server.js)
PRIVACY_LAB_STATUS: PARTIAL_EXECUTED
```
Exit code `0`. The 14 unit tests (7 `pii-scanner-unit.test.js` + 7
`data-subject-rights.test.js`) genuinely passed; the real-backend
integration check honestly reported as not executed rather than
silently skipped or faked.

## Run 2 — full lab, real backend running

**Command:**
```bash
# from QA-DEMO-SYSTEM/
rm -f backend/data/qa-demo.db
npm run db:seed
node backend/src/server.js &   # confirmed healthy via /api/health
QA_DEMO_BASE_URL=http://127.0.0.1:3000 node automation-labs/privacy-testing/run-privacy-lab.js
```

**Result:**
```
14 unit tests: pass
3 integration tests (api-response-privacy.test.js): pass
PRIVACY_LAB_STATUS: EXECUTED
```
Exit code `0`. All 3 integration tests scanned ACTUAL responses from
the real, seeded backend:
- real `POST /api/auth/login` response (real credentials from
  `shared/test-data/auth-users.json`) — zero unexpected findings; the
  real response shape (`backend/src/services/auth.service.js`) returns
  only `{ id, email }` for `user`, confirmed directly (no `password`/
  `password_hash` key at all) in addition to the scanner's own check.
- real `GET /api/products` (public) — zero findings, non-empty real
  seeded catalog.
- real `GET /api/notifications` (authenticated, real session token
  from the login call above) — zero findings.

## Total: 17 tests across both runs' unique cases (14 unit + 3 integration)

## Scope and honesty notes

- The real-backend integration test is genuine positive-control
  evidence: it proves the ACTUAL QA-DEMO-SYSTEM API does not leak
  sensitive fields on the endpoints scanned — not a fixture claiming
  this.
- `lib/data-subject-rights-simulator.js` is explicitly disclosed as an
  in-memory fixture — QA-DEMO-SYSTEM's real backend has no GDPR
  data-subject-rights endpoints, and none were invented to inflate this
  lab's evidence. See this lab's `README.md` scope-boundary section.
- **CI-verified.** The `privacy-testing-lab` job in
  `.github/workflows/ci.yml` (using the same seed-and-start-server
  sequence as the other backend-dependent jobs) ran this exact suite
  on GitHub Actions and passed — see
  `https://github.com/SalimBurakAytemiz/full-stack-qa-engineering-handbook-Portfolio-/actions/runs/36626191865`
  (commit `70f8358`, job "Privacy Testing lab (real-backend PII scan +
  data-subject-rights fixture)", conclusion: success). This lab's
  registry maturity is `L4_CI_VERIFIED` / evidence `E4_CI_VERIFIED` on
  that basis.
