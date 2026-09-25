# Professional Case Map

Four sanitized professional cases, one card each. Structure follows the
repository's professional-case standard (project type, domain, role,
system context, what was worked on, QA responsibilities, technologies,
key flows, typical risks, what was personally done vs. participated in,
confidentiality boundary, related public lab, related competencies).

No card implies employer source code exists in this repository. Related
public labs are independent, synthetic reconstructions built to
exercise the same class of QA problem — never a copy of the real system.

---

## Case 1 — E-Commerce / Mobile (Skechers Turkey)

| | |
|---|---|
| Project type | E-commerce platform, web + mobile |
| Domain | E-Commerce, OMS |
| My role | QA Engineer |
| System context | Web storefront, React Native mobile app, GraphQL API layer, OMS backend |
| What I worked on | V1 stabilization, "My Orders" order module, GraphQL → mobile data mapping |
| QA responsibilities | Functional/integration testing, GraphQL revision validation, API response-time validation, AJV/Newman automation |
| Technologies | GraphQL, React Native, REST, AJV, Newman, JSON Schema |
| Key flows | Order placement and status, order history ("My Orders"), API-to-mobile data mapping |
| Typical risks | Stale/incorrect data mapping GraphQL → mobile UI, OMS state mismatch, response-time regressions |
| What I personally did | Investigated functional/integration issues, validated GraphQL data mapping and revisions, built AJV/Newman API automation, validated API response-time improvements |
| What I participated in | Broader OMS issue investigation |
| Confidentiality boundary | No employer source code, internal architecture, or real customer data is reproduced here |
| Related public lab | `QA-DEMO-SYSTEM` GraphQL layer (`backend/src/graphql/`), orders flow, `graphql.test.js` |
| Related competencies | GraphQL, REST API testing, Postman/Newman/AJV |

---

## Case 2 — FinTech (sanitized)

| | |
|---|---|
| Project type | FinTech platform, web + mobile + admin + CMS |
| Domain | FinTech |
| My role | QA Engineer |
| System context | Multi-surface platform (web, mobile, admin, CMS) with realtime WebSocket flows and inbound Firebase events |
| What I worked on | End-to-end QA across all surfaces, V1/V2 stabilization |
| QA responsibilities | Functional/regression/UAT, SQL data validation, Appium automated execution (local + Jenkins), Elastic log analysis/RCA, load/performance participation, Azure DevOps defect lifecycle |
| Technologies | REST, Postman, Swagger, WebSocket, Firebase, SQL, Appium, Jenkins, Elastic, Azure DevOps |
| Key flows | Realtime notification delivery, inbound event handling, account/session flows |
| Typical risks | Realtime event ordering/duplication, notification delivery gaps, stale session/token state, regression from stabilization changes |
| What I personally did | Ran Appium automated suites (local and via Jenkins), analyzed failures/results, performed Elastic log-based RCA contribution, validated SQL data, managed defect lifecycle in Azure DevOps |
| What I participated in | Load/performance process, business/software analysis |
| Confidentiality boundary | No employer source code, internal architecture, or real customer data is reproduced here |
| Related public lab | `QA-DEMO-SYSTEM` WebSocket/event layer (`websocket-events-advanced.test.js`), `requestContext.js` correlation logging |
| Related competencies | WebSocket, SQL for QA, Appium, request-correlation logging |

---

## Case 3 — Multi-Country Mobile (sanitized)

| | |
|---|---|
| Project type | Multi-country mobile app migration |
| Domain | Mobile, Multi-Country / Localization, E-Commerce-adjacent |
| My role | QA Engineer |
| System context | Native app migrating from Flutter to React Native, five countries |
| What I worked on | Feature-parity QA across the migration |
| QA responsibilities | Country-specific behavior validation, localization, country-specific payment methods and OMS integrations, Figma comparison, Python pixel-perfect visual comparison |
| Technologies | Flutter, React Native, Figma, Python-based visual comparison |
| Key flows | Country-specific checkout/payment, localized content, OMS integration per country |
| Typical risks | Feature drift between old and new stack, localization string/format errors, country-specific payment-method regressions, visual regressions the migration introduces |
| What I personally did | Ran Figma-vs-build comparisons, built/ran Python pixel-perfect screenshot comparisons with difference visualization, validated country-specific flows |
| What I participated in | OMS integration validation per country |
| Confidentiality boundary | No employer source code, internal architecture, or real customer data is reproduced here |
| Related public lab | `QA-DEMO-SYSTEM` visual-regression suite (`visual-regression.spec.js`) |
| Related competencies | Visual regression / pixel-perfect comparison, accessibility (adjacent) |

---

## Case 4 — Media / Live Streaming (sanitized)

| | |
|---|---|
| Project type | Mobile SDK / live-streaming platform |
| Domain | Media / Streaming |
| My role | QA Engineer |
| System context | Mobile SDK, backend, admin panel, third-party streaming providers |
| What I worked on | Mobile/backend/integration/admin-panel QA |
| QA responsibilities | Provider config/key/session flow validation, stream creation and live-stream end-to-end testing, REST API automation |
| Technologies | REST, WebSocket, AWS/MUX/Agora integration context |
| Key flows | Stream creation → session start → viewer join → realtime events → stream end |
| Typical risks | Provider timeout/misconfiguration, session/token expiry mid-stream, duplicate/out-of-order realtime events, disconnect/reconnect handling |
| What I personally did | Validated provider config/key/session flows, ran live-stream end-to-end tests, built REST API automation |
| What I participated in | Admin-panel QA |
| Confidentiality boundary | No real provider credentials, employer source code, or internal architecture is reproduced here. Any provider simulation elsewhere in this repository uses fake provider names (e.g. `FAKE_PROVIDER_A`) |
| Related public lab | Planned — a synthetic streaming/provider module (`03-DOMAINS/03-MEDIA-STREAMING/`) is not yet built; tracked in `.ai/NEXT-ACTIONS.md` |
| Related competencies | WebSocket, REST API testing, AWS/MUX/Agora integration QA exposure |
