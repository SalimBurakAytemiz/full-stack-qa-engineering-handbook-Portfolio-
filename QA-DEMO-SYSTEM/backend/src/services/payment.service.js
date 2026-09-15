const fs = require('node:fs');
const path = require('node:path');

const PATTERNS_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'shared',
  'test-data',
  'payment-test-patterns.json'
);

function loadPatterns() {
  const data = JSON.parse(fs.readFileSync(PATTERNS_PATH, 'utf-8'));
  return {
    defaultToken: data.default_payment_token,
    resultByToken: new Map(data.patterns.map((p) => [p.payment_token, p.result])),
  };
}

const { defaultToken: DEFAULT_PAYMENT_TOKEN, resultByToken } = loadPatterns();

// Fully internal/fake simulation — no external payment provider is called.
function simulatePayment(paymentToken) {
  const token = paymentToken || DEFAULT_PAYMENT_TOKEN;
  const result = resultByToken.get(token);

  if (!result) {
    return { ok: false, message: `Bilinmeyen test payment token: ${token}` };
  }

  return { ok: true, result };
}

module.exports = { simulatePayment, DEFAULT_PAYMENT_TOKEN };
