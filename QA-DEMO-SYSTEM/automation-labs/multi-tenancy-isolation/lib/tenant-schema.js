'use strict';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS tenant_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL
)
`;

function createSchema(db) {
  db.exec(SCHEMA_SQL);
}

module.exports = { createSchema, SCHEMA_SQL };
