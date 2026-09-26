# Pattern: Import / Export

## How it works

Bulk data moves into the system (import — a CSV of products, a batch
of customer records) or out of it (export — a report, a data dump for
a customer's own records) as a file or bulk-transfer operation, rather
than one record at a time through the normal API.

## Why systems use it

Some workflows are inherently bulk (a supplier uploading their product
catalog, a customer requesting their data under a privacy regulation) —
forcing these through one-record-at-a-time API calls would be both
slow and a poor fit for how the data actually arrives/needs to leave.

## Status in this repository

**Not implemented.** `QA-DEMO-SYSTEM`'s API is entirely single-record
CRUD (products, orders) — no bulk import/export endpoint exists.
`shared/test-data/products.json` is a fixture file used to SEED test
data programmatically (`db:seed`), which is superficially similar but
is a development/test tool, not a product feature exposed to real
users — an important distinction this page doesn't blur.

## QA Risks

- **Partial-failure handling on import**: a batch of 1000 records
  where record 500 is malformed — does the whole batch fail atomically,
  or do the first 499 commit while the rest are skipped? Both are
  defensible, but the choice has to be explicit and tested, not left
  to whatever the implementation happens to do.
- **Malformed-file handling**: a CSV/file that's syntactically broken
  (wrong encoding, wrong delimiter, truncated) needs a clear rejection
  with a specific error, not a partial parse that silently drops rows.
- **Data-validation parity with the normal API**: an import path that
  skips the same validation rules the regular create-record API
  enforces is a real, common way invalid data enters a system — the
  import path is not exempt from the business rules the rest of the
  system enforces.
- **Export completeness and PII scope**: an export that's supposed to
  be "this customer's own data" (a privacy-regulation data-portability
  request) leaking another customer's records due to a filtering bug
  is a severe, direct analog of `MULTI-TENANCY.md`'s cross-tenant
  leakage risk.
- **Large-file resource exhaustion**: reading an entire import file
  into memory before processing it is the same unbounded-resource risk
  `FILE-UPLOAD.md` and `PAGINATION.md` describe — streaming/chunked
  processing avoids it, naive full-buffering doesn't.

## Test Strategy

**Positive:** a well-formed import file produces exactly the expected
records; an export produces exactly the expected, complete dataset.
**Negative:** malformed file, partially-invalid batch (verify the
atomic-vs-partial decision explicitly), oversized file. **Edge:**
empty file, a file at exactly the system's row/size limit,
special-character/encoding edge cases (a name with non-ASCII
characters surviving the round trip correctly).

## Related System Patterns

`FILE-UPLOAD.md` (the transport mechanism for import), `PAGINATION.md`
(export of a large dataset has the same unbounded-response risk),
`MULTI-TENANCY.md` (export data-scope correctness).

## Related Domains

Insurance (bulk policy data import for a book-of-business transfer),
any B2B domain with supplier/partner data exchange.
