# 01 — Requirement Analysis

**Knowledge Status: EXPERIENCE**

---

## Bölümün Amacı

Bu bölümün amacı, bir QA Engineer'ın kendisine verilen bir requirement
veya feature'ı **doğrudan Test Case'e çevirmek yerine** önce nasıl
analiz etmesi, sorgulaması ve sistematik bir kapsama dönüştürmesi
gerektiğini öğretmektir.

Bir requirement'ı okur okumaz test case yazmaya başlamak, `00-QA-FOUNDATIONS/COMMON-MISTAKES.md`'de anlatılan en temel hatalardan
biridir. Bu bölüm, o adımın öncesindeki analiz disiplinini kazandırır.

---

## Knowledge Status

QA-COMPETENCY-MAP.md ile uyumlu olarak, Requirement & Software Analysis
kapsamındaki temel bilgiler:

**Status: EXPERIENCE**

olarak işaretlenmiştir. Bu statü, root `QA-COMPETENCY-MAP.md`
dosyasındaki "2. Requirement & Software Analysis" kategorisiyle
tutarlıdır ve bu Phase'de değiştirilmemiştir.

---

## Önerilen Öğrenme Sırası

1. [01 — Requirement Types](01-REQUIREMENT-TYPES.md)
2. [02 — Acceptance Criteria](02-ACCEPTANCE-CRITERIA.md)
3. [03 — Requirement Clarification](03-REQUIREMENT-CLARIFICATION.md)
4. [04 — Requirement Testability](04-REQUIREMENT-TESTABILITY.md)
5. [05 — Business Rule Analysis](05-BUSINESS-RULE-ANALYSIS.md)
6. [06 — Happy / Alternative / Negative Flows](06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md)
7. [07 — Impact Analysis](07-IMPACT-ANALYSIS.md)
8. [08 — Dependency Analysis](08-DEPENDENCY-ANALYSIS.md)
9. [09 — Change Impact Analysis](09-CHANGE-IMPACT-ANALYSIS.md)
10. [10 — Requirement Review Checklist](10-REQUIREMENT-REVIEW-CHECKLIST.md)
11. [11 — Common Requirement Problems](11-COMMON-REQUIREMENT-PROBLEMS.md)

Ek kaynak:

- [Interview Notes](INTERVIEW.md)

---

## Konu Listesi

| # | Konu | Odak |
|---|---|---|
| 01 | Requirement Types | Business/Functional/Non-Functional/Technical/User Story/AC/Business Rule/Constraint ayrımı |
| 02 | Acceptance Criteria | İyi AC'nin özellikleri, kötü/iyi örnek karşılaştırması |
| 03 | Requirement Clarification | Development öncesi sorulması gereken sorular |
| 04 | Requirement Testability | Test edilebilir requirement kriterleri |
| 05 | Business Rule Analysis | Technical vs Business Rule Validation |
| 06 | Happy / Alternative / Negative Flows | Checkout örneği üzerinden akış türleri |
| 07 | Impact Analysis | Bir değişikliğin etkilediği sistem alanları |
| 08 | Dependency Analysis | Internal/External/Third-Party/Environment/Data bağımlılıkları |
| 09 | Change Impact Analysis | Requirement değiştiğinde ne güncellenmeli |
| 10 | Requirement Review Checklist | Kullanılabilir kontrol listesi |
| 11 | Common Requirement Problems | 13 sık görülen requirement problemi |

---

## Bu Bölümü Tamamladığınızda Yapabiliyor Olmanız Gerekenler

- Bir requirement'ı türüne göre (Business/Functional/Non-Functional
  vb.) ayırt etmek
- İyi ve kötü bir Acceptance Criteria'yı ayırt etmek ve yeniden yazmak
- Development başlamadan önce sorulması gereken clarification
  sorularını üretmek
- Bir requirement'ın test edilebilir olup olmadığını değerlendirmek
- Business Rule'ları yalnızca UI değil, API/DB seviyesinde de
  doğrulamayı planlamak
- Happy Path, Alternative Flow, Negative Flow ve Edge Case'i
  birbirinden ayırt etmek
- Bir değişikliğin etki alanını (Impact Analysis) ve bağımlılıklarını
  (Dependency Analysis) haritalamak
- Requirement Review Checklist'i gerçek bir feature'a uygulamak
- Sık görülen requirement problemlerini erken fark etmek

---

## Sonraki Adım

Bu bölümdeki analiz becerileri, `02-RISK-BASED-TESTING/` ile
önceliklendirmeye ve `03-TEST-DESIGN/` ile somut test case üretimine
dönüşür. `03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/` klasöründe,
bu bölümdeki tüm adımların uçtan uca uygulanmış hâlini bulabilirsiniz.

---

## İlgili Repository Dokümanları

- [Root README](../README.md)
- [Documentation Standard](../DOCUMENTATION-STANDARD.md)
- [QA Competency Map](../QA-COMPETENCY-MAP.md)
- [Terminology Glossary](../TERMINOLOGY-GLOSSARY.md)
- [00-QA-FOUNDATIONS](../00-QA-FOUNDATIONS/README.md)
