# Distributed Messaging Lab — Execution Evidence

**Date:** 2026-10-02
**Environment:** sandbox container.

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/distributed-messaging/tests/broker.test.js automation-labs/distributed-messaging/tests/idempotent-consumer.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `broker.test.js`: `1..5 / # pass 5 / # fail 0`.
`idempotent-consumer.test.js`: `1..3 / # pass 3 / # fail 0`. Exit code `0`.

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/distributed-messaging/run-distributed-messaging-lab.js`
(from `QA-DEMO-SYSTEM/automation-labs/`).

**Actual observed output:**
```
--- Distributed Messaging Lab: real scenario results ---
  [PASS] ordering within a key is preserved (["created","paid","shipped","delivered"])
  [PASS] a permanently-failing message lands in the dead-letter queue after exhausting retries ([{"messageId":"poison-1","topic":"notifications","payload":"bad","error":"always fails","attempts":3}])
  [PASS] non-idempotent consumer double-applies under retry (proves the bug is real) (appliedCount=2)
  [PASS] idempotent consumer applies exactly once despite the same retry (proves the fix) (appliedCount=1)

DISTRIBUTED_MESSAGING_LAB_STATUS: EXECUTED
```
Exit code `0`.

## What this run actually proves

- Ordering: four messages published for the same key were received by
  the handler in exactly the order they were published.
- Dead-letter routing: a handler that always throws exhausted its
  `maxRetries: 2` budget (3 total attempts observed) and the message was
  routed to the dead-letter queue with the real error message and
  attempt count attached.
- The core lesson: the exact same simulated failure (side effect runs,
  then the handler throws — modeling "crashed after doing the work, before
  acknowledging") was run through both consumer implementations. The
  non-idempotent one applied its side effect twice (`appliedCount=2`) —
  a real, observed double-application bug, not a claim. The idempotent
  one, differing only in a dedup check, applied it exactly once
  (`appliedCount=1`).

## Scope and honesty notes

- `lib/broker.js` is a minimal, hand-rolled, in-process broker — not
  Kafka/RabbitMQ/SQS. No persistence, no network, no partitions, no real
  backoff delay. See `README.md`'s "Scope boundary" section.
- Not yet CI-verified as of this file's writing — CI wiring is a separate,
  explicitly tracked step (see `.github/workflows/ci.yml`'s
  `distributed-messaging-lab` job once added).
