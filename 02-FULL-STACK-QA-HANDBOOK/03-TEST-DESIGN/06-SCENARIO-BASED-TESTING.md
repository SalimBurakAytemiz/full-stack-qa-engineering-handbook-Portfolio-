# Scenario-Based Testing

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bileşen bazlı testler (EP, BVA, Decision Table) sistemin **parçalarını**
doğrular. Ama gerçek kullanıcılar sistemi parça parça değil, **uçtan
uca bir akış** olarak kullanır. Scenario-Based Testing, bu gerçek
kullanım deneyimini test eder.

---

## 2. Scenario-Based Testing Nedir?

Gerçek kullanıcı davranışını yansıtan, birden fazla sistem
bileşenini/davranışını **birleştiren** uçtan uca senaryoların test
edilmesidir.

---

## 3. Örnek: E-Commerce Kullanıcı Akışı

```text
User
  ↓
Product
  ↓
Cart
  ↓
Payment
  ↓
Order
  ↓
Notification
```

Bu tek senaryo şunları **aynı anda** doğrular:

1. **User:** Kullanıcı sisteme giriş yapabiliyor mu?
2. **Product:** Ürün arama/listeleme doğru çalışıyor mu?
3. **Cart:** Ürün sepete ekleniyor, sepet tutarı doğru hesaplanıyor mu?
4. **Payment:** Ödeme akışı, seçilen yöntemle doğru tamamlanıyor mu?
5. **Order:** Sipariş, doğru durumda ve doğru veriyle oluşturuluyor
   mu?
6. **Notification:** Sipariş onay bildirimi doğru içerikte
   gönderiliyor mu?

---

## 4. Scenario-Based Testing ile Bileşen Bazlı Testler Arasındaki
   Fark

| | Bileşen Bazlı Test (EP, BVA, Decision Table) | Scenario-Based Testing |
|---|---|---|
| **Odak** | Tek bir alan/kuralın doğruluğu | Birden fazla bileşenin **birlikte** doğru çalışması |
| **Örnek** | "Sipariş tutarı 50 TL altındaysa reddedilir" | "Kullanıcı ürün seçip ödeme yapıp bildirim alana kadar tüm akış" |
| **Yakaladığı Hata Türü** | İzole mantık hataları | Entegrasyon/akış kesintileri, adımlar arası veri tutarsızlığı |

İkisi birbirinin **yerine değil**, tamamlayıcısıdır. Bileşen bazlı
testler her parçanın doğruluğunu, Scenario-Based Testing parçaların
**birlikte** doğru çalıştığını doğrular.

---

## 5. Neden Yalnızca Bileşen Testleri Yeterli Değildir?

Her bileşen ayrı ayrı test edilip PASS olsa bile, bileşenler
**birleştiğinde** ortaya çıkan sorunlar olabilir:

**Örnek:** Cart bileşeni tek başına doğru çalışabilir (doğru toplam
hesaplıyor). Payment bileşeni tek başına doğru çalışabilir (doğru
tutarı tahsil ediyor). Ama Cart'tan Payment'a **doğru tutar
aktarılmıyorsa** (örn. indirim uygulanmadan tutar gönderiliyorsa), bu
hata yalnızca **uçtan uca bir senaryo** ile fark edilir — çünkü her
iki bileşen de kendi izole testinde "doğru" davranıyordur.

---

## 6. Scenario-Based Test Nasıl Tasarlanır?

1. Gerçek bir kullanıcı persona'sı ve amacı belirleyin ("Bir
   kullanıcı olarak X ürününü satın almak istiyorum").
2. Bu amacın gerçekleşmesi için geçilmesi gereken tüm adımları
   sıralayın.
3. Her adımda, bir önceki adımdan gelen **verinin doğru aktarıldığını**
   doğrulayacak kontrol noktaları ekleyin (örn. sepetteki indirimli
   tutar, ödeme adımında da aynı mı?).
4. Senaryoyu hem Happy Path hem de en az bir Alternative Flow ile
   (bkz. `01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md`)
   tasarlayın.

---

## 7. Common Mistakes

- Yalnızca bileşen bazlı testlere güvenip hiç uçtan uca senaryo
  yazmamak.
- Scenario-Based Testing'i yalnızca "her şeyin çalıştığını göster"
  şeklinde yüzeysel bir happy path'e indirgemek.
- Adımlar arası veri tutarlılığını (örn. sepetteki tutar ile ödemedeki
  tutar) kontrol etmeden yalnızca "sonraki sayfa açıldı mı" ile
  yetinmek.

---

## 8. Best Practices

- Kritik kullanıcı yolculukları (checkout, kayıt, şifre sıfırlama)
  için mutlaka en az bir uçtan uca Scenario-Based Test tasarlayın.
- Senaryonun her adımında, bir önceki adımdan gelen veriyi açıkça
  doğrulayın.
- Scenario-Based Testleri, regresyon suite'inin çekirdek (core)
  parçası olarak önceliklendirin (bkz.
  `02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md`).

---

## 9. Interview Notes

- "Scenario-Based Testing nedir, EP/BVA'dan nasıl farklıdır?"
  sorusuna, bileşen bazlı vs uçtan uca akış ayrımıyla cevap verin.
- "Her bileşen ayrı ayrı PASS oldu, neden uçtan uca test gerekli?"
  sorusuna, bileşenler arası veri aktarım hatası örneğiyle cevap
  verin.

---

## İlgili Konular

- [01-REQUIREMENT-ANALYSIS — Happy/Alternative/Negative Flows](../01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md)
- [State Transition Testing](05-STATE-TRANSITION-TESTING.md)
- [examples/AUTHENTICATION-FEATURE](examples/AUTHENTICATION-FEATURE/09-TEST-SCENARIOS.md)
