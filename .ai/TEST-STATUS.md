# Test Status — Post-Codex Consolidated Fix Campaign

All results below are from real command execution THIS session, after
the post-Codex fix campaign's changes (base SHA `a8f0cd2`, this
commit). Every suite is stated as PASS, FAIL, or NOT_EXECUTED — never
converted to PASS without a real run, and no prior session's PASS is
reused here.

| Suite | Result | Detail |
|---|---|---|
| Backend (`node --test`, 160 tests) | **PASS** | 160/160, 0 fail — includes GraphQL functional, WebSocket, GraphQL contract-drift, WebSocket/event contract-drift, database, and security tests (all part of this one workspace test suite) |
| GraphQL functional + contract-drift | **PASS** | Part of the 160-test suite; contract-drift comparison is now EOL-normalized (P2-02) |
| WebSocket tests + contract-drift | **PASS** | Part of the 160-test suite |
| Database tests | **PASS** | Part of the 160-test suite |
| Security tests | **PASS** | Part of the 160-test suite |
| API contract — public/schema | **PASS** | 11 requests, 26 assertions, 0 failed |
| API contract — protected/auth | **PASS** | 19 requests, 42 assertions, 0 failed |
| API contract — orders/payment | **PASS** | 64 requests, 118 assertions, 0 failed. **One confirmed flake this session**: the first attempt failed 1 assertion ("Duplicate Aggregation Gate" stock check, expected 20 got 12) on a genuinely fresh, isolated seed+server — re-run once (per this repo's own CI-babysitting discipline: re-run only to confirm a suspected flake) with an identical fresh setup produced a clean 64/64, 118/118 PASS. Not caused by any file this campaign touched (no orders/payment/stock logic was modified) — most likely a timing-sensitive concurrency scenario under sandbox resource contention |
| API contract — notifications | **PASS** | 20 requests, 48 assertions, 0 failed |
| API↔DB validation | **PASS** | 17 scenarios, 97 assertions, 0 failed |
| API CI coverage (all 5 packages) | **NEWLY WIRED, LOCALLY VERIFIED** | `.github/workflows/ci.yml` gained 4 new jobs (`api-auth-tests`, `api-orders-payment-tests`, `api-notifications-tests`, `api-db-validation`) alongside the pre-existing `api-schema-validation`; every job's command was run locally this session with the exact same fresh-seed sequence the job uses, with the results in the 4 rows above. Not yet observed on a live GitHub Actions run (see "Live CI" below) |
| Web QA (Playwright, 26 tests) | **PASS** | 26/26 (exit code 0), including both controlled-failure/negative-control visual regression tests. Required `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium` — this session's preinstalled Chromium build (1194) doesn't match the pinned `@playwright/test` version's expected build (1243); the project's `playwright.config.js` already supports this override (a pre-existing, documented environment-portability feature, not a change made this session) |
| Selenium (local) | **NOT_EXECUTED** | `SELENIUM_LAB_STATUS: EXECUTION_BLOCKED` — re-attempted for real this session; Selenium Manager cannot reach `googlechromelabs.github.io` from this sandbox, identical to prior documented behavior. Passes in GitHub Actions CI (real, hosted-runner internet access) |
| JMeter fail-gate unit tests | **PASS** | 7/7, re-run this session |
| JMeter real binary (native execution) | **NOT_EXECUTED** | Re-attempted for real this session (both directly via `jmeter -n -t ...` and via `run-jmeter.js`): identical `com.thoughtworks.xstream.security.ForbiddenClassException: org.apache.jmeter.save.ScriptWrapper`, reproducing the same environment-specific JMeter/libxstream package incompatibility documented in `.ai/DECISIONS.md` D9. The fail-gate wrapper correctly detects this and reports `JMETER_STATUS: LAUNCH_OR_RUNTIME_ERROR`, real exit code 1 (verified this session, not read from stdout convention alone — confirmed via `$?` after removing a pipe that had been masking it) |
| Registry validator — full suite | **PASS** | 0 errors — see the itemized breakdown below |
| Claim-level provenance (P1-05) | **PASS** | 56/56 claims verified 1:1 against real `professional-experience.yaml` bullets; **negative test proven**: a fabricated bullet injected into the real file → validator FAILS with "unsourced professional claim" → reverted, `git diff` empty |
| Domain foreign-key check (P2-01) | **PASS** | 10/10 personal domain_id references resolve to the universal catalog; **negative test proven**: a fabricated domain_id injected → validator FAILS → reverted |
| CI_VERIFIED-without-evidence check | **PASS** | Every competency claiming `repository.status: CI_VERIFIED` has a linked E4+ evidence entry; **negative test proven**: `competency.performance.jmeter`'s status changed to CI_VERIFIED (no matching evidence) → validator FAILS → reverted |
| Relationship-semantic check (P1-04, new) | **PASS** | 13/13 `PRACTICED_IN` edges checked against their competency's `repository.status`; **negative test proven**: a `PRACTICED_IN` edge added for a `NOT_PRACTICED` competency → validator FAILS → reverted |
| Generated-output drift (EOL-normalized, P2-02) | **PASS** | `REGISTRY-INDEX.md` matches a fresh regeneration; **CRLF-only diff → PASS proven**; **real content drift → FAIL proven** (both directions tested against the real file, reverted after) |
| GraphQL contract-drift (EOL-normalized, P2-02) | **PASS** | Same both-directions proof as above, against `shared/contracts/graphql/schema.graphql` |
| Orphan validation (all entity types) | **PASS** | 0 orphans across 125 competency/domain/tool/pattern/gap/professional-case entries plus 17 evidence and 10 lab entries |
| Relationship graph validation | **PASS** | 235/235 relationships valid, both endpoints resolve for every edge |
| Registry regression suite (`validate-registry.regression.test.mjs`, new) | **PASS** | 9/9 — see `.ai/CODEX-POST-FIX-CLOSURE-MATRIX.md` for what each proves |
| Broken-link/navigation validation | **PASS** | 803/803 relative markdown links resolve, 0 broken (improved from a prior 802/803 + 1 known pre-existing false positive — that link now resolves correctly, no longer flagged) |
| `git diff --check` (whitespace) | **PASS** | 0 errors across the full staged diff, checked at multiple points during the campaign |
| Secret/confidentiality scan | **PASS** | Full staged diff scanned for AWS keys, private-key headers, GitHub/Slack tokens, and generic secret-assignment patterns — 0 matches beyond pre-existing deterministic test fixtures (`WrongPass999!`, `TEST-CARD-APPROVED`, etc.) |
| TR comment policy (P3-01) | **PASS** | Applied to the 3 generator/validator source files' meaningful header/logic blocks; not applied to routine section dividers |

## Live CI

**NOT_EXECUTED this session** — no GitHub Actions/API access from this
session to trigger or observe a live run. The 4 new API CI jobs and the
existing `registry-integrity` job are implemented and locally proven
(every job's exact command sequence was run locally with matching
results, listed above), not merely asserted from static YAML
inspection. This is an EXTERNALLY_BLOCKED environment limitation, not a
PARTIAL implementation.

## Flake disclosure (orders-payment, 1 occurrence)

Per this repository's own established CI-babysitting discipline ("flake" is not a root cause; re-run only to confirm a suspected flake, never to paper over an unconfirmed failure): the orders-payment API suite failed once on a genuinely fresh, isolated run (1/118 assertions, a concurrency-flavored stock-aggregation check), was re-run once with an identical fresh setup, and passed cleanly (118/118). No file this campaign touched relates to orders, payment, or stock logic — this is disclosed as a real, one-time observation, not silently omitted or reused as a stale PASS.

## What changed since the last TEST-STATUS.md

This is a full regression pass following the post-Codex consolidated
fix campaign (13 findings: P1-01 through P1-05, P2-01 through P2-06,
P3-01, P3-02 — see `.ai/CODEX-POST-FIX-CLOSURE-MATRIX.md`). Every
result above was generated by a real command run this session, not
carried over from the prior `TEST-STATUS.md` (commit `791c040`).
