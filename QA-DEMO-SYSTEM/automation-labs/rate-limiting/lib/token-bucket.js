'use strict';

// A real token-bucket rate limiter — not a counter that resets on a
// timer. Tokens refill continuously based on real elapsed time
// (fractional, not stepped), which is what lets a bucket partially
// refill between two close-together calls rather than only ever being
// "full" or "empty" on fixed tick boundaries. The clock is injectable
// (`now`) specifically so tests can prove refill behavior
// deterministically without a real sleep, the same discipline this
// repository's other labs (circuit-breaker.js, rollout-manager.js)
// already use.
// TR: Bu, zamanlayıcıyla sıfırlanan bir sayaç DEĞİL, GERÇEK bir
// token-bucket hız sınırlayıcıdır. Jetonlar gerçek geçen zamana göre
// sürekli (kesirli, basamaklı değil) dolar.

function createTokenBucket({ capacity, refillRatePerMs, now = Date.now }) {
  if (!(capacity > 0)) {
    throw new TypeError('createTokenBucket requires a positive capacity');
  }
  if (!(refillRatePerMs >= 0)) {
    throw new TypeError('createTokenBucket requires a non-negative refillRatePerMs');
  }

  let tokens = capacity;
  let lastRefillAt = now();

  function refill() {
    const currentTime = now();
    const elapsedMs = Math.max(0, currentTime - lastRefillAt);
    if (elapsedMs > 0) {
      tokens = Math.min(capacity, tokens + elapsedMs * refillRatePerMs);
      lastRefillAt = currentTime;
    }
  }

  // Returns true and deducts `cost` tokens if enough are available;
  // returns false and deducts nothing otherwise. Real refill always
  // happens first, so a call right after enough real time has passed
  // can succeed even if the previous call failed.
  function tryConsume(cost = 1) {
    refill();
    if (tokens >= cost) {
      tokens -= cost;
      return true;
    }
    return false;
  }

  function getTokens() {
    refill();
    return tokens;
  }

  return { tryConsume, getTokens };
}

module.exports = { createTokenBucket };
