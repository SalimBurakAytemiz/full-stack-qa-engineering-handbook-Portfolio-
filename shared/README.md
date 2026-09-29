# shared/

Cross-cutting material used by more than one part of the repository.

| Directory | Purpose | Status |
|---|---|---|
| `registry/` | Universal catalog + JSON Schemas + real AJV validator (Section 34-41) | Real content |
| `contracts/` | Index of REST/GraphQL/WebSocket/event contract definitions (Section 27) | Real content |
| `schemas/` | REST response JSON Schemas (auth/common/health/notifications/orders/products), used by `QA-DEMO-SYSTEM/api-tests` | Real content, pre-dates this transformation |
| `test-data/` | Shared JSON fixtures (`auth-users.json`, `products.json`, `payment-test-patterns.json`) | Real content, pre-dates this transformation |

## Removed: `evidence/`, `helpers/`, `templates/`

These three directories existed from the repository's original Sep 2026
skeleton commit (`chore: create repository folder architecture`) but
were never filled — each held only a `.gitkeep` file, with no code ever
written that referenced them. They were removed rather than kept as
placeholders (master transformation spec, Section 47: an empty folder
claiming to be content is worse than no folder), after checking whether
their intended purpose now has a real, better home:

- **`evidence/`** — superseded by `06-EVIDENCE/evidence.yaml`, the real
  evidence registry built in this transformation.
- **`helpers/`** — no duplicated helper logic was found across the test
  suites to justify a shared helpers module (checked: `backend/src/database/seed.js`
  and `web-tests/scripts/reset-and-start-server.js` each serve a single,
  specific workspace and are not duplicated elsewhere).
- **`templates/`** — no template file exists anywhere in the repository
  to migrate here; nothing would have been in it.

If a genuine cross-cutting helper or template need arises later, it
should be added here with real content from day one, not pre-created as
an empty placeholder.
