# Interview Questions — Desktop QA & Advanced Release Engineering

Every answer is scoped honestly: what this repository's lab actually
proves (repository practice), versus professional experience or
production-grade tooling this doesn't claim. See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "How would you approach testing a desktop application, given your web/API background?"

The core discipline carries over directly — locators, waits, Page
Objects, test data, reporting — but the target is fundamentally
different: a native OS window with an accessibility tree instead of a
DOM. On Windows I'd reach for WinAppDriver (Microsoft's own
Selenium-protocol-compatible driver, so the client-side patterns I
already use for Selenium transfer almost unchanged); for an Electron
app specifically, Playwright now supports driving the real Chromium
window directly, which is much closer to web automation than native
desktop automation. I'll say directly: I haven't run this against a
real desktop app, and this repository has no native desktop
application to automate against — my lab work here is release
engineering (version/changelog integrity and canary-rollout testing),
not desktop UI automation, and I document that gap honestly rather
than fabricate a fake desktop target just to claim coverage.

## "Why didn't you build a fake desktop app just to have something to test?"

Because the exercise would be hollow — a fake app built specifically
to be automated doesn't surface any real desktop-automation failure
mode (a native dialog needing its own window handle, an accessibility
tree quirk, a driver/OS version mismatch); it would just prove I can
write code that passes against code I also wrote to pass. That's the
same reasoning this repository already applied to Mobile and Appium:
when a real target genuinely doesn't exist, the honest answer is
documented domain knowledge, clearly labeled as not executed, rather
than a result that looks real but isn't backed by anything.

## "How do you decide whether a version bump is correct for a given change?"

I don't eyeball it — I implemented the actual SemVer 2.0.0 precedence
rules, including the two that are easy to get wrong: a prerelease
version has lower precedence than the same version without one
(`1.0.0-alpha < 1.0.0`), and build metadata is explicitly excluded
from precedence comparison. I also deliberately didn't invent a
shortcut category for pre-1.0 packages — my first attempt did exactly
that (a `MINOR_PRE_1_0` category for a `0.x` major-looking bump), and
a test case covering that exact transition caught that the major
field never actually changes in a `0.1.0 -> 0.2.0` bump, so the
premise was wrong, not just the code. I replaced it with a correctly
separate `isUnstableApi()` signal instead.

## "What's actually different about validating a changelog versus just checking it's non-empty?"

A changelog's correctness is structural, not just "something is
there." I built a real heading parser that classifies every `##`
heading as Unreleased, a real semver-valid version, or something else
entirely, then enforces real ordering rules: released versions must
be in strictly descending order (compared with real semver precedence,
never string comparison — `"10.0.0"` must sort after `"2.0.0"`, which
plain string comparison gets backwards), and unreleased content must
precede all released history. Run against this repository's own real
CHANGELOG.md, this surfaced a legitimate but unusual real shape — two
separate `[Unreleased]` sections and zero released versions — which my
checker correctly accepts rather than flagging as a false positive.

## "How do you test that a canary rollout actually protects against a bad release?"

By proving the one behavior that matters with a real, injected
failure — not by reading the orchestration code and assuming it's
correct. I built a staged rollout state machine with an injectable
health-check function specifically so a test can make the health
check fail at an exact stage and observe the real resulting
transition. I have one test proving the happy path (all stages
healthy reaches 100%) and a separate, equally important test proving
the failure path (a real injected failure at the 50% stage immediately
rolls back to 0%, never reaching further) — testing only the happy
path would have passed even if the rollback branch was entirely
missing, which defeats the entire purpose of testing a canary
mechanism.

## "What would you still need before this rollout logic could run against a real production deployment?"

A real traffic-shifting mechanism — a service mesh, load balancer, or
cloud provider's native canary/weighted-routing feature — to actually
move live traffic percentages, plus real health-check integration
against real metrics (error rate, latency percentiles) instead of a
boolean function. What I built and tested is the orchestration
decision logic in isolation: when to advance a stage, when to roll
back, and what audit trail that produces. That is the part most
feasible to test deterministically without real infrastructure, and
the part most likely to contain a real bug (an off-by-one in stage
advancement, a rollback to the wrong percentage) if written carelessly
— but it is explicitly not a claim that I've operated a real canary
deployment in production.
