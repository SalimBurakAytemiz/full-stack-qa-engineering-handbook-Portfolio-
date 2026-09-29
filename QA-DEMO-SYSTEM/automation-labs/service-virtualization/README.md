# Service Virtualization & Contract Testing Lab

Part of `automation-labs`. This lab proves two related QA techniques:
service virtualization (a real, WireMock-style stub server for
dependencies you don't control or can't safely exercise directly) and
consumer-driven contract testing (verifying that a consumer's
documented expectations and a provider's real behavior genuinely
agree).

## Scope boundary — read this first

`lib/stub-server.js` is a real HTTP server your own code, not WireMock
or a similar commercial/open-source tool — it demonstrates the
technique (request matching, canned/sequenced responses, unmatched-
request verification) at a genuinely working but deliberately smaller
scope (no JSON-path body matching, no record/playback, no admin API).

`lib/contract.js` is a minimal, real contract verifier built on ajv
(JSON Schema — already a real dependency of this workspace, reused
rather than adding the Pact library itself, consistent with this
repository's dependency-bloat-avoidance principle). It proves the
genuine consumer-driven-contract-testing discipline — one contract,
checked on both the consumer and provider side — without claiming
Pact's full feature set (no pact-broker integration, no matcher DSL
beyond JSON Schema).

**The contract verification is real, both directions**:
`consumer-contract.test.js` verifies a virtualized double against the
contract; `provider-contract-verification.test.js` verifies the REAL,
running backend's actual response against the exact same contract
definition (`fixtures/contracts.js`) — not two independently-drifting
schemas that happen to look similar.

## Running

From `QA-DEMO-SYSTEM/automation-labs/`:

```bash
npm run virtualization:test:unit   # stub server + consumer-side contract verification — no real backend needed
npm run virtualization:test        # aggregate runner (run-virtualization-lab.js) — CI entry point
```

The aggregate runner always runs the consumer-side checks first (no
server needed). It then checks whether a backend is reachable at
`QA_DEMO_BASE_URL` (default `http://127.0.0.1:3000`) and, if so, also
runs the real provider-verification test. If not, it reports
`VIRTUALIZATION_LAB_PROVIDER: NOT_EXECUTED` explicitly.

To exercise the full lab locally:
```bash
# from QA-DEMO-SYSTEM/
npm run db:seed
node backend/src/server.js &
QA_DEMO_BASE_URL=http://127.0.0.1:3000 npm run virtualization:test --workspace automation-labs
```

## What each file proves

| File | QA technique |
|---|---|
| `lib/stub-server.js` | Real request matching (method/path/body-substring), canned + stateful/sequenced responses, and — the core service-virtualization discipline — an unmatched request is a loud, real failure (501), never a silent 200 |
| `lib/contract.js` | The contract-verification machinery itself (ajv-based) |
| `fixtures/contracts.js` | The actual contracts, defined once, shared by both sides |
| `tests/stub-server.test.js` | The stub server's own real behavior, including a genuine negative case (unmatched request) |
| `tests/consumer-contract.test.js` | Consumer-side verification against a virtualized double, including a deliberately-broken response proving the verifier catches a real violation |
| `tests/provider-contract-verification.test.js` | **Real integration**: the same contracts verified against the actual running backend |

## Digital Twin linkage

See `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` for
the competencies this lab backs. `professional: {status: NONE}` unless
independently proven otherwise.
