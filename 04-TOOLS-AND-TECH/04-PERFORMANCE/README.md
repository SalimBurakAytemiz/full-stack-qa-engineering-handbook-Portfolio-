# Performance Tools

## JMeter (T3 EXECUTED — fail gate T4 unit-tested; native runtime environment-blocked)

**Concepts:** thread-group-based load generation with samplers,
assertions, and post-processors; the non-GUI CLI mode is meant for
CI/headless execution.

**Real finding in this repository:** stock JMeter's own process exit
code does NOT reliably reflect internal sample/assertion failures —
empirically reconfirmed (a real JVM crash still exited 0). This is why
`automation-labs/jmeter/scripts/run-jmeter.js` exists: it inspects the
JTL result file's actual content (header-driven column lookup, not
positional) rather than trusting the process exit code.

**Setup:** `QA-DEMO-SYSTEM/automation-labs/jmeter/` — `.jmx` plan with
real JSONPostProcessor correlation (extracting a login token, reusing
it in a later request — genuine correlation, not just CSV data
parameterization) and a `DurationAssertion` threshold (3000ms).

**Environment limitation, stated plainly:** native JMeter execution in
this environment fails with `ForbiddenClassException`
(`apt jmeter 2.13` vs. system `libxstream-java 1.4.20` — a package
compatibility issue, not a file-specific bug, cross-verified against
JMeter's own stock template). The fail-gate LOGIC is proven correct
independent of this (7/7 fixture-based unit tests, fully decoupled
from the JMeter binary).

**Related labs:** `QA-DEMO-SYSTEM/automation-labs/jmeter/`.

## Locust (T3 EXECUTED)

**Concepts:** Python-based load testing, tests written as normal
Python code rather than a DSL — was installable here because it has no
JVM/XStream dependency chain, unlike JMeter.

**Real run in this repository:** 549 requests, 0 failures, 22 real
`POST /api/orders` calls via a `place_order` task, p99 latency
recorded — a genuine load run, not a simulated number.

**Related labs:** `QA-DEMO-SYSTEM/automation-labs/locust/`.

## k6, Gatling (T0 INDEXED)

Named in the target catalog; not installed/attempted in this
repository — a documented gap (see the Digital Twin's `gaps.yaml`).
