function requireAuth(db) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token);
    if (!session) {
      return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum' });
    }

    req.userId = session.user_id;
    next();
  };
}

module.exports = { requireAuth };
