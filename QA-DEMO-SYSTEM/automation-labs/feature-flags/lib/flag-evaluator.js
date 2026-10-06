'use strict';

// A real, hand-rolled feature-flag evaluator. Percentage rollout is
// deterministic, not random: hashing the flag key together with a
// stable per-request identifier means the same user always gets the
// same answer for the same flag, on this process or any other,
// without needing to persist a per-user assignment anywhere.
// TR: Yüzde bazlı dağıtım RASTGELE değildir — flag anahtarı ile
// kararlı bir kimliği birlikte hash'lemek, aynı kullanıcının aynı
// flag için her zaman aynı cevabı almasını, hiçbir atamayı
// kalıcı hale getirmeden sağlar.

const crypto = require('node:crypto');

function bucketOf(flagKey, identifier) {
  const hash = crypto.createHash('sha256').update(`${flagKey}:${identifier}`).digest('hex');
  // TR: Hash'in ilk 8 hex karakteri (32 bit) yeterli bir dağılım sağlar.
  const intValue = parseInt(hash.slice(0, 8), 16);
  return intValue % 100;
}

function matchesSegment(segment, context) {
  return Object.entries(segment).every(([key, expected]) => context[key] === expected);
}

function createFlagEvaluator(flags) {
  function evaluate(flagKey, context = {}) {
    const flag = flags[flagKey];
    if (!flag) {
      throw new Error(`unknown flag: ${flagKey}`);
    }

    const identifier = context.userId;
    if (identifier === undefined) {
      throw new TypeError('evaluate() requires context.userId');
    }

    if (Array.isArray(flag.denyList) && flag.denyList.includes(identifier)) {
      return false;
    }
    if (Array.isArray(flag.allowList) && flag.allowList.includes(identifier)) {
      return true;
    }

    if (Array.isArray(flag.segments)) {
      for (const segment of flag.segments) {
        if (matchesSegment(segment, context)) {
          return true;
        }
      }
    }

    const percentage = flag.percentage ?? 0;
    return bucketOf(flagKey, identifier) < percentage;
  }

  return { evaluate };
}

module.exports = { createFlagEvaluator, bucketOf };
