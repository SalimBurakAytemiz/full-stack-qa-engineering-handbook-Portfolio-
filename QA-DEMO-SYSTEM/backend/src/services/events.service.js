const crypto = require('node:crypto');

const ORDER_PAID_EVENT_TYPE = 'order.paid';

// UNIQUE(order_id, event_type) on the events table (see schema.js) is the
// simple, deterministic duplicate-prevention guard for this domain — not a
// general HTTP idempotency system (that remains out of P4.3 scope, see
// docs/RUN-INSTRUCTIONS.md). A second attempt to emit order.paid for the
// same order throws a constraint violation instead of silently duplicating.
function createOrderPaidEvent(db, { orderId, userId, total }) {
  const eventId = crypto.randomUUID();
  const payload = JSON.stringify({ orderId, userId, total });

  db.prepare(
    'INSERT INTO events (event_id, event_type, user_id, order_id, payload) VALUES (?, ?, ?, ?, ?)'
  ).run(eventId, ORDER_PAID_EVENT_TYPE, userId, orderId, payload);

  // No secrets/tokens/passwords logged — only correlation identifiers.
  console.log(`[event] emitted type=${ORDER_PAID_EVENT_TYPE} event_id=${eventId} order_id=${orderId}`);

  return { eventId, eventType: ORDER_PAID_EVENT_TYPE, userId, orderId, total };
}

module.exports = { createOrderPaidEvent, ORDER_PAID_EVENT_TYPE };
