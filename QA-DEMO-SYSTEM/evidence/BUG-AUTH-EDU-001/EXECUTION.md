# BUG-AUTH-EDU-001 — Phase 4 Execution Record

> Bu doküman, **P4.4 — Defect Reproduction & Real Evidence**
> paketinin ürünüdür. Phase 3'te tamamen kurgusal ve **hiçbir zaman
> gerçekten çalıştırılmamış** olarak dokümante edilen
> `BUG-AUTH-EDU-001` senaryosu, burada **gerçekten** QA Demo System
> üzerinde çalıştırılmış ve gerçek evidence üretilmiştir.
>
> Bu doküman Phase 3'ün tarihsel kayıtlarının **yerine geçmez** —
> onları tamamlar. Phase 3 "o tarihte planlanan neydi" sorusuna,
> bu doküman "gerçekte ne çalıştırıldı ve ne gözlemlendi" sorusuna
> cevap verir (bkz. `ARCHITECTURE.md` bölüm 19).

---

## 1. Traceability — Phase 3 Bağlantısı

| Alan | Değer |
|---|---|
| Defect | `BUG-AUTH-EDU-001` |
| Phase 3 source (historical, değiştirilmedi) | [`06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/`](../../../06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/README.md) |
| Phase 3 Bug Report | [`03-BUG-REPORT.md`](../../../06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/03-BUG-REPORT.md) |
| Phase 3 Steps to Reproduce | [`04-STEPS-TO-REPRODUCE.md`](../../../06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/04-STEPS-TO-REPRODUCE.md) |
| Phase 3 Expected Result | [`05-EXPECTED-RESULT.md`](../../../06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/05-EXPECTED-RESULT.md) |
| Phase 3 Actual Result (kurgusal) | [`06-ACTUAL-RESULT.md`](../../../06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/06-ACTUAL-RESULT.md) |
| Phase 3 Evidence Plan | [`09-EVIDENCE-PLAN.md`](../../../06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/09-EVIDENCE-PLAN.md) — bu Phase 4 kaydına referans veriyordu |
| Phase 3 Retest (historical) | [`10-RETEST.md`](../../../06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/10-RETEST.md) — **NOT EXECUTED**, değiştirilmedi |
| Phase 3 Regression (historical) | [`11-REGRESSION.md`](../../../06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/11-REGRESSION.md) — **NOT EXECUTED**, değiştirilmedi |
| Related Requirement/AC | AC-AUTH-004, BR-AUTH-003 (bkz. [`03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/`](../../../03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/03-ACCEPTANCE-CRITERIA.md)) |
| Phase 4 execution (bu doküman) | `QA-DEMO-SYSTEM/evidence/BUG-AUTH-EDU-001/EXECUTION.md` |

**Önemli:** Yukarıdaki Phase 3 dosyalarının hiçbiri bu paket kapsamında
değiştirilmemiştir. `10-RETEST.md` ve `11-REGRESSION.md`, Phase 3'ün
tarihsel `NOT EXECUTED` durumunu korumaktadır — bu, "o tarihte defect
gerçekten retest/regression edilmedi" gerçeğinin doğru kaydıdır. Bu
Phase 4 execution'ı, tamamen ayrı ve yeni bir kayıttır.

---

## 2. Execution Ortamı

