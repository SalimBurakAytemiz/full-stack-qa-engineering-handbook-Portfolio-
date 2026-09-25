# Gap and Learning Transparency Questions

Answers sourced from `01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml`
(29 tracked gaps as of this transformation).

## "What don't you know that's relevant to this role?"

Named directly, not hedged: no professional or repository practice with
k6, Gatling, Burp Suite, OWASP ZAP, OpenTelemetry, Jaeger, Kafka,
RabbitMQ, Pact/consumer-driven contract testing, or feature-flag/
canary/blue-green release testing. Each is a real `gap.*` entry, not an
afterthought — see `09-GAP-AND-LEARNING-MAP.md`.

## "Why doesn't this repository have real Appium device automation?"

Because faking it would violate the repository's own claim-integrity
rules. No real device/emulator infrastructure was ever available while
building this repository, so none was invented
(`gaps.yaml#gap.appium.repo-device-evidence`). The honest alternative —
a LEARNING document describing the strategy without pretending it ran —
is what exists instead.

## "Do you have any certifications?"

None completed. `gaps.yaml#gap.certification.istqb` records ISTQB as a
planned future target, not a completed one — Section 39 of the
transformation spec explicitly forbids inventing a completed
certification.

## "How do you decide what to learn next?"

Directly from the gap list's `types` field (KNOWLEDGE, PROFESSIONAL_EXPOSURE,
PRACTICE, EVIDENCE, CERTIFICATION, DOMAIN, TOOL_DEPTH) — a gap tagged
PRACTICE (e.g. k6, Gatling) means the concept is understood but not yet
built; one tagged PROFESSIONAL_EXPOSURE (e.g. accessibility testing)
means it exists in repository code but was never done on a real project.
That distinction, not a flat "TODO list," drives what to prioritize.
