# P5.8 — Newman HTML Reporting — Execution Evidence

- **Branch:** `feat/phase-5-8-newman-html-reporting`
- **Base/head commit (kod değişikliği öncesi):** `e3d9a374495fd5a966839cac4d1c93ed1b0213a1` (PR #20 merge — main ile aynı)
- **Node.js:** v22.22.2
- **Newman:** 6.2.2 (pinned, `^6.2.2` — değiştirilmedi)
- **HTML reporter:** `newman-reporter-htmlextra` 1.23.1
- **Tarih:** 2026-09-23

---

## 0. Kapsam

Bu paket **test coverage genişletme paketi değildir**. Mevcut 5 Newman
collection'ına (Public, Protected/Auth, Products — Public'in bir klasörü,
Orders & Payment, Notifications) HTML reporting eklenmiştir. Hiçbir
collection dosyası, assertion, request sırası veya test mantığı
değiştirilmedi — yalnızca bir Node.js runner script'i (`newman.run()`
Node API + `htmlextra` reporter) eklendi.

**P5.7 (`scripts/run-api-db-validation.js`) kapsam dışıdır** — Postman/
Newman collection'ı değil, `node:sqlite` + `fetch` kullanan standalone bir
Node script'i; Newman HTML reporter'a zorlanmadı, kendi Markdown/evidence
modeli aynen korundu.

---

## 1. Dependency Kararı — `newman-reporter-htmlextra`

### 1.1 Paket bilgisi (npm registry, ampirik doğrulandı)

| Alan | Değer |
|---|---|
| Version | 1.23.1 |
| `peerDependencies.newman` | `^6.0.0` — pinned `newman@^6.2.2` ile uyumlu |
| `engines.node` | `>=6` — kullanılan Node v22.22.2 ile uyumlu |
| License | Apache-2.0 |
| `deprecated` | `false` |
| Son yayın | 2024-03-19 (bakımı yavaşlamış ama hâlâ fiili community standardı; aktif bakımlı bir alternatif tespit edilmedi) |
| Eklenen direkt dependency'ler | `@budibase/handlebars-helpers`, `chalk`, `cli-progress`, `commander`, `filesize`, `handlebars`, `lodash`, `moment-timezone`, `pretty-ms` (toplam 44 paket ağaca eklendi) |

Newman'ın kendi major/minor versiyonu bu reporter'a uydurmak için
**değiştirilmedi** (talimat gereği).

### 1.2 `npm audit` — before/after, paket-paket diff (yalnızca aggregate sayı değil)

`git stash` ile temiz (kurulum-öncesi) state'e dönülüp `npm audit --json`
alındı, sonra `git stash pop` ile kurulum-sonrası state'e geri dönülüp
tekrar alındı. İki JSON çıktısı paket adı bazında karşılaştırıldı:

| | BEFORE (temiz) | AFTER (`newman-reporter-htmlextra` kurulu) |
|---|---|---|
| critical | 1 | 1 |
| high | 11 | 11 |
| moderate | 7 | 9 |
| **toplam** | **19** | **21** |

**Paket-paket diff sonucu:**

