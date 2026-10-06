'use strict';

// A real resilient HTTP client — bounded retry with backoff, a hard
// per-call timeout (AbortController), and an optional circuit breaker —
// composed around Node's built-in fetch. Every one of these is a real,
// exercised behavior, not a description: resilient-client.test.js
// proves retries actually stop, timeouts actually fire, and the
// circuit breaker actually prevents further network calls once open.
// TR: Gerçek bir dayanıklı (resilient) HTTP istemcisi — sınırlı retry +
// backoff, sert per-call timeout (AbortController) ve isteğe bağlı bir
// circuit breaker. Her biri gerçekten çalıştırılan, sadece açıklanan
// değil, KANITLANAN bir davranıştır.

class RetriesExhaustedError extends Error {
  constructor(message, { attempts, lastError }) {
    super(message);
    this.name = 'RetriesExhaustedError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {string} baseUrl
 * @param {number} timeoutMs - hard per-attempt budget (covers 'slow'/'hang' faults)
 * @param {number[]} retryDelaysMs - one entry per retry attempt after the first; length bounds max retries
 * @param {object} [circuitBreaker] - from circuit-breaker.js; optional
 */
function createResilientClient({ baseUrl, timeoutMs = 200, retryDelaysMs = [10, 20], circuitBreaker = null }) {
  async function callOnce() {
    return fetchWithTimeout(baseUrl, timeoutMs);
  }

  async function call() {
    const attemptFn = circuitBreaker ? () => circuitBreaker.execute(callOnce) : callOnce;
    let lastError;
    const maxAttempts = retryDelaysMs.length + 1;
    let attemptsMade = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      attemptsMade = attempt;
      try {
        return await attemptFn();
      } catch (err) {
        lastError = err;
        // A short-circuited call (circuit OPEN) is not worth retrying
        // against — retrying would defeat the point of the breaker. It
        // is also not a "retries exhausted" outcome (no attempt was
        // actually retried), so it propagates as-is rather than being
        // wrapped and disguised as one.
        if (err.name === 'CircuitOpenError') throw err;
        if (attempt < maxAttempts) {
          await sleep(retryDelaysMs[attempt - 1]);
        }
      }
    }
    throw new RetriesExhaustedError(
      `resilient-client: all attempts failed (${lastError && lastError.message})`,
      { attempts: attemptsMade, lastError },
    );
  }

  return { call };
}

module.exports = { createResilientClient, RetriesExhaustedError };
