# Interview Questions — AI/ML/LLM Systems Testing

Every answer below is scoped honestly: what this repository's executable
lab actually proves (repository practice), versus what it does not claim
(professional experience). See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "Have you tested AI/LLM-based features professionally?"

No — this is genuinely new, repository-only ground. I built a real,
executable AI-systems testing lab (`QA-DEMO-SYSTEM/automation-labs/ai-systems/`,
35 passing deterministic tests) to learn and demonstrate the underlying
QA techniques — prompt testing, golden-set evaluation, structured-output
validation, RAG groundedness checking, agent tool-call validation,
safety/privacy leakage detection, and provider-regression detection —
against a deterministic mock provider, not a real model. I'd say clearly
that the techniques transfer, but the professional exposure doesn't
exist yet.

## "How would you test a system that calls a non-deterministic LLM?"

The core shift is from "exact output equality" to "scored against
criteria the output must satisfy" — exact-match for closed-set answers,
contains-match or rubric scoring for open-ended ones, and for a
real (non-mock) provider, statistical acceptance over N runs rather than
single-run pass/fail, since the same prompt can legitimately produce
different valid outputs. I'd also separate "did my code call the model
correctly" (deterministic, testable exactly like any other integration)
from "did the model's *answer* meet quality criteria" (needs the
looser, criteria-based scoring). My lab demonstrates the second kind of
scoring — golden-dataset evaluation with exact/contains-match — against
a mock provider specifically so the demonstration itself stays
deterministic and CI-safe.

## "How do you know your AI output isn't hallucinating?"

For a RAG system specifically: check groundedness — does the answer's
citations exist within what was actually retrieved? My lab's
`isGrounded()` check does exactly this, and the test I consider most
important in that file is the citation-integrity case: it constructs an
answer that claims a citation it did NOT retrieve, specifically to prove
the groundedness check catches that failure mode rather than just
passing on well-behaved input. A groundedness checker that's never been
tested against a genuinely wrong answer hasn't proven anything.

## "How would you detect that a new model version is worse than the old one?"

Run the same golden dataset against both versions and diff the results
— the same regression-testing discipline as any other version bump,
applied to a model/provider identifier instead of an application
version. My lab's `compareModelVersions()` does this against two mock
model behaviors. Worth mentioning honestly: my first attempt at the
"deliberately regressed" model version didn't actually break any golden
case — I found that by running the test and reading the real output
(`regressions: []`), not by re-reading the code, and had to redesign
which behavior actually broke a case. That's in `COMMON-MISTAKES.md` — I
think it's a more useful answer than pretending the first version worked.

## "What's the difference between testing structured LLM output and testing a normal API response?"

Structurally, the same JSON-schema validation applies (wrong type,
missing/extra fields). The difference is the source: a normal API's
shape is controlled entirely by code you wrote, while an LLM's
"structured" output is still generated text that has to be parsed and
can fail to parse at all — so the first thing to test is "is this even
valid JSON," before schema validation is reachable. My lab's mock
`completeStructured()` deliberately returns an unparseable string for
one input path specifically so that failure mode has a real test rather
than being assumed away.

## "How would you test an AI agent that calls tools/functions?"

Test tool selection separately from tool execution, and validate
arguments *before* a real tool call fires, not after — an agent that
checks arguments post-execution isn't actually safe. Also test the
boundaries explicitly: what happens with no matching tool (should
terminate clearly, not guess), and what happens when the agent makes no
progress (should force-terminate at a bounded step limit, never loop
indefinitely). My lab's agent tests cover exactly these four cases, not
just the happy path.

## "Would you ever let this lab run against a real OpenAI/Anthropic/Gemini API?"

The lab is architected so `AI_TEST_MODE=live` is available as an honest
gate, but no live HTTP client ships by design — canonical CI never
requires a paid API key. Without a credential, live mode reports
`EXTERNALLY_BLOCKED` per provider, not a silent fallback dressed up as a
real pass. If I extended this to call a real provider, I'd keep that
gating exactly as-is and add the provider call behind it, still opt-in
and still never required for CI to go green.
