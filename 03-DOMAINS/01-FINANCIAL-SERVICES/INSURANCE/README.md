# Domain: Insurance

**Maturity:** D2 QA_MAPPED (deep learning/transferable-methodology
content; still zero professional or repository-execution grounding —
maturity reflects documentation depth, not practiced experience).

**Professional experience: NO.** Per the transformation spec's explicit
rule (Section 19), Insurance is not claimed as professional experience
for anyone documented in this repository — no source confirms it. The
content below demonstrates domain-learning capacity and transferable
QA methodology; it is knowledge-level only, and the Digital Twin
records it that way explicitly (see "Digital Twin state" below).

## Actors

- **Customer** — the policyholder or prospective policyholder.
- **Underwriter** — assesses risk and decides whether/how to offer
  coverage.
- **Claims adjuster** — investigates and settles a claim.
- **Beneficiary** — the party who receives a payout (may differ from
  the customer, e.g. life insurance).
- **Agent/Broker** — intermediary who sells/services the policy
  (not present in every insurance model, but common enough to test for).

## Business Flow / Lifecycle

```
Quote -> Proposal -> Underwriting decision -> Policy issuance ->
Premium payment (recurring) -> [Claim: filed -> investigated ->
approved/denied -> settled] -> Renewal or Cancellation
```

This is a state machine, and the QA-relevant question for any state
machine is the same one `22-SYSTEM-PATTERNS/IDEMPOTENCY.md` and
`PAYMENT.md` ask of `QA-DEMO-SYSTEM`'s own order state machine: what
are the LEGAL transitions, and does the system actually reject the
illegal ones (a cancelled policy cannot file a new claim; a denied
underwriting decision cannot proceed to issuance without a new quote)?
The transferable methodology here is direct: this repository's real
`orders.status` state machine (`pending → paid → shipped`, etc.,
enforced in `QA-DEMO-SYSTEM/backend/src/services/orders.service.js`)
and a policy's state machine are the same class of QA problem —
different domain, identical test-design technique.

## Business Rules (representative, not exhaustive)

- A quote has a validity window (expires if not converted to a
  proposal in time) — testing an expired-quote conversion attempt is a
  direct analog to this repository's own session/token-expiration
  testing pattern (`09-MOBILE-QA/README.md`'s permission-revocation
  section, `03-MEDIA-STREAMING/README.md`'s token-expiration section —
  the same "a valid grant can expire mid-use" risk, recurring across
  three unrelated domains).
- Underwriting decisions must be traceable to the risk factors that
  produced them (a QA/compliance concern: "why was this customer
  declined" needs an audit trail, not just a boolean outcome).
- A premium payment failure should not silently lapse coverage without
  a defined grace period — the same "declined payment" risk category
  `22-SYSTEM-PATTERNS/PAYMENT.md` documents for `QA-DEMO-SYSTEM`'s own
  `TEST-CARD-DECLINED` scenarios, applied to a recurring-payment
  context instead of a one-time purchase.
- A claim's payout amount must reconcile against the policy's coverage
  limit — an off-by-one or rounding bug here has direct financial
  impact, the same class of risk `06-DEFECT-MANAGEMENT/`'s
  severity-classification approach would rate as high-severity by
  default (financial correctness, not cosmetic).

## API / Data Risks

- **Beneficiary data** is sensitive PII with a direct financial
  consequence if exposed to the wrong party — an IDOR/BOLA-class risk
  (`22-SYSTEM-PATTERNS/AUTHORIZATION.md`) with higher real-world stakes
  than most domains this repository actually implements.
- **Premium calculation** is often the most complex business logic in
  the whole system (risk-factor-weighted pricing) — a strong candidate
  for property-based/boundary-value testing (`03-TEST-DESIGN/`'s
  Boundary Value Analysis content applies directly: what happens at
  the exact threshold between two risk tiers?).
- **Claim status transitions** need the same duplicate/out-of-order
  event handling this repository's real `events` table enforces via
  `UNIQUE(order_id, event_type)` — a claim shouldn't be payable twice
  because a status-update webhook fired twice.

## Security Concerns

PII and financial-account data (bank details for premium
autopay/claim payout) make this domain a higher-stakes analog of
`22-SYSTEM-PATTERNS/AUTHENTICATION.md`/`AUTHORIZATION.md` — the same
patterns this repository implements and tests for its own order/user
data, with the added stakes of health/financial PII that most
e-commerce systems don't carry (a real reason the insurance industry's
own compliance regimes — not simulated here — are stricter than a
typical e-commerce system's).

## Performance Concerns

Claims volume spikes after a triggering event (a regional incident
generating many simultaneous claims) is this domain's load-testing
signature — closer to `03-MEDIA-STREAMING/README.md`'s viewer-join-burst
pattern than to steady e-commerce traffic: a sudden arrival spike, not
gradual growth.

## Observability

Underwriting-decision and claims-processing audit trails are a
compliance requirement as much as an operational one — every decision
needs to be reconstructable after the fact, which is a stronger
requirement than this repository's own correlation-ID logging
(`04-TOOLS-AND-TECH/07-OBSERVABILITY/`) currently has to meet for order
data.

## Test Strategy

Functional (quote→policy→claim happy path), negative (expired quote,
declined premium payment, denied claim), state-machine (illegal
transition attempts), financial-correctness (premium calculation,
claim payout reconciliation), security (beneficiary PII access
control), and compliance-adjacent (audit-trail completeness) — six
categories, directly parallel to the Streaming and Mobile domain
pages' own test-strategy breakdowns, because the underlying QA
methodology transfers even though the domain content is entirely new.

## Negative Scenarios and Edge Cases

- Claim filed against an already-cancelled policy.
- Premium payment for exactly the grace-period boundary date.
- Beneficiary change request submitted mid-claim.
- Underwriting re-evaluation triggered by a data correction after
  initial approval.
- Duplicate claim submission for the same incident (the
  `UNIQUE(order_id, event_type)`-style dedup problem, applied here).

## Interview Scenarios

- "How would you test a policy's state machine?" → enumerate every
  transition the business rules describe, then explicitly test the
  ILLEGAL transitions are rejected, not just that the legal ones work —
  same technique as this repository's own `orders.status` testing.
- "A claim was paid out twice — how do you investigate?" → look for a
  missing idempotency/dedup guarantee on the claim-approval-to-payout
  step first, the same root-cause category as a duplicate `order.paid`
  event in this repository's own architecture.
- "How is testing an insurance premium calculation different from
  testing an e-commerce price calculation?" → boundary-value analysis
  around risk-tier thresholds is the dominant technique here, versus
  e-commerce's more common discount/tax-stacking combinatorial risk —
  both are `03-TEST-DESIGN/` techniques, applied to different specific
  risk shapes.

## Related System Patterns

`22-SYSTEM-PATTERNS/IDEMPOTENCY.md`, `PAYMENT.md`, `AUTHORIZATION.md` —
directly transferable, per the reasoning above.

## Digital Twin state (explicit, not implied)

- **Professional Experience: NONE.**
- **Knowledge**: WORKING — the domain model, business rules, and
  test-strategy content above, built from transferable QA methodology
  applied to public-domain insurance concepts, not from any
  professional exposure.
- **Repository Practice: NOT_PRACTICED** — no lab, no code, no
  executable evidence exists for this domain in this repository, and
  none is invented here to suggest otherwise.

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/domain-state.yaml#domain.insurance`
for the exact registry entry this page must stay consistent with.
