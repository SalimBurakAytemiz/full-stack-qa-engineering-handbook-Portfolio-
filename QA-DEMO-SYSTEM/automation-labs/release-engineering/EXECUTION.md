# Release Engineering Lab — Execution Evidence

**Date:** 2026-10-03
**Environment:** sandbox container.

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/release-engineering/tests/*.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..21 / # pass 21 / # fail 0`. Exit code `0`. Covers
`semver.test.js` (9), `changelog-check.test.js` (7), and
`rollout-manager.test.js` (5).

## Run 2 — the real aggregate lab, against this repository's own real files

**Command:** `node automation-labs/release-engineering/run-release-engineering-lab.js`
(from `QA-DEMO-SYSTEM/`) — independent review finding F8: this run's cwd was previously misdocumented as `QA-DEMO-SYSTEM/automation-labs/`, which combined with this exact command would resolve to a nonexistent doubled path (automation-labs/automation-labs/...); corrected to match the command's own automation-labs/ prefix.

**Actual observed output:**
```
--- Release Engineering Lab: real scenario results ---
  [PASS] package.json version "0.1.0" is valid semver
  [PASS] QA-DEMO-SYSTEM/package.json version "0.1.0" is valid semver
  [PASS] QA-DEMO-SYSTEM/backend/package.json version "0.1.0" is valid semver
  [PASS] QA-DEMO-SYSTEM/api-tests/package.json version "0.1.0" is valid semver
  [PASS] QA-DEMO-SYSTEM/automation-labs/package.json version "0.1.0" is valid semver
  [PASS] QA-DEMO-SYSTEM/web-tests/package.json version "0.1.0" is valid semver
  [PASS] 6/6 real workspaces are under SemVer clause 4 (major=0, API explicitly unstable) — informational, not a failure
  [PASS] real CHANGELOG.md structural check: 3 headings parsed, 0 violation(s)
  [PASS] classifyBump(real root version "0.1.0" -> "0.1.1") = PATCH
  [PASS] canary rollout with all-healthy checks reaches COMPLETE at 100% traffic (observed: state=COMPLETE, traffic=100%)
  [PASS] canary rollout with a failing health check at 50% automatically rolls back to 0% traffic (observed: state=ROLLED_BACK, traffic=0%, history=["START","ADVANCE","ROLLBACK"])

RELEASE_ENGINEERING_LAB_STATUS: EXECUTED
```
Exit code `0`.

## What this run actually proves

- All 6 real workspace `package.json` files in this repository carry
  a genuinely valid semver version — checked with a real hand-rolled
  parser, not a regex spot-check.
- This repository's own real `CHANGELOG.md` was parsed and
  structurally validated: 3 real `##` headings (two `[Unreleased]`
  sections and one trailing `## Prior history` narrative section),
  zero violations against the ordering/placement rules in
  `lib/changelog-check.js`.
- The real `classifyBump` function correctly classified a real
  `0.1.0 -> 0.1.1` bump as `PATCH`.
- The canary rollout manager was proven against two real, opposite
  scenarios with the same unmodified code: an all-healthy run reaches
  `COMPLETE` at 100% traffic, and a run with a real injected failure
  at the 50% stage automatically rolls back to 0% traffic — the
  observed `history` array (`START`, `ADVANCE`, `ROLLBACK`) is the
  real, in-order audit trail the state machine produced, not an
  assumption about what it should have done.

## A real finding, not a hypothetical one

The first draft of `classifyBump` special-cased a major-version change
under `0.y.z` as a new `MINOR_PRE_1_0` category, reasoning (incorrectly)
that a `0.1.0 -> 0.2.0` bump should be reported as a disguised major
change. `semver.test.js` asserted that exact transition and caught the
bug immediately: the major field never actually changes in a
`0.x -> 0.(x+1)` bump — only minor does — so the "disguised major"
premise was simply wrong. The fix removed the invented category and
added a separate, correctly-scoped `isUnstableApi()` function for the
real SemVer clause 4 signal ("major version zero... the public API
SHOULD NOT be considered stable"), which the aggregate run above
applies honestly to all 6 real workspace versions (6/6, since every
workspace in this repository is still `0.1.0`). See
`COMMON-MISTAKES.md` in the handbook for the general lesson.

## Scope and honesty notes

- `lib/rollout-manager.js` never shifts real traffic — see `README.md`'s
  "Scope boundary" section.
- `lib/changelog-check.js` checks this repository's own real
  CHANGELOG.md's structure; it is not a general-purpose linter.

## Run 3 — CI-verified

GitHub Actions run
[`37085881867`](https://github.com/SalimBurakAytemiz/full-stack-qa-engineering-handbook-Portfolio-/actions/runs/37085881867)
(commit `131c685`), job **"Release Engineering lab (semver/changelog
integrity + canary rollout)"** — `conclusion: success`. The same
`npm run release-eng:test --workspace automation-labs` command
confirmed above ran against GitHub Actions' real `ubuntu-latest`
runner with the same observed output.
