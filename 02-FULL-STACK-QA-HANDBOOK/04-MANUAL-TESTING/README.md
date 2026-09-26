# Manual / Exploratory QA

Scripted testing verifies a known expectation. Exploratory testing
finds the expectation you didn't know to write down. Both are real
disciplines, not "manual testing = what you do before you learn
automation" — a mature QA practice uses each where it's the right tool.

## Session-Based Test Management (SBTM)

Ad-hoc "just click around" exploratory testing isn't repeatable or
reportable — SBTM fixes that with a lightweight structure:

- **Charter**: a short mission statement for the session ("Explore the
  order-creation flow's error handling for invalid `payment_token`
  values"), not a fixed script.
- **Time-boxed session** (typically 60-90 min), uninterrupted.
- **Session notes**: what was tested, what was found, what's still
  open — captured as you go, not reconstructed afterward.
- **Debrief**: charter coverage, bugs found, areas needing a follow-up
  session.

This produces the same audit trail a scripted test plan gives you,
without pretending every step was known in advance.

## Heuristics for designing exploratory charters

**SFDPOT** (San Francisco Depot) — a quick lens for "what haven't I
looked at yet":

| Letter | Dimension | Example charter for `QA-DEMO-SYSTEM` |
|---|---|---|
| S | Structure | What does the codebase's own module boundary suggest is fragile? (e.g. the `events`/`notifications` coupling) |
| F | Function | What does the feature literally do? (create an order, log in) |
| D | Data | Boundary/edge values — a `quantity: 0` order item, a negative `price` |
| P | Platform | Browser/OS differences (`web-tests/tests/responsive.spec.js` covers viewport, not full cross-browser — see `04-TOOLS-AND-TECH/02-WEB-AUTOMATION/`) |
| O | Operations | How a real user actually uses it — most testing misses the "logs in on Monday, doesn't come back until Friday" pattern |
| T | Time | Race conditions, session expiry, concurrent requests — `order-concurrency.test.js` started as an exploratory question before becoming a scripted regression test |

**CRUD** — for any entity (a product, an order, a notification): can
you Create it, Read it, Update it, Delete it, and does each operation
behave correctly at its boundaries (an order with 0 items, a product
update that would make stock negative)?

## Bug advocacy

Finding a bug is half the job — getting it fixed is the other half.
Session notes should capture what a scripted bug report needs anyway:
exact repro steps, expected vs. actual, and — critically — *why it
matters* (user impact, not just "this is wrong"). `BUG-AUTH-EDU-001`
(`QA-DEMO-SYSTEM/evidence/BUG-AUTH-EDU-001/`) is this repository's own
real example of investigating a historically-planned defect to that
standard: real request/response evidence captured, both API and UI
steps actually executed against a running instance. The honest result
was **NOT REPRODUCED** — the described behavior never existed in this
implementation — and existing regression coverage (`backend/tests/auth.test.js`)
was confirmed to already cover the exact scenario, so no new test was
added. See `EXECUTION.md` section 8-9 for the full reasoning.

## Scripted vs. exploratory: when to use which

- **Scripted** for known, stable, high-repetition paths — login, the
  happy-path checkout flow, contract validation. This is what
  `QA-DEMO-SYSTEM`'s automated suites (backend, Playwright, API
  contract tests) already cover.
- **Exploratory** for new features, ambiguous requirements, and after
  a bug is found (to look for siblings — "if this input crashed it,
  what else might?"). This repository's own automated suites started
  as exploratory questions in several cases — the JMeter fail-gate
  wrapper exists because someone (this campaign) explored "does
  JMeter's exit code actually reflect a failed run?" and found the
  answer was no.

## Where this repository's own testing was manual/exploratory, not automated

Being honest about this matters as much as documenting the technique:
the OWASP API Security Top 10 mapping review
(`QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/`) is manual
review, not automated scanning — see `04-TOOLS-AND-TECH/08-SECURITY/`.
That is a real, disclosed example of exploratory/manual QA work in
this repository, not every technique described above needing its own
automated counterpart to be legitimate.
