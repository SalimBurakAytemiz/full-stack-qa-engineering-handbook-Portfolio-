# Test Plan

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Test Plan, Test Strategy'nin (bkz. `01-TEST-STRATEGY.md`) genel
prensiplerini, **somut bir release veya feature'a** uygulayan
çalışma dokümanıdır. Bu dosya, iyi bir Test Plan'ın içermesi gereken
alanları detaylandırır.

---

## 2. Test Plan Nedir?

**Test Plan**, belirli bir feature, sprint veya release için hangi
test aktivitelerinin, hangi kapsamda, hangi kaynaklarla ve hangi
takvimle yürütüleceğini tanımlayan detaylı dokümandır.

---

## 3. Test Plan'ın İçeriği

### Scope

Bu test planının hangi feature/release'i kapsadığı.

### In Scope

Test edilecek özellikler/alanlar açıkça listelenir.

### Out of Scope

Bu release'de **bilinçli olarak** test edilmeyecek alanlar açıkça
listelenir — bu, `00-QA-FOUNDATIONS/COMMON-MISTAKES.md`'de vurgulanan
"Out of Scope yazmamak" hatasını önler.

### Test Objectives

Bu test aktivitesinin somut hedefleri (örn. "kupon kodu akışının
business kurallarına uygunluğunu doğrulamak").

### Resources

Kim, hangi rolle bu test aktivitesinde yer alacak.

### Environment

Hangi test ortamı(ları) kullanılacak.

### Test Data

Hangi test verisi gerekli, nasıl hazırlanacak (bkz.
`03-TEST-DESIGN/09-TEST-DATA-DESIGN.md`).

### Dependencies

Bu test planının bağımlı olduğu servisler/ekipler/ortamlar (bkz.
`01-REQUIREMENT-ANALYSIS/08-DEPENDENCY-ANALYSIS.md`).

### Schedule

Test aktivitelerinin takvimi (ne zaman başlar, ne zaman biter).

### Risks

Bu test planına özgü riskler (bkz. `02-RISK-BASED-TESTING/`).

### Entry Criteria

Test aktivitesine başlama koşulları (bkz.
`00-QA-FOUNDATIONS/09-ENTRY-AND-EXIT-CRITERIA.md`).

### Exit Criteria

Test aktivitesini tamamlama koşulları.

### Deliverables

Bu test planının sonunda üretilecek çıktılar (test raporu, coverage
matrisi vb.).

---

## 4. Somut Örnek: Kupon Kodu Feature Test Planı

| Alan | İçerik |
|---|---|
| Scope | "Kupon Kodu" özelliği, v2.3 release |
| In Scope | Kupon uygulama, minimum tutar kontrolü, geçersiz kupon senaryoları |
| Out of Scope | Çoklu kupon kombinasyonu (bir sonraki sprint'e planlandı) |
| Test Objectives | Business kurallarının (bkz. `01-REQUIREMENT-ANALYSIS/05-BUSINESS-RULE-ANALYSIS.md`) API ve UI seviyesinde doğru uygulandığını doğrulamak |
| Resources | 1 QA Engineer (functional + regression), 1 Developer (destek) |
| Environment | Staging |
| Test Data | 5 farklı kupon tipi (geçerli, süresi dolmuş, min. tutar altı vb.) |
| Dependencies | Discount Service (internal) |
| Schedule | 2 gün (functional) + 1 gün (regression) |
| Risks | Discount Service'in staging'de kararsız olması |
| Entry Criteria | Build deploy edilmiş, Discount Service ayakta |
| Exit Criteria | P0 = 0, planlanan senaryoların tamamı çalıştırılmış |
| Deliverables | Test Summary Report (bkz. `15-TEST-REPORTING.md`) |

---

## 5. Common Mistakes

- "Out of Scope" bölümünü hiç yazmamak — bu, sonradan "neden test
  edilmedi" sorusuna cevapsız kalmaya yol açar.
- Test Plan'ı Test Strategy ile aynı doküman sanmak.
- Entry/Exit Criteria'yı belirsiz veya ölçülemez yazmak.

---

## 6. Best Practices

- Her release/sprint için Test Plan'ı, Test Strategy'nin
  prensipleriyle tutarlı şekilde oluşturun.
- Out of Scope maddelerini gerekçeleriyle birlikte yazın.
- Test Plan'ı `05-TEST-MANAGEMENT/templates/TEST-PLAN-TEMPLATE.md`
  şablonuyla tutarlı tutun.

---

## 7. Interview Notes

- "Bir Test Plan'da hangi alanlar mutlaka bulunmalıdır?" sorusuna en
  az 6-7 alanı (Scope, In/Out of Scope, Entry/Exit Criteria,
  Schedule, Risks) sayarak cevap verin.
- "Out of Scope neden önemlidir?" sorusuna, bilinçli kapsam dışı
  bırakmanın sonradan şeffaflık sağladığını belirterek cevap verin.

---

## İlgili Konular

- [Test Strategy](01-TEST-STRATEGY.md)
- [templates/TEST-PLAN-TEMPLATE.md](templates/TEST-PLAN-TEMPLATE.md)
- [Entry/Exit Criteria](11-ENTRY-EXIT-CRITERIA.md)