- **BEFORE-only paketler:** yok.
- **AFTER-only (gerçekten YENİ) paketler:**
  - `@budibase/handlebars-helpers` — moderate (via `uuid`) — reporter'ın kendi transitive dependency'si.
  - `newman-reporter-htmlextra` (direkt paketin kendisi) — npm audit bunu "high" olarak etiketliyor; bu, npm'in DIREKT paket için transitive zincirindeki EN KÖTÜ severity'yi rollup etme davranışı (`@budibase/handlebars-helpers`, `handlebars`, `lodash`, `newman` — bunların hepsi zaten BEFORE'da mevcuttu) — yeni, önceden sayılmamış bir advisory DEĞİL.
- **Her iki state'te de bulunan ama severity bucket'ı değişen:** `newman` modülünün kendisi BEFORE'da "high", AFTER'da "moderate" — ama `via` listesi (csv-parse, lodash, postman-collection, postman-collection-transformer, postman-request, postman-runtime, serialised-error) BİREBİR AYNI. Bu gerçek bir advisory kazanımı/kaybı değil — yeni paket eklenince lockfile dedup/sıralamasının npm'in kendi display-severity rollup'ını kaydırması (kozmetik).
- **AFTER'daki TÜM critical/high paketler** (`handlebars` critical; `lodash`, `node-forge`, `underscore`, `flatted`, `@faker-js/faker`, `httpntlm`, `postman-collection`, `postman-runtime`, `postman-sandbox`, `uvm` — high) **BEFORE'da da zaten mevcuttu** — yani Newman'ın kendi transitive zincirinden, P5.1'den beri bilinen/non-blocking kabul edilen audit noise'unun aynısı.

**Net sonuç: `newman-reporter-htmlextra`'nın kendi zincirinden gelen
GERÇEK YENİ risk = 0 critical, 0 high, 1 moderate** (`@budibase/
handlebars-helpers`, `uuid` üzerinden).

### 1.3 Karar: KABUL EDİLDİ

- Dev-only devDependency — asla deploy edilen uygulamada çalışmaz, asla
  güvenilmeyen network input işlemez, asla production data/credential'a
  dokunmaz. Yalnızca Newman'ın kendi tamamlanmış local test run çıktısından
  HTML üretir (post-execution artifact generation).
- Critical (Handlebars.js) ve high (lodash, node-forge, underscore,
  flatted, vb.) bulgular zaten Newman'ın kendi transitive zincirinde
  mevcuttu — P5.1'den beri disclosed/non-blocking.
- Audit'i sıfırlamak için alakasız bir upgrade yapılmadı.
- Bu, talimattaki "critical/high gerçek risk varsa blocker" eşiğini
  karşılamıyor: gerçek yeni risk 0 critical / 0 high / 1 moderate.

---

## 2. Çıktı Dizini ve `.gitignore`

- **Canonical output directory:** `QA-DEMO-SYSTEM/api-tests/reports/`
- **`QA-DEMO-SYSTEM/.gitignore`** güncellendi — eklenen satır: `api-tests/reports/`
- Üretilen HTML raporları **default olarak git'e commit edilmez.** Bu
  evidence dosyası komutları, path'leri, metadata'yı ve özet sayıları
  içerir — ham HTML içeriği bu Markdown'a yapıştırılmamıştır.
- CI artifact stratejisi bu paketin kapsamı dışıdır (gelecekteki CI
  paketine bırakıldı).

---

## 3. Rapor İsimlendirmesi (deterministik, human-readable)

| Suite | Dosya |
|---|---|
| Public/Postman Foundation | `public-api-report.html` |
| Auth/Authorization | `auth-api-report.html` |
| Products | `products-api-report.html` |
| Orders & Payment | `orders-payment-api-report.html` |
| Notifications | `notifications-api-report.html` |

---

## 4. Runner Mimarisi

**`api-tests/scripts/generate-html-report.js`** — `newman.run()` Node API
(zaten P5.2'den beri kullanılan model) + `htmlextra` reporter'ı wrap eden
tek bir script; suite adı argüman olarak alınır (`public|auth|products|
orders|notifications|all`).

- **Products = Public collection'ın "Products" klasörü** (ayrı bir
  collection dosyası değil) — `newman.run({ folder: 'Products' })` ile
  izole edilir. Bu yalnızca reporting-amaçlı bir seçimdir, test mantığında
  değişiklik yoktur.
- **Redaction (bkz. bölüm 8):** her suite için `reporter.htmlextra.
  skipHeaders = 'Authorization'` + suite'e özel `hideResponseBody` (login/
  bootstrap request'lerinin isimleri).
- **Reset:** `requiresReset: true` işaretli suite'ler (orders,
  notifications) kendi çalışmalarından hemen önce `npm run db:seed`
  (backend) çalıştırır — mevcut README konvansiyonuyla birebir aynı
  ("her tam suite çalıştırmasından ÖNCE").
