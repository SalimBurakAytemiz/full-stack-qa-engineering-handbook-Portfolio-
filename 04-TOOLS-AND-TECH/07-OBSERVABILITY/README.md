# Observability Tools

## Correlation-ID / Structured Logging (T4 CI_VERIFIED)

**Concepts:** every request gets a unique ID attached at the earliest
possible middleware point, echoed in the response header, and included
in every log line the request produces — turning "find every log line
related to this one user complaint" from a guessing exercise into a
direct lookup.

**Setup:** `QA-DEMO-SYSTEM/backend/src/middleware/requestContext.js`.

**Real findings in this repository's own history:** (1) reading
`req.path` lazily inside an async `finish` handler logged the WRONG
value due to Express's router path-stripping behavior — fixed by
capturing `req.originalUrl` synchronously up front; (2) a malformed
query string's key could crash the redaction helper itself via an
unguarded `decodeURIComponent` — fixed with a `safeDecodeURIComponent`
fail-closed wrapper, because a logging concern must never be able to
turn a 200 into a 500.

**Related labs:** `QA-DEMO-SYSTEM/backend/tests/observability.test.js`.

## Elastic (T1 DOCUMENTED — professional practice, not repository practice)

**Concepts:** centralized log aggregation/search, the usual real-world
tool behind "search logs by correlation ID across many service
instances" once a system outgrows grep-on-one-box.

**Status here:** no Elastic stack exists in any environment this
repository was built in — correlation-ID logging above is this
repository's real, executable equivalent of the same QA discipline.

## OpenTelemetry / Jaeger (T0 INDEXED)

Named in the target catalog; not attempted — a documented gap.
