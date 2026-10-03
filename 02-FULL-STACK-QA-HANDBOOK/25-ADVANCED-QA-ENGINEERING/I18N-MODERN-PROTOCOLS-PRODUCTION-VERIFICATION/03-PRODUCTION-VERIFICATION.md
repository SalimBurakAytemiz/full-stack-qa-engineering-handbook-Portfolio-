# Production Verification (Synthetic Monitoring / Smoke Tests)

## The question production verification answers

A test suite proves code is correct before it ships. Production
verification asks a different, narrower question after it ships (or
after a deploy, or on a recurring schedule): **is the real, running
system actually healthy right now?** It is deliberately shallow and
fast — a handful of real requests against real endpoints — rather than
exhaustive, because its job is to catch "the deploy broke something
basic" within seconds, not to re-prove business logic a full test suite
already covered.

## PASS, SLOW, and FAIL are three different signals — not two

The easiest mistake in a synthetic monitor is collapsing "it didn't
respond correctly" and "it responded correctly but too slowly" into one
boolean. They demand different responses: a failing endpoint is an
incident; a slow-but-working one might be a capacity warning that
doesn't need to page anyone at 3 AM. `lib/synthetic-monitor.js`'s
`timedCheck` keeps them distinct — `PASS` (succeeded, within budget),
`SLOW` (succeeded, over budget), `FAIL` (did not succeed) — and
`overallVerdict` rolls these up into `GO` / `GO_DEGRADED` / `NO_GO`
rather than a single `GO`/`NO_GO` that would hide which case occurred.
A dedicated test proves a slow check reports `ok: true` — it is still
functionally fine, a fact a cruder boolean check would lose.

## Retrying the right thing, not everything

`lib/synthetic-monitor.js`'s `retry` helper exists for one real failure
mode: a transient connection hiccup on an otherwise-healthy service. It
is deliberately **not** used to retry a `SLOW` result — retrying a slow
check would either hide the real latency signal (if a later attempt
happens to be faster) or just make the monitor itself slower without
fixing anything. Two tests prove the retry helper's actual boundaries:
it gives up after exhausting its budget on a real persistent failure
(proving it does not retry forever), and it returns immediately once a
real attempt succeeds (proving it does not waste its full budget when
unnecessary).

## Honest degraded mode: the same discipline as this repository's other server-dependent labs

This lab needs a real running backend. Rather than requiring one
unconditionally (which would make the lab fail in any environment
without a server running) or silently skipping itself (which would hide
that the check never actually ran), it checks reachability first and
reports an explicit `NOT_EXECUTED` status when none is found — the exact
same pattern already used by this repository's `property-and-fuzz-testing`
lab. The real, observed behavior: `NOT_EXECUTED` with no backend
running, and a real `GO` verdict with real millisecond latencies once a
real backend was started and seeded.

## Scope boundary

This is not a commercial synthetic-monitoring platform (Pingdom, Datadog
Synthetics, New Relic) — no geographically-distributed probes, no
alerting integration, no historical trend dashboards. It demonstrates
the real mechanism those platforms are built on: timed, budgeted checks
against real endpoints with an explicit, disclosed verdict.
