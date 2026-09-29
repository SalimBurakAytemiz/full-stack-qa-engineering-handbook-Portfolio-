# Risk-Based Test Planning

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Teoriyi pratiğe dökmek gerekir. Bu dosya, zaman sınırlı bir release
senaryosunda, Risk-Based Testing prensiplerinin gerçekte nasıl bir
test sırasına dönüştüğünü gösterir.

---

## 2. Senaryo

Bir e-ticaret uygulamasında release'e **2 gün** kaldı. Test edilmesi
planlanan alanlar:

- **Login**
- **Payment**
- **Profile**
- **Notification**
- **Cosmetic UI**

Zaman, tüm alanları aynı derinlikte test etmeye yetmiyor. QA'nın
sırayı belirlemesi gerekiyor.

---

## 3. Risk Değerlendirmesi

| Alan | Business Criticality | Probability | Impact | Değişiklik Bu Sprint'te mi? |
|---|---|---|---|---|
| Login | Yüksek (her kullanıcı yolculuğunun girişi) | Orta | Kritik (login çalışmazsa tüm sistem kullanılamaz) | Hayır (stabil) |
| Payment | Yüksek (gelir akışı) | Orta | Kritik (finansal kayıp, sipariş kaybı) | Evet (yeni ödeme yöntemi eklendi) |
| Profile | Orta | Düşük | Orta (kullanıcı deneyimini etkiler ama işi durdurmaz) | Hayır |
| Notification | Düşük-Orta | Orta | Düşük (gecikebilir ama işlemi engellemez) | Evet (yeni bildirim tipi eklendi) |
| Cosmetic UI | Düşük | Yüksek | Çok Düşük | Evet (küçük tasarım güncellemesi) |

---

## 4. Önerilen Test Sırası ve Nedeni

### 1. Payment (En Yüksek Öncelik)

**Neden:** Hem Impact kritik hem de bu sprint'te **değişti** (yeni
ödeme yöntemi). Değişen + kritik alan kombinasyonu, en yüksek riski
taşır. Bu alana en fazla zaman ayrılmalı: positive, negative, edge,
business rule senaryoları dahil derinlemesine test.

### 2. Login (İkinci Öncelik)

**Neden:** Impact kritik (login olmadan hiçbir şey kullanılamaz) ama
bu sprint'te **değişmedi**. Değişmemiş kritik alanlar için tam
regression yerine, **hedefli smoke/sanity** düzeyinde bir doğrulama
genellikle yeterlidir — çünkü değişiklik olmadığı için yeni bir
regresyon riski daha düşüktür. Yine de kritik olduğu için tamamen
atlanmamalı.

### 3. Notification (Üçüncü Öncelik)

**Neden:** Impact düşük ama bu sprint'te **değişti** (yeni bildirim
tipi). Değişen alan olduğu için tamamen atlanmamalı, ama Impact düşük
olduğu için Payment/Login kadar derinlemesine test edilmesine gerek
yok — temel senaryolar (bildirim doğru tetikleniyor mu, doğru içerikte
mi) yeterli.

### 4. Profile (Dördüncü Öncelik)

**Neden:** Hem Impact orta hem de bu sprint'te değişmedi. Düşük risk
taşıyan, değişmemiş bir alan. Zaman kalırsa kısa bir sanity kontrolü
yapılabilir.

### 5. Cosmetic UI (En Düşük Öncelik)

**Neden:** Impact çok düşük. Değişmiş olsa bile (küçük tasarım
güncellemesi), işlevsel bir riski yok. Zaman kalırsa exploratory
testte gözden geçirilir; ayrı bir test suite'i gerektirmez.

---

## 5. Genel Prensip

Bu sıralamanın arkasındaki mantık şu formülle özetlenebilir:

```text
Test Önceliği ≈ (Impact Yüksekliği) + (Bu Sprint'te Değişmiş Olma)
```

**Değişmiş + Yüksek Impact** alanlar her zaman en üst sırada olmalıdır.
**Değişmemiş + Yüksek Impact** alanlar, hafifletilmiş ama ihmal
edilmemiş bir doğrulama gerektirir. **Değişmiş + Düşük Impact** alanlar
temel düzeyde kontrol edilir. **Değişmemiş + Düşük Impact** alanlar en
son (veya zaman kalmazsa hiç) test edilir.

---

## 6. Common Mistakes

- Sırayı yalnızca "en son değişen alan" mantığıyla belirlemek,
  Impact'i göz ardı etmek (örn. Cosmetic UI'ı Payment'ten önce test
  etmek çünkü "en son o değişti").
- Değişmemiş ama kritik bir alanı (Login) "zaten çalışıyordu" diyerek
  tamamen atlamak.
- Zaman baskısı altında sırayı rastgele veya alfabetik belirlemek.

---

## 7. Best Practices

- Release öncesi risk değerlendirmesini yazılı yapın — sırayı
  hafızaya veya sezgiye bırakmayın.
- Zaman daralırsa önce en düşük öncelikli alanlardan (Cosmetic UI)
  feragat edin, en yüksek öncelikliden değil.
- Test edilmeyen/az test edilen alanları Known Issues olarak
  dokümante edin (bkz.
  `00-QA-FOUNDATIONS/09-ENTRY-AND-EXIT-CRITERIA.md`).

---

## 8. Interview Notes

- "Zaman sınırlı bir release'de test sırasını nasıl belirlersiniz?"
  sorusuna Impact + değişiklik durumu kombinasyonuyla cevap verin.
- "Değişmemiş ama kritik bir alanı tamamen atlar mısınız?" sorusuna
  hayır diyerek, hafifletilmiş bir smoke/sanity kontrolünün gerekli
  olduğunu açıklayın.

---

## İlgili Konular

- [Test Prioritization](04-TEST-PRIORITIZATION.md)
- [Risk Register Example](06-RISK-REGISTER-EXAMPLE.md)
- [Release Risk](07-RELEASE-RISK.md)
