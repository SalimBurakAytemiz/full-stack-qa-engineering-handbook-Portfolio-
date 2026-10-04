# API Idempotency-Key Replay-Safety & Rate Limiting

**Executable labs:**
`QA-DEMO-SYSTEM/automation-labs/idempotency-testing/` (9 unit tests +
a real aggregate run proving a real `Idempotency-Key` HTTP server
guarantees a side effect runs exactly once per key, including under a
genuine 10-way concurrent race) and
`QA-DEMO-SYSTEM/automation-labs/rate-limiting/` (8 unit tests + a real
aggregate run proving a real token-bucket limiter backing a real HTTP
server accepts within capacity, rejects over capacity with a real
`429`, and genuinely refills over real elapsed time via an injected
fake clock).

## Scope boundary — read this first

Idempotency-key replay-safety here means an in-memory store keyed by a
client-supplied key, proven safe under genuine concurrent racing
requests — not a production-grade persistent store (Redis, a
unique-constrained database table) that would survive a process
restart or be shared across multiple server instances. Rate limiting
here means a single shared token-bucket counter proven against a real
HTTP server — not per-client/per-API-key/per-IP limiting middleware,
which a real multi-tenant API would need. Each lab's own `README.md`
"Scope boundary" section states this in full.

## Two real findings this milestone

1. **A genuine concurrency proof, not just a sequential replay.** The
   idempotency lab doesn't just prove that replaying the same key
   twice in a row is safe — it fires 10 real concurrent HTTP requests
   with the same brand-new key via `Promise.all` and proves exactly
   one real order and exactly one real side-effect increment resulted.
   A store that only checked "does this key exist yet?" before acting
   would pass the sequential test and fail this one; storing the
   in-flight **promise itself** per key is what makes the concurrent
   case safe too. See `01-API-IDEMPOTENCY-KEY-TESTING.md`.
2. **A real validation bug caught by a real test run, not invented
   for this document.** The token bucket's first draft rejected a
   `refillRatePerMs` of exactly `0`, which is actually a legitimate
   configuration (a one-time allowance that never refills). Running
   the real unit tests produced two real failures before the fix. See
   `COMMON-MISTAKES.md` for the full account, and
   `02-RATE-LIMITING-AND-ABUSE-TESTING.md` for the design rationale.

## Documents in this subfolder

| Doc | Covers |
|---|---|
| `01-API-IDEMPOTENCY-KEY-TESTING.md` | Idempotency store design, the in-flight-promise concurrency guarantee, the real 10-way race proof |
| `02-RATE-LIMITING-AND-ABUSE-TESTING.md` | Token-bucket design vs. fixed-window, the real 429/refill proof, the real validation-bug finding |
| `COMMON-MISTAKES.md` | Real mistakes found and fixed while building these exact labs |
| `INTERVIEW-QUESTIONS.md` | Interview-ready Q&A, honest about repository-practice vs. professional-experience scope |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for the
competencies this area adds — every one has `professional: {status: NONE}`
unless an existing, independent professional source proves otherwise.
