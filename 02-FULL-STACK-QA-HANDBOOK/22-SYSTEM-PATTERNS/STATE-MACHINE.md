# Pattern: State Machine

## How it works

An entity moves through a fixed set of states via explicit, defined
transitions — and critically, transitions NOT in that defined set are
rejected, not silently allowed.

## Why systems use it

Most domain entities that matter to QA are state machines whether or
not anyone designed them as one deliberately: an order, a policy, a
stream session. Making the states and legal transitions explicit is
what turns "does this work" into a testable, enumerable question.

## Status in this repository

**Implemented, real, and already tested** — this pattern's own page was
carved out separately from `PAYMENT.md`/`IDEMPOTENCY.md` specifically
because it's the general technique those two apply to a specific
entity. `QA-DEMO-SYSTEM`'s real example:
`orders.status` transitions through `pending → paid → shipped` (and a
declined-payment path), enforced in
`QA-DEMO-SYSTEM/backend/src/services/orders.service.js` and tested by
the backend suite. This is the concrete example every state-machine
discussion elsewhere in this repository (Insurance's policy lifecycle,
Streaming's session lifecycle) points back to.

## QA Risks

- **Untested illegal transitions**: a test suite that only exercises
  the "happy path" sequence of states never proves the system actually
  REJECTS an illegal jump (e.g. `pending → shipped`, skipping
  payment) — this is the single most common state-machine testing gap.
- **Race condition on concurrent transition attempts**: two requests
  attempting to transition the same entity simultaneously (see
  `CONCURRENCY.md`) can both "succeed" against a naive check-then-write
  implementation, corrupting state.
- **Missing terminal-state enforcement**: a cancelled/completed entity
  should reject ANY further transition attempt, not just the ones a
  test suite happened to think of.
- **State exposed inconsistently**: the state shown to a user (UI) and
  the state enforced by business logic diverging — the same
  `08-SOFTWARE-ARCHITECTURE-FOR-QA/README.md` client-server-boundary
  risk, applied to state specifically.

## Test Strategy

**Positive:** every legal transition in the defined state graph, one
by one. **Negative:** every illegal transition attempt explicitly
tested for rejection — not just assumed rejected because it wasn't in
the happy-path test. **Concurrency:** simultaneous transition attempts
from the same starting state (`CONCURRENCY.md`'s own real test,
`order-concurrency.test.js`, is exactly this technique applied to
`orders.status`). **Edge:** transition attempt from a terminal state.

## Related System Patterns

The general technique behind `PAYMENT.md` (payment status is a state
machine) and `IDEMPOTENCY.md` (a duplicate request is often an attempt
at an already-completed transition, which a correct state machine
naturally rejects). `CONCURRENCY.md` is this pattern's race-condition
test technique specifically.

## Related Domains

Every domain in `03-DOMAINS/` models at least one state machine:
E-Commerce/FinTech (order status), Insurance (policy/claim lifecycle),
Media/Streaming (session lifecycle).
