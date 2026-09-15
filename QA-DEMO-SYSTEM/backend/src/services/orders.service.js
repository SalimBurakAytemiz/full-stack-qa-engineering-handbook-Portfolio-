const { simulatePayment } = require('./payment.service');

// Per ARCHITECTURE.md section 10 — deterministic order status by payment result.
const STATUS_BY_PAYMENT_RESULT = {
  approved: 'PAID',
  declined: 'PAYMENT_FAILED',
  timeout: 'PAYMENT_TIMEOUT',
};

function createOrder(db, userId, items, paymentToken) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, message: 'En az bir ürün gereklidir.' };
  }

  const resolvedItems = [];
  let total = 0;

  for (const item of items) {
    const quantity = Number(item && item.quantity);
    const productId = item && Number(item.product_id);

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return { ok: false, status: 400, message: 'Geçersiz ürün veya adet.' };
    }

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

  const paymentResult = simulatePayment(paymentToken);
  if (!paymentResult.ok) {
    return { ok: false, status: 400, message: paymentResult.message };
  }

  const status = STATUS_BY_PAYMENT_RESULT[paymentResult.result];

  const insertOrder = db.prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)');
  const info = insertOrder.run(userId, status, total);
  const orderId = info.lastInsertRowid;

  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );
  for (const { product, quantity } of resolvedItems) {
    insertItem.run(orderId, product.id, quantity, product.price);
  }

  // Stock is only reserved on a successful (PAID) payment — a declined or
  // timed-out order must not affect product availability.
  if (status === 'PAID') {
    const decrementStock = db.prepare(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?'
    );
    for (const { product, quantity } of resolvedItems) {
      decrementStock.run(quantity, product.id);
    }
  }

  return { ok: true, status: 201, orderId, orderStatus: status, total };
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
