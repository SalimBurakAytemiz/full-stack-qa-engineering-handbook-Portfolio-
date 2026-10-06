# Common Mistakes (Real Ones, From Building These Labs)

## 1. Hard-coding an expected i18n string instead of asserting against the real API's real output

The i18n lab's first currency-formatting test hard-typed
`'1.234,50 €'` as the expected German-locale output — a regular space
before the euro sign, because that is what a human typing the string
would naturally write. The real run failed: `Intl.NumberFormat`'s actual
output uses a non-breaking space (`U+00A0`) in that position. This
is not a lab bug to work around — it is the real detail the test exists
to catch. The fix was to assert the real character
(`'1.234,50 €'`) rather than "fix" the real API's output to match
a hand-typed assumption. The broader lesson: when a test's job is to
verify a real platform API's output, the expected value must come from
observing that real output, never from typing what seems right.

## 2. Testing a streaming protocol by only checking the final collected result

An early version of the modern-protocols lab's test only asserted on
the final array of collected SSE events — correct content, correct
order, done. That assertion would pass identically whether the server
streamed the events over real time or buffered all of them and sent
them in one burst right before closing the connection — it proves
nothing about whether the delivery was actually progressive, which is
the entire point of testing a streaming protocol instead of a plain
JSON response. The fix was to record a real timestamp per event as the
client parses it and assert the real gap between consecutive timestamps
matches the server's configured delay — turning "the events arrived
correctly" into "the events arrived correctly, and over real time, not
batched."

## 3. Almost collapsing "failed" and "slow" into one boolean

A first draft of the production-verification lab's `timedCheck`
returned a plain `{pass: boolean}` — `false` for both a connection
failure and a successful-but-over-budget response. That would have
made a slow-but-healthy endpoint indistinguishable from a genuinely down
one, which is exactly the distinction a real synthetic monitor exists to
preserve (a slow endpoint might warrant a capacity warning; a down one
is an incident). The fix was a three-way `PASS`/`SLOW`/`FAIL`
classification, with a dedicated test proving a slow-but-successful
check still reports `ok: true` — functionally fine, just outside its
latency budget.

## 4. Retrying a result that retrying cannot actually fix

An early version of the production-verification lab retried every
non-`PASS` result uniformly, including `SLOW` ones. Retrying a slow
check doesn't address the real problem — if a later attempt happens to
land within budget, the monitor reports a false all-clear while the
real latency issue goes unrecorded; if it doesn't, the monitor just took
longer to report what it already knew. The retry helper was scoped to
transient failures only (a real connection hiccup that a `FAIL`, not a
`SLOW`, result represents), and the aggregate runner never retries a
`SLOW` classification — it is reported as-is, because hiding it would
defeat the entire purpose of measuring it.

## What these four have in common

Each mistake looks, at first glance, like a reasonable simplification:
type the string a human would expect, check only the end result, use
one boolean for "not good," retry anything that isn't a clean pass. In
every case the real fix was to trust the real signal over the
convenient assumption — the real `Intl` output, the real timing between
real events, the real distinction between down and slow, and the real
limits of what a retry can fix.
