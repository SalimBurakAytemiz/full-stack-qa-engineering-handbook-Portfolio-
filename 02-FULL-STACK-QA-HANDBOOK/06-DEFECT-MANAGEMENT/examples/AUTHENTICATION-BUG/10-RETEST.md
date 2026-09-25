# Authentication Bug — Retest

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)

---

## Retest Prosedürü (Planlama)

`06-DEFECT-MANAGEMENT/10-RETEST.md`'deki metodolojiye göre, bu
defect fix edildiğinde uygulanacak Retest prosedürü:

### Retest Steps (Orijinal Steps to Reproduce ile birebir)

1. Login sayfasını aç.
2. Email alanına `test.active01@example.com` gir.
3. Password alanına `WrongPass999!` gir.
4. "Giriş Yap" butonuna tıkla.

### Retest'te Doğrulanacak

- Sistem, "Email veya şifre hatalı" mesajını gösteriyor mu (AC-AUTH-004)?
- Herhangi bir generic/internal error mesajı **artık** görünmüyor mu?

---

## Retest Sonucu

**Bu defect, bu Phase'de gerçekten çalıştırılmamıştır.**

| Alan | Değer |
|---|---|
| Status | **NOT EXECUTED** |
| Retest Tarihi | — |
| Sonuç | — |

**Uydurulmayan sonuçlar:** `PASS` veya `CLOSED` sonucu bu dosyada
**kesinlikle belirtilmemiştir** — çünkü bu defect gerçekten fix
edilmemiş ve gerçekten retest edilmemiştir (bkz. `CONTRIBUTING.md` —
Evidence Integrity).

---

## Sonraki Adım

[11 — Regression](11-REGRESSION.md)
