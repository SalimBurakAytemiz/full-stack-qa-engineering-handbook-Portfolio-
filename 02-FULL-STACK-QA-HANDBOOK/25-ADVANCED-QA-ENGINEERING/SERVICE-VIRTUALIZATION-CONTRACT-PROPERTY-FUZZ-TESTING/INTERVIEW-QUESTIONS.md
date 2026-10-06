# Interview Questions — Service Virtualization, Contract, Property-Based & Fuzz Testing

Every answer is scoped honestly: what this repository's labs actually
prove (repository practice), versus professional experience or
production-grade tooling this doesn't claim. See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "Have you used WireMock or Pact professionally?"

No — this is repository-only, technique-level work. I built a real,
working stub server (`service-virtualization/lib/stub-server.js`) and a
minimal ajv-based contract verifier
(`service-virtualization/lib/contract.js`) myself rather than reaching
for WireMock/Pact directly, specifically to understand and demonstrate
the underlying mechanics — request matching, the "unmatched request
must fail loudly" principle, stateful scenario sequencing, and
verifying the same contract on both the consumer and provider side. I'd
be upfront that a production setup would likely use the real tools
(broker-based contract publishing, richer matcher DSLs) — what I can
speak to concretely is why those tools work the way they do.

## "What's the most important design decision in a service-virtualization stub?"

What happens on an unmatched request. A stub server that defaults to
`200 {}` for anything it doesn't recognize silently hides real bugs —
your code called the wrong endpoint or sent the wrong shape, and the
test passes anyway because the double happily agreed with whatever it
got. My stub server returns a real `501` with a diagnostic body and
records every unmatched request, and I specifically wrote a test
proving that behavior rather than only testing the happy path.

## "How do you know your contract test would actually catch a real API change?"

By testing the verifier against a deliberately broken response first —
same discipline throughout my other labs. My consumer-contract test
includes a case where the virtualized response has a wrong-typed field
(`price` as a string) and an undeclared extra field, and asserts the
contract verifier rejects it. Only after proving the detector detects
does the positive-path "real backend response satisfies the contract"
test mean anything.

## "What's the point of property-based testing over just writing more example-based tests?"

Example-based tests only check specific cases you thought to write.
Property-based testing asserts an invariant across a whole class of
generated inputs — "for any valid product set, querying an id that was
never seeded always returns undefined, never a wrong record" — which
finds edge cases you didn't think to write an example for. The
practical requirement that makes this usable, not just clever, is
reproducibility: my framework's PRNG is seeded specifically so a
failure found once can be replayed exactly, and it shrinks a failure
down to the smallest input that still reproduces it, so the bug report
is actually readable.

## "Tell me about a real bug you found through testing, not just wrote a test for."

Fuzzing QA-DEMO-SYSTEM's real, already-shipped backend with a
200,000-character hostile input found a genuine bug: the server
returned a raw 500 instead of a proper 413 for an oversized request
body. Root cause was that Express's body-size-limit error
(`entity.too.large`) wasn't handled by the existing JSON-error
middleware, which only checked for parse failures. I fixed it at the
source — added the missing branch, same file, same pattern as the
existing parse-failure handling — verified the full backend regression
suite still passed, and re-ran the fuzz suite against a restarted
server to confirm the fix. I think this is a good example of why
fuzzing against a real system, not a mock, matters: this bug had been
sitting in reviewed, tested code because nothing had ever sent it a
request that large before.

## "How do you decide what counts as a 'crash' worth fixing in fuzz testing vs. acceptable rejection?"

A crash is any response that isn't a well-formed answer at a real HTTP
status — a raw 500 for genuinely bad client input, a hung connection,
a non-JSON body. A 400 or 401 for hostile input is the system working
correctly, not a bug — real validation doing its job. My fuzz test
distinguishes these explicitly: it never expects a specific 200, only
that the response is well-formed and that a 500 never appears for
input existing validation should have caught, which is exactly the
line the errorHandler.js bug crossed.
