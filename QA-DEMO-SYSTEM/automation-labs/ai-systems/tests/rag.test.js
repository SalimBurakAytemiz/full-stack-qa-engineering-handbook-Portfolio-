'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const corpus = require('../fixtures/rag-corpus.json');
const { retrieve, answerFromContext, isGrounded } = require('../lib/rag');

test('RAG retrieval: a query about a specific product retrieves the matching document, not an unrelated one', () => {
  const retrieved = retrieve(corpus.documents, 'What is the stock quantity of QA Demo Mouse?');
  assert.ok(retrieved.length > 0, 'retrieval must return at least one document for a relevant query');
  assert.equal(retrieved[0].id, 'doc.qa-demo-mouse');
});

test('RAG retrieval: a query with no matching content returns an empty result, not a fabricated match', () => {
  const retrieved = retrieve(corpus.documents, 'What is the capital city of France?');
  assert.deepEqual(retrieved, [], 'a query with zero keyword overlap must retrieve nothing — never a false-positive match');
});

test('RAG groundedness: an answer built from retrieved context cites exactly the documents it used', () => {
  const retrieved = retrieve(corpus.documents, 'QA Demo Mouse stock');
  const answer = answerFromContext(retrieved, 'QA Demo Mouse stock');
  assert.equal(answer.grounded, true);
  assert.ok(isGrounded(answer, retrieved));
  assert.match(answer.text, /out of stock|stock_quantity 0/i);
});

test('hallucination detection: when nothing is retrieved, the answer explicitly says so instead of inventing a fact', () => {
  const retrieved = retrieve(corpus.documents, 'unrelated query with zero overlap xyz');
  const answer = answerFromContext(retrieved, 'unrelated query');
  assert.equal(answer.grounded, false);
  assert.match(answer.text, /cannot answer/i);
});

test('citation integrity: an answer that claims a citation NOT actually retrieved fails the groundedness check', () => {
  const retrieved = retrieve(corpus.documents, 'QA Demo Klavye stock');
  // Deliberately construct a fabricated answer citing a document that
  // was never retrieved, to prove isGrounded() actually catches this —
  // a real citation-integrity failure mode, not a synthetic always-true check.
  const fabricated = { text: 'Fabricated claim.', citations: ['doc.retry-pattern'], grounded: true };
  assert.equal(isGrounded(fabricated, retrieved), false, 'citing a document that was never retrieved must fail the groundedness check');
});
