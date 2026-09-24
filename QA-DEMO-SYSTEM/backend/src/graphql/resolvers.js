const { GraphQLError } = require('graphql');
const { listProducts, getProductById } = require('../services/products.service');
const { createOrder, getOrderById } = require('../services/orders.service');
const { authenticate } = require('../services/auth.service');

// Thrown resolver errors land in the GraphQL response's top-level `errors`
// array with HTTP 200 (per the GraphQL spec — a business/authorization
// error is not a transport failure). Messages are reused verbatim from the
// REST layer's own error strings so both transports report the same
// contract for the same underlying condition (Phase 6 "GraphQL Error
// Handling" scope — proving parity, not inventing a second error model).
function requireUserId(context) {
  if (!context.userId) {
    throw new GraphQLError('Yetkilendirme gerekli', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.userId;
}

function toOrderPayload(order) {
  return {
    id: order.id,
    user_id: order.user_id,
    status: order.status,
    total: order.total,
    created_at: order.created_at,
    items: order.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  };
}

const resolvers = {
  health: () => 'ok',

  products: (args, context) => listProducts(context.db),

  product: ({ id }, context) => getProductById(context.db, id) || null,

  order: ({ id }, context) => {
    const userId = requireUserId(context);
    const order = getOrderById(context.db, id, userId);
    return order ? toOrderPayload(order) : null;
  },

  me: (args, context) => {
    if (!context.userId) {
      return null;
    }
    const row = context.db.prepare('SELECT id, email FROM users WHERE id = ?').get(context.userId);
    return row || null;
  },

  login: ({ email, password }, context) => {
    const result = authenticate(context.db, email, password);
    if (!result.ok) {
      throw new GraphQLError(result.message, { extensions: { code: 'UNAUTHENTICATED', status: result.status } });
    }
    return { token: result.token, user: result.user };
  },

  createOrder: ({ items, payment_token: paymentToken }, context) => {
    const userId = requireUserId(context);
    // paymentToken is passed through EXACTLY as received — undefined
    // (argument omitted) must stay undefined (orders.service defaults it to
    // the approved test token), and an explicit `payment_token: null` must
    // stay null (orders.service rejects it with 400, matching the REST
    // contract's payment_token-false/0/null-never-silently-defaults rule,
    // see P5.5 Codex B3). Coalescing null to undefined here would silently
    // reintroduce that exact bug for the GraphQL transport only.
    const result = createOrder(context.db, userId, items, paymentToken);
    if (!result.ok) {
      throw new GraphQLError(result.message, { extensions: { code: 'BAD_REQUEST', status: result.status } });
    }
    // Codex fix-campaign B1: mirrors orders.routes.js's REST handler
    // exactly — the order service already persists the notification, this
    // just delivers it over the live WebSocket to the owning user, the same
    // canonical pushNotificationToUser injected via context (see
    // graphql/index.js). Before this fix, a GraphQL-created PAID order was
    // durably persisted (visible on the next GET /api/notifications) but
    // never reached a connected client in realtime — only REST orders did.
    if (result.notification) {
      context.pushNotificationToUser(result.notification.user_id, result.notification);
    }
    return { id: result.orderId, status: result.orderStatus, total: result.total };
  },
};

module.exports = { resolvers };
