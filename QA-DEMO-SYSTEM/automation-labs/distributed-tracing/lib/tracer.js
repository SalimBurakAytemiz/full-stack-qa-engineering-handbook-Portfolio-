'use strict';

// A real, hand-rolled tracer. It records every real started/ended
// span into a shared in-memory collector, so a test can assert the
// genuine shape of the resulting span tree (parent/child links,
// causal start-time ordering) instead of trusting that the code
// "must" have propagated context correctly.
// TR: Her gerçek başlatılan/bitirilen span'i paylaşılan, bellek-içi
// bir kolektöre kaydeder — böylece bir test, sonuçtaki span ağacının
// gerçek şeklini (ebeveyn/çocuk bağlantıları, nedensel başlangıç-
// zamanı sıralaması) doğrulayabilir.

const { newTraceId, newSpanId } = require('./trace-context');

function createTracer({ collector, now = Date.now } = {}) {
  if (!collector || typeof collector.record !== 'function') {
    throw new TypeError('createTracer() requires a collector with a record(span) method');
  }

  function startSpan(name, { traceId, parentSpanId } = {}) {
    const span = {
      traceId: traceId || newTraceId(),
      spanId: newSpanId(),
      parentSpanId: parentSpanId || null,
      name,
      startTime: now(),
      endTime: null,
    };

    function end() {
      if (span.endTime !== null) {
        throw new Error(`span ${span.spanId} (${span.name}) was already ended`);
      }
      span.endTime = now();
      collector.record({ ...span });
    }

    return { ...span, end };
  }

  return { startSpan };
}

function createInMemoryCollector() {
  const spans = [];
  return {
    record(span) {
      spans.push(span);
    },
    getSpans() {
      return spans.slice();
    },
    getTraceSpans(traceId) {
      return spans.filter((s) => s.traceId === traceId);
    },
  };
}

module.exports = { createTracer, createInMemoryCollector };
