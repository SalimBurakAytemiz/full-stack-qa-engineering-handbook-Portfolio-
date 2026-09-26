# Pattern: Multi-Tenancy

## How it works

One deployed system serves multiple independent customers (tenants),
with each tenant's data logically isolated from every other's — via a
shared database with a tenant-ID column on every table (the common,
cheaper approach) or fully separate databases per tenant (more
isolated, more operational overhead).

## Why systems use it

Serving many customers from one codebase/deployment is dramatically
cheaper to operate than one deployment per customer — the entire
tradeoff is operational efficiency versus the blast radius of an
isolation bug.

## Status in this repository

**Not implemented — single-tenant by design.** `QA-DEMO-SYSTEM` has no
tenant concept at all; every user shares the same product catalog and
the same database, with no notion of "which customer's data is this."
This is a genuine architectural simplification appropriate to this
repository's scope, not an oversight.

## QA Risks

- **Cross-tenant data leakage — the single most severe risk this
  pattern introduces**: a query missing a `WHERE tenant_id = ?` clause
  returns another tenant's data. This is the multi-tenant analog of
  the IDOR/BOLA risk `22-SYSTEM-PATTERNS/AUTHORIZATION.md` documents
  for individual users — the same category of bug, at the tenant
  boundary instead of the user boundary, and arguably higher severity
  (one bug exposes an entire OTHER CUSTOMER's data, not just one
  user's).
- **Tenant-ID spoofing**: if the tenant identifier is taken from a
  client-controlled field (a request parameter, a client-side value)
  rather than derived server-side from the authenticated session, a
  malicious client can simply claim to be a different tenant.
- **Noisy-neighbor performance**: one tenant's heavy usage (a large
  bulk operation, a runaway query) degrading performance for every
  OTHER tenant sharing the same infrastructure — a real operational
  risk in the shared-database approach.
- **Tenant-scoped configuration drift**: per-tenant feature flags or
  settings (see `FEATURE-FLAGS.md`) applied to the wrong tenant due to
  a caching or lookup bug.

## Test Strategy

**Positive:** each tenant's data is visible only within that tenant's
own session. **Negative — the critical test class**: an authenticated
user of Tenant A attempting to access Tenant B's resource by ID (the
same IDOR-style test technique this repository's own backend suite
already applies at the user level, `security.test.js`, extended to the
tenant level) must be rejected, not just filtered from a list view —
direct-ID access is the real exploit path, not just browsing. **Edge:**
a request with a mismatched or missing tenant context — does the
system fail closed (reject) or fail open (default to some tenant,
which would itself be a severe bug)?

## Related System Patterns

`AUTHORIZATION.md` (the same IDOR/BOLA technique, one level up), a
direct generalization worth testing exactly the same way this
repository already tests it for individual user data.

## Related Domains

B2B/B2C platforms serving multiple business customers — noted as a
professional/domain knowledge area in
`01-SALIM-BURAK-DIGITAL-TWIN/registry/professional-experience.yaml#professional_domain_tool_knowledge`
(`b2b`, `supplier-management`), without a dedicated executable lab in
this repository.
