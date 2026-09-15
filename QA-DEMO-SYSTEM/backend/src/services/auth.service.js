const crypto = require('node:crypto');

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

  // crypto.randomUUID() (Node built-in, no new dependency) — unpredictable,
  // sufficient entropy, unique per login even for the same user in the
  // same millisecond (see Codex P4.2 review, blocker B2).
  const token = `demo-session-${crypto.randomUUID()}`;
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);

  return {
    ok: true,
    status: 200,
    token,
    user: { id: user.id, email: user.email },
  };
}

module.exports = { authenticate, normalizeEmail };
