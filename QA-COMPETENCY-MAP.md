# QA Competency Map

Bu doküman repository sahibinin gerçek profesyonel deneyimini,
katılım sağladığı teknik süreçleri ve geliştirilmesi gereken alanları
birbirinden ayırmak için hazırlanmıştır.

Repository içerisindeki teknik içerikler bu yetkinlik haritasına sadık
kalmalıdır.

---

# Knowledge Status Model

## EXPERIENCE

Gerçek profesyonel projelerde doğrudan uygulanmış bilgi veya teknoloji.

## PARTICIPATED

Gerçek profesyonel projede ilgili süreçte aktif olarak bulunulmuş,
planlama, senaryo, analiz veya uygulama süreçlerine katkı sağlanmış;
ancak ilgili teknoloji veya framework sıfırdan geliştirilmemiştir.

## PRACTICED

Repository içerisindeki kontrollü QA Lab ortamında uygulanmış,
çalıştırılmış ve teknik kanıt üretilmiş bilgi veya teknoloji.

## LEARNING

Henüz yeterli hands-on deneyim bulunmayan veya sıfırdan uygulanması
öğrenilmesi gereken teknoloji ya da yöntem.

---

# 1. QA Fundamentals & Test Design

**Status: EXPERIENCE**

Kapsam:

- Software Quality Assurance
- Software Testing
- Quality Control
- Verification
- Validation
- Functional Testing
- End-to-End Testing
- Integration Testing
- Regression Testing
- Smoke Testing
- Sanity Testing
- Exploratory Testing
- User Acceptance Testing
- Compatibility Testing
- Scenario-Based Testing
- Business Rule Testing
- Positive Testing
- Negative Testing
- Edge Case Testing
- Boundary Value Analysis
- Equivalence Partitioning
- Decision Table Testing
- State Transition Testing

---

# 2. Requirement & Software Analysis

**Status: EXPERIENCE**

Kapsam:

- Business Requirement Analysis
- Software Requirement Analysis
- Acceptance Criteria Analysis
- Requirement Clarification
- Requirement Testability
- Happy Path Analysis
- Alternative Flow Analysis
- Negative Flow Analysis
- Business Flow Analysis
- System Flow Analysis
- Impact Analysis
- Dependency Analysis
- Risk Analysis
- Risk-Based Testing
- Change Impact Analysis
- Test Scope Definition
- Testability Review

QA yaklaşımı:

Requirement doğrudan Test Case'e dönüştürülmeden önce
belirsizlikler, business rules, dependencies, risks,
alternative flows ve edge cases analiz edilir.

---

# 3. Test Management

**Status: EXPERIENCE**

Kapsam:

- Test Plan
- Test Strategy
- Test Scenario
- Test Case
- Checklist
- Smoke Suite
- Regression Suite
- Sanity Scope
- Test Execution
- Test Evidence
- Test Coverage
- Traceability
- Requirement Traceability Matrix
- Entry Criteria
- Exit Criteria
- Known Issues
- UAT Management
- QA Sign-Off
- Conditional Sign-Off
- Go / No-Go Recommendation
- Release Risk Assessment
- QA Estimate
- Test Prioritization

---

# 4. Defect Management

**Status: EXPERIENCE**

Kapsam:

- Bug / Defect Reporting
- Summary / Title
- Environment
- Preconditions
- Steps to Reproduce
- Expected Result
- Actual Result
- Severity
- Priority
- Evidence
- Screenshot
- Screen Recording
- API Evidence
- Network Evidence
- Console Logs
- Backend Logs
- Retest
- Reopen
- Regression
- Defect Lifecycle
- Bug Triage
- Root Cause Analysis Contribution
- Defect Impact Analysis
- Release Blocker Assessment
- Cross-Team Defect Management

---

# 5. Project & Test Management Tools

## Jira

**Status: EXPERIENCE**

Kapsam:

- Bug Management
- Task Management
- Workflow
- Kanban Board
- Filters
- JQL usage
- Dashboard
- Traceability
- Defect Lifecycle
- Test / Requirement relationship

## Azure DevOps

**Status: EXPERIENCE**

Kapsam:

- Work Items
- Defect Lifecycle
- Retest
- Regression
- Board
- Queries
- Release/Test workflows

## Trello

**Status: EXPERIENCE**

## Confluence

**Status: EXPERIENCE**

Kapsam:

- QA Documentation
- Test Documentation
- Requirement Documentation
- Analysis Documentation
- Jira / Work Item linking

## Kanban

**Status: EXPERIENCE**

### Advanced WIP Management

