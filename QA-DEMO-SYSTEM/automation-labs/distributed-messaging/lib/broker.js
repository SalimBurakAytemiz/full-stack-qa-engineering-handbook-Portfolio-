'use strict';

// A minimal, in-process, hand-rolled message broker — NOT Kafka,
// RabbitMQ, or SQS. No persistence, no network, no partitions, no
// consumer groups: a single global, synchronous, ordered delivery log
// per topic. It exists to prove three real distributed-messaging QA
// concerns with real, observable behavior: ordering, at-least-once
// delivery with redelivery on consumer failure, and dead-letter
// routing once retries are exhausted.
// TR: GERÇEK bir Kafka/RabbitMQ/SQS DEĞİLDİR — kalıcılık, ağ, partition
// veya consumer group yoktur. Her topic için senkron, sıralı, tekil bir
// teslim günlüğüdür. Amacı üç gerçek dağıtık-mesajlaşma kavramını
// GERÇEK, gözlemlenebilir davranışla kanıtlamaktır: sıralama, en-az-bir
// kez teslim (consumer başarısız olursa yeniden teslim) ve retry'lar
// tükendiğinde dead-letter'a yönlendirme.

function createBroker() {
  const topics = new Map();
  const deliveryLog = [];
  let sequence = 0;

  function getTopic(topic) {
    if (!topics.has(topic)) topics.set(topic, { subscribers: [], deadLetters: [] });
    return topics.get(topic);
  }

  function publish(topic, message) {
    sequence += 1;
    const envelope = {
      id: message.id || `${topic}-msg-${sequence}`,
      key: message.key,
      payload: message.payload,
    };
    const t = getTopic(topic);
    for (const sub of t.subscribers) {
      deliverWithRetry(topic, t, sub, envelope);
    }
    return envelope.id;
  }

  function deliverWithRetry(topic, t, sub, envelope) {
    const maxRetries = sub.maxRetries ?? 3;
    let attempt = 0;
    // No real backoff timer between attempts — a deliberate scope choice
    // for deterministic, fast tests. See README.md "Scope boundary".
    while (attempt <= maxRetries) {
      attempt += 1;
      deliveryLog.push({ topic, subscriberId: sub.id, messageId: envelope.id, attempt });
      try {
        sub.handler({ id: envelope.id, key: envelope.key, payload: envelope.payload });
        return;
      } catch (err) {
        if (attempt > maxRetries) {
          t.deadLetters.push({
            messageId: envelope.id,
            topic,
            payload: envelope.payload,
            error: err.message,
            attempts: attempt,
          });
          return;
        }
      }
    }
  }

  function subscribe(topic, handler, options = {}) {
    const t = getTopic(topic);
    const id = options.id || `sub-${t.subscribers.length}`;
    t.subscribers.push({ id, handler, maxRetries: options.maxRetries });
    return id;
  }

  function getDeadLetterQueue(topic) {
    return getTopic(topic).deadLetters;
  }

  function getDeliveryLog() {
    return deliveryLog;
  }

  return { publish, subscribe, getDeadLetterQueue, getDeliveryLog };
}

module.exports = { createBroker };
