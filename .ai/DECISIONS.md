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

## D6 — APPLIES_TO_DOMAIN direction: competency -> domain, not domain -> competency

The first draft of the relationship graph pointed `domain.commerce.ecommerce
APPLIES_TO_DOMAIN competency.api.rest`. On review this reads backwards —
"applies to domain" naturally means "A applies to domain B," so A should
be the competency/pattern and B the domain. Every `APPLIES_TO_DOMAIN`
edge was rebuilt in the corrected direction (`competency.* ->
domain.*`) before the graph was considered done, not left inconsistent
because the validator didn't complain about direction (it can't — both
ids are valid registry entries either way, so this was a semantic
review catch, not a tool-catchable one).

## D7 — RELATED_TO used deliberately once, not as a shortcut

`competency.cicd.jenkins RELATED_TO platform.github-actions` is the only
`RELATED_TO` edge in the graph. It exists because the real relationship
is neither `USES_TOOL` (this repository's CI does not actually run on
Jenkins — the Jenkinsfile is syntax-valid but unexecuted) nor any other
specific predicate in the vocabulary; forcing a more specific predicate
here would misstate the fact. Every other edge in the graph uses a
specific predicate — `RELATED_TO` was not used as a way to avoid
thinking about direction or semantics elsewhere.

## D8 — System Patterns promoted to first-class registry entries

The 9 written System Patterns (`02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/`)
existed only as markdown before this increment, with no stable id — so
nothing in the graph could point at "the Idempotency pattern" as a
typed entity. `shared/registry/catalog/patterns.yaml` gives each a
`pattern.*` id (status taken directly from the existing README's own
status table, not re-derived), enabling `USES_PATTERN` and
`VALIDATES_FLOW` edges. `pattern.rate-limiting` (the one `NOT_IMPLEMENTED`
pattern) is linked with `LEARNING`, not `VALIDATES_FLOW` — there is no
real flow to validate for a pattern this repository doesn't implement.

## D9 — JMeter's real-binary run and Selenium's local run are genuine environment blockers, not silently skipped

During the final regression pass, both were actually attempted (not
assumed blocked from prior documentation): Selenium failed with
`SELENIUM_LAB_STATUS: EXECUTION_BLOCKED` (Selenium Manager cannot reach
`googlechromelabs.github.io` from this sandbox — matches prior
documented behavior exactly). JMeter's real binary run failed with a
`ForbiddenClassException` from XStream's security policy
(`org.apache.jmeter.save.ScriptWrapper`) — a JMeter-version-specific
issue unrelated to any file touched this session. Both are recorded as
`NOT_EXECUTED` in `.ai/TEST-STATUS.md`, not silently omitted or
converted to PASS. The JMeter fail-gate's own unit tests (which test the
gate logic without needing the real binary) were run for real and
passed 7/7, and Locust — which had no environment blocker — was run for
real (5 users, 15s, 280 requests, 0 failures) rather than assumed from
prior sessions.

## D10 — "PARTIAL is not acceptable for implementable scope" resolved by writing the remaining content, not by reclassification

When directed that no implementable master requirement may stay
PARTIAL, the temptation is to resolve this by relabeling rather than
building. That was rejected here: the Handbook's 7 real gaps (one
genuinely empty folder, six zero-content topics), the 13 additional
System Patterns, and the 3 shallow domain pages were all judged
genuinely implementable without inventing repository evidence — general
QA knowledge, transferable methodology, and honest "not implemented
here" framing (the same pattern `RATE-LIMITING.md` already established
in Increment 2) are real, legitimate content, not filler. Only requirements
that are NOT implementable from this session (a live GitHub Actions
observation, a JMeter-version-specific tooling failure, a browser
driver download blocked by sandbox networking) were classified
EXTERNALLY_BLOCKED, and only after a genuine attempt each round — never
invoked pre-emptively because a requirement looked large.

## D11 — 14 new System Patterns written at reduced depth relative to the original 9, deliberately

The original 9 patterns (Authentication through Retry) each have real
repository code and tests behind every claim, warranting their fuller
treatment. The 14 patterns added this round mostly document techniques
this repository does NOT implement — their QA-risk and test-strategy
content is real and substantive, but necessarily more general (no
repository-specific line-by-line grounding to cite for a feature that
doesn't exist here). This is an honest, disclosed depth difference, not
an attempt to pad the count to 23 with lower-effort filler — each page
still states its real implementation status, cites real related
patterns/domains, and was checked against the actual codebase (a
`grep` for pagination/search/cache logic, confirming its absence)
before being written, not assumed absent.

## D12 — Relationship-graph "completeness" scoped to zero orphans, not exhaustive N×M linking

"Complete" was interpreted as the master prompt's own stated standard
(Section 41: no meaningless all-to-all linking; every canonical entity
connected enough that the main traceability paths work) — verified as
zero orphaned entities across every type (121 competency/domain/tool/
pattern/gap/professional-case entries, checked automatically), plus
explicit verification that the mandated and newly-requested
traceability directions are walkable by real graph traversal, not just
visually plausible. 224 edges is the number that resulted from doing
this correctly for every real entity, not a target hit by adding
generic edges.
