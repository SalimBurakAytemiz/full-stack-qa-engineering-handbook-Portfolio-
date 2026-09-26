# E-Commerce — Domain Model

## Core entities (as actually implemented in `QA-DEMO-SYSTEM`)

- **User** — `backend/src/services/auth.service.js`
- **Product** — `backend/src/services/products.service.js`
- **Order** — `backend/src/services/orders.service.js`, with a real
  state machine (see `BUSINESS-RULES/ORDER-STATE-MACHINE.md`)
- **Payment** — `backend/src/services/payment.service.js`
  (deterministic fake outcomes: `APPROVED`/`DECLINED`/`TIMEOUT`)
- **Notification** — `backend/src/services/notifications.service.js`
- **Event** — `backend/src/services/events.service.js` (`order.paid`)

## Relationships

```
User 1---N Order
Order 1---1 Payment attempt (per attempt; an order may have multiple attempts)
Order 1---N OrderItem ---1 Product
Order 1---1 Event (order.paid, when successful)
Event 1---N Notification (delivered to the order's owner)
```

## What's NOT implemented (stated honestly, not implied)

No Cart entity persists between sessions (checkout is a single-request
operation in this reference platform), no Warehouse/Fulfillment/
Shipment entities, no Return/Refund flow. See `TESTING.md` for exactly
which parts of the target Commerce flow (Section 17 of the
transformation spec: Customer → Catalog → Cart → Checkout → Payment →
Order → OMS → Inventory → Warehouse → Fulfillment → Shipment →
Delivery → Return → Refund) this repository actually covers.
