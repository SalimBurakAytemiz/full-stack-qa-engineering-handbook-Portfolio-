# FinTech — Business Model

Revenue in a typical FinTech platform comes from a combination of:
transaction/spread fees, subscription/tier pricing, and
interest/float on held balances. QA implications differ per source:

- **Fee-based:** the fee calculation itself needs the same rigor as
  the transaction it's attached to — wrong fee = wrong customer-facing
  total, a defect a customer will notice immediately.
- **Spread-based (trading):** the displayed price and the execution
  price can legitimately differ (market movement between quote and
  fill) — QA must distinguish a legitimate spread from a pricing bug.
- **Interest/float:** usually computed on a schedule (daily/monthly)
  against a balance history, not the current balance alone — this
  depends on ledger accuracy (see `DOMAIN-MODEL.md`).

## Regulatory pressure shapes QA priorities

KYC/AML aren't optional business features — they're compliance
requirements with real legal consequence if wrong. This means "did the
onboarding flow correctly gate an unverified customer from
transacting" is a release-blocking QA question in this domain in a way
it usually isn't in, say, a content app.
