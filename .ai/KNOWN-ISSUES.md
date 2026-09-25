# Known Issues — Master Transformation Completion Gate

Every previously-tracked item (registry CI wiring, relationship graph
completeness, GraphQL/WebSocket contract-drift, the 3 Handbook/domain
PARTIAL rows, the unanswered interview narrative, the 3 placeholder
folders) is resolved — see `.ai/MASTER-REQUIREMENTS-COMPLIANCE.md` for
the full classification. What remains below is genuinely open, real,
and disclosed — none of it misrepresents anything as done, and none of
it is an implementable repository requirement left unfinished.

## KI-1 — Registry CI job not yet observed on a live GitHub Actions run

`registry-integrity` (`.github/workflows/ci.yml`) is implemented and
proven locally (a clean `npm ci` reproduction of exactly what the
runner does) but this session has no GitHub Actions/API access to
trigger and observe an actual run. This is a limitation of this
session's environment, not of the implementation — classified
EXTERNALLY_BLOCKED in `.ai/MASTER-REQUIREMENTS-COMPLIANCE.md`, not
PARTIAL.

## KI-2 — Real JMeter binary could not be exercised in this session's environment

`jmeter:test` failed with `com.thoughtworks.xstream.security.ForbiddenClassException:
org.apache.jmeter.save.ScriptWrapper` — a JMeter-version-specific
XStream security-policy issue, unrelated to any file this session
touched (re-confirmed this session, not carried over from an earlier
assumption). The fail-gate wrapper's own logic is verified via its
unit tests (7/7 PASS, no real binary needed).

## KI-3 — Selenium's local run remains environment-blocked (unchanged, re-confirmed)

`SELENIUM_LAB_STATUS: EXECUTION_BLOCKED` — Selenium Manager cannot
reach `googlechromelabs.github.io` from this sandbox. Passes in GitHub
Actions CI (real, hosted-runner internet access) per existing evidence.
Attempted for real this session, not assumed.

## Note on the career-motivation fact

`fact.career-motivation.why-qa` is a genuine `USER_CONFIRMATION_REQUIRED`
personal fact (`01-SALIM-BURAK-DIGITAL-TWIN/registry/source-provenance.yaml#unresolved_personal_facts`),
not a Known Issue in the engineering sense — it does not appear in this
list because nothing about it is unresolved from an implementation
standpoint; it is correctly and completely represented as awaiting the
user's own input.
