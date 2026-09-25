# FinTech — QA Risk Catalog

| Risk | Why it matters | How QA catches it |
|---|---|---|
| Decimal precision / rounding drift | Repeated rounding errors compound into real customer-visible money discrepancies | Assert exact decimal math, never float equality; test with values chosen to expose rounding (e.g. thirds, odd cent amounts) |
| Stale balance read | A balance read during a concurrent write shows an outdated value | Concurrent read+write test asserting the read either blocks or reflects a consistent snapshot |
| Negative balance | A withdrawal exceeding balance should be rejected, not silently allowed | Boundary test at exactly-available-balance and one unit over |
| Duplicate transaction / double debit | Retry or duplicate event processes the same transaction twice | See `22-SYSTEM-PATTERNS/IDEMPOTENCY.md` |
| Duplicate ledger entry | Same transaction produces two ledger rows | Assert ledger-entry count, not just final balance (a duplicate debit+credit pair can cancel out and hide the bug from a balance-only check) |
| Balance/ledger mismatch | Cached balance drifts from the ledger's true sum | Periodic reconciliation test: recompute balance from raw ledger entries, compare to cached value |
| Transaction state mismatch | UI/API shows one state, DB shows another | Cross-check API response against DB row directly, not just UI |
| Settlement/reconciliation mismatch | Internal record disagrees with external system's record | Requires a test oracle outside the system under test — out of scope for a fully synthetic lab, documented as such |
| Limit enforcement gap | Daily/per-transaction limit not actually enforced | Boundary + over-limit negative test |
| Authorization gap | One customer can act on another's account/transaction | See `22-SYSTEM-PATTERNS/AUTHORIZATION.md` |
| Audit-trail gap | An action happened but left no traceable record | Assert every state-changing action produces a corresponding log/audit entry |

None of these risks are unique to real FinTech systems — they are the
same class this repository's own `order-concurrency.test.js`,
`database-testing.test.js`, and `security.test.js` already exercise
against the Commerce order/payment flow (see
`../../02-COMMERCE-RETAIL/E-COMMERCE/RISKS/`).
