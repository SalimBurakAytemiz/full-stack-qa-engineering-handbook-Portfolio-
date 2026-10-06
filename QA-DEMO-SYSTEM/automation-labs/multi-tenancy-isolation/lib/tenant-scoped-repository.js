'use strict';

// A real tenant-scoped data-access layer — every single query
// includes a real `tenant_id = ?` predicate bound to the real
// tenantId this repository was constructed with. The caller never
// supplies tenant_id per call, specifically so there is no code path
// where a caller could "forget" to scope a query — scoping is
// structural, not a convention callers must remember.
// TR: Her sorgu GERÇEKTEN `tenant_id = ?` koşulu içerir. Çağıran taraf
// tenant_id'yi her çağrıda vermez — kapsam yapısaldır, hatırlanması
// gereken bir kural değildir.

function createScopedRepository(db, tenantId) {
  if (!tenantId) {
    throw new TypeError('createScopedRepository requires a tenantId');
  }

  function create({ title, body }) {
    const result = db
      .prepare('INSERT INTO tenant_documents (tenant_id, title, body) VALUES (?, ?, ?)')
      .run(tenantId, title, body);
    return Number(result.lastInsertRowid);
  }

  function getById(id) {
    return db
      .prepare('SELECT * FROM tenant_documents WHERE id = ? AND tenant_id = ?')
      .get(id, tenantId) || null;
  }

  function list() {
    return db.prepare('SELECT * FROM tenant_documents WHERE tenant_id = ? ORDER BY id').all(tenantId);
  }

  // Returns the real number of rows affected (0 if `id` belongs to a
  // different tenant, or does not exist) — never throws for a
  // cross-tenant id, so callers can distinguish "not found/not yours"
  // from a real error, the same way the real update() would.
  function update(id, fields) {
    const result = db
      .prepare('UPDATE tenant_documents SET title = ?, body = ? WHERE id = ? AND tenant_id = ?')
      .run(fields.title, fields.body, id, tenantId);
    return result.changes;
  }

  function remove(id) {
    const result = db
      .prepare('DELETE FROM tenant_documents WHERE id = ? AND tenant_id = ?')
      .run(id, tenantId);
    return result.changes;
  }

  return { create, getById, list, update, remove };
}

module.exports = { createScopedRepository };
