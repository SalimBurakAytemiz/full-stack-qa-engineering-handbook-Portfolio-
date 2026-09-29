# 03 — Test Design

**Knowledge Status: EXPERIENCE**

---

## Bölümün Amacı

Bu bölüm, `01-REQUIREMENT-ANALYSIS/` ile analiz edilen ve
`02-RISK-BASED-TESTING/` ile önceliklendirilen bir requirement'ın,
nasıl **somut ve sistematik test case'lere** dönüştürüleceğini
öğretir.

Bu bölümün en önemli uygulamalı kısmı,
[`examples/AUTHENTICATION-FEATURE/`](examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md)
klasörüdür — Phase 2'nin tüm adımlarının (Requirement → Clarification
→ Acceptance Criteria → Business Rules → Impact/Dependency Analysis →
Risk Matrix → Test Conditions → Test Scenarios → Test Cases → Test
Data → Traceability → Automation Candidates) **uçtan uca uygulandığı**
kontrollü bir eğitim örneğidir.

---

## Knowledge Status

QA-COMPETENCY-MAP.md ile uyumlu olarak, Test Design Techniques
kapsamındaki temel bilgiler:

**Status: EXPERIENCE**

olarak işaretlenmiştir. Bu statü, root `QA-COMPETENCY-MAP.md`
dosyasındaki "1. QA Fundamentals & Test Design" kategorisiyle
tutarlıdır ve bu Phase'de değiştirilmemiştir.

---

## Önerilen Öğrenme Sırası

1. [01 — Test Condition / Scenario / Case](01-TEST-CONDITION-SCENARIO-CASE.md)
2. [02 — Equivalence Partitioning](02-EQUIVALENCE-PARTITIONING.md)
3. [03 — Boundary Value Analysis](03-BOUNDARY-VALUE-ANALYSIS.md)
4. [04 — Decision Table Testing](04-DECISION-TABLE-TESTING.md)
5. [05 — State Transition Testing](05-STATE-TRANSITION-TESTING.md)
6. [06 — Scenario-Based Testing](06-SCENARIO-BASED-TESTING.md)
7. [07 — Error Guessing](07-ERROR-GUESSING.md)
8. [08 — Pairwise / Combinatorial Testing](08-PAIRWISE-COMBINATORIAL-TESTING.md)
9. [09 — Test Data Design](09-TEST-DATA-DESIGN.md)
10. [10 — Positive / Negative / Edge / Boundary](10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md)
11. [11 — Traceability From Requirement to Test](11-TRACEABILITY-FROM-REQUIREMENT-TO-TEST.md)
12. [12 — Automation Candidate Analysis](12-AUTOMATION-CANDIDATE-ANALYSIS.md)

Ek kaynaklar:

- [Common Mistakes](COMMON-MISTAKES.md)
- [Interview Notes](INTERVIEW.md)
- **[Controlled Feature Example: Authentication](examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md)**

---

## Controlled Feature Example

> **EDUCATIONAL CONTROLLED EXAMPLE**

