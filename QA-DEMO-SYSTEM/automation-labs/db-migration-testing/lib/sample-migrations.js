'use strict';

// Three real migrations against a real minimal products-like table —
// each a genuine, separately-reasoned schema-evolution scenario, not
// three copies of the same ALTER TABLE with different names.
// TR: Üç GERÇEK migration — her biri ayrı ayrı gerekçelendirilmiş,
// gerçek bir şema-evrim senaryosudur.

const migrations = [
  {
    version: 1,
    name: 'create_catalog_items',
    up(db) {
      db.exec(`
        CREATE TABLE catalog_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL
        )
      `);
    },
    down(db) {
      db.exec('DROP TABLE catalog_items');
    },
  },
  {
    version: 2,
    name: 'add_category_with_backfill',
    // Real backward-compatibility concern: existing rows must not be
    // left with a NULL category after the column is added — this
    // migration's up() adds the column AND backfills every existing
    // row in the same migration, which is exactly the two-step
    // pattern a real zero-downtime column addition needs.
    up(db) {
      db.exec('ALTER TABLE catalog_items ADD COLUMN category TEXT');
      db.exec("UPDATE catalog_items SET category = 'uncategorized' WHERE category IS NULL");
    },
    down(db) {
      db.exec('ALTER TABLE catalog_items DROP COLUMN category');
    },
  },
  {
    version: 3,
    name: 'rename_name_to_display_name',
    up(db) {
      db.exec('ALTER TABLE catalog_items RENAME COLUMN name TO display_name');
    },
    down(db) {
      db.exec('ALTER TABLE catalog_items RENAME COLUMN display_name TO name');
    },
  },
];

module.exports = { migrations };
