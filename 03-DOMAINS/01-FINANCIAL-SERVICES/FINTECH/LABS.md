# FinTech — Executable Labs

No dedicated FinTech backend module exists in this repository. The
closest real, executable analog is `QA-DEMO-SYSTEM`'s order/payment
flow, which exercises the same underlying QA problem class:

| FinTech concept | Commerce analog actually implemented | Test file |
|---|---|---|
| Balance decrement on transaction | Stock decrement on order | `order-concurrency.test.js` |
| Transaction state machine | Order state machine (CREATED→PAID→...) | `database-testing.test.js` |
| Double-spend prevention | Overselling prevention (last-unit race) | `order-concurrency.test.js` |
| Payment approve/decline/timeout | `payment.service.js` deterministic fake outcomes | `order-concurrency.test.js` |
| Ledger/balance reconciliation | Order-total vs. line-item SUM cross-check | `database-testing.test.js` |

A genuinely FinTech-labeled module (wallet/ledger/transaction
entities) is listed in `.ai/NEXT-ACTIONS.md` as not-yet-started —
building it would mean new domain code under
`05-EXECUTABLE-LABS/QA-REFERENCE-PLATFORM/modules/fintech/` (once that
platform refactor exists), not relabeling the existing Commerce code.
