'use strict';

// A real circuit-breaker implementation (CLOSED / OPEN / HALF_OPEN),
// not a pattern description — this is the actual state machine that
// gets exercised by circuit-breaker.test.js. The clock is injectable
// (`now`) specifically so tests can prove HALF_OPEN transitions
// deterministically without a real sleep, the same discipline used
// throughout this repository's other labs to keep CI fast and exact.
// TR: Bu bir PATERN AÇIKLAMASI değil, GERÇEK bir circuit-breaker durum
// makinesidir. Saat (`now`) enjekte edilebilir — testler gerçek bir
// sleep olmadan HALF_OPEN geçişini deterministik biçimde kanıtlayabilsin
// diye.

const CLOSED = 'CLOSED';
const OPEN = 'OPEN';
const HALF_OPEN = 'HALF_OPEN';

class CircuitOpenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

function createCircuitBreaker({ failureThreshold = 3, resetTimeoutMs = 1000, now = Date.now } = {}) {
  let state = CLOSED;
  let consecutiveFailures = 0;
  let openedAt = null;

  function getState() {
    return state;
  }

  async function execute(fn) {
    if (state === OPEN) {
      if (now() - openedAt < resetTimeoutMs) {
        // Fails fast — fn is never called, so the downstream dependency
        // is never actually hit while the circuit protects it. This is
        // the exact behavior chaos-scenario.test.js proves by watching
        // the unreliable server's own call count stop increasing.
        throw new CircuitOpenError('circuit is OPEN — call short-circuited without hitting the dependency');
      }
      state = HALF_OPEN;
    }

    try {
      const result = await fn();
      if (state === HALF_OPEN) {
        state = CLOSED;
      }
      consecutiveFailures = 0;
      return result;
    } catch (err) {
      consecutiveFailures += 1;
      if (state === HALF_OPEN || consecutiveFailures >= failureThreshold) {
        state = OPEN;
        openedAt = now();
      }
      throw err;
    }
  }

  return { execute, getState, CLOSED, OPEN, HALF_OPEN };
}

module.exports = { createCircuitBreaker, CircuitOpenError, CLOSED, OPEN, HALF_OPEN };
