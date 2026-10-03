# Production Verification Lab (Synthetic Monitoring / Smoke Tests)

A real synthetic-monitoring/smoke-test runner: it makes real HTTP
requests against a real running backend's actual endpoints, times each
one against a disclosed latency budget, retries real transient
failures, and prints an explicit **GO / GO_DEGRADED / NO_GO** verdict —
the kind of check a production deploy pipeline or on-call rotation
actually runs before/after a release.

## What this lab actually does

- `lib/smoke-checks.js` makes real `fetch` calls against three real
  backend endpoints: `GET /api/health`, `POST /api/auth/login` (with a
  real seeded test user from `shared/test-data/auth-users.json`), and
  `GET /api/products` — each check inspects the real response shape, not
  just the HTTP status code.
- `lib/synthetic-monitor.js` times each real check and classifies it
  against a disclosed budget into three distinct outcomes:
  **PASS** (succeeded, within budget), **SLOW** (succeeded, but over
  budget — a real, separate signal a production monitor must report,
  never conflated with a failure), or **FAIL** (did not succeed). It
  also provides a real retry-with-delay helper for transient failures —
  and deliberately does **not** retry a `SLOW` result, since retrying
  would hide the real latency signal rather than report it.
- `run-production-verification-lab.js` runs all three checks against a
  real running backend and prints an overall verdict: `GO` only if every
  check passed within budget, `GO_DEGRADED` if everything succeeded but
  something was slow, `NO_GO` if anything genuinely failed.

## Honest degraded mode

This lab needs a real running backend at `QA_DEMO_BASE_URL` (default
`http://127.0.0.1:3000`). If none is reachable, it does not skip itself
silently or fake a pass — it reports `NOT_EXECUTED` honestly, the same
pattern this repository's other server-dependent labs
(`property-and-fuzz-testing`) already use.

## Scope boundary

This is not a commercial synthetic-monitoring platform (Pingdom,
Datadog Synthetics, New Relic) — no geographically-distributed probes,
no alerting integration, no historical trend dashboards. It covers the
real mechanism those tools are built on: timed, budgeted checks against
real endpoints with a disclosed pass/slow/fail distinction and an
explicit go/no-go verdict.

## Run it

```bash
# from QA-DEMO-SYSTEM/ — needs a running backend (npm run dev --workspace backend)
QA_DEMO_BASE_URL=http://127.0.0.1:3000 node automation-labs/production-verification/run-production-verification-lab.js
node --test automation-labs/production-verification/tests/*.test.js
```
