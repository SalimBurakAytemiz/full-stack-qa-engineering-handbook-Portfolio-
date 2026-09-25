# Authentication Feature — Test Data

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)
>
> Aşağıdaki tüm veriler **tamamen kurgusaldır** (sentetik). Hiçbir
> gerçek kullanıcı, gerçek email adresi veya gerçek şifre içermez
> (bkz. `03-TEST-DESIGN/09-TEST-DATA-DESIGN.md` — PII kuralı).

---

## Test Kullanıcıları

| Kullanıcı ID | Email | Password | Status | Kullanım Amacı |
|---|---|---|---|---|
| USER-01 | `test.active01@example.com` | `ValidPass123!` | ACTIVE | Happy Path senaryoları (TC-AUTH-HP-001, TC-AUTH-NEG-001) |
| USER-02 | `test.active02@example.com` | `ValidPass123!` | ACTIVE, `failed_attempt_count=0` | Lock sınır testi — 4 deneme (TC-AUTH-EDGE-001) |
| USER-03 | `test.active03@example.com` | `ValidPass123!` | ACTIVE, `failed_attempt_count=0` | Lock sınır testi — 5 deneme (TC-AUTH-EDGE-002) |
| USER-04 | `test.disabled01@example.com` | `ValidPass123!` | DISABLED | Business Rule / API testi (TC-AUTH-NEG-002) |
| USER-05 | `test.deleted01@example.com` | `ValidPass123!` | DELETED (soft-delete) | Deleted user senaryosu (TS-AUTH-010) |
| USER-06 | `test.locked01@example.com` | `ValidPass123!` | ACTIVE, `locked_until` = şimdiki zaman + 15 dk | Kilitli hesap senaryosu (TS-AUTH-008) |

---

## Test Data Kategorilerine Göre Sınıflandırma

`03-TEST-DESIGN/09-TEST-DATA-DESIGN.md`'deki kategorilere göre:

| Kategori | Bu Kontrollü Örnekteki Karşılığı |
|---|---|
| Valid Data | USER-01 ile doğru password kombinasyonu |
| Invalid Data | USER-01 ile yanlış password (`WrongPass999!`) |
| Boundary Data | 7/8 karakterlik ve 64/65 karakterlik password değerleri |
| Empty | Boş email/password (`""`) |
| Duplicate | (Bu kontrollü örnek kapsamında kullanılmamıştır — kayıt/registration akışı kapsam dışıdır) |
| Expired | (Bu kontrollü örnekte doğrudan kullanılmamıştır; session timeout farklı bir mekanizmadır) |
| Unauthorized | USER-04 (disabled) ve USER-05 (deleted) — sistemin reddetmesi gereken durumlar |
| Role-Based | (Bu kontrollü örnek kapsamında rol bazlı senaryo yoktur — Authentication, rol öncesi bir katmandır) |
| State-Specific | USER-06 (LOCKED durumu) |

---

## Boundary Test Değerleri (Password Uzunluğu)

| Değer | Karakter Sayısı | Beklenen |
|---|---|---|
| `AbcD12!` | 7 | Reddedilir |
| `AbcD123!` | 8 | Kabul edilir (alt sınır) |
| *(64 karakterlik kurgusal string)* | 64 | Kabul edilir (üst sınır) |
| *(65 karakterlik kurgusal string)* | 65 | Reddedilir |

---

## Önemli Not

Bu test kullanıcıları, gerçek bir sistemde **seed data** (test
ortamına önceden yüklenen kurgusal veri) olarak hazırlanmalıdır. Bu
dosya, gerçek bir veritabanı kaydı değil, hangi test verisinin
**hangi amaçla** hazırlanması gerektiğinin planlamasıdır.

---

## Sonraki Adım

[12 — Traceability](12-TRACEABILITY.md)
