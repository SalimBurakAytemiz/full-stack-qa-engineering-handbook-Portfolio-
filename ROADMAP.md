# Full Stack QA Engineering Handbook & Portfolio
## Repository Roadmap

Bu roadmap repository'nin hangi sırayla geliştirileceğini tanımlar.

Amaç:

- QA bilgi tabanını sistematik kurmak
- EXPERIENCE alanlarını gerçek örneklerle kanıtlamak
- PARTICIPATED alanlarını doğru seviyede göstermek
- LEARNING alanlarını kontrollü Lab çalışmalarıyla PRACTICED seviyesine taşımak
- Çalıştırılmamış hiçbir test veya sahte evidence üretmemek

---

# PHASE 0 — REPOSITORY FOUNDATION

## Status

IN PROGRESS

## Amaç

Repository'nin temel kurallarını, yetkinlik haritasını ve dokümantasyon
standardını oluşturmak.

## Deliverables

- README.md
- DOCUMENTATION-STANDARD.md
- QA-COMPETENCY-MAP.md
- ROADMAP.md
- TERMINOLOGY-GLOSSARY.md
- CONTRIBUTING.md
- Repository folder architecture

## Exit Criteria

- Dokümantasyon standardı hazır
- Competency map hazır
- Roadmap hazır
- Naming convention belirlenmiş
- Ana klasör mimarisi belirlenmiş

---

# PHASE 1 — QA FOUNDATIONS

## Amaç

Full Stack QA yaklaşımının temel metodoloji ve terminolojisini oluşturmak.

## Kapsam

- Software Quality Assurance
- Software Testing
- Quality Control
- Verification
- Validation
- SDLC
- STLC
- Test Levels
- Test Types
- Test Design Techniques
- Risk-Based Testing
- Entry Criteria
- Exit Criteria
- Test Oracle
- Traceability

## Deliverables

- Türkçe açıklamalar
- İngilizce teknik terminoloji
- Gerçekçi QA örnekleri
- Interview Notes

---

# PHASE 2 — REQUIREMENT & TEST DESIGN

## Amaç

Bir requirement'ın QA tarafından nasıl analiz edildiğini baştan sona göstermek.

## Kapsam

- Requirement Analysis
- Acceptance Criteria
- Requirement Clarification
- Testability
- Happy Path
- Alternative Flow
- Negative Flow
- Edge Cases
- Boundary Value Analysis
- Equivalence Partitioning
- Decision Table
- State Transition
- Impact Analysis
- Dependency Analysis
- Risk Analysis

## Deliverables

- Example Requirement
- Requirement Analysis
- Risk Matrix
- Test Scenarios
- Test Cases
- Traceability

---

# PHASE 3 — TEST MANAGEMENT & DEFECT MANAGEMENT

## Amaç

Profesyonel QA operasyonunun nasıl yönetildiğini göstermek.

## Kapsam

- Test Plan
- Test Strategy
- Test Scenario
- Test Case
- Checklist
- Regression Suite
- Smoke Suite
- Sanity
- Test Execution
- Evidence
- Defect Lifecycle
- Jira
- Azure DevOps
- Trello
- Confluence
- Kanban
- Retest
- Reopen
- Regression
- Bug Triage
- QA Sign-Off
- Go / No-Go

## Deliverables

- Bug Report Templates
- Example Jira Bugs
- Screenshot Evidence examples
- Video Evidence structure
- Log Evidence
- API Evidence
- Related Requirement
- Related Test Case
- Regression Impact
- Release Risk

---

# PHASE 4 — QA DEMO SYSTEM

## Amaç

Repository içerisindeki bütün QA uygulamalarının üzerinde
çalıştırılabileceği kontrollü test sistemini oluşturmak.

## Sistem

Frontend
→ API
→ Backend
→ Database
→ Events
→ Notifications

## Temel Feature'lar

- Authentication
- User Management
- Role Management
- Products
- Orders
- Payment Simulation
- Pagination
- Filtering
- Sorting
- Notifications
- WebSocket
- File Upload

## Kurallar

