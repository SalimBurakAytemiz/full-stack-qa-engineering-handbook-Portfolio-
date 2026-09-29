'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { runAgent, runUnboundedLoopSimulation, selectTool, MAX_STEPS } = require('../lib/agent');

test('agent tool selection: a stock-related task selects the stock lookup tool', () => {
  assert.equal(selectTool('Check the stock for this item'), 'lookup_product_stock');
  assert.equal(selectTool('Add these two numbers'), 'add_numbers');
  assert.equal(selectTool('Tell me a joke'), null);
});

test('agent tool calling: valid arguments execute the tool and terminate successfully', () => {
  const { trace, terminated, result } = runAgent('Check the stock', '{"productName": "QA Demo Klavye"}');
  assert.equal(terminated, 'success');
  assert.deepEqual(result, { found: true, stock_quantity: 25 });
  assert.ok(trace.some((t) => t.event === 'TOOL_SELECTED'));
  assert.ok(trace.some((t) => t.event === 'TOOL_EXECUTED'));
});

test('agent tool calling: invalid arguments are rejected before execution, not passed through silently', () => {
  const { terminated, result, trace } = runAgent('Check the stock', '{"wrongField": 123}');
  assert.equal(terminated, 'invalid_arguments');
  assert.equal(result, null, 'a tool must never execute with invalid arguments');
  assert.ok(trace.some((t) => t.event === 'TOOL_ARGS_INVALID'));
});

test('agent tool calling: a task with no matching tool terminates explicitly rather than guessing', () => {
  const { terminated, result } = runAgent('Tell me a joke', '{}');
  assert.equal(terminated, 'no_tool_matched');
  assert.equal(result, null);
});

test('agent tool calling: a lookup for an unknown product returns found:false, not a fabricated stock number', () => {
  const { result } = runAgent('Check the stock', '{"productName": "Nonexistent Product"}');
  assert.deepEqual(result, { found: false, stock_quantity: null });
});

test('agent termination: an agent loop with no progress is force-terminated at the bounded step limit, never runs forever', () => {
  const { trace, terminated } = runUnboundedLoopSimulation();
  assert.equal(terminated, 'max_steps_exceeded');
  assert.ok(trace.length <= MAX_STEPS + 1, `trace must be bounded, got ${trace.length} steps`);
  assert.equal(trace[trace.length - 1].event, 'MAX_STEPS_EXCEEDED_FORCED_TERMINATION');
});
