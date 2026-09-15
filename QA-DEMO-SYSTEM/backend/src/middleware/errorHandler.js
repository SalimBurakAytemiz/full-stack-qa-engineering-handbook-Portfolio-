// express.json() rejects malformed request bodies with a SyntaxError
// (body-parser sets err.type = 'entity.parse.failed'); that is a client
// payload error and must be 400, not the generic 500 (Codex P4.2 review,
// non-blocking #5). Must be registered right after express.json().
function jsonParseErrorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    return res.status(400).json({ error: 'Geçersiz JSON gövdesi' });
  }
  next(err);
}

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Kaynak bulunamadı' });
  }
  next();
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası' });
}

module.exports = { jsonParseErrorHandler, notFoundHandler, errorHandler };
