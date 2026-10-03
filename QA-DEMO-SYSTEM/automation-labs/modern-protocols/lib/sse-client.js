'use strict';

// A real, minimal Server-Sent Events client — parses the actual raw
// `text/event-stream` wire bytes as they arrive on a real Node `http`
// request (chunk by chunk, splitting on the blank-line event terminator),
// recording a real wall-clock timestamp for each parsed event. This is
// what proves events arrive progressively over the real connection,
// rather than the client simply reading one buffered response.
// TR: Gercek, minimal bir SSE istemcisi — GERCEK ham `text/event-stream`
// bytelarini geldikce parse eder ve her olay icin gercek bir zaman
// damgasi kaydeder.

const http = require('node:http');

/**
 * @param {string} baseUrl - e.g. "http://127.0.0.1:12345"
 * @param {{lastEventId?: number}} [options]
 * @returns {Promise<Array<{id: number, event: string|null, data: string, receivedAtMs: number}>>}
 */
function connectAndCollect(baseUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (options.lastEventId !== undefined) {
      headers['Last-Event-ID'] = String(options.lastEventId);
    }

    const req = http.get(`${baseUrl}/stream`, { headers }, (res) => {
      const events = [];
      let buffer = '';

      res.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        let boundary;
        // TR: Her SSE olayi bos bir satirla (\n\n) sonlanir.
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          events.push(parseFrame(rawEvent, Date.now()));
        }
      });

      res.on('end', () => resolve(events));
      res.on('error', reject);
    });

    req.on('error', reject);
  });
}

function parseFrame(rawEvent, receivedAtMs) {
  let id = null;
  let event = null;
  let data = '';
  for (const line of rawEvent.split('\n')) {
    if (line.startsWith('id: ')) id = Number(line.slice(4));
    else if (line.startsWith('event: ')) event = line.slice(7);
    else if (line.startsWith('data: ')) data = line.slice(6);
  }
  return { id, event, data, receivedAtMs };
}

module.exports = { connectAndCollect };
