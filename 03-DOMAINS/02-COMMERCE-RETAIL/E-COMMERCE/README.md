# Domain: E-Commerce

**Maturity:** D4 EXECUTABLE (real backend code + tests + CI, not just
documented strategy — the only domain in this repository at this
maturity level so far).

This domain is backed directly by `QA-DEMO-SYSTEM` — no separate
synthetic module was built for it, per the transformation spec's own
instruction to use the existing reference platform as the foundation
rather than rebuild blindly.

## Contents

- [`DOMAIN-MODEL.md`](DOMAIN-MODEL.md)
- [`ACTORS.md`](ACTORS.md)
- [`BUSINESS-MODEL.md`](BUSINESS-MODEL.md)
- [`TERMINOLOGY.md`](TERMINOLOGY.md)
- [`BUSINESS-RULES/`](BUSINESS-RULES/)
- [`RISKS/`](RISKS/)
- [`TESTING.md`](TESTING.md)
- [`LABS.md`](LABS.md)
- [`EVIDENCE.md`](EVIDENCE.md)
- [`INTERVIEW.md`](INTERVIEW.md)

## Honest scope boundary

This repository's frontend does **not** have a full cart/checkout UI —
verified directly (`grep` for cart/checkout/buy terms in the frontend
source found none). The order flow is exercised at the API/backend
layer, and the OMS-adjacent flows (order → payment → stock →
notification) are real and CI-tested. Do not read "E-Commerce, D4
EXECUTABLE" as "full storefront UI is tested" — it isn't, and
`TESTING.md` says so explicitly.
