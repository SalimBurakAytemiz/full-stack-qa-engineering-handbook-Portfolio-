# Test Strategy

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Test Strategy, bir organizasyonun veya ürünün **genel** test yaklaşımını
tanımlar. Test Plan (bkz. `02-TEST-PLAN.md`) ile sık karıştırılır; bu
dosya, Test Strategy'nin kendine özgü yerini netleştirir.

---

## 2. Test Strategy Nedir?

**Test Strategy**, bir organizasyon veya ürün ailesi için **uzun
vadeli, yüksek seviyeli** test yaklaşımını tanımlayan dokümandır.
Genellikle tek bir feature veya release'e değil, **tüm ürüne**
uygulanır.

---

## 3. Test Strategy'nin İçeriği

### Test Approach

Genel test felsefesi: risk-based mi, coverage-based mi, hibrit mi?
Hangi test seviyelerine (unit, integration, system, UAT) ne kadar
ağırlık verilecek?

### Test Levels

Hangi test seviyeleri kullanılacak ve her seviyenin sorumluluğu ne
(bkz. `00-QA-FOUNDATIONS/04-TEST-LEVELS.md`)?

### Test Types

Hangi test türleri (functional, regression, performance, security vb.)
standart olarak uygulanacak?

### Automation Approach

Hangi test seviyelerinde otomasyon önceliklendirilecek? Otomasyon
aracı/framework seçim prensipleri nedir?

### Environment Approach

Kaç ortam (DEV, QA, UAT, Staging, Production) kullanılacak, her
birinin amacı ne?

### Risk Approach

Risk değerlendirmesi nasıl yapılacak, hangi risk seviyesi hangi test
derinliğini gerektirir (bkz.
`02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md`)?

### Quality Principles

Organizasyonun kalite ile ilgili temel prensipleri (örn. "Evidence
Integrity", "Shift Left" — bkz. `CONTRIBUTING.md`).

---

## 4. Test Strategy vs Test Plan — Karşılaştırma

| | Test Strategy | Test Plan |
|---|---|---|
| **Purpose** | Genel test felsefesini ve yaklaşımını tanımlamak | Belirli bir feature/release için somut test aktivitelerini planlamak |
| **Scope** | Organizasyon/ürün geneli | Tek bir feature, sprint veya release |
| **Level** | Yüksek seviye, stratejik | Detaylı, taktiksel |
| **Ownership** | Genellikle QA Lead/Manager | Genellikle o release'in QA sorumlusu |
| **When Created** | Nadiren, uzun vadeli (yılda bir kez veya büyük değişikliklerde) | Her önemli release/sprint için |
| **What It Contains** | Approach, Levels, Types, Automation, Environment, Risk, Quality Principles | Scope, Objectives, Resources, Schedule, Entry/Exit Criteria, Deliverables |
| **How Often It Changes** | Nadiren değişir | Her release'de yeniden oluşturulur/güncellenir |

---

## 5. Somut Örnek

**Test Strategy (organizasyon geneli):** "Tüm kritik kullanıcı
akışları (checkout, authentication) için System ve E2E seviyesinde
otomasyon önceliklendirilir. Risk-Based Testing, her release'in test
kapsamını belirler. Her release öncesi Regression Suite'in en az
%95'i çalıştırılmalıdır."

**Test Plan (bu release için):** "Bu sprint'te 'Kupon Kodu' feature'ı
release edilecek. Kapsam: kupon uygulama, minimum tutar kontrolü.
Kapsam dışı: çoklu kupon kombinasyonu (gelecek sprint). Test ortamı:
Staging. Entry Criteria: build deploy edilmiş. Exit Criteria: P0 = 0,
regression %95 üstü."

Görüldüğü gibi Test Plan, Test Strategy'nin **genel prensiplerini**
(Risk-Based Testing, %95 regression eşiği) somut bir release'e
uygular.

---

## 6. Common Mistakes

- Test Strategy ile Test Plan'ı aynı doküman sanmak.
- Test Strategy'yi her release'de yeniden yazmak (oysa nadiren
  değişmelidir).
- Test Strategy'yi yazıp hiçbir Test Plan'a yansıtmamak.

---

## 7. Best Practices

- Test Strategy'yi organizasyonun büyümesiyle birlikte periyodik
  (örn. yılda bir) gözden geçirin.
- Her Test Plan'ın, Test Strategy'nin prensipleriyle tutarlı olduğunu
  doğrulayın.
- Test Strategy'yi kısa ve stratejik tutun — detaylar Test Plan'a
  aittir.

---

## 8. Interview Notes

- "Test Strategy ile Test Plan arasındaki fark nedir?" sorusuna scope
  ve zamanlama farkıyla (organizasyon geneli/uzun vadeli vs
  release bazlı/kısa vadeli) cevap verin.
- "Test Strategy'de neler bulunur?" sorusuna Approach, Levels, Types,
  Automation, Environment, Risk, Quality Principles ile cevap verin.

---

## İlgili Konular

- [Test Plan](02-TEST-PLAN.md)
- [00-QA-FOUNDATIONS — Risk-Based Testing Overview](../00-QA-FOUNDATIONS/13-RISK-BASED-TESTING-OVERVIEW.md)
- [02-RISK-BASED-TESTING](../02-RISK-BASED-TESTING/README.md)
