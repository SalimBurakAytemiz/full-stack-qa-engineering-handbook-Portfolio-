'use strict';

// OPTIONAL live-provider adapter. This file exists to show what wiring a
// real provider would look like, but it is NEVER required for this lab
// to pass — AI_TEST_MODE defaults to "mock" (see run-ai-lab.js), and no
// canonical CI job ever sets AI_TEST_MODE=live or provides an API key.
//
// If a caller explicitly sets AI_TEST_MODE=live without a matching
// *_API_KEY, this returns an explicit EXTERNALLY_BLOCKED result — never
// a silent fallback to the mock, and never a fabricated PASS.
// TR: BU DOSYA HİÇBİR ZAMAN GEREKLİ DEĞİLDİR — AI_TEST_MODE varsayılanı
// "mock"tur. Kimse API anahtarı olmadan AI_TEST_MODE=live ayarlamazsa
// bu dosya hiç devreye girmez. Eğer devreye girerse ve anahtar yoksa,
// SESSİZCE mock'a düşmez — açıkça EXTERNALLY_BLOCKED döner.

const PROVIDER_ENV_KEYS = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
};

/**
 * Returns { status: 'EXTERNALLY_BLOCKED' | 'READY', reason } — never
 * performs the real network call itself (this lab does not implement a
 * paid-API HTTP client; that is out of scope and unnecessary to prove
 * the QA technique). A real integration would replace the READY branch
 * with an actual provider SDK call, gated by this exact same check.
 */
function checkLiveProviderAvailability(provider) {
  const envKey = PROVIDER_ENV_KEYS[provider];
  if (!envKey) {
    return { status: 'EXTERNALLY_BLOCKED', reason: `unknown provider '${provider}'` };
  }
  if (!process.env[envKey]) {
    return { status: 'EXTERNALLY_BLOCKED', reason: `${envKey} not set — no credential means NOT_EXECUTED, never a silent mock fallback presented as a real pass` };
  }
  // A real credential is present, but this lab intentionally does not
  // ship a paid-API HTTP client — see the module comment above.
  return { status: 'EXTERNALLY_BLOCKED', reason: 'live provider HTTP client not implemented in this lab by design (mock-first scope) — see handbook 02-LLM-AND-PROMPT-TESTING.md' };
}

module.exports = { checkLiveProviderAvailability, PROVIDER_ENV_KEYS };
