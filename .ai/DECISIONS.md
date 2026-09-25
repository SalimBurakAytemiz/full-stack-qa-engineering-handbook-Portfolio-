# Architecture Decisions — Increment 2

Real decisions made during this increment, with the reasoning, kept so a
future continuation (Claude or human) does not re-litigate them without
cause.

## D1 — QA-REFERENCE-PLATFORM is a mapping layer, not a code move

`QA-DEMO-SYSTEM` was not physically restructured into
`05-EXECUTABLE-LABS/QA-REFERENCE-PLATFORM/core/modules/adapters/...` as
the master prompt's target architecture literally describes.

Reason: `QA-DEMO-SYSTEM` has a real, passing 157-test backend suite, a
26-test Playwright suite, a 118+97+48+42+26-assertion API contract
suite, and a 4-job GitHub Actions CI pipeline, all wired to its current
relative paths and npm workspace boundaries (`QA-DEMO-SYSTEM/package.json`
references `backend`, `api-tests`, `web-tests`, `automation-labs` by
path). A structural move risks breaking that for a purely cosmetic
reorganization with no functional benefit.

Decision: `05-EXECUTABLE-LABS/README.md` documents the target-vs-real
mapping (each TEST-PACK/AUTOMATION-LAB concept → its real path → a
stable `lab.*` registry id), the same pattern already used for the
Handbook (`02-FULL-STACK-QA-HANDBOOK/README.md`'s "real location or NOT
YET WRITTEN" table). This satisfies the spec's navigability requirement
without the regression risk.

## D2 — Handbook and Interview content moved with `git mv`; executable code did not

Markdown-only content (`00-06` Handbook folders, `.ai/`, this file) was
moved with `git mv` because it carries no runtime dependency on its file
path — a link can be fixed with a text edit. Executable code
(`QA-DEMO-SYSTEM/*`) was not moved for the same reason as D1.

## D3 — Registry validator design: fail loudly, verify it actually fails

`scripts/registry/validate-registry.mjs` was tested against two
deliberately broken states before being trusted:

1. A fabricated `gap.does-not-exist.fabricated` reference injected into
   `competency-state.yaml` — confirmed non-zero exit, confirmed the file
   was cleanly reverted afterward (`git diff` empty).
2. `shared/registry/catalog/labs.yaml` originally had four fabricated
   paths (`QA-DEMO-SYSTEM/security-tests`, `db-tests`,
   `performance-tests/jmeter`, `performance-tests/locust`,
   `selenium-tests`, `backend/logs`) that do not exist in this
   repository. These were caught by manually cross-checking
   `05-EXECUTABLE-LABS/README.md`'s mapping table against the real
   filesystem, not by the validator (which did not yet check path
   existence). The validator was then extended to check every catalog
   `path` against the filesystem, so this class of error is now caught
   automatically going forward.

## D4 — `QA-COMPETENCY-MAP.md` kept in place, marked SUPERSEDED, not deleted

16 files reference it; only one is an actual markdown link (the rest are
prose mentions of its old EXPERIENCE/PARTICIPATED terminology as
historical context, which remain accurate as history). Deleting it or
gutting its content would break that context for no benefit — a banner
pointing to the Digital Twin as the new source of truth was prepended
instead, and the original content kept below it, unmodified.

## D5 — Branch mismatch between this session's harness-designated branch and the actual work branch

This session's harness instructions name `claude/stoic-pasteur-svbmxs`
as the designated branch, but that branch only has the repository's
original 7-commit skeleton (`712f865` through `c40d626`) — none of the
Digital Twin / Handbook / Domains / Tools / Registry work from this
transformation campaign, which all lives on
`feat/qa-digital-twin-full-stack-transformation` (this transformation's
actual branch across multiple prior sessions, confirmed via
`git log origin/claude/stoic-pasteur-svbmxs..feat/qa-digital-twin-full-stack-transformation`).

Decision: continued work on `feat/qa-digital-twin-full-stack-transformation`,
per the user's own explicit, repeated instruction to continue on "the
SAME repository and SAME transformation branch" — a more specific and
more recent instruction than the generic harness branch default, and the
only branch that actually contains the work being continued. This is
disclosed here and in the FINAL IMPLEMENTATION REPORT rather than
silently resolved either way.
