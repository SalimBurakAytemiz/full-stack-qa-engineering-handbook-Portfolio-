# Domain: FinTech

**Maturity:** D3 CASE_DESIGNED (domain modeled, QA strategy mapped, test
cases designed against the existing repository's real order/payment
code — a dedicated FinTech backend module, e.g. wallet/ledger, is
NOT_STARTED; see `.ai/NEXT-ACTIONS.md`).

This is domain **knowledge**, mapped to QA strategy. It is not a claim
about what any specific person did professionally — see
[`01-SALIM-BURAK-DIGITAL-TWIN/05-DOMAIN-EXPERIENCE.md`](../../../01-SALIM-BURAK-DIGITAL-TWIN/05-DOMAIN-EXPERIENCE.md)
for that, kept as a separate, personal-state document on purpose.

## Contents

- [`DOMAIN-MODEL.md`](DOMAIN-MODEL.md) — core entities and their relationships
- [`ACTORS.md`](ACTORS.md) — who interacts with the system and how
- [`BUSINESS-MODEL.md`](BUSINESS-MODEL.md) — how the business actually works
- [`TERMINOLOGY.md`](TERMINOLOGY.md) — domain vocabulary
- [`BUSINESS-RULES/`](BUSINESS-RULES/) — rules a QA engineer must validate against
- [`RISKS/`](RISKS/) — the QA risk catalog for this domain
- [`TESTING.md`](TESTING.md) — test strategy
- [`LABS.md`](LABS.md) — what's executable in this repository today
- [`EVIDENCE.md`](EVIDENCE.md) — where the proof lives
- [`INTERVIEW.md`](INTERVIEW.md) — FinTech-flavored interview questions

## What's real here vs. what's aspirational

This repository does not have a dedicated `wallet`/`ledger`/`trading`
backend module. What it DOES have — real, tested — is a transactional
order/payment flow (`QA-DEMO-SYSTEM/backend/src/services/orders.service.js`,
`payment.service.js`) that exercises the SAME class of problem FinTech
systems face: atomicity, concurrency, idempotency, and financial-data
integrity. `LABS.md` and `TESTING.md` below are explicit about which
FinTech concepts map onto that existing code today, and which would
require new implementation (Section 24 of the transformation spec —
customers/accounts/wallets/balances/ledger/kyc/aml/settlement/
reconciliation — none of which exist as dedicated code in this repo
yet).
