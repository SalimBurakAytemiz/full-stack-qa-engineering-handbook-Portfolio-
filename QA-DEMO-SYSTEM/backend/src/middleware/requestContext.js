const crypto = require('node:crypto');

// Codex final fix round N4 (non-blocking, Phase 13): defense-in-depth
// query-string redaction for the access log. Earlier this campaign it was
// confirmed that no CURRENT REST route reads req.query, and the
// WebSocket's ?token= query string never reaches this middleware at all
// (it's intercepted by the 'upgrade' event before Express's 'request'
// event fires) — so today, no sensitive value ever actually appears here.
// But this log line writes req.originalUrl RAW regardless of what a
// client sends: a client could put a token/password/api-key in a query
// string by mistake (a common real-world client bug this server does not
// control), and it would be logged verbatim. Redacting known-sensitive
// key NAMES (not values — this never guesses at what's sensitive from a
// value's shape) closes that gap without waiting for it to matter, while
// keeping every other query key and the full path visible for real
// debugging (Root Cause Isolation stays intact — see the test suite for
// a normal-path case proving this).
//
// GÜVENLİK/GÖZLEMLENEBİLİRLİK DENGESİ (Codex final fix round N7): burada
// KEY isimlerine bakılır, DEĞERLERE değil — bir değerin "hassas GÖRÜNMESİ"
// (örn. rastgele uzun bir string) onu redaksiyona sokmaz, çünkü bu YANLIŞ-
// POZİTİF üretip gerçek debug bilgisini (örn. bir ürün ID'si) gizlerdi. Bu,
// "gözlemlenebilirlik değerini TAMAMEN yok etme" gereksinimiyle "gerçek bir
// secret asla loglanmasın" gereksiniminin KASITLI dengesidir — ikisi
// birbirini iptal etmez, aynı anda sağlanır.
const SENSITIVE_QUERY_KEY_PATTERN = /token|password|secret|api[_-]?key|auth/i;

// Codex final fix round N4 (2. re-review — GERÇEK regresyon): decodeURIComponent
// bir key'de malformed percent-encoding (örn. "x%ZZ") gördüğünde URIError
// FIRLATIR. Bu fonksiyon requestContext() içinde next() ÇAĞRILMADAN ÖNCE,
// senkron olarak çalışıyordu (bkz. aşağı) — bir throw burada next(err)'e
// DEĞİL, Express'in senkron-middleware try/catch'i üzerinden generic
// errorHandler'a (her zaman 500) düşerdi. Yani SADECE LOGLAMA amaçlı bir
// yardımcı, route'un kendi gerçek response'unu (örn. normal bir /api/products
// isteğinde 200) MASKELEYİP 500'e çevirebiliyordu — bu, "logging asla
// application behavior'ını bozmamalı" ilkesinin doğrudan ihlaliydi.
// safeDecodeURIComponent bu throw'u ASLA dışarı sızdırmaz.
function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

function redactSensitiveQuery(originalUrl) {
  const queryStart = originalUrl.indexOf('?');
  if (queryStart === -1) {
    return originalUrl;
  }

  const pathAndFragment = originalUrl.slice(0, queryStart);
  const queryString = originalUrl.slice(queryStart + 1);

  // Rewritten pair-by-pair on the RAW string (not re-parsed/re-encoded via
  // URLSearchParams) so every non-sensitive key/value is logged byte-for-
  // byte as the client sent it — only a matched key's value is replaced.
  const redactedQuery = queryString
    .split('&')
    .map((pair) => {
      const eq = pair.indexOf('=');
      const rawKey = eq === -1 ? pair : pair.slice(0, eq);
      const decodedKey = safeDecodeURIComponent(rawKey);

      // FAIL-CLOSED (Codex N4 2. re-review): key'in kendisi decode
      // EDİLEMİYORSA, bunun gerçekten hassas bir isim mi yoksa rastgele
      // bozuk bir istek mi olduğunu GÜVENİLİR şekilde bilemeyiz — riskli
      // varsayımda bulunmak (örn. "muhtemelen zararsız" deyip ham haliyle
      // loglamak) yerine, hem key hem value'yu placeholder ile değiştiririz.
      // Bu, tek bir malformed pair'in observability değerini bir miktar
      // azaltır ama hiçbir zaman raw/olası-hassas bir değeri LOGLAMAZ ve
      // hiçbir zaman THROW ETMEZ.
      if (decodedKey === undefined) {
        return eq === -1 ? '<invalid-encoding>' : '<invalid-encoding>=<redacted>';
      }

      if (!SENSITIVE_QUERY_KEY_PATTERN.test(decodedKey)) {
        return pair;
      }
      return eq === -1 ? rawKey : `${rawKey}=<redacted>`;
    })
    .join('&');

  return `${pathAndFragment}?${redactedQuery}`;
}

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
  const loggedPath = redactSensitiveQuery(originalUrl);
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    // No secrets/tokens/passwords logged — only correlation identifiers,
    // matching the same discipline already used in services/*.js. Any
    // sensitive-looking query key is redacted above (N4) — this never
    // logs a raw token/password/secret even if a client sends one.
    console.log(
      `[http] request_id=${requestId} method=${method} path=${loggedPath} status=${res.statusCode} duration_ms=${durationMs.toFixed(1)}`
    );
  });

  next();
}

module.exports = { requestContext, redactSensitiveQuery, safeDecodeURIComponent };
