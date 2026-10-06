'use strict';

// Deterministic mock LLM provider for the AI systems QA lab.
//
// This is NOT a real language model — it is a small, rule-based,
// fully deterministic stand-in that lets every test in this lab run
// with AI_TEST_MODE=mock (the default), with zero network calls, zero
// API keys, and zero cost. Real intelligence is never claimed; the
// point is to prove QA TECHNIQUES (prompt testing, eval harnesses,
// structured-output validation, RAG grounding checks, agent tool-call
// validation, injection-defense testing) work correctly against a
// provider whose behavior is fully known and reproducible.
//
// TR: Bu GERÇEK bir dil modeli DEĞİLDİR — kural tabanlı, tamamen
// deterministik bir yerine geçen (stand-in) modeldir. AI_TEST_MODE=mock
// (varsayılan) ile hiçbir ağ çağrısı, API anahtarı veya maliyet olmadan
// çalışır. Amaç gerçek zekâ iddia etmek değil, QA TEKNİKLERİNİN
// (prompt testi, eval harness, structured-output doğrulama, RAG
// grounding kontrolü, agent tool-call doğrulama, injection savunma
// testi) davranışı tam olarak bilinen bir sağlayıcıya karşı doğru
// çalıştığını kanıtlamaktır.

const INJECTION_PATTERNS = [
  /ignore (all|any|the) (previous|prior|above) instructions?/i,
  /reveal (the )?system prompt/i,
  /disregard (your|the) (rules|instructions|guidelines)/i,
  /you are now (in )?(dan|developer|jailbreak) mode/i,
  /pretend (you have no|there are no) (restrictions|rules|filters)/i,
];

const REFUSAL_TEXT =
  'I cannot comply with that request because it conflicts with my operating instructions.';

function detectInjection(prompt) {
  return INJECTION_PATTERNS.some((re) => re.test(prompt));
}

function classifyStockStatus(prompt) {
  const m = prompt.match(/stock_quantity\s*=\s*(\d+)/i);
  if (!m) return null;
  const qty = Number(m[1]);
  return qty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
}

function greet(prompt, behavior = {}) {
  const m = prompt.match(/customer named (\p{L}+)/iu);
  if (!m) return null;
  // TR: dropsCustomerNameInGreeting true olduğunda müşteri adı kasıtlı
  // olarak çıkarılır — bu, provider-regression testinin yakalaması
  // gereken GERÇEK bir davranış bozulmasıdır (sahte/synthetic değil).
  if (behavior.dropsCustomerNameInGreeting) {
    return 'Hello! Thank you for reaching out — how can I help today?';
  }
  return `Hello, ${m[1]}! Thank you for reaching out — how can I help today?`;
}

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'of', 'to', 'in', 'on', 'is', 'are', 'with', 'for']);

function summarize(prompt) {
  const m = prompt.match(/Summarize in one short sentence:\s*(.+)/is);
  if (!m) return null;
  const source = m[1].trim();
  // Deterministic extractive "summary": the first sentence, keywords kept
  // as-is. Never claims semantic understanding — a QA fixture, not a
  // real summarization model.
  const firstSentence = source.split(/(?<=[.!?])\s/)[0];
  const words = firstSentence.split(/\s+/).filter((w) => !STOPWORDS.has(w.toLowerCase()));
  return `Summary: ${words.join(' ')}`;
}

/**
 * A minimal, fully deterministic "model" — used by provider-regression
 * tests to prove the harness detects real behavior drift between two
 * model versions, not just a single always-passing model.
 */
const MODEL_BEHAVIORS = {
  'mock-v1': { summarizeKeepsFirstSentenceOnly: true },
  // v2 deliberately regresses (drops the customer's name from greetings)
  // so the provider-regression test has a real, reproducible drift to
  // detect against the golden dataset — not a synthetic string match,
  // an actual behavioral difference that breaks golden.greeting.en's
  // expected_contains check for the customer's name.
  'mock-v2-regressed': { summarizeKeepsFirstSentenceOnly: true, dropsCustomerNameInGreeting: true },
};

function complete({ prompt, model = 'mock-v1' }) {
  if (typeof prompt !== 'string' || prompt.length === 0) {
    throw new Error('mock-provider.complete(): prompt must be a non-empty string');
  }
  const startedAt = Date.now();
  const behavior = MODEL_BEHAVIORS[model] || MODEL_BEHAVIORS['mock-v1'];

  if (detectInjection(prompt)) {
    return finish({ text: REFUSAL_TEXT, refused: true, prompt, startedAt, model });
  }

  const stock = classifyStockStatus(prompt);
  if (stock) return finish({ text: stock, refused: false, prompt, startedAt, model });

  const greeting = greet(prompt, behavior);
  if (greeting) return finish({ text: greeting, refused: false, prompt, startedAt, model });

  const summary = summarize(prompt);
  if (summary) {
    return finish({ text: summary, refused: false, prompt, startedAt, model });
  }

  // Deterministic fallback: echo a bounded, clearly-marked stand-in reply.
  return finish({ text: `[mock-provider] no rule matched; echoing prompt length=${prompt.length}`, refused: false, prompt, startedAt, model });
}

function finish({ text, refused, prompt, startedAt, model }) {
  // Deterministic, cheap token/latency simulation — proportional to input
  // size, not random, so budget-validation tests are reproducible.
  const tokensIn = Math.ceil(prompt.length / 4);
  const tokensOut = Math.ceil(text.length / 4);
  const latencyMs = Date.now() - startedAt + tokensOut; // never truly 0, still deterministic-ish per run
  return { text, refused, model, tokensIn, tokensOut, latencyMs };
}

// Deterministic structured-output generator — separate from complete()
// because structured-output testing (08-STRUCTURED-OUTPUT-AND-RAG-TESTING
// style) needs a provider path that returns a fixed JSON shape for a
// given input, not free text. Extracts a product name and quantity from
// a natural-language order line via a fixed pattern — deliberately
// simple and fully deterministic, same discipline as complete() above.
function completeStructured({ prompt }) {
  const m = prompt.match(/(\d+)x?\s+([A-Za-zÇĞİÖŞÜçğıöşü ]+?)(?:\.|$)/);
  if (!m) {
    // Deliberately malformed on purpose for negative-path testing —
    // never silently returns a fabricated well-formed object.
    return '{not valid json';
  }
  return JSON.stringify({ quantity: Number(m[1]), item: m[2].trim() });
}

module.exports = { complete, completeStructured, detectInjection, REFUSAL_TEXT, MODEL_BEHAVIORS };
