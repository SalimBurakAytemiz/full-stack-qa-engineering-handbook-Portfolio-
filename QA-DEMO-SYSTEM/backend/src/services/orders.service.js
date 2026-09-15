const { simulatePayment, DEFAULT_PAYMENT_TOKEN } = require('./payment.service');
const { createOrderPaidEvent } = require('./events.service');
const { createNotificationFromOrderPaidEvent } = require('./notifications.service');

// Per ARCHITECTURE.md section 10 — deterministic order status by payment result.
const STATUS_BY_PAYMENT_RESULT = {
  approved: 'PAID',
  declined: 'PAYMENT_FAILED',
  timeout: 'PAYMENT_TIMEOUT',
};

function isPositiveInteger(value) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

// Aggregates quantities by product_id so that duplicate lines for the same
// product cannot bypass the per-product stock check (Codex P4.2 review,
// blocker B1), and applies strict type validation on product_id/quantity —
// no string/boolean/array/float coercion (blocker B3).
function aggregateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, message: 'En az bir ürün gereklidir.' };
  }

  const quantityByProductId = new Map();

  for (const item of items) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, message: 'Geçersiz ürün girdisi.' };
    }

    const { product_id: productId, quantity } = item;

    if (!isPositiveInteger(productId)) {
      return { ok: false, message: 'product_id pozitif bir tam sayı olmalıdır.' };
    }
    if (!isPositiveInteger(quantity)) {
      return { ok: false, message: 'quantity pozitif bir tam sayı olmalıdır.' };
    }

    quantityByProductId.set(productId, (quantityByProductId.get(productId) || 0) + quantity);
  }

  return { ok: true, quantityByProductId };
}

// Only a genuinely omitted payment_token falls back to the default —
// null/false/0/""/wrong-type are explicit-but-invalid and rejected with
// 400 rather than silently treated as "missing" (Codex P4.2 review,
// non-blocking #4).
function resolvePaymentToken(paymentToken) {
  if (paymentToken === undefined) {
    return { ok: true, token: DEFAULT_PAYMENT_TOKEN };
  }
  if (typeof paymentToken !== 'string' || paymentToken.trim() === '') {
    return { ok: false, message: 'payment_token gönderilmişse geçerli, boş olmayan bir metin olmalıdır.' };
  }
  return { ok: true, token: paymentToken };
}

function createOrder(db, userId, items, paymentToken) {
  const aggregation = aggregateItems(items);
  if (!aggregation.ok) {
    return { ok: false, status: 400, message: aggregation.message };
  }

  const tokenResolution = resolvePaymentToken(paymentToken);
  if (!tokenResolution.ok) {
    return { ok: false, status: 400, message: tokenResolution.message };
  }

  // All product/stock validation happens up front, before any payment
  // simulation call or database mutation — a failure here must leave the
  // order, order_items, and product stock completely untouched.
  const resolvedItems = [];
  let total = 0;

  for (const [productId, quantity] of aggregation.quantityByProductId) {
    const product = db
      .prepare('SELECT id, name, price, stock_quantity FROM products WHERE id = ?')
      .get(productId);

    if (!product) {
      return { ok: false, status: 400, message: `Ürün bulunamadı: ${productId}` };
    }
    if (product.stock_quantity < quantity) {
      return { ok: false, status: 409, message: `Yetersiz stok: ${product.name}` };
    }

    resolvedItems.push({ product, quantity });
    total += product.price * quantity;
  }

  const paymentResult = simulatePayment(tokenResolution.token);
  if (!paymentResult.ok) {
    return { ok: false, status: 400, message: paymentResult.message };
  }

  const status = STATUS_BY_PAYMENT_RESULT[paymentResult.result];

  const insertOrder = db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)');
  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );
  const decrementStock = db.prepare(
    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?'
  );

  // Order + order_items + stock mutation + event/notification (PAID only)
  // run as a single SQLite transaction — any failure here rolls back the
  // whole write, leaving no partial state (Codex P4.2 review, non-blocking
  // #1; extended in P4.3 to also cover the order.paid event/notification).
  let orderId;
  let emittedEvent;
  let notification;
  db.exec('BEGIN');
  try {
    const info = insertOrder.run(userId, status, total);
    orderId = info.lastInsertRowid;

    for (const { product, quantity } of resolvedItems) {
      insertItem.run(orderId, product.id, quantity, product.price);
    }

    // Stock is only reserved on a successful (PAID) payment — a declined
    // or timed-out order must not affect product availability, and only a
    // PAID order emits an order.paid event/notification (P4.3 section 4).
    if (status === 'PAID') {
      for (const { product, quantity } of resolvedItems) {
        decrementStock.run(quantity, product.id);
      }

      emittedEvent = createOrderPaidEvent(db, { orderId, userId, total });
      notification = createNotificationFromOrderPaidEvent(db, emittedEvent);
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return {
    ok: true,
    status: 201,
    orderId,
    orderStatus: status,
    total,
    emittedEvent,
    notification,
  };
}

function getOrderById(db, orderId, userId) {
  const order = db
    .prepare('SELECT id, user_id, status, total, created_at FROM orders WHERE id = ? AND user_id = ?')
    .get(orderId, userId);

  if (!order) {
    return undefined;
  }

  const items = db
    .prepare(
      `SELECT oi.product_id, p.name AS product_name, oi.quantity, oi.unit_price
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?
       ORDER BY oi.id`
    )
    .all(order.id);

  return { ...order, items };
}

module.exports = { createOrder, getOrderById };
