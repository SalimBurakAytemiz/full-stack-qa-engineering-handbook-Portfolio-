# Pattern: Pagination

## How it works

A list endpoint returns a bounded page of results plus a way to fetch
the next page — either offset-based (`page=2&limit=20`) or cursor-based
(`after=<opaque-cursor>`), rather than returning an unbounded result set.

## Why systems use it

An unbounded list response degrades as data grows — both a performance
risk (a multi-megabyte response for a large table) and a reliability
one (a client that assumes "the list" fits in memory breaks silently
once it doesn't).

## Status in this repository

**Not implemented.** `GET /api/products` returns the full product list
unpaginated — verified directly against
`QA-DEMO-SYSTEM/backend/src/services/products.service.js`. This is a
reasonable simplification at this repository's real, small fixture
scale (a handful of seeded products), and is documented as a real,
disclosed gap rather than silently assumed away.

## QA risks (in a system that DOES implement it)

- **Offset-based drift**: an item inserted/deleted between page 1 and
  page 2 requests shifts every subsequent offset, causing a skipped or
  duplicated row — a real, common bug class offset pagination is
  structurally prone to.
- **Cursor opacity assumed by the client**: a client that parses or
  reconstructs a cursor instead of treating it as opaque breaks the
  moment the cursor's internal format changes.
- **Inconsistent page size enforcement**: no server-side cap on
  `limit`, letting a client request an effectively-unbounded page and
  defeating the pattern's own purpose.
- **Total count drift**: a `total` field computed at request time can
  disagree with the actual paginated results if the underlying data
  changed between the count query and the page query.

## Failure Behavior

An out-of-range page (page 999 of a 3-page list) should return an
empty result set with a 200, not an error — a common, easy-to-get-wrong
edge case.

## Test Strategy

**Positive:** first page, middle page, last page all return the
expected slice. **Negative:** page 0, negative page, non-numeric page
parameter. **Edge:** exactly at a page boundary (item count is an exact
multiple of page size — does the last page come back empty or
non-existent?), and the offset-drift scenario above under concurrent
writes.

## Security Implications

An unbounded `limit` parameter is itself a denial-of-service vector
(a client requesting `limit=999999999` forces the server to materialize
a huge response) — the same category of risk `RATE-LIMITING.md`
documents generally, applied specifically to list endpoints.

## Performance Implications

This is the pattern's whole reason for existing — the performance risk
IS the thing being tested, not a side effect.

## Observability

Page-size distribution and out-of-range-page-request rate are useful
signals for whether clients are actually respecting the intended
pagination contract.

## Automation Candidates

High — deterministic given a known fixture dataset and page size.

## Related Domains

E-Commerce (product/order listing at scale), any domain with a
growing list of records.
