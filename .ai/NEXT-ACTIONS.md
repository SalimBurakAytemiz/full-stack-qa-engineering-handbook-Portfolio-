# Next Actions

This file reflects the real, current state of the
`feat/qa-digital-twin-full-stack-transformation` branch as of the
5-item closure round (commit `fe8daf5` and this commit). Items marked
DONE are genuinely done and verified; nothing here is hidden.

## Done (Increment 1 + Increment 2 + 5-item closure)

All items from earlier `.ai/NEXT-ACTIONS.md` versions, plus:

- [x] Registry validation wired into CI as a real quality gate (`.github/workflows/ci.yml` job `registry-integrity`)
- [x] Relationship graph rebuilt from 35 to 133 edges via a systematic pass; both mandated traceability paths verified walkable
- [x] GraphQL contract-drift checking (schema snapshot + test, verified to actually fail on drift)
- [x] WebSocket/event contract-drift checking (2 JSON Schemas + AJV test, verified to actually fail on drift)
- [x] Career-motivation narrative formally represented as `USER_CONFIRMATION_REQUIRED` registry state, not an open engineering TODO
- [x] `shared/evidence/`, `shared/helpers/`, `shared/templates/` resolved (removed — checked for real successors first, none needed keeping them)
- [x] `.ai/MASTER-REQUIREMENTS-COMPLIANCE.md` created — explicit per-requirement status mapping
- [x] Full final regression re-run with exact PASS/FAIL/NOT_EXECUTED states, including previously-not-attempted suites (Locust, JMeter fail-gate unit tests, a real Selenium/JMeter attempt)

## Not started (real, disclosed gaps — see `.ai/KNOWN-ISSUES.md`)

1. Relationship graph exhaustiveness beyond the core (KI-1) — deliberate scope.
2. Registry CI job not yet observed on a live GitHub Actions run (KI-2) — locally proven, not yet remotely confirmed.
3. Real JMeter binary run blocked by an XStream security-policy issue specific to this session's JMeter install (KI-3).
4. Selenium local run remains environment-blocked, unchanged from prior sessions (KI-4).
5. `shared/contracts/` covers the two real message types this backend emits today; new event/message types would need their own schema + drift test (KI-5).
6. Full 24-topic Handbook coverage still partial — its own README index says so.

## Branch note

Unchanged from the previous round — see `.ai/DECISIONS.md` D5. Work
continues on `feat/qa-digital-twin-full-stack-transformation`.
