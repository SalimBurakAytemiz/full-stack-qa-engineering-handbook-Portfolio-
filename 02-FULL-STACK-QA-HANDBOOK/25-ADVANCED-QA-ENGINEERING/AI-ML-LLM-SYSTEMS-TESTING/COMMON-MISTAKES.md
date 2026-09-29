# Common Mistakes (Real Ones, Made and Fixed While Building This Lab)

This document is not generic advice — every item below is a mistake
that actually happened while building `ai-systems/`, was caught by
running the real test suite (not by inspection), and was fixed by
correcting the root cause rather than loosening the assertion. Kept here
because the mistake itself is a useful teaching artifact, and because
this repository's own discipline requires never hiding a real bug behind
a quietly-adjusted test.

## 1. A fixture that didn't match real code behavior (refusal text)

`fixtures/golden-dataset.json`'s `golden.refusal.unsafe` case originally
asserted `expected_contains: ["cannot", "refus"]`. The actual
`REFUSAL_TEXT` constant in `mock-provider.js` is: *"I cannot comply with
that request because it conflicts with my operating instructions."* —
which contains "cannot" but not the substring "refus" anywhere. The test
failed on a genuinely correct implementation, because the fixture was
guessed rather than read from the real constant. **Fix:** corrected the
fixture to `["cannot", "operating instructions"]` — matching the real
code, not loosening what the test checks for.

## 2. Dependency version resolution silently changing test behavior

`structured-output.test.js` asserts ajv v8's error shape
(`instancePath`). It initially failed because Node resolved a *different*
ajv than expected: this npm workspace hoists dependencies, and a stale
`ajv@6.15.0` (pulled in transitively, likely via `newman`) was already
present at `QA-DEMO-SYSTEM/node_modules/ajv`, while `automation-labs`
had just had `"ajv": "^8.20.0"` added to `package.json` but not yet
installed. Node's module resolution walked up to the stale hoisted copy
and returned ajv v6's legacy `dataPath` field instead of v8's
`instancePath`. **Fix:** ran `npm install --workspace automation-labs`
to materialize `automation-labs`'s own local v8 copy (the same pattern
already present in sibling workspaces `backend` and `api-tests`, each of
which independently carries its own v8 copy for the same hoisting
reason). Lesson: in an npm workspace with mixed dependency versions,
adding a version constraint to `package.json` is necessary but not
sufficient — the workspace-scoped install has to actually run before the
resolution changes.

## 2b. `node --test <directory>` not recursing on this Node version

`run-ai-lab.js`'s aggregate runner initially called
`execFileSync(process.execPath, ['--test', testsDir], ...)`, passing the
tests directory itself as the argument — the same approach used
successfully at the shell via a glob (`node --test tests/*.test.js`).
Run directly, this failed with `Cannot find module '.../tests'
MODULE_NOT_FOUND` — on this Node version (v22.22.2), passing a bare
directory path to `--test` attempted to `require()` it as a module
rather than recursing into it. **Fix:** the runner now enumerates
`*.test.js` files in the directory with `fs.readdirSync` and passes them
as explicit individual file arguments — the programmatic equivalent of
what the shell's glob expansion was already doing. This was caught only
by actually executing `run-ai-lab.js` directly, not by the fact that
`node --test tests/*.test.js` (shell-glob-expanded) had already passed —
a reminder that a wrapper script needs to be run itself, not assumed
correct because the command it wraps works when typed manually.

## 3. A "regression" scenario that didn't actually regress anything

`provider-regression.test.js` needs a deliberately-broken model version
(`mock-v2-regressed`) whose output genuinely fails a golden-dataset case
— otherwise the test that asserts "a real regression is detected" isn't
proving anything. The first design had `mock-v2-regressed` drop the
`"Summary: "` prefix from summarization output. Debugging (a scratch
`node -e` script printing `resultsB.results` and `regressions`) showed
**all 5 golden cases still passed** and `regressions: []` — because
`golden.summarization.short`'s `expected_contains: ["backend", "test"]`
checks the summary body, not the prefix, so dropping the prefix changed
nothing the test actually checked. This was a test-design bug pretending
to be a passing test: the "regressed" model wasn't actually regressed
from the test's point of view. **Fix:** redesigned `mock-v2-regressed`
to drop the customer's name from greeting responses instead — a change
that genuinely breaks `golden.greeting.en`'s `expected_contains` check
for the name — and updated the test's assertion to name the correct
case (`golden.greeting.en`, not `golden.summarization.short`). Lesson:
"engineer a failure on purpose" fixtures need to be verified end-to-end
against the actual scoring logic they'll be checked by, not assumed
correct because the intent behind them was correct.

## What these three mistakes have in common

None were found by re-reading the code carefully — all three were found
by running the real test suite and the real runner script, reading the
actual failure output, and tracing it to a root cause. This is the same
discipline this repository's Part 1 campaign already established
(e.g. the JMeter and Selenium lifecycle-safety-net fixes): a script that
can theoretically produce a fake PASS is a bug regardless of whether it
currently does, and the only reliable way to find these is to actually
execute the thing and look hard at what it really did.
