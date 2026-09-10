# Test Condition / Test Scenario / Test Case / Test Step

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Test Case yazıyorum" cümlesi çoğu zaman dört farklı seviyeyi
(Condition, Scenario, Case, Step) tek bir kelimeye sıkıştırır. Bu
karışıklık, tutarsız test dokümantasyonuna yol açar. Bu dosya, bu
dört terimi birbirinden ayırır.

---

## 2. Test Condition

**Tanım:** Test edilmesi gereken, genellikle tek bir cümleyle ifade
edilebilen bir **koşul veya durum**. En soyut/üst seviyedir.

**Örnek:** "Invalid credentials" (Geçersiz kimlik bilgileri)

## 3. Test Scenario

**Tanım:** Bir Test Condition'ı, kullanıcı davranışı bağlamında
somutlaştıran bir **cümle**. Henüz adım adım değildir.

**Örnek:** "User attempts login with valid email and invalid
password." (Kullanıcı geçerli email ve geçersiz password ile login
denemesi yapar.)

## 4. Test Case

**Tanım:** Test Scenario'yu, çalıştırılabilir hale getiren, tüm
detayları (ön koşul, veri, adımlar, beklenen sonuç) içeren **somut
doküman**.

## 5. Test Step

**Tanım:** Bir Test Case içindeki, sırayla uygulanması gereken **tek
bir eylem**.

---

## 6. Hiyerarşi Örneği

**Requirement:**

> "Kullanıcı email ve password ile login olabilir."

```text
Requirement
   ↓
Test Condition: "Invalid credentials"
   ↓
Test Scenario: "User attempts login with valid email
                and invalid password."
   ↓
Test Case:
   Precondition: Kayıtlı ve aktif bir kullanıcı hesabı mevcut.
   Test Data: email = "user@example.com", password = "WrongPass123"
   Steps:
     1. Login sayfasını aç.
     2. Email alanına "user@example.com" gir.
     3. Password alanına "WrongPass123" gir.
     4. "Giriş Yap" butonuna tıkla.
   Expected Result: Sistem "Email veya şifre hatalı" mesajı gösterir,
                     kullanıcı login olamaz.
```

Burada Step 1-4, Test Case'in içindeki **Test Step**'lerdir.

---

## 7. Neden Bu Ayrım Önemlidir?

- **Test Condition**, kapsamın (coverage) genel bir haritasını çıkarmak
  için kullanılır — "hangi koşulları test etmemiz gerekiyor?"
- **Test Scenario**, Condition'ı somutlaştırır ama hâlâ execution için
  yeterli detay içermez.
- **Test Case**, gerçekten çalıştırılabilir, tekrarlanabilir bir
  birimdir.
- **Test Step**, execution sırasında takip edilecek somut eylemlerdir.

Bir Test Condition'dan birden fazla Test Scenario, bir Test
Scenario'dan (nadiren) birden fazla Test Case türeyebilir (örneğin
aynı scenario farklı test data setleriyle).

---

## 8. Common Mistakes

- "Test Case" kelimesini, aslında bir Test Condition veya Scenario
  seviyesindeki bir ifade için kullanmak.
- Test Case yazarken Precondition veya Test Data'yı atlamak — bu,
  Test Case'i tekrarlanabilir olmaktan çıkarır.
- Bir Test Scenario'yu doğrudan "test case tamamlandı" sayıp somut
  adımlara hiç dökmemek.

---

## 9. Best Practices

- Test tasarım sürecinizi bu dört seviyeden geçirin: önce Condition
  listesi çıkarın, sonra Scenario'lara dönüştürün, sonra Case'lere
  detaylandırın.
- Her Test Case'in bağımsız olarak (başka bir test case'e bağımlı
  olmadan) çalıştırılabilir olmasını hedefleyin.
- Test Step'leri, farklı bir kişinin de aynı şekilde uygulayabileceği
  kadar net yazın.

---

## 10. Interview Notes

- "Test Scenario ile Test Case arasındaki fark nedir?" sorusuna,
  Scenario'nun bir cümle, Case'in çalıştırılabilir bir doküman
  olduğunu somut örnekle açıklayın.
- "Test Condition'dan Test Case'e nasıl gidersiniz?" sorusuna
  hiyerarşi örneğiyle (Condition → Scenario → Case → Step) cevap
  verin.

---

## İlgili Konular

- [Equivalence Partitioning](02-EQUIVALENCE-PARTITIONING.md)
- [Traceability From Requirement to Test](11-TRACEABILITY-FROM-REQUIREMENT-TO-TEST.md)
- [examples/AUTHENTICATION-FEATURE](examples/AUTHENTICATION-FEATURE/08-TEST-CONDITIONS.md)
