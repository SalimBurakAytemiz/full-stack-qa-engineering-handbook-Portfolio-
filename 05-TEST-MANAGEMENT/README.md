# 05 — Test Management

**Knowledge Status: EXPERIENCE**

---

## Bölümün Amacı

Bu bölüm, bir QA Engineer'ın test operasyonunu nasıl **planladığını,
yönettiğini ve dokümante ettiğini** öğretir. `01-REQUIREMENT-ANALYSIS/`,
`02-RISK-BASED-TESTING/` ve `03-TEST-DESIGN/` bölümlerinde üretilen
Test Case'lerin, gerçek bir proje ortamında nasıl **organize
edildiğini, çalıştırıldığını, raporlandığını ve release kararına
dönüştürüldüğünü** kapsar.

---

## Knowledge Status

QA-COMPETENCY-MAP.md ile uyumlu olarak, Test Management kapsamındaki
temel bilgiler:

**Status: EXPERIENCE**

olarak işaretlenmiştir. Bu statü, root `QA-COMPETENCY-MAP.md`
dosyasındaki "3. Test Management" ve "5. Project & Test Management
Tools" kategorileriyle tutarlıdır. İki istisna açıkça işaretlenmiştir:

- **WIP Limit ileri seviye kullanımı** (bkz.
  `19-KANBAN-QA-WORKFLOW.md`) — **LEARNING**
- **Xray / Zephyr / TestRail** (bkz. `20-TOOLS-AND-WORKFLOWS.md`) —
  **LEARNING**

Bu istisnalar dışında hiçbir statü bu Phase'de keyfi olarak
değiştirilmemiştir.

---

## Önerilen Öğrenme Sırası

1. [01 — Test Strategy](01-TEST-STRATEGY.md)
2. [02 — Test Plan](02-TEST-PLAN.md)
3. [03 — Test Scenario Management](03-TEST-SCENARIO-MANAGEMENT.md)
4. [04 — Test Case Management](04-TEST-CASE-MANAGEMENT.md)
5. [05 — Test Suite & Test Cycle](05-TEST-SUITE-AND-TEST-CYCLE.md)
6. [06 — Smoke/Sanity/Regression Suites](06-SMOKE-SANITY-REGRESSION-SUITES.md)
7. [07 — Test Execution Status](07-TEST-EXECUTION-STATUS.md)
8. [08 — Test Evidence Management](08-TEST-EVIDENCE-MANAGEMENT.md)
9. [09 — Traceability Management](09-TRACEABILITY-MANAGEMENT.md)
10. [10 — Test Coverage](10-TEST-COVERAGE.md)
11. [11 — Entry/Exit Criteria](11-ENTRY-EXIT-CRITERIA.md)
12. [12 — Test Estimation](12-TEST-ESTIMATION.md)
13. [13 — Test Prioritization](13-TEST-PRIORITIZATION.md)
14. [14 — QA Metrics](14-QA-METRICS.md)
15. [15 — Test Reporting](15-TEST-REPORTING.md)
16. [16 — UAT Management](16-UAT-MANAGEMENT.md)
17. [17 — Release QA Sign-Off](17-RELEASE-QA-SIGN-OFF.md)
18. [18 — Known Issues](18-KNOWN-ISSUES.md)
19. [19 — Kanban QA Workflow](19-KANBAN-QA-WORKFLOW.md)
20. [20 — Tools and Workflows](20-TOOLS-AND-WORKFLOWS.md)

Ek kaynaklar:

- [Common Mistakes](COMMON-MISTAKES.md)
- [Interview Notes](INTERVIEW.md)
- [templates/](templates/) — 8 yeniden kullanılabilir şablon

---

## Templates

