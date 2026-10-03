'use strict';

// A real canary-rollout state machine (not a diagram) — progresses a
// deployment through a configured sequence of traffic-percentage
// stages, calling a real health-check function before every advance,
// and automatically rolling back to 0% the moment a health check
// fails. The health-check function and clock are both injectable so
// tests can prove rollback deterministically without a real sleep or
// a real traffic-shifting proxy, the same discipline already used by
// chaos-reliability/lib/circuit-breaker.js in this repository.
// TR: Bu bir diyagram DEĞİL, GERÇEK bir canary-rollout durum
// makinesidir. Sağlık kontrolü fonksiyonu ve saat enjekte edilebilir —
// testler gerçek bir sleep veya gerçek bir trafik-yönlendirme proxy'si
// olmadan rollback'i deterministik biçimde kanıtlayabilsin diye.

const IDLE = 'IDLE';
const ROLLING_OUT = 'ROLLING_OUT';
const COMPLETE = 'COMPLETE';
const ROLLED_BACK = 'ROLLED_BACK';

function createRolloutManager({ stages = [10, 50, 100], healthCheck, now = Date.now } = {}) {
  if (typeof healthCheck !== 'function') {
    throw new TypeError('createRolloutManager requires a healthCheck function');
  }
  if (!Array.isArray(stages) || stages.length === 0) {
    throw new TypeError('createRolloutManager requires a non-empty stages array');
  }

  let state = IDLE;
  let stageIndex = -1;
  let trafficPercent = 0;
  const history = [];

  function record(event, detail) {
    history.push({ event, detail, at: now() });
  }

  async function start() {
    if (state !== IDLE) {
      throw new Error(`cannot start a rollout from state ${state}`);
    }
    state = ROLLING_OUT;
    record('START', null);
    await advance();
    return getStatus();
  }

  // Advances to the next stage if the current stage's real health
  // check passes; rolls back to 0% traffic the instant it does not.
  // This is the one function every test in rollout-manager.test.js
  // ultimately exercises.
  async function advance() {
    if (state !== ROLLING_OUT) {
      throw new Error(`cannot advance a rollout from state ${state}`);
    }
    const nextIndex = stageIndex + 1;
    const nextPercent = stages[nextIndex];

    const healthy = await healthCheck(nextPercent);
    if (!healthy) {
      trafficPercent = 0;
      state = ROLLED_BACK;
      record('ROLLBACK', { failedAtPercent: nextPercent });
      return getStatus();
    }

    stageIndex = nextIndex;
    trafficPercent = nextPercent;
    record('ADVANCE', { percent: nextPercent });

    if (stageIndex === stages.length - 1) {
      state = COMPLETE;
      record('COMPLETE', null);
    }
    return getStatus();
  }

  function getStatus() {
    return { state, trafficPercent, stageIndex, history: history.slice() };
  }

  return { start, advance, getStatus, IDLE, ROLLING_OUT, COMPLETE, ROLLED_BACK };
}

module.exports = { createRolloutManager, IDLE, ROLLING_OUT, COMPLETE, ROLLED_BACK };
