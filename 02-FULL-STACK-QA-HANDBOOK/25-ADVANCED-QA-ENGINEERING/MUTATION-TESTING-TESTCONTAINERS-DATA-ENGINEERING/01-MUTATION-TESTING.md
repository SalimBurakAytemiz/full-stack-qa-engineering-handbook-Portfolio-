# Mutation Testing

## The question mutation testing answers

Code coverage answers "did my tests *execute* this line?" Mutation
testing answers a sharper question: **"if this line were wrong, would any
test actually notice?"** A file can have 100% line coverage and still
have tests that would pass against a subtly broken implementation — e.g.
a test that calls a function and checks nothing about its return value.
Mutation testing exposes exactly that gap by deliberately breaking the
code in small, specific ways and checking whether the test suite reacts.

## How it works

1. **Generate mutants.** Apply a small, well-understood set of mutation
   operators to the real source — each one a minimal, single change that
   represents a plausible real bug:
   - **ROR (Relational Operator Replacement):** `>` → `>=`, `<`, etc.
   - **Conditional negation:** `if (x)` → `if (!x)`.
   - **Return-value mutation:** `return undefined` → `return null`.
   - **Statement/clause deletion:** remove a line, a branch, a SQL clause.
2. **Run the real test suite against each mutant.** Load the mutated
   source in place of the real one and run the same tests that pass
   against the real code.
3. **Classify each mutant.** `KILLED` if any test fails (or the mutant
   throws) when run against it — the tests caught the injected bug.
   `SURVIVED` if every test still passes — the tests did **not** catch it.
4. **Compute the mutation score.** `killed / (killed + survived)`. A low
   score means the test suite has blind spots even where coverage looks
   complete.

## This repository's hand-rolled mutation engine

`QA-DEMO-SYSTEM/automation-labs/mutation-testing/lib/mutate.js` generates
six mutants of the real, unmodified `backend/src/services/products.service.js`
by exact text find/replace — never writing to the real file; each mutant
is written only to a throwaway scratch file, `require()`'d from there,
and the scratch directory is removed when the run ends. A small, fixed
assertion battery (`lib/assertions.js`) is run against the real module
first (a baseline sanity check) and then against every mutant.

This is explicitly a minimal, text-based tool, not an AST-based engine
like Stryker, PIT, or `mutmut` — see the lab's own `README.md`
"Scope boundary" section for exactly what that means and why.

## The equivalent-mutant problem, found for real

A mutant is "equivalent" when it changes the source text but produces
**no observable behavioral difference whatsoever** — meaning no test,
however well-written, can ever kill it. This is a well-known theoretical
limit of mutation testing, not a tooling bug.

This lab hit a real instance of it. One mutator deletes `ORDER BY id`
from `listProducts()`'s SQL query. The lab ran this mutant against two
assertion batteries: a baseline one (mirroring exactly how Milestone
2.3's property tests seeded data — ids always inserted in ascending
order) and a deliberately strengthened one (inserting rows out of id
order, specifically designed to defeat an implementation that merely
*happens* to look sorted). **The mutant survived both.** Investigating
why revealed the real cause: for this exact query shape — a full scan of
a table whose `rowid` *is* the `id` column, with no secondary index — the
SQLite engine in use returns rows in `rowid` storage order regardless of
`ORDER BY`. No black-box test calling the public API can observe the
clause's removal.

The lesson this teaches, honestly: `ORDER BY id` is still the *correct*
code to keep (it turns an implementation detail the current engine
happens to honor into a documented, stable guarantee that would survive a
query-planner change, an added index, or a different database entirely) —
but a mutation score below 100% does not automatically mean "write a
better test." Sometimes it means "this mutant is equivalent, and closing
it for real would require a white-box check (e.g. asserting on
`EXPLAIN QUERY PLAN`) that is a different kind of test than this lab's
scope covers." Reporting the survivor honestly, with the investigation
that ruled out "the test is just weak," is the actual skill mutation
testing is meant to build.

## What a real mutation-testing report should never do

- Never hide a survivor to make the score look better.
- Never assume a survivor means "test gap" without checking whether it
  might be equivalent instead — the distinction changes what the right
  fix is (strengthen the test vs. accept the limit and document it).
- Never gate CI on 100% — a disclosed, investigated, honestly-reported
  mutation score with one equivalent mutant is more trustworthy than a
  100% score obtained by deleting the mutator that revealed an
  inconvenient limit.
