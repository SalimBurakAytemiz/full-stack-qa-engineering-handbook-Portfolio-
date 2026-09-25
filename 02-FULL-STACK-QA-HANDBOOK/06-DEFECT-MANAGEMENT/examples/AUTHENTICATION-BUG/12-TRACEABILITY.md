# Authentication Bug — Traceability

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)

---

## Tam Zincir (Requirement'tan Closure'a)

```text
REQ-AUTH-001
   ↓
AC-AUTH-004
   ↓
TS-AUTH-002
   ↓
TC-AUTH-NEG-001
   ↓
Educational Defect: BUG-AUTH-EDU-001
   ↓
Retest: NOT EXECUTED (bkz. 10-RETEST.md)
   ↓
Regression: NOT EXECUTED (bkz. 11-REGRESSION.md)
   ↓
Closure: Henüz gerçekleşmedi
```

---

## Her Adımın Kaynağı

| Adım | Kaynak Dosya |
|---|---|
| REQ-AUTH-001 | [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md) |
| AC-AUTH-004 | [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/03-ACCEPTANCE-CRITERIA.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/03-ACCEPTANCE-CRITERIA.md) |
| BR-AUTH-003 | [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/04-BUSINESS-RULES.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/04-BUSINESS-RULES.md) |
| TS-AUTH-002 | [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/09-TEST-SCENARIOS.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/09-TEST-SCENARIOS.md) |
| TC-AUTH-NEG-001 | [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md) |
| BUG-AUTH-EDU-001 | [03-BUG-REPORT.md](03-BUG-REPORT.md) |
| Retest | [10-RETEST.md](10-RETEST.md) |
| Regression | [11-REGRESSION.md](11-REGRESSION.md) |

---

## Bu Zincir Neden Phase 2 ve Phase 3'ü Birbirine Bağlar?

Bu Traceability zinciri, `00-QA-FOUNDATIONS/10-TRACEABILITY-FUNDAMENTALS.md`
ve `03-TEST-DESIGN/11-TRACEABILITY-FROM-REQUIREMENT-TO-TEST.md`'de
anlatılan kavramın, **Phase 2'nin analiz/tasarım çıktısı** ile
**Phase 3'ün defect yönetimi** arasında nasıl kesintisiz devam
ettiğini kanıtlar. Bir defect, hiçbir zaman "havada" ortaya çıkmaz —
her zaman bir Requirement, bir AC ve bir Test Case'e bağlıdır.

---

## Coverage Notu

Bu Traceability zinciri, `TC-AUTH-NEG-001`'in tek bir defect
(BUG-AUTH-EDU-001) ürettiğini gösterir. `03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md`'deki
diğer test case'ler (TC-AUTH-HP-001, TC-AUTH-EDGE-001/002,
TC-AUTH-BOUNDARY-001/002 vb.) bu Phase'de **hiçbir defect
üretmemiştir** çünkü onlar da bu Phase'de gerçekten
çalıştırılmamıştır (Status: NOT EXECUTED — bkz. Phase 2 kontrollü
örneği).

---

## Bu Kontrollü Örneğin Sonu

Bu, `06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/` klasöründeki
son dosyadır. Bu 13 dosya (README + 12 numaralı dosya), bir defect'in
Requirement'tan Retest/Regression'a kadar **uçtan uca** nasıl
yönetildiğini, Phase 2'deki kontrollü Authentication feature'ı ile
**doğrudan bağlantılı** şekilde göstermiştir.

---

## İlgili Konular

- [06-DEFECT-MANAGEMENT README](../../README.md)
- [README.md](README.md) (baştan başla)