- **Exit code:** her suite `Boolean(err) || summary.run.failures.length >
  0` kontrolüyle PASS/FAIL kararını verir; `all` modunda ilk suite
  başarısız olsa bile diğer suite'ler ÇALIŞTIRILMAYA DEVAM EDER (hiçbir
  başarısızlık yutulmaz/gizlenmez), ama sonda `results.some(r =>
  r.failed)` true ise process exit code **1** olur — "rapor üretildi" ile
  "test geçti" hiçbir yerde birbirine karıştırılmaz.

### npm script'leri (`api-tests/package.json`)

```
api:report:public
api:report:auth
api:report:products
api:report:orders
api:report:notifications
api:report:all
```

---

## 5. İlk İzole Gate — Public Collection (Talimat Gereği İlk Kanıt)

```bash
cd QA-DEMO-SYSTEM/api-tests
npm run api:report:public
```

**Sonuç:** 11/11 request PASS, 26/26 assertion PASS, exit code 0, HTML
dosyası `reports/public-api-report.html` olarak üretildi, tarayıcıda
açılabilir durumda, içerik (`GET /api/health`, `Detail - In Stock`,
`Status code is 200`, `26`, `11` gibi gerçek request/summary metinleri)
doğrulandı. Bu gate geçtikten sonra diğer 4 suite'e genişletildi.

---

## 6. Gerçek Çalıştırma Sonuçları — Tüm 5 Suite (İki Ayrı Temiz-Reset Execution)

`npm run api:report:all` iki kez, arada `reports/*.html` silinerek,
gerçek sisteme karşı çalıştırıldı (RUN #1 ve RUN #2).

| Suite | Request | Assertion | RUN #1 | RUN #2 | Exit Code (her ikisi) |
|---|---|---|---|---|---|
| Public | 11/11 PASS | 26/26 PASS | PASS | PASS | 0 |
| Auth/Authorization | 19/19 PASS | 42/42 PASS | PASS | PASS | 0 |
| Products | 9/9 PASS | 24/24 PASS | PASS | PASS | 0 |
| Orders & Payment | 64/64 PASS | 118/118 PASS | PASS | PASS | 0 |
| Notifications | 20/20 PASS | 48/48 PASS | PASS | PASS | 0 |

RUN #1 ve RUN #2 request/assertion sayıları **birebir aynı** — repeatability
kanıtlandı (script ile otomatik karşılaştırıldı, satır satır eşleşme
`True`). Bu sayılar sırasıyla P5.4 (Public/Products baseline: 11/26 ve
9/24 alt-kümesi), P5.3 (Auth: 19/42), P5.5 (Orders: 64/118), P5.6
(Notifications: 20/48) evidence'larındaki mevcut baseline'larla birebir
tutarlıdır — reporter entegrasyonu hiçbir assertion'ı bozmadı/değiştirmedi.

`api:report:all` çalışması sırasında reset noktaları doğrulandı:
`[reset] npm run db:seed (backend)` — orders'tan hemen önce ve
notifications'tan hemen önce, log'da gerçek çıktısıyla gözlemlendi.

---

## 7. Controlled-Failure Proof (Non-Zero Exit Code + HTML'de Görünür Hata)

Gerçek committed test'lere DOKUNULMADAN, yalnızca session scratchpad'inde
(repo dışında) `qa-demo-system-public.postman_collection.json`'ın geçici
bir kopyası alındı; `GET /api/health` request'inin tek assertion'ı
`pm.response.to.have.status(200)` → `pm.response.to.have.status(999)`
olarak bilinçli şekilde bozuldu, aynı `cli,htmlextra` reporter zinciriyle
çalıştırıldı, sonra hem kopya collection hem üretilen rapor **silindi**
(hiçbiri repo'ya veya git'e girmedi — `git status` ile teyit edildi, tek
fark `.gitignore`/`package.json`/`package-lock.json`/yeni script).

**Sonuç:**
- `assertions: 26 executed, 1 failed`
- CLI çıktısı: `AssertionError — Status code is 200 — expected response to
  have status code 999 but got 200 — inside "GET /api/health"`
- **Process exit code: 1** (doğrulandı)
- Üretilen HTML'de ayrı bir "fails" bölümünde
  `Iteration 1 - AssertionError - QA Demo System - Public API (P5.1) -
  GET /api/health` başlığıyla ve tam hata mesajıyla **görünür şekilde**
  render edildi (metin araması ile doğrulandı: `AssertionError` bulundu,
  `expected response to have status code 999` bulundu).

Bu, reporter'ın FAIL durumunu da doğru render ettiğini ve exit code'un
PASS=0/FAIL≠0 semantiğinin reporter eklenmesiyle asla bozulmadığını
kanıtlar.

---

## 8. Secret/Token Redaction

### 8.1 Bulunan gerçek sızıntı ve düzeltmesi

İlk denemede `--reporter-htmlextra-skipHeaders "Authorization"` yalnızca
HEADER satırlarını gizliyor; `POST /api/auth/login` benzeri bootstrap
request'lerinin RESPONSE BODY'si (`{"token":"demo-session-<uuid>",...}`
— backend'in gerçek runtime session token formatı, bkz.
`backend/src/services/auth.service.js`) `skipHeaders`'dan etkilenmiyor ve
ilk üretilen 5 raporun tamamında (`public`, `auth`, `orders`,
`notifications` — `products` hariç, çünkü login request'i o klasörde
yok) gerçek/canlı bir session token'ı sızdırıyordu (`demo-session-`
prefix'i ile toplam 6 occurrence, 4 dosyada).

**Düzeltme:** her suite konfigürasyonuna, yalnızca login/bootstrap
request'lerinin adını hedefleyen `reporter.htmlextra.hideResponseBody`
eklendi (`isNotIn` handlebars helper'ı `item.name`'i case-insensitive
karşılaştırıyor — reporter kaynak kodundan doğrulandı). Bu, YALNIZCA o
request'lerin response body panelini gizler; diğer tüm request/response
body'leri (debug değeri için) görünür kalır.

### 8.2 Düzeltme sonrası tarama sonucu (RUN #2 raporları üzerinde)

| Rapor | `demo-session-` occurrence | Bearer-token-pattern | password field | AWS-key pattern | generic api-key pattern |
|---|---|---|---|---|---|
| `public-api-report.html` | 0 | 0 | 0 | 0 | 0 |
| `auth-api-report.html` | 0 | 0 | 0 | 0 | 0 |
| `products-api-report.html` | 0 | 0 | 0 | 0 | 0 |
| `orders-payment-api-report.html` | 0 | 0 | 0 | 0 | 0 |
| `notifications-api-report.html` | 0 | 0 | 0 | 0 | 0 |

Auth raporunda tespit edilen 64 adet UUID-benzeri string, gerçek token
DEĞİL — htmlextra template'inin kendi Bootstrap collapsible-panel DOM
element ID'leri (`folder-<uuid>`, `collapse-<uuid>` prefix'li) olduğu
context taramasıyla doğrulandı.

