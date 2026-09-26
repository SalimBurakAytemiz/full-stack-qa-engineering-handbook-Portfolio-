# Authentication Feature — Acceptance Criteria

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)

---

## Yöntem

Bu Acceptance Criteria (AC) listesi,
[02-CLARIFICATION-QUESTIONS.md](02-CLARIFICATION-QUESTIONS.md)'deki
cevaplardan türetilmiştir ve
`01-REQUIREMENT-ANALYSIS/02-ACCEPTANCE-CRITERIA.md`'deki kalite
kriterlerine (açık, ölçülebilir, test edilebilir) uygun şekilde
yazılmıştır.

---

## AC Listesi

**AC-AUTH-001:** Kayıtlı, aktif bir kullanıcı, doğru email ve
password ile login denediğinde, sistem kullanıcıyı doğrular ve ana
sayfaya yönlendirir.

**AC-AUTH-002:** Email adresi büyük/küçük harf farkı gözetmeksizin
(case-insensitive) doğrulanır.

**AC-AUTH-003:** Password alanı minimum 8, maksimum 64 karakter
uzunluğunda olmalıdır; bu sınırların dışındaki değerler login
formunda reddedilir.

**AC-AUTH-004:** Geçersiz email veya password girildiğinde, sistem
hangi alanın hatalı olduğunu belirtmeden "Email veya şifre hatalı"
mesajını gösterir.

**AC-AUTH-005:** Bir kullanıcı ardışık olarak 5 kez başarısız login
denemesi yaparsa, hesap 15 dakika süreyle kilitlenir ve kullanıcıya
"Hesabınız geçici olarak kilitlenmiştir" mesajı gösterilir.

**AC-AUTH-006:** Kilitli bir hesapla (lock süresi dolmadan) login
denendiğinde, doğru credential girilmiş olsa bile giriş reddedilir.

**AC-AUTH-007:** Disabled (devre dışı bırakılmış) bir kullanıcı,
doğru credential ile login denediğinde, "Hesabınız devre dışı
bırakılmıştır" mesajı ile reddedilir.

**AC-AUTH-008:** Deleted (silinmiş) bir kullanıcı login denediğinde,
genel "Email veya şifre hatalı" mesajı ile reddedilir (hesabın var
olup olmadığı belli edilmez).

**AC-AUTH-009:** Bir kullanıcı, aynı anda birden fazla cihazdan
başarıyla login olabilir (multiple session desteklenir).

**AC-AUTH-010:** Bir session, 30 dakika hareketsizlik sonrası otomatik
olarak sona erer; bu session ile yapılan sonraki bir istek, kullanıcıyı
login sayfasına yönlendirir.

**AC-AUTH-011:** Email veya password alanı boş bırakılıp submit
edildiğinde, form gönderilmez ve ilgili alan(lar) için "Bu alan
zorunludur" mesajı gösterilir.

**AC-AUTH-012:** Başarısız login denemeleri, kullanıcı kimliği
maskelenerek loglanır.

---

## Bu AC Listesi, Requirement'ın Tamamı mıdır?

**Hayır** — bu, `01-REQUIREMENT-ANALYSIS/01-REQUIREMENT-TYPES.md`'de
vurgulanan önemli bir noktadır. Bu AC listesi,
[02-CLARIFICATION-QUESTIONS.md](02-CLARIFICATION-QUESTIONS.md)'de
belirlenen kapsam dahilindeki davranışları somutlaştırır; MFA,
Remember Me, IP bazlı rate limit gibi **kapsam dışı bırakılan**
alanlar bu AC listesinde yer almaz — bu bilinçli bir kapsam
sınırlamasıdır, eksiklik değil.

---

## Sonraki Adım

[04 — Business Rules](04-BUSINESS-RULES.md)