[`examples/AUTHENTICATION-FEATURE/`](examples/AUTHENTICATION-FEATURE/)
klasörü, kurgusal ("Kayıtlı ve aktif kullanıcı geçerli email ve
password kullanarak sisteme login olabilir.") bir requirement
üzerinden, Phase 2'nin tüm metodolojisini uçtan uca uygular:

1. [01 — Requirement](examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md)
2. [02 — Clarification Questions](examples/AUTHENTICATION-FEATURE/02-CLARIFICATION-QUESTIONS.md)
3. [03 — Acceptance Criteria](examples/AUTHENTICATION-FEATURE/03-ACCEPTANCE-CRITERIA.md)
4. [04 — Business Rules](examples/AUTHENTICATION-FEATURE/04-BUSINESS-RULES.md)
5. [05 — Impact Analysis](examples/AUTHENTICATION-FEATURE/05-IMPACT-ANALYSIS.md)
6. [06 — Dependency Analysis](examples/AUTHENTICATION-FEATURE/06-DEPENDENCY-ANALYSIS.md)
7. [07 — Risk Matrix](examples/AUTHENTICATION-FEATURE/07-RISK-MATRIX.md)
8. [08 — Test Conditions](examples/AUTHENTICATION-FEATURE/08-TEST-CONDITIONS.md)
9. [09 — Test Scenarios](examples/AUTHENTICATION-FEATURE/09-TEST-SCENARIOS.md)
10. [10 — Test Cases](examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md)
11. [11 — Test Data](examples/AUTHENTICATION-FEATURE/11-TEST-DATA.md)
12. [12 — Traceability](examples/AUTHENTICATION-FEATURE/12-TRACEABILITY.md)
13. [13 — Automation Candidates](examples/AUTHENTICATION-FEATURE/13-AUTOMATION-CANDIDATES.md)

**Önemli:** Bu klasördeki içerik tamamen eğitim amaçlıdır; gerçek bir
profesyonel proje veya gerçek şirket sistemi değildir. Detaylar için
[`examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md`](examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md)
dosyasının başındaki uyarıya bakın.

---

## Konu Listesi

| # | Konu | Odak |
|---|---|---|
| 01 | Test Condition / Scenario / Case | Dört seviyeli hiyerarşi |
| 02 | Equivalence Partitioning | Age, Order Amount, User Status, Payment Method örnekleri |
| 03 | Boundary Value Analysis | 1-point/2-point boundary yaklaşımı |
| 04 | Decision Table Testing | Withdraw Allowed? — 8 kombinasyonluk tablo |
| 05 | State Transition Testing | Order state diyagramı, valid/invalid transition |
| 06 | Scenario-Based Testing | Uçtan uca kullanıcı akışı |
| 07 | Error Guessing | Double-click, refresh during payment vb. |
| 08 | Pairwise / Combinatorial Testing | Browser×OS×User×Payment örneği |
| 09 | Test Data Design | Valid/Invalid/Boundary/Null/Empty vb. kategoriler |
| 10 | Positive / Negative / Edge / Boundary | Money transfer örneği üzerinden karşılaştırma |
| 11 | Traceability From Requirement to Test | REQ → AC → TS → TC zinciri |
| 12 | Automation Candidate Analysis | Otomasyona uygunluk değerlendirmesi |

---

## Bu Bölümü Tamamladığınızda Yapabiliyor Olmanız Gerekenler

- Test Condition, Scenario, Case ve Step'i birbirinden ayırmak
- Equivalence Partitioning ve Boundary Value Analysis'i gerçek bir
  girdi alanına uygulamak
- Birden fazla koşulun kombinasyonlarını bir Decision Table ile
  kapsamak
- Bir varlığın state diyagramını çıkarıp valid/invalid transition'ları
  test etmek
- Uçtan uca bir Scenario-Based Test tasarlamak
- Error Guessing'i sistematik bir kontrol listesi olarak uygulamak
- Pairwise yaklaşımıyla kombinasyon test maliyetini azaltmak
- Uygun test data kategorilerini (PII kullanmadan) seçmek
- Bir requirement'tan başlayarak tam bir test paketi (condition →
  scenario → case → data → traceability → automation candidate)
  üretmek — `examples/AUTHENTICATION-FEATURE/` bunun kanıtıdır

---

## Sonraki Adım

Bu bölümde tasarlanan test case'lerin **yönetimi** (test plan, test
suite organizasyonu, execution takibi) ve bulunan defect'lerin
**yönetimi** (severity/priority, triage, retest) `05-TEST-MANAGEMENT/`
ve `06-DEFECT-MANAGEMENT/` klasörlerinde, ileriki bir Phase'de ele
alınacaktır.

---

## İlgili Repository Dokümanları

- [Root README](../../README.md)
- [QA Competency Map](../../QA-COMPETENCY-MAP.md)
- [00-QA-FOUNDATIONS](../00-QA-FOUNDATIONS/README.md)
- [01-REQUIREMENT-ANALYSIS](../01-REQUIREMENT-ANALYSIS/README.md)
- [02-RISK-BASED-TESTING](../02-RISK-BASED-TESTING/README.md)
