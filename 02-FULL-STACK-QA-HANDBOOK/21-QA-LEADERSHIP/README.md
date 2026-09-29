# QA Leadership

Distinct from Agile QA & Ownership (`20-AGILE-QA-AND-OWNERSHIP/`): that
topic is about how QA participates day-to-day; this one is about the
decisions a senior/lead QA engineer owns beyond their own test
execution — strategy, standards, and the calls that trade off coverage
against velocity.

## Owning Test Strategy, Not Just Test Cases

A test strategy answers questions no individual test case does: what
layers get automated vs. exploratory coverage, what's the acceptable
regression-suite runtime, what's genuinely out of scope this quarter.
`QA-DEMO-SYSTEM`'s own layered approach is a real example of a
strategy, not an accident: fast, deterministic backend unit/integration
tests run on every push; slower, environment-sensitive suites
(Playwright, Selenium) are scoped to what's actually feasible in CI;
and manual/exploratory review (the OWASP mapping) is used exactly where
automated tooling isn't available rather than skipped silently. A test
strategy document says which of these choices was deliberate — this
repository's own `.ai/DECISIONS.md` and `05-EXECUTABLE-LABS/README.md`
are that document for this codebase.

## Owning Quality Gates

Deciding what blocks a merge is a leadership call, not a tooling
detail — too strict and velocity dies; too loose and the gate is
theater. This repository's real quality-gate evolution is instructive:
the registry validator (`scripts/registry/validate-registry.mjs`) was
deliberately extended, gate by gate, only after each new check was
proven to catch a real defect (see `.ai/DECISIONS.md` D3, D6-D9) — not
added speculatively. That's the leadership judgment call in practice:
a gate earns its place in CI by demonstrating it catches something
real, not by sounding thorough.

## The "Ship Without Full Coverage" Decision

Every real project reaches a point where 100% coverage isn't the
question — "is the remaining risk acceptable to ship with" is. This
repository states its own version of that decision explicitly rather
than hiding it: Selenium's local execution is environment-blocked but
CI-verified (a disclosed, accepted gap — ship with CI as the safety
net, not local runs); JMeter's real binary run failed this session due
to an environment issue, and the decision was to record it as
`NOT_EXECUTED` rather than block on debugging a tooling incompatibility
unrelated to any code change (`.ai/KNOWN-ISSUES.md` KI-3). A QA lead's
job is making — and *documenting* — exactly this kind of call, not
pretending every gap gets closed before every ship.

## Mentoring and Process Design

Concretely, this looks like: writing the review checklist a junior QA
engineer follows (this repository's `CONTRIBUTING.md` and
`docs/DOCUMENTATION-STANDARD.md` play that role for documentation
contributions), designing the escalation path for a blocked test
(`06-DEFECT-MANAGEMENT/09-DEFECT-TRIAGE.md`), and building the shared
vocabulary a team uses to avoid re-litigating the same distinction
every time (this repository's three-independent-dimension competency
model — knowledge/professional/repository — is exactly this kind of
shared vocabulary, designed once so "do you actually know X" never has
to be re-argued from scratch).

## Reporting Upward

A QA leader translates test results into a decision stakeholders can
act on, not a raw pass/fail dump. `.ai/TEST-STATUS.md` and the
`MASTER TRANSFORMATION REQUIREMENTS COMPLIANCE` pattern used throughout
this repository's own `.ai/` state — COMPLETE / PARTIAL / NOT_APPLICABLE
/ EXTERNALLY_BLOCKED / USER_CONFIRMATION_REQUIRED, each with a stated
reason — is a concrete, reusable template for that translation: a
stakeholder reading it knows not just "what passed" but *why* anything
that didn't pass is or isn't a real problem.

## What This Topic Is Not

Not "become a manager." QA leadership is a technical-ownership axis,
orthogonal to people-management — an IC can own test strategy for a
whole system without managing anyone, and this repository's Digital
Twin (`01-SALIM-BURAK-DIGITAL-TWIN/`) does not claim a people-leadership
title anywhere it isn't sourced from the real professional data.
