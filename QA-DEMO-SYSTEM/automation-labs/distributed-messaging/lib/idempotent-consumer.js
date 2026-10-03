'use strict';

// The real lesson at-least-once delivery teaches: a message CAN be
// delivered more than once (a redelivery after a transient consumer
// failure), so a consumer that applies a side effect without checking
// whether it already processed that message id will double-apply it.
// createNonIdempotentConsumer and createIdempotentConsumer are two real
// handlers over the SAME simulated failure shape (fail on the first
// attempt, after the side effect already ran — the realistic "crashed
// before acknowledging" case) so the difference in outcome is caused
// only by the dedup check, not by a different failure scenario.
// TR: En-az-bir-kez teslimin öğrettiği gerçek ders: bir mesaj BİRDEN
// FAZLA teslim edilebilir — bu yüzden bir side effect'i, o mesaj id'sini
// zaten işleyip işlemediğini kontrol etmeden uygulayan bir consumer onu
// İKİ KEZ uygular.

function createNonIdempotentConsumer() {
  const attemptsById = new Map();
  let appliedCount = 0;

  function handle(envelope) {
    appliedCount += 1;
    const attempts = (attemptsById.get(envelope.id) || 0) + 1;
    attemptsById.set(envelope.id, attempts);
    if (attempts === 1) {
      throw new Error('simulated transient failure after the side effect already ran');
    }
  }

  return { handle, getAppliedCount: () => appliedCount };
}

function createIdempotentConsumer() {
  const processedIds = new Set();
  const attemptsById = new Map();
  let appliedCount = 0;

  function handle(envelope) {
    if (processedIds.has(envelope.id)) {
      return; // already applied — redelivery is a no-op
    }
    appliedCount += 1;
    processedIds.add(envelope.id);
    const attempts = (attemptsById.get(envelope.id) || 0) + 1;
    attemptsById.set(envelope.id, attempts);
    if (attempts === 1) {
      throw new Error('simulated transient failure after the side effect already ran');
    }
  }

  return { handle, getAppliedCount: () => appliedCount };
}

module.exports = { createNonIdempotentConsumer, createIdempotentConsumer };
