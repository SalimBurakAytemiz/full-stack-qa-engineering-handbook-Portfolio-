# Pattern: Authentication

## How it works

A client proves identity once (credentials) and receives a token/
session reference used for subsequent requests, so the server doesn't
re-verify a password on every call. In this repository's reference
implementation, `auth.service.js` validates credentials and issues a
session; `requireAuth.js` (REST) and `resolveSession`/`requireUserId`
(GraphQL — see `AUTHORIZATION.md`) both resolve the same session
concept from two different transport layers.

## Why systems use it

Without it, either every request re-sends raw credentials (bad — more
exposure surface) or the system trusts an unverified caller entirely.

## QA risks

- Token/session not actually invalidated on logout
- Expired token silently treated as valid
- Session fixation (token reused across users)
- Password/credential rules not enforced (weak password accepted)
- Error messages leaking whether a username exists (enumeration)

## Failure behavior

A correctly-failing auth check returns 401, not a 500 or a silently
empty result — a 500 here usually means an unhandled exception in the
auth path itself, which is a different bug class from "credentials
were wrong."

## Test strategy

**Positive:** valid credentials → session issued, session accepted on
a protected route. **Negative:** wrong password, unknown user,
malformed token, expired token, missing `Authorization` header —
each asserted independently, not lumped into one "auth fails" test.
**Edge:** token reused after logout, two logins for the same user
issuing two independent sessions (should not silently invalidate each
other unless that's an explicit design decision).

## Security implications

Credential/token values must never appear in logs (see
`OBSERVABILITY`/N4 access-log redaction work in this repository —
`requestContext.js`'s `redactSensitiveQuery`). Session-expiry error
messages should not reveal internal state.

## Performance implications

Session validation happens on every authenticated request — it must be
cheap (no unbounded DB scan per request).

## Observability

Every authenticated request should be traceable to a session/user
without logging the raw credential — this is the same discipline
behind this repository's correlation-ID logging.

## Automation candidates

High — login success/failure paths are deterministic and
high-frequency; strong regression-suite candidates.

## Related domains

E-Commerce, FinTech (session security matters more where financial
data is at stake).

## Related labs

`QA-DEMO-SYSTEM/backend/tests/security.test.js`,
`QA-DEMO-SYSTEM/web-tests/tests/auth-login.spec.js`.
