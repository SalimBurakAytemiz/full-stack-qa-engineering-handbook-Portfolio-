# Structured-Output and RAG Testing

**Executable evidence:** `ai-systems/tests/structured-output.test.js`,
`ai-systems/lib/schema-validator.js`, `ai-systems/lib/completeStructured`
(in `mock-provider.js`), `ai-systems/tests/rag.test.js`,
`ai-systems/lib/rag.js`, `ai-systems/fixtures/rag-corpus.json`.

## Structured-output validation

When a system asks a model for structured data (JSON matching a schema,
not free text), the model can fail in ways free-text testing wouldn't
catch:

- **Unparseable output** — the model returns text that isn't valid JSON
  at all. `completeStructured()` deliberately returns `'{not valid json'`
  for inputs it can't extract structure from, so this path has a real
  case to test rather than a synthetic one.
- **Wrong type** — valid JSON, wrong shape (e.g. `quantity` as a string
  instead of a number).
- **Unexpected extra fields** — valid JSON, correct types, but an
  additional property the schema doesn't allow
  (`additionalProperties: false`).

`lib/schema-validator.js` wraps ajv (JSON Schema validator, v8) —
`validateStructuredOutput(text, schema)` parses the text and validates
it, surfacing ajv's own error objects (`instancePath`, `message`) rather
than a custom, less-precise error format. Getting ajv's major version
right mattered in practice here: this workspace's dependency tree has a
stale, hoisted ajv v6 (legacy `dataPath` field instead of `instancePath`)
alongside proper v8 copies in sibling workspaces — see
`COMMON-MISTAKES.md` for how this was diagnosed and fixed.

## RAG (retrieval-augmented generation) testing

RAG systems retrieve relevant documents, then generate an answer
grounded in them. Testing RAG has a QA-specific failure mode that plain
prompt testing doesn't cover: **the answer can be fluent and wrong** if
it's not actually grounded in what was retrieved.

`lib/rag.js` implements, deterministically:

- `retrieve(query, corpus)` — keyword-overlap retrieval (not a real
  vector/embedding search — a QA fixture, disclosed as such) against
  `fixtures/rag-corpus.json` (4 documents describing real facts already
  established elsewhere in this repository).
- `answerFromContext(query, retrievedDocs)` — builds an answer and
  records which document IDs it actually cites.
- `isGrounded(answer, retrievedDocs)` — checks the answer's citations
  are a subset of what was actually retrieved.

Tests in `rag.test.js` cover:

- **Retrieval precision:** a query about a specific product retrieves
  the matching document, not an unrelated one.
- **Retrieval recall/honesty:** a query with no matching content returns
  an empty result — never a fabricated match.
- **Groundedness:** an answer built from retrieved context cites exactly
  the documents it used.
- **Hallucination-avoidance:** when nothing is retrieved, the answer
  explicitly says so instead of inventing a fact.
- **Citation integrity:** an answer that claims a citation it did NOT
  actually retrieve fails the groundedness check — this is the test that
  actually proves `isGrounded()` does real work, not just returns `true`
  unconditionally.

## Why citation integrity is the test that matters most

A groundedness checker that only ever sees well-behaved input (answers
that genuinely cite what they retrieved) never proves it can catch the
failure mode it exists for. The citation-integrity test constructs an
answer object that claims a document ID never in the retrieved set,
specifically to prove `isGrounded()` rejects it — the same "construct
the failure, don't just hope for it" discipline used throughout this
lab (see also `COMMON-MISTAKES.md`'s discussion of the
`provider-regression.test.js` fixture that initially failed to do this).

## What a real RAG/embedding pipeline would add on top of this

Real vector similarity search, chunking-strategy testing, re-ranking,
and embedding-drift detection are not implemented here — `retrieve()`'s
keyword overlap is a deterministic stand-in for the QA-technique level
this lab operates at (see `01-FOUNDATIONS-AND-CLASSICAL-ML-TESTING.md`).
