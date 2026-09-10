# Contributing Guide

Bu doküman Full Stack QA Engineering Handbook & Portfolio repository'sinde
yapılacak bütün değişikliklerin çalışma standardını tanımlar.

Bu kurallar repository sahibi, contributor'lar ve AI coding/review agent'ları
için geçerlidir.

---

# 1. Core Principle

Repository geliştirme döngüsü:

PLAN
→ IMPLEMENT
→ TEST
→ DOCUMENT
→ EVIDENCE
→ REVIEW
→ FIX
→ CLEAN

Bir Phase veya çalışma paketi gerekli validation tamamlanmadan
CLEAN kabul edilemez.

---

# 2. Main Branch Rule

`main` branch stabil repository durumunu temsil eder.

Normal geliştirme doğrudan `main` üzerinde yapılmamalıdır.

Yeni çalışmalar ayrı branch üzerinde gerçekleştirilir.

Örnek:

feature/api-schema-validation

docs/qa-foundations

lab/selenium-basics

fix/broken-documentation-links

---

# 3. Branch Naming

Önerilen branch prefix'leri:

- feature/
- docs/
- lab/
- fix/
- refactor/
- test/
- chore/

Branch isimleri kısa ve açıklayıcı olmalıdır.

---

# 4. Folder Naming Convention

Repository klasör yapısı üç kategoriye ayrılır.

## Primary QA Domain Folders

Ana QA konu klasörleri:

NN-UPPER-KEBAB-CASE

formatında olmalıdır.

Kurallar:

- NN = iki haneli, sıfır dolgulu sıra numarası
- Ardından tire kullanılır
- Kelimeler İngilizce teknik terminolojiyle yazılır
- Büyük harf kullanılır
- Kelimeler tire ile ayrılır

Örnek:

00-QA-FOUNDATIONS

01-REQUIREMENT-ANALYSIS

07-API-TESTING

18-PERFORMANCE-TESTING

## Root Structural Folders

Numaralandırılmayan repository alanları açıklayıcı isim kullanır.

Örnek:

CASE-STUDIES

QA-DEMO-SYSTEM

## Technical / Shared Folders

Ekosistem veya teknik convention gerektiren klasörler ilgili aracın
standart naming yaklaşımını koruyabilir.

Örnek:

.github

shared

workflows

test-data

schemas

helpers

templates

evidence

Nested technical folders için varsayılan:

lower-kebab-case

kullanılabilir.

---

# 5. File Naming Convention

Repository dosya adlandırması içerik türüne göre üç kategoriye ayrılır.

## Repository Governance Files

Ana repository yönetim/dokümantasyon dosyalarında:

UPPER-KEBAB-CASE.md

kullanılır.

Örnek:

DOCUMENTATION-STANDARD.md

QA-COMPETENCY-MAP.md

TERMINOLOGY-GLOSSARY.md

Ekosistem tarafından yaygın kabul edilen standart dosya isimleri
istisnadır:

README.md

CONTRIBUTING.md

LICENSE

## QA Content Documentation

QA içerik dosyaları mümkün olduğunca:

UPPER-KEBAB-CASE.md

veya konu klasörlerinde kısa standart teknik isimler kullanır.

Örnek:

README.md

THEORY.md

HOW-TO.md

INTERVIEW.md

COMMON-MISTAKES.md

BEST-PRACTICES.md

EXPECTED-RESULT.md

ACTUAL-RESULT.md

## Code / Configuration / Tool Files

Kod, config ve framework dosyalarında ilgili teknoloji ekosisteminin
standart naming convention'ı korunur.

Örnek:

package.json

playwright.config.ts

docker-compose.yml

schema.json

validation.js

Dokümantasyon standardı ile source-code naming standardını birbirine
zorla uygulama.

---

# 6. Commit Standard

Commit mesajları yapılan değişikliğin amacını açıkça göstermelidir.

Örnekler:

docs: add API testing fundamentals

test: add negative authentication scenarios

feat: add controlled QA demo API

lab: add Selenium locator examples

fix: correct JSON schema validation example

refactor: improve reusable API validation helpers

chore: update repository structure

---

# 7. Pull Request Rule

Önemli değişiklikler Pull Request üzerinden `main` branch'e alınmalıdır.

Pull Request mümkün olduğunca aşağıdaki bilgileri içermelidir:

