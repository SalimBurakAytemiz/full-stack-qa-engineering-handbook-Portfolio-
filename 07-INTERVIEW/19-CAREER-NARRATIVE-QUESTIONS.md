# Career Narrative Questions

Answers sourced from `01-SALIM-BURAK-DIGITAL-TWIN/registry/profile.yaml`
and `11-CAREER-TIMELINE.md`.

## "Give me a summary of your background."

5+ years as a Software QA Engineer across web, mobile, backend,
database, and admin-panel/CMS systems (`profile.yaml#coverage_stack`) —
"full stack" here describes the layers a QA engineer covers, not a
developer's stack, a distinction the Digital Twin is explicit about
(see the TR comment in `profile.yaml`: React/React Native/Flutter
exposure is QA-level, never reframed as frontend-developer experience).
Testing types practiced professionally: functional, end-to-end,
regression, integration, load/performance participation and validation,
and UAT.

## "Why QA instead of development?"

This is a `USER_CONFIRMATION_REQUIRED` narrative area — the transformation's
source data covers competencies, professional cases, and domain
exposure in detail, but not a first-person "why I chose this path"
story. Per the claim-integrity rule "no claim without source," this file
does not fabricate a motivational narrative; the real answer belongs to
Salim directly, not to a generated placeholder.

## "What's the throughline across your different professional contexts (E-commerce, FinTech-like, mobile-like, streaming)?"

Order/payment/transaction-state correctness and data-integrity
validation recur across all of them — visible in the repository's own
System Patterns documentation
(`02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/IDEMPOTENCY.md`,
`CONCURRENCY.md`, `PAYMENT.md`), which is grounded in the same
order/payment code this repository actually runs and tests
(`QA-DEMO-SYSTEM/backend/src/services/orders.service.js`,
`payment.service.js`).
