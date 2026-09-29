'use strict';

// A deterministic, heuristic scanner for sensitive-field and PII
// leakage in an arbitrary JSON API response. This is NOT a certified
// PII-detection product — it is a QA fixture: a fixed denylist of
// field names that must never carry a real value in a response, plus
// a small set of regex-based PII value patterns, both disclosed here
// exactly as they are (no claim of exhaustive or production-grade
// detection). The QA technique this proves — "scan real API responses
// for accidental sensitive-data exposure, with an explicit allowlist
// for fields a given endpoint legitimately returns" — is real and
// transfers directly to a production privacy-testing pipeline.
// TR: Rastgele bir JSON API yanıtındaki hassas-alan ve PII sızıntısı
// için deterministik, sezgisel (heuristic) bir tarayıcı. Sertifikalı
// bir PII-tespit ürünü DEĞİLDİR — bir QA fixture'ıdır. Kanıtlanan QA
// TEKNİĞİ gerçektir ve doğrudan üretim bir gizlilik test hattına
// taşınabilir.

const SENSITIVE_KEY_DENYLIST = [
  'password',
  'password_hash',
  'passwordhash',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'api_key',
  'apikey',
  'ssn',
  'social_security_number',
  'credit_card_number',
  'creditcardnumber',
  'cvv',
];

const PII_VALUE_PATTERNS = [
  { name: 'email', re: /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i },
  // Turkish mobile number shape: 0?5xx xxx xx xx (matches the repo's
  // own Turkish-locale test-data conventions).
  { name: 'phone_tr', re: /\b0?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/ },
];

/**
 * @param {*} value - the parsed JSON response body (or any subtree)
 * @param {object} [options]
 * @param {string[]} [options.expectedSensitiveKeys] - denylisted keys this
 *   SPECIFIC endpoint legitimately returns (e.g. 'token' on a login
 *   response) — findings for these keys are suppressed, everything else
 *   in the denylist is still flagged.
 * @param {string[]} [options.allowedPiiKeys] - key names where a PII-shaped
 *   value is expected and not a finding (e.g. 'email' on a user's own
 *   profile response).
 * @returns {{path: string, key: string, reason: string}[]}
 */
function scanForLeakage(value, { expectedSensitiveKeys = [], allowedPiiKeys = [] } = {}) {
  const findings = [];
  const expected = new Set(expectedSensitiveKeys.map((k) => k.toLowerCase()));
  const allowedPii = new Set(allowedPiiKeys.map((k) => k.toLowerCase()));
  walk(value, '', findings, expected, allowedPii);
  return findings;
}

function walk(value, path, findings, expectedSensitiveKeys, allowedPiiKeys) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, `${path}[${i}]`, findings, expectedSensitiveKeys, allowedPiiKeys));
    return;
  }
  if (value === null || typeof value !== 'object') {
    return;
  }
  for (const [key, val] of Object.entries(value)) {
    const keyPath = path ? `${path}.${key}` : key;
    const lowerKey = key.toLowerCase();

    if (
      SENSITIVE_KEY_DENYLIST.includes(lowerKey) &&
      val !== null &&
      val !== undefined &&
      !expectedSensitiveKeys.has(lowerKey)
    ) {
      findings.push({ path: keyPath, key: lowerKey, reason: 'sensitive_field_present' });
    }

    if (typeof val === 'string' && !allowedPiiKeys.has(lowerKey)) {
      for (const pattern of PII_VALUE_PATTERNS) {
        if (pattern.re.test(val)) {
          findings.push({ path: keyPath, key: lowerKey, reason: `unexpected_pii_${pattern.name}` });
        }
      }
    }

    walk(val, keyPath, findings, expectedSensitiveKeys, allowedPiiKeys);
  }
}

module.exports = { scanForLeakage, SENSITIVE_KEY_DENYLIST, PII_VALUE_PATTERNS };
