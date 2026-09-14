# Authentication Bug — Regression

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)

---

## Regression Kapsamı Planı

`06-DEFECT-MANAGEMENT/12-REGRESSION-AFTER-FIX.md`'deki metodolojiye
göre, bu defect fix edildikten sonra test edilmesi planlanan alanlar:

| Alan | Neden Regression Kapsamında |
|---|---|
| Valid Login | Fix'in Happy Path'i bozmadığından emin olmak (TC-AUTH-HP-001) |
| Invalid Password | Bu defect'in kendisi (Retest — bkz. `10-RETEST.md`) |
| Invalid Email | Aynı hata mesajlama mekanizmasını kullanıyor olabilir |
| Locked User | Account lock senaryosunda da doğru mesaj gösteriliyor mu |
| Disabled User | Disabled kullanıcı senaryosunda da doğru mesaj gösteriliyor mu |
| Session | Session oluşturma/timeout davranışının etkilenmediğinden emin olmak |
| Logout | Logout akışının etkilenmediğinden emin olmak |
| Multiple Attempts | Ardışık başarısız denemelerde her seferinde doğru mesaj gösteriliyor mu |
| Error Mapping | Genel hata mesajlama mekanizmasının başka hiçbir yerde (örn. diğer formlar) bozulmadığından emin olmak |

---

## Bu Kapsam Nasıl Belirlendi?

Bu liste, `06-DEFECT-MANAGEMENT/15-REGRESSION-IMPACT.md`'deki
prensiple belirlenmiştir: fix'in dokunduğu **hata mesajlama
mekanizması**, birden fazla senaryoda (yalnızca invalid password
değil) kullanılıyor olabileceği için, bu mekanizmayı kullanan **tüm**
bilinen senaryolar regression kapsamına alınmıştır.

---

## Execution Sonucu

**Bu regression planı, bu Phase'de gerçekten çalıştırılmamıştır.**

| Alan | Execution Status |
|---|---|
| Valid Login | NOT EXECUTED |
| Invalid Password | NOT EXECUTED |
| Invalid Email | NOT EXECUTED |
| Locked User | NOT EXECUTED |
| Disabled User | NOT EXECUTED |
| Session | NOT EXECUTED |
| Logout | NOT EXECUTED |
| Multiple Attempts | NOT EXECUTED |
| Error Mapping | NOT EXECUTED |

**Uydurulmayan sonuçlar:** Hiçbir satırda `PASS`/`FAIL` sonucu
üretilmemiştir — yalnızca **planlanan kapsam** dokümante edilmiştir
(bkz. `CONTRIBUTING.md` — Evidence Integrity).

---

## Sonraki Adım

[12 — Traceability](12-TRACEABILITY.md)
