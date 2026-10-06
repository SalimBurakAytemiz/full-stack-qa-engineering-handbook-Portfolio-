# Interview Questions — Distributed Messaging, Supply Chain Security & Compatibility Testing

Every answer is scoped honestly: what this repository's labs actually
prove (repository practice), versus professional experience or
production-grade tooling this doesn't claim. See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "Have you worked with Kafka or RabbitMQ professionally?"

No — this is repository-only, technique-level work. I built a minimal,
hand-rolled, in-process pub/sub broker myself specifically to understand
the mechanics that matter for testing — ordering, retry-on-failure,
dead-letter routing, and the idempotent-consumer pattern — rather than
reaching for a real broker client directly. I'd be upfront that a real
broker adds persistence, partitioning, consumer-group rebalancing, and
network-level failure modes my lab doesn't model at all; what I can speak
to concretely is the delivery-semantics problem itself and how to prove a
consumer handles it correctly.

## "Why does at-least-once delivery even cause bugs — isn't 'deliver it again' safe?"

Only if the consumer is idempotent, and a lot of real code isn't by
default. I can give a concrete, observed example from my own lab: the
exact same simulated failure (a handler's side effect runs, then it
throws — modeling a consumer that crashes after doing the work but before
acknowledging) was run through two consumer implementations differing
only by one dedup check. The non-idempotent one really did apply its side
effect twice under the resulting retry (`appliedCount=2`, an observed
double-charge-shaped bug, not a hypothetical one); the idempotent one
applied it exactly once. The lesson isn't "retries are bad" — it's that
at-least-once delivery shifts a real correctness obligation onto the
consumer, and a test suite should prove that obligation is actually met.

## "What's an SBOM and why would a QA engineer care about one?"

A Software Bill of Materials is a structured, machine-readable inventory
of every component in a build — not a prose dependency list, something a
tool can actually cross-reference against a vulnerability database or a
license-compliance rule. I generated a real one in my lab using npm's own
built-in `npm sbom` command (no added dependency) and got back a real,
76-component CycloneDX document for the backend workspace. A QA engineer
cares because "what's actually in this build" is itself a testable
question, and the SBOM is the artifact you'd test against — e.g. "is
every audit-flagged vulnerable package traceable in here," which is
exactly the cross-reference check my lab also runs.

## "Your audit found 24 vulnerabilities — is that a problem?"

I'd answer with the real breakdown rather than a single number, because a
single number hides the part that matters. All 24 are in
devDependencies — mostly the pre-existing `newman`/`postman` reporting
chain and `testcontainers`'s own `dockerode`/`undici` chain — and a
second, scoped run with `--omit=dev` found zero in the production
dependency graph. I report both numbers side by side rather than only the
reassuring one, because hiding the full-graph count to make a report look
cleaner is itself a credibility problem, even when the production risk
really is zero.

## "How did you avoid a false positive while checking lockfile integrity?"

By actually looking at what I was about to flag before shipping the rule.
A naive "every `resolved` entry needs an `integrity` hash" rule would
have flagged 4 entries in this repository's real lockfile — and
inspecting them showed they were this repo's own local npm workspaces
(`backend`, `api-tests`, `web-tests`, `automation-labs`), marked
`link: true` by npm itself, symlinked rather than downloaded, and
structurally incapable of ever carrying that hash. I wrote the checker to
explicitly exclude `link: true` entries and added a test that proves
exactly that exclusion — not just that a real violation gets caught, but
that a real non-violation doesn't get falsely flagged.

## "How do you decide whether an API change is breaking?"

By validating the real current response against a frozen baseline
contract with a real schema validator, and classifying what the
validator actually reports: a missing required field or a changed field
type is breaking (an existing consumer could depend on either), while an
extra, previously-undeclared field is not (a well-behaved consumer
ignores fields it doesn't recognize). I didn't just describe that rule —
I proved it by running the same checker against three constructed
candidates built from one real response (field removed, field retyped,
field added) and confirmed the classifications came out `BREAKING`,
`BREAKING`, `SAFE_ADDITIVE` exactly as the rule predicts.

## "Isn't flagging every schema difference as 'breaking' the safer default?"

It feels safer, but it trains people to ignore the tool. If a
compatibility checker cries "breaking!" on every additive, backward-
compatible change, the team either disables it or starts ignoring its
output — which is worse than having no checker, because now a genuinely
breaking change gets ignored too. My lab specifically tests the negative
case (a new field is classified `SAFE_ADDITIVE`, not `BREAKING`) for
exactly this reason: a compatibility checker's credibility depends on it
being right about what's safe, not just loud about what isn't.
