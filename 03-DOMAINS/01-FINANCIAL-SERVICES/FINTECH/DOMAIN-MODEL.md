# FinTech — Domain Model

## Core entities

- **Customer** — the person or entity the account belongs to.
- **Account** — a container for balance(s); a customer may have more
  than one (e.g. checking, savings, trading).
- **Wallet** — a balance-holding unit, often per-currency or
  per-asset; conceptually similar to an Account but usually more
  granular (a customer might have one Account and several Wallets
  inside it).
- **Ledger** — the append-only record of every balance-affecting
  entry. The ledger, not the account's current-balance field, is the
  source of truth; the balance is a derived/cached value that must
  always reconcile to the ledger's running total.
- **Transaction** — a single balance-affecting operation (deposit,
  withdrawal, transfer, trade, fee). Has a lifecycle (see
  `BUSINESS-RULES/TRANSACTION-STATES.md`).
- **Order** (trading context) — an instruction to buy/sell at a market
  or limit price; distinct from a Transaction, which records the
  settled effect of an executed order.
- **Fee** — a charge applied to a transaction, itself sometimes its
  own ledger entry.
- **Limit** — a constraint (daily withdrawal cap, per-transaction
  maximum) enforced before a transaction is allowed to proceed.

## Relationships

```
Customer 1---N Account
Account  1---N Wallet
Wallet   1---N Transaction
Wallet   1---N LedgerEntry   (every Transaction produces >=1 LedgerEntry)
Order    1---1 Transaction   (an executed order settles into a transaction)
```

## Why the Ledger/Balance split matters for QA

A system that stores ONLY a current-balance field (no ledger) cannot
prove how it got there and cannot detect a balance that silently
drifted from its true history. A ledger-backed system lets a QA
engineer independently recompute the expected balance from raw entries
and assert it matches the cached value — this is the same principle
this repository's own financial-data tests apply to order totals (see
`02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/IDEMPOTENCY.md` and
`QA-DEMO-SYSTEM/backend/tests/database-testing.test.js`'s financial
SUM-aggregate cross-check).

## What exists as real, executable code in this repository today

None of the above entities exist as dedicated FinTech backend code —
this repository's real transactional core is the Commerce
order/payment flow (see `02-COMMERCE-RETAIL/E-COMMERCE/DOMAIN-MODEL.md`),
which is structurally analogous (Order ≈ Transaction, stock-decrement
≈ balance-decrement) but is not relabeled as FinTech code — that would
misrepresent what actually exists. See `LABS.md` for the precise
mapping.
