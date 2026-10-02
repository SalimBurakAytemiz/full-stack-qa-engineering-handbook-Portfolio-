# Testcontainers-Style Integration Testing & Data Engineering QA

## Part 1 — Real container-based integration testing

### The problem it solves

Mocking a database, queue, or cache in unit tests is fast but proves
nothing about how your code behaves against the *real* thing — a real
SQL dialect quirk, a real connection-reset, a real startup race. Running
tests against a shared, long-lived "test environment" database solves
realism but creates shared, flaky, order-dependent state across test
runs. **Testcontainers** solves both: every test run starts a disposable,
real instance of the dependency (via Docker), gets a real, randomly
assigned connection endpoint, runs against it, and tears it down —
giving real-dependency fidelity with per-run isolation.

### What this repository's lab actually does

`QA-DEMO-SYSTEM/automation-labs/testcontainers-lab/run-testcontainers-lab.js`
uses the real `testcontainers` npm package to start a real `nginx:alpine`
container, reads the real mapped port Testcontainers assigned, makes a
real HTTP request to it, asserts on the real response, and tears the
container down in a `finally` block — guaranteeing cleanup even if the
assertion fails.

### Honest degraded mode is part of the design, not a gap

Container-based testing has an infrastructure dependency that property
tests and mutation tests do not: a reachable Docker daemon. This
sandbox's Docker *CLI* is installed, but there is no daemon behind it —
confirmed with `docker info`, the same real limitation already documented
for this repository's `docker-compose.yml` in Phase 14. The lab's own
first move is to attempt the real `start()` call and catch exactly the
real error `testcontainers` throws when no daemon is reachable
(`Could not find a working container runtime strategy`), then report
`EXTERNALLY_BLOCKED` — never a faked `EXECUTED`. GitHub Actions
`ubuntu-latest` runners carry a working Docker daemon by default, so the
same unmodified script is expected to genuinely execute there. This
"attempt for real, classify the real failure, report honestly" pattern —
not "detect the environment in advance and skip" — is the same discipline
already used by this campaign's chaos/reliability and privacy labs for
their own infrastructure-dependent paths.

### Scope note: why this lab uses the real library, not a hand-rolled one

Most of this campaign's labs deliberately avoid adding real third-party
tooling (a stub server instead of WireMock, a hand-rolled property
framework instead of fast-check) to prove the underlying QA technique
without dependency bloat. Testcontainers is the exception, on purpose:
there is no reasonable *minimal* substitute for real Docker lifecycle
management (image pulling, port allocation, readiness waiting, network
cleanup) — reimplementing even a fraction of that correctly would be far
more code, and far more fragile, than depending on the real,
widely-used library built exactly for this.

## Part 2 — Data engineering QA

### What "testing a data pipeline" actually means

A data pipeline's correctness isn't just "did the job finish" — it's
"does the extracted/transformed data still mean what it's supposed to
mean." Four checks cover most of what goes wrong in practice:

- **Referential integrity** — does every foreign-key-shaped reference
  (an order's user, an order item's product) actually point at something
  real?
- **Uniqueness** — are there duplicate "logically unique" values (e.g.
  two users with the same email, differently cased) that a live
  database's constraints might not have caught, or that an *exported*
  copy of the data doesn't carry those constraints with it at all?
- **Reconciliation** — does a stored, denormalized value (an order's
  cached `total`) still agree with what its source rows actually sum to?
  Denormalized/cached fields are a classic place for silent drift.
- **Schema drift** — has the *shape* of the source data changed
  (a renamed, removed, or newly added column) since the pipeline was
  built to expect it?

### What this repository's lab actually does

`QA-DEMO-SYSTEM/automation-labs/data-engineering/lib/etl.js` extracts
real rows from a real SQLite database (seeded via the backend's own
`getDatabase()`) and computes two real aggregates (revenue by product,
order summary by user) with pure transform functions.
`lib/data-quality.js` implements all four checks above. Three of them
(referential integrity, uniqueness, reconciliation) deliberately run on
the **extracted, plain-array** data rather than the live, constrained
database — because the live database already enforces foreign keys and a
`UNIQUE` email constraint, so these checks would never have anything to
catch there. They exist for the realistic downstream case: an exported
CSV, a replica, or a bulk-loaded warehouse table, which typically does
**not** carry the source database's constraints with it. Schema drift
legitimately needs the live database (`PRAGMA table_info`), since drift
is a property of the source schema itself.

### Proving the validators actually validate

Every one of the four checks is proven twice: once against the real,
clean, freshly-extracted data (expecting **zero** violations — the
checks must not cry wolf), and once against the same real data with
exactly one deliberately injected issue (an orphaned reference, a
duplicate email, a wrong stored total, a wrong expected column) —
confirming the checker's output actually names that exact violation.
This is the same "prove the detector detects" discipline already applied
to this campaign's property-based testing negative-path case and its PII
scanner.

### A note on the schema-drift check's integrity

`lib/expected-schema.js` is a hand-maintained snapshot, not generated
from the live schema. A drift checker that regenerates its own
expectation from the thing it is checking can never detect drift — it
would always trivially agree with itself. The value of a schema-drift
check depends entirely on its expectation being an independent,
human-reviewed artifact that can fall out of sync — which is itself a
real-world lesson: automating away the "boring" part of a check can
silently remove the part that gave it any power.
