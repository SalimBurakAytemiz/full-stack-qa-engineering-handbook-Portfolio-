# Authentication Feature — Traceability

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)

---

## Yöntem

Bu dosya, `03-TEST-DESIGN/11-TRACEABILITY-FROM-REQUIREMENT-TO-TEST.md`'de
tanıtılan zinciri, bu kontrollü örnek üzerinden uçtan uca gösterir.

---

## Traceability Matrisi

| Requirement | Acceptance Criteria | Business Rule | Risk | Test Condition | Test Scenario | Test Case |
|---|---|---|---|---|---|---|
| Authentication Requirement | AC-AUTH-001 | — | — | TCOND-01 | TS-AUTH-001 | TC-AUTH-HP-001 |
| Authentication Requirement | AC-AUTH-004 | BR-AUTH-003 | — | TCOND-02 | TS-AUTH-002 | TC-AUTH-NEG-001 |
| Authentication Requirement | — | BR-AUTH-001 | RISK-AUTH-01 | TCOND-11 | TS-AUTH-011 | TC-AUTH-NEG-002 |
| Authentication Requirement | AC-AUTH-005 | BR-AUTH-002 | RISK-AUTH-02 | TCOND-07 | TS-AUTH-007 | TC-AUTH-EDGE-001, TC-AUTH-EDGE-002 |
| Authentication Requirement | AC-AUTH-003 | — | — | TCOND-05 | TS-AUTH-005 | TC-AUTH-BOUNDARY-001 |
| Authentication Requirement | AC-AUTH-003 | — | — | TCOND-06 | TS-AUTH-006 | TC-AUTH-BOUNDARY-002 |
| Authentication Requirement | AC-AUTH-011 | — | — | TCOND-14 | TS-AUTH-014 | TC-AUTH-NEG-003 |
| Authentication Requirement | — | — | — | TCOND-15 | TS-AUTH-015 | TC-AUTH-ERR-001 |

---

## Örnek Zincir Üzerinden Okuma

**RISK-AUTH-02** ("Account lock mekanizmasının hiç çalışmaması")
riskini ele alalım:

```text
Requirement ("Kayıtlı ve aktif kullanıcı ... login olabilir")
   ↓
AC-AUTH-005 ("5 ardışık başarısız denemeden sonra hesap kilitlenir")
   ↓
BR-AUTH-002 ("Account Lock Mekanizması")
   ↓
RISK-AUTH-02 (Priority: High)
   ↓
TCOND-07 ("5 ardışık başarısız denemeden sonra hesap kilitlenmesi")
   ↓
TS-AUTH-007 (Test Scenario)
   ↓
TC-AUTH-EDGE-001, TC-AUTH-EDGE-002 (Test Cases — sınırın her iki
tarafı)
   ↓
Execution: NOT EXECUTED (bu Phase'de çalıştırılmadı)
```

Bu zincir, `RISK-AUTH-02`'nin **yalnızca bir yerde listelenmediğini**,
requirement'tan somut test case'lere kadar **tam olarak izlenebilir**
olduğunu kanıtlar.

---

## Coverage Gözlemi

8 satırlık bu matris, [03-ACCEPTANCE-CRITERIA.md](03-ACCEPTANCE-CRITERIA.md)'deki
12 AC'nin **tamamını** değil, öğretim amacıyla seçilen **temsili bir
alt kümesini** kapsar. Gerçek bir projede, Traceability matrisinin
**her AC** için en az bir satır içermesi beklenir — bu kontrollü
örnekte, metodolojiyi göstermek amacıyla en yüksek riskli ve en
öğretici senaryolar seçilmiştir.

---

## Sonraki Adım

[13 — Automation Candidates](13-AUTOMATION-CANDIDATES.md)
