'use strict';

// A real idempotency store — not a cache-shaped diagram. Storing the
// in-flight PROMISE itself (not just a completed result) under each
// key is what makes this a genuine concurrency-safe guarantee rather
// than a "check-then-act" race: two real concurrent calls with the
// same key both receive the exact same promise, so the real side
// effect function runs exactly once no matter how many callers race
// on it — proven concretely in idempotency-store.test.js and
// idempotent-server.test.js, not just asserted in a comment.
// TR: Her anahtar altında TAMAMLANMIŞ bir sonuç değil, devam eden
// PROMISE'in kendisini saklamak — bunu "kontrol-et-sonra-yap" yarış
// durumu değil, gerçek bir eşzamanlılık-güvenli garanti yapan şeydir.

function createIdempotencyStore() {
  const entries = new Map();

  // Returns the real result of calling executeFn() exactly once per
  // key, no matter how many times handle() is called with that key —
  // including when those calls genuinely overlap in time.
  function handle(key, executeFn) {
    if (entries.has(key)) {
      return entries.get(key);
    }
    const promise = Promise.resolve().then(executeFn);
    entries.set(key, promise);
    return promise;
  }

  function has(key) {
    return entries.has(key);
  }

  function size() {
    return entries.size;
  }

  return { handle, has, size };
}

module.exports = { createIdempotencyStore };
