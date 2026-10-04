'use strict';

// A DELIBERATELY unsafe repository — never scopes by tenant_id. This
// exists solely as the negative-path proof this lab is built around:
// to show, with a real query against a real db containing two real
// tenants' rows, exactly what a cross-tenant leak looks like when
// tenant scoping is forgotten. This code is NOT a fallback path or an
// admin/internal escape hatch — it is not used anywhere outside
// unsafe-repository.test.js, and it must never be copied into real
// application code.
// TR: Bu kod KASITLI OLARAK güvensizdir — hiçbir yerde gerçek bir yol
// olarak KULLANILMAZ, sadece bu lab'ın var olma nedeni olan negatif-yol
// kanıtı içindir.

function createUnsafeRepository(db) {
  function getById(id) {
    return db.prepare('SELECT * FROM tenant_documents WHERE id = ?').get(id) || null;
  }

  function update(id, fields) {
    const result = db
      .prepare('UPDATE tenant_documents SET title = ?, body = ? WHERE id = ?')
      .run(fields.title, fields.body, id);
    return result.changes;
  }

  return { getById, update };
}

module.exports = { createUnsafeRepository };
