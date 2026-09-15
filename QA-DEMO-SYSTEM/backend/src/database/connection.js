const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { SCHEMA_SQL } = require('./schema');

function getDatabase(dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec(SCHEMA_SQL);
  return db;
}

module.exports = { getDatabase };
