'use strict';

// A deterministic, in-memory fixture modeling GDPR-style data-subject
// rights (access, erasure, anonymization, consent) — NOT a claim that
// QA-DEMO-SYSTEM's real backend implements any of these endpoints (it
// does not; there is no /api/users/:id/export or /api/users/:id/erase
// route anywhere in backend/src/routes/). This fixture exists to
// demonstrate and test the QA TECHNIQUE for validating such flows —
// "does export return the complete real record," "does erasure
// actually remove fetchable data, not just flag it," "does anonymize
// scramble PII while keeping non-identifying aggregate data usable,"
// "is a consent flag actually enforced both ways" — so the technique
// transfers directly to a real system that does implement these
// endpoints, without inventing new backend functionality here that
// this repository's real API doesn't have.
// TR: GDPR tarzı veri sahibi hakları (erişim, silme, anonimleştirme,
// onay) için deterministik, bellek-içi bir fixture — QA-DEMO-SYSTEM'in
// GERÇEK backend'inin bu uç noktaları uyguladığı iddiası DEĞİLDİR
// (uygulamıyor; backend/src/routes/ altında böyle bir route yok). Bu
// fixture, GERÇEK bir sistemde doğrudan taşınabilecek QA TEKNİĞİNİ
// kanıtlamak için var — bu repodaki gerçek API'ye olmayan yeni bir
// backend işlevi İCAT ETMEDEN.

function createDataStore(seedUsers) {
  const users = new Map(seedUsers.map((u) => [u.id, structuredClone(u)]));

  function exportUserData(userId) {
    const u = users.get(userId);
    return u ? structuredClone(u) : null;
  }

  function hasConsent(userId, purpose) {
    const u = users.get(userId);
    if (!u) return false;
    return Boolean(u.consent && u.consent[purpose]);
  }

  function eraseUserData(userId) {
    if (!users.has(userId)) return false;
    users.delete(userId);
    return true;
  }

  function anonymizeUserData(userId) {
    const u = users.get(userId);
    if (!u) return false;
    u.name = 'REDACTED';
    u.email = `redacted-user-${userId}@anonymized.invalid`;
    u.phone = null;
    // Non-identifying aggregate data (order id/total) survives — this
    // is the real point of anonymization vs. erasure: analytics stay
    // usable, personal identity does not.
    u.orders = (u.orders || []).map((o) => ({ id: o.id, total: o.total }));
    u.notifications = [];
    u.anonymized = true;
    return true;
  }

  return { exportUserData, hasConsent, eraseUserData, anonymizeUserData };
}

module.exports = { createDataStore };
