// express.json() rejects malformed request bodies with a SyntaxError
// (body-parser sets err.type = 'entity.parse.failed'); that is a client
// payload error and must be 400, not the generic 500 (Codex P4.2 review,
// non-blocking #5). Must be registered right after express.json().
//
// Part 2 fuzz-testing fix (automation-labs/property-and-fuzz-testing):
// an oversized request body (over express.json()'s default 100kb limit)
// throws a PayloadTooLargeError with err.type === 'entity.too.large' —
// a genuinely different body-parser error this handler did not
// previously check for, so it fell through to the generic 500 handler
// below instead of the correct 413. Found by real fuzz testing against
// the live server (a 200,000-character login payload), not by
// inspection — same client-payload-error category as the parse-failure
// case above, so it gets the same treatment: a real 4xx, not a 500.
// TR: 100kb'lik varsayılan sınırı aşan bir istek gövdesi
// PayloadTooLargeError fırlatır (err.type === 'entity.too.large') — bu
// handler daha önce bunu kontrol etmiyordu, bu yüzden altındaki genel
// 500 handler'ına düşüyordu. Gerçek fuzz testiyle (200.000 karakterlik
// bir login payload'ı) bulundu, incelemeyle değil.
function jsonParseErrorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    return res.status(400).json({ error: 'Geçersiz JSON gövdesi' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'İstek gövdesi çok büyük' });
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
