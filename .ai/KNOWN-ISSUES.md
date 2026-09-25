# Known Issues — Increment 2

Real, disclosed limitations. Nothing here is hidden from
`.ai/NEXT-ACTIONS.md` or the FINAL IMPLEMENTATION REPORT.

## KI-1 — Registry validator is not wired into CI

`npm run registry:validate` is a real, local gate (see `.ai/DECISIONS.md`
D3 for proof it actually fails on bad input) but `.github/workflows/ci.yml`
does not yet run it. A registry regression would not currently be caught
by CI, only by a human or agent remembering to run it locally.

## KI-2 — Selenium and Playwright/Chromium require environment-specific setup

- Selenium: passes in GitHub Actions CI but is documented as
  sandbox-blocked in some local dev environments (a real, disclosed
  split, not a hidden failure) — see `evidence.selenium.ci-verified-run`.
- Playwright: in this session's environment, the pinned `@playwright/test`
  version expected a newer Chromium revision
  (`chromium_headless_shell-1243`) than the pre-installed one
  (`chromium-1194`). The project's own `playwright.config.js` already
  anticipates this with a `PLAYWRIGHT_CHROMIUM_PATH` override (see its
  inline comment); running with
  `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
  resolved it and all 26 tests passed. This is an environment quirk, not
  a code defect, and needed no code change — recorded here so a future
  session does not waste time rediscovering it.

## KI-3 — `shared/registry/relationships/relationships.yaml` is not exhaustive

35 relationship edges exist, linking only entities that already have
real content on both ends (domains, labs, tools, competencies, evidence,
gaps that are actually populated). Competencies without a lab/domain
counterpart yet (e.g. `competency.frontend-qa.react-react-native-flutter`,
`competency.integration.provider-sdk-qa`) have no relationship edges —
this is accurate incompleteness, not a bug, but a future increment could
extend the graph as more catalog entries are added.

## KI-4 — `shared/contracts/` is an index, not new machinery

Per `.ai/DECISIONS.md`, GraphQL and WebSocket/event contracts are
enforced by their own test suites rather than a parallel JSON-Schema
layer. This means there is no automated GraphQL/WebSocket schema-drift
detector the way AJV provides for REST — a real gap, tracked here rather
than built as filler machinery with no real schema behind it.

## KI-5 — 07-INTERVIEW profile-specific questions do not cover "why QA" narrative

`19-CAREER-NARRATIVE-QUESTIONS.md` explicitly marks the "why QA instead
of development" answer as `USER_CONFIRMATION_REQUIRED` rather than
inventing a motivational story not present in the source data — see
Claim Integrity rule "no claim without source."
