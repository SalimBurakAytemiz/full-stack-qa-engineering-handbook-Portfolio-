# Interview Questions — Mutation Testing, Testcontainers & Data Engineering

Every answer is scoped honestly: what this repository's labs actually
prove (repository practice), versus professional experience or
production-grade tooling this doesn't claim. See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "Have you used Stryker or PIT professionally?"

No — this is repository-only, technique-level work. I built a minimal,
text-based mutation generator myself (six hand-declared operators
targeting one real file) specifically to understand the mechanics —
mutant generation, running the real test suite against each mutant,
kill/survive classification, and the mutation score — rather than
reaching for a production tool directly. I'd be upfront that a real
production setup needs an AST-based engine with a much larger operator
library and coverage-guided mutant reduction to be practical across a
whole codebase; what I can speak to concretely is what the score actually
measures and where it can mislead you.

## "What's the difference between code coverage and mutation testing?"

Coverage tells you a line *executed* during a test run. It says nothing
about whether any test actually checked the *result* of that line.
Mutation testing deliberately breaks the line in a specific way and asks
whether any test notices — which is a test of the test suite's actual
assertive power, not just its reach. A file can have 100% coverage and a
mutation score near zero if its tests call functions and check nothing
meaningful about what they return.

## "You found a surviving mutant — doesn't that mean your tests are bad?"

Not necessarily, and I can give a concrete counterexample from my own
lab. A mutant that deletes `ORDER BY id` from a SQL query survived even
a battery I deliberately strengthened specifically to kill it (inserting
rows out of id order). I didn't stop at "strengthen and move on" — I
investigated why it still survived, and found the real cause: the SQLite
engine in use returns this exact query's rows in `rowid` order regardless
of `ORDER BY`, so no black-box test can observe the clause's removal.
That's a textbook "equivalent mutant" — the code is still correct to keep
as written, but no test, however good, can kill that specific mutation.
Knowing the difference between a real test gap and an equivalent mutant
is the actual skill; treating every survivor as "write a better test" is
the common mistake.

## "Why use the real testcontainers library here but hand-roll almost everything else in this project?"

Dependency-bloat avoidance cuts both ways. Most of my other labs
hand-roll a minimal version of a tool (a stub server instead of
WireMock, a property-testing framework instead of fast-check) because a
minimal, auditable implementation is enough to prove the technique.
Testcontainers is different: there's no reasonable minimal substitute
for real Docker container lifecycle management — image pulling, port
allocation, readiness waiting, cleanup. Reimplementing even a slice of
that correctly would be more code and more fragile than depending on the
real, purpose-built library. Knowing when *not* to hand-roll something is
as much a judgment call as knowing when to.

## "Your container test couldn't run in this environment — how did you handle that?"

Honestly, and I think that's the actual interesting part. This sandbox
has no reachable Docker daemon. My lab doesn't pre-detect that and skip —
it attempts the real `testcontainers` call, catches the real error it
throws (`Could not find a working container runtime strategy`), and
reports `EXTERNALLY_BLOCKED` with that real message, never a faked pass.
The exact same, unmodified script is expected to genuinely execute on
GitHub Actions, which does ship a Docker daemon — I didn't write two code
paths, one real and one fake; I wrote one real path and let the
environment determine which branch of its own real logic fires.

## "How do you test a data pipeline's correctness, not just that it runs without crashing?"

Four checks cover most real failure modes: referential integrity (do
foreign-key-shaped references actually resolve), uniqueness (no
duplicate "should be unique" values), reconciliation (does a cached/
denormalized value still agree with a fresh recomputation from its
source rows), and schema drift (has the source's shape changed since the
pipeline was built to expect it). I built all four as real checks in my
data-engineering lab, and — same discipline as the rest of this
project — proved every one actually detects what it claims to by
injecting one deliberate violation at a time and confirming it's caught,
not just running them against clean data and assuming that proves
anything.

## "Why would a data-quality check matter if the database already has foreign keys and unique constraints?"

Because those constraints protect the *live* database, not necessarily
whatever a downstream process does with the data afterward. An exported
CSV, a replica built without the same constraints, or a bulk-loaded
warehouse table usually doesn't carry the source database's guarantees
with it. I built three of my four checks to deliberately operate on
plain extracted row arrays rather than the live, constrained database for
exactly that reason — that's the realistic place these checks actually
earn their keep, not a workaround for a limitation.
