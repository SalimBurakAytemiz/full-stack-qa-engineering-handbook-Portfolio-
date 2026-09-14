# Test Coverage

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Coverage" kelimesi, sıklıkla yalnızca "kaç test case yazdık" ile
eşitlenir. Bu dosya, Test Coverage'ın gerçekte ne anlama geldiğini ve
neden test case **sayısının** bir coverage ölçütü olmadığını anlatır.

---

## 2. Test Coverage Nedir?

**Test Coverage**, sistemin gereksinimlerinin, kod yollarının veya
risklerinin, test aktiviteleri tarafından **ne ölçüde kapsandığının**
ölçüsüdür.

---

## 3. Coverage'ın Farklı Boyutları

### Requirement Coverage

Kaç Requirement/AC, en az bir Test Case tarafından kapsanıyor (bkz.
`09-TRACEABILITY-MANAGEMENT.md` — RTM).

### Risk Coverage

Yüksek riskli alanlar (bkz. `02-RISK-BASED-TESTING/03-RISK-MATRIX.md`),
test kapsamında yeterince temsil ediliyor mu?

### Flow Coverage

Happy Path, Alternative Flow, Negative Flow, Edge Case'lerin her biri
dengeli şekilde kapsanıyor mu (bkz.
`01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md`)?

### Code Coverage (Farkındalık Seviyesinde)

Otomasyon testlerinin, kodun hangi satırlarını/dallarını çalıştırdığının
ölçüsü. Bu genellikle development/otomasyon araçlarıyla ölçülür; QA
bu metriği **yorumlayabilir** ama genellikle kendisi üretmez.

---

## 4. Test Case Sayısı Coverage Değildir

**Yaygın yanlış:** "1000 Test Case yazdık, coverage'ımız yüksek."

**Gerçek:** Test Case sayısı, yalnızca **miktarı** gösterir,
**kalitesini veya doğru dağılımını** göstermez.

**Örnek:** 1000 Test Case'in 950'si aynı Happy Path'in küçük
varyasyonları (farklı ama işlevsel olarak eşdeğer test data'larla)
olabilir, geriye kalan 50'si ise sistemin en kritik Negative Flow ve
Edge Case senaryolarını kapsamıyor olabilir. Bu durumda "1000 Test
Case" rakamı yanıltıcı bir güven duygusu yaratır.

---

## 5. Gerçek Coverage Nasıl Değerlendirilir?

Coverage'ı değerlendirirken sayı yerine şu sorular sorulmalıdır:

- Her kritik Requirement/AC'nin en az bir Test Case'i var mı? (RTM)
- Yüksek riskli alanlar, düşük riskli alanlara göre daha derinlemesine
  mi kapsanmış?
- Yalnızca Happy Path mi kapsanmış, yoksa Negative/Edge de dengeli
  şekilde kapsanmış mı?
- EP/BVA/Decision Table gibi sistematik tekniklerle mi kapsam
  belirlenmiş, yoksa rastgele mi?

---

## 6. Common Mistakes

- Test Case sayısını doğrudan bir kalite/coverage göstergesi olarak
  sunmak.
- Coverage'ı yalnızca "requirement başına en az 1 test case var mı"
  ile sınırlı değerlendirip risk/flow dengesine bakmamak.
- Code Coverage yüzdesini (örn. "%90 code coverage"), sistemin
  business açısından doğru çalıştığının kanıtı sanmak (yüksek code
  coverage, zayıf assertion'larla bile elde edilebilir).

---

## 7. Best Practices

- Coverage'ı raporlarken sayı yerine RTM durumunu ve risk/flow
  dağılımını gösterin.
- Yüksek riskli alanların coverage derinliğini, düşük riskli
  alanlardan bilinçli olarak daha yüksek tutun.
- Coverage boşluklarını (kapsanmamış AC, yalnızca happy path kapsanmış
  alan) açıkça raporlayın.

---

## 8. Interview Notes

- "Test Coverage'ı nasıl ölçersiniz?" sorusuna, yalnızca sayı değil
  Requirement/Risk/Flow coverage boyutlarıyla cevap verin.
- "Neden test case sayısı coverage'ı garanti etmez?" sorusuna, aynı
  senaryonun tekrarlanan varyasyonları örneğiyle cevap verin.

---

## İlgili Konular

- [Traceability Management](09-TRACEABILITY-MANAGEMENT.md)
- [QA Metrics](14-QA-METRICS.md)
- [00-QA-FOUNDATIONS — Common Mistakes](../00-QA-FOUNDATIONS/COMMON-MISTAKES.md)
