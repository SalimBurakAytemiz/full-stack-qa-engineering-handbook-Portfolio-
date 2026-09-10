# Requirement Testability

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Her requirement test edilebilir değildir. Testability, bir requirement'ın
kalitesinin en temel göstergelerinden biridir. Bu dosya, "testable"
bir requirement'ın ne anlama geldiğini ve neyin **olmadığını** gösterir.

---

## 2. Testable Requirement Nedir?

**Testable Requirement**, verilen bir girdi ve koşul altında, sistemin
göstermesi gereken davranışın nesnel ve ölçülebilir şekilde
doğrulanabildiği requirement'tır.

Bir requirement testable ise, iki farklı kişi aynı senaryoyu test
ettiğinde **aynı sonuca** (PASS/FAIL) ulaşmalıdır.

---

## 3. Test Edilebilir Olmayan Requirement Örneği

> "Sayfa kullanıcı dostu olmalıdır."

**Neden problemli:**

- "Kullanıcı dostu" tamamen öznel bir ifadedir.
- Bir test eden "kullanıcı dostu" bulabilirken, başka biri
  bulmayabilir — sonuç kişiden kişiye değişir.
- Hiçbir somut girdi/çıktı/koşul tanımlanmamıştır.

Bu requirement, olduğu haliyle bir test case'e dönüştürülemez. Önce
"kullanıcı dostu" olmanın somut göstergelerine (örn. "3 tıklamadan
az adımda tamamlanabilmeli", "hata mesajları hangi alanın sorunlu
olduğunu belirtmeli") indirgenmesi gerekir.

---

## 4. Diğer Test Edilemez Örnekler

| Test Edilemez | Neden |
|---|---|
| "Sistem güvenilir olmalı." | "Güvenilir" ölçülebilir değil. |
| "Uygulama modern görünmeli." | Tamamen sübjektif, tasarım tercihi. |
| "Performans iyi olmalı." | Hangi metrik, hangi threshold belirtilmemiş. |
| "Hata mesajları anlaşılır olmalı." | "Anlaşılır"ın ölçütü tanımlanmamış. |

---

## 5. Testability İçin Gerekli Kavramlar

### Measurable (Ölçülebilir)

Sonucun sayısal veya kategorik olarak ifade edilebilmesi gerekir.
"Hızlı" değil, "500ms altında" gibi.

### Observable (Gözlemlenebilir)

Sistemin davranışı, dışarıdan (UI, API response, database, log)
gözlemlenebilir olmalıdır. Gözlemlenemeyen bir iç durum test edilemez.

### Deterministic Where Applicable (Uygun Olduğunda Belirleyici)

Aynı girdi ve koşullar altında sistem aynı sonucu üretmelidir. (Bazı
sistemlerde — örn. rastgele öneri algoritmaları — tam determinism
mümkün olmayabilir; bu durumda test stratejisi farklı kurulur, ama
requirement yine de "hangi aralıkta" davranacağını tanımlamalıdır.)

### Clear Expected Result (Net Beklenen Sonuç)

Requirement, "bu girdi verildiğinde tam olarak bu çıktı üretilmeli"
diyebilmelidir.

### Known Input (Bilinen Girdi)

Hangi girdilerin test edileceği net olmalıdır (örn. hangi email
formatları, hangi tutarlar).

### Known Output (Bilinen Çıktı)

Beklenen çıktının formatı ve içeriği net olmalıdır.

### Known Conditions (Bilinen Koşullar)

Requirement'ın hangi ön koşullar altında geçerli olduğu (örn.
"kullanıcı login olmuş olmalı") belirtilmelidir.

---

## 6. Test Edilemeyen Bir Requirement'ı Test Edilebilir Hale Getirmek

**Önce:** "Sayfa kullanıcı dostu olmalıdır."

**Sonra (netleştirilmiş):**

- "Kullanıcı, ana sayfadan sepete ürün eklemeyi en fazla 3 tıklamada
  tamamlayabilmelidir."
- "Form hataları, ilgili input alanının hemen altında, kırmızı
  renkte gösterilmelidir."
- "Sayfa, [belirlenecek] genişlik altındaki ekranlarda yatay
  kaydırma gerektirmeden görüntülenmelidir."

Bu üç madde artık measurable, observable ve test edilebilir hale
gelmiştir.

---

## 7. Common Mistakes

- Testability'yi yalnızca "test case yazılabilir mi" ile sınırlı
  sanmak; ölçülebilirlik ve gözlemlenebilirlik boyutlarını atlamak.
- Subjektif bir requirement'ı, "biz zaten anlıyoruz" diyerek olduğu
  gibi kabul etmek.
- Testability sorununu yalnızca development tamamlandıktan sonra fark
  etmek.

---

## 8. Best Practices

- Her requirement review'da "bu requirement'ı PASS/FAIL olarak nasıl
  değerlendiririm?" sorusunu sorun.
- Subjektif sıfatları (kullanıcı dostu, hızlı, güvenilir, modern)
  gördüğünüzde otomatik olarak "bunun somut karşılığı ne?" diye
  sorgulayın.
- Testability eksikliğini requirement review aşamasında raporlayın —
  development başladıktan sonra çok daha maliyetlidir.

---

## 9. Interview Notes

- "Testable requirement nedir?" sorusuna measurable/observable/known
  input-output kavramlarıyla cevap verin.
- "'Sayfa kullanıcı dostu olmalı' requirement'ını nasıl test edilebilir
  hale getirirsiniz?" sorusuna somut bir dönüşüm örneğiyle cevap
  verin.

---

## İlgili Konular

- [Acceptance Criteria](02-ACCEPTANCE-CRITERIA.md)
- [Requirement Clarification](03-REQUIREMENT-CLARIFICATION.md)
- [00-QA-FOUNDATIONS — Verification & Validation](../00-QA-FOUNDATIONS/02-VERIFICATION-AND-VALIDATION.md)
