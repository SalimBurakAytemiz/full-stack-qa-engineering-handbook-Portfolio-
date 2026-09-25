# Test Status — Increment 2 Final Regression

All results below are from real command execution in this session
(commit `2a5c98b` and earlier in this branch), not carried over from
prior sessions without re-verification.

## Backend (`node --test`)

```
npm test --workspace backend
```

**157/157 PASS** (0 fail, 0 cancelled, 0 skipped). Run twice in this
session (once before the registry/docs changes, once after the full
regression pass) — identical result both times, confirming the docs/
registry-only changes did not touch application code.

## API Contract Suites (Postman/Newman + AJV, against a live server + reseeded DB)

| Suite | Command | Result |
|---|---|---|
| Public/Schema (products, health) | `npm run api:test:postman --workspace api-tests` | 11 requests, 26 assertions, **0 failed** |
| Auth/Protected | `npm run api:test:auth --workspace api-tests` | 19 requests, 42 assertions, **0 failed** |
| Orders/Payment | `npm run api:test:orders-payment --workspace api-tests` | 64 requests, 118 assertions, **0 failed** |
| Notifications | `npm run api:test:notifications --workspace api-tests` | 20 requests, 48 assertions, **0 failed** |
| API↔DB validation | `npm run api:test:db --workspace api-tests` | 17 scenarios, 97 assertions, **0 failed** |

Total: **331 assertions across 5 suites, 0 failures.**

## Web QA (Playwright)

```
PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx playwright test
```

**26/26 PASS**, including the two controlled-failure/negative-control
tests (`visual-regression.spec.js` — a deliberate visual change is
correctly *caught*, and a genuinely different page is correctly
*flagged* as a mismatch; both are pass conditions for the test, not
failures, even though the terminal renders them with a ✘ glyph for the
underlying screenshot diff). See `.ai/KNOWN-ISSUES.md` KI-2 for the
environment-specific `PLAYWRIGHT_CHROMIUM_PATH` note.

## Registry Validator

```
npm run registry:validate
```

**PASS — 0 errors.** Validates 22 competencies, 10 domain exposures, 33
tools, 29 gaps (15 gap references resolved), 5 domain catalog entries,
10 lab catalog entries (all paths filesystem-checked), 11 evidence
entries (all artifact paths filesystem-checked), 35 relationships.
Deliberately verified to fail on bad input first — see
`.ai/DECISIONS.md` D3.

## Repository-Wide Link Integrity

Custom Node.js scanner (`\]\(([^)]+)\)` regex, `fs.existsSync` resolution,
relative to each file): **781/782 links resolve.** The one "broken"
result is a known false positive — a literal regex-pattern example
inside prose in `QA-DEMO-SYSTEM/evidence/PHASE-19-CLEAN/EXECUTION.md`
(`](...\.md)`), not a real markdown link. Unchanged since before this
transformation began.

## Not re-run this session

- **Selenium** (`npm run selenium:test --workspace automation-labs`):
  not re-run locally — this repository's own evidence already documents
  it as sandbox-blocked in local dev environments and CI-only-passing
  (see `evidence.selenium.ci-verified-run`); re-attempting it locally
  here would only reproduce the already-documented local block, not add
  new information.
- **JMeter / Locust**: not re-run — no functional or timing-sensitive
  code was touched this session; their existing evidence
  (`evidence.performance.jmeter-fail-gate-run`,
  `evidence.performance.locust-load-run`) is unaffected by docs/registry
  changes.
- **CI (GitHub Actions)**: not re-triggered from this session (no push
  to a remote branch has occurred yet as of writing this file); the
  FINAL IMPLEMENTATION REPORT records CI status as NOT_RE-VERIFIED_THIS_SESSION
  rather than assuming the last known 4/4 SUCCESS still holds.
