# Authentication Bug — Related Requirement

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)

---

## İlgili Requirement

> "Kayıtlı ve aktif kullanıcı geçerli email ve password kullanarak
> sisteme login olabilir."

Kaynak: [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md)

---

## İlgili Acceptance Criteria

**AC-AUTH-004:** Geçersiz email veya password girildiğinde, sistem
hangi alanın hatalı olduğunu belirtmeden "Email veya şifre hatalı"
mesajını gösterir.

Kaynak: [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/03-ACCEPTANCE-CRITERIA.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/03-ACCEPTANCE-CRITERIA.md)

---

## İlgili Business Rule

**BR-AUTH-003:** Genel Hata Mesajı (Bilgi Sızıntısı Önleme) —
Email'in sistemde kayıtlı olup olmadığı, hata mesajından
anlaşılmamalıdır.

Kaynak: [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/04-BUSINESS-RULES.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/04-BUSINESS-RULES.md)

---

## Bu Defect'in Requirement ile İlişkisi

Bu educational defect, doğrudan **AC-AUTH-004**'ü ihlal ediyor:
sistem authentication'ı doğru reddediyor (bu kısmı AC ile uyumlu) ama
gösterdiği mesaj, AC-AUTH-004'te tanımlanan "Email veya şifre hatalı"
mesajı **değil**, generic bir sistem hatası.

---

## Sonraki Adım

[02 — Related Test Case](02-RELATED-TEST-CASE.md)