### 8.3 Synthetic veri görünürlüğü (kasıtlı — maskelenmedi)

`TEST-CARD-APPROVED` / `TEST-CARD-DECLINED` / `TEST-CARD-TIMEOUT` payment
token'ları ve `PAID`/`PAYMENT_FAILED`/`PAYMENT_TIMEOUT` order status
değerleri Orders & Payment ve Notifications raporlarında görünür
bırakıldı (Products raporunda yok — beklenen, o klasörde payment yok).
Bunlar gerçek kart bilgisi değil, deterministic sentetik test verisi;
görünür olmaları raporun "sentetik veri kullanıldığı" iddiasını
kanıtlamak için gereklidir.

---

## 9. Portability

- Rapor tek bir `.html` dosyası, backend'e (API sunucusuna) runtime
  bağımlılığı YOK — üretildikten sonra sunucu kapatılsa da açılabilir.
- Rapor İÇERİĞİ (summary, request/response verisi, assertion sonuçları)
  dosyanın kendi içinde gömülü — harici bir veri kaynağına ihtiyaç yok.
- **Bilinen sınırlama:** htmlextra'nın default template'i GÖRSEL
  STİLLEME için 10 harici CDN kaynağı kullanıyor (jQuery, Bootstrap,
  Font Awesome, highlight.js, DataTables, clipboard.js, remarkable —
  `cdnjs.cloudflare.com`, `stackpath.bootstrapcdn.com`,
  `cdn.datatables.net`). İnternete erişimi olmayan bir makinede rapor
  yine de açılır ve HAM İÇERİK (metin, sayılar, JSON body'ler) okunabilir
  durumda kalır, ancak CSS/font/JS-tabanlı interaktif özellikler (arama,
  sıralama, syntax highlighting) internet olmadan yüklenmez. Bu,
  reporter'ın değiştirilmemiş default template davranışıdır; "gratuitous
  CSS/design projesi" kapsamına girmemek için özel bir offline/inline
  template YAZILMADI — bilinen sınırlama olarak dokümante edildi.
- Path'ler tamamen `path.join(__dirname, ...)` ile relative/portable
  şekilde üretiliyor — hardcoded Windows/home-directory path yok; Windows
  ve Linux'ta aynı şekilde çalışır (Node'un kendi path modülü OS-agnostic).

