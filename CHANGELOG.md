# Changelog

This changelog starts at the point the repository began its transition
into a Digital Twin + QA Knowledge System + Executable QA Reference
Platform. It does not retroactively reconstruct dated entries for
everything that came before — that history is fully preserved in `git
log` and in the phase-by-phase evidence under `QA-DEMO-SYSTEM/evidence/`
and `.ai/PHASE-6-19-CODEX-*-MANIFEST.md`, which remain the accurate
record for that period.

## [Unreleased] — Post-Codex Consolidated Fix Campaign

An independent Codex audit round found 13 real findings (P1: 5, P2: 6,
P3: 2) against the Increment 2 master transformation state. All 13 are
fixed this round — see `.ai/CODEX-POST-FIX-CLOSURE-MATRIX.md` for the
full per-finding disposition.

### Added

- `01-SALIM-BURAK-DIGITAL-TWIN/registry/claims.yaml` — claim-level
  provenance registry (P1-05): every individual professional-experience
  bullet now has its own sourced, validator-enforced claim entry, not
  just a file-level "some source exists" check.
- `shared/registry/schemas/claim.schema.json`,
  `shared/registry/schemas/domain-catalog.schema.json` — new schemas
  for claim-level provenance and for the universal domain catalog
  (which no longer reuses the personal-exposure schema, P2-01).
- `scripts/registry/validate-registry.regression.test.mjs` — 9
  regression tests proving the validator's negative (real defect →
  FAIL) and positive (real harmless variance → PASS) behavior against
  real files, not synthetic fixtures.
- `.gitattributes` — enforces LF line endings for generated/diffed
  content (P2-02).
- `.ai/CODEX-POST-FIX-CLOSURE-MATRIX.md` — the finding closure matrix.
- 4 new CI jobs in `.github/workflows/ci.yml` (`api-auth-tests`,
  `api-orders-payment-tests`, `api-notifications-tests`,
  `api-db-validation`) — the 4 API test packages that existed and
  passed locally since Phase 5 but were never wired into CI (P1-03).

### Fixed

- Digital Twin personal-truth reconciliation: 2 internal
  derivation-inconsistency bugs (domain exposure levels understated
  relative to their own declared source) and 1 genuine gap (4 tools
  claimed as EXPERIENCE only in the superseded competency map, now
  correctly `USER_CONFIRMATION_REQUIRED`) (P1-01).
- `06-EVIDENCE/evidence.yaml`'s BUG-AUTH-EDU-001 entry falsely claimed
  "reproduced defect... regression test added," contradicting the real
  historical execution record's NOT REPRODUCED verdict (P1-02).
- Relationship-graph edges claiming real repository execution for
  tools/patterns never actually executed here (Jenkins, Elastic,
  Retry) — corrected, and a new structural validator check now catches
  this class of bug automatically (P1-04).
- Universal domain catalog (`domains.yaml`) no longer carries
  personal-exposure vocabulary; a foreign-key check now enforces every
  personal `domain_id` resolves to a real catalog entry (P2-01).
- Generated-index and GraphQL contract-drift comparisons are now
  EOL-normalized — a Windows/CRLF checkout no longer produces a false
  content-drift failure, while real drift still fails (P2-02).
- Stale domain-maturity claims in `03-DOMAINS/README.md` (D1/D0
  instead of the real, already-achieved D2 QA_MAPPED) corrected (P2-03).
- JMeter evidence split into 3 honestly-differentiated entries
  (workload design / fail-gate logic / real-execution-blocked) instead
  of one entry conflating a real execution attempt's fail-gate-logic
  validation with a successful load run (P2-04).
- Retry pattern status corrected `IMPLEMENTED` → `DOCUMENTED_ONLY` — no
  real retry mechanism exists in this repository (P2-05).
- "Exactly-once delivery" terminology corrected — a unique DB
  constraint provides persisted-event deduplication, not a delivery-
  layer exactly-once guarantee (P2-06).

## [Unreleased] — QA Digital Twin / Full Stack Transformation, Increment 1

### Added

- `01-SALIM-BURAK-DIGITAL-TWIN/` — personal competency, professional
  experience, domain exposure, tools, evidence, gap, and certification
  model, with a machine-readable registry (`registry/*.yaml`) as the
  single source of truth for every fact.
- `.ai/MASTER-STATE.yaml`, `.ai/NEXT-ACTIONS.md`,
  `.ai/CODEX-FULL-AUDIT-HANDOFF.md` — repository-resident state
  tracking for the transformation campaign.

### Changed

- `README.md` rewritten for recruiter/technical-review navigation.
- `ROADMAP.md` "Current Status" section updated to include Phase 6-19
  (previously stopped at Phase 5, stale since the Phase 6-19 campaign
  merged to `main`).

### Notes

This is Increment 1 of a larger, explicitly multi-increment
transformation. See `.ai/NEXT-ACTIONS.md` for what remains.

## Prior history

Phase 0 through Phase 19 (repository foundations through QA
foundations, requirement analysis, risk/test design, manual testing,
test/defect management, API/GraphQL/WebSocket/database/web/mobile
testing, visual/accessibility testing, automation learning labs,
security-aware QA, CI/CD, observability, modern QA labs, case studies,
interview preparation, final integration, independent review, and a
consolidated multi-round Codex audit fix campaign) were completed and
merged to `main` via PR #24 before this changelog began. See `git log`
and `ROADMAP.md` for the authoritative record of that work.
