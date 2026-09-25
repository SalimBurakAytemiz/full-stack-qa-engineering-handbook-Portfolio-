# Test Status — Master Transformation Completion Gate

All results below are from real command execution in this session, on
commit `791c040` and this commit. Every suite is stated as PASS, FAIL,
or NOT_EXECUTED — never converted to PASS without a real run.

| Suite | Result | Detail |
|---|---|---|
| Backend (`node --test`, 160 tests) | **PASS** | 160/160, 0 fail |
| API contract — public/schema | **PASS** | 11 requests, 26 assertions, 0 failed |
| API contract — auth/protected | **PASS** | 19 requests, 42 assertions, 0 failed |
| API contract — orders/payment | **PASS** | 64 requests, 118 assertions, 0 failed |
| API contract — notifications | **PASS** | 20 requests, 48 assertions, 0 failed |
| API↔DB validation | **PASS** | 17 scenarios, 97 assertions, 0 failed |
| GraphQL functional tests | **PASS** | Part of the 160-test backend suite |
| GraphQL contract-drift check | **PASS** | Live schema matches `shared/contracts/graphql/schema.graphql` byte-for-byte |
| WebSocket tests | **PASS** | Part of the 160-test backend suite |
| WebSocket/event contract-drift check | **PASS** | Live push message and live `order.paid` event payload both AJV-valid |
| Database tests | **PASS** | Part of the 160-test backend suite |
| Web QA (Playwright, 26 tests) | **PASS** | 26/26, including both controlled-failure/negative-control visual regression tests |
| Selenium (local) | **NOT_EXECUTED** | `SELENIUM_LAB_STATUS: EXECUTION_BLOCKED` — sandbox has no internet for chromedriver auto-download; attempted for real this session, matches prior documented behavior; passes in GitHub Actions CI |
| Security tests | **PASS** | Part of the 160-test backend suite |
| Deterministic performance gate — JMeter fail-gate unit tests | **PASS** | 7/7 |
| Deterministic performance gate — real JMeter binary | **NOT_EXECUTED** | `JMETER_STATUS: LAUNCH_OR_RUNTIME_ERROR` — XStream `ForbiddenClassException`, an environment-specific JMeter version issue unrelated to any file touched this session |
| Locust load test | **PASS** | Real run, 280 requests, 0 failures |
| Registry schema validation | **PASS** | 0 errors |
| Stable-ID / duplicate-ID validation | **PASS** | 0 duplicates across every registry file |
| Relationship graph validation | **PASS** | 224/224 relationships valid, both endpoints resolve for every edge |
| Orphan validation (all entity types) | **PASS** | 0 orphans across 121 competency/domain/tool/pattern/gap/professional-case entries plus 11 evidence and 10 lab entries |
| Generated-output sync | **PASS** | `REGISTRY-INDEX.md` matches a fresh regeneration byte-for-byte |
| Broken-link/navigation validation | **PASS** | 802/803 links resolve; 1 known pre-existing false positive (literal regex-example text in prose, unchanged since before this session) |
| Claim-integrity validation | **PASS** | CI_VERIFIED-without-evidence, AUDITED-without-audit-record, and professional-claim-without-provenance all enforced by the validator itself |
| Secret/confidentiality scan | **PASS** | Full `fe8daf5..HEAD` diff scanned — only legitimate deterministic test fixtures matched, zero real secrets |
| TR comment policy | **PASS** | Applied to all new non-obvious logic this session |
| Comment-quality review | **PASS** | No comments on trivial lines; none inserted into JSON |
| AI-filler documentation review | **PASS** | Every new Handbook/domain/pattern page states its real implementation status (IMPLEMENTED/NOT_IMPLEMENTED/NOT_APPLICABLE) rather than implying uniform depth or fabricated repository evidence |

## CI status

`registry-integrity` job added to `.github/workflows/ci.yml`, proven
locally with a clean `rm -rf node_modules && npm ci && npm run
registry:validate`. Not observed on a live GitHub Actions run this
session — this session has no GitHub Actions/API access to trigger or
poll one; see `.ai/MASTER-REQUIREMENTS-COMPLIANCE.md`'s
EXTERNALLY_BLOCKED classification for this specific, narrow limitation
(the job's implementation itself is complete and proven, only live
observation from this session is blocked).

## What changed since the last TEST-STATUS.md

This is the third full regression pass this session (previous passes:
after the initial registry build, and after the 5-item closure round).
This pass follows the Handbook 24-topic closure, the 3 domain deep
dives, the relationship-graph completeness pass, and the 14 new System
Patterns — none of which touched `QA-DEMO-SYSTEM`'s application code,
so the identical PASS results across all three passes is expected, not
assumed: each pass re-ran the real commands rather than reusing a
cached result.
