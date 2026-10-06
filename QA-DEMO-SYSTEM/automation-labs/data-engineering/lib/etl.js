'use strict';

// Real Extract/Transform functions over the real backend schema
// (users/products/orders/order_items). extract() reads from a real,
// live SQLite db (the same getDatabase() the backend itself uses); every
// transform below is a pure function over the plain row arrays extract()
// returns — the same shape a real pipeline would have after exporting
// from the OLTP database into a warehouse/staging area.
// TR: extract() GERÇEK, canlı bir SQLite veritabanından okur (backend'in
// kendi getDatabase() fonksiyonu). Aşağıdaki her transform, extract()'ın
// döndürdüğü düz satır dizileri üzerinde çalışan SAF bir fonksiyondur.

function extract(db) {
  return {
    users: db.prepare('SELECT id, email, status, created_at FROM users').all(),
    products: db.prepare('SELECT id, name, price, stock_quantity FROM products').all(),
    orders: db.prepare('SELECT id, user_id, status, total, created_at FROM orders').all(),
    orderItems: db.prepare('SELECT id, order_id, product_id, quantity, unit_price FROM order_items').all(),
  };
}

// The real backend only ever writes one of three order statuses — PAID,
// PAYMENT_FAILED, or PAYMENT_TIMEOUT (STATUS_BY_PAYMENT_RESULT in
// backend/src/services/orders.service.js) — depending on the real
// synthetic payment simulator's outcome. A PAYMENT_FAILED or
// PAYMENT_TIMEOUT order never collected real money, so it must never be
// counted as revenue or spend: an order attempt that failed is not a
// sale. This is a real defect an independent Codex review caught
// (F2) — the first version of both transforms below summed every
// order/order_item regardless of status, so a backend reproduction with
// 2 unpaid orders at 149.90 each reported 299.80 of revenue/spend that
// never actually occurred.
// TR: Gerçek backend sadece üç sipariş durumundan birini yazar — PAID,
// PAYMENT_FAILED veya PAYMENT_TIMEOUT. PAYMENT_FAILED/PAYMENT_TIMEOUT
// bir sipariş gerçek para tahsil etmemiştir, bu yüzden asla gelir/harcama
// olarak sayılmamalıdır.
const PAID_STATUS = 'PAID';

function transformRevenueByProduct({ products, orders = [], orderItems }) {
  const productsById = new Map(products.map((p) => [p.id, p]));
  const paidOrderIds = new Set(orders.filter((o) => o.status === PAID_STATUS).map((o) => o.id));
  const totals = new Map();
  for (const item of orderItems) {
    if (!paidOrderIds.has(item.order_id)) continue; // only PAID orders generate real product revenue
    const existing = totals.get(item.product_id) || { quantity: 0, revenue: 0 };
    existing.quantity += item.quantity;
    existing.revenue += item.quantity * item.unit_price;
    totals.set(item.product_id, existing);
  }
  return Array.from(totals.entries())
    .map(([productId, agg]) => ({
      product_id: productId,
      product_name: productsById.has(productId) ? productsById.get(productId).name : null,
      total_quantity: agg.quantity,
      total_revenue: Math.round(agg.revenue * 100) / 100,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue);
}

// order_count and total_spent are both scoped to PAID orders only — this
// is a summary of each user's real completed purchases, not their raw
// checkout attempts (a user whose payment failed or timed out placed an
// order, but did not make a purchase). A separate "how many checkout
// attempts failed" metric would be a genuinely different report, not a
// field bolted onto this one.
function transformOrderSummaryByUser({ users, orders }) {
  const usersById = new Map(users.map((u) => [u.id, u]));
  const totals = new Map();
  for (const order of orders) {
    if (order.status !== PAID_STATUS) continue; // only PAID orders are real completed purchases
    const existing = totals.get(order.user_id) || { orderCount: 0, totalSpent: 0 };
    existing.orderCount += 1;
    existing.totalSpent += order.total;
    totals.set(order.user_id, existing);
  }
  return Array.from(totals.entries())
    .map(([userId, agg]) => ({
      user_id: userId,
      email: usersById.has(userId) ? usersById.get(userId).email : null,
      order_count: agg.orderCount,
      total_spent: Math.round(agg.totalSpent * 100) / 100,
    }))
    .sort((a, b) => b.total_spent - a.total_spent);
}

module.exports = { extract, transformRevenueByProduct, transformOrderSummaryByUser };
