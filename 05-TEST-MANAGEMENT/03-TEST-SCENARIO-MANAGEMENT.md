# Test Scenario Management

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

`03-TEST-DESIGN/01-TEST-CONDITION-SCENARIO-CASE.md`, Test Scenario'nun
**ne olduğunu** anlatmıştı. Bu dosya, bir test operasyonunda **çok
sayıda** Test Scenario'nun nasıl yönetildiğini (organize edildiğini,
gruplandığını, güncel tutulduğunu) anlatır.

---

## 2. Test Scenario Management Nedir?

Bir feature veya sistem büyüdükçe, onlarca hatta yüzlerce Test
Scenario birikir. Test Scenario Management, bu senaryoların:

- **Feature bazında gruplandırılmasını**
- **Requirement'a bağlanmasını** (Traceability)
- **Güncel tutulmasını** (requirement değiştiğinde senaryonun da
  güncellenmesi)
- **Tekrar kullanılabilir olmasını**

sağlayan disiplindir.

---

## 3. Test Scenario'ları Organize Etme

### Feature Bazlı Gruplandırma

Senaryolar, ait oldukları feature'a göre gruplanır (örn.
"Authentication", "Checkout", "Profile").

### Öncelik Bazlı Etiketleme

Her senaryo, Risk-Based Testing'e göre önceliklendirilir (bkz.
`02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md`) — bu,
`06-SMOKE-SANITY-REGRESSION-SUITES.md`'de anlatılan suite'lere
senaryo seçerken kullanılır.

### Flow Tipi Etiketleme

Her senaryo, `01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md`'deki
sınıflandırmaya göre (Happy Path, Alternative Flow, Negative Flow,
Edge Case) etiketlenir — bu, coverage dengesini (yalnızca happy path
mi, yoksa dengeli mi) görünür kılar.

---

## 4. Requirement Değiştiğinde Senaryo Yönetimi

`01-REQUIREMENT-ANALYSIS/09-CHANGE-IMPACT-ANALYSIS.md`'de anlatıldığı
gibi, bir requirement değiştiğinde ilgili Test Scenario'lar
**Traceability** üzerinden bulunup gözden geçirilmelidir. Test
Scenario Management, bu ilişkiyi (Requirement ↔ Scenario) kayıt altında
tutmayı içerir.

---

## 5. Test Scenario Yaşam Döngüsü

```text
Oluşturulur (Requirement/AC'den türetilir)
   ↓
Test Case'lere dönüştürülür
   ↓
Suite'lere dahil edilir (Smoke/Sanity/Regression)
   ↓
Requirement değiştiğinde gözden geçirilir
   ↓
Artık geçerli değilse: Deprecated / Arşivlenir
```

---

## 6. Common Mistakes

- Senaryoları hiçbir feature/requirement gruplandırması olmadan tek
  bir düz listede tutmak.
- Requirement değiştiğinde ilgili senaryoları güncellemeyi unutmak —
  artık geçersiz bir senaryonun suite'te kalmasına yol açar.
- Aynı senaryoyu farklı isimlerle birden fazla kez oluşturmak
  (duplicate).

---

## 7. Best Practices

- Her senaryoyu, ilgili Requirement/AC ID'sine referans vererek
  oluşturun.
- Senaryoları feature ve flow tipine göre etiketleyin.
- Artık geçerli olmayan senaryoları silmek yerine "Deprecated" olarak
  işaretleyip arşivleyin — bu, geçmiş kararların izini korur.

---

## 8. Interview Notes

- "Çok sayıda Test Scenario'yu nasıl organize edersiniz?" sorusuna
  feature bazlı gruplandırma ve Traceability ile cevap verin.
- "Bir requirement değiştiğinde Test Scenario'lar ne olur?" sorusuna,
  Traceability üzerinden bulunup gözden geçirildiğini belirterek
  cevap verin.

---

## İlgili Konular

- [03-TEST-DESIGN — Test Condition/Scenario/Case](../03-TEST-DESIGN/01-TEST-CONDITION-SCENARIO-CASE.md)
- [Test Case Management](04-TEST-CASE-MANAGEMENT.md)
- [Traceability Management](09-TRACEABILITY-MANAGEMENT.md)