**Status: LEARNING**

Öğrenilecek:

- WIP Limits
- Flow Efficiency
- Queue Management
- Advanced Blocked/Waiting Policies

---

# 6. REST API Testing

**Status: EXPERIENCE**

Kapsam:

- GET
- POST
- PUT
- PATCH
- DELETE
- Request Body
- Response Body
- Headers
- Query Parameters
- Path Parameters
- Authentication
- Authorization
- RBAC
- HTTP Status Codes
- Application Status Codes
- Response Time Validation
- Positive API Testing
- Negative API Testing
- Boundary Testing
- Error Contract Validation
- Pagination
- Filtering
- Sorting
- API Versioning
- Idempotency
- Concurrent Request Testing
- Rate Limiting
- API Gateway Testing
- Third-Party API Integration
- API Test Chaining
- Dynamic Test Data
- Test Cleanup
- Test Isolation
- Correlation ID / Request ID Tracking

---

# 7. Postman API Automation

**Status: EXPERIENCE**

Kapsam:

- Postman Collections
- Environments
- Variables
- Collection Variables
- Pre-request Scripts
- Test Scripts
- Assertions
- Request Chaining
- Collection Runner
- Dynamic Data
- Response Validation
- Business Rule Validation
- Schema Validation

---

# 8. AJV & JSON Schema Validation

**Status: EXPERIENCE**

Kapsam:

- AJV
- JSON Schema
- Object Validation
- Array Validation
- Nested Object Validation
- Nested Array Validation
- String Validation
- Integer Validation
- Number Validation
- Boolean Validation
- Required Properties
- Additional Properties
- Regex / Pattern Validation
- Null Validation
- Empty String Validation
- Empty Array Validation
- Cross-Field Validation
- Business Rule Validation
- Validation Error Reporting

Amaç:

API response'un yalnızca HTTP seviyesinde başarılı olması değil,
response contract, data type, business rule ve veri bütünlüğü açısından
doğru olduğunu doğrulamaktır.

---

# 9. Newman

**Status: EXPERIENCE**

Kapsam:

- Collection Execution
- CLI Execution
- Environment Usage
- API Regression Execution
- Reporting
- Jenkins Integration

---

# 10. GraphQL Testing

**Status: EXPERIENCE**

Kapsam:

- Query Testing
- Mutation Testing
- Variables
- Response Validation
- Error Validation
- Data Mapping
- Frontend / GraphQL Integration

---

# 11. Socket / WebSocket Testing

**Status: EXPERIENCE**

Kapsam:

- Connection
- Disconnect
- Reconnect
- Incoming Messages
- Outgoing Messages
- Event Types
- Payload Validation
- Duplicate Messages
- Delayed Messages
- User Data Isolation
- Real-Time Data Flow

---

# 12. Event & Integration Testing

**Status: EXPERIENCE**

Kapsam:

- Integration Flow Validation
- Data Mapping
- Field Mapping
- Inbound Events
- Outbound Events
- Event Payload Validation
- Duplicate Events
- Delayed Events
- Event Ordering
- Retry Behaviour
- Timeout Behaviour
- Integration Error Handling
- Root Cause Isolation
- End-to-End Technical Trace

Örnek teknik akış:

UI
→ API
→ Backend
→ Database
→ Event
→ Third-Party Service
→ Notification
→ User Application

---

# 13. Firebase

**Status: EXPERIENCE**

Kapsam:

- Firebase Events
- Analytics Events
- Event Parameters
- Duplicate Event Validation
- Missing Event Validation
- Notification Flows
- Mobile Event Validation

---

# 14. Notification Testing

**Status: EXPERIENCE**

Kapsam:

- Push Notification
- Notification Payload
- User Targeting
- Deep Link
- Permission Behaviour
- Notification Click Action
- Backend Trigger
- Event → Notification Flow

---

# 15. Database Testing & SQL Data Validation

**Status: EXPERIENCE**

QA Scope:

Database geliştirmek veya DBA sorumluluğu almak değil;
database'i Test Oracle ve Data Validation kaynağı olarak kullanmak.

Kapsam:

- SQL
- SELECT
- WHERE
- Filtering
- Sorting
- JOIN
- Data Validation
- API → Database Validation
- UI → Database Validation
- CRUD State Validation
- Data Integrity
- Null Validation
- Duplicate Validation
- Financial Data Validation
- Timestamp Validation
- Audit / History Validation
- Test Data Preparation
- Pagination Validation
- Filter Validation
- Database Troubleshooting
- Environment Data Validation

---

# 16. Web Testing