- Phase
- Purpose
- Created
- Modified
- Deleted
- Tests
- Evidence
- Known Limitations
- Knowledge Status impact

---

# 8. Knowledge Status Integrity

Repository aşağıdaki statüleri kullanır:

EXPERIENCE

Gerçek profesyonel projelerde doğrudan uygulanmış bilgi.

PARTICIPATED

Gerçek profesyonel projede süreç içerisinde aktif katkı sağlanmış,
ancak ilgili teknoloji veya framework sıfırdan geliştirilmemiştir.

PRACTICED

Repository QA Lab ortamında uygulanmış, çalıştırılmış ve doğrulanmış bilgi.

LEARNING

Henüz yeterli hands-on uygulaması bulunmayan öğrenme alanı.

---

# 9. Status Promotion Rule

Bir konu yalnızca dokümantasyon oluşturulduğu için:

LEARNING → PRACTICED

seviyesine yükseltilemez.

PRACTICED olabilmesi için mümkün olduğunda:

1. Kurulum tamamlanmalıdır.
2. Çalışan implementation oluşturulmalıdır.
3. Positive scenario çalıştırılmalıdır.
4. Negative scenario çalıştırılmalıdır.
5. Beklenen FAIL davranışı gösterilmelidir.
6. Evidence üretilmelidir.
7. Sonuç dokümante edilmelidir.

`EXPERIENCE` statüsü yalnızca gerçek profesyonel deneyim oluştuğunda
kullanılabilir.

---

# 10. Evidence Integrity

Gerçekte çalıştırılmamış test başarılı gösterilemez.

Aşağıdaki evidence türleri uydurulamaz:

- Screenshot
- Video
- Console Log
- Backend Log
- API Response
- Database Result
- Automation Report
- Performance Result
- Security Result
- CI/CD Result

Evidence mevcut değilse açıkça:

NOT EXECUTED

ENVIRONMENT REQUIRED

EVIDENCE PENDING

kullanılmalıdır.

---

# 11. Documentation Language

Ana anlatım dili:

Türkçe

Teknik terminoloji:

İngilizce

Örnek:

Cevap Gövdesi (Response Body)

Şema Doğrulama (Schema Validation)

Sınır Değer Analizi (Boundary Value Analysis)

Kimlik Doğrulama (Authentication)

Yetkilendirme (Authorization)

Kod içerisindeki identifier, variable, class, method, function ve
framework isimleri İngilizce kullanılmalıdır.

---

# 12. Documentation Structure

Teknik konular mümkün olduğunca şu yapıyı takip etmelidir:

1. Definition
2. Purpose
3. Terminology
4. QA Responsibility
5. Scope Boundary
6. Testing Risk
7. Prerequisites
8. How To
9. Example
10. Happy Path
11. Negative Scenario
12. Edge Case
13. Boundary
14. Implementation
15. Code Explanation
16. Expected Result
17. Actual Result
18. Evidence
19. Common Mistakes
20. Best Practices
21. Interview Notes

Her konu bütün başlıkları zorunlu olarak kullanmak zorunda değildir.

Konuya anlamlı olmayan başlıklar yalnızca template doldurmak amacıyla
eklenmemelidir.

---

# 13. QA Scope Boundary

Repository'nin amacı QA Engineer'ın her teknik rolün görevini üstlenmesi değildir.

QA açısından temel yaklaşım:

VALIDATE
OBSERVE
ANALYZE
DETECT
ISOLATE
REPORT
VERIFY

Diğer rollerin temel sorumlulukları gerektiğinde açıkça ayrılmalıdır.

Örneğin:

QA:
Database davranışını ve veri tutarlılığını validate eder.

DBA:
Database altyapısını tasarlar ve yönetir.

QA:
CI/CD sonucunu kullanır ve test failure analiz eder.

DevOps:
Pipeline ve infrastructure architecture geliştirir.

QA:
Security risklerini test eder ve raporlar.

Security Engineer:
Derin security assessment ve offensive security çalışmaları yürütür.

---

# 14. Real Company Data Rule

Repository içerisine gerçek şirket veya müşteri sistemlerinden:

- Production URL
- Internal URL
- Token
- Password
- API Key
- Secret
- Customer Data
- Personal Data
- Confidential Logs
- Proprietary Source Code
- Confidential Documentation

