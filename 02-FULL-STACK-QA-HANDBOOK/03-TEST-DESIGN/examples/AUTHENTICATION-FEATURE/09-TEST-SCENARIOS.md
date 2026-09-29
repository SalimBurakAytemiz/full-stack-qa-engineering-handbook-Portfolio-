# Authentication Feature — Test Scenarios

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)

---

## Yöntem

Her Test Scenario, [08-TEST-CONDITIONS.md](08-TEST-CONDITIONS.md)'deki
bir Test Condition'ı, kullanıcı davranışı bağlamında bir cümleye
dönüştürür (bkz.
`03-TEST-DESIGN/01-TEST-CONDITION-SCENARIO-CASE.md`).

---

## Test Scenario Listesi

| Scenario ID | Condition | Test Scenario |
|---|---|---|
| TS-AUTH-001 | TCOND-01 | Kullanıcı, kayıtlı ve aktif bir hesabın geçerli email ve password'üyle login dener ve başarıyla ana sayfaya yönlendirilir. |
| TS-AUTH-002 | TCOND-02 | Kullanıcı, geçerli bir email ile ama yanlış password ile login dener ve reddedilir. |
| TS-AUTH-003 | TCOND-03 | Kullanıcı, sistemde kayıtlı olmayan bir email ile login dener ve reddedilir. |
| TS-AUTH-004 | TCOND-04 | Kullanıcı, kayıtlı email adresini farklı harf büyüklüğüyle (örn. büyük harfle) girerek login dener ve başarılı olur. |
| TS-AUTH-005 | TCOND-05 | Kullanıcı, minimum uzunluk sınırının altında bir password ile kayıt/login formunu doldurur (boundary testi). |
| TS-AUTH-006 | TCOND-06 | Kullanıcı, maksimum uzunluk sınırının üstünde bir password ile login formunu doldurur (boundary testi). |
| TS-AUTH-007 | TCOND-07 | Kullanıcı ardışık olarak 5 kez yanlış password ile login dener ve 6. denemede hesabının kilitlendiğini görür. |
| TS-AUTH-008 | TCOND-08 | Kilitli bir hesap sahibi, lock süresi dolmadan doğru credential ile login dener ve yine de reddedilir. |
| TS-AUTH-009 | TCOND-09 | Devre dışı bırakılmış (disabled) bir kullanıcı, doğru credential ile login dener ve "hesap devre dışı" mesajı alır. |
| TS-AUTH-010 | TCOND-10 | Silinmiş (deleted) bir kullanıcı login dener ve genel "email veya şifre hatalı" mesajı alır. |
| TS-AUTH-011 | TCOND-11 | Disabled bir kullanıcı için, login API'si doğrudan (UI bypass edilerek) çağrılır ve reddedildiği doğrulanır. |
| TS-AUTH-012 | TCOND-12 | Aynı kullanıcı, iki farklı tarayıcı/cihazdan eşzamanlı olarak login olur ve her iki session da bağımsız çalışır. |
| TS-AUTH-013 | TCOND-13 | Login olmuş bir kullanıcı 30 dakika boyunca hiçbir işlem yapmaz ve sonraki isteğinde login sayfasına yönlendirilir. |
| TS-AUTH-014 | TCOND-14 | Kullanıcı, email ve password alanlarını boş bırakarak formu submit etmeye çalışır ve form gönderilmez. |
| TS-AUTH-015 | TCOND-15 | Kullanıcı, geçerli credential girdikten sonra "Giriş Yap" butonuna hızlıca iki kez tıklar. |

---

## Alternative Flow Notu

`01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md`'deki
sınıflandırmaya göre:

- **TS-AUTH-001, TS-AUTH-004, TS-AUTH-012:** Happy Path / Alternative
  Flow (başarılı sonuç, farklı yollar).
- **TS-AUTH-002, TS-AUTH-003, TS-AUTH-008, TS-AUTH-009, TS-AUTH-010,
  TS-AUTH-014:** Negative Flow (kontrollü red bekleniyor).
- **TS-AUTH-005, TS-AUTH-006:** Boundary (sınır değer testi).
- **TS-AUTH-007, TS-AUTH-013:** Sistem davranışı/durum geçişi testi.
- **TS-AUTH-011:** Business Rule Validation (API seviyesinde).
- **TS-AUTH-015:** Error Guessing.

---

## Sonraki Adım

[10 — Test Cases](10-TEST-CASES.md)
