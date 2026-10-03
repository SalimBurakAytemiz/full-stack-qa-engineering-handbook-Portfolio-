# Desktop QA & Advanced Release Engineering

**Executable lab:**
`QA-DEMO-SYSTEM/automation-labs/release-engineering/` (21 unit tests +
a real aggregate run that validates this repository's own real
`CHANGELOG.md` and all 6 real workspace `package.json` files, plus two
opposite real scenarios proving a canary rollout state machine's
pass-through and automatic-rollback behavior).

**Learning-only (infrastructure gap):** Desktop QA — see
`01-DESKTOP-QA-LEARNING.md`.

## Scope boundary — read this first

Desktop QA here is LEARNING/DOCUMENTATION-ONLY, same infrastructure-gap
class as `QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/APPIUM-LEARNING.md`:
this repository contains no real desktop application (Electron, WPF,
.NET MAUI, Qt, or otherwise) and no OS-level UI-automation target
(WinAppDriver, macOS Accessibility API) to drive. A real execution
attempt against a target that does not exist would not produce a real
finding — it would only reproduce the same blocker already documented
for Mobile (Phase 8) and Appium (Phase 10). Release engineering,
conversely, has two genuinely real, in-repository targets — this
repository's own `CHANGELOG.md` and `package.json` files, and a
hand-rolled but behaviorally real canary-rollout state machine — so it
gets a full executable lab instead.

Advanced release engineering here means release-versioning integrity
and progressive-rollout/rollback testing — not a real CI/CD
orchestration platform (Spinnaker, Argo Rollouts, Harness), not a real
traffic-shifting proxy or load balancer, and not real Kubernetes/cloud
infrastructure. `lib/rollout-manager.js` is an in-process state
machine that never shifts real network traffic — see
`release-engineering/README.md`'s own "Scope boundary" section for the
full disclosure.

## A real finding this milestone

The release-engineering lab's first draft of `classifyBump()`
special-cased a major-version change under `0.y.z` as a new
`MINOR_PRE_1_0` category, on the theory that a `0.1.0 -> 0.2.0` bump is
a disguised major change. A real unit test asserting that exact
transition caught the bug immediately: the major field never actually
changes in a `0.x -> 0.(x+1)` bump, so the premise itself was wrong.
The fix removed the invented category and added a correctly-scoped
`isUnstableApi()` function instead, which the real aggregate run then
applied honestly to this repository's own 6 workspace versions (all
still `0.1.0`, so all `6/6` report as pre-1.0/unstable). See
`02-RELEASE-VERSIONING-AND-CHANGELOG-INTEGRITY.md` and
`COMMON-MISTAKES.md`.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-DESKTOP-QA-LEARNING.md` | Desktop/native UI automation concepts (WinAppDriver, Appium Desktop, Playwright-for-Electron) — LEARNING-only, why no real target exists here |
| `02-RELEASE-VERSIONING-AND-CHANGELOG-INTEGRITY.md` | Hand-rolled semver parsing/precedence, Keep-a-Changelog structural validation, the pre-1.0 instability finding |
| `03-CANARY-ROLLOUT-AND-AUTOMATIC-ROLLBACK.md` | Staged traffic rollout, health-check-gated advancement, automatic rollback on failure |
| `COMMON-MISTAKES.md` | Real mistakes found and fixed while building this exact lab |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
competencies this area adds — every one has `professional: {status: NONE}`
unless an existing, independent professional source proves otherwise.
