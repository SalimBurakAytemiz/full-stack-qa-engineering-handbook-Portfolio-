# Domains

Domain-specific QA knowledge — not personal claims (see
[`01-SALIM-BURAK-DIGITAL-TWIN/05-DOMAIN-EXPERIENCE.md`](../01-SALIM-BURAK-DIGITAL-TWIN/05-DOMAIN-EXPERIENCE.md)
for that). Maturity model: D0 INDEXED → D1 DOCUMENTED → D2 QA_MAPPED →
D3 CASE_DESIGNED → D4 EXECUTABLE → D5 EVIDENCE_VERIFIED.

## Priority-depth domains (built out in this increment)

| Domain | Maturity | Location |
|---|---|---|
| E-Commerce / Retail | D4 EXECUTABLE | [`02-COMMERCE-RETAIL/E-COMMERCE/`](02-COMMERCE-RETAIL/E-COMMERCE/) |
| FinTech | D3 CASE_DESIGNED | [`01-FINANCIAL-SERVICES/FINTECH/`](01-FINANCIAL-SERVICES/FINTECH/) |
| Media / Streaming | D2 QA_MAPPED | [`03-MEDIA-STREAMING/`](03-MEDIA-STREAMING/) |
| Multi-Country Mobile / Localization | D2 QA_MAPPED | [`04-MOBILE-DIGITAL-PLATFORMS/`](04-MOBILE-DIGITAL-PLATFORMS/) |
| Insurance | D2 QA_MAPPED | [`01-FINANCIAL-SERVICES/INSURANCE/`](01-FINANCIAL-SERVICES/INSURANCE/) |

Canonical source for this table: `shared/registry/catalog/domains.yaml`
(registry-validated; this table is a human-readable mirror of it, kept
in sync by review rather than generation).

## Indexed only (not yet documented — real gaps, not hidden)

Banking, Payments (as a distinct domain from FinTech's transactional
core), Crypto, Trading/Investment, Digital Wallet, KYC/AML (as a
standalone domain rather than embedded in FinTech), B2B, B2C, OMS/WMS/
TMS/PIM/CRM/ERP/SRM as standalone domains, Returns/Refunds, Identity/
Security, Logistics/Supply Chain, Travel/Ticketing, Healthcare,
Telecom, SaaS/Enterprise, EdTech, Gaming, AdTech/MarTech, Public
Sector, IoT/Connected Systems.

## Why Insurance's maturity reflects documentation depth, not experience

Per the transformation spec's explicit rule (Section 19): Insurance is
not a professional-experience claim for anyone documented in this
repository. Its D2 QA_MAPPED maturity reflects real, deep learning/
transferable-methodology domain-QA content (actor models, business
rules, risk catalog, test strategy) — not populated with invented
professional depth just to look complete. See
[`01-FINANCIAL-SERVICES/INSURANCE/README.md`](01-FINANCIAL-SERVICES/INSURANCE/README.md)
for the explicit distinction it draws between documentation maturity
and practiced experience.
