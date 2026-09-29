# QA Metrics & Reporting

Metrics (what to measure) and reporting (how to communicate it) are
two different skills, kept as one topic here because a metric nobody
can act on is wasted effort.

## Metrics

The metrics themselves — pass rate, coverage, defect leakage, defect
aging, the "Metric ≠ Quality" principle — are already documented in
depth at
[`../05-TEST-MANAGEMENT/14-QA-METRICS.md`](../05-TEST-MANAGEMENT/14-QA-METRICS.md).
This topic doesn't duplicate that; it exists so "QA Metrics & Reporting"
has its own entry in the 24-topic index rather than being buried inside
Test Management, per the master taxonomy's own structure.

## Reporting: turning metrics into something a reader can act on

This repository has several real, working examples of QA reporting
artifacts — not just the concept described abstractly:

### Machine-generated HTML reports

`QA-DEMO-SYSTEM/api-tests`'s `api:report:*` scripts
(`newman-reporter-htmlextra`) produce real HTML test reports from an
actual Newman run — pass/fail counts, request/response detail, and
(deliberately) redacted sensitive fields (login request bodies, runtime
tokens) so a report can be shared without leaking credentials. See
`04-TOOLS-AND-TECH/01-API-AND-CONTRACT/README.md`.

### The contextualized-metric table pattern

`../05-TEST-MANAGEMENT/14-QA-METRICS.md`'s own "Bağlamlı Metrik"
(contextualized metric) table — pairing a raw number with the context
that makes it meaningful ("100% pass rate, out of 45 scenarios, 60% of
which are negative/edge cases") — is the same pattern this
repository's own `.ai/TEST-STATUS.md` uses for every regression run:
never a bare "PASS," always PASS/FAIL/NOT_EXECUTED with the real
command and real numbers next to it.

### Status classification beyond pass/fail

A binary pass/fail loses information a stakeholder needs. This
repository's own `.ai/MASTER-REQUIREMENTS-COMPLIANCE.md` demonstrates a
5-state classification (COMPLETE / PARTIAL / NOT_APPLICABLE /
EXTERNALLY_BLOCKED / USER_CONFIRMATION_REQUIRED) built specifically
because "done" and "not done" aren't the only two states a real
requirement can be in — some things are intentionally scoped down, some
are blocked by the environment, and collapsing those into a single
"incomplete" bucket hides the reason a reader would need to act
correctly on the report.

### Evidence traceability as a reporting discipline

`06-EVIDENCE/evidence.yaml`'s maturity scale (E0_CLAIMED through
E5_INDEPENDENTLY_AUDITED) is itself a reporting convention: a claim's
report includes not just "this passed" but *what artifact proves it*
and *how mature that proof is* — the same discipline good defect/test
reporting needs (a defect report without repro evidence is a claim, not
a report).

## Common Reporting Mistakes (beyond the metric-level ones already covered)

- Reporting a suite as "passed" without stating what was NOT executed —
  this repository's own `.ai/TEST-STATUS.md` explicitly lists
  NOT_EXECUTED suites (Selenium locally, the real JMeter binary run)
  rather than omitting them, because a silent omission reads as "this
  wasn't a concern," which misrepresents a real, disclosed gap as a
  non-issue.
- Presenting a generated report (HTML, JSON) without also stating how
  to regenerate it — every reporting artifact in this repository is
  backed by a real, runnable command, not a static file with no
  reproduction path.
