# Known Issues — Increment 2 (post 5-item closure)

All five items from the previous round (CI wiring, relationship graph,
GraphQL/WebSocket contract-drift, unanswered interview narrative, and
the three placeholder folders) are resolved — see `.ai/DECISIONS.md` and
`.ai/MASTER-REQUIREMENTS-COMPLIANCE.md`. What remains open below is
real, disclosed, and does not misrepresent anything as done.

## KI-1 — Relationship graph is not exhaustive beyond the core

133 relationship edges link every competency, domain, tool, pattern,
lab, evidence, and gap entry that has real content — but not every
theoretically possible pairing. Competencies with no lab/domain
counterpart yet (e.g. `competency.frontend-qa.react-react-native-flutter`
beyond its one `APPLIES_TO_DOMAIN` edge) have fewer edges than the
E-Commerce/FinTech core. This is accurate incompleteness, not a bug —
the two mandated traceability paths are confirmed walkable for the
core, which is what claim-integrity requires evidence for.

## KI-2 — Registry CI job not yet observed on a live GitHub Actions run

`registry-integrity` was added to `.github/workflows/ci.yml` and proven
locally (`rm -rf node_modules && npm ci && npm run registry:validate`
from a clean state, reproducing exactly what the runner does) but has
not yet been observed passing on an actual GitHub Actions run from this
branch, since no push+Actions-API check was performed this session.

## KI-3 — JMeter's real binary could not be exercised in this session's environment

`jmeter:test` (the real `.jmx` run against a live server) failed with
`com.thoughtworks.xstream.security.ForbiddenClassException:
org.apache.jmeter.save.ScriptWrapper` — a JMeter-version-specific
XStream security-policy issue in this session's installed JMeter,
unrelated to any file this session touched. The fail-gate wrapper's own
logic was verified via its unit tests (7/7 PASS, no real binary
needed). See `.ai/DECISIONS.md` D9.

## KI-4 — Selenium's local run remains environment-blocked (unchanged from prior sessions)

Confirmed again this session by actually attempting it, not assumed:
`SELENIUM_LAB_STATUS: EXECUTION_BLOCKED` — Selenium Manager cannot
reach `googlechromelabs.github.io` from this sandbox. Passes in GitHub
Actions CI (real, hosted-runner internet access) per existing evidence.

## KI-5 — `shared/contracts/` covers REST, GraphQL, and one WebSocket/event pair, not every possible event type

The `order.paid` event and the notification push message are the two
real message shapes this backend currently emits, and both now have
canonical schemas with drift checks. If a future increment adds new
event/message types, they need their own schema + drift test following
the same pattern — this is a template now, not a closed, one-time
exercise.
