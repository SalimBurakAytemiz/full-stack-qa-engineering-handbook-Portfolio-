# 06 — Defect Management

**Knowledge Status: EXPERIENCE**

---

## Bölümün Amacı

Bu bölüm, bir QA Engineer'ın bulduğu bir hatayı **profesyonel bir Bug
/ Defect** olarak nasıl raporladığını ve bu defect'i **lifecycle
boyunca** (triage, retest, reopen, regression, production dahil) nasıl
takip ettiğini öğretir.

Bu bölümün en önemli uygulamalı kısmı,
[`examples/AUTHENTICATION-BUG/`](examples/AUTHENTICATION-BUG/README.md)
klasörüdür — `03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/`'daki
kontrollü Authentication feature'ı ile **doğrudan bağlantılı**,
uçtan uca bir kontrollü defect örneğidir.

---

## Knowledge Status

QA-COMPETENCY-MAP.md ile uyumlu olarak, Defect Management kapsamındaki
temel bilgiler:

**Status: EXPERIENCE**

olarak işaretlenmiştir. Bu statü, root `QA-COMPETENCY-MAP.md`
dosyasındaki "4. Defect Management" ve "5. Project & Test Management
Tools" kategorileriyle tutarlıdır. Hiçbir statü bu Phase'de keyfi
olarak değiştirilmemiştir.

---

## Önerilen Öğrenme Sırası

1. [01 — Bug/Defect/Issue Terminology](01-BUG-DEFECT-ISSUE-TERMINOLOGY.md)
2. [02 — Defect Lifecycle](02-DEFECT-LIFECYCLE.md)
3. [03 — Professional Bug Report](03-PROFESSIONAL-BUG-REPORT.md)
4. [04 — Steps to Reproduce](04-STEPS-TO-REPRODUCE.md)
5. [05 — Expected vs Actual](05-EXPECTED-VS-ACTUAL.md)
6. [06 — Severity vs Priority](06-SEVERITY-VS-PRIORITY.md)
7. [07 — Reproduction Rate](07-REPRODUCTION-RATE.md)
8. [08 — Defect Evidence](08-DEFECT-EVIDENCE.md)
9. [09 — Defect Triage](09-DEFECT-TRIAGE.md)
10. [10 — Retest](10-RETEST.md)
11. [11 — Reopen](11-REOPEN.md)
12. [12 — Regression After Fix](12-REGRESSION-AFTER-FIX.md)
13. [13 — Duplicate / Rejected / Not a Bug](13-DUPLICATE-REJECTED-NOT-A-BUG.md)
14. [14 — Root Cause Isolation](14-ROOT-CAUSE-ISOLATION.md)
15. [15 — Regression Impact](15-REGRESSION-IMPACT.md)
16. [16 — Cross-Team Defects](16-CROSS-TEAM-DEFECTS.md)
17. [17 — Production Defects](17-PRODUCTION-DEFECTS.md)
18. [18 — Defect Metrics](18-DEFECT-METRICS.md)
19. [19 — Jira Bug Workflow](19-JIRA-BUG-WORKFLOW.md)
20. [20 — Azure DevOps Defect Workflow](20-AZURE-DEVOPS-DEFECT-WORKFLOW.md)

Ek kaynaklar:

- [Common Mistakes](COMMON-MISTAKES.md)
- [Interview Notes](INTERVIEW.md)
- [templates/](templates/) — 5 yeniden kullanılabilir şablon
- **[Controlled Defect Example: Authentication Bug](examples/AUTHENTICATION-BUG/README.md)**

---

## Controlled Defect Case

> **EDUCATIONAL CONTROLLED EXAMPLE**

[`examples/AUTHENTICATION-BUG/`](examples/AUTHENTICATION-BUG/) klasörü,
`03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/`'daki kontrollü
Authentication feature'ına bağlı, kurgusal bir defect'i uçtan uca
işler:

