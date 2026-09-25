# Steps to Reproduce

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Steps to Reproduce, bir bug raporunun **en kritik** alanıdır — Bug
ID'si, Severity'si ne olursa olsun, adımlar belirsizse defect
kimse tarafından doğrulanamaz veya fix edilemez.

---

## 2. Üç Temel Kriter

Steps to Reproduce şu üç özelliği taşımalıdır:

### Açık (Clear)

Her adım, tek bir yoruma açık olmalı — "bir şeyler yap" değil, "X
butonuna tıkla" gibi somut bir eylem.

### Deterministic (Belirleyici)

Aynı adımlar, aynı koşullar altında **her zaman aynı sonucu**
üretmeli. Adımlar belirsizse, farklı kişiler farklı sonuçlar
alabilir.

### Tekrarlanabilir (Repeatable)

Adımlar, defect'i **her seferinde** (veya en azından bilinen bir
oranda — bkz. `07-REPRODUCTION-RATE.md`) yeniden üretebilmelidir.

---

## 3. Bad Example

```text
1. Login ol.
2. Hata çıkıyor.
```

**Neden kötü:**

- Hangi credential ile login olunduğu belirsiz (geçerli mi, geçersiz
  mi?).
- "Hata çıkıyor" — hangi hata? Ne zaman? Hangi ekranda?
- Precondition (kullanıcı durumu) hiç belirtilmemiş.
- Bu adımları takip eden biri, muhtemelen aynı sonucu **alamayacaktır**
  çünkü hangi koşulların sağlandığı net değil.

---

## 4. Good Example

```text
Precondition:
Active user exists (test.active01@example.com).

Steps:
1. Login page'i aç.
2. Valid email gir (test.active01@example.com).
3. Invalid password gir (WrongPass999!).
4. Login button'a tıkla.
```

**Neden iyi:**

- Precondition açıkça belirtilmiş (aktif kullanıcı mevcut).
- Her adım somut ve tek bir eylem içeriyor.
- Kullanılan test data (email, password) net.
- Bu adımları takip eden herkes, **aynı** başlangıç noktasından
  **aynı** sonuca ulaşacaktır.

---

## 5. Ardından: Expected / Actual

Steps to Reproduce'un hemen ardından, Expected Result ve Actual
Result netleştirilmelidir (bkz. `05-EXPECTED-VS-ACTUAL.md`):

```text
Expected Result: "Email veya şifre hatalı" mesajı gösterilmeli.
Actual Result: "System Error — Please try again later" mesajı
               gösteriliyor.
```

Bu üçlü (Steps → Expected → Actual), bir bug raporunun **omurgasını**
oluşturur.

---

## 6. Steps Yazarken Kontrol Listesi

- [ ] Precondition belirtildi mi (hangi kullanıcı durumu, hangi ön
  koşul)?
- [ ] Kullanılan test data (email, tutar, kod vb.) net mi?
- [ ] Her adım tek bir eylem içeriyor mu (birden fazla eylemi tek
  adımda birleştirmemek)?
- [ ] Adımlar numaralandırılmış ve sıralı mı?
- [ ] Başka biri bu adımları, ek soru sormadan uygulayabilir mi?

---

## 7. Common Mistakes

- Preconditions'ı atlayıp doğrudan adımlara geçmek.
- Birden fazla eylemi tek bir adımda birleştirmek ("Login ol ve
  ayarlara git ve profili güncelle").
- "Bazen oluyor" deyip hangi koşulda olduğunu netleştirmemek (bkz.
  `07-REPRODUCTION-RATE.md`).

---

## 8. Best Practices

- Adımları yazdıktan sonra, kendiniz sıfırdan (adımları hiç
  bilmiyormuş gibi) tekrar uygulayarak doğrulayın.
- Test Data'yı adımların içine değil, ayrı bir "Test Data" alanına
  yazın — bu, adımların okunabilirliğini artırır.
- Her adımı numaralandırın, madde işareti (bullet) yerine sıralı
  liste kullanın.

---

## 9. Interview Notes

- "İyi Steps to Reproduce nasıl yazılır?" sorusuna açık/deterministic/
  tekrarlanabilir kriterleriyle ve somut bir örnekle cevap verin.
- "Bad Example ile Good Example arasındaki temel fark nedir?"
  sorusuna, precondition ve test data netliğinin eksikliğini
  vurgulayarak cevap verin.

---

## İlgili Konular

- [Expected vs Actual](05-EXPECTED-VS-ACTUAL.md)
- [Reproduction Rate](07-REPRODUCTION-RATE.md)
- [templates/BUG-REPORT-TEMPLATE.md](templates/BUG-REPORT-TEMPLATE.md)
