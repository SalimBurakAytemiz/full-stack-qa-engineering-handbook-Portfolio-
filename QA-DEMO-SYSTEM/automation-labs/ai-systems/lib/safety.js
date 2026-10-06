'use strict';

// Real, deterministic pattern-based checks for two common AI-system QA
// concerns: secret/credential leakage and PII leakage in model output.
// These are QA fixtures (pattern matching), not a claim of a production
// DLP system — the handbook page for this topic states that distinction
// explicitly. The patterns reuse the exact same credential-format
// regexes this repository already used for its own real secret scans
// during the Part 1 fix campaign (see .ai/CODEX-POST-FIX-CLOSURE-MATRIX.md
// history) — proven patterns, not new guesses.
// TR: Sır/kimlik bilgisi sızıntısı ve PII sızıntısı için gerçek,
// deterministik desen tabanlı kontroller — bir üretim DLP sistemi iddiası
// DEĞİLDİR.

const SECRET_PATTERNS = [
  { name: 'aws_access_key', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'github_token', re: /gh[ps]_[A-Za-z0-9]{36}/ },
  { name: 'anthropic_key', re: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'openai_key', re: /sk-[A-Za-z0-9]{20,}/ },
  { name: 'private_key_block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

const PII_PATTERNS = [
  { name: 'email', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  // Turkish TC Identity Number shape (11 digits) — shape-only check, not
  // a real checksum validator; sufficient for QA leakage-detection scope.
  { name: 'tc_kimlik_no_shape', re: /\b\d{11}\b/ },
  { name: 'credit_card_shape', re: /\b(?:\d[ -]?){13,16}\b/ },
];

function scanFor(text, patterns) {
  const hits = [];
  for (const { name, re } of patterns) {
    const m = text.match(re);
    if (m) hits.push({ name, matched: m[0] });
  }
  return hits;
}

function scanForSecrets(text) {
  return scanFor(text, SECRET_PATTERNS);
}

function scanForPII(text) {
  return scanFor(text, PII_PATTERNS);
}

/**
 * Redacts every detected secret/PII match, replacing it with a typed
 * placeholder — used to prove a defensive redaction layer actually
 * removes what the scanners found, not just detects it.
 */
function redact(text) {
  let redacted = text;
  for (const { name, re } of [...SECRET_PATTERNS, ...PII_PATTERNS]) {
    redacted = redacted.replace(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'), `[REDACTED_${name.toUpperCase()}]`);
  }
  return redacted;
}

module.exports = { scanForSecrets, scanForPII, redact, SECRET_PATTERNS, PII_PATTERNS };
