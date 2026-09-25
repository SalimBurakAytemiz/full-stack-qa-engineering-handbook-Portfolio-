# Test Suite & Test Cycle

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Tek tek Test Case'ler, bir test operasyonunun temel birimidir ama
gerçek çalışma bu birimlerin **gruplandığı** (Test Suite) ve
**zaman içinde çalıştırıldığı** (Test Cycle) yapılar üzerinden
yürür.

---

## 2. Test Suite Nedir?

**Test Suite**, ortak bir amaca hizmet eden Test Case'lerin
gruplandırılmasıdır. Örnekler: "Authentication Suite", "Checkout
Regression Suite", "Smoke Suite".

## 3. Test Cycle Nedir?

**Test Cycle**, bir Test Suite'in **belirli bir zaman diliminde,
belirli bir build/environment üzerinde** çalıştırılmasıdır. Aynı
Test Suite, farklı release'lerde farklı Test Cycle'lar olarak
çalıştırılır.

---

## 4. İlişki

```text
Test Suite (statik grup — "Checkout Regression Suite")
   ↓
Test Cycle #1 (v2.1 release, 12 Mart)
   ↓
Test Cycle #2 (v2.2 release, 26 Mart)
   ↓
Test Cycle #3 (v2.3 release, 9 Nisan)
```

Aynı Test Suite'teki Test Case'ler, her Test Cycle'da tekrar
çalıştırılır; her cycle'ın kendi execution sonuçları, kendi
tarihine ve build'ine bağlı olarak ayrı ayrı kayıt altına alınır.

---

## 5. Test Suite Türleri

| Suite Türü | Amaç | Detay |
|---|---|---|
| Smoke Suite | Build'in genel sağlığını hızlıca doğrulamak | bkz. `06-SMOKE-SANITY-REGRESSION-SUITES.md` |
| Sanity Suite | Belirli bir fix'in dar kapsamlı doğrulaması | bkz. `06-SMOKE-SANITY-REGRESSION-SUITES.md` |
| Regression Suite | Değişikliğin başka alanları bozmadığını doğrulamak | bkz. `06-SMOKE-SANITY-REGRESSION-SUITES.md` |
| Feature Suite | Belirli bir feature'ın tüm senaryolarını kapsamak | Örn. "Authentication Suite" |
| UAT Suite | Business/kullanıcı kabul testleri | bkz. `16-UAT-MANAGEMENT.md` |

---

## 6. Test Cycle'ın İçeriği

Bir Test Cycle şu bilgileri taşır:

- Hangi Test Suite çalıştırıldı?
- Hangi build/version üzerinde?
- Hangi ortamda?
- Ne zaman başladı, ne zaman bitti?
- Kim çalıştırdı?
- Sonuçlar (PASS/FAIL/BLOCKED dağılımı)?

---

## 7. Common Mistakes

- Test Suite ile Test Cycle'ı aynı kavram sanmak.
- Her release'de Test Suite'i sıfırdan yeniden oluşturmak (oysa Suite
  statiktir, yalnızca Cycle tekrarlanır).
- Bir Test Cycle'ın hangi build/environment'ta çalıştırıldığını
  kaydetmemek — bu, sonradan sonuçların yorumlanmasını imkansız
  hale getirir.

---

## 8. Best Practices

- Test Suite'leri feature/amaç bazlı, kararlı bir yapıda tutun.
- Her Test Cycle'ı build/environment/tarih bilgisiyle birlikte kayıt
  altına alın.
- Suite içeriğini (hangi Test Case'lerin dahil olduğunu) requirement
  değişikliklerine göre güncel tutun.

---

## 9. Interview Notes

- "Test Suite ile Test Cycle arasındaki fark nedir?" sorusuna, Suite'in
  statik grup, Cycle'ın zamana bağlı bir execution turu olduğunu
  belirterek cevap verin.
- "Aynı Test Suite farklı release'lerde nasıl kullanılır?" sorusuna,
  her release'in kendi Test Cycle'ını oluşturduğunu açıklayarak cevap
  verin.

---

## İlgili Konular

- [Smoke/Sanity/Regression Suites](06-SMOKE-SANITY-REGRESSION-SUITES.md)
- [Test Execution Status](07-TEST-EXECUTION-STATUS.md)
- [Test Case Management](04-TEST-CASE-MANAGEMENT.md)