- Gerçek şirket datası kullanılmaz
- Production credential kullanılmaz
- Güvenli test datası kullanılır
- Sistem gerçekten çalıştırılabilir olmalıdır

---

# PHASE 5 — API TESTING

## Amaç

API Testing ve API Automation bilgisini profesyonel seviyede
dokümante etmek ve kanıtlamak.

## Kapsam

- REST API
- HTTP Methods
- Headers
- Request Body
- Response Body
- Query Parameters
- Path Parameters
- Authentication
- Authorization
- Status Codes
- Response Time
- Positive Testing
- Negative Testing
- Boundary Testing
- Error Contract
- Pagination
- Filtering
- Sorting
- Idempotency
- Concurrent Requests
- Rate Limiting
- API Versioning
- API Gateway

## Automation

- Postman
- AJV
- JSON Schema
- Business Rule Validation
- Cross-Field Validation
- Null Validation
- Empty Validation
- Newman
- Reporting
- Jenkins Execution

## Learning

- Mock Server
- Service Virtualization

---

# PHASE 6 — GRAPHQL / WEBSOCKET / EVENT TESTING

## Kapsam

- GraphQL Query
- GraphQL Mutation
- GraphQL Error Handling
- Data Mapping
- WebSocket
- Connection
- Disconnect
- Reconnect
- Payload Validation
- Duplicate Events
- Delayed Events
- Event Ordering
- Inbound Events
- Outbound Events
- Firebase Events
- Notification Events

---

# PHASE 7 — DATABASE TESTING

## Amaç

Database'in QA tarafından Test Oracle ve Data Validation kaynağı
olarak nasıl kullanıldığını göstermek.

## Kapsam

- SQL
- SELECT
- WHERE
- JOIN
- Filtering
- Sorting
- API → DB Validation
- UI → DB Validation
- CRUD State Validation
- Data Integrity
- Duplicate Validation
- Null Validation
- Financial Data Validation
- Timestamp Validation
- Audit / History
- Test Data Preparation

## Scope Boundary

Database administration veya DBA sorumlulukları
QA Core kapsamı değildir.

---

# PHASE 8 — WEB & MOBILE QA

## Web

- Functional Testing
- Responsive Testing
- Cross-Browser Testing
- Browser DevTools
- Network Inspection
- Storage
- Cookies
- Frontend / Backend Validation

## Mobile

- Android
- iOS
- Native
- Hybrid
- WebView
- Device Matrix
- Permissions
- Orientation
- Background / Foreground
- Kill / Relaunch
- Network Interruption
- Offline
- Push Notification
- Deep Link
- Localization
- Feature Parity

---

# PHASE 9 — VISUAL & ACCESSIBILITY

## Visual

- Pixel Perfect
- Figma Comparison
- Screenshot Comparison
- Difference Visualization
- Threshold / Tolerance
- Visual Regression

## Accessibility

- Keyboard Navigation
- Focus
- Accessibility Labels
- Screen Reader controls
- Contrast
- WCAG concepts

---

# PHASE 10 — AUTOMATION LEARNING LABS

## Selenium

Status:

LEARNING → PRACTICED

Kapsam:

- Setup
- WebDriver
- Locators
- Waits
- Assertions
- Page Object Model
- Test Data
- Reporting
- Parallel Execution
- Cross Browser
- Selenium Grid
- CI/CD

## Appium

Status:

Framework Development:
LEARNING → PRACTICED

Kapsam:

- Setup
- Driver Configuration
- Android
- iOS
- Locators
- Waits
- Assertions
- Page Objects
- Helpers
- Test Data
- Reporting
- CI

## JMeter

Status:

From Scratch:
LEARNING → PRACTICED

Kapsam:

- Test Plan
- Thread Group
- Virtual Users
- Ramp-Up
- Samplers
- Header Manager
- CSV Data
- Correlation
- Assertions
- Workload Model
- P90 / P95 / P99
- Thresholds
- Load
- Stress
- Spike
- Soak
- Reporting

---

# PHASE 11 — SECURITY-AWARE QA

## EXPERIENCE

