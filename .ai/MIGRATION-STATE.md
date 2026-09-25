# Migration State — Increment 2

Tracks every `git mv`-based content migration performed during this
transformation, for traceability.

## Handbook migration (commit `8974ec3`)

`git mv` of `00-QA-FOUNDATIONS`, `01-REQUIREMENT-ANALYSIS`,
`02-RISK-BASED-TESTING`, `03-TEST-DESIGN`, `04-MANUAL-TESTING`,
`05-TEST-MANAGEMENT`, `06-DEFECT-MANAGEMENT`, `07-API-TESTING` (all
their real pre-existing content) into `02-FULL-STACK-QA-HANDBOOK/`.
21 `.gitkeep`-only placeholder folders (`08-GRAPHQL-TESTING` through
`28-INTERVIEW-PREP`, plus root `CASE-STUDIES/`) removed as redundant
per Section 47 (they had zero content and their real counterparts
already exist elsewhere — API/GraphQL coverage in the Handbook's
`07-API-TESTING`, case studies in `QA-DEMO-SYSTEM/evidence/PHASE-15-CASE-STUDIES/`).
26 outward links + 15 inbound links fixed programmatically. Verified
0 broken links repo-wide after the move.

## Documentation standard / glossary migration (commit `7acee2d`)

`git mv DOCUMENTATION-STANDARD.md docs/DOCUMENTATION-STANDARD.md`
`git mv TERMINOLOGY-GLOSSARY.md docs/TERMINOLOGY-GLOSSARY.md`

2 real markdown links updated (`02-FULL-STACK-QA-HANDBOOK/00-QA-FOUNDATIONS/README.md`,
`02-FULL-STACK-QA-HANDBOOK/01-REQUIREMENT-ANALYSIS/README.md`). Other
references to these filenames elsewhere in the repository are prose
mentions, not links, and were left as accurate historical text (see
`.ai/DECISIONS.md` D4 for the same reasoning applied to
`QA-COMPETENCY-MAP.md`).

## Removal (not a migration — no successor path, see `shared/README.md`)

`shared/evidence/`, `shared/helpers/`, `shared/templates/` — each was a
`.gitkeep`-only placeholder from before this transformation with no
code ever referencing it. Removed via `git rm`, not moved, because
checking for a real successor first found: `evidence/` superseded by
`06-EVIDENCE/evidence.yaml`; `helpers/` had no duplicated helper logic
across the test suites to consolidate; `templates/` had no template
file anywhere to migrate. See `.ai/DECISIONS.md`.

## What was explicitly NOT migrated (and why)

- `QA-DEMO-SYSTEM/*` (all executable code, tests, CI config) — not
  moved. See `.ai/DECISIONS.md` D1/D2.
- `QA-DEMO-SYSTEM/evidence/PHASE-16-INTERVIEW-PREPARATION/INTERVIEW-PREP.md`
  — not moved into `07-INTERVIEW/`, kept at its real location and
  indexed instead, because `.ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md` and
  `.ai/PHASE-6-19-CAMPAIGN-STATE.md` already reference that exact path
  as historical audit evidence.
- `QA-COMPETENCY-MAP.md` — not moved or deleted, marked SUPERSEDED in
  place. See `.ai/DECISIONS.md` D4.

## Verification method used for every migration above

1. `grep -rl` for the old path/filename across all `*.md` files before
   moving, to build the real list of referencing files.
2. `git mv` (never copy+delete) to preserve file history.
3. Targeted regex fixes for the specific broken-link patterns found.
4. A full repository-wide link scan after each migration
   (`\]\(([^)]+)\)` resolved against the filesystem) to confirm 0 new
   breakage.