1. [README](examples/AUTHENTICATION-BUG/README.md)
2. [01 — Related Requirement](examples/AUTHENTICATION-BUG/01-RELATED-REQUIREMENT.md)
3. [02 — Related Test Case](examples/AUTHENTICATION-BUG/02-RELATED-TEST-CASE.md)
4. [03 — Bug Report](examples/AUTHENTICATION-BUG/03-BUG-REPORT.md)
5. [04 — Steps to Reproduce](examples/AUTHENTICATION-BUG/04-STEPS-TO-REPRODUCE.md)
6. [05 — Expected Result](examples/AUTHENTICATION-BUG/05-EXPECTED-RESULT.md)
7. [06 — Actual Result](examples/AUTHENTICATION-BUG/06-ACTUAL-RESULT.md)
8. [07 — Severity / Priority](examples/AUTHENTICATION-BUG/07-SEVERITY-PRIORITY.md)
9. [08 — Regression Impact](examples/AUTHENTICATION-BUG/08-REGRESSION-IMPACT.md)
10. [09 — Evidence Plan](examples/AUTHENTICATION-BUG/09-EVIDENCE-PLAN.md)
11. [10 — Retest](examples/AUTHENTICATION-BUG/10-RETEST.md)
12. [11 — Regression](examples/AUTHENTICATION-BUG/11-REGRESSION.md)
13. [12 — Traceability](examples/AUTHENTICATION-BUG/12-TRACEABILITY.md)

**Önemli:** Bu klasördeki hiçbir defect gerçekten çalıştırılmamıştır;
tüm execution/retest/regression sonuçları `NOT EXECUTED`'tir. Detaylar
için [`examples/AUTHENTICATION-BUG/README.md`](examples/AUTHENTICATION-BUG/README.md)'deki
uyarıya bakın.

---

## Konu Listesi

| # | Konu | Odak |
|---|---|---|
| 01 | Bug/Defect/Issue Terminology | Pratik terim eşlemesi |
| 02 | Defect Lifecycle | NEW→OPEN→...→CLOSED + alternatif resolution'lar |
| 03 | Professional Bug Report | Vitrin dosyası — tüm alanlar + Bug Title Standard |
| 04 | Steps to Reproduce | Bad/Good Example |
| 05 | Expected vs Actual | Neden ayrı yazılmalı |
| 06 | Severity vs Priority | Farklı kombinasyon örnekleri |
| 07 | Reproduction Rate | Önceliklendirme ve kök nedene etkisi |
| 08 | Defect Evidence | Defect'e özgü evidence seçimi |
| 09 | Defect Triage | Kim, ne değerlendirir |
| 10 | Retest | Bu bug düzeldi mi? |
| 11 | Reopen | Retest FAIL sonrası |
| 12 | Regression After Fix | Fix başka yeri bozdu mu? |
| 13 | Duplicate/Rejected/Not a Bug | Geçersiz/tekrarlı defect kararları |
| 14 | Root Cause Isolation | 6-node eğitim örneği |
| 15 | Regression Impact | Defect'in kendi etki alanı |
| 16 | Cross-Team Defects | Birden fazla ekip koordinasyonu |
| 17 | Production Defects | Shift Right — mitigasyon önce, fix sonra |
| 18 | Defect Metrics | Aging, Leakage, Reopen Rate |
| 19 | Jira Bug Workflow | Kavramsal alan/adım anlatımı |
| 20 | Azure DevOps Defect Workflow | Native Severity + Test Plans |

---

## Bu Bölümü Tamamladığınızda Yapabiliyor Olmanız Gerekenler

- Bug, Defect ve Issue terimlerini doğru bağlamda kullanmak
- Profesyonel bir bug raporunu eksiksiz, tüm alanlarıyla yazmak
- İyi bir Bug Title ve iyi Steps to Reproduce yazmak
- Severity ile Priority'yi doğru ayırt edip farklı kombinasyonlar
  üretebilmek
- BLOCKED, Retest, Reopen, Regression kavramlarını doğru sırayla
  uygulamak
- Bir defect'i doğru resolution ile (Duplicate/Rejected/Not a
  Bug/Known Issue) kapatmak
- Root Cause Isolation ile bir sorunu doğru katmana yönlendirmek
- Jira ve Azure DevOps'u defect operasyonu açısından karşılaştırmak

---

## İlgili Repository Dokümanları

- [Root README](../../README.md)
- [QA Competency Map](../../QA-COMPETENCY-MAP.md)
- [00-QA-FOUNDATIONS](../00-QA-FOUNDATIONS/README.md)
- [03-TEST-DESIGN](../03-TEST-DESIGN/README.md)
- [05-TEST-MANAGEMENT](../05-TEST-MANAGEMENT/README.md)
