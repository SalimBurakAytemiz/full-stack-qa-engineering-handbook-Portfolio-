# Service Virtualization & Consumer-Driven Contract Testing

**Executable evidence:** `service-virtualization/lib/stub-server.js`,
`service-virtualization/lib/contract.js`,
`service-virtualization/fixtures/contracts.js`,
`service-virtualization/tests/*.test.js`.

## Why service virtualization

You can't always exercise a dependency directly in a test — it might
be a third-party service you don't control, too expensive to call
repeatedly, or too slow to run thousands of times in CI. Service
virtualization replaces it with a controllable double that speaks the
same protocol (real HTTP, real request/response shapes) but whose
behavior you fully own.

## Request matching and the "loud failure" principle

`lib/stub-server.js` registers request matchers (method, path,
body-substring, or an arbitrary matcher function) against canned
responses. The single most important design decision in a
virtualization tool — and the one this lab's own tests specifically
prove — is what happens when nothing matches: a naive stub server that
defaults to `200 {}` on an unmatched request silently hides a real bug
(your code called the wrong endpoint, or with the wrong shape, and the
test passed anyway). This lab's stub server instead returns a real
`501` with a diagnostic body (`NO_STUB_REGISTERED`) and records every
unmatched request for inspection — `tests/stub-server.test.js` asserts
this explicitly, not just the happy-path canned-response case.

## Stateful scenarios

Real dependencies aren't always stateless — a payment gateway might
return "pending" on the first poll, "processing" on the second, and
"approved" on the third. `stub()` accepts either a single response or
an ordered sequence; the stub server advances through it per matching
call and holds on the last entry once reached. This is a simplified
version of WireMock's "scenario" state machine, real and tested
(`tests/stub-server.test.js`'s sequenced-stub case).

## Consumer-driven contract testing

A contract is a shared, machine-checkable definition of what a
consumer expects from a provider's response shape. `lib/contract.js`
wraps ajv (JSON Schema) to define and verify one. The discipline that
makes this genuinely "consumer-driven contract testing" and not just
"schema validation" is using **the exact same contract definition** on
both sides:

- **Consumer side** (`tests/consumer-contract.test.js`): the stub
  server returns a virtualized response, and the SAME contract
  (`fixtures/contracts.js`) verifies it — proving the consumer's own
  test setup matches what it claims to expect.
- **Provider side**
  (`tests/provider-contract-verification.test.js`): the real, running
  backend's actual response is verified against the identical contract
  — real integration testing, not a fixture.

If both pass, the consumer's documented expectations and the
provider's real behavior are verifiably in agreement — a genuine
schema drift (the provider adds/removes/retypes a field) would fail
the provider-side test even though nothing about the consumer's own
code changed, which is exactly the failure mode contract testing exists
to catch early, before it reaches integration or production.

## What real Pact/WireMock usage would add on top of this

A production Pact setup typically publishes contracts to a broker so
provider teams can verify against consumer-published expectations
independently and asynchronously (no shared codebase required), and
WireMock proper supports JSON-path/XPath body matching, fault
injection, and a full admin API. None of that is implemented here —
this lab covers the core verification discipline both tools are built
around.
