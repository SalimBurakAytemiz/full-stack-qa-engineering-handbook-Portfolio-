# Learning Paths

Concrete, ordered next-steps for a QA engineer growing into a
specialization — built directly from this repository's own registry
rather than a generic curriculum, so every recommendation traces to a
real, tracked gap (`01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml`)
instead of a plausible-sounding list.

## How to read these paths

Each path lists: what this repository already demonstrates for that
specialization (real, checkable), then the specific next gaps to close,
each with its real `gap.*` id so progress can be tracked in the
registry rather than a separate personal notes file.

## Path: API / SDET

**Already demonstrated here**: REST, GraphQL, and WebSocket testing in
one codebase (`QA-DEMO-SYSTEM/backend/tests`); contract testing with
Postman/Newman/AJV (`04-TOOLS-AND-TECH/01-API-AND-CONTRACT/`); GraphQL
and WebSocket/event contract-drift detection
(`shared/contracts/README.md`).

**Next**: `gap.contract-testing.pact` (consumer-driven contract
testing — this repository's drift-detection approach is schema-snapshot
based, not consumer-driven; Pact is a different, complementary
technique worth learning next). `gap.messaging.kafka` /
`gap.messaging.rabbitmq` (this repository's event system is a
single-process analog — see `08-SOFTWARE-ARCHITECTURE-FOR-QA/README.md`'s
event-driven section — real message-queue testing is a genuine next
step, not something this repository can teach on its own).

## Path: Performance Engineering

**Already demonstrated here**: JMeter with a real fail-gate wrapper
that doesn't trust the tool's own exit code (`04-TOOLS-AND-TECH/04-PERFORMANCE/`);
Locust load testing, run for real this session (280 requests, 0
failures — `.ai/TEST-STATUS.md`).

**Next**: `gap.performance.k6` and `gap.performance.gatling` — two
different tools with different scripting models (k6's JS-based,
Gatling's Scala DSL) worth comparing against JMeter's GUI-first,
XML-plan model once the current tools are solid.

## Path: Security-Aware QA

**Already demonstrated here**: OWASP API Security Top 10 mapping
review, IDOR/BOLA-oriented test cases in the backend suite
(`04-TOOLS-AND-TECH/08-SECURITY/`).

**Next**: `gap.security.burp-suite` and `gap.security.owasp-zap` —
this repository's security testing is manual review, not automated
scanning; both tools would add real, repeatable scan coverage this
repository currently lacks. `gap.security.owasp-api-top10-depth` — the
mapping exists at survey depth, not yet at "wrote an exploit for each
category" depth.

## Path: Mobile QA

**Already demonstrated here**: real professional Appium execution and
result analysis (`01-SALIM-BURAK-DIGITAL-TWIN/registry/professional-experience.yaml`);
general mobile QA strategy documentation
(`09-MOBILE-QA/README.md`).

**Next**: `gap.appium.repo-device-evidence` — no real device/emulator
infrastructure exists in this environment, which is the single largest
gap in this path; `gap.appium.framework-from-scratch` — professional
execution exists, authoring a framework from scratch professionally
does not. This is the path where the gap is infrastructural, not
knowledge-based — closing it requires an environment this repository's
own build sessions have never had access to, not more reading.

## Path: Observability / SRE-adjacent QA

**Already demonstrated here**: Elastic-based log analysis and RCA
(professional experience); correlation-ID logging tested in this
repository's own backend suite (`observability.test.js`).

**Next**: `gap.observability.opentelemetry` and
`gap.observability.jaeger` — this repository's observability is
log-based; distributed tracing is a genuinely different technique
(`gap.observability.distributed-tracing`) worth learning once
multi-service architecture (see `08-SOFTWARE-ARCHITECTURE-FOR-QA/README.md`)
is also in scope, since tracing's value is proportional to how many
services a request crosses.

## Path: QA Leadership / Strategy

**Already demonstrated here**: `21-QA-LEADERSHIP/README.md`'s real
examples of quality-gate design and ship/no-ship documentation, drawn
from this repository's own decisions.

**Next**: no `gap.*` entry applies here — this path grows through
practice (owning a real team's strategy) more than through a specific
tool or technique, which is itself a real distinction from the other
paths above, not an omission.

## Certification

`gap.certification.istqb` — no certification is claimed anywhere in
this repository (Section 39: no completed certification is invented);
ISTQB is recorded as a real, planned future target in
`01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml`, not claimed as done.
