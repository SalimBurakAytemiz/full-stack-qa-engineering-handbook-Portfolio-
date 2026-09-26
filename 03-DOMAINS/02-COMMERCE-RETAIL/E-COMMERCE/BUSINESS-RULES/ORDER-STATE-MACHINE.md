# Business Rule: Order State Machine

```
CREATED -> PAID -> PROCESSING -> SHIPPED -> DELIVERED
PAID -> RETURNED -> REFUNDED
(payment attempt) -> DECLINED   (terminal, order never reaches PAID)
```

## Rules

1. Stock is decremented exactly once, at the `CREATED -> PAID`
   transition — never before (a DECLINED payment must not have touched
   stock) and never twice (see `22-SYSTEM-PATTERNS/CONCURRENCY.md`).
2. A DECLINED payment attempt does not notify the customer as if the
   order succeeded — tested directly in this repository
   (`graphql-websocket-notification.test.js`, "DECLINED-order
   silence" case).
3. `SHIPPED`/`DELIVERED` are documentation-level states in this
   repository — no real fulfillment/carrier integration exists behind
   them.
