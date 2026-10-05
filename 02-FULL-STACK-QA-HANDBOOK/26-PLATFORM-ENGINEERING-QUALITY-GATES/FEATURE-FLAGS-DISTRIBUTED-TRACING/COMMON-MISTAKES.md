# Common Mistakes (Real Ones, From Building These Labs)

## None occurred in this milestone's first-run execution

Both the feature-flags lab's unit tests (8/8) and aggregate run, and
the distributed-tracing lab's unit tests (12/12) and aggregate run,
passed cleanly on their first real execution — no assertion failure,
no caught logic error, no self-corrected design mistake surfaced
while building either lab. See each lab's own `EXECUTION.md` for the
actual observed output that supports this.

This is stated plainly rather than inventing a "mistake" to report
where none genuinely occurred. Earlier milestones in this campaign
(for example Milestone 2.7's `classifyBump` category and Milestone
3.2's `refillRatePerMs` validation bug) document real defects that a
real test run actually caught; this milestone's own build simply
didn't produce one. Padding this file with a fabricated narrative
would violate the same anti-fabrication discipline every other
`COMMON-MISTAKES.md` in this repository follows.

## One real design decision worth naming, even though it wasn't a bug

While designing the feature-flags lab's statistical test (`a 25%
rollout over 2000 real distinct users lands within a real statistical
tolerance of 25%`), the tolerance band (`< 3` percentage points) was
chosen deliberately before running the test, not tuned afterward to
make a failing run pass. A hash-based bucketing function will never
land exactly on the configured percentage for a finite sample, so a
test asserting an exact match would be structurally wrong — but
picking too loose a tolerance would make the test unable to catch a
genuinely broken bucketing function either. 3 points on a 2000-sample
25% target was chosen as tight enough to still fail on an obviously
wrong implementation (e.g. one that used `Math.random()` and landed
near 50%) while not being flaky on the real hash distribution.
