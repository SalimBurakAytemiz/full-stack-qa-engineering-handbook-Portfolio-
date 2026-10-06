'use strict';

// Real trace-context propagation, loosely modeled on the W3C
// traceparent header shape ("<version>-<traceId>-<spanId>-<flags>")
// without claiming full W3C Trace Context spec compliance. The only
// thing that actually needs to survive a real HTTP hop is the trace
// id (so every span in the request stays correlated) and the calling
// span's id (so the next span can record who its real parent was).
// TR: Gerçek bir ağ sıçramasını (HTTP hop) atlaması gereken tek şey
// trace id (tüm span'leri aynı isteğe bağlamak için) ve çağıran
// span'in id'sidir (bir sonraki span'in gerçek ebeveynini kaydetmesi
// için).

const crypto = require('node:crypto');

function newId(byteLength) {
  return crypto.randomBytes(byteLength).toString('hex');
}

function newTraceId() {
  return newId(16); // 32 hex chars
}

function newSpanId() {
  return newId(8); // 16 hex chars
}

function formatTraceParent({ traceId, spanId }) {
  return `00-${traceId}-${spanId}-01`;
}

function parseTraceParent(header) {
  if (typeof header !== 'string') return null;
  const parts = header.split('-');
  if (parts.length !== 4) return null;
  const [version, traceId, spanId, flags] = parts;
  if (version !== '00' || traceId.length !== 32 || spanId.length !== 16) return null;
  return { traceId, parentSpanId: spanId, flags };
}

module.exports = { newTraceId, newSpanId, formatTraceParent, parseTraceParent };