| Alan | Değer |
|---|---|
| Run Timestamp (UTC) | 2026-09-15T20:39:58Z |
| Environment | QA Demo System — local, bu execution sırasında `http://localhost:4999` üzerinde çalıştırıldı (varsayılan port 3000; bu run için `PORT=4999` kullanıldı) |
| Build / Commit | `63bf3647f28e3fe4d37887486ca7bc5555ef2e63` (main, P4.3 merge sonrası — P4.4 bu execution'dan önce backend kodunda hiçbir değişiklik yapmadı) |
| Node.js | v22.22.2 |
| Database | SQLite (`node:sqlite`), P4.4 execution öncesi taze seed (`shared/test-data/auth-users.json`) |
| Browser (frontend adımları için) | Chromium (Playwright, headless) |

---

## 3. Precondition Doğrulaması

Steps to Reproduce'un precondition'ı ("Aktif, kayıtlı bir kullanıcı
hesabı mevcut: `test.active01@example.com`") gerçek veritabanı
sorgusuyla doğrulandı:

```json
{"id":1,"email":"test.active01@example.com","status":"ACTIVE"}
```

Precondition: **KARŞILANDI.**

---

## 4. Steps to Reproduce — Original vs. Actual Execution

Phase 3'ün `04-STEPS-TO-REPRODUCE.md`'sindeki adımlar **hiçbir keyfi
değişiklik yapılmadan**, artık gerçekten var olan QA Demo System
üzerinde çalıştırıldı. Tek fark, "Original Step"in UI eylemini QA
Demo System'in gerçek arayüzünde birebir karşılığıdır — adım
sırası/anlamı değişmedi:

| # | Original Step (Phase 3) | Actual Execution Step (Phase 4) |
|---|---|---|
| 1 | Login sayfasını aç. | `GET http://localhost:4999/` — QA Demo System login sayfası açıldı (bkz. `response/step1-get-login-page-headers.txt`, `response/step1-get-login-page-body.html`). |
| 2 | Email alanına `test.active01@example.com` gir. | `[data-testid="login-email"]` alanına `test.active01@example.com` girildi (Playwright, gerçek DOM etkileşimi). |
| 3 | Password alanına `WrongPass999!` gir. | `[data-testid="login-password"]` alanına `WrongPass999!` girildi (bkz. `screenshots/step3-filled-form.png`). |
| 4 | "Giriş Yap" butonuna tıkla. | `[data-testid="login-submit"]` butonuna tıklandı → frontend, `POST /api/auth/login` isteğini gönderdi (bkz. `request/step4-post-login-request.txt`, `response/step4-post-login-response-*`). |

Adımlar arasında hiçbir teknik uyarlama gerekmedi — QA Demo System'in
login formu, Phase 3'ün planladığı adımlarla birebir uyumlu
(`data-testid` seçicileri P4.1'de tam da bu tür otomasyon/reproduction
senaryoları için eklenmişti).

---

## 5. Expected Result (Phase 3'ten, değişmeden)

> Sistem, authentication'ı reddetmeli ve kullanıcıya **"Email veya
> şifre hatalı"** mesajını göstermelidir. Hangi alanın (email mi,
> password mi) hatalı olduğu belirtilmemelidir (AC-AUTH-004,
> BR-AUTH-003).

---

## 6. Actual Result (Phase 4, GERÇEK execution'dan)

### API Seviyesi (gerçek HTTP request/response)

**Request** (bkz. `request/step4-post-login-request.txt`):

```http
POST /api/auth/login HTTP/1.1
Host: localhost:4999
Content-Type: application/json

{"email":"test.active01@example.com","password":"WrongPass999!"}
```

**Response** (bkz. `response/step4-post-login-response-headers.txt`,
`response/step4-post-login-response-body.json`):

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{"error":"Email veya şifre hatalı"}
```

### UI Seviyesi (gerçek tarayıcı — Playwright, headless Chromium)

Frontend'de görüntülenen mesaj, `page.textContent('[data-testid="login-error"]')`
ile doğrudan DOM'dan okundu:

```text
"Email veya şifre hatalı"
```

Kullanıcı login sayfasında kaldı (redirect olmadı) — bkz.
`screenshots/step4-actual-result.png`.

### Server Log

`logs/server-log-full-session.txt` — bu request sırasında **hiçbir
exception, stack trace veya "System Error" benzeri generic hata log'u
üretilmedi**; log yalnızca beklenen başlangıç mesajlarını
içermektedir. Bu, backend'in isteği hatasız, amaçlanan 401 kod
yoluyla işlediğini doğrular.

---

## 7. Expected vs. Actual Karşılaştırması

| | Expected Result (Phase 3) | Actual Result (Phase 4, gerçek) |
|---|---|---|
| HTTP Status | (dokümante edilmemiş — API seviyesi Phase 3'te ele alınmamıştı) | `401 Unauthorized` |
| Gösterilen mesaj | "Email veya şifre hatalı" | **"Email veya şifre hatalı"** ✔ |
| Hangi alan hatalı belirtiliyor mu | Hayır | Hayır ✔ |
| Generic/internal error davranışı | (Phase 3 kurgusal Actual Result'ta iddia edilmişti) | **Gözlenmedi** — ne response body'de ne server log'unda |

---

## 8. Final Reproduction Result

## **NOT REPRODUCED**

### Gerekçe

- Gerçek sistemde çalıştırılan adımlar, hem API hem UI seviyesinde,
  Phase 3'ün **Expected Result**'ı ile birebir eşleşen bir davranış
  üretti: `401` + `"Email veya şifre hatalı"`.
- Phase 3'ün kurgusal Actual Result'ında tarif edilen "generic system
  error" davranışı, ne HTTP response'da ne de server log'unda
  gözlenmedi.
- **"ALREADY FIXED" değil, "NOT REPRODUCED" olarak sınıflandırıldı:**
  QA Demo System'in `backend/src/services/auth.service.js` dosyası,
  P4.1'de **en baştan** AC-AUTH-004/BR-AUTH-003'e uygun şekilde
  (aynı, tek bir generic hata mesajı — hem "kullanıcı yok" hem
  "yanlış şifre" için) yazılmıştır. Bu kod tabanında bu davranışın
  önce var olup sonra "fix edildiği" bir geçmiş **yoktur** — bu yüzden
  "ALREADY FIXED" ifadesi, olmayan bir düzeltme geçmişini ima ederek
  yanıltıcı olurdu. Doğru ve dürüst sınıflandırma **NOT REPRODUCED**'dur:
  tarif edilen defect davranışı, bu implementasyonda hiçbir zaman
  mevcut olmamıştır.
- Bu sonuç zorlanmamıştır — QA Demo System'in kendi mimarisi/kodu
  incelenerek ve gerçek execution ile doğrulanmıştır (bkz. bölüm 6).

---

## 9. Retest & Regression Bağlantısı

Bu defect **ALREADY FIXED değil, NOT REPRODUCED** olduğu için,
geleneksel anlamda bir "fix sonrası retest" prosedürü uygulanamaz
(retest edilecek bir fix yok). Bunun yerine, mevcut regression
coverage'ın bu senaryoyu koruyup korumadığı kontrol edilmiştir:

**Mevcut regression coverage bulundu — yeni test eklenmedi:**

`QA-DEMO-SYSTEM/backend/tests/auth.test.js`'deki
`'invalid password returns 401 with generic BR-AUTH-003 message'`
testi, **birebir aynı test data**'yı (`test.active01@example.com` /
`WrongPass999!`) kullanır ve **birebir aynı** beklenen sonucu
(`401` + `"Email veya şifre hatalı"`) assert eder — bu, tam olarak
`BUG-AUTH-EDU-001`'in Steps to Reproduce'udur. Bu test, P4.1'den beri
mevcuttur ve `npm test` her çalıştırıldığında bu regresyonu
otomatik olarak koruma altına almaktadır.

Bu yüzden ayrı bir `RETEST-ADDENDUM.md` veya `REGRESSION-ADDENDUM.md`
**oluşturulmamıştır** — mevcut otomatik test, gerekli regression
coverage'ı zaten sağlamaktadır; duplicate bir test/dosya üretmek
`CONTRIBUTING.md` prensiplerine ve P4.4 talimatına ("mevcut test
zaten kapsıyorsa duplicate test oluşturma") aykırı olurdu.

---

## 10. Evidence Integrity Notu

- Tüm evidence bu execution sırasında **gerçekten** üretilmiştir —
  hiçbir dosya sahte/uydurma değildir (bkz. `CONTRIBUTING.md` —
  Evidence Integrity).
- **Password masking kararı:** `request/step4-post-login-request.txt`
  içindeki test şifresi (`WrongPass999!`) bilinçli olarak
  maskelenmemiştir — bu, gerçek bir kullanıcı kimlik bilgisi değil,
  repository genelinde zaten açıkça dokümante edilmiş sentetik bir
  test değeridir (bkz. `03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/11-TEST-DATA.md`,
  `shared/test-data/auth-users.json`) — `CONTRIBUTING.md`'nin Real
  Company Data Rule'u yalnızca gerçek veriyi kapsar, kurgusal test
  verisini değil. Bu, Phase 2/3'ün kendi kurgusal test verisini
  maskelemeden gösterme konvansiyonuyla tutarlıdır.
- Gerçek bir secret/credential/production verisi **hiçbir evidence
  dosyasında yoktur** (bkz. P4.4 kapanış raporu — secret scan sonucu).

---

## 11. Sonraki Adım

Bu execution kaydı, Phase 4'ün `BUG-AUTH-EDU-001` ile ilgili tek
kaydıdır. `ARCHITECTURE.md` bölüm 22/24 (P4.4 acceptance criteria),
bu paketin başarı ölçütü olarak yalnızca "BUG-AUTH-EDU-001 gerçek
adımlarla tekrar üretildi; gerçek evidence üretildi; Phase 3 kayıtları
değişmedi; yeni Phase 4 kaydı Phase 3'e referans veriyor" şartını
koyar — sonucun `REPRODUCED` olması **şart değildir**; bu doküman bu
kriterin tamamını, dürüst bir `NOT REPRODUCED` sonucuyla karşılar.
