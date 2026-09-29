# Service Virtualization & Contract Testing Lab — Execution Evidence

**Date:** 2026-09-29
**Environment:** sandbox container.

## Run 1 — consumer-side only, no backend running

**Command:** `node service-virtualization/run-virtualization-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`), backend confirmed down.

**Result:**
```
1..9 (6 stub-server tests + 3 consumer-contract tests)
# pass 9, fail 0
VIRTUALIZATION_LAB_PROVIDER: NOT_EXECUTED — no backend reachable at http://127.0.0.1:3000
VIRTUALIZATION_LAB_STATUS: PARTIAL_EXECUTED
```
Exit code `0`.

## Run 2 — full lab, real backend running

**Command:**
```bash
# from QA-DEMO-SYSTEM/
npm run db:seed
node backend/src/server.js &   # confirmed healthy via /api/health
QA_DEMO_BASE_URL=http://127.0.0.1:3000 node automation-labs/service-virtualization/run-virtualization-lab.js
```

**Result:** 9 consumer-side tests + 2 real provider-verification tests,
all pass. `VIRTUALIZATION_LAB_STATUS: EXECUTED`, exit code `0`.

The 2 provider-verification tests genuinely called the real, running
backend (`GET /api/products`, `POST /api/auth/login` with real seeded
credentials) and verified the actual responses against the exact same
`ajv`-based contract definitions (`fixtures/contracts.js`) that
`consumer-contract.test.js` verified a virtualized double against —
real consumer-driven contract testing, both directions.

## Scope and honesty notes

- `lib/stub-server.js` is a real, working HTTP server — not a claim of
  matching WireMock's feature set. See this lab's `README.md`
  scope-boundary section.
- `lib/contract.js` is a real, minimal contract verifier built on ajv,
  not the Pact library — a deliberate scope/dependency choice,
  disclosed as such.
- Not yet CI-verified as of this file's writing — CI wiring is a
  separate, explicitly tracked step.
