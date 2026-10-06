# Interview Questions — i18n, Modern Protocols & Production Verification

Every answer is scoped honestly: what this repository's labs actually
prove (repository practice), versus professional experience or
production-grade tooling this doesn't claim. See
`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` — every
competency this area adds has `professional: {status: NONE}`.

## "How do you test that an app correctly supports multiple locales?"

I split it into two genuinely different questions rather than treating
"i18n testing" as one vague check. First: does locale-aware formatting
(numbers, dates, currency) actually render per that locale's real
conventions? I test this by calling the real platform formatting API
(Node's `Intl`) for several real locales and confirming the outputs
genuinely differ — not by hand-writing expected strings, which risks
encoding my own assumptions instead of the real behavior. Second: does
non-ASCII text survive storage and retrieval unchanged? I test that
with a real round-trip through the real database using deliberately
varied scripts — Turkish, Japanese, an emoji outside the Basic
Multilingual Plane, and right-to-left Arabic — because each stresses a
different real failure mode (case-folding, non-Latin collation, 4-byte
UTF-8 boundaries, bidirectional text).

## "You found a mismatch in your i18n test — was that a bug in your code?"

No, and that distinction matters. My first currency-formatting test
hard-typed the expected German-locale output with a regular space
before the euro sign. It failed against the real `Intl.NumberFormat`
call, which actually uses a non-breaking space in that exact position.
That's not a bug in the formatter — it's a real detail of German ICU
currency conventions that my hand-typed assumption got wrong. I fixed
the test to assert the real character, not the API. The lesson I took
from it: when testing against a real platform API, the expected value
has to come from observing the real output, not from typing what looks
right.

## "What's actually different about testing Server-Sent Events versus a normal REST endpoint?"

A REST test proves one request got one correct response. An SSE test
has to prove something a buffered response never needs to demonstrate:
that events genuinely arrive progressively, over real time, as they
happen — not all collected and sent at once right before the connection
closes. I proved this concretely in my lab by timestamping each event
as my client parsed it off the real streamed bytes, then asserting the
real gap between consecutive timestamps matched the server's configured
delay. If I'd only asserted on the final collected array of events, the
test would have passed identically whether the server streamed them or
buffered them — which would have proven nothing about the actual
protocol behavior.

## "How would you test that a client correctly reconnects to a stream after a dropped connection?"

By testing the real mechanism SSE defines for exactly this: the
`Last-Event-ID` header. A real client reconnecting sends the id of the
last event it actually received; a correct server resumes from there
rather than replaying everything. I built my lab's server to honor that
header for real, and proved it concretely — reconnecting with
`Last-Event-ID: 2` against a real 4-event stream returned exactly events
3 and 4, never a full replay and never an empty response from
misreading the header.

## "What's the difference between a health check and a synthetic monitor?"

A health check usually answers one narrow question — "is the process
up?" A synthetic monitor runs a small set of real, representative
requests against real endpoints (health, a real login, a real data
read) and times each one against a disclosed latency budget, so it can
distinguish three outcomes a single health check collapses into one:
genuinely down, succeeding but too slow, and genuinely healthy. I built
that three-way classification deliberately — my lab's monitor reports
`PASS`, `SLOW`, or `FAIL` per check, and I have a test proving a slow
check is still reported as functionally OK (`ok: true`), not conflated
with a failure.

## "Why would you retry some failed checks but not others?"

Because retrying only helps the failure mode it can actually fix — a
transient blip on an otherwise-healthy service. I specifically chose
not to retry a `SLOW` result in my synthetic monitor: retrying it either
hides the real latency signal (if a later attempt happens to land
faster) or just delays reporting what the monitor already knows, with
no actual improvement. My retry helper is scoped to real connection
failures only, and I have tests proving both boundaries — it gives up
after exhausting its budget on a persistent failure, and it returns
immediately the moment a real attempt succeeds, rather than wasting its
full retry budget unnecessarily.
