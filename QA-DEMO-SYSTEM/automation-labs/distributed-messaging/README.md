# Distributed Messaging Lab

Real tests of three distributed-messaging QA concerns — ordering,
at-least-once delivery with redelivery, and dead-letter routing — plus a
real, observable demonstration of the single most common bug this
delivery model causes: a non-idempotent consumer double-applying a side
effect under retry.

## What this lab actually does

`lib/broker.js` is a minimal, hand-rolled, in-process pub/sub broker:
`publish(topic, message)` delivers synchronously, in order, to every
subscriber of that topic; a subscriber whose handler throws is retried
up to `maxRetries` times, and if it still fails, the message is routed to
that topic's dead-letter queue with the real error message and attempt
count attached.

`lib/idempotent-consumer.js` provides two real handlers over the exact
same simulated failure shape (the side effect runs, *then* the handler
throws — modeling a consumer that crashes after doing the work but before
acknowledging the message, which is exactly why at-least-once delivery
exists and exactly why it can redeliver an already-processed message):
- `createNonIdempotentConsumer()` — applies the side effect unconditionally.
- `createIdempotentConsumer()` — checks a `processedIds` set before
  applying, so a redelivery of the same message id is a no-op.

`run-distributed-messaging-lab.js` runs one combined scenario and prints
real, observed PASS/FAIL per check — including running the **same**
failure scenario through both consumers side by side so the difference
in outcome is caused only by the dedup check.

## Scope boundary

This is not Kafka, RabbitMQ, SQS, or any real message broker. There is no
persistence, no network, no partitioning, no consumer groups, and no real
backoff delay between retries (retries happen immediately, for fast,
deterministic tests). What is real: the retry-on-failure control flow,
the dead-letter routing after exhausting retries, and — most
importantly — the actual double-application bug a non-idempotent
consumer has under this delivery model, observed by running real code,
not asserted from a diagram.

## Run it

```bash
# from QA-DEMO-SYSTEM/ — no backend server needed, fully in-process
node automation-labs/distributed-messaging/run-distributed-messaging-lab.js
node --test automation-labs/distributed-messaging/tests/broker.test.js automation-labs/distributed-messaging/tests/idempotent-consumer.test.js
```
