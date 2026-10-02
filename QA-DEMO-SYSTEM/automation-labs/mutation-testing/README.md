# Mutation Testing Lab

Real mutation testing against `backend/src/services/products.service.js` —
the same real, unmodified backend module the Milestone 2.3 property-based
tests target. This lab asks the question mutation testing exists to answer:
**"if a real bug were introduced here, would any of our tests actually
notice?"** — not "does the code run."

## What this lab actually does

1. `lib/mutate.js` reads a declared list of six mutators (relational
   operator replacement, return-value mutation, conditional negation, one
   SQL clause deletion) and, for each, generates a mutant by finding an
   exact substring in the **current, live** source of
   `products.service.js` and replacing it. The real file is **never
   written to** — each mutant is written only to a throwaway file in a
   unique temp directory, `require()`'d from there, and the temp directory
   is deleted when the run ends (including on error, via `finally`).
2. `lib/assertions.js` is a small, fixed battery of real behavioral checks
   (stock-quantity boundary, strict-`undefined` not-found, identity lookup,
   sort order) run against both the real module (as a baseline sanity
   check) and every mutant.
3. `run-mutation-lab.js` runs the full battery against every mutant twice —
   once with a **baseline** ordering check that mirrors exactly the id
   insertion pattern Milestone 2.3's property-test generator used (ids
   always inserted in ascending order), and once with a **strengthened**
   ordering check that inserts rows out of id order. The strengthened pass
   is the one the lab's real PASS/FAIL decision is based on.
4. A mutant that causes any assertion to throw, or that throws itself at
   require-time, is `KILLED`. A mutant every assertion passes against is
   `SURVIVED` — reported honestly, never hidden.
5. `tests/mutation-engine.test.js` is a small meta-test suite for the
   mutation generator itself (positive: produces the right number of
   mutants, mutants are syntactically valid, mutants actually differ from
   the original; negative: an unmatched pattern is reported `SKIPPED`, not
   silently dropped; the real file on disk is never modified).

## Scope boundary — read this before comparing to Stryker/PIT/mutmut

- This is a **text-based, find/replace mutation generator**, not an
  AST-based engine. Each mutator is an exact, hand-declared substring
  match against one known file. It does not parse JavaScript, does not
  discover mutable sites automatically, and does not generalize to other
  files without writing new mutators by hand. A real mutation-testing tool
  (Stryker for JS/TS, PIT for Java, `mutmut`/`cosmic-ray` for Python)
  parses an AST, applies a library of generic operators across an entire
  codebase, and integrates with a real coverage-guided test runner. This
  lab exists to teach and prove the *concept* — real mutants, run against
  real tests, real kill/survive detection, a real score — not to replace
  those tools. This boundary is intentional, not an oversight (same
  "avoid dependency bloat, prefer a minimal real implementation over a
  heavy library" principle already applied to `service-virtualization`'s
  stub server and `property-and-fuzz-testing`'s property framework).
- The target is deliberately a single small, already-tested file. Running
  this approach across a large codebase would need real automation (a
  per-file mutator registry, parallelized runs, coverage-based mutant
  reduction) that is out of scope here.

## A real finding: the equivalent-mutant problem

The `sql-order-by-removed` mutant (deletes `ORDER BY id` from
`listProducts()`'s query) **survives both batteries**, including the
strengthened one that deliberately inserts rows out of id order. This is
not a weak test — it is a real instance of mutation testing's classic
"equivalent mutant" problem: for this exact query shape (a full scan of a
table whose `rowid` *is* the `id`, with no secondary index), the SQLite
engine currently in use returns rows in `rowid` order regardless of
`ORDER BY`, so no black-box behavioral test can observe a difference by
calling the public API. The `ORDER BY` clause is still correct to keep —
it is the only thing that makes the row order a documented guarantee
rather than an unstated implementation detail current behavior happens to
match — but no test written against the module's public behavior can kill
this mutant. See `COMMON-MISTAKES.md` in this milestone's handbook docs for
the full writeup, and `02-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml` for
the tracked gap this leaves (closing it for real would need either an
`EXPLAIN QUERY PLAN` assertion or a white-box test that forces a different
scan strategy, both out of this lab's scope).

## Run it

```bash
# from QA-DEMO-SYSTEM/
node automation-labs/mutation-testing/run-mutation-lab.js
node --test automation-labs/mutation-testing/tests/mutation-engine.test.js
```

No backend server, no database file, no network — everything runs against
a real in-memory SQLite database created fresh per mutant via the backend's
own `getDatabase(':memory:')`.

## Expected output

```
MUTATION_LAB: baseline (unmutated, real module) passed both assertion batteries.
--- baseline battery ... ---  5/6 killed (83.3%)
--- strengthened battery (real gate) ---  5/6 killed (83.3%)
MUTATION_LAB_FINDING: sql-order-by-removed SURVIVED both batteries ...
MUTATION_LAB_STATUS: EXECUTED
```
Exit code `0`. A score under the 80% minimum threshold (disclosed in
`run-mutation-lab.js`) would print `MUTATION_LAB_STATUS: FAILED` and exit
`1` — this is a real gate, not a report that always exits 0. See
`EXECUTION.md` for the actual observed run.
