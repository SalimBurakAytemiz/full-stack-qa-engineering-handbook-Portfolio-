function toApiShape(row) {
  return { ...row, in_stock: row.stock_quantity > 0 };
}

function listProducts(db) {
  const rows = db.prepare('SELECT id, name, price, stock_quantity FROM products ORDER BY id').all();
  return rows.map(toApiShape);
}

function getProductById(db, id) {
  const row = db
    .prepare('SELECT id, name, price, stock_quantity FROM products WHERE id = ?')
    .get(id);
  return row ? toApiShape(row) : undefined;
}

module.exports = { listProducts, getProductById };
