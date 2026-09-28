# Tools & Technology

Source of truth for categorization: [`registry/tool-state.yaml`](registry/tool-state.yaml).
Source of truth for actual state (knowledge/professional/repository):
[`registry/competency-state.yaml`](registry/competency-state.yaml) — this
page only groups and links, it does not restate state independently
(one fact, one owner).

## API & Contract

Postman, Newman, AJV, JSON Schema (tools/technology) — GraphQL, REST,
WebSocket (protocols).

## Web Automation

Playwright, Selenium.

## Mobile Automation

Appium.

## Performance

JMeter, Locust. k6 and Gatling are gaps (see
[`09-GAP-AND-LEARNING-MAP.md`](09-GAP-AND-LEARNING-MAP.md)).

## CI/CD

Jenkins (professional execution; repository Jenkinsfile is
syntax-valid, never run against a real server). GitHub Actions (the
platform this repository's own CI actually runs on — every current job
green; see `.github/workflows/ci.yml` for the current job set, not
restated here as a fixed number since an earlier count went stale as
the workflow grew).

## Data

SQL, SQLite.

## Observability

Elastic (professional RCA tool). OpenTelemetry, Jaeger — gaps.

## Security

Burp Suite, OWASP ZAP — both gaps (aware, not practiced).

## Dev & Environment

Git, GitHub, Docker, Node.js.

## Visual & Design

Figma, Python-based visual comparison, axe-core.

## Project / QA Management

Azure DevOps (confirmed via the FinTech professional context). Jira and
Confluence are listed in the tool-state registry as
`USER_CONFIRMATION_REQUIRED` — the source data does not confirm them
for this profile specifically, so they are not claimed here even though
they are common in the field.
