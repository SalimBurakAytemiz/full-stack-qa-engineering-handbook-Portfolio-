# Authentication Bug — Steps to Reproduce

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)

---

## Precondition

Aktif, kayıtlı bir kullanıcı hesabı mevcut: `test.active01@example.com`
(kurgusal test kullanıcısı — bkz.
[03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/11-TEST-DATA.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/11-TEST-DATA.md)).

## Test Data

- Email: `test.active01@example.com` (geçerli, kayıtlı kullanıcı)
- Password: `WrongPass999!` (geçersiz — kasıtlı olarak yanlış)

## Steps

1. Login sayfasını aç.
2. Email alanına `test.active01@example.com` gir.
3. Password alanına `WrongPass999!` gir.
4. "Giriş Yap" butonuna tıkla.

---

## Bu Adımlar Neden "Good Example" Standardındadır?

`06-DEFECT-MANAGEMENT/04-STEPS-TO-REPRODUCE.md`'deki kriterlere göre:

- **Açık:** Her adım tek bir eylem içeriyor.
- **Deterministic:** Aynı test data ile her zaman aynı sonuç
  (authentication reddi + yanlış mesaj) bekleniyor.
- **Tekrarlanabilir:** Precondition ve Test Data net olduğu için,
  başka bir QA aynı adımları uygulayarak aynı sonuca ulaşabilir
  (kurgusal senaryo kapsamında).

---

## Sonraki Adım

[05 — Expected Result](05-EXPECTED-RESULT.md)
