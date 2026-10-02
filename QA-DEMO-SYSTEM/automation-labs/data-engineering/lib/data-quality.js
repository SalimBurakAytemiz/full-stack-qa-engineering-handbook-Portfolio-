'use strict';

// Real data-quality checks. Three of the four operate on plain extracted
// row arrays (the shape a pipeline has AFTER extracting from the OLTP
// database into a staging/warehouse area) rather than the live, FK- and
// UNIQUE-constrained database — deliberately, because that is exactly
// where these checks earn their keep in a real pipeline: the live
// QA-DEMO-SYSTEM database enforces foreign keys and uniqueness already
// (see backend/src/database/schema.js), but an exported copy (a CSV
// dump, a replica without constraints, a bulk-loaded warehouse table)
// usually does not carry those guarantees with it. The fourth
// (checkSchemaDrift) legitimately needs the live db, since schema drift
// is a property of the source, not of an extracted snapshot.
// TR: Üç kontrol GERÇEK ama DÜZ (constraint'siz) satır dizileri üzerinde
// çalışır — tam olarak GERÇEK bir pipeline'da bu kontrollerin değerli
// olduğu an budur: canlı veritabanı zaten foreign key/UNIQUE ile
// korunuyor, ama dışa aktarılmış bir kopya (CSV, replica, toplu
// yükleme) bu garantileri taşımaz.

function checkReferentialIntegrity({ orders, orderItems, products, users }) {
  const orderIds = new Set(orders.map((o) => o.id));
  const productIds = new Set(products.map((p) => p.id));
  const userIds = new Set(users.map((u) => u.id));
  const violations = [];

  for (const item of orderItems) {
    if (!orderIds.has(item.order_id)) {
      violations.push({ type: 'ORPHAN_ORDER_ITEM_ORDER', order_item_id: item.id, order_id: item.order_id });
    }
    if (!productIds.has(item.product_id)) {
      violations.push({ type: 'ORPHAN_ORDER_ITEM_PRODUCT', order_item_id: item.id, product_id: item.product_id });
    }
  }
  for (const order of orders) {
    if (!userIds.has(order.user_id)) {
      violations.push({ type: 'ORPHAN_ORDER_USER', order_id: order.id, user_id: order.user_id });
    }
  }
  return violations;
}

function checkUniqueness({ users }) {
  const seen = new Map();
  const violations = [];
  for (const user of users) {
    const key = user.email.toLowerCase();
    if (seen.has(key)) {
      violations.push({ type: 'DUPLICATE_EMAIL', email: user.email, ids: [seen.get(key), user.id] });
    } else {
      seen.set(key, user.id);
    }
  }
  return violations;
}

function checkOrderTotalsReconcile({ orders, orderItems }, tolerance = 0.005) {
  const itemsByOrder = new Map();
  for (const item of orderItems) {
    const list = itemsByOrder.get(item.order_id) || [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }
  const violations = [];
  for (const order of orders) {
    const items = itemsByOrder.get(order.id) || [];
    const recomputed = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    if (Math.abs(recomputed - order.total) > tolerance) {
      violations.push({
        type: 'ORDER_TOTAL_MISMATCH',
        order_id: order.id,
        stored_total: order.total,
        recomputed_total: Math.round(recomputed * 100) / 100,
      });
    }
  }
  return violations;
}

function checkSchemaDrift(db, expectedSchema) {
  const violations = [];
  for (const [table, expectedColumns] of Object.entries(expectedSchema)) {
    const actualColumns = db
      .prepare(`PRAGMA table_info(${table})`)
      .all()
      .map((col) => col.name);
    const expectedSet = new Set(expectedColumns);
    const actualSet = new Set(actualColumns);
    for (const col of expectedColumns) {
      if (!actualSet.has(col)) violations.push({ type: 'MISSING_EXPECTED_COLUMN', table, column: col });
    }
    for (const col of actualColumns) {
      if (!expectedSet.has(col)) violations.push({ type: 'UNEXPECTED_NEW_COLUMN', table, column: col });
    }
  }
  return violations;
}

module.exports = { checkReferentialIntegrity, checkUniqueness, checkOrderTotalsReconcile, checkSchemaDrift };
