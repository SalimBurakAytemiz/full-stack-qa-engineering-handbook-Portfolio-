# Test Case Management

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bu dosya, `03-TEST-DESIGN/`'daki tasarım tekniklerinin ürettiği Test
Case'lerin **profesyonel olarak nasıl dokümante edileceğini** ve
yönetileceğini anlatır. İyi yönetilmeyen bir Test Case seti, ne kadar
iyi tasarlanmış olursa olsun değerini kaybeder.

---

## 2. Profesyonel Test Case Alanları

| Alan | Açıklama |
|---|---|
| **Test Case ID** | Benzersiz tanımlayıcı (bu repository'de yalnızca eğitim amaçlı örnek formatlar kullanılır — governance seviyesinde bir ID standardı belirlenmemiştir). |
| **Title** | Test case'in kısa, açıklayıcı başlığı. |
| **Requirement** | Bu test case'in doğruladığı Requirement/AC referansı (Traceability). |
| **Feature** | Ait olduğu feature/modül. |
| **Test Type** | Positive / Negative / Edge / Boundary (bkz. `03-TEST-DESIGN/10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md`). |
| **Priority** | Risk-Based değerlendirmeden gelen öncelik. |
| **Preconditions** | Test öncesi sağlanması gereken durum. |
| **Test Data** | Kullanılacak veri (bkz. `03-TEST-DESIGN/09-TEST-DATA-DESIGN.md`). |
| **Steps** | Sırayla uygulanacak adımlar. |
| **Expected Result** | Beklenen sonuç (Test Oracle'a dayanmalı — bkz. `00-QA-FOUNDATIONS/08-TEST-ORACLE.md`). |
| **Actual Result** | Execution sonrası gözlemlenen gerçek sonuç. |
| **Environment** | Testin çalıştırıldığı ortam. |
| **Execution Status** | PASS / FAIL / BLOCKED / NOT EXECUTED / SKIPPED (bkz. `07-TEST-EXECUTION-STATUS.md`). |
| **Automation Candidate** | Bu test case'in otomasyona uygunluğu (bkz. `03-TEST-DESIGN/12-AUTOMATION-CANDIDATE-ANALYSIS.md`). |
| **Evidence** | Test sonucunu destekleyen kanıt (bkz. `08-TEST-EVIDENCE-MANAGEMENT.md`). |
| **Defect Link** | Eğer FAIL olduysa, ilgili defect'e referans (bkz. `06-DEFECT-MANAGEMENT/`). |

---

## 3. Test Case Çok Uzun Olmak Zorunda Değildir

Bir Test Case'in "profesyonel" olması, uzun olması anlamına gelmez.
Aşağıdaki örnek, kısa ama tam olarak yeterli bir Test Case'dir:

```text
Test Case ID: TC-AUTH-HP-001
Title: Geçerli credential ile başarılı login
Requirement: AC-AUTH-001
Test Type: Positive
Priority: High
Preconditions: Aktif kullanıcı hesabı mevcut.
Test Data: email=test.active01@example.com, password=ValidPass123!
Steps:
  1. Login sayfasını aç.
  2. Geçerli email/password gir.
  3. "Giriş Yap" butonuna tıkla.
Expected Result: Kullanıcı ana sayfaya yönlendirilir.
Automation Candidate: Evet
```

Bu Test Case, gereğinden fazla detay içermez ama **başka bir QA'nın
anlayıp uygulayabileceği kadar açıktır** — bu, en önemli kalite
kriteridir.

---

## 4. "Başka Bir QA Anlayıp Uygulayabilmeli" Testi

Bir Test Case'in yeterince açık olup olmadığını test etmenin en iyi
yolu şu soruyu sormaktır:

> "Bu test case'i daha önce hiç görmemiş, feature'ı hiç bilmeyen bir
> QA Engineer'a verirsem, tam olarak benim kastettiğim adımları
> uygulayıp aynı sonuca ulaşır mı?"

Eğer cevap "hayır, ek açıklama gerekir" ise, Test Case yeterince açık
değildir — steps veya preconditions netleştirilmelidir (bkz.
`06-DEFECT-MANAGEMENT/04-STEPS-TO-REPRODUCE.md`'deki benzer prensip).

---

## 5. Common Mistakes

- Test Case'i gereksiz yere uzatıp okunabilirliği düşürmek.
- Preconditions'ı atlayıp, test case'i her zaman "temiz bir ortamda"
  başlıyormuş gibi yazmak.
- Expected Result'ı belirsiz yazmak (örn. "doğru çalışmalı" — bkz.
  `00-QA-FOUNDATIONS/08-TEST-ORACLE.md`).

---

## 6. Best Practices

- Her Test Case'i `templates/TEST-CASE-TEMPLATE.md` formatıyla
  tutarlı yazın.
- Test Case'i yazdıktan sonra, "başka bir QA anlar mı" testini
  kendiniz uygulayın.
- Automation Candidate ve Defect Link alanlarını güncel tutun.

---

## 7. Interview Notes

- "Profesyonel bir Test Case'te hangi alanlar bulunmalıdır?" sorusuna
  en az 10 alanı (ID, Title, Requirement, Steps, Expected Result,
  Execution Status vb.) sayarak cevap verin.
- "Bir Test Case ne kadar detaylı olmalıdır?" sorusuna, uzunluğun
  değil anlaşılırlığın kriter olduğunu vurgulayarak cevap verin.

---

## İlgili Konular

- [03-TEST-DESIGN — Test Condition/Scenario/Case](../03-TEST-DESIGN/01-TEST-CONDITION-SCENARIO-CASE.md)
- [templates/TEST-CASE-TEMPLATE.md](templates/TEST-CASE-TEMPLATE.md)
- [Test Execution Status](07-TEST-EXECUTION-STATUS.md)
