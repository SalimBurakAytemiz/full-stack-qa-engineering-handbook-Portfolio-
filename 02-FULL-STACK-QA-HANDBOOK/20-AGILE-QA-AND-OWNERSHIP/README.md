# Agile QA & Ownership

QA in an agile team isn't "the phase after development" — it's a
continuous activity inside every sprint ceremony. This is about how QA
participates in that rhythm, not test-design technique (see
`02-RISK-BASED-TESTING/`, `03-TEST-DESIGN/` for that).

## Definition of Ready / Definition of Done

A story without testable acceptance criteria isn't ready, no matter how
well the ticket reads. "Definition of Ready" from a QA lens means:
acceptance criteria are specific enough to design test cases from
*before* development starts, not discovered during testing. "Definition
of Done" means the story's own acceptance criteria are demonstrably
met — automated where the team's standard requires it, not "I tested it
and it seemed fine."

## Shift-Left: QA earlier, not QA compressed

Shift-left is often misread as "developers do the testing now" — the
actual practice is QA involvement moving earlier in the cycle:
reviewing requirements for testability before a single line of code is
written, pairing on acceptance criteria, and writing test cases
alongside (not after) development. `QA-DEMO-SYSTEM`'s own campaign
history is a real example: the GraphQL contract-drift check and the
WebSocket/event contract schemas (`shared/contracts/`) were designed
by asking "how would a future change to this schema silently break
something" *before* any drift actually happened — shifting a defensive
practice left of any real incident, not reacting to one.

## Writing Acceptance Criteria QA Can Actually Test Against

Good acceptance criteria are Given/When/Then-shaped and specific about
edge cases, not just the happy path:

> Given a logged-in user with an empty cart
> When they submit an order with `payment_token: 'TEST-CARD-DECLINED'`
> Then the API returns a 4xx response, no order row is created, and no
> notification is pushed

This is directly testable — and it's exactly the shape of the real
scenarios `QA-DEMO-SYSTEM/backend/tests` and the API contract suites
already encode. Acceptance criteria this specific are what makes a
story's "Done" checkable by anyone, not just the person who wrote the
code.

## Whole-Team Ownership of Quality

"Quality is everyone's job" is a slogan until it has real mechanics
behind it. In this repository, those mechanics are: a CI pipeline that
blocks a merge on any suite failing (`.github/workflows/ci.yml`, now
including the registry-integrity gate), not a QA sign-off step after
the fact; and a claim-integrity registry (`shared/registry/`) that
makes a false "this is CI_VERIFIED" claim fail the same pipeline a
broken test would — quality claims are enforced the same way code
correctness is, not treated as a separate, softer category.

## QA in Sprint Ceremonies

- **Planning**: flag testability risk before a story is committed to
  (a story needing infrastructure this environment doesn't have — see
  `01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml` for this
  repository's own honest list of such gaps — should be flagged here,
  not discovered mid-sprint).
- **Daily standup**: report blocked test execution the same way a
  blocked dev task is reported (`SELENIUM_LAB_STATUS: EXECUTION_BLOCKED`
  is this repository's own real example of a QA blocker stated plainly
  rather than silently worked around).
- **Review/demo**: the acceptance criteria from planning are what gets
  demoed against — not a fresh judgment call about whether it "looks
  done."
- **Retro**: a real, disclosed limitation earns a retro action item
  (e.g. "JMeter's real binary failed due to an XStream security-policy
  issue this session" — `.ai/DECISIONS.md` D9 — is exactly the kind of
  finding a retro should surface, not bury).

## Bug Triage in an Agile Cadence

A defect found mid-sprint isn't automatically a new story — it's
triaged against the current sprint's goal: fix now (if it blocks the
sprint goal), backlog (if it doesn't), or — the case this repository's
own `06-DEFECT-MANAGEMENT/09-DEFECT-TRIAGE.md` documents in more
depth — reclassified as a known limitation if it turns out to be a
genuine environment/scope boundary rather than a code defect.