---

## 10. Rapor Dosya Boyutları (RUN #2)

| Rapor | Boyut |
|---|---|
| `public-api-report.html` | ~219 KB |
| `auth-api-report.html` | ~360 KB |
| `products-api-report.html` | ~185 KB |
| `orders-payment-api-report.html` | ~1.18 MB |
| `notifications-api-report.html` | ~396 KB |

Orders & Payment en büyüğü (64 request, 118 assertion, en kapsamlı
suite) — beklenen ve orantılı bir boyut; debug değerinden ödün vermek
için içerik kısıtlanmadı (talimat gereği).

---

## 11. Mevcut Test Semantiği Değişikliği

**Değişmedi.** Hiçbir collection dosyası, `pm.test()` assertion'ı, request
sırası, environment değişkeni veya AJV/DB validation script'i bu paket
kapsamında elle değiştirilmedi. Tek yeni dosya
`api-tests/scripts/generate-html-report.js` (reporting-only wrapper) ve
`package.json`'a eklenen 6 npm script'i.

---

## 12. Bulunan Bug'lar (Sınıflandırılmış)

| Kategori | Bulgu | Durum |
|---|---|---|
| SECURITY-REDACTION BUG | `skipHeaders` header'ı gizliyor ama login response body'sindeki gerçek `demo-session-<uuid>` token'ı gizlemiyor | Bu paket kapsamında bulundu ve `hideResponseBody` ile düzeltildi (bkz. bölüm 8.1) |

Başka reporter/runner/test/documentation bug'ı bulunmadı.

---

## 13. Bilinen Sınırlamalar

1. Görsel stilleme (CSS/JS) 10 harici CDN kaynağına bağımlı — internet
   olmadan ham içerik okunabilir ama tam stil yüklenmez (bkz. bölüm 9).
2. `newman-reporter-htmlextra` son yayını 2024-03-19 — aktif geliştirme
   yavaş, ama deprecated değil ve hâlâ de facto community standardı.
3. CI artifact stratejisi (raporların CI'da nasıl saklanacağı/
   yayınlanacağı) bu paketin kapsamı dışında, gelecekteki bir CI
   paketine bırakıldı.
4. `newman-reporter-htmlextra`'nın kendi transitive zincirinde 1 yeni
   moderate audit bulgusu var (`@budibase/handlebars-helpers` via
   `uuid`) — dev-only, runtime uygulamaya etkisi yok, blocker değil
   (bkz. bölüm 1).

---

## 14. Sonuç

**PASS.** Gerçek HTML reporter (`newman-reporter-htmlextra` 1.23.1)
5 mevcut Newman suite'ine entegre edildi; tüm 5 suite raporu iki ayrı
temiz-reset execution'da PASS (toplam 123/123 request, 258/258
assertion, exit code 0 her ikisinde de); controlled-failure proof
non-zero exit code (1) ve HTML'de görünür hata render'ı kanıtladı; bir
gerçek secret-redaction bug'ı bulundu ve bu paket kapsamında düzeltildi;
düzeltme sonrası taramada hiçbir raporda gerçek token/secret bulunmadı;
mevcut test semantiği değişmedi; dependency riski kabul edilebilir
(0 yeni critical/high); üretilen raporlar `.gitignore` ile default
olarak takip dışı.
