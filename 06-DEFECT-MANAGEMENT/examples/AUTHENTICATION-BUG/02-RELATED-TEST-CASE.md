# Authentication Bug — Related Test Case

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)

---

## İlgili Test Case (Negative)

**TC-AUTH-NEG-001** — Geçerli email, yanlış password ile login reddi

Kaynak: [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md)

Bu Test Case'in kurgusal execution'ı sırasında (bu klasördeki eğitim
senaryosu kapsamında), Actual Result Expected Result ile **uyuşmadığı**
için bu Test Case **FAIL** olarak değerlendirilmiş ve bir defect
(BUG-AUTH-EDU-001) açılmıştır.

---

## İlgili Happy Path Test Case (Karşılaştırma İçin)

**TC-AUTH-HP-001** — Geçerli email ve password ile başarılı login

Kaynak: [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md)

Bu Happy Path senaryosu bu defect'ten **etkilenmez** — çünkü sorun
yalnızca **hata mesajı gösterimi** katmanındadır, başarılı login
akışını etkilemez (bkz. `08-REGRESSION-IMPACT.md`).

---

## Happy Path / Negative Test / Defect İlişkisi

```text
TC-AUTH-HP-001 (Happy Path — valid user + valid password → Login
                successful)
        ile
TC-AUTH-NEG-001 (Negative — invalid password → Controlled rejection
                 expected)
                 ↓
        Execution (kurgusal): FAIL
                 ↓
        Incorrect error behaviour actual
                 ↓
        BUG-AUTH-EDU-001
```

Bu ilişki, `01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md`'de
anlatılan Happy Path / Negative Flow ayrımının, bir gerçek defect
örneğine nasıl bağlandığını gösterir: Happy Path etkilenmemiştir,
sorun yalnızca Negative Flow'un **davranış detayında** (doğru
red, ama yanlış mesaj) ortaya çıkmıştır.

---

## Sonraki Adım

[03 — Bug Report](03-BUG-REPORT.md)