eklenemez.

Gerçek deneyim gerektiğinde anonimleştirilmiş Case Study olarak
dokümante edilir.

---

# 15. Controlled QA Lab Rule

Hands-on uygulamalar mümkün olduğunca kontrollü QA Demo System üzerinde
çalıştırılmalıdır.

Lab sisteminin amacı gerçek teknik davranış üretmektir.

Mock data yalnızca ilgili testing tekniğini öğretmek veya dependency
simulation yapmak için kullanılabilir.

Repository sahte profesyonel deneyim üretmek için mock kullanamaz.

---

# 16. Test Quality Rule

Bir automated test yalnızca çalışıyor diye kaliteli kabul edilmez.

Test mümkün olduğunca:

- deterministic
- isolated
- readable
- repeatable
- maintainable
- meaningful

olmalıdır.

Assertion gerçek business veya technical expectation'ı doğrulamalıdır.

---

# 17. Automation Rule

Automation oluşturulurken mümkün olduğunda şu sorular cevaplanmalıdır:

- Bu testi neden automate ediyoruz?
- Automation candidate olmasının sebebi nedir?
- Manuel testten avantajı nedir?
- Bakım maliyeti nedir?
- Hangi regression riskini koruyor?
- Test failure ne ifade ediyor?
- Hangi evidence üretiliyor?

---

# 18. AI Agent Rule

AI agent repository sahibinin sahip olmadığı profesyonel deneyimi
varmış gibi gösteremez.

AI agent:

- Knowledge Status değiştiremez
- Sahte evidence üretemez
- Test çalıştırmadan PASS yazamaz
- Tool veya teknoloji kullanmadan kullanılmış gibi gösteremez
- Confidential information ekleyemez
- Scope dışında büyük değişiklik yapamaz

---

# 19. Claude Implementation Role

Claude veya benzeri implementation agent:

- İstenen scope'u uygular
- Kod oluşturur
- Documentation oluşturur
- Testleri çalıştırır
- Sonuçları raporlar
- Evidence üretir
- Scope dışına çıkmaz

Implementation tamamlandığında ilgili çalışma paketinde DURmalıdır.

---

# 20. Independent Review Role

Codex veya başka bağımsız reviewer:

- Technical correctness
- QA correctness
- Architecture
- Test quality
- Documentation quality
- Security
- Maintainability
- False evidence
- Unsupported experience claims
- Broken links
- Missing tests
- Scope violations

açısından bağımsız inceleme yapar.

Reviewer implementation'ı yalnızca onaylamak için değil,
problem bulmak amacıyla incelemelidir.

---

# 21. Review Severity

Review bulguları mümkün olduğunda:

P0 — Critical

P1 — High

P2 — Medium

P3 — Low

olarak sınıflandırılır.

Phase kapanmadan önce kabul edilmeyen kritik bulgular çözülmelidir.

---

# 22. Learning Lab Completion

Bir Learning Lab tamamlandığında aşağıdaki çıktıların bulunması hedeflenir:

- THEORY
- HOW TO
- WORKING EXAMPLE
- POSITIVE TEST
- NEGATIVE TEST
- EDGE / BOUNDARY where applicable
- TEST RESULT
- EVIDENCE
- COMMON MISTAKES
- INTERVIEW NOTES

Bu şartlar sağlandığında konu `PRACTICED` statüsü için değerlendirilebilir.

---

# 23. Phase Completion

Her Phase aşağıdaki durumlarla takip edilir:

NOT STARTED

IN PROGRESS

BLOCKED

REVIEW

CLEAN

Bir Phase yalnızca planlanan deliverable'lar tamamlandığında ve gerekli
review sonucunda kritik açık bulunmadığında CLEAN olabilir.

---

# 24. Repository Objective

Bu repository'nin hedefi mümkün olan en fazla technology ismini listelemek değildir.

Hedef:

- QA düşünce sistemini göstermek
- Gerçek deneyimi teknik kanıtla desteklemek
- Bilinmeyen alanları öğretmek
- Hands-on QA pratiği oluşturmak
- Full Stack QA Engineering perspektifi geliştirmek
- Teknik mülakatlarda kalıcı referans kaynağı oluşturmak
- Repository sahibinin kariyeriyle birlikte yaşayan bir QA knowledge system oluşturmaktır
