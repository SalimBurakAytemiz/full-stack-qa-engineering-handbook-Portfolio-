# Business Rule: Transaction State Machine

```
CREATED -> PROCESSING -> COMPLETED
PROCESSING -> FAILED
PROCESSING -> TIMEOUT   (distinct from FAILED — outcome genuinely unknown)
```

## Rules a QA engineer must validate

1. A transaction never jumps directly `CREATED -> COMPLETED` — it must
   pass through `PROCESSING` (skipping a state is itself a bug class:
   it usually means a validation step was bypassed).
2. `FAILED` and `TIMEOUT` are NOT the same state. `FAILED` means the
   system knows the operation did not succeed. `TIMEOUT` means the
   system does not know — treating a timeout as a failure and silently
   retrying can produce a double-execution (see
   `22-SYSTEM-PATTERNS/RETRY.md` and `IDEMPOTENCY.md`).
3. Once `COMPLETED`, a transaction's amount/effect is immutable — a
   correction is a NEW transaction (e.g. a reversal), never an edit of
   the original ledger entry. This is what makes the ledger auditable.
4. An invalid transition (e.g. `COMPLETED -> PROCESSING`) must be
   rejected by the system, not merely "not exercised by the UI" —
   test it directly against the API/service layer.

## This repository's closest real analog

`QA-DEMO-SYSTEM`'s order state machine
(`CREATED -> PAID -> PROCESSING -> SHIPPED -> DELIVERED`, with
`DECLINED` as its own terminal branch off payment) follows the same
"no skipped states, terminal states are immutable" discipline, tested
in `QA-DEMO-SYSTEM/backend/tests/order-concurrency.test.js` and the
order flow tests.
