# 00 — QA Foundations

**Knowledge Status: EXPERIENCE**

---

## Bölümün Amacı

Bu bölüm, Full Stack QA Engineering Handbook'un temel bilgi katmanıdır.
Amacı yalnızca tanım listelemek değildir; her konuyu şu mantıkla ele
alır:

- Nedir?
- Neden önemlidir?
- QA açısından neden kullanılır?
- Gerçek projede nerede karşıma çıkar?
- Yanlış uygulanırsa ne olur?
- Gerçekçi örnek
- Common Mistakes
- Best Practices
- Interview Notes

Bu bölüm, repository'nin geri kalanındaki daha derin konuların (Risk-Based
Testing, Test Design, API Testing, Database Testing vb.) üzerine inşa
edileceği kavramsal zemini oluşturur.

---

## Knowledge Status

QA-COMPETENCY-MAP.md ile uyumlu olarak bu bölümdeki temel QA Foundations
/ Test Design bilgileri:

**Status: EXPERIENCE**

olarak işaretlenmiştir. Bu statü, root `QA-COMPETENCY-MAP.md`
dosyasındaki "1. QA Fundamentals & Test Design" kategorisiyle
tutarlıdır ve bu Phase'de değiştirilmemiştir.

---

## Kimler İçin?

- QA'ya sıfırdan başlayan kişiler
- Manual test'ten otomasyona geçmek isteyen ve temel kavramları
  sağlamlaştırmak isteyenler
- Teknik mülakat hazırlığı yapan QA Engineer adayları
- QA terminolojisini İngilizce teknik terim + Türkçe anlatımla
  öğrenmek isteyenler

---

## "QA'yı Sıfırdan Öğrenmeye Başlasam Önce Neyi Anlamalıyım?"

Bu bölüm tam olarak bu soruya cevap verecek şekilde sıralanmıştır.
Önce QA'nın ne olduğunu ve ne olmadığını (01), sonra doğru/geçerli
ürün ayrımını (02), sonra sürecin bütününü (03) anlarsınız. Ardından
test seviyeleri ve türleri (04-05), erken hata yakalama (06),
terminoloji (07), doğru sonucun kaynağı (08), süreç kapıları (09),
izlenebilirlik (10), lifecycle'daki QA yeri (11), sınırlar (12) ve
son olarak önceliklendirme ile tasarım/kalite kapıları (13-15) ile
temeliniz tamamlanır.

---

## Önerilen Öğrenme Sırası

1. [01 — QA / QC / Software Testing](01-QA-QC-AND-SOFTWARE-TESTING.md)
2. [02 — Verification & Validation](02-VERIFICATION-AND-VALIDATION.md)
3. [03 — SDLC & STLC](03-SDLC-AND-STLC.md)
4. [04 — Test Levels](04-TEST-LEVELS.md)
5. [05 — Test Types](05-TEST-TYPES.md)
6. [06 — Static & Dynamic Testing](06-STATIC-AND-DYNAMIC-TESTING.md)
7. [07 — Error / Defect / Failure](07-ERROR-DEFECT-FAILURE.md)
8. [08 — Test Oracle](08-TEST-ORACLE.md)
9. [09 — Entry & Exit Criteria](09-ENTRY-AND-EXIT-CRITERIA.md)
10. [10 — Traceability Fundamentals](10-TRACEABILITY-FUNDAMENTALS.md)
11. [11 — Shift Left & Shift Right](11-SHIFT-LEFT-AND-SHIFT-RIGHT.md)
12. [12 — QA Role & Scope Boundaries](12-QA-ROLE-AND-SCOPE-BOUNDARIES.md)
13. [13 — Risk-Based Testing (Overview)](13-RISK-BASED-TESTING-OVERVIEW.md)
14. [14 — Test Design Techniques (Overview)](14-TEST-DESIGN-TECHNIQUES-OVERVIEW.md)
15. [15 — Quality Gates (Overview)](15-QUALITY-GATES-OVERVIEW.md)

