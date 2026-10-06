'use strict';

// A hand-maintained snapshot of the columns this pipeline expects from
// backend/src/database/schema.js, as of this writing. This file is
// deliberately NOT generated from the real schema automatically — the
// whole point of a schema-drift check is to notice when the two have
// silently diverged, which a check that always regenerates itself from
// the live source could never do. If the real schema changes, this file
// must be updated by hand, and checkSchemaDrift will say so until it is.
// TR: Bu dosya backend/src/database/schema.js'den OTOMATİK üretilmez —
// bir schema-drift kontrolünün tüm amacı, ikisinin SESSİZCE
// birbirinden ayrıldığını fark etmektir; canlı kaynaktan kendini sürekli
// yeniden üreten bir kontrol bunu asla yapamaz.

const EXPECTED_SCHEMA = {
  users: ['id', 'email', 'password', 'status', 'created_at'],
  products: ['id', 'name', 'price', 'stock_quantity', 'created_at'],
  orders: ['id', 'user_id', 'status', 'total', 'created_at'],
  order_items: ['id', 'order_id', 'product_id', 'quantity', 'unit_price'],
};

module.exports = { EXPECTED_SCHEMA };
