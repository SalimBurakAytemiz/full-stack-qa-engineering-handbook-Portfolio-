# Authentication Feature — Clarification Questions

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)

---

## Yöntem

Bu dosya, `01-REQUIREMENT-ANALYSIS/03-REQUIREMENT-CLARIFICATION.md`'de
anlatılan soru kategorilerini, bu kontrollü örneğe uygular. Her sorunun
**varsayılan cevabı**, aşağıda belirtilmiştir — bu cevaplar, gerçek bir
business/product kararı değil, **eğitim amacıyla makul kabul edilen
varsayımlardır**.

---

## Sorular ve Kontrollü Örnek İçin Kabul Edilen Cevaplar

| # | Soru | Kontrollü Örnek İçin Kabul Edilen Cevap |
|---|---|---|
| 1 | Email case-sensitive mi? | Hayır — email karşılaştırması case-insensitive yapılır. |
| 2 | Email format kuralı nedir? | Standart RFC 5322 email formatı. |
| 3 | Password minimum/maksimum uzunluk? | Minimum 8, maksimum 64 karakter. |
| 4 | Failed attempt limiti var mı? | Evet — 5 ardışık başarısız denemeden sonra hesap kilitlenir. |
| 5 | Account lock var mı, süresi ne kadar? | Evet — 15 dakika süreyle kilitlenir. |
| 6 | Disabled user login denerse ne olur? | Reddedilir, "Hesabınız devre dışı bırakılmıştır" mesajı gösterilir. |
| 7 | Deleted user login denerse ne olur? | Reddedilir, genel "Email veya şifre hatalı" mesajı gösterilir (güvenlik gereği, hesabın var olup olmadığı belli edilmez). |
| 8 | MFA var mı? | Bu kontrollü örnek kapsamında **hayır** — MFA senaryoları kapsam dışı bırakılmıştır. |
| 9 | Session expiration süresi? | 30 dakika hareketsizlik sonrası session sona erer. |
| 10 | Multiple session destekleniyor mu? | Evet — aynı kullanıcı birden fazla cihazdan aynı anda login olabilir. |
| 11 | Remember Me var mı? | Bu kontrollü örnek kapsamında **hayır** — kapsam dışı bırakılmıştır. |
| 12 | Hatalı giriş mesajı nasıl olmalı? | Email veya password'den hangisinin hatalı olduğu **belirtilmez** — genel "Email veya şifre hatalı" mesajı gösterilir (güvenlik best practice). |
| 13 | Rate limit var mı? | Bu kontrollü örnek kapsamında IP bazlı rate limit **kapsam dışı** bırakılmıştır (yalnızca hesap bazlı lock uygulanır). |
| 14 | Localization gerekiyor mu? | Bu kontrollü örnek kapsamında yalnızca Türkçe mesajlar kullanılır. |
| 15 | Audit/log davranışı? | Başarısız login denemeleri loglanır (kullanıcı ID'si maskelenerek). |

---

## Önemli Not

Yukarıdaki cevaplar, gerçek bir requirement clarification toplantısının
çıktısı **değildir**. Bu Phase'de yalnızca metodolojiyi göstermek için,
`01-REQUIREMENT-ANALYSIS/03-REQUIREMENT-CLARIFICATION.md`'de listelenen
soru kategorilerinin **tamamının** bir örnek üzerinde nasıl
cevaplanabileceği gösterilmiştir.

Bu cevaplar, bir sonraki adımda (`03-ACCEPTANCE-CRITERIA.md`) somut
Acceptance Criteria'lara dönüştürülecektir.

---

## Sonraki Adım

[03 — Acceptance Criteria](03-ACCEPTANCE-CRITERIA.md)
