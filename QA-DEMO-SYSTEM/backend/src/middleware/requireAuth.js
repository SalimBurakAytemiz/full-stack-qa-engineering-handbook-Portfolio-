// Extracted so both the REST middleware below and the GraphQL context
// (Phase 6, src/graphql/index.js) resolve a Bearer token against the same
// `sessions` table with the exact same two error messages/status codes —
// one source of truth for session validation, not duplicated per transport.
function resolveSession(db, authorizationHeader) {
  const header = authorizationHeader || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return { ok: false, status: 401, error: 'Yetkilendirme gerekli' };
  }

  const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token);
  if (!session) {
    return { ok: false, status: 401, error: 'Geçersiz veya süresi dolmuş oturum' };
  }

  return { ok: true, userId: session.user_id };
}

function requireAuth(db) {
  return (req, res, next) => {
    const result = resolveSession(db, req.headers.authorization);
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    req.userId = result.userId;
    next();
  };
}

module.exports = { requireAuth, resolveSession };
