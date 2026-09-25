# Pattern: Payment

## How it works

A payment step typically has three outcomes a QA suite must design
around independently: approved, declined, and a timeout/unknown state
that is NOT the same as declined (the charge may or may not have
succeeded upstream). This repository's `payment.service.js` models
this with deterministic, synthetic outcomes — no real payment provider
is involved, and no employer/real provider credentials exist anywhere
in this repository.

## Why systems use it

Payment is the highest-consequence step in most commerce/FinTech flows
— a bug here is a direct financial-impact bug, not a UX bug.

## QA risks

- Declined payment doesn't roll back the reserved stock/hold
- Timeout treated as "failed" when the charge actually succeeded
  upstream (or vice versa) — double-charge or silently lost payment
- Payment amount mismatch between what was quoted and what was charged
- Retry after timeout re-charges instead of checking existing state
  first (see `IDEMPOTENCY.md`)
- Raw/unexpected provider error text reflected back to the client
  (an actual finding in this repository's own security testing —
  `payment_token` unknown-value errors previously reflected raw client
  input; verified non-exploitable end-to-end and documented, not
  hidden — see Phase 11 evidence)

## Failure behavior

A declined payment must leave the system in a clean, consistent state:
no order marked paid, any reserved stock released. A timeout must be
handled as its own distinct case, not silently folded into "declined."

## Test strategy

**Positive:** approved payment → order marked paid, stock decremented
once, notification fires once.
**Negative:** declined payment → order not marked paid, stock released
back.
**Edge:** timeout/unknown outcome → system does not assume success or
failure without reconciliation; duplicate payment attempts on the same
order are idempotent (see `IDEMPOTENCY.md`).

## Security implications

Payment tokens/identifiers must never be logged raw (see
`OBSERVABILITY-AND-RCA` — this repository's access-log redaction
work). Provider error messages must not leak raw internal detail to
the client.

## Performance implications

Payment steps are usually the slowest external dependency in the
critical path — worth explicit response-time thresholds (see the
JMeter `DurationAssertion` threshold pattern in this repository's
automation labs).

## Observability

A payment's outcome (approved/declined/timeout) and its correlation ID
should be traceable end to end — order → payment attempt → resulting
notification.

## Automation candidates

High for the deterministic fake-token outcomes this repository uses;
real provider sandbox testing (out of scope here) needs its own
strategy.

## Related domains

FinTech, E-Commerce.

## Related labs

`QA-DEMO-SYSTEM/backend/src/services/payment.service.js`,
`QA-DEMO-SYSTEM/backend/tests/order-concurrency.test.js`,
`evidence/PHASE-15-CASE-STUDIES/case-study-03-payment-flow.md`.
