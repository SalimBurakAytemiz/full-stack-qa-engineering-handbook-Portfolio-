# Agent and Tool-Calling Testing

**Executable evidence:** `ai-systems/tests/agent.test.js`,
`ai-systems/lib/agent.js`.

## What an "agent" adds over a single prompt/response call

An agent selects and invokes tools (functions) based on the task, rather
than just returning text. This introduces failure modes that plain
prompt testing doesn't cover:

1. **Wrong tool selected** for the task.
2. **Malformed or unsafe arguments** passed to a real tool call.
3. **No bounded termination** — a naive agent loop that keeps "trying
   again" on failure can run forever (or until some external timeout),
   burning cost and never surfacing a clear failure.

`lib/agent.js` implements a small, fully deterministic agent:

- `TOOL_REGISTRY` — two example tools, `lookup_product_stock` and
  `add_numbers`, each with argument validation.
- `selectTool(task)` — rule-based tool selection from the task text.
- `runAgent(task)` — selects a tool, validates arguments *before*
  executing, executes, and returns a structured result.
- `runUnboundedLoopSimulation()` — a deliberately-constructed scenario
  with `MAX_STEPS = 5` that proves the loop is force-terminated at the
  step limit rather than running forever, even when "progress" never
  actually happens.

## Test coverage and what each case proves

- **Tool selection:** a stock-related task selects the stock lookup
  tool — proves selection logic works for the intended case.
- **Valid arguments:** execute and terminate successfully — the happy
  path.
- **Invalid arguments are rejected before execution, not passed through
  silently** — this is the test that matters most: an agent that
  validates arguments *after* a side-effecting call has already fired
  is not actually safe, no matter what the validation logic says. The
  test asserts rejection happens pre-execution.
- **No matching tool:** the agent terminates explicitly rather than
  guessing at an unregistered tool — an agent that silently no-ops or
  invents a tool call is a worse failure than one that says "I don't
  know how to do this."
- **Unknown product lookup returns `found: false`, not a fabricated
  stock number** — the tool-calling equivalent of the RAG
  hallucination-avoidance test in
  `03-STRUCTURED-OUTPUT-AND-RAG-TESTING.md`: absence of data must never
  become an invented answer.
- **Bounded termination:** an agent loop with no progress is
  force-terminated at the step limit, never runs forever — proven by
  actually running `runUnboundedLoopSimulation()` to its limit and
  asserting it stops there, not by inspecting the `MAX_STEPS` constant.

## Why "terminates explicitly" is tested as its own case

A common, incomplete version of agent testing only checks the happy
path (task → correct tool → correct result). The real QA risk in
agentic systems is almost always at the boundary: what happens when the
task doesn't match any tool, when arguments are malformed, or when the
loop doesn't naturally converge. Each of those three boundaries has its
own explicit test here rather than being left as an assumed side effect
of the happy-path test passing.

## What a real multi-step, multi-tool agent would add on top of this

Real agents typically chain multiple tool calls, handle tool-call
failures with retries or fallback strategies, and reason over
intermediate results. This lab's agent is intentionally single-step
(one tool call per task) — deep multi-step planning and chained tool
calls are not implemented or claimed here.
