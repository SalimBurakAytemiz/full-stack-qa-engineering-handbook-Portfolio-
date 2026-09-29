# Expected vs Actual

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Expected Result ve Actual Result, bir bug raporunun **kanıtını**
oluşturur — bu ikisi arasındaki fark, defect'in **tam olarak ne
olduğunu** tanımlar. Karıştırılmaları veya belirsiz yazılmaları, bug
raporunun değerini düşürür.

---

## 2. Expected Result Nedir?

Sistemin, tanımlanan koşullar altında **göstermesi gereken**
davranıştır. Bu, öznel bir tahmin değil, bir Test Oracle'a (bkz.
`00-QA-FOUNDATIONS/08-TEST-ORACLE.md`) — requirement, business rule,
API contract — dayanmalıdır.

## 3. Actual Result Nedir?

Sistemin, aynı koşullar altında **gerçekte gösterdiği** davranıştır
— gözlemlenen, ölçülen, kanıtlanabilir bir sonuç.

---

## 4. İkisini Ayrı Tutmak Neden Önemli?

**Kötü örnek (birleştirilmiş):**

> "Login sayfasında yanlış hata mesajı gösteriliyor, doğrusu 'Email
> veya şifre hatalı' olmalıydı."

Bu cümle teknik olarak bilgi taşısa da, okuyan kişinin **hangi
kısmın beklenen, hangi kısmın gerçekleşen** olduğunu ayırt etmesi
için tekrar okuması gerekir.

**İyi örnek (ayrılmış):**

```text
Expected Result: "Email veya şifre hatalı" mesajı gösterilmeli.
Actual Result: "System Error — Please try again later" mesajı
               gösteriliyor.
```

Bu format, iki sonucu **yan yana karşılaştırmayı** kolaylaştırır ve
farkı anında görünür kılar.

---

## 5. Expected Result'ın Kaynağı

Expected Result asla "bana mantıklı geldi" ile yazılmamalıdır. Kaynak
olabilecekler (bkz.
`00-QA-FOUNDATIONS/08-TEST-ORACLE.md`):

- İlgili Requirement/Acceptance Criteria.
- Business Rule dokümanı.
- API Contract/şema.
- Tasarım (Figma vb.).
- Mevcut/önceki sistem davranışı.

**Örnek:** AC-AUTH-004'e göre "geçersiz email veya password
girildiğinde, sistem hangi alanın hatalı olduğunu belirtmeden 'Email
veya şifre hatalı' mesajını gösterir" — bu, Expected Result'ın
doğrudan kaynağıdır.

---

## 6. Actual Result Nasıl Yazılır?

Actual Result, **gözlemlenen gerçek davranışı**, mümkünse ekran
görüntüsü/log/API response gibi evidence ile (bkz.
`08-DEFECT-EVIDENCE.md`) desteklenerek yazılmalıdır — yalnızca "hata
var" değil, **tam olarak ne göründüğü**.

---

## 7. Common Mistakes

- Expected ve Actual'ı tek bir cümlede birleştirmek.
- Expected Result'ı öznel bir varsayıma dayandırmak (Test Oracle
  olmadan).
- Actual Result'ı yalnızca "çalışmıyor" gibi belirsiz yazmak.

---

## 8. Best Practices

- Expected ve Actual'ı her zaman ayrı satırlarda/alanlarda yazın.
- Expected Result'ın hangi kaynağa (Requirement ID, AC ID) dayandığını
  belirtin.
- Actual Result'ı evidence ile destekleyin.

---

## 9. Interview Notes

- "Expected Result nereden gelir?" sorusuna Test Oracle kavramıyla
  (requirement, business rule, API contract) cevap verin.
- "Expected ve Actual'ı neden ayrı yazmak gerekir?" sorusuna,
  karşılaştırılabilirlik ve netlik avantajıyla cevap verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Test Oracle](../00-QA-FOUNDATIONS/08-TEST-ORACLE.md)
- [Steps to Reproduce](04-STEPS-TO-REPRODUCE.md)
- [Defect Evidence](08-DEFECT-EVIDENCE.md)
