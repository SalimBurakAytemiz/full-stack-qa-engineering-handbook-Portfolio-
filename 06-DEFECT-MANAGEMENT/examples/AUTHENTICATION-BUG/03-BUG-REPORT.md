# Authentication Bug — Bug Report

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)
>
> Aşağıdaki tüm veriler (Bug ID, build numarası, log içeriği)
> tamamen kurgusaldır ve öğretim amaçlıdır.

---

## Tam Bug Raporu

Format: [../../templates/BUG-REPORT-TEMPLATE.md](../../templates/BUG-REPORT-TEMPLATE.md)

```text
Bug ID: BUG-AUTH-EDU-001
Title: [Web][Authentication] Invalid password attempt returns
       generic system error instead of authentication error
Feature: Authentication
Platform: Web
Environment: Staging (Educational/Controlled)
Build/Version: v0.0.0-educational-example
Device/OS/Browser: Desktop / Windows 11 / Chrome 124 (varsayımsal)

Preconditions: Aktif, kayıtlı bir kullanıcı hesabı mevcut
               (test.active01@example.com).
Test Data: email=test.active01@example.com,
           password=WrongPass999! (yanlış password)

Steps to Reproduce:
  1. Login sayfasını aç.
  2. Geçerli email gir (test.active01@example.com).
  3. Geçersiz password gir (WrongPass999!).
  4. "Giriş Yap" butonuna tıkla.

Expected Result: "Email veya şifre hatalı" mesajı gösterilmeli,
                 kullanıcı login olamamalı (bkz. AC-AUTH-004).
Actual Result: Kullanıcı login olamıyor (bu kısım doğru) ANCAK
               sistem "Email veya şifre hatalı" yerine "System
               Error — Please try again later" (varsayımsal, generic
               bir hata) mesajı gösteriyor.

Reproduction Rate: 5/5 (varsayımsal — eğitim senaryosu kapsamında)
Severity: Medium (bkz. 07-SEVERITY-PRIORITY.md)
Priority: High (bkz. 07-SEVERITY-PRIORITY.md)
Related Requirement: AC-AUTH-004
Related Test Case: TC-AUTH-NEG-001
Regression Impact: Yok — yalnızca hata mesajlama katmanını etkiliyor
                    (bkz. 08-REGRESSION-IMPACT.md)
Evidence: bkz. 09-EVIDENCE-PLAN.md — NOT CAPTURED (defect gerçekten
          çalıştırılmadı)
Logs: NOT AVAILABLE (eğitim senaryosu)
API Evidence: NOT EXECUTED (eğitim senaryosu)
Owner/Team: Backend Team (Authentication Service) — varsayımsal
Status: NEW (bkz. 02-DEFECT-LIFECYCLE.md)
```

---

## Bug Title Standardına Uygunluk

Title, `06-DEFECT-MANAGEMENT/03-PROFESSIONAL-BUG-REPORT.md`'deki
`[Platform][Feature] Problem` formatına uygundur:

> `[Web][Authentication] Invalid password attempt returns generic
> system error instead of authentication error`

---

## Sonraki Adım

[04 — Steps to Reproduce](04-STEPS-TO-REPRODUCE.md)
