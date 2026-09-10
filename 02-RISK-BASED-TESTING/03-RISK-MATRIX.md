# Risk Matrix

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Risk Matrix, Probability ve Impact değerlendirmelerini **görsel ve
karşılaştırılabilir** bir formata dönüştürür. Bu dosya, örnek bir 5x5
matrix üzerinden gerçek riskleri konumlandırır.

---

## 2. 5x5 Risk Matrix

|  | **Impact: Very Low** | **Impact: Low** | **Impact: Medium** | **Impact: High** | **Impact: Critical** |
|---|---|---|---|---|---|
| **Probability: Very High** | Low | Medium | High | Critical | Critical |
| **Probability: High** | Low | Medium | High | High | Critical |
| **Probability: Medium** | Low | Low | Medium | High | High |
| **Probability: Low** | Very Low | Low | Medium | Medium | High |
| **Probability: Very Low** | Very Low | Very Low | Low | Medium | Medium |

Bu matrix, iki boyutlu bir değerlendirmeyi (Probability × Impact) tek
bir kategorik önceliğe (Very Low → Critical) dönüştürür.

---

## 3. Örnek Riskler ve Matrix Üzerindeki Konumları

### Payment Cannot Complete (Ödeme Tamamlanamıyor)

- **Probability:** Medium (ödeme akışı genelde stabil ama entegrasyon
  noktaları risk taşır)
- **Impact:** Critical (doğrudan finansal kayıp, kullanıcı güveni,
  operasyonel durma)
- **Matrix Sonucu:** **High**

**Neden bu öncelik:** Ödemenin tamamlanamaması, kullanıcının işini
tamamen engeller ve şirketin gelirini doğrudan etkiler.

### Unauthorized Access (Yetkisiz Erişim)

- **Probability:** Low (güvenlik kontrolleri genelde sıkı test
  edilir) — ama sıfır değildir
- **Impact:** Critical (veri sızıntısı, yasal sorumluluk, itibar
  kaybı)
- **Matrix Sonucu:** **High**

**Neden bu öncelik:** Düşük olasılıkla gerçekleşse bile, sonucu o
kadar ciddi ki (KVKK/GDPR ihlali, kullanıcı verisi sızıntısı) yüksek
öncelikli test edilmesi gerekir.

### Incorrect Financial Calculation (Hatalı Finansal Hesaplama)

- **Probability:** Medium (karmaşık hesaplama mantığı, indirim/vergi
  kombinasyonları)
- **Impact:** High (doğrudan finansal kayıp veya fazla ücretlendirme)
- **Matrix Sonucu:** **High**

**Neden bu öncelik:** Yanlış hesaplama, hem şirketi hem kullanıcıyı
finansal olarak etkiler ve genellikle geniş çaplı (tüm işlemleri)
kapsar.

### Notification Delay (Bildirim Gecikmesi)

- **Probability:** High (bildirim sistemleri genelde asenkron ve dış
  servislere bağımlı, gecikme sık görülür)
- **Impact:** Low (kullanıcı deneyimini bir miktar etkiler ama işlemi
  engellemez)
- **Matrix Sonucu:** **Medium**

**Neden bu öncelik:** Sık karşılaşılsa da, kullanıcının asıl işlemini
(sipariş, ödeme) engellemediği için orta seviyede kalır.

### Cosmetic Spacing Problem (Görsel Hizalama Sorunu)

- **Probability:** High (responsive tasarımda sık karşılaşılır)
- **Impact:** Very Low (işlevi hiç etkilemez)
- **Matrix Sonucu:** **Medium** (matrix'te High Probability + Very
  Low Impact = Medium; bazı organizasyonlar bunu Low olarak da
  değerlendirebilir)

**Neden bu öncelik:** Sık karşılaşılan ama işlevsel olmayan bir
sorun, testin **derinliğini** değil **önceliğini** düşük tutar —
genelde exploratory/manuel testte fark edilip düşük öncelikle
raporlanır.

---

## 4. Bu Beş Risk Neden Farklı Test Önceliği Taşır?

| Risk | Priority | Test Yaklaşımı |
|---|---|---|
| Payment Cannot Complete | High | Derinlemesine, tüm senaryolarla (positive/negative/edge), her release'de regression |
| Unauthorized Access | High | Güvenlik odaklı, yetki matrisinin tamamı test edilir |
| Incorrect Financial Calculation | High | Farklı kombinasyonlarla (indirim, vergi, kur) derinlemesine test |
| Notification Delay | Medium | Temel senaryolar test edilir, her release'de tam regression gerekmeyebilir |
| Cosmetic Spacing Problem | Medium/Low | Exploratory testte fark edilirse raporlanır, ayrı bir test suite'i genelde gerekmez |

Bu tablo, sınırlı test kaynağının nereye yoğunlaştırılması
gerektiğini somut şekilde gösterir.

---

## 5. Common Mistakes

- Her riski aynı derinlikte test etmeye çalışmak.
- Matrix'i yalnızca bir kez oluşturup, sistem değiştikçe
  güncellememek.
- Impact'i yalnızca "kullanıcı fark eder mi" ile sınırlı
  değerlendirip finansal/yasal boyutları atlamak.

---

## 6. Best Practices

- Risk Matrix'i her büyük release öncesi ekip ile birlikte gözden
  geçirin.
- Matrix boyutunu (3x3 veya 5x5) ekibinizin ihtiyacına göre seçin —
  daha fazla kategori daha hassas ama daha zor konsensüs gerektirir.
- Matrix sonucunu doğrudan test planına ve kaynak dağılımına bağlayın.

---

## 7. Interview Notes

- "Risk Matrix nedir, nasıl kullanılır?" sorusuna Probability × Impact
  kategorik tablosu ile cevap verin.
- "Neden bazı yüksek olasılıklı hatalar düşük öncelikli kalır?"
  sorusuna Cosmetic Spacing Problem örneğiyle cevap verin.

---

## İlgili Konular

- [Probability & Impact](02-PROBABILITY-AND-IMPACT.md)
- [Test Prioritization](04-TEST-PRIORITIZATION.md)
- [Risk Register Example](06-RISK-REGISTER-EXAMPLE.md)