- Authentication
- Authorization
- RBAC
- Session
- Token
- OTP
- Rate Limiting
- IDOR / BOLA-style checks
- Sensitive Data
- Input Validation
- XSS-oriented validation
- SQL Injection-oriented validation
- Mass Assignment
- File Upload
- Security Defects

## LEARNING LABS

- OWASP API Security Top 10
- Burp Suite
- OWASP ZAP

---

# PHASE 12 — CI/CD & ENVIRONMENT

## EXPERIENCE

- Jenkins Job Execution
- Jenkins Test Execution
- Console Output
- Test Failure Analysis
- QA CI/CD
- DEV
- QA
- UAT
- Stage
- Production
- Environment Validation
- Server/Application Recycle
- Production Incident Investigation
- QA → DevOps Collaboration

## LEARNING

- Jenkinsfile
- Pipeline Development
- Quality Gate Automation

---

# PHASE 13 — LOGGING / OBSERVABILITY / PRODUCTION QA

## EXPERIENCE

- Elastic
- Backend Logs
- Application Logs
- Correlation ID
- Request ID
- Root Cause Isolation
- Production Validation
- Smoke Testing
- Stability Verification
- Hotfix Testing
- Release Validation

## LEARNING

- Distributed Tracing
- OpenTelemetry
- Jaeger
- Logs / Metrics / Traces model

---

# PHASE 14 — MODERN QA LEARNING LABS

## Learning Topics

- Pact
- Kafka
- RabbitMQ
- Docker for QA
- Code Coverage
- SonarQube
- Allure
- Feature Flags
- Canary Deployment
- Blue-Green Deployment
- Cloud QA
- k6
- Gatling
- Locust

---

# PHASE 15 — CASE STUDIES

Repository içerisindeki bütün QA bilgisini gerçekçi feature'lar
üzerinde birleştiren örnek projeler oluşturulacaktır.

## Case Study 01

Authentication

## Case Study 02

E-Commerce Order Flow

## Case Study 03

Payment Flow

## Case Study 04

Multi-Country / Localization

## Case Study 05

Real-Time WebSocket / Event Flow

## Case Study 06

Production Incident Investigation

## Case Study 07

Mobile Migration / Feature Parity

---

# PHASE 16 — INTERVIEW PREPARATION

## Amaç

Repository'nin aynı zamanda teknik mülakat hazırlık kaynağı olması.

## Kapsam

- Manual QA
- Test Design
- API
- SQL
- Mobile
- Automation
- Selenium
- Appium
- Performance
- Security
- CI/CD
- Senior QA
- QA Lead
- Scenario Questions

Her soru:

- Short Answer
- Detailed Answer
- Example
- Real QA Risk
- Related Lab

formatında hazırlanacaktır.

---

# PHASE 17 — FINAL INTEGRATION

## Amaç

Bütün repository'nin tek kalite sistemi olarak çalışmasını sağlamak.

## Kontroller

- Documentation consistency
- Broken links
- Terminology
- Knowledge Status correctness
- Tests
- Automation
- Reports
- Evidence
- CI
- Security
- Secrets
- Repository navigation
- Case Study traceability

---

# PHASE 18 — INDEPENDENT REVIEW

Repository bağımsız reviewer tarafından incelenecektir.

Review kapsamı:

- Technical correctness
- QA correctness
- Architecture
- Test quality
- Documentation
- Security
- Maintainability
- False evidence
- Unsupported experience claims

Bulunan hatalar toplu şekilde düzeltilecektir.

---

# PHASE 19 — CLEAN

Repository ancak:

- Testler başarılı
- Kritik bulgu yok
- Evidence doğrulanmış
- Learning / Experience statüleri doğru
- Documentation tamam
- Case Studies çalışır
- Review sonucu CLEAN

olduğunda tamamlanmış kabul edilir.

---

# Development Principle

Repository küçük ve kontrolsüz değişikliklerle geliştirilmemelidir.

Her Phase:

PLAN
→ IMPLEMENT
→ TEST
→ DOCUMENT
→ EVIDENCE
→ REVIEW
→ FIX
→ CLEAN

döngüsünden geçmelidir.

---

# Current Status

PHASE 0 — REPOSITORY FOUNDATION

IN PROGRESS
