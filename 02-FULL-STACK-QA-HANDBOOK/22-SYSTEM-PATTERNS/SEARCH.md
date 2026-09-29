# Pattern: Search

## How it works

A query endpoint matches records against free-text or structured
criteria and returns a ranked/filtered subset — distinct from a plain
list endpoint (see `PAGINATION.md`) in that the result set is
*computed* (matched and often ranked) rather than a fixed slice of "all
records."

## Why systems use it

Once a dataset is too large to browse, users need to find a specific
record by partial information (a product name fragment, an order ID
prefix) rather than paging through everything.

## Status in this repository

**Not implemented.** `GET /api/products` supports no query/filter
parameter — verified directly against
`QA-DEMO-SYSTEM/backend/src/services/products.service.js`. The closest
this repository has is exact-match lookup (`GET /api/products/:id`),
which is retrieval, not search.

## QA risks (in a system that DOES implement it)

- **False negatives from over-strict matching**: a search for "shoe"
  that doesn't match "Shoes" (case sensitivity, no partial/prefix
  match) silently fails without an error — the worst kind of bug
  because nothing looks broken.
- **Injection via search input**: a search term reaching a raw SQL
  `LIKE` clause without parameterization is a real SQL-injection
  surface — the same class of risk this repository's own
  parameterized-query discipline (`04-TOOLS-AND-TECH/06-DATA/`) exists
  to prevent, here in a feature this repository doesn't implement yet.
- **Ranking regression**: a relevance-ranking change that silently
  reorders results can break a UI or integration that assumed a
  specific order without anyone touching the "matching" logic at all.
- **Empty-query behavior**: does an empty search string return
  everything, nothing, or an error? All three are defensible design
  choices — but only one is intended, and a test suite has to pin down
  which.

## Test Strategy

**Positive:** exact match, partial match, case-insensitive match.
**Negative:** search term with no matches (empty result, not an
error), search term with special characters (`%`, `_`, SQL wildcards —
must not behave as a wildcard unless intended). **Edge:** empty query
string, extremely long query string, query matching every record.

## Security Implications

Search input is user-controlled and frequently reaches a database
query — the single highest-risk QA angle on this pattern is
injection-safety, not relevance quality.

## Performance Implications

An unindexed search (a full table scan per query) degrades badly as
data grows — this is where `PAGINATION.md`'s and this pattern's risks
compound: a search with no result-size cap on an unindexed column is
both a correctness and a performance risk at once.

## Related Domains

E-Commerce (product search), any domain with a browsable catalog.
