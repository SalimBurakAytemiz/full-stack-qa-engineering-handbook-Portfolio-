# Common Mistakes (Real Ones, From Building This Lab)

## 1. Inventing a special-case category instead of trusting field-by-field comparison

The first draft of `classifyBump()` special-cased any major-version
change under `0.y.z` as a new `MINOR_PRE_1_0` category, on the
assumption that a `0.1.0 -> 0.2.0` bump represents a disguised
breaking change. A unit test asserting that exact transition failed
immediately: the major field never actually changes in a
`0.x -> 0.(x+1)` bump — only minor does — so the special case's own
premise was wrong before its implementation even mattered. The fix
was to remove the invented category entirely and let plain
field-by-field comparison report the real answer (`MINOR`), then add a
separate, correctly-scoped `isUnstableApi()` function for the actual
SemVer clause 4 signal the original special case was trying (and
failing) to capture. The broader lesson: when a "spec nuance" starts
requiring a new category that the spec itself doesn't define, that is
a sign the nuance has been misunderstood, not a sign the code needs a
new branch.

## 2. Treating a loose version-number regex as good enough for changelog parsing

An early sketch of the changelog checker considered matching version
headings with a bare `\d+\.\d+\.\d+` regex. Run against this
repository's own real `CHANGELOG.md`, that approach could misfire on
version-shaped numbers appearing inside narrative prose (dates,
references to other documents' section numbers) rather than in an
actual `##` heading. The actual implementation anchors the match to
the start of a real `##` heading's text and additionally validates the
captured string through the real `semver.js` parser (`isValid()`)
before classifying it as a `VERSION` heading — so a heading like `##
Prior history` is correctly left as `OTHER`, never misread as a
version.

## 3. Assuming "newer" can be determined by string comparison

A tempting shortcut for ordering changelog version headings is plain
string comparison (`"2.0.0" > "10.0.0"` is `true` as strings, because
`"2" > "1"` lexically). That is backwards — `10.0.0` is the newer
version. The changelog checker deliberately reuses the real
`compare()` function from `semver.js` (numeric field comparison, not
string comparison) for exactly this reason, and a passing unit test
for `compare('1.2.0', '1.1.9')` exists specifically to keep this
correct as the code evolves.

## 4. Testing a rollback mechanism by only checking the happy path

An early version of the rollout-manager test suite proved only that a
manager with an all-healthy health check reaches `COMPLETE`. That
coverage would pass identically whether or not the rollback branch
even worked — it says nothing about the one behavior a canary rollout
exists for. The fix added a dedicated test that injects a real failure
at a specific stage (`50%`) and asserts the exact resulting state
(`ROLLED_BACK`, `trafficPercent: 0`) and the exact event history
(`['START', 'ADVANCE', 'ROLLBACK']`) — proving the failure path with
the same rigor as the success path, not as an afterthought.

## What these four have in common

Each mistake replaced a real, checkable rule (what the major field
actually does on a 0.x bump; what a real `##` heading actually looks
like; how two real version numbers actually compare; what a rollback
mechanism is actually supposed to do under failure) with a plausible-
sounding shortcut. In every case, writing the test for the *specific*
real behavior — not a generic "does it basically work" check — is what
caught the gap between the shortcut and the real rule.
