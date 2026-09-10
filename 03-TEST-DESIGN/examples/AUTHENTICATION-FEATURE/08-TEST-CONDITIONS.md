# Authentication Feature — Test Conditions

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)

---

## Yöntem

`03-TEST-DESIGN/01-TEST-CONDITION-SCENARIO-CASE.md`'de anlatıldığı
gibi, Test Condition'lar önceki adımlardaki (AC, Business Rules, Risk
Matrix) bilgiden türetilir. Her condition, bir sonraki adımda
(`09-TEST-SCENARIOS.md`) bir senaryoya dönüştürülecektir.

---

## Test Condition Listesi

| Condition ID | Test Condition | Kaynak |
|---|---|---|
| TCOND-01 | Valid credentials ile login | AC-AUTH-001 |
| TCOND-02 | Invalid password ile login | AC-AUTH-004 |
| TCOND-03 | Invalid (kayıtlı olmayan) email ile login | AC-AUTH-004, BR-AUTH-003 |
| TCOND-04 | Email case-insensitive doğrulama | AC-AUTH-002 |
| TCOND-05 | Password minimum uzunluk sınırı (boundary) | AC-AUTH-003 |
| TCOND-06 | Password maksimum uzunluk sınırı (boundary) | AC-AUTH-003 |
| TCOND-07 | 5 ardışık başarısız denemeden sonra hesap kilitlenmesi | AC-AUTH-005, RISK-AUTH-02 |
| TCOND-08 | Kilitli hesapla doğru credential ile login denemesi | AC-AUTH-006, RISK-AUTH-02 |
| TCOND-09 | Disabled kullanıcı ile login denemesi | AC-AUTH-007, RISK-AUTH-01 |
| TCOND-10 | Deleted kullanıcı ile login denemesi | AC-AUTH-008, RISK-AUTH-01 |
| TCOND-11 | Disabled kullanıcının API'yi doğrudan çağırarak login olmaya çalışması (UI bypass) | BR-AUTH-001, RISK-AUTH-01 |
| TCOND-12 | Aynı kullanıcı ile iki farklı cihazdan eşzamanlı login | AC-AUTH-009 |
| TCOND-13 | 30 dakika hareketsizlik sonrası session timeout | AC-AUTH-010 |
| TCOND-14 | Boş email/password alanı ile submit | AC-AUTH-011 |
| TCOND-15 | Ardışık çift tıklama ile login butonuna basma (Error Guessing) | Error Guessing (bkz. `03-TEST-DESIGN/07-ERROR-GUESSING.md`) |

---

## Test Condition'lar Risk Önceliğine Göre Nasıl Dağılıyor?

| Priority (Risk Matrix'ten) | İlgili Test Condition'lar |
|---|---|
| High (RISK-AUTH-01, RISK-AUTH-02) | TCOND-07, TCOND-08, TCOND-09, TCOND-10, TCOND-11 |
| Medium (RISK-AUTH-03, RISK-AUTH-04) | TCOND-02, TCOND-03, TCOND-13 |
| Diğer (temel doğrulama) | TCOND-01, TCOND-04, TCOND-05, TCOND-06, TCOND-12, TCOND-14, TCOND-15 |

Bu dağılım, `07-RISK-MATRIX.md`'de belirtilen "en yüksek öncelikli
risklerin en fazla test condition ile temsil edilmesi" prensibini
doğrular — 5 condition, doğrudan High priority risklere bağlıdır.

---

## Sonraki Adım

[09 — Test Scenarios](09-TEST-SCENARIOS.md)
