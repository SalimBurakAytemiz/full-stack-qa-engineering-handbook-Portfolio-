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

function transformRevenueByProduct({ products, orderItems }) {
  const productsById = new Map(products.map((p) => [p.id, p]));
  const totals = new Map();
  for (const item of orderItems) {
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

function transformOrderSummaryByUser({ users, orders }) {
  const usersById = new Map(users.map((u) => [u.id, u]));
  const totals = new Map();
  for (const order of orders) {
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
