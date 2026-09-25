# Next Actions

This file reflects the real, current state of the
`feat/qa-digital-twin-full-stack-transformation` branch as of
Increment 1. It is not a stale wishlist — items marked DONE are
genuinely done and verified; items marked NOT_STARTED have zero
content, not partial/placeholder content.

## Done (Increment 1)

- [x] Baseline captured (BASE SHA `e63ca070103cd87b9e4e074b0fea4574c5448d38`), working branch created.
- [x] `01-SALIM-BURAK-DIGITAL-TWIN/` — full 12-doc + 8-file registry, built from the explicit canonical personal-data source, all YAML validated with a real parser.
- [x] Root `README.md` rewritten for recruiter/technical-review navigation.
- [x] `ROADMAP.md` "Current Status" section updated with Phase 6-19 entries (was stale — only listed Phase 0-5).
- [x] `.ai/` state files refreshed (this file, `MASTER-STATE.yaml`, `CODEX-FULL-AUDIT-HANDOFF.md`).

## Not started (real scope, not yet touched)

Per the transformation spec's own architecture (Section 6), in
priority order a continuation would need:

1. **`02-FULL-STACK-QA-HANDBOOK/`** — migrate the existing `00-06`
   numbered folders (real Phase 0-3-era content) plus the currently
   `.gitkeep`-only `07-28` folders into the 24-topic handbook
   structure. The existing content must be moved with `git mv`, not
   duplicated.
2. **`03-DOMAINS/`** — the domain taxonomy (Financial Services,
   Commerce/Retail, Media/Streaming, Mobile/Digital Platforms, and the
   rest). Commerce and FinTech are the priority-depth domains per the
   spec, since they map directly to real professional context recorded
   in the Digital Twin.
3. **`04-TOOLS-AND-TECH/`** — full tool documentation (CONCEPTS/SETUP/
   QA-USE-CASES/PATTERNS/TROUBLESHOOTING per tool), beyond the
   Digital Twin's `tool-state.yaml` categorization layer that already
   exists.
4. **`05-EXECUTABLE-LABS/QA-REFERENCE-PLATFORM/`** — refactor
   `QA-DEMO-SYSTEM` into `core/modules/adapters/database/events/
   observability/test-data/runtime`, and add the FinTech/Commerce/
   Streaming/Insurance domain modules with real state machines and
   fault injection. This is the largest single remaining piece.
5. **`06-EVIDENCE/`** — the formal evidence registry (`evidence.yaml`)
   with stable IDs; today, evidence is indexed manually in
   `01-SALIM-BURAK-DIGITAL-TWIN/08-EVIDENCE-MAP.md` pointing at the
   existing `QA-DEMO-SYSTEM/evidence/` tree.
6. **`07-INTERVIEW/`** — restructure the existing
   `28-INTERVIEW-PREP` and `QA-DEMO-SYSTEM/evidence/PHASE-16-*` content
   into the 17-topic interview system, split into general Full Stack QA
   questions vs. Salim-specific profile questions consistent with the
   Digital Twin.
7. **`shared/registry/`** — the universal catalog (competencies,
   domains, tools, technologies, system patterns, labs, evidence) with
   JSON Schemas and a relationship model. The Digital Twin's own
   registry (`01-SALIM-BURAK-DIGITAL-TWIN/registry/`) is a *personal
   state* registry, not the universal catalog Section 34 describes —
   these are deliberately different things and must not be merged.
8. **`22-SYSTEM-PATTERNS/`** (as part of the Handbook) — Authentication,
   Authorization, Payment, Idempotency, Retry, Concurrency, and the
   other canonical patterns listed in Section 13.
9. **Registry validation scripts** (`scripts/registry/*.mjs`) — schema
   validation, duplicate-ID detection, broken-reference detection,
   claim-integrity checks, CI gate.
10. **`CASE-STUDIES/`** (root, currently `.gitkeep`-only) — either
    populate with real content migrated/synthesized from
    `QA-DEMO-SYSTEM/evidence/PHASE-15-CASE-STUDIES/`, or remove it as a
    redundant placeholder per Section 47.

## Explicit scope decision for Increment 1

Attempting a shallow pass across all ten items above in a single
session would produce exactly the kind of filler and fake completeness
the transformation spec itself forbids (Sections 47, 51, 62). Increment
1 therefore delivers the highest-value, most precisely-specified piece
in full (the Digital Twin) rather than a thin layer over everything.
