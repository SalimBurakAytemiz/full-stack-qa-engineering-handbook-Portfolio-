# Release Versioning & Changelog Integrity Testing

## Two genuinely different concerns, often conflated

"Is this release ready?" is often answered by eyeballing a version
bump and a changelog entry. This lab treats it as two separate,
independently testable mechanisms:

1. **Version precedence correctness** — given two version strings, is
   the real ordering/classification between them (MAJOR/MINOR/PATCH,
   which one is newer) computed correctly per the SemVer 2.0.0 spec,
   including the parts most hand-rolled checks get wrong (prerelease
   precedence, build-metadata exclusion)?
2. **Changelog structural integrity** — does the changelog's own
   internal structure (heading order, section placement, category
   names) actually hold up, independent of whether any individual
   version number is itself correct?

A changelog can have a perfectly valid, structurally sound entry for
the *wrong* version bump, and a version bump can be semver-valid while
the changelog describing it is malformed (duplicate headings, released
versions out of order). Testing them as one blurred "release check"
hides which one actually broke.

## Version precedence: implement the spec, don't approximate it

`lib/semver.js` is a real semver 2.0.0 parser/comparator — not a
wrapper around the npm `semver` package, and not a naive string or
dot-count comparison. Two specific spec rules are easy to get wrong
and are each covered by a dedicated test:

- **Spec clause 11.3:** a version *with* a prerelease identifier has
  **lower** precedence than the same version *without* one —
  `1.0.0-alpha < 1.0.0`. A naive implementation that just compares
  major/minor/patch would wrongly treat these as equal.
- **Spec clause 10:** build metadata (`+build.7`) is explicitly
  excluded from precedence comparison — `1.0.0+build1` and
  `1.0.0+build2` must compare equal. A naive implementation that
  includes the full string in comparison would wrongly treat these as
  different.

## A real finding this exposed

The first draft of `classifyBump()` special-cased any major-version
change under `0.y.z` as a new `MINOR_PRE_1_0` category, reasoning that
a `0.1.0 -> 0.2.0` bump represents a "disguised" major/breaking change
(per SemVer clause 4's pre-1.0 instability rule). A unit test asserting
that exact transition caught the bug on first run: **the major field
never actually changes** in a `0.x -> 0.(x+1)` bump — only the minor
field does — so field-by-field comparison correctly reports `MINOR`,
not a disguised `MAJOR`. The premise behind the special case was wrong,
not just its implementation. The fix removed the invented category
entirely and added a separate, correctly-scoped `isUnstableApi()`
function that reports the real SemVer clause 4 signal (`major === 0`)
without conflating it with the structural bump classification. The
real aggregate run then applies this honestly to this repository's own
situation: all 6 real workspace `package.json` files are still
`0.1.0`, so the lab reports `6/6 real workspaces are under SemVer
clause 4` as an **informational** finding, never a failure — an
unstable pre-1.0 API is explicitly allowed by the spec, not a defect.

## Changelog structural integrity: parse real headings, don't regex-grep for a version string

`lib/changelog-check.js` parses every real `##`/`###` Markdown heading
in a changelog, classifies each `##` heading as `UNRELEASED`,
`VERSION` (using the real `semver.js` validator — not a loose
`\d+\.\d+\.\d+` regex, which would also match inside narrative prose),
or `OTHER`, and enforces real structural rules: version headings must
be in strictly descending order (via the real `compare()` function,
never raw string comparison, which would wrongly sort `"2.0.0"` before
`"10.0.0"`); every `UNRELEASED` heading must precede every `VERSION`
heading; a trailing narrative section (`OTHER`) may only appear after
all real version history; and every `###` subsection name must be a
recognized Keep-a-Changelog category.

Running this against this repository's own real `CHANGELOG.md` is the
whole point — not a synthetic fixture. The real file has an unusual
but legitimate shape: **two** `## [Unreleased]` headings (one per
historical fix campaign) and zero released `VERSION` headings (this
project has never cut a formal release), followed by a trailing `##
Prior history` narrative section. `checkChangelog()` correctly reports
this as `0 violation(s)`: multiple `UNRELEASED` headings are legitimate
as long as all of them precede any released version, and the trailing
narrative section correctly comes last.

## Scope boundary

This does not implement npm's dependency-range syntax (`^1.2.3`,
`~1.2.3`, `>=1.0.0 <2.0.0`) — only the plain-version precedence rules
needed to order and classify two concrete version strings. It does not
generate changelog entries or enforce commit-message conventions
(Conventional Commits, `semantic-release`-style automation) — it
validates the structure of a changelog that already exists.
