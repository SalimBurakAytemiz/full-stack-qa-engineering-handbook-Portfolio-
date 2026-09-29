'use strict';

// Deterministic evaluation harness for LLM-style outputs.
//
// Two scoring modes are implemented, both real and deterministic (no
// randomness, no embeddings, no external calls):
//   - exact-match:    output === expected (case-sensitive, trimmed)
//   - contains-match: every expected substring appears (case-insensitive)
//
// This is deliberately NOT a semantic-similarity/embedding-based
// evaluator — the handbook page for this lab explains that distinction
// explicitly (02-STRUCTURED-OUTPUT-AND-RAG-TESTING style semantic evals
// require a real embedding model, which this lab does not have; see
// AI-ML-LLM-SYSTEMS-TESTING/03-STRUCTURED-OUTPUT-AND-RAG-TESTING.md).
// TR: Bu, embedding tabanlı bir semantik benzerlik değerlendiricisi
// DEĞİLDİR — bilinçli bir tasarım sınırıdır, gizlenmiş bir eksiklik
// değil.

function scoreCase(testCase, actualText) {
  const actual = String(actualText);
  if (testCase.expected_exact !== null && testCase.expected_exact !== undefined) {
    const pass = actual.trim() === testCase.expected_exact;
    return { id: testCase.id, mode: 'exact-match', pass, actual, expected: testCase.expected_exact };
  }
  const missing = (testCase.expected_contains || []).filter(
    (needle) => !actual.toLowerCase().includes(needle.toLowerCase())
  );
  return {
    id: testCase.id,
    mode: 'contains-match',
    pass: missing.length === 0,
    actual,
    expected: testCase.expected_contains,
    missing,
  };
}

/**
 * Runs every case in `dataset.cases` through `completeFn(prompt) -> text`
 * and returns a real scored report — never a hand-picked subset.
 */
function runGoldenEval(dataset, completeFn) {
  const results = dataset.cases.map((testCase) => {
    const text = completeFn(testCase.prompt);
    return scoreCase(testCase, text);
  });
  const passed = results.filter((r) => r.pass).length;
  return { total: results.length, passed, failed: results.length - passed, results };
}

module.exports = { scoreCase, runGoldenEval };
