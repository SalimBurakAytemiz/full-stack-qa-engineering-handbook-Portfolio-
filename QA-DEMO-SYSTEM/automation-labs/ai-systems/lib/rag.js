'use strict';

// Deterministic RAG (Retrieval-Augmented Generation) pipeline for QA
// testing purposes.
//
// Retrieval here is a real, working keyword-overlap ranker — not a
// vector/embedding search. This is a deliberate, disclosed scope
// boundary (no embedding model is available in this lab), documented
// in the handbook page for this topic — never presented as "real
// semantic retrieval." The QA techniques this proves (retrieval-quality
// scoring, groundedness/citation checking, hallucination detection when
// the corpus has no answer) apply identically regardless of which
// retrieval algorithm sits underneath.
// TR: Buradaki retrieval GERÇEK ve çalışan bir anahtar-kelime örtüşme
// sıralayıcısıdır — vektör/embedding araması DEĞİLDİR. Bu, açıkça
// belirtilen bilinçli bir kapsam sınırıdır.

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'of', 'to', 'in', 'on', 'is', 'are', 'with', 'for', 'it', 'this']);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w));
}

/**
 * Ranks `documents` by keyword overlap with `query`. Returns documents
 * sorted by descending score; a query matching nothing returns an empty
 * array (this is the correct, expected "no relevant context" case, not
 * an error).
 */
function retrieve(documents, query, topK = 2) {
  const queryTokens = new Set(tokenize(query));
  const scored = documents.map((doc) => {
    const docTokens = tokenize(doc.text + ' ' + doc.title);
    const overlap = docTokens.filter((t) => queryTokens.has(t)).length;
    return { doc, score: overlap };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => ({ ...s.doc, retrievalScore: s.score }));
}

/**
 * Builds a grounded answer strictly from retrieved context — never from
 * the query alone. If nothing was retrieved, returns an explicit
 * "no grounded answer" response rather than fabricating one — this is
 * the exact behavior the hallucination-detection tests in this lab
 * check for.
 */
function answerFromContext(retrievedDocs, query) {
  if (retrievedDocs.length === 0) {
    return { text: 'No relevant context was retrieved; I cannot answer this from the known corpus.', citations: [], grounded: false };
  }
  const best = retrievedDocs[0];
  return { text: `Based on ${best.title}: ${best.text}`, citations: retrievedDocs.map((d) => d.id), grounded: true };
}

/**
 * Groundedness check: every citation the answer claims must correspond
 * to a document that was ACTUALLY retrieved — catches the case where an
 * answer cites a source it never used (a real RAG failure mode).
 */
function isGrounded(answer, retrievedDocs) {
  if (!answer.grounded) return answer.citations.length === 0;
  const retrievedIds = new Set(retrievedDocs.map((d) => d.id));
  return answer.citations.every((id) => retrievedIds.has(id)) && answer.citations.length > 0;
}

module.exports = { tokenize, retrieve, answerFromContext, isGrounded };
