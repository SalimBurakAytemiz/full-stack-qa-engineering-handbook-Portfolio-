# Probability & Impact

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Risk'in iki temel bileşenini (Probability, Impact) ayrı ayrı
değerlendirebilmek, doğru bir risk skorlaması yapmanın ön koşuludur.
Bu dosya, her ikisini nasıl değerlendireceğinizi gösterir.

---

## 2. Probability Nasıl Değerlendirilir?

Probability değerlendirilirken şu sorular sorulur:

- Bu alan ne kadar **karmaşık**? (Karmaşık kod = daha fazla hata
  ihtimali.)
- Bu alan **sık değişiyor mu**? (Sık değişen kod, regresyon riski
  taşır.)
- Bu alan **yeni bir teknoloji/yaklaşım** mı kullanıyor? (Yeni ve
  olgunlaşmamış çözümler, daha fazla hata üretebilir.)
- Bu alanın **geçmişte defect geçmişi** nasıl? (Sık bug çıkan alanlar,
  yüksek Probability taşır.)
- Bu alanın **test coverage'ı** nasıl? (Düşük coverage, kaçırılan
  hataların fark edilme olasılığını artırır — dolaylı olarak
  Probability'yi yükseltir.)

## 3. Impact Nasıl Değerlendirilir?

Impact değerlendirilirken şu boyutlar dikkate alınır:

- **Finansal:** Hata, doğrudan parasal kayba yol açar mı?
- **Kullanıcı Güveni:** Hata, kullanıcıların sisteme olan güvenini
  zedeler mi?
- **Yasal/Regülasyon:** Hata, yasal bir yükümlülüğü ihlal eder mi?
- **Operasyonel:** Hata, operasyonu (örn. sipariş işleme) durdurur
  mu?
- **İtibar:** Hata, kamuoyunda/basında olumsuz yansıma yaratır mı?

---

## 4. Basit Örnek

| Senaryo | Probability | Impact |
|---|---|---|
| Payment failure (ödeme tamamlanamıyor) | Medium | Critical |
| Cosmetic spacing issue (buton arası boşluk hatalı) | High | Low |

**Payment failure:** Ödeme sistemleri genellikle iyi test edilmiş ve
stabil olduğu için Probability orta seviyede olabilir; ancak
gerçekleştiğinde finansal kayıp, kullanıcı güveni kaybı ve operasyonel
kesinti yaratacağı için Impact kritiktir.

**Cosmetic spacing issue:** Görsel hizalama sorunları sık
karşılaşılabilir (High Probability) — özellikle responsive tasarımda —
ama kullanıcı işini tamamlamasını engellemez, finansal veya
operasyonel bir sonucu yoktur (Low Impact).

---

## 5. Neden Test Priority Yalnızca Probability'ye Göre Belirlenmez?

Sezgisel olarak "en sık olacak şeyi önce test edelim" düşünülebilir.
Ancak bu yaklaşım yanıltıcıdır:

- Yüksek Probability + Düşük Impact bir senaryo (cosmetic issue),
  sık karşılaşılsa bile işi durdurmaz.
- Düşük/Orta Probability + Kritik Impact bir senaryo (payment
  failure), nadir gerçekleşse bile **tek bir kez bile** ciddi zarara
  yol açabilir.

Bu yüzden Risk-Based Testing, Priority'yi yalnızca Probability'ye
değil, **Probability ile Impact'in birleşimine** göre belirler (bkz.
`01-RISK-FUNDAMENTALS.md`).

---

## 6. Değerlendirme Pratik Örneği

**Senaryo:** Bir e-ticaret sisteminde "kupon kodu" özelliği ile
"sipariş iptal" özelliği aynı sprint'te değişti. Sınırlı test süresi
var, hangisine öncelik verilmeli?

| Faktör | Kupon Kodu | Sipariş İptal |
|---|---|---|
| Probability | Yüksek (karmaşık indirim mantığı, sık değişiyor) | Orta (stabil, nadiren değişiyor) |
| Impact | Orta (yanlış indirim = finansal kayıp ama sınırlı) | Yüksek (yanlış iptal = sipariş/ödeme tutarsızlığı, refund hatası) |

Bu değerlendirmeye göre her ikisi de test edilmeli, ancak Sipariş
İptal'in Impact'i daha yüksek olduğu için — sınırlı zamanda önce
oraya odaklanmak, Risk-Based Testing mantığına daha uygun olabilir.
(Kesin karar, organizasyonun risk modeline göre değişir — bkz.
`04-TEST-PRIORITIZATION.md`.)

---

## 7. Common Mistakes

- Probability'yi yalnızca "ne sıklıkla kullanılıyor" ile sınırlı
  sanmak; kod karmaşıklığı ve değişim sıklığını göz ardı etmek.
- Impact'i yalnızca finansal boyutla sınırlı değerlendirmek; kullanıcı
  güveni ve yasal boyutları atlamak.
- İki senaryoyu karşılaştırırken yalnızca tek bir faktöre (örn. yalnızca
  Probability) bakmak.

---

## 8. Best Practices

- Probability ve Impact'i ayrı ayrı, birbirinden bağımsız
  değerlendirin — birini diğerine göre tahmin etmeyin.
- Impact değerlendirmesine birden fazla boyutu (finansal, kullanıcı
  güveni, yasal) dahil edin.
- Değerlendirmeyi mümkün olduğunca ekip ile (business, development)
  birlikte yapın — tek başına QA'nın öznel tahmini yeterli değildir.

---

## 9. Interview Notes

- "Yüksek Probability her zaman yüksek Priority anlamına gelir mi?"
  sorusuna hayır diyerek Impact'in belirleyici rolünü açıklayın.
- "Impact'i değerlendirirken hangi boyutları göz önünde
  bulundurursunuz?" sorusuna finansal, kullanıcı güveni, yasal,
  operasyonel boyutlarla cevap verin.

---

## İlgili Konular

- [Risk Fundamentals](01-RISK-FUNDAMENTALS.md)
- [Risk Matrix](03-RISK-MATRIX.md)
- [Test Prioritization](04-TEST-PRIORITIZATION.md)