**Status: EXPERIENCE**

Kapsam:

- Functional Testing
- Responsive Testing
- Cross-Browser Testing
- Browser Developer Tools
- Network Inspection
- Console Inspection
- Local Storage
- Session Storage
- Cookies
- Frontend Validation
- Backend Validation
- UI → API Validation
- UI → Database Validation

---

# 17. Mobile Testing

**Status: EXPERIENCE**

Kapsam:

- Android
- iOS
- Native Application Testing
- Hybrid Application Testing
- WebView
- Device Matrix
- Permissions
- Orientation
- Background / Foreground
- App Kill / Relaunch
- Session Behaviour
- Network Interruption
- Offline Behaviour
- Push Notification
- Deep Links
- Crash Investigation
- Freeze Investigation
- Localization
- Multi-Country Testing
- Feature Parity

---

# 18. Appium

## Appium Test Execution

**Status: EXPERIENCE**

Kapsam:

- Existing automated tests execution
- Terminal execution
- Jenkins execution
- Test result analysis
- Failure analysis

## Appium Test Planning & Scenario Design

**Status: PARTICIPATED**

Kapsam:

- Automation candidate discussions
- Test scenario planning
- Mobile automation scope
- Regression scenario contribution

## Appium Framework Development

**Status: LEARNING**

Öğrenilecek:

- Appium installation
- Project initialization
- Driver configuration
- Android configuration
- iOS configuration
- Locators
- Wait strategies
- Assertions
- Page Object Model
- Reusable helpers
- Test data management
- Setup / Teardown
- Reporting
- Framework architecture
- CI integration

Amaç:

Repository Lab tamamlandığında:

LEARNING → PRACTICED

---

# 19. Selenium

**Status: LEARNING**

Profesyonel Selenium development deneyimi bulunmamaktadır.

Repository içerisinde sıfırdan öğrenilecek:

- Selenium Architecture
- WebDriver
- Project Setup
- First Automated Test
- Locators
- CSS Selector
- XPath
- Explicit Wait
- Implicit Wait
- Assertions
- Page Object Model
- Test Data
- Setup / Teardown
- Screenshots
- Reporting
- Parallel Execution
- Cross-Browser Execution
- Selenium Grid
- CI/CD Integration
- Framework Architecture

Amaç:

LEARNING → PRACTICED

---

# 20. BDD / Gherkin / Cucumber

**Status: EXPERIENCE**

Kapsam:

- BDD
- Gherkin
- Given
- When
- Then
- Scenario
- Scenario Outline
- Cucumber
- BDD-based test automation

---

# 21. Browser & Device Farms

## BrowserStack / Sauce Labs

**Status: EXPERIENCE**

## Firebase Test Lab

**Status: EXPERIENCE**

Kapsam:

- Remote Browser Testing
- Remote Device Testing
- Device Matrix Validation

---

# 22. Android Debug Bridge - ADB

**Status: EXPERIENCE**

Kapsam:

- Device Detection
- Android Device Interaction
- Application / Package Operations
- Mobile QA Debug Support
- Log / Device Investigation

---

# 23. Visual & Pixel Perfect Testing

**Status: EXPERIENCE**

Kapsam:

- Figma Comparison
- Screenshot Comparison
- Pixel Perfect Testing
- Visual Difference Detection
- Difference Visualization
- Threshold / Tolerance
- Feature Parity
- UI Regression
- Python-based Visual Comparison

---

# 24. Accessibility Testing

**Status: EXPERIENCE**

Kapsam:

- Accessibility Validation
- Keyboard Navigation
- Focus Behaviour
- Accessibility Labels
- Screen Reader-related Controls
- Contrast / UI Accessibility Checks

---

# 25. Performance & Load Testing

## Response Time Validation

**Status: EXPERIENCE**

## Load / Performance Test Process

**Status: PARTICIPATED**

Kapsam:

- Performance test planning contribution
- Load test scenario contribution
- Test scope discussions
- Performance test result participation

## JMeter From Scratch

**Status: LEARNING**

Öğrenilecek:

- JMeter Architecture
- Test Plan
- Thread Group
- Virtual Users
- Ramp-Up
- HTTP Request Sampler
- Header Manager
- CSV Data Set
- Correlation
- Assertions
- Workload Model
- Throughput
- Error Rate
- P90 / P95 / P99
- Thresholds
- Baseline
- Load Testing
- Stress Testing
- Spike Testing
- Soak / Endurance Testing
- CLI Execution
- Reporting
- Result Analysis

Amaç:

LEARNING → PRACTICED

---