| Şablon | Kullanım Amacı |
|---|---|
| [TEST-PLAN-TEMPLATE.md](templates/TEST-PLAN-TEMPLATE.md) | Test Plan oluşturma |
| [TEST-CASE-TEMPLATE.md](templates/TEST-CASE-TEMPLATE.md) | Test Case oluşturma |
| [TEST-SCENARIO-TEMPLATE.md](templates/TEST-SCENARIO-TEMPLATE.md) | Test Scenario oluşturma |
| [TEST-EXECUTION-TEMPLATE.md](templates/TEST-EXECUTION-TEMPLATE.md) | Test Cycle execution kaydı |
| [TEST-SUMMARY-REPORT-TEMPLATE.md](templates/TEST-SUMMARY-REPORT-TEMPLATE.md) | Test Summary Report |
| [RELEASE-QA-REPORT-TEMPLATE.md](templates/RELEASE-QA-REPORT-TEMPLATE.md) | Release QA Report / Sign-Off |
| [UAT-TEMPLATE.md](templates/UAT-TEMPLATE.md) | UAT süreci dokümantasyonu |
| [KNOWN-ISSUES-TEMPLATE.md](templates/KNOWN-ISSUES-TEMPLATE.md) | Known Issues kaydı |

---

## Konu Listesi

| # | Konu | Odak |
|---|---|---|
| 01 | Test Strategy | Uzun vadeli, organizasyon geneli test yaklaşımı |
| 02 | Test Plan | Release bazlı, somut test planlaması |
| 03 | Test Scenario Management | Çok sayıda senaryonun organizasyonu |
| 04 | Test Case Management | Profesyonel Test Case alanları |
| 05 | Test Suite & Test Cycle | Statik grup vs zamana bağlı execution turu |
| 06 | Smoke/Sanity/Regression Suites | Ne zaman hangi suite |
| 07 | Test Execution Status | PASS/FAIL/BLOCKED/NOT EXECUTED/SKIPPED |
| 08 | Test Evidence Management | Kanıt türleri ve hassas veri güvenliği |
| 09 | Traceability Management | RTM'in operasyonel yönetimi |
| 10 | Test Coverage | Sayı değil, boyutlu coverage |
| 11 | Entry/Exit Criteria | Test Plan içinde operasyonel kullanım |
| 12 | Test Estimation | Süre tahmini faktörleri |
| 13 | Test Prioritization | Riskin günlük operasyona yansıması |
| 14 | QA Metrics | Metric ≠ Quality |
| 15 | Test Reporting | 4 rapor türü |
| 16 | UAT Management | QA'nın koordinasyon rolü |
| 17 | Release QA Sign-Off | GO / CONDITIONAL GO / NO-GO |
| 18 | Known Issues | Şeffaf kabul edilmiş sorunlar |
| 19 | Kanban QA Workflow | Örnek workflow + WIP Limit (LEARNING) |
| 20 | Tools and Workflows | Jira, Azure DevOps, Trello, Confluence + Xray/Zephyr/TestRail (LEARNING) |

---

## Bu Bölümü Tamamladığınızda Yapabiliyor Olmanız Gerekenler

- Test Strategy ile Test Plan'ı ayırt edip her ikisini de yazabilmek
- Profesyonel bir Test Case'i eksiksiz ama gereksiz uzatmadan
  yazabilmek
- PASS/FAIL/BLOCKED/NOT EXECUTED/SKIPPED arasındaki farkı doğru
  uygulayabilmek
- Bir bulguyu evidence ile desteklenmiş, tekrar üretilebilir hale
  getirebilmek
- Test Coverage ve QA Metriklerini bağlamıyla birlikte
  yorumlayabilmek (Metric ≠ Quality)
- Bir release için GO/CONDITIONAL GO/NO-GO önerisi sunabilmek
- Jira, Azure DevOps, Trello, Confluence'ı QA perspektifinden
  karşılaştırabilmek

---

## Sonraki Adım

Bulunan defect'lerin profesyonel olarak nasıl raporlandığı ve
lifecycle boyunca nasıl takip edildiği `06-DEFECT-MANAGEMENT/`
bölümünde ele alınır.

---

## İlgili Repository Dokümanları

- [Root README](../README.md)
- [QA Competency Map](../QA-COMPETENCY-MAP.md)
- [00-QA-FOUNDATIONS](../00-QA-FOUNDATIONS/README.md)
- [01-REQUIREMENT-ANALYSIS](../01-REQUIREMENT-ANALYSIS/README.md)
- [02-RISK-BASED-TESTING](../02-RISK-BASED-TESTING/README.md)
- [03-TEST-DESIGN](../03-TEST-DESIGN/README.md)
- [06-DEFECT-MANAGEMENT](../06-DEFECT-MANAGEMENT/README.md)
