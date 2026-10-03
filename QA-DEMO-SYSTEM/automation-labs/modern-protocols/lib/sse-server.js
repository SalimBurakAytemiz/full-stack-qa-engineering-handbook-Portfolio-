'use strict';

// A real, minimal Server-Sent Events (SSE) server — not a wrapper around
// a library, the actual HTTP/1.1 `text/event-stream` wire protocol
// (RFC-shaped `id:`/`event:`/`data:` framing, a blank line terminating
// each event) written by hand over Node's own `http` module. Events are
// written one at a time with a real delay between them, so a client
// genuinely observes them arriving progressively — this is the real
// mechanism that makes SSE a "modern protocol" relative to a single
// buffered HTTP response, not a diagram of one.
// TR: Gercek, minimal bir Server-Sent Events (SSE) sunucusu — bir
// kutuphane sarmalayicisi degil, Node'un kendi `http` modulu uzerinde
// elle yazilmis gercek `text/event-stream` tel protokolu.

const http = require('node:http');

/**
 * @param {Array<{id: number, event?: string, data: string}>} events - ordered events to stream
 * @param {number} intervalMs - real delay between each event
 */
function createSseServer({ events, intervalMs = 20 } = {}) {
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error('createSseServer requires a non-empty events array');
  }

  const server = http.createServer((req, res) => {
    if (req.url !== '/stream') {
      res.writeHead(404);
      res.end();
      return;
    }

    // TR: Gercek bir SSE istemcisinin yeniden baglaninca gonderdigi
    // Last-Event-ID basligi — sunucu bu id'den SONRAKI olaylardan
    // devam eder (zaten gorulenleri tekrar gondermez).
    const lastEventIdHeader = req.headers['last-event-id'];
    const lastEventId = lastEventIdHeader ? Number(lastEventIdHeader) : null;
    const pending = lastEventId === null ? events : events.filter((e) => e.id > lastEventId);

    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    });

    let index = 0;
    function sendNext() {
      if (index >= pending.length) {
        res.end();
        return;
      }
      const evt = pending[index];
      index += 1;
      let frame = `id: ${evt.id}\n`;
      if (evt.event) frame += `event: ${evt.event}\n`;
      frame += `data: ${evt.data}\n\n`;
      res.write(frame);
      setTimeout(sendNext, intervalMs);
    }
    sendNext();
  });

  return {
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
        server.closeAllConnections?.();
        server.close(() => resolve());
      });
    },
  };
}

module.exports = { createSseServer };
