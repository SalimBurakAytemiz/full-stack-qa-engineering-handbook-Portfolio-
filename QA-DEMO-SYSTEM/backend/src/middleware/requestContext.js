const crypto = require('node:crypto');

// Phase 13 — Logging / Observability. Every request gets a unique
// correlation/request ID: generated once, attached to req.requestId,
// echoed back as the X-Request-Id response header (so a client-reported
// bug can be traced straight to its server-side log line), and logged in
// a single structured access-log line per request. This app previously
// had ZERO request-level logging — only individual services logged their
// own business events (order.paid, notifications, websocket) with no way
// to correlate them to the HTTP request that triggered them.
function requestContext(req, res, next) {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  // Captured NOW, synchronously, before any mounted sub-router runs.
  // Express temporarily rewrites req.url (and therefore req.path) while
  // a request is inside a nested router mounted with app.use('/prefix',
  // ...), stripping the prefix — and since none of this app's route
  // handlers call next() on success (they respond directly), that
  // rewritten, prefix-stripped req.url can still be in effect when the
  // async 'finish' event fires later. Reading req.path lazily inside
  // 'finish' was verified to log the wrong value (e.g. "/" instead of
  // "/api/products") — req.originalUrl is set once by Express and never
  // mutated by routing, so it is the correct source here.
  const { method, originalUrl } = req;
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    // No secrets/tokens/passwords logged — only correlation identifiers,
    // matching the same discipline already used in services/*.js.
    console.log(
      `[http] request_id=${requestId} method=${method} path=${originalUrl} status=${res.statusCode} duration_ms=${durationMs.toFixed(1)}`
    );
  });

  next();
}

module.exports = { requestContext };
