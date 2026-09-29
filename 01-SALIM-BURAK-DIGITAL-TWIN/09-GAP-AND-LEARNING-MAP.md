# Gap & Learning Map

Source of truth: [`registry/gaps.yaml`](registry/gaps.yaml). Kept
visible on purpose — a gap list that shrinks over time only by real
new practice, not by quietly deleting entries.

Gap types (a gap can belong to more than one): **KNOWLEDGE**,
**PROFESSIONAL_EXPOSURE**, **PRACTICE**, **EVIDENCE**,
**CERTIFICATION**, **DOMAIN**, **TOOL_DEPTH**.

## Practice / tool-depth gaps

- Appium — from-scratch framework development (professional execution
  and analysis exist; building a framework from zero does not)
- Appium — real device/emulator repository-executable evidence (no
  such infrastructure has existed in any environment used so far)
- JMeter — from-scratch professional framework claim
- Docker — runtime execution depth (no daemon available in any prior
  environment)
- Systematic OWASP API Security Top 10 deep practice

## Professional-exposure gaps

- Selenium — professional project exposure (repository practice is
  real and CI-verified; professional use is not claimed)
- Playwright — professional project exposure (same pattern)
- Accessibility testing — professional project exposure

## Knowledge + practice gaps

- OpenTelemetry, Jaeger, distributed tracing (deep practice)
- Burp Suite, OWASP ZAP
- k6, Gatling
- Pact / consumer-driven contract testing
- Mock / service virtualization (deeper practice)
- Allure (from-scratch setup)
- SonarQube (deeper use)
- Kafka, RabbitMQ
- Cloud QA (depth)
- Feature Flags, Canary, Blue/Green deployment testing

## Domain gaps

- Insurance — professional exposure (used as a learning/domain example
  only, per an explicit rule against inventing this)
- Healthcare — professional exposure
- Telecom — professional exposure

## Certification

- ISTQB — planned, not completed. No certificate is claimed as held.

## Why this page exists

A repository can make gaps disappear by simply not writing them down.
This one does the opposite on purpose: every item above is something a
reviewer might reasonably assume is covered, and isn't (yet) — stated
plainly rather than discovered the hard way in an interview.
