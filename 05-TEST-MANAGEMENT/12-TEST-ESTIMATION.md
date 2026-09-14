# Test Estimation

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Bu feature'ı test etmek ne kadar sürer?" sorusuna güvenilir bir
cevap veremeyen bir QA, planlamaya dahil edilemez. Bu dosya, Test
Estimation'ın (QA Estimate) hangi faktörlere dayanması gerektiğini
anlatır.

---

## 2. Test Estimation Nedir?

**Test Estimation (QA Estimate)**, bir feature/release'in test
edilmesi için gereken zaman ve kaynağın tahmin edilmesi sürecidir.

---

## 3. Estimation'ı Etkileyen Faktörler

### Requirement Karmaşıklığı

Kaç Business Rule, kaç Acceptance Criteria var? Karmaşıklık arttıkça
test tasarım süresi artar.

### Risk Seviyesi

Yüksek riskli alanlar (bkz. `02-RISK-BASED-TESTING/`), daha
derinlemesine test gerektirir — bu, süreyi doğrudan etkiler.

### Test Data Hazırlığı

Karmaşık test data senaryoları (bkz.
`03-TEST-DESIGN/09-TEST-DATA-DESIGN.md`), ek hazırlık süresi
gerektirir.

### Bağımlılıklar

Dış bağımlılıkların (bkz.
`01-REQUIREMENT-ANALYSIS/08-DEPENDENCY-ANALYSIS.md`) kararlılığı,
test süresini doğrudan etkiler — kararsız bir bağımlılık, tekrar
denemeler nedeniyle süreyi uzatır.

### Otomasyon Durumu

Regression'ın ne kadarı otomatize edilmiş? Manuel regression süresi,
otomasyon oranıyla ters orantılıdır.

### Ortam Kararlılığı

Test ortamının sık sık kararsız olması, gerçek test süresine ek
zaman katar.

---

## 4. Basit Estimation Yaklaşımı

1. Requirement'ı analiz edin (bkz. `01-REQUIREMENT-ANALYSIS/`) ve
   Test Condition/Scenario sayısını tahmin edin.
2. Her senaryo için ortalama bir tasarım + execution süresi belirleyin
   (geçmiş deneyime dayalı).
3. Risk seviyesine göre bu süreyi ayarlayın (yüksek risk = ek zaman).
4. Regression süresini (otomasyon oranına göre) ekleyin.
5. Bilinmeyenler için bir **buffer** (belirsizlik payı) ekleyin —
   özellikle kararsız bağımlılıklar varsa.

---

## 5. Örnek

**Feature:** Kupon Kodu (orta karmaşıklık, 8 AC, orta risk)

| Aktivite | Tahmini Süre |
|---|---|
| Requirement Analysis + Test Design | 0.5 gün |
| Functional Test Execution (positive/negative/boundary) | 1 gün |
| Business Rule Validation (API seviyesi) | 0.5 gün |
| Regression (kısmi otomasyon mevcut) | 0.5 gün |
| Buffer (Discount Service bağımlılığı kararsız olabilir) | 0.5 gün |
| **Toplam** | **3 gün** |

---

## 6. Common Mistakes

- Estimation'ı yalnızca "kaç test case yazılacak" ile sınırlı
  yapmak, risk ve bağımlılık faktörlerini göz ardı etmek.
- Buffer eklememek ve her zaman "ideal senaryo" üzerinden tahmin
  yapmak.
- Estimation'ı bir kez yapıp, requirement değiştiğinde güncellememek.

---

## 7. Best Practices

- Estimation'ı geçmiş benzer feature'ların gerçek sürelerine dayanarak
  kalibre edin.
- Bilinen kararsız bağımlılıklar için mutlaka buffer ekleyin.
- Estimation'ı requirement değiştiğinde (bkz.
  `01-REQUIREMENT-ANALYSIS/09-CHANGE-IMPACT-ANALYSIS.md`) yeniden
  gözden geçirin.

---

## 8. Interview Notes

- "Bir feature'ın test süresini nasıl tahmin edersiniz?" sorusuna
  Requirement karmaşıklığı, Risk, Test Data, Bağımlılık faktörleriyle
  cevap verin.
- "Estimation'a neden buffer eklenir?" sorusuna, bağımlılık kararsızlığı
  gibi öngörülemeyen risklerin süreyi etkileyebileceğini belirterek
  cevap verin.

---

## İlgili Konular

- [Test Prioritization](13-TEST-PRIORITIZATION.md)
- [02-RISK-BASED-TESTING](../02-RISK-BASED-TESTING/README.md)
- [Test Plan](02-TEST-PLAN.md)
