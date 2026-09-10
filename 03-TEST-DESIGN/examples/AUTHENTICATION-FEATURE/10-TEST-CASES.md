# Authentication Feature — Test Cases

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)
>
> Bu dosyadaki hiçbir Test Case **çalıştırılmamıştır**. Tüm Status
> alanları `NOT EXECUTED` olarak işaretlenmiştir. Bu, gerçek bir test
> execution kanıtı değildir; yalnızca Test Case formatının nasıl
> doldurulacağını gösteren eğitim örneğidir (bkz.
> `CONTRIBUTING.md` — Evidence Integrity).

---

## Format

Her Test Case şu alanları içerir: Test Case ID, Title, Requirement,
Type, Priority, Preconditions, Test Data, Steps, Expected Result,
Automation Candidate, Status.

---

## TC-AUTH-HP-001 (Positive)

- **Title:** Geçerli email ve password ile başarılı login
- **Requirement:** AC-AUTH-001 (bkz. `TS-AUTH-001`)
- **Type:** Positive / Happy Path
- **Priority:** High
- **Preconditions:** Sistemde `ACTIVE` durumda, kayıtlı bir kullanıcı
  hesabı mevcut (test kullanıcısı: bkz. `11-TEST-DATA.md`).
- **Test Data:** email = `test.active01@example.com`, password =
  `ValidPass123!`
- **Steps:**
  1. Login sayfasını aç.
  2. Email alanına `test.active01@example.com` gir.
  3. Password alanına `ValidPass123!` gir.
  4. "Giriş Yap" butonuna tıkla.
- **Expected Result:** Kullanıcı başarıyla doğrulanır ve ana sayfaya
  yönlendirilir; geçerli bir session oluşturulur.
- **Automation Candidate:** Evet (yüksek repetition, yüksek
  stability, yüksek business criticality — bkz.
  `03-TEST-DESIGN/12-AUTOMATION-CANDIDATE-ANALYSIS.md`)
- **Status:** NOT EXECUTED

---

## TC-AUTH-NEG-001 (Negative)

- **Title:** Geçerli email, yanlış password ile login reddi
- **Requirement:** AC-AUTH-004, BR-AUTH-003 (bkz. `TS-AUTH-002`)
- **Type:** Negative
- **Priority:** High
- **Preconditions:** Sistemde `ACTIVE` durumda, kayıtlı bir kullanıcı
  hesabı mevcut.
- **Test Data:** email = `test.active01@example.com`, password =
  `WrongPass999!`
- **Steps:**
  1. Login sayfasını aç.
  2. Email alanına `test.active01@example.com` gir.
  3. Password alanına `WrongPass999!` gir.
  4. "Giriş Yap" butonuna tıkla.
- **Expected Result:** Sistem "Email veya şifre hatalı" mesajı
  gösterir; kullanıcı login olamaz; hangi alanın hatalı olduğu
  belirtilmez (BR-AUTH-003).
- **Automation Candidate:** Evet
- **Status:** NOT EXECUTED

---

## TC-AUTH-NEG-002 (Negative — Business Rule / API Seviyesi)

- **Title:** Disabled kullanıcının API'yi doğrudan çağırarak login
  olmaya çalışması (UI bypass)
- **Requirement:** BR-AUTH-001, RISK-AUTH-01 (bkz. `TS-AUTH-011`)
- **Type:** Negative / Business Rule Validation
- **Priority:** Critical
- **Preconditions:** Sistemde `DISABLED` durumda bir kullanıcı hesabı
  mevcut.
- **Test Data:** email = `test.disabled01@example.com`, password =
  `ValidPass123!` (doğru password, ama hesap disabled)
- **Steps:**
  1. `/auth/login` API endpoint'ini, UI kullanmadan doğrudan (API test
     aracıyla) çağır.
  2. Request body'sine geçerli email/password bilgisini ekle.
  3. İsteği gönder.
- **Expected Result:** API, `401 Unauthorized` (veya eşdeğer bir hata
  kodu) döner ve **geçerli bir session token'ı üretmez**. Yalnızca
  UI'nin değil, API'nin de BR-AUTH-001'i uyguladığı doğrulanır.
- **Automation Candidate:** Evet (kritik business rule, API
  seviyesinde deterministik)
- **Status:** NOT EXECUTED

---

## TC-AUTH-EDGE-001 (Edge Case)

- **Title:** Hesap tam olarak 5. başarısız denemeden sonra kilitleniyor
  mu (sınır anı)
- **Requirement:** AC-AUTH-005, RISK-AUTH-02 (bkz. `TS-AUTH-007`)
- **Type:** Edge Case
- **Priority:** Critical
- **Preconditions:** Sistemde `ACTIVE` durumda, `failed_attempt_count
  = 0` olan bir kullanıcı hesabı mevcut.
- **Test Data:** email = `test.active02@example.com`, password (yanlış)
  = `WrongPass000!` (4 kez), password (doğru) = `ValidPass123!` (5.
  denemede)
- **Steps:**
  1. Yanlış password ile 4 kez ardışık login dene (1., 2., 3., 4.
     denemeler).
  2. Her denemeden sonra hesabın hâlâ kilitlenmediğini doğrula.
  3. 5. denemede **doğru** password ile login dene.
- **Expected Result:** 5. deneme (doğru password ile) başarılı olur —
  çünkü sayaç yalnızca **başarısız** denemeleri sayar; 4 başarısız
  deneme sonrası hesap henüz kilitlenmemiştir. Bu, "tam olarak 5.
  başarısız denemede kilitlenir" kuralının, "5. deneme her zaman
  kilitlenir" ile karıştırılmaması gerektiğini test eder.
