# Requirement Clarification

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bu dosya, Phase 2'nin en pratik yeteneklerinden birini öğretir: bir
requirement'ı okuduğunuzda, development başlamadan önce hangi soruları
sormanız gerektiğini bilmek. Bu, Shift Left Testing'in en somut
uygulamasıdır.

---

## 2. Örnek Requirement

> "Kullanıcı email ve password ile login olabilir."

İlk bakışta basit görünen bu cümle, aslında onlarca belirsizlik
içerir. QA'nın işi, bu belirsizlikleri development başlamadan önce
ortaya çıkarmaktır.

---

## 3. QA'nın Sorabileceği Sorular

### Email Kuralları

- Email **case-sensitive** mi? (`User@Mail.com` ile `user@mail.com`
  aynı kullanıcı mı?)
- Email format kuralı nedir? (Standart RFC formatı mı, yoksa ek
  kısıtlamalar var mı — örn. belirli domain'ler engelli mi?)

### Password Kuralları

- Password minimum/maksimum karakter sayısı nedir?
- Password karmaşıklık kuralı var mı (büyük harf, rakam, özel
  karakter zorunluluğu)?

### Başarısız Deneme Davranışı

- Kaç başarısız denemeden sonra ne olur?
- **Account lock** mekanizması var mı? Varsa süresi ne kadar?

### Kullanıcı Durumu

- **Disabled user** login denerse ne olur?
- **Deleted user** (soft-delete edilmiş) login denerse ne olur?

### Ek Güvenlik / Oturum Davranışı

- **MFA (Multi-Factor Authentication)** var mı?
- **Session expiration** süresi ne kadar?
- **Multiple session** (aynı kullanıcı birden fazla cihazdan login
  olabilir mi) destekleniyor mu?
- **Remember Me** özelliği var mı, varsa davranışı nedir?

### Kullanıcı Deneyimi

- Hatalı giriş durumunda gösterilecek **error message** ne olacak?
  (Güvenlik gereği "email hatalı" / "password hatalı" ayrımı
  yapılmamalı mı?)
- **Rate limit** var mı (örn. IP bazlı, çok hızlı ardışık denemeler
  engelleniyor mu)?
- **Localization** — hata mesajları farklı dillerde mi gösterilecek?

### Audit

- Başarılı/başarısız login denemeleri **audit log**'a yazılıyor mu?

---

## 4. Bu Neden Bug Prevention / Shift Left'tir?

Bu soruların her biri, development başlamadan sorulduğunda, kodun
**yanlış bir varsayımla** yazılmasını önler.

**Somut örnek:** Eğer "account lock" davranışı netleşmeden geliştirme
yapılırsa, developer varsayılan olarak lock mekanizması eklemeyebilir.
QA, test aşamasında bunu "eksik" olarak fark eder, defect açar,
development tekrar bu alana döner — bu, requirement aşamasında
sorulsa 5 dakikada çözülecek bir sorunun, development + testing +
defect fix + retest döngüsüne (çok daha pahalı bir sürece) dönüşmesidir.

Bu, `00-QA-FOUNDATIONS/11-SHIFT-LEFT-AND-SHIFT-RIGHT.md` dosyasında
anlatılan Shift Left prensibinin somut uygulamasıdır: hatayı
oluşmadan önce, requirement seviyesinde önlemek.

---

## 5. Clarification Sürecinin Çıktısı

Bu sorulara verilen cevaplar, genellikle iki şekilde dokümante edilir:

1. **Requirement güncellenir** — belirsizlik netleştirilip
   requirement'a eklenir.
2. **Yeni Acceptance Criteria eklenir** — her netleştirilen kural,
   ayrı bir AC olarak yazılır (bkz.
   `02-ACCEPTANCE-CRITERIA.md`).

Netleştirilmeyen bir soru, test aşamasında öznel bir varsayıma
dönüşür — bu da tutarsız test kapsamına yol açar.

---

## 6. Common Mistakes

- Requirement'ı "yeterince açık" varsayıp hiç soru sormadan test case
  yazmaya başlamak.
- Sorulan soruların cevaplarını sözlü olarak almak ve dokümante
  etmemek.
- Yalnızca happy path'e dair soru sormak, error/edge durumlarını
  sorgulamamak.

---

## 7. Best Practices

- Requirement review sırasında, yukarıdaki kategori listesini
  (Kural, Durum, Güvenlik, UX, Audit) bir kontrol listesi gibi
  kullanın.
- Her soruyu, cevabı geldiğinde requirement'a veya AC'ye geri
  yazın — sözlü onay yeterli değildir.
- "Bu senaryo requirement'ta yok, o zaman test etmeyeceğim" değil,
  "Bu senaryo requirement'ta yok, sormam lazım" yaklaşımını
  benimseyin.

---

## 8. Interview Notes

- "Bir login requirement'ı önünüze geldiğinde ilk sorularınız neler
  olur?" sorusuna, kategorize edilmiş (kural, durum, güvenlik)
  sorularla cevap verin.
- "Requirement clarification neden Shift Left'in bir parçasıdır?"
  sorusuna, geç bulunan bir belirsizliğin maliyetini örnekle
  (account lock senaryosu) açıklayın.

---

## İlgili Konular

- [Requirement Testability](04-REQUIREMENT-TESTABILITY.md)
- [Common Requirement Problems](11-COMMON-REQUIREMENT-PROBLEMS.md)
- [00-QA-FOUNDATIONS — Shift Left & Shift Right](../00-QA-FOUNDATIONS/11-SHIFT-LEFT-AND-SHIFT-RIGHT.md)