Ek kaynaklar:

- [Common Mistakes](COMMON-MISTAKES.md)
- [Interview Notes](INTERVIEW.md)

---

## Konu Listesi

| # | Konu | Odak |
|---|---|---|
| 01 | QA / QC / Software Testing | Kavramsal ayrım, lifecycle içindeki QA |
| 02 | Verification & Validation | Doğru mu geliştiriliyor / doğru şey mi |
| 03 | SDLC & STLC | Geliştirme ve test yaşam döngüsü |
| 04 | Test Levels | Unit → Acceptance, sorumluluk sınırları |
| 05 | Test Types | Functional, Regression, Smoke, Sanity vb. |
| 06 | Static & Dynamic Testing | Çalıştırmadan / çalıştırarak test etme |
| 07 | Error / Defect / Failure | Neden-sonuç zinciri |
| 08 | Test Oracle | Expected Result'ın kaynağı |
| 09 | Entry & Exit Criteria | Başlama / bitirme koşulları |
| 10 | Traceability Fundamentals | Requirement → Release izlenebilirliği |
| 11 | Shift Left & Shift Right | Erken önleme / production doğrulama |
| 12 | QA Role & Scope Boundaries | Komşu roller ile sınırlar |
| 13 | Risk-Based Testing (Overview) | Probability × Impact |
| 14 | Test Design Techniques (Overview) | EP, BVA, Decision Table, State Transition |
| 15 | Quality Gates (Overview) | Release kararının çok boyutluluğu |

---

## Bu Bölüm Kapsamı Dışında Olanlar

Aşağıdaki konular yalnızca **overview** seviyesinde ele alınmıştır;
detaylı teknik uygulamaları ileriki Phase'lere aittir:

- **Risk-Based Testing** derinlemesine uygulama → `02-RISK-BASED-TESTING/`
- **Test Design Techniques** detaylı case ve alıştırmalar → `03-TEST-DESIGN/`

---

## Bölüm Sonunda Öğrenilmiş Olması Gerekenler

Bu bölümü tamamladığınızda şunları yapabiliyor olmalısınız:

- QA, QC ve Testing arasındaki farkı örneklerle açıklamak
- Verification ve Validation'ı somut bir requirement üzerinden ayırt
  etmek
- SDLC/STLC aşamalarında QA'nın rolünü tanımlamak
- Test Levels ve Test Types arasındaki farkı ve QA/Developer sorumluluk
  sınırını açıklamak
- Bir test sonucunun Expected Result'ının hangi Oracle'a dayandığını
  sorgulamak
- Entry/Exit Criteria ve Quality Gate kavramlarını bir release
  senaryosuna uygulamak
- Requirement'tan Release'e kadar Traceability zincirini kurmak
- Shift Left ve Shift Right aktivitelerini örneklerle ayırt etmek
- QA'nın komşu roller (Developer, DBA, DevOps, Security Engineer vb.)
  ile sınırlarını doğru çizmek
- Risk-Based Testing ve Test Design Techniques'in temel mantığını
  (detaylı uygulama olmadan) anlamak

---

## Interview Hazırlığı

Bu bölümdeki konuların teknik mülakat formatında tekrarı için:

**[INTERVIEW.md](INTERVIEW.md)** — 26 soru, her biri Question / Short
Answer / Detailed Answer / Example / Common Trap formatında.

Sık yapılan hataların listesi için:

**[COMMON-MISTAKES.md](COMMON-MISTAKES.md)**

---

## İlgili Repository Dokümanları

- [Root README](../README.md)
- [Documentation Standard](../DOCUMENTATION-STANDARD.md)
- [QA Competency Map](../QA-COMPETENCY-MAP.md)
- [Roadmap](../ROADMAP.md)
- [Terminology Glossary](../TERMINOLOGY-GLOSSARY.md)
- [Contributing Guide](../CONTRIBUTING.md)
