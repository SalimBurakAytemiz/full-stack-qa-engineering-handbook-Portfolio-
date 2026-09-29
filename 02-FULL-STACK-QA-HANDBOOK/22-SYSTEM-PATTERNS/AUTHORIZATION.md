# Pattern: Authorization

## How it works

Authentication proves *who*; authorization decides *what they're
allowed to do*. Two independent transport layers in this repository's
reference platform enforce the same rule differently: REST routes call
`resolveSession` (via `requireAuth.js`) to attach the caller's
identity, then each service checks ownership before acting; GraphQL
resolvers call `requireUserId(context)` before touching any
user-scoped data.

## Why systems use it

A valid session alone does not mean "can see everyone's data" — most
real bugs in this space are *missing* per-record ownership checks
(IDOR/BOLA), not missing authentication.

## QA risks

- Object-level authorization missing (user A can fetch/modify user B's
  order by guessing/incrementing an ID)
- Authorization checked at the UI layer only, not enforced server-side
- Role/permission check inverted (allow-list treated as deny-list)
- Authorization bypassed via an alternate API surface (REST checks it,
  GraphQL for the same resource doesn't, or vice versa)

## Failure behavior

A denied action should return 403/404 (never leak whether the resource
exists for another user by returning a different error for
"not yours" vs. "doesn't exist" unless that's an explicit design
choice), never a raw 500.

## Test strategy

**Positive:** owner can access/modify their own resource.
**Negative:** a second, distinct user cannot access the first user's
resource — tested with a REAL second account, not just "no token."
**Edge:** cross-surface consistency (does GraphQL enforce the same
ownership rule REST does, for the same underlying resource).

## Security implications

This is the highest-value security test category in most systems — see
`13-SECURITY-AWARE-QA` and `OWASP-API-TOP-10-MAPPING.md`
(`QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/`) for the
IDOR/BOLA-oriented test suite this repository actually runs.

## Performance implications

Ownership checks usually add one extra lookup per request — must not
become an N+1 query pattern.

## Observability

Denied-authorization events are worth their own log signal — a spike in
403s from one account is a different signal than a spike in 401s.

## Automation candidates

High — deterministic, high-risk-if-missed, cheap to automate with two
seeded test accounts.

## Related domains

E-Commerce (order ownership), FinTech (account/balance ownership).

## Related labs

`QA-DEMO-SYSTEM/backend/tests/security.test.js`,
`QA-DEMO-SYSTEM/backend/tests/graphql-websocket-notification.test.js`
(cross-user isolation test).
