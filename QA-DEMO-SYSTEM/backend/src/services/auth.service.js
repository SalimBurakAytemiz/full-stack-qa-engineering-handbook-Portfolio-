// Generic message for both "unknown email" and "wrong password" —
// implements BR-AUTH-003 (no information leak about which field was wrong).
const GENERIC_AUTH_ERROR = 'Email veya şifre hatalı';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function authenticate(db, email, password) {
  if (!email || !password) {
    return { ok: false, status: 400, message: 'Email ve şifre zorunludur.' };
  }

  const user = db
    .prepare('SELECT id, email, password, status FROM users WHERE email = ?')
    .get(normalizeEmail(email));

  if (!user || user.password !== password || user.status !== 'ACTIVE') {
    return { ok: false, status: 401, message: GENERIC_AUTH_ERROR };
  }

  return {
    ok: true,
    status: 200,
    token: `demo-session-${user.id}-${Date.now()}`,
    user: { id: user.id, email: user.email },
  };
}

module.exports = { authenticate, normalizeEmail };
