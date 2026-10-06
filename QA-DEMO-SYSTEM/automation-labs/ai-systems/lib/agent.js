'use strict';

// Deterministic tool-calling agent for QA testing purposes.
//
// A tiny, fully deterministic "agent loop": given a task, it selects one
// tool from a fixed registry by keyword match, validates the tool's
// arguments against that tool's own JSON schema (via schema-validator),
// executes the tool (real local functions — no network), and terminates
// either on success or after a bounded step count. This proves the QA
// techniques (tool-selection correctness, argument validation, bounded
// termination, failure handling) without needing a real LLM to decide
// anything — the decision logic itself is a fixture, exactly like the
// mock provider.
// TR: Sabit bir kayıt defterinden anahtar kelime eşleşmesiyle bir araç
// seçen, o aracın argümanlarını KENDİ JSON şemasına göre doğrulayan,
// aracı çalıştıran (gerçek yerel fonksiyonlar — ağ çağrısı yok) ve ya
// başarıyla ya da sınırlı bir adım sayısından sonra sonlanan küçük,
// tamamen deterministik bir "agent loop".

const { validateStructuredOutput } = require('./schema-validator');

const MAX_STEPS = 5;

const TOOL_REGISTRY = {
  'lookup_product_stock': {
    description: 'Looks up stock_quantity for a named product from the local product fixture.',
    argsSchema: {
      type: 'object',
      required: ['productName'],
      properties: { productName: { type: 'string', minLength: 1 } },
      additionalProperties: false,
    },
    // Real local execution — no network call, deterministic against a
    // fixed in-memory fixture (mirrors the seeded QA-DEMO-SYSTEM products).
    execute({ productName }) {
      const catalog = { 'QA Demo Klavye': 25, 'QA Demo Mouse': 0 };
      if (!(productName in catalog)) {
        return { found: false, stock_quantity: null };
      }
      return { found: true, stock_quantity: catalog[productName] };
    },
  },
  'add_numbers': {
    description: 'Adds two numbers.',
    argsSchema: {
      type: 'object',
      required: ['a', 'b'],
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      additionalProperties: false,
    },
    execute({ a, b }) {
      return { sum: a + b };
    },
  },
};

function selectTool(task) {
  if (/stock/i.test(task)) return 'lookup_product_stock';
  if (/add|sum/i.test(task)) return 'add_numbers';
  return null;
}

/**
 * Runs the bounded agent loop. Returns a trace of every step taken —
 * this trace IS the evidence the agent-testing tests assert against,
 * not just a final answer.
 */
function runAgent(task, toolCallArgsText) {
  const trace = [];
  const toolName = selectTool(task);
  if (!toolName) {
    trace.push({ step: 1, event: 'NO_TOOL_MATCHED', task });
    return { trace, terminated: 'no_tool_matched', result: null };
  }

  const tool = TOOL_REGISTRY[toolName];
  trace.push({ step: 1, event: 'TOOL_SELECTED', tool: toolName });

  const { valid, errors, parsed } = validateStructuredOutput(toolCallArgsText, tool.argsSchema);
  if (!valid) {
    trace.push({ step: 2, event: 'TOOL_ARGS_INVALID', errors });
    return { trace, terminated: 'invalid_arguments', result: null };
  }
  trace.push({ step: 2, event: 'TOOL_ARGS_VALID', args: parsed });

  const result = tool.execute(parsed);
  trace.push({ step: 3, event: 'TOOL_EXECUTED', result });
  trace.push({ step: 4, event: 'TERMINATED_SUCCESS' });

  return { trace, terminated: 'success', result };
}

/**
 * Proves bounded termination: an agent that never reaches a terminal
 * condition must still stop at MAX_STEPS, never loop forever. Used by
 * the "agent loops / termination conditions" test.
 */
function runUnboundedLoopSimulation() {
  const trace = [];
  for (let step = 1; step <= MAX_STEPS + 50; step += 1) {
    if (step > MAX_STEPS) {
      trace.push({ step, event: 'MAX_STEPS_EXCEEDED_FORCED_TERMINATION' });
      return { trace, terminated: 'max_steps_exceeded' };
    }
    trace.push({ step, event: 'STEP_WITH_NO_PROGRESS' });
  }
  // unreachable, but keeps the function's contract explicit
  return { trace, terminated: 'unexpected' };
}

module.exports = { TOOL_REGISTRY, selectTool, runAgent, runUnboundedLoopSimulation, MAX_STEPS };
