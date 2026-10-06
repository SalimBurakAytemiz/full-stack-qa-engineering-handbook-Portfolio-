'use strict';

// One real "upstream" node:http server listening on a real loopback
// port, called by a real "downstream" HTTP client (runDownstreamRequest)
// — a plain async function, not a second server. Both run in this same
// Node process; the proof is that a real traceparent header survives a
// real network hop (an actual HTTP request serialized, sent over
// loopback, and re-parsed), not that there are two separate processes
// or machines. Independent review finding F6: this file's own header
// comment previously claimed "two real services, both real node:http
// servers" — that was inaccurate; corrected here.
// TR: Gerçek bir loopback portunda dinleyen TEK bir gerçek "upstream"
// node:http sunucusu, gerçek bir "downstream" HTTP istemcisi
// (runDownstreamRequest — ikinci bir sunucu DEĞİL, sıradan bir async
// fonksiyon) tarafından çağrılır. İkisi de AYNI Node sürecinde çalışır;
// kanıtlanan şey gerçek bir ağ sıçraması (serialize edilip tekrar parse
// edilen gerçek bir HTTP isteği) üzerinden traceparent başlığının
// hayatta kalmasıdır — iki ayrı süreç veya makine değil. Bağımsız
// inceleme bulgusu F6: bu dosyanın önceki başlık yorumu "iki gerçek
// servis, ikisi de gerçek node:http sunucusu" diyordu — bu yanlıştı,
// burada düzeltildi.

const http = require('node:http');
const { formatTraceParent, parseTraceParent } = require('./trace-context');

function createUpstreamService({ tracer }) {
  const server = http.createServer((req, res) => {
    if (req.method !== 'GET' || req.url !== '/work') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not found' }));
      return;
    }

    const parsed = parseTraceParent(req.headers.traceparent);
    const span = tracer.startSpan('upstream.work', {
      traceId: parsed ? parsed.traceId : undefined,
      parentSpanId: parsed ? parsed.parentSpanId : undefined,
    });

    span.end();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result: 'done', spanId: span.spanId, traceId: span.traceId }));
  });

  return { server };
}

function callUpstream(baseUrl, traceParentHeader) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      baseUrl + '/work',
      { method: 'GET', headers: { traceparent: traceParentHeader } },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runDownstreamRequest({ tracer, upstreamBaseUrl }) {
  const rootSpan = tracer.startSpan('downstream.handle-request');
  const traceParentHeader = formatTraceParent({ traceId: rootSpan.traceId, spanId: rootSpan.spanId });
  const upstreamResponse = await callUpstream(upstreamBaseUrl, traceParentHeader);
  rootSpan.end();
  return { rootSpan, upstreamResponse };
}

module.exports = { createUpstreamService, callUpstream, runDownstreamRequest };
