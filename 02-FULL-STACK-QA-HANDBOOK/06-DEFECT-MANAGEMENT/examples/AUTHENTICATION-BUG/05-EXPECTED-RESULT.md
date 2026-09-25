# Authentication Bug — Expected Result

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)

---

## Expected Result

> Sistem, authentication'ı reddetmeli ve kullanıcıya **"Email veya
> şifre hatalı"** mesajını göstermelidir. Hangi alanın (email mi,
> password mi) hatalı olduğu **belirtilmemelidir**.

---

## Bu Expected Result'ın Kaynağı (Test Oracle)

`00-QA-FOUNDATIONS/08-TEST-ORACLE.md`'deki prensiple tutarlı olarak,
bu Expected Result öznel bir tahmin değildir — doğrudan şu kaynağa
dayanır:

- **AC-AUTH-004** (Acceptance Criteria): "Geçersiz email veya password
  girildiğinde, sistem hangi alanın hatalı olduğunu belirtmeden
  'Email veya şifre hatalı' mesajını gösterir."
- **BR-AUTH-003** (Business Rule): "Genel Hata Mesajı (Bilgi Sızıntısı
  Önleme)."

Kaynaklar: [01-RELATED-REQUIREMENT.md](01-RELATED-REQUIREMENT.md)

---

## Sonraki Adım

[06 — Actual Result](06-ACTUAL-RESULT.md)
