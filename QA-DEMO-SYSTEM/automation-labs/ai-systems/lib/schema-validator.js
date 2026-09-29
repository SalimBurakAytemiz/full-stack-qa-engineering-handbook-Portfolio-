'use strict';

// Structured-output validation for AI/LLM responses, reusing the exact
// same ajv-based approach already established in this repository's API
// contract tests (QA-DEMO-SYSTEM/api-tests) — AI output is just another
// kind of untrusted structured payload that needs schema enforcement,
// not a special case requiring new tooling.
// TR: AI çıktısının yapısal doğrulaması — bu repodaki API contract
// testlerinde (QA-DEMO-SYSTEM/api-tests) zaten kurulu olan AYNI ajv
// tabanlı yaklaşımı yeniden kullanır.

const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, strict: false });

/**
 * Attempts to parse `text` as JSON and validate it against `schema`.
 * Never throws — a malformed/non-JSON model response is a real, expected
 * failure mode this function must report, not crash on.
 */
function validateStructuredOutput(text, schema) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { valid: false, parseError: err.message, errors: null, parsed: null };
  }
  const validateFn = ajv.compile(schema);
  const valid = validateFn(parsed);
  return { valid, parseError: null, errors: valid ? null : validateFn.errors, parsed };
}

module.exports = { validateStructuredOutput };
