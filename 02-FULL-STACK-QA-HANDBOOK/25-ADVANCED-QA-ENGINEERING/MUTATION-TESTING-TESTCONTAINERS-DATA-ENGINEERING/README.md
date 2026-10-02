# Mutation Testing, Testcontainers & Data Engineering QA

**Executable labs:**
`QA-DEMO-SYSTEM/automation-labs/mutation-testing/` (5 unit tests for the
mutation generator + a real mutation run against the real
`products.service.js`), `QA-DEMO-SYSTEM/automation-labs/testcontainers-lab/`
(5 unit tests + a real container-lifecycle run via the real
`testcontainers` package), and
`QA-DEMO-SYSTEM/automation-labs/data-engineering/` (13 unit tests + a real
ETL + data-quality run against a real in-memory database).

## Scope boundary — read this first

Mutation testing here is a minimal, hand-rolled, text-based find/replace
generator targeting one real, small file — not Stryker, PIT, or `mutmut`.
Testcontainers is the opposite case: it is the **real**, industry-standard
npm package, used because there is no reasonable minimal substitute for
real container lifecycle management. Data engineering here is a minimal,
in-process ETL + data-quality check set against this repository's real
schema — not Airflow, dbt, or Great Expectations. Each choice is disclosed
in its own lab's `README.md` "Scope boundary" section, consistent with
this campaign's "avoid dependency bloat, prefer a minimal real
implementation — or the real library when no reasonable substitute
exists" principle.

## Two real findings this milestone

1. **An equivalent mutant, found for real.** The mutation-testing lab's
   `sql-order-by-removed` mutant survives even a deliberately strengthened
   test (inserting rows out of id order) — a genuine instance of
   mutation testing's classic "equivalent mutant" problem: the SQLite
   engine in use returns this exact query's rows in `rowid` order
   regardless of `ORDER BY`, so no black-box test can observe the
   mutation. See `COMMON-MISTAKES.md` and
   `automation-labs/mutation-testing/README.md`.
2. **An honest EXTERNALLY_BLOCKED, not a faked pass.** This sandbox has no
   reachable Docker daemon, so the Testcontainers lab's real attempt to
   start a real container genuinely fails, and the lab reports that
   honestly instead of pretending to pass. The same unmodified script is
   expected to genuinely execute on GitHub Actions, which does have a
   Docker daemon — see `automation-labs/testcontainers-lab/EXECUTION.md`.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-MUTATION-TESTING.md` | What mutation testing measures, mutation operators, kill/survive/score, the equivalent-mutant problem |
| `02-TESTCONTAINERS-AND-DATA-ENGINEERING.md` | Real container-based integration testing; ETL + data-quality testing (referential integrity, uniqueness, reconciliation, schema drift) |
| `COMMON-MISTAKES.md` | Real mistakes found and fixed while building these exact labs |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
competencies this area adds — every one has `professional: {status: NONE}`
unless an existing, independent professional source proves otherwise.
