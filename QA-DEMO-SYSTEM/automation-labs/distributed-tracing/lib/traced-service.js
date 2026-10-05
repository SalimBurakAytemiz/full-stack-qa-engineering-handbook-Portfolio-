'use strict';

// Two real services (an "upstream" and a "downstream"), both real
// node:http servers listening on real loopback ports, used to prove
// that trace context actually survives a real network hop — not a
// same-process function call pretending to be a service boundary.
// TR: Gerçek bir ağ sıçramasının trace bağlamını GERÇEKTEN
// koruduğunu kanıtlamak için kullanılan, gerçek loopback portlarında
// dinleyen iki gerçek node:http sunucusu.

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
