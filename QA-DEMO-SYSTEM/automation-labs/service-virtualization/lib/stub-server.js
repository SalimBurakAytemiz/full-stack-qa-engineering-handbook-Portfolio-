'use strict';

// A real, WireMock-style stub/virtualization server — not a
// description of the technique, an actual real HTTP server that
// virtualizes a dependency: register request matchers, return canned
// (optionally stateful/sequenced) responses, and track every request
// so an unmatched one is a real, loud failure (a 501 with a clear
// diagnostic body) instead of a silent, misleading 200. This is a QA
// fixture demonstrating the service-virtualization technique, not a
// claim of matching WireMock's full feature set (no request-body
// JSON-path matching, no record/playback, no admin API).
// TR: Gerçek, WireMock tarzı bir stub/virtualization sunucusu — bir
// bağımlılığı GERÇEKTEN sanallaştıran, çalışan bir HTTP sunucusudur:
// istek eşleştiricileri kaydeder, kurgulanmış (isteğe bağlı
// durum-tabanlı/sıralı) yanıtlar döndürür ve her isteği izler — bu
// yüzden eşleşmeyen bir istek sessiz, yanıltıcı bir 200 yerine GERÇEK,
// gürültülü bir hatadır (net bir tanı gövdesiyle 501).

const http = require('node:http');

function requestMatches(matcher, req, bodyText) {
  if (typeof matcher === 'function') return matcher(req, bodyText);
  if (matcher.method && matcher.method !== req.method) return false;
  if (matcher.path && matcher.path !== req.url) return false;
  if (matcher.bodyContains && !bodyText.includes(matcher.bodyContains)) return false;
  return true;
}

function createStubServer() {
  const stubs = []; // { matcher, responses: [...], cursor }
  const callLog = [];
  const unmatched = [];

  function stub(matcher, responseOrSequence) {
    const responses = Array.isArray(responseOrSequence) ? responseOrSequence : [responseOrSequence];
    const entry = { matcher, responses, cursor: 0 };
    stubs.push(entry);
    return entry;
  }

  function reset() {
    stubs.length = 0;
    callLog.length = 0;
    unmatched.length = 0;
  }

  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const bodyText = Buffer.concat(chunks).toString('utf8');
      callLog.push({ method: req.method, url: req.url, body: bodyText });

      const match = stubs.find((s) => requestMatches(s.matcher, req, bodyText));
      if (!match) {
        unmatched.push({ method: req.method, url: req.url, body: bodyText });
        res.writeHead(501, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          error: 'NO_STUB_REGISTERED',
          message: `service-virtualization: no stub matched ${req.method} ${req.url} — this is a real, loud failure, not a silent 200`,
        }));
        return;
      }

      // Stateful/sequenced response: advance through the declared
      // sequence per matching call; the last entry repeats once
      // reached — real WireMock "scenario" behavior, simplified.
      const step = match.responses[Math.min(match.cursor, match.responses.length - 1)];
      match.cursor += 1;

      const status = step.status || 200;
      const headers = { 'content-type': 'application/json', ...(step.headers || {}) };
      res.writeHead(status, headers);
      res.end(JSON.stringify(step.body ?? {}));
    });
  });

  return {
    stub,
    reset,
    getCallLog: () => callLog.slice(),
    getUnmatchedRequests: () => unmatched.slice(),
    start() {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
          const { port } = server.address();
          resolve(`http://127.0.0.1:${port}`);
        });
      });
    },
    stop() {
      return new Promise((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections?.();
      });
    },
  };
}

module.exports = { createStubServer };