- **Automation Candidate:** Evet
- **Status:** NOT EXECUTED

---

## TC-AUTH-EDGE-002 (Edge Case — Lock Sınırı)

- **Title:** Tam olarak 5. başarısız denemeden sonra hesabın
  kilitlenmesi
- **Requirement:** AC-AUTH-005, RISK-AUTH-02 (bkz. `TS-AUTH-007`)
- **Type:** Edge Case
- **Priority:** Critical
- **Preconditions:** Sistemde `ACTIVE` durumda, `failed_attempt_count
  = 0` olan bir kullanıcı hesabı mevcut.
- **Test Data:** email = `test.active03@example.com`, password
  (yanlış) = `WrongPass000!` (5 kez ardışık)
- **Steps:**
  1. Yanlış password ile ardışık olarak 5 kez login dene.
  2. 5. denemeden hemen sonra, **doğru** password ile 6. bir deneme
     yap.
- **Expected Result:** 5. başarısız denemeden sonra hesap kilitlenir;
  6. deneme (doğru password ile olsa bile) "Hesabınız geçici olarak
  kilitlenmiştir" mesajıyla reddedilir.
- **Automation Candidate:** Evet
- **Status:** NOT EXECUTED

---

## TC-AUTH-BOUNDARY-001 (Boundary)

- **Title:** Password alanı minimum uzunluk sınırı (7 ve 8 karakter)
- **Requirement:** AC-AUTH-003 (bkz. `TS-AUTH-005`)
- **Type:** Boundary
- **Priority:** Medium
- **Preconditions:** Login/kayıt formu erişilebilir durumda.
- **Test Data:**
  - Değer A: 7 karakterlik password (`AbcD12!` — sınırın altı)
  - Değer B: 8 karakterlik password (`AbcD123!` — alt sınır)
- **Steps:**
  1. Değer A ile formu doldur ve submit et; sonucu gözlemle.
  2. Değer B ile formu doldur ve submit et; sonucu gözlemle.
- **Expected Result:** Değer A (7 karakter) reddedilir, "Şifre en az
  8 karakter olmalıdır" mesajı gösterilir. Değer B (8 karakter) kabul
  edilir.
- **Automation Candidate:** Evet
- **Status:** NOT EXECUTED

---

## TC-AUTH-BOUNDARY-002 (Boundary)

- **Title:** Password alanı maksimum uzunluk sınırı (64 ve 65
  karakter)
- **Requirement:** AC-AUTH-003 (bkz. `TS-AUTH-006`)
- **Type:** Boundary
- **Priority:** Low
- **Preconditions:** Login/kayıt formu erişilebilir durumda.
- **Test Data:**
  - Değer A: 64 karakterlik password (üst sınır)
  - Değer B: 65 karakterlik password (sınırın üstü)
- **Steps:**
  1. Değer A ile formu doldur ve submit et; sonucu gözlemle.
  2. Değer B ile formu doldur ve submit et; sonucu gözlemle.
- **Expected Result:** Değer A (64 karakter) kabul edilir. Değer B (65
  karakter) reddedilir, "Şifre en fazla 64 karakter olabilir" mesajı
  gösterilir.
- **Automation Candidate:** Evet
- **Status:** NOT EXECUTED

---

## TC-AUTH-NEG-003 (Negative — Empty Fields)

- **Title:** Boş email ve password alanlarıyla submit
- **Requirement:** AC-AUTH-011 (bkz. `TS-AUTH-014`)
- **Type:** Negative
- **Priority:** Medium
- **Preconditions:** Login sayfası erişilebilir durumda.
- **Test Data:** email = `""` (boş), password = `""` (boş)
- **Steps:**
  1. Login sayfasını aç.
  2. Email ve password alanlarını boş bırak.
  3. "Giriş Yap" butonuna tıkla.
- **Expected Result:** Form submit edilmez; "Bu alan zorunludur"
  mesajı her iki alan için de gösterilir.
- **Automation Candidate:** Evet
- **Status:** NOT EXECUTED

---

## TC-AUTH-ERR-001 (Error Guessing)

- **Title:** "Giriş Yap" butonuna ardışık çift tıklama
- **Requirement:** Error Guessing (bkz. `TS-AUTH-015`)
- **Type:** Edge Case / Error Guessing
- **Priority:** Medium
- **Preconditions:** Sistemde `ACTIVE` durumda, kayıtlı bir kullanıcı
  hesabı mevcut.
- **Test Data:** email = `test.active01@example.com`, password =
  `ValidPass123!`
- **Steps:**
  1. Login sayfasını aç, geçerli credential'ları gir.
  2. "Giriş Yap" butonuna, sistem cevap vermeden önce hızlıca **iki
     kez** tıkla.
- **Expected Result:** Sistem yalnızca **bir** session/login isteği
  işler (buton, ilk tıklamadan sonra devre dışı bırakılır veya istek
  idempotent şekilde ele alınır); iki kez giriş denemesi veya iki
  session oluşturulmaz.
- **Automation Candidate:** Kısmi (UI timing'e bağımlı olduğu için
  flaky olma riski taşır — bkz.
  `03-TEST-DESIGN/12-AUTOMATION-CANDIDATE-ANALYSIS.md`, "Stability"
  faktörü)
- **Status:** NOT EXECUTED

---

## Sonraki Adım

[11 — Test Data](11-TEST-DATA.md)
