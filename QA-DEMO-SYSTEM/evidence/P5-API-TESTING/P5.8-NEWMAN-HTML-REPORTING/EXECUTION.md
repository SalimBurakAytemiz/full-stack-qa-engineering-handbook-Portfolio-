# P5.8 — Newman HTML Reporting — Execution Evidence

- **Branch:** `feat/phase-5-8-newman-html-reporting`
- **Base/head commit (kod değişikliği öncesi):** `e3d9a374495fd5a966839cac4d1c93ed1b0213a1` (PR #20 merge — main ile aynı)
- **Node.js:** v22.22.2
- **Newman:** 6.2.2 (pinned, `^6.2.2` — değiştirilmedi, bu fix round'da da değiştirilmedi)
- **HTML reporter:** `newman-reporter-htmlextra` 1.23.1 (bu fix round'da version değiştirilmedi)
- **Tarih:** 2026-09-23

---

## 0. Fix Round Özeti (Codex Delta Review #1)

**Verdict:** FAIL / CHANGES REQUIRED — 1 blocker (B1), 2 non-blocking not.

| # | Bulgu | Sınıflandırma | Durum |
|---|---|---|---|
| B1 | `execFileSync('npm', ...)` Windows'ta `npm.cmd` shim'ini shell olmadan güvenilir şekilde bulamaz — Orders/Notifications reset'i ve `api:report:all` Windows'ta çalışmayabilir | RUNNER BUG | Düzeltildi |
| Non-blocking #1 | `skipHeaders` yalnızca header'ları gizliyor; login/bootstrap request'lerinin REQUEST body'sindeki sentetik password (`ValidPass123!`) de raporda görünüyordu | SECURITY-REDACTION (sıkılaştırma) | Düzeltildi |
| Non-blocking #2 | Handlebars audit advisory'sinin hangi dependency chain'den geldiği net değildi | DEPENDENCY ISSUE (belgeleme) | Belgelendi (aşağıda) |

**B1 düzeltmesi:** `scripts/generate-html-report.js`'e platform-aware bir
`NPM_COMMAND` sabiti eklendi:

```js
const NPM_COMMAND = process.platform === 'win32' ? 'npm.cmd' : 'npm';
```

ve `resetDatabase()` içindeki `execFileSync('npm', ...)` çağrısı
`execFileSync(NPM_COMMAND, ...)` olarak değiştirildi. Korunanlar:
`shell: true` **açılmadı** (execFileSync'in default'u `shell: false`
olarak kaldı — args hâlâ array, command injection yüzeyi
genişletilmedi), argümanlar hâlâ array (`['run', 'db:seed']`), `stdio:
'inherit'` korunuyor (stdout/stderr görünür), exit-code propagation
korunuyor (`execFileSync` alt process non-zero exit code'da senkron
olarak throw eder, bu da script'i non-zero exit code ile sonlandırır —
davranış değişmedi, yalnızca binary çözümlemesi düzeltildi).

Codebase'de bu script dışında hiçbir yerde subprocess/npm invocation
yapılmıyordu (`grep -rn "execFileSync\|execSync\|spawn(" scripts/`
başka eşleşme vermedi) — duplicate bir process helper oluşturulmadı,
tek call site'a yerel bir sabit eklendi.

**Dürüstlük notu (Evidence Integrity):** Bu execution ortamı Linux
container'dır — `npm.cmd` branch'i **literal olarak Windows'ta
çalıştırılarak doğrulanmadı**, yalnızca kod seviyesinde doğrulandı
(`process.platform === 'win32'` koşulu, path modülünün OS-agnostic
`path.join` kullanımı, hardcoded path'lerin yokluğu — bkz. bölüm 10).
"Windows portability: RESOLVED" iddiası bu nedenle **code-level
verified**, **execution-level verified DEĞİL** olarak işaretlenmiştir.
Linux (`npm`) branch'i gerçek execution ile iki kez doğrulandı (aşağıda).

**Non-blocking #1 düzeltmesi:** Her suite'in login/bootstrap
request'leri için artık hem `hideRequestBody` hem `hideResponseBody`
uygulanıyor (aynı isim listesi) — bkz. bölüm 9.

**Non-blocking #2:** `npm explain handlebars` ile tam dependency chain
çıkarıldı — bkz. bölüm 2.2.

---

## 1. Kapsam

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

## 2. Dependency Kararı — `newman-reporter-htmlextra`

### 2.1 Paket bilgisi (npm registry, ampirik doğrulandı)

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
**değiştirilmedi** (talimat gereği, bu fix round'da da geçerli).

### 2.2 `npm audit` — before/after, paket-paket diff (yalnızca aggregate sayı değil)

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

### 2.3 Handlebars advisory — tam dependency chain (Codex non-blocking #2 için)

`npm explain handlebars` ile iki AYRI kurulum tespit edildi:

1. **`handlebars@4.7.8`** (hoisted, `node_modules/handlebars`) —
   `newman@6.2.2` → `postman-runtime@7.39.1` → `handlebars@4.7.8`
   zincirinden geliyor. Bu, **Newman'ın kendi, önceden var olan**
   dependency'si — `newman-reporter-htmlextra` kurulmadan ÖNCE de
   mevcuttu (bölüm 2.2'deki before-install audit'inde de görünüyordu).
   `@budibase/handlebars-helpers`'ın `^4.7.7` gereksinimi de bu hoisted
   sürüm tarafından karşılanıyor.
2. **`handlebars@4.7.7`** (nested, `node_modules/newman-reporter-
   htmlextra/node_modules/handlebars`) — doğrudan
   `newman-reporter-htmlextra@1.23.1`'in kendi pinned dependency'si.
   Bu, reporter'ın kendi getirdiği AYRI bir kopya.

İkisi de audit'in flaglediği vulnerable range içinde (`4.0.0 - 4.7.8`,
üst sınır dahil). Yani: **critical advisory'nin kendisi Newman'ın
zaten mevcut zincirinden geliyor (pre-existing); reporter EK OLARAK
kendi nested kopyasını getiriyor (aynı advisory, ikinci bir path).**

**Runtime/dev-only risk değerlendirmesi:** `grep -rln "handlebars"
backend/src frontend` ve `find backend/node_modules frontend/
node_modules -maxdepth 1 -iname handlebars` — ikisi de boş sonuç
verdi. Handlebars, backend'in veya frontend'in çalıştırdığı hiçbir
kod yolunda YOK; yalnızca `api-tests/`'in devDependency ağacında
(workspace-hoisted `QA-DEMO-SYSTEM/node_modules/`). Reporter,
Handlebars'ı yalnızca Newman'ın KENDİ ürettiği, güvenilir, local JSON
run-summary'sini bir `.hbs` template'e render etmek için kullanır —
güvenilmeyen/harici kullanıcı girdisi bu template'e hiç geçmez
(exploitable path — AST type confusion'ın gerektirdiği güvenilmeyen
template/partial injection — bu kullanım biçiminde gösterilemedi).

**Sınıflandırma: KNOWN DEPENDENCY ADVISORY.** Dev/reporting-only zincir,
runtime uygulamaya bundle olmuyor, bu kullanım biçiminde gerçek
exploitation path yok. Blocker değil. Audit'i sıfırlamak için alakasız
bir dependency upgrade YAPILMADI.

### 2.4 Karar: KABUL EDİLDİ (değişmedi)

- Dev-only devDependency — asla deploy edilen uygulamada çalışmaz, asla
  güvenilmeyen network input işlemez, asla production data/credential'a
  dokunmaz.
- Critical (Handlebars.js, iki path — bölüm 2.3) ve high (lodash,
  node-forge, underscore, flatted, vb.) bulgular zaten Newman'ın kendi
  transitive zincirinde mevcuttu — P5.1'den beri disclosed/non-blocking.
- Bu, talimattaki "critical/high gerçek risk varsa blocker" eşiğini
  karşılamıyor: gerçek yeni risk 0 critical / 0 high / 1 moderate.

---

## 3. Çıktı Dizini ve `.gitignore`

- **Canonical output directory:** `QA-DEMO-SYSTEM/api-tests/reports/`
- **`QA-DEMO-SYSTEM/.gitignore`** güncellendi — eklenen satır: `api-tests/reports/`
- Üretilen HTML raporları **default olarak git'e commit edilmez.** Bu
  evidence dosyası komutları, path'leri, metadata'yı ve özet sayıları
  içerir — ham HTML içeriği bu Markdown'a yapıştırılmamıştır.
- CI artifact stratejisi bu paketin kapsamı dışıdır (gelecekteki CI
  paketine bırakıldı).

---

## 4. Rapor İsimlendirmesi (deterministik, human-readable)

| Suite | Dosya |
|---|---|
| Public/Postman Foundation | `public-api-report.html` |
| Auth/Authorization | `auth-api-report.html` |
| Products | `products-api-report.html` |
| Orders & Payment | `orders-payment-api-report.html` |
| Notifications | `notifications-api-report.html` |

---

## 5. Runner Mimarisi

**`api-tests/scripts/generate-html-report.js`** — `newman.run()` Node API
(zaten P5.2'den beri kullanılan model) + `htmlextra` reporter'ı wrap eden
tek bir script; suite adı argüman olarak alınır (`public|auth|products|
orders|notifications|all`).

- **Products = Public collection'ın "Products" klasörü** (ayrı bir
  collection dosyası değil) — `newman.run({ folder: 'Products' })` ile
  izole edilir. Bu yalnızca reporting-amaçlı bir seçimdir, test mantığında
  değişiklik yoktur.
- **Windows-safe reset (fix round, bölüm 0):** `NPM_COMMAND =
  process.platform === 'win32' ? 'npm.cmd' : 'npm'`, `execFileSync`
  `shell: false` ile (default), array argümanlar.
- **Redaction (bkz. bölüm 9):** her suite için `reporter.htmlextra.
  skipHeaders = 'Authorization'` + login/bootstrap request'lerinin
  hem `hideRequestBody` hem `hideResponseBody`'si.
- **Reset:** `requiresReset: true` işaretli suite'ler (orders,
  notifications) kendi çalışmalarından hemen önce `npm run db:seed`
  (backend, Windows-safe resolver üzerinden) çalıştırır — mevcut
  README konvansiyonuyla birebir aynı ("her tam suite çalıştırmasından
  ÖNCE").
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

## 6. İlk İzole Gate — Public Collection (Talimat Gereği İlk Kanıt)

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

## 7. Gerçek Çalıştırma Sonuçları — Tüm 5 Suite

Toplam **4 ayrı temiz-reset execution** ile doğrulandı: ilk implementasyon
turunda 2 (Codex review'inden önce), fix round'da (bu turda, B1 + redaction
düzeltmesinden sonra) 2 daha. `npm run api:report:all` her seferinde,
arada `reports/*.html` silinerek, gerçek sisteme karşı çalıştırıldı.

| Suite | Request | Assertion | Fix-round RUN #1 | Fix-round RUN #2 | Exit Code (her ikisi) |
|---|---|---|---|---|---|
| Public | 11/11 PASS | 26/26 PASS | PASS | PASS | 0 |
| Auth/Authorization | 19/19 PASS | 42/42 PASS | PASS | PASS | 0 |
| Products | 9/9 PASS | 24/24 PASS | PASS | PASS | 0 |
| Orders & Payment | 64/64 PASS | 118/118 PASS | PASS | PASS | 0 |
| Notifications | 20/20 PASS | 48/48 PASS | PASS | PASS | 0 |

Request/assertion sayıları fix round'da da **birebir aynı** kaldı
(toplam 123/123 request, 258/258 assertion) — B1 ve redaction
düzeltmeleri hiçbir assertion'ı değiştirmedi/bozmadı. Bu sayılar
sırasıyla P5.4 (Public/Products baseline: 11/26 ve 9/24 alt-kümesi),
P5.3 (Auth: 19/42), P5.5 (Orders: 64/118), P5.6 (Notifications: 20/48)
evidence'larındaki mevcut baseline'larla birebir tutarlıdır.

`api:report:all` çalışması sırasında reset noktaları doğrulandı:
`[reset] npm run db:seed (backend)` — orders'tan hemen önce ve
notifications'tan hemen önce, log'da gerçek çıktısıyla gözlemlendi
(fix round'da Windows-safe `NPM_COMMAND` resolver'ı üzerinden, Linux
`npm` branch'i).

---

## 8. Controlled-Failure Proof (Non-Zero Exit Code + HTML'de Görünür Hata)

Gerçek committed test'lere DOKUNULMADAN, yalnızca session scratchpad'inde
(repo dışında) `qa-demo-system-public.postman_collection.json`'ın geçici
bir kopyası alındı; `GET /api/health` request'inin tek assertion'ı
`pm.response.to.have.status(200)` → `pm.response.to.have.status(999)`
olarak bilinçli şekilde bozuldu, aynı `cli,htmlextra` reporter zinciriyle
çalıştırıldı, sonra hem kopya collection hem üretilen rapor **silindi**
(hiçbiri repo'ya veya git'e girmedi — `git status` ile her iki turda da
teyit edildi). Fix round'da (B1 + redaction düzeltmesinden sonra) bu
proof **tekrar** çalıştırıldı, aynı sonuçla:

**Sonuç (ilk tur ve fix round'da birebir aynı):**
- `assertions: 26 executed, 1 failed`
- CLI çıktısı: `AssertionError — Status code is 200 — expected response to
  have status code 999 but got 200 — inside "GET /api/health"`
- **Process exit code: 1** (doğrulandı, her iki turda)
- Üretilen HTML'de ayrı bir "fails" bölümünde `AssertionError` başlığı
  ve `expected response to have status code 999` tam hata mesajıyla
  **görünür şekilde** render edildi (metin araması ile doğrulandı).

Bu, reporter'ın FAIL durumunu da doğru render ettiğini ve exit code'un
PASS=0/FAIL≠0 semantiğinin reporter eklenmesiyle (ve fix round'daki
script değişiklikleriyle) asla bozulmadığını kanıtlar.

---

## 9. Secret/Token Redaction

### 9.1 İlk turda bulunan gerçek sızıntı ve düzeltmesi

İlk denemede `--reporter-htmlextra-skipHeaders "Authorization"` yalnızca
HEADER satırlarını gizliyor; `POST /api/auth/login` benzeri bootstrap
request'lerinin RESPONSE BODY'si (`{"token":"demo-session-<uuid>",...}`
— backend'in gerçek runtime session token formatı, bkz.
`backend/src/services/auth.service.js`) `skipHeaders`'dan etkilenmiyor ve
ilk üretilen 5 raporun tamamında (`public`, `auth`, `orders`,
`notifications` — `products` hariç, çünkü login request'i o klasörde
yok) gerçek/canlı bir session token'ı sızdırıyordu.

**Düzeltme:** her suite konfigürasyonuna, yalnızca login/bootstrap
request'lerinin adını hedefleyen `reporter.htmlextra.hideResponseBody`
eklendi (`isNotIn` handlebars helper'ı `item.name`'i case-insensitive
karşılaştırıyor — reporter kaynak kodundan doğrulandı).

### 9.2 Codex non-blocking #1 — request body'deki sentetik password

Codex, field-name-only tarama (`"password field": 0`) yerine VALUE
bazlı doğrulama istedi. İnceleme: tüm 4 collection'ın login request'leri
aynı sentetik, deterministic test password'ünü ham metin olarak
gövdesinde taşıyor (`{"email":"test.active01@example.com","password":
"ValidPass123!"}`). Bu gerçek bir credential değil (Real Company Data
Rule kapsamında sentetik test verisi), ama Codex'in "VALUE görünmemeli"
talebine uyularak sıkılaştırıldı: `reporter.htmlextra.hideRequestBody`
de aynı login/bootstrap request isim listesiyle eklendi — artık bu
request'lerin ne request ne response body'si raporda görünür; diğer
TÜM request/response body'leri (debug değeri için) değişmeden görünür
kalıyor.

`newman-reporter-htmlextra@1.23.1`'in gerçekten desteklediği ilgili
seçenekler (kurulu paketin `README.md`'sinden doğrulandı, tahmin
edilmedi): `skipHeaders`, `omitHeaders`, `hideRequestBody`,
`hideResponseBody`, `omitRequestBodies`, `omitResponseBodies`,
`skipSensitiveData`, `skipEnvironmentVars`, `skipGlobalVars`. Bu
paket için hedefe en uygun olanlar (`skipHeaders` + `hideRequestBody`
+ `hideResponseBody`, yalnızca login/bootstrap request'lerine
uygulanarak) seçildi — `skipSensitiveData` veya `omit*Bodies` gibi
TÜM request'leri etkileyen daha kaba seçenekler kullanılmadı, çünkü bu
diğer request'lerin debug değerini (response body'lerindeki gerçek
API contract'ı) gereksiz yere yok ederdi.

### 9.3 Değer-bazlı (value-based) tarama sonucu — fix round sonrası

Gerçek bir login çağrısıyla canlı bir token yakalandı
(`demo-session-32fe5c62-c203-44e5-9716-331e4810429f` — örnek, her
run'da farklı UUID) ve tüm 5 raporda şu değerler arandı (yalnızca
field adı değil, gerçek VALUE):

| Rapor | `demo-session-` (gerçek token pattern'i) | `ValidPass123!` (sentetik password, ham) | `Bearer <value>` pattern'i |
|---|---|---|---|
| `public-api-report.html` | 0 | 0 | 0 |
| `auth-api-report.html` | 0 | 0 | 0 |
| `products-api-report.html` | 0 | 0 | 0 |
| `orders-payment-api-report.html` | 0 | 0 | 0 |
| `notifications-api-report.html` | 0 | 0 | 0 |

Ek olarak field-name-bazlı tarama da tekrarlandı (`password field
w/value`, `AWS-like key`, `Authorization header value` regex'leri) —
tüm 5 raporda 0. Auth raporunda tespit edilen UUID-benzeri stringlerin
htmlextra template'inin kendi Bootstrap collapsible-panel DOM element
ID'leri (`folder-<uuid>`, `collapse-<uuid>` prefix'li) olduğu daha
önceki turda context taramasıyla doğrulanmıştı, değişmedi.

### 9.4 Synthetic veri görünürlüğü (kasıtlı — maskelenmedi)

`TEST-CARD-APPROVED` / `TEST-CARD-DECLINED` / `TEST-CARD-TIMEOUT` payment
token'ları ve `PAID`/`PAYMENT_FAILED`/`PAYMENT_TIMEOUT` order status
değerleri Orders & Payment, Auth ve Notifications raporlarında görünür
bırakıldı. Bunlar gerçek kart bilgisi değil, deterministic sentetik
test verisi; görünür olmaları raporun "sentetik veri kullanıldığı"
iddiasını kanıtlamak için gereklidir ve login/bootstrap dışındaki
request'lerin body'lerine dokunulmadığı için değişmeden kaldı.

---

## 10. Portability

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
  şekilde üretiliyor — hardcoded Windows/home-directory path yok.
- **Windows portability — code-level verified, execution-level NOT
  verified:** Bu execution ortamı Linux container'dır; `npm.cmd`
  branch'i literal olarak bir Windows makinesinde çalıştırılarak
  doğrulanmadı. Doğrulanan: (a) `process.platform === 'win32'` koşulu
  kaynak kodda doğru yazılı, (b) `path.join` kullanımı OS-agnostic,
  (c) hiçbir hardcoded Windows/Linux absolute path veya home-directory
  path yok, (d) `shell: true` açılmadı (args array olarak kalıyor,
  command injection yüzeyi genişletilmedi). Linux (`npm`) branch'i
  gerçek execution ile 4 ayrı temiz-reset run'da doğrulandı (bölüm 7).
  `api-tests/README.md` bu ayrımı netleştirecek şekilde güncellendi
  (bölüm 15.2 ve 15.6).

---

## 11. Rapor Dosya Boyutları (fix-round RUN #2)

| Rapor | Boyut |
|---|---|
| `public-api-report.html` | ~213 KB |
| `auth-api-report.html` | ~349 KB |
| `products-api-report.html` | ~181 KB |
| `orders-payment-api-report.html` | ~1.12 MB |
| `notifications-api-report.html` | ~384 KB |

Orders & Payment en büyüğü (64 request, 118 assertion, en kapsamlı
suite) — beklenen ve orantılı bir boyut; debug değerinden ödün vermek
için içerik kısıtlanmadı. Login/bootstrap body'lerinin gizlenmesi
boyutları hafifçe küçülttü (önceki tura göre ~1-3 KB/rapor).

---

## 12. Mevcut Test Semantiği Değişikliği

**Değişmedi.** Hiçbir collection dosyası, `pm.test()` assertion'ı, request
sırası, environment değişkeni veya AJV/DB validation script'i bu paket
kapsamında (ilk tur veya fix round'da) elle değiştirilmedi. Değişen tek
kod dosyası `api-tests/scripts/generate-html-report.js` (reporting-only
wrapper); fix round'da yalnızca NPM_COMMAND resolver'ı ve
hideRequestBody eklendi — hiçbiri Newman'a giden collection/assertion
içeriğini etkilemez.

---

## 13. Bulunan Bug'lar (Sınıflandırılmış)

| Kategori | Bulgu | Durum |
|---|---|---|
| RUNNER BUG | `execFileSync('npm', ...)` Windows'ta `npm.cmd` shim'ini shell olmadan bulamayabilir (Codex B1) | Düzeltildi — platform-aware `NPM_COMMAND` (bölüm 0) |
| SECURITY-REDACTION BUG | `skipHeaders` header'ı gizliyor ama login response body'sindeki gerçek `demo-session-<uuid>` token'ı gizlemiyor | Düzeltildi — `hideResponseBody` (bölüm 9.1) |
| SECURITY-REDACTION (sıkılaştırma, Codex non-blocking #1) | Login request body'sindeki sentetik password ham metin olarak görünüyordu | Düzeltildi — `hideRequestBody` (bölüm 9.2) |
| DEPENDENCY ISSUE (belgeleme, Codex non-blocking #2) | Handlebars advisory'nin hangi chain'den geldiği belirsizdi | Belgelendi — iki ayrı path (bölüm 2.3) |

Başka reporter/test/documentation bug'ı bulunmadı.

---

## 14. Bilinen Sınırlamalar

1. Görsel stilleme (CSS/JS) 10 harici CDN kaynağına bağımlı — internet
   olmadan ham içerik okunabilir ama tam stil yüklenmez (bkz. bölüm 10).
2. `newman-reporter-htmlextra` son yayını 2024-03-19 — aktif geliştirme
   yavaş, ama deprecated değil ve hâlâ de facto community standardı.
3. CI artifact stratejisi (raporların CI'da nasıl saklanacağı/
   yayınlanacağı) bu paketin kapsamı dışında, gelecekteki bir CI
   paketine bırakıldı.
4. `newman-reporter-htmlextra`'nın kendi transitive zincirinde 1 yeni
   moderate audit bulgusu var (`@budibase/handlebars-helpers` via
   `uuid`) — dev-only, runtime uygulamaya etkisi yok, blocker değil
   (bkz. bölüm 2).
5. **Windows reset yolu yalnızca kod seviyesinde doğrulandı** — bu
   execution ortamı Linux olduğu için `npm.cmd` branch'i gerçek bir
   Windows makinesinde literal olarak çalıştırılarak test edilmedi
   (bkz. bölüm 10). Linux branch'i 4 ayrı gerçek execution ile
   doğrulandı.

---

## 15. Sonuç

**PASS.** Gerçek HTML reporter (`newman-reporter-htmlextra` 1.23.1)
5 mevcut Newman suite'ine entegre edildi; tüm 5 suite raporu dört ayrı
temiz-reset execution'da (ilk turda 2, fix round'da 2) PASS (toplam
123/123 request, 258/258 assertion, exit code 0 her seferinde);
controlled-failure proof iki turda da non-zero exit code (1) ve HTML'de
görünür hata render'ı kanıtladı; Codex delta review'inde 1 gerçek
runner bug'ı (Windows npm.cmd resolution) ve 2 non-blocking bulgu
(request-body redaction sıkılaştırması, handlebars advisory belgeleme)
tespit edildi ve bu fix round'da düzeltildi/belgelendi; düzeltme
sonrası değer-bazlı taramada hiçbir raporda gerçek token/secret/
sentetik password bulunmadı; mevcut test semantiği hiçbir turda
değişmedi; dependency riski kabul edilebilir (0 yeni critical/high);
üretilen raporlar `.gitignore` ile default olarak takip dışı; Windows
portability code-level doğrulandı, execution-level Linux'ta doğrulandı
(bkz. bölüm 10, dürüstlük notu).