# 26. Jenkins & CI/CD

## Jenkins Usage

**Status: EXPERIENCE**

Kapsam:

- Job Execution
- Parameterized Execution
- Test Execution
- Console Output Analysis
- Test Result Analysis
- Failure Analysis
- Environment-Based Execution
- Automation Reporting
- QA CI/CD Usage

## Jenkins Pipeline Development

**Status: LEARNING**

Öğrenilecek:

- Jenkinsfile
- Declarative Pipeline
- Stages
- Steps
- Environment Variables
- Credentials
- Test Execution Stage
- Reports
- Artifacts
- Quality Gates
- Pipeline Failure Handling

---

# 27. Environment Management

**Status: EXPERIENCE**

Kapsam:

- DEV
- QA
- UAT
- Stage
- Production
- Environment Validation
- Configuration Validation
- Environment Health Checks
- Test Data
- Credentials
- Build Validation
- Backend / Frontend Version Validation
- Server/Application Recycle
- Environment Incident Investigation
- Environment-specific Defects
- QA → DevOps Escalation
- Release Environment Validation

---

# 28. Production QA

**Status: EXPERIENCE**

Kapsam:

- Production Validation
- Smoke Testing
- Stability Verification
- Production Incident Investigation
- Server-specific Issue Isolation
- Release Validation
- Hotfix Testing
- Regression
- Production Bug Reproduction
- QA → DevOps Collaboration
- Go / No-Go Recommendation

QA yaklaşımı:

Bir problemin yalnızca application bug olarak değerlendirilmemesi;
server, configuration, deployment, environment ve dependency seviyelerinde
izole edilmesi.

---

# 29. Log Analysis & Root Cause Isolation

**Status: EXPERIENCE**

Kapsam:

- Elastic
- Backend Logs
- Application Logs
- Error Logs
- Warning Logs
- Correlation ID
- Request ID
- API → Log Traceability
- Database → Log Traceability
- Environment Root Cause Isolation
- Third-Party Root Cause Isolation
- Root Cause Analysis Contribution

---

# 30. Security-Aware QA

**Status: EXPERIENCE**

Kapsam:

- Authentication Testing
- Authorization Testing
- RBAC
- Token Testing
- Session Testing
- OTP Testing
- Password Rules
- Rate Limiting
- Direct URL Authorization
- IDOR / BOLA-style authorization checks
- Sensitive Data Exposure
- Input Validation
- XSS-oriented Input Validation
- SQL Injection-oriented Input Validation
- Mass Assignment Testing
- File Upload Validation
- Security Defect Management
- Security Release Risk

## OWASP Top 10 General Usage

**Status: EXPERIENCE**

## OWASP API Security Top 10

**Status: LEARNING**

## Burp Suite

**Status: LEARNING**

## OWASP ZAP

**Status: LEARNING**

---

# 31. Mocking & Service Virtualization

## Mock Server

**Status: LEARNING**

## Stub / Service Virtualization

**Status: LEARNING**

Öğrenilecek:

- Mock
- Stub
- Fake
- Service Virtualization
- Dependency Simulation
- Controlled Error Responses
- Controlled Timeout Responses
- Contract Simulation
- Integration Testing without real dependency

---

# 32. Contract Testing

## Contract Testing Concepts

**Status: EXPERIENCE**

## Pact Framework

**Status: LEARNING**

Öğrenilecek:

- Consumer
- Provider
- Contract
- Consumer-Driven Contract Testing
- Pact
- Contract Verification
- Breaking Changes
- Backward Compatibility

---

# 33. Modern Performance Tools

**Status: LEARNING**

Öğrenilecek:

- k6
- Gatling
- Locust

Bu araçlar JMeter'in yerine zorunlu olarak kullanılmayacaktır.

Amaç farklı performance testing yaklaşımlarını öğrenmektir.

---

# 34. Advanced Reporting

## Existing QA Reporting

**Status: EXPERIENCE**

## Allure From Scratch Integration

**Status: LEARNING**

Öğrenilecek:

- Allure Results
- Reports
- Attachments
- Screenshots
- Logs
- Test History
- CI Integration

---

# 35. Code Quality & Coverage

**Status: LEARNING**

Öğrenilecek:

- Code Coverage Concepts
- Unit Test Coverage
- Integration Test Coverage
- Coverage Limitations
- SonarQube
- Static Analysis Results
- QA Interpretation of Coverage
- QA / Developer Coverage Collaboration

---

# 36. Message Queue Testing

**Status: LEARNING**

Öğrenilecek:

- Kafka
- RabbitMQ
- Producer
- Consumer
- Topic
- Queue
- Message
- Offset
- Retry
- Duplicate Message
- Delayed Message
- Dead Letter Queue
- Eventual Consistency

Not:

Event Testing profesyonel deneyimi bulunmaktadır.

Kafka/RabbitMQ araç seviyesi hands-on çalışma ise Learning Lab içerisinde
uygulanacaktır.

---

# 37. Docker for QA

**Status: LEARNING**

Öğrenilecek:

- Container
- Image
- Dockerfile
- Docker Compose
- QA Environment
- Test Dependency
- Database Container
- API Container
- Isolated Test Environment
- Automation Execution

---

# 38. Cloud QA

**Status: LEARNING**

Öğrenilecek:

- AWS QA perspective
- Azure QA perspective
- GCP QA perspective
- Service status
- Configuration
- Logs
- Storage
- Environment
- Event systems
- Cloud integration validation

Amaç Cloud Engineer olmak değildir.

Amaç QA Engineer'ın cloud tabanlı sistemleri test edebilmesi ve
problemleri doğru teknik katmanda izole edebilmesidir.

---

# 39. Feature Flags & Deployment Strategies

**Status: LEARNING**

Öğrenilecek:

- Feature Flags
- User Segmentation
- Percentage Rollout
- Canary Deployment
- Blue-Green Deployment
- Rollback Validation
- Partial Release QA
- Feature Toggle Regression

---

# 40. Distributed Systems & Observability

**Status: LEARNING**

Öğrenilecek:

- Microservice Request Flow
- Distributed Tracing
- Trace ID
- Span
- Logs
- Metrics
- Traces
- OpenTelemetry
- Jaeger
- Service-to-Service Investigation
- Distributed Root Cause Analysis

---

# 41. Agile QA & QA Ownership

**Status: EXPERIENCE**

Kapsam:

- Scrum
- Sprint Planning
- Daily Scrum
- Sprint Review
- Retrospective
- Refinement
- Estimation
- QA Estimation
- Shift Left
- Requirement Feedback
- Developer Collaboration
- Product Collaboration
- Business Collaboration
- Designer Collaboration
- DevOps Collaboration
- Cross-Team Testing
- Cross-Team Defect Management
- QA Ownership
- Release Risk Communication
- Process Improvement
- QA Standards
- QA Templates
- Definition of Ready
- Definition of Done
- Quality Gates
- Release Recommendation

---

# 42. Learning Priority

Repository içerisindeki öncelikli Learning Lab sırası:

1. Selenium
2. Appium Framework Development
3. JMeter From Scratch
4. Jenkins Pipeline Development
5. Mock Server
6. Service Virtualization
7. OWASP API Security Top 10
8. Burp Suite
9. OWASP ZAP
10. Pact
11. Kafka / RabbitMQ
12. Docker for QA
13. Code Coverage
14. SonarQube
15. Allure Integration
16. Feature Flags
17. Canary / Blue-Green
18. Distributed Tracing
19. OpenTelemetry
20. Jaeger
21. Cloud QA
22. k6 / Gatling / Locust

---

# 43. Repository Learning Rule

Bir LEARNING konusu yalnızca dokümantasyon yazıldığı için PRACTICED
seviyesine yükseltilemez.

PRACTICED olabilmesi için:

1. Konu öğrenilmiş olmalıdır.
2. Controlled QA Lab üzerinde uygulanmalıdır.
3. Kod veya test çalıştırılmalıdır.
4. PASS ve FAIL senaryoları gösterilmelidir.
5. Evidence üretilmelidir.
6. Sonuç dokümante edilmelidir.

---

# 44. Repository Experience Rule

Repository içerisindeki EXPERIENCE etiketleri yalnızca gerçek profesyonel
deneyimi ifade eder.

Lab içerisinde öğrenilen bir teknoloji EXPERIENCE olarak işaretlenemez.

Lab çalışmaları:

LEARNING → PRACTICED

Profesyonel proje deneyimi oluştuğunda:

PRACTICED → EXPERIENCE

olarak güncellenebilir.

---

# 45. Core Objective

Bu repository'nin hedefi:

"Her şeyi biliyorum."

iddiası oluşturmak değildir.

Hedef:

"Neyi yaptığımı biliyorum.
Neyi neden yaptığımı açıklayabiliyorum.
Bilmediğim konuyu nasıl öğreneceğimi biliyorum.
Öğrendiğim bilgiyi çalışan test ile kanıtlayabiliyorum."

seviyesinde Full Stack QA Engineering bilgi sistemi oluşturmaktır.
