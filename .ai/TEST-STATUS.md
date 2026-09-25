# Test Status — Increment 2 Final Regression (post 5-item closure)

All results below are from real command execution in this session, on
commit `fe8daf5` and this commit. Every suite is stated as PASS, FAIL,
or NOT_EXECUTED — never converted to PASS without a real run.

| Suite | Result | Detail |
|---|---|---|
| Backend (`node --test`, 160 tests) | **PASS** | 160/160, 0 fail. Includes GraphQL functional tests, GraphQL contract-drift test, WebSocket tests, WebSocket/event contract-drift tests, database tests, security tests, observability tests — all in the same workspace, one command. |
| API contract — public/schema | **PASS** | 11 requests, 26 assertions, 0 failed |
| API contract — auth/protected | **PASS** | 19 requests, 42 assertions, 0 failed |
| API contract — orders/payment | **PASS** | 64 requests, 118 assertions, 0 failed |
| API contract — notifications | **PASS** | 20 requests, 48 assertions, 0 failed |
| API↔DB validation | **PASS** | 17 scenarios, 97 assertions, 0 failed |
| GraphQL functional tests | **PASS** | Part of the 160-test backend suite (`graphql.test.js`, `graphql-error-masking.test.js`, `graphql-websocket-notification.test.js`) |
| GraphQL contract-drift check | **PASS** | `graphql-contract-drift.test.js` — live schema matches `shared/contracts/graphql/schema.graphql` byte-for-byte |
| WebSocket tests | **PASS** | Part of the 160-test backend suite (`websocket.test.js`, `websocket-events-advanced.test.js`) |
| WebSocket/event contract-drift check | **PASS** | `realtime-contract-drift.test.js` — live push message and live `order.paid` event payload both AJV-valid against their canonical schemas |
| Database tests | **PASS** | Part of the 160-test backend suite (`database-testing.test.js`) |
| Web QA (Playwright, 26 tests) | **PASS** | 26/26, including the two controlled-failure/negative-control visual regression tests. `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` used — see KI-2 below. |
| Selenium | **NOT_EXECUTED** | `SELENIUM_LAB_STATUS: EXECUTION_BLOCKED` — Selenium Manager cannot reach `googlechromelabs.github.io` from this sandboxed session (no chromedriver auto-download). This is the exact, already-documented environment split (CI-only real pass, local sandbox blocked) — not a new regression; no Selenium-related file was touched this session. |
| Security tests | **PASS** | Part of the 160-test backend suite (`security.test.js`) |
| Deterministic performance gate — JMeter fail-gate unit tests | **PASS** | `jmeter:test:gate-unit`, 7/7 — proves the fail-gate LOGIC (JTL-content inspection, not exit-code trust) is sound |
| Deterministic performance gate — real JMeter run | **NOT_EXECUTED** | `JMETER_STATUS: LAUNCH_OR_RUNTIME_ERROR` — `com.thoughtworks.xstream.security.ForbiddenClassException: org.apache.jmeter.save.ScriptWrapper`. A JMeter-internal XStream security-policy incompatibility specific to this session's installed JMeter version, unrelated to any change made this session (no `.jmx` or JMeter script was touched). Not converted to PASS or silently skipped — recorded here as a real environment blocker. |
| Locust load test | **PASS** | Real run: `-u 5 -r 5 --run-time 15s` against the live backend, 280 requests, 0 failures |
| Registry schema validation | **PASS** | `npm run registry:validate` — 0 errors across all checks (schema, duplicate ids, gap/lab/evidence/relationship references, orphans, CI_VERIFIED linkage, generated-output drift) |
| Relationship validation | **PASS** | Part of `registry:validate` — 133/133 relationships valid, both mandated traceability paths confirmed walkable end-to-end (programmatic traversal, not just visual inspection) |
| Generated-output sync | **PASS** | Part of `registry:validate` — `REGISTRY-INDEX.md` matches a fresh regeneration byte-for-byte |
| Broken-link/navigation validation | **PASS** | 782 links scanned repo-wide, 780 resolve; 2 known false positives (literal regex-example text in prose, unchanged pattern from before this session) |
| Claim-integrity validation | **PASS** | See CLAIM-INTEGRITY CHECK in the final report; professional-experience provenance, CI_VERIFIED linkage, and no-self-declared-E5 all enforced by the registry validator itself, not just asserted in prose |
| Confidentiality/secret checks | **PASS** | Full `e63ca07..HEAD` diff scanned for secret/token/credential/PII patterns — only legitimate deterministic test fixtures matched (`test.active01@example.com`, `TEST-CARD-APPROVED`, etc.), zero real secrets |
| TR comment policy | **PASS** | New non-obvious logic (registry validator's CI_VERIFIED enforcement, generated-output drift check, domain_id ownership rule; new contract-drift test files) carries TR comments explaining WHY |
| AI-filler documentation review | **PASS** | Every new doc states real scope limits explicitly rather than implying completeness (see `.ai/KNOWN-ISSUES.md` for what remains genuinely open) |

## CI status

Not re-triggered from this branch via a live GitHub Actions run this
session (would require a push + Actions API check, out of scope for a
local session). Locally reproduced what CI will do for the new
`registry-integrity` job: `rm -rf node_modules && npm ci && npm run
registry:validate` at the repo root — passed cleanly, proving the job
is not a decorative always-pass step.

## Verified to genuinely fail (not just pass by construction)

- Registry validator: fabricated gap reference, disallowed schema
  property, corrupted relationship predicates, an orphaned lab, and
  unsupported CI_VERIFIED claims were all real defects the validator
  caught *during this session's own development* — not staged tests.
  See `.ai/DECISIONS.md`.
- GraphQL contract-drift test: a fabricated GraphQL type appended to the
  snapshot caused the test to fail as expected; cleanly reverted.
- WebSocket contract-drift test: a corrupted `is_read` schema value
  caused exactly that test to fail while the sibling event-payload test
  in the same file still passed, confirming the two checks are
  independent; cleanly reverted.
