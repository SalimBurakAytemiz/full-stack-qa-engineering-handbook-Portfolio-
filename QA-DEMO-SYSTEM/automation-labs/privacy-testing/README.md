# Privacy Testing Lab

Part of `automation-labs`. This lab proves two related QA techniques:
scanning **real** API responses for accidental sensitive-field/PII
leakage, and testing GDPR-style data-subject-rights flows (access,
erasure, anonymization, consent) against a disclosed fixture.

## Scope boundary — read this first

`lib/pii-response-scanner.js` scans REAL responses from the REAL
QA-DEMO-SYSTEM backend (`tests/api-response-privacy.test.js` calls
actual `/api/auth/login`, `/api/products`, `/api/notifications`
endpoints on a running server). That part is genuine integration
testing, not a fixture.

`lib/data-subject-rights-simulator.js` is different and is disclosed as
such: it is a deterministic, **in-memory fixture**, not a claim that
QA-DEMO-SYSTEM's real backend implements GDPR data-subject-rights
endpoints. It does not — there is no `/api/users/:id/export` or
`/api/users/:id/erase` route anywhere in `backend/src/routes/`.
Inventing new backend functionality just to make this lab's evidence
look stronger would violate this repository's own anti-invention
principle. Instead, this fixture demonstrates the QA **technique** —
what "export returns the complete record," "erasure actually removes
data," "anonymization scrambles PII but keeps non-identifying
aggregates," and "consent is enforced both ways" genuinely mean and
how to test each — so the technique transfers directly to a real
system that does implement these flows.

## Running

From `QA-DEMO-SYSTEM/automation-labs/`:

```bash
npm run privacy:test:unit   # pii-scanner-unit + data-subject-rights — no server needed
npm run privacy:test        # aggregate runner (run-privacy-lab.js) — CI entry point
```

`run-privacy-lab.js` always runs the unit suite first. It then checks
whether a backend is reachable at `QA_DEMO_BASE_URL` (default
`http://127.0.0.1:3000`, same convention as the Selenium lab). If one
is running, it also runs the real-backend response scan. If not, it
reports `PRIVACY_LAB_INTEGRATION: NOT_EXECUTED` explicitly — never a
silent skip, never a fake pass for a check that never ran.

To exercise the full lab locally:
```bash
# from QA-DEMO-SYSTEM/
npm run db:seed
node backend/src/server.js &
QA_DEMO_BASE_URL=http://127.0.0.1:3000 npm run privacy:test --workspace automation-labs
```

### Expected output

Unit-only (no server): `PRIVACY_LAB_STATUS: PARTIAL_EXECUTED`, exit
code `0` — the unit checks genuinely passed; the integration part is
named, not hidden.
Full (server running): `PRIVACY_LAB_STATUS: EXECUTED`, exit code `0`.
A real failure in either part: `PRIVACY_LAB_STATUS:
EXECUTION_BLOCKED`, exit code `1`.

## What each file proves

| File | QA technique |
|---|---|
| `lib/pii-response-scanner.js` | Recursive sensitive-field-denylist and PII-value-pattern scanning of arbitrary JSON, with a per-endpoint allowlist for legitimately-returned sensitive/PII fields |
| `lib/data-subject-rights-simulator.js` | The disclosed GDPR-style fixture — export, erasure, anonymization, consent |
| `tests/pii-scanner-unit.test.js` | The scanner's own logic — true positives, no false positives, null-value non-flagging, allowlist suppression, deep recursive traversal |
| `tests/data-subject-rights.test.js` | The fixture's own behavior — real export/erasure/anonymize/consent semantics, both branches of every conditional |
| `tests/api-response-privacy.test.js` | **Real integration**: scans actual responses from a running backend — login, public products, authenticated notifications |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for
the competencies this lab backs. `professional: {status: NONE}` unless
independently proven otherwise. See
`shared/registry/catalog/labs.yaml#lab.privacy-testing.pii-and-data-subject-rights`
for this lab's declared `covers_competencies`.
