# FinTech — Test Strategy

## Layers to cover

1. **Unit/API:** each transaction-type's validation logic in isolation
   (limits, required fields, state-transition rules).
2. **Database:** ledger-vs-balance reconciliation, orphan/duplicate
   entry detection — see `QA-DEMO-SYSTEM/backend/tests/database-testing.test.js`
   for the equivalent discipline against orders.
3. **Concurrency:** simultaneous requests against the same
   account/balance — see `22-SYSTEM-PATTERNS/CONCURRENCY.md` and
   `QA-DEMO-SYSTEM/backend/tests/order-concurrency.test.js`.
4. **Security:** authorization (own-account-only access), input
   validation on transaction amounts — see
   `QA-DEMO-SYSTEM/backend/tests/security.test.js`.
5. **Observability:** every transaction traceable end-to-end via
   correlation ID — see
   `../../../02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/` observability
   notes embedded in each pattern.

## What this repository can prove today, and what it can't

**Can prove (via the Commerce analog):** exactly-once processing under
concurrent load, financial-total consistency between API and DB,
transaction-state integrity, authorization boundaries.

**Cannot prove (no dedicated FinTech module exists):** KYC/AML gating
logic, multi-currency conversion, interest/fee scheduling,
reconciliation against an external settlement system. These would need
new implementation — tracked honestly as `NOT_STARTED` rather than
implied by this documentation's existence.
