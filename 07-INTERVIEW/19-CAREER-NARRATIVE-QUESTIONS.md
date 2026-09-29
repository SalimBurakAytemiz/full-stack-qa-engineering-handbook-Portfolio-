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

Formally tracked as `fact.career-motivation.why-qa` in
`01-SALIM-BURAK-DIGITAL-TWIN/registry/source-provenance.yaml#unresolved_personal_facts`,
status `USER_CONFIRMATION_REQUIRED`. This is not an unfinished
engineering task — it is an intentionally unresolved *personal fact*:
both canonical sources (the master transformation prompt and the
Phase 0-19 repository evidence) were checked and neither contains
first-person motivational/narrative content to draw from. Per the
claim-integrity rule "no claim without source," no story is fabricated
here; the registry entry records exactly what was checked and why
nothing was found, so this state is never mistaken for missing work.

## "What's the throughline across your different professional contexts (E-commerce, FinTech-like, mobile-like, streaming)?"

Order/payment/transaction-state correctness and data-integrity
validation recur across all of them — visible in the repository's own
System Patterns documentation
(`02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/IDEMPOTENCY.md`,
`CONCURRENCY.md`, `PAYMENT.md`), which is grounded in the same
order/payment code this repository actually runs and tests
(`QA-DEMO-SYSTEM/backend/src/services/orders.service.js`,
`payment.service.js`).
