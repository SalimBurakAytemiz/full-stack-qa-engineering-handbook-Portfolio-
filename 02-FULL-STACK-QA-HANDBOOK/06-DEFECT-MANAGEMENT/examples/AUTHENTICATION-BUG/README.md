# Authentication Bug — Controlled Defect Example

> ## EDUCATIONAL CONTROLLED EXAMPLE
>
> Bu klasördeki tüm içerik (README + `01`–`12` arası dosyalar),
> Phase 3'te öğretilen Defect Management metodolojisinin **uçtan uca
> nasıl uygulandığını göstermek için** kurgulanmış, tamamen eğitim
> amaçlı bir örnektir.
>
> - Bu, **gerçek bir profesyonel proje**, **gerçek bir production
>   sistemi** veya **gerçek bir HTTP response** **değildir**.
> - Kullanılan requirement, test case, bug ve veriler kurgusaldır.
> - Bu defect **hiçbir zaman gerçekten çalıştırılmamıştır** — tüm
>   Retest/Regression sonuçları `NOT EXECUTED` olarak işaretlidir
>   (bkz. `10-RETEST.md`, `11-REGRESSION.md`).
> - Amaç, metodolojinin nasıl adım adım uygulanacağını somut bir
>   örnekle göstermektir; repository sahibinin bu spesifik bug'ı
>   gerçekten bulduğu/raporladığı anlamına gelmez.

---

## Bu Örnek, Phase 2 ile Nasıl Bağlantılı?

Bu klasör,
[`03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/`](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md)'deki
kontrollü Authentication feature'ının **doğrudan devamıdır**. Orada
tasarlanan `TC-AUTH-NEG-001` test case'i, bu klasörde **kurgusal
olarak** çalıştırılmış varsayılır ve bir defect ortaya çıkarır.

---

## Senaryo Özeti

Kullanıcı, geçerli bir email ile ama **geçersiz bir password**
kullanarak login girişiminde bulunuyor.

**Expected (AC-AUTH-004'e göre):** Authentication reddedilmeli; sistem
"Email veya şifre hatalı" mesajını göstermeli.

**Educational Defect (Actual):** Authentication doğru şekilde
reddediliyor (kullanıcı login olamıyor — bu kısım doğru), **ancak**
backend/application generic bir internal error davranışı üretiyor ve
UI, kullanıcıya "Email veya şifre hatalı" yerine yanlış bir "System
Error — Please try again later" benzeri mesaj gösteriyor.

**Not:** Bu senaryoda gerçek bir HTTP response, gerçek bir production
sistemi veya gerçek bir backend log **taklit edilmemiştir** — tüm
veriler açıkça varsayımsal eğitim datasıdır.

---

## Bu Örnekte İşlenen Zincir

```text
REQ-AUTH-001 (Requirement)
   ↓
AC-AUTH-004 (Acceptance Criteria)
   ↓
TS-AUTH-002 (Test Scenario)
   ↓
TC-AUTH-NEG-001 (Test Case — Happy Path'in "kardeşi" negative testi)
   ↓
Educational Defect: BUG-AUTH-EDU-001
   ↓
Retest (NOT EXECUTED)
   ↓
Regression (NOT EXECUTED)
   ↓
Closure (henüz gerçekleşmedi)
```

---

## Dosya Sırası

1. [01 — Related Requirement](01-RELATED-REQUIREMENT.md)
2. [02 — Related Test Case](02-RELATED-TEST-CASE.md)
3. [03 — Bug Report](03-BUG-REPORT.md)
4. [04 — Steps to Reproduce](04-STEPS-TO-REPRODUCE.md)
5. [05 — Expected Result](05-EXPECTED-RESULT.md)
6. [06 — Actual Result](06-ACTUAL-RESULT.md)
7. [07 — Severity / Priority](07-SEVERITY-PRIORITY.md)
8. [08 — Regression Impact](08-REGRESSION-IMPACT.md)
9. [09 — Evidence Plan](09-EVIDENCE-PLAN.md)
10. [10 — Retest](10-RETEST.md)
11. [11 — Regression](11-REGRESSION.md)
12. [12 — Traceability](12-TRACEABILITY.md)

---

## İlgili Konular

- [03-TEST-DESIGN — Authentication Feature (Happy Path kaynak)](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md)
- [06-DEFECT-MANAGEMENT — Professional Bug Report](../../03-PROFESSIONAL-BUG-REPORT.md)
