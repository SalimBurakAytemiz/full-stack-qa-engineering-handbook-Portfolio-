'use strict';

// A deterministic, controllable "unreliable dependency" HTTP server for
// chaos-engineering / reliability testing. This is NOT a real chaos
// tool (no Chaos Monkey/Gremlin/Litmus/Toxiproxy) — it is a small,
// fully deterministic fixture the lab controls directly, so resilience
// code (retry, timeout, circuit breaker) can be tested against real
// HTTP failures without depending on real infrastructure or randomness.
// TR: Bu GERÇEK bir chaos aracı DEĞİLDİR — lab'ın doğrudan kontrol
// ettiği, tamamen deterministik bir HTTP sunucusu fixture'ıdır. Amaç,
// dayanıklılık (resilience) kodunu (retry, timeout, circuit breaker)
// rastgelelik veya gerçek altyapı olmadan GERÇEK HTTP hatalarına karşı
// test etmektir.

const http = require('node:http');

const VALID_BEHAVIORS = new Set(['ok', 'error_500', 'error_503', 'slow', 'hang']);

/**
 * @param {string[]} faultSchedule - ordered list of behaviors, consumed
 *   one per request and cycled (schedule[callCount % schedule.length]).
 *   Deterministic — never random — so the exact same test run produces
 *   the exact same sequence of failures every time.
 * @param {number} slowDelayMs - delay used for the 'slow' behavior.
 */
function createUnreliableServer({ faultSchedule = ['ok'], slowDelayMs = 50 } = {}) {
  for (const behavior of faultSchedule) {
    if (!VALID_BEHAVIORS.has(behavior)) {
      throw new Error(`unreliable-server: unknown fault behavior '${behavior}'`);
    }
  }

  let callCount = 0;
  const hangingResponses = new Set();

  const server = http.createServer((req, res) => {
    const behavior = faultSchedule[callCount % faultSchedule.length];
    callCount += 1;

    if (behavior === 'ok') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', call: callCount }));
      return;
    }
    if (behavior === 'error_500') {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', call: callCount }));
      return;
    }
    if (behavior === 'error_503') {
      res.writeHead(503, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'unavailable', call: callCount }));
      return;
    }
    if (behavior === 'slow') {
      const timer = setTimeout(() => {
        hangingResponses.delete(res);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok-but-slow', call: callCount }));
      }, slowDelayMs);
      hangingResponses.add(res);
      res.on('close', () => clearTimeout(timer));
      return;
    }
    // 'hang': never responds at all — the client's own timeout budget
    // (not this server) is what must end the request. Tracked so
    // close() can force these sockets closed and the process can exit.
    hangingResponses.add(res);
  });

  return {
    server,
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
        // Force-close any still-hanging responses first — otherwise a
        // 'hang' behavior would keep the server alive forever and hang
        // this lab's own lifecycle, exactly the failure mode this
        // repository's other labs (JMeter/Selenium) already guard
        // against with an explicit safety net.
        for (const res of hangingResponses) {
          try { res.destroy(); } catch { /* already closed */ }
        }
        hangingResponses.clear();
        server.close(() => resolve());
        server.closeAllConnections?.();
      });
    },
    getCallCount() {
      return callCount;
    },
  };
}

module.exports = { createUnreliableServer };
