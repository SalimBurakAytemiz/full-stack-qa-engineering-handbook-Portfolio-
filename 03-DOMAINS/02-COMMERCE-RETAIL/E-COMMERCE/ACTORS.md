# E-Commerce — Actors

- **Customer** — places orders, views their own order history/notifications only (see `22-SYSTEM-PATTERNS/AUTHORIZATION.md` — cross-user isolation is directly tested).
- **Backend services** — `orders.service.js`, `payment.service.js`, `events.service.js`, `notifications.service.js` — each with a single responsibility, composed by the route/resolver layer (REST and GraphQL both call the same services — no duplicated business logic between transports).
- **Real-time client (WebSocket)** — receives push notifications for their own orders only.
