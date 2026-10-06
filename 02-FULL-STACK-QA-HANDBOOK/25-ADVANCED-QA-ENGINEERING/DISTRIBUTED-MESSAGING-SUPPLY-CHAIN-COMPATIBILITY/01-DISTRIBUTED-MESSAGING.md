# Distributed Messaging QA

## Why this matters for QA, not just backend engineering

Message-broker-based systems (event buses, queues, pub/sub) trade
simplicity for a specific set of correctness problems that a
request/response API test suite never has to think about: message
ordering, redelivery, and what happens to a message that can never be
processed successfully. Testing "the happy path publish/consume" proves
almost nothing about these systems — the real value of testing a
messaging system is proving what happens on the failure paths.

## The three concerns this lab actually tests

### 1. Ordering within a key

A consumer that processes `order.created`, `order.paid`,
`order.shipped` out of order can corrupt state even if every individual
message is eventually delivered. `tests/broker.test.js`'s first test
publishes four lifecycle events for the same key and asserts the
handler received them in exactly that order — a real, observed
guarantee of this lab's broker, not an assumption about any message
broker in general (most real brokers only guarantee order *within a
partition/key*, not globally — see the Scope boundary below).

### 2. At-least-once delivery, retries, and dead-letter queues

At-least-once delivery means a broker will redeliver a message until a
consumer acknowledges it — including redelivering a message the consumer
already fully processed, if it crashed (or merely failed to ack) after
doing the work. A consumer that fails every time cannot be retried
forever, so after a configured number of attempts it is routed to a
**dead-letter queue (DLQ)** — a separate place to inspect and reprocess
or discard poison messages — instead of either silently dropping it or
retrying indefinitely. `lib/broker.js`'s `deliverWithRetry` implements
exactly this: retry up to `maxRetries`, and on final exhaustion, push to
`getDeadLetterQueue(topic)` with the real error message and attempt count
attached — verified by `broker.test.js`'s DLQ tests.

### 3. The idempotent-consumer pattern — proven, not just described

At-least-once delivery is a deliberate trade-off: a broker that
guarantees at-most-once delivery would have to risk losing a message
rather than ever duplicate it, and most systems would rather risk a
duplicate than a loss. That shifts the responsibility onto the
**consumer**: if a message might arrive more than once, the consumer's
side effect must be safe to apply more than once — i.e. idempotent.

This lab proves this is not just a theoretical rule by running the
**exact same failure scenario** (the side effect runs, then the handler
throws — modeling "crashed after doing the work, before acknowledging")
through two real consumer implementations:

```js
// lib/idempotent-consumer.js (simplified)
function createNonIdempotentConsumer() {
  let appliedCount = 0;
  return {
    handle(envelope) {
      appliedCount += 1;           // <- runs on every attempt, every redelivery
      throw new Error('crash after side effect, before ack');
    },
    getAppliedCount: () => appliedCount,
  };
}

function createIdempotentConsumer() {
  let appliedCount = 0;
  const processedIds = new Set();
  return {
    handle(envelope) {
      if (processedIds.has(envelope.id)) return;   // <- the dedup check
      appliedCount += 1;
      processedIds.add(envelope.id);
      throw new Error('crash after side effect, before ack');
    },
    getAppliedCount: () => appliedCount,
  };
}
```

The real, observed result (`EXECUTION.md`): the non-idempotent consumer's
`appliedCount` ends at `2` (it really did double-apply under the retry);
the idempotent consumer's ends at `1` (the dedup check made the retry's
redelivery a no-op). The difference in outcome is caused by exactly one
line — the dedup check — isolated and proven, not asserted.

## Scope boundary

This lab's broker is intentionally minimal and in-process: no
persistence (a process restart loses all state), no network, no
partitioning, no consumer groups, and no real backoff delay between
retries (retries happen immediately for fast, deterministic tests). A
real broker like Kafka additionally guarantees ordering only *within a
partition*, exposes consumer-group rebalancing, and typically uses
exponential backoff with jitter for redelivery — none of which this lab
models. What is real and transferable: the retry-on-failure control flow,
the DLQ-after-exhaustion pattern, and — most importantly — the actual
double-application bug a non-idempotent consumer has under this delivery
model, which is the same bug a real Kafka/RabbitMQ/SQS consumer has if it
is not written to be idempotent.
