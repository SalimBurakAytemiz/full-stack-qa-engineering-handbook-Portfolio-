# Privacy & GDPR-Style Testing

**Executable evidence:** `privacy-testing/lib/pii-response-scanner.js`,
`privacy-testing/lib/data-subject-rights-simulator.js`,
`privacy-testing/tests/*.test.js` (including a real-backend integration
test).

## Sensitive-field and PII response scanning

`lib/pii-response-scanner.js` recursively walks an arbitrary JSON value
(an API response body, typically) looking for two distinct risk
categories:

1. **Sensitive fields that should never carry a real value** —
   `password`, `password_hash`, `token`, `secret`, `ssn`,
   `credit_card_number`, etc. A `null`/`undefined` value for such a key
   is not flagged (the field existing structurally, e.g. in a schema,
   is not the same as it leaking a real value) — `tests/pii-scanner-unit.test.js`
   tests this distinction explicitly.
2. **PII-shaped values in unexpected places** — an email or phone
   pattern appearing under a key that isn't declared as legitimately
   holding one. A `notes` or `bio` field containing an email address
   is a real leak even though `email` itself, on a user's own profile
   endpoint, is expected and allowlisted.

Both categories need a **per-endpoint allowlist**, not a single global
rule: a login response legitimately returns a session `token` (an
"expected sensitive key" for that specific endpoint), but a products
listing returning a `token` anywhere would be a real bug. Designing the
scanner around this distinction — rather than a single denylist with no
way to say "expected here" — is itself the QA design decision that
matters most in this technique.

### Real integration, not just a fixture

`tests/api-response-privacy.test.js` is genuine integration testing: it
starts nothing itself, but against a real running QA-DEMO-SYSTEM
backend, it calls the actual `POST /api/auth/login`, `GET /api/products`,
and `GET /api/notifications` endpoints with real seeded credentials and
scans the actual response bodies. This is positive-control evidence
that the real system, as built, does not leak sensitive data on the
endpoints scanned — not a claim made against a fixture. See
`privacy-testing/EXECUTION.md` for the real run output.

## GDPR-style data-subject-rights testing

`lib/data-subject-rights-simulator.js` is explicitly disclosed as a
fixture, not a claim about QA-DEMO-SYSTEM's real backend (see this
area's `README.md` scope-boundary note — the real backend has no
data-subject-rights endpoints, and none were invented here). It models
the four operations a real system implementing GDPR-style rights needs
to get right, and the specific thing each one needs to be tested for:

- **Access (export)**: returns the complete real record. Testing this
  is mostly about not silently omitting fields — an incomplete export
  is itself a compliance failure.
- **Erasure**: must **actually remove** the data, not merely mark it
  deleted. `tests/data-subject-rights.test.js`'s key assertion isn't
  that `eraseUserData()` returns `true` — it's that a subsequent
  `exportUserData()` call finds nothing. A soft-delete flag that a
  later query forgets to check is a realistic, serious bug this
  distinction catches.
- **Anonymization** (distinct from erasure): PII fields are scrambled,
  but non-identifying aggregate data survives — an anonymized user's
  order totals remain usable for analytics, their name and notification
  content do not. Testing this needs assertions on *both* halves: what
  must change, and what must NOT change.
- **Consent**: must be enforced in both directions — a granted purpose
  allowed, an ungranted purpose blocked — and must default to `false`
  (never a permissive default) for a request about a nonexistent
  subject.

## What a real privacy-testing pipeline would add on top of this

Real regulatory-compliance testing typically includes automated
data-flow mapping across a whole system, retention-period enforcement,
cross-border-transfer checks, and consent-management-platform
integration testing. None of that is implemented here — this area
covers the response-leakage-scanning and rights-semantics-testing
techniques that a real pipeline builds on.
