# QA Demo System — API Tests

**Phase: PHASE 5 — API TESTING**
**Doküman Statüsü: P5.7 — API → DB Validation**

> Bu klasör, Phase 5'in Postman/Newman/AJV tabanlı API test
> katmanının giriş noktasıdır. P5.0'da yalnızca bu README (kapsam/
> kontrat kararları) oluşturulmuştu. P5.1'de gerçek bir Postman
> collection, local environment ve Newman CLI dependency'si kuruldu.
> P5.2'de PUBLIC endpoint response'larına gerçek AJV/JSON Schema
> validation ve Content-Type header assertion'ı eklendi. P5.3'te
> gerçek protected REST API yüzeyinde authentication matrix, ownership
> isolation ve cross-user access testleri eklendi. P5.4'te Products
> API'si (list/detail, in-stock/out-of-stock, negative matrix,
> data-quality) kapsamlı şekilde doğrulandı. P5.5'te `POST
> /api/orders`'ın business-rule seviyesi (duplicate line aggregation,
> stock sufficient/insufficient, quantity/product/items strict
> validation, approved/declined/timeout payment outcomes,
> payment_token contract'ı, malformed JSON, minimal auth regression)
> ayrı bir business collection ile doğrulandı — 2 ayrı temiz-reset
> execution'da birebir aynı sonuç (repeatability kanıtlandı).
> **P5.6'da `GET /api/notifications`'ın business-rule seviyesi (PAID
> order → tam olarak bir korelasyonlu notification, user isolation/
> cross-user leakage, declined/timeout → notification ÜRETİLMEMESİ,
> birden fazla PAID order için duplicate/merge olmayan davranış,
> response contract'ı gerçek AJV şema doğrulamasıyla) ayrı bir
> business collection ile doğrulandı** — kaynak kod inventory'si
> yalnızca TEK bir gerçek endpoint (`GET /api/notifications`) ortaya
> koydu; mark-as-read ve notification detail/id endpoint'leri kaynak
> kodda yoktur, icat edilmedi (NOT IMPLEMENTED / OUT OF SCOPE); 2 ayrı
> temiz-reset execution'da birebir aynı sonuç (repeatability
> kanıtlandı). **P5.7'de, P5.1-P5.6'nın hiçbirinin açmadığı
> veritabanının kendisi — gerçek, read-only bir SQLite bağlantısıyla
> — açıldı.** Her senaryo gerçek bir API çağrısını gerçek DB satırıyla
> karşılaştırır: approved/declined/timeout payment'ın persistence
> contract'ı (declined/timeout'un aslında order/order_items satırı
> BIRAKTIĞI, yalnızca stock/notification/event'in atlandığı — kaynak
> koddan ve ampirik olarak doğrulandı), duplicate-line aggregation'ın
> DB satırı seviyesinde kanıtı, reddedilen isteklerin gerçek sıfır-yazma
> (zero-write) olduğu, notification API↔DB korelasyonu, ownership ve
> relational integrity. Newman/Postman kullanılmadı (SQL çalıştıramaz)
> — Node'un built-in `node:sqlite` + `fetch`'i dışında yeni dependency
> eklemeyen minimal bir script yazıldı. 2 ayrı temiz-reset execution'da
> (mutlak satır ID'leri dahil) birebir aynı sonuç. WebSocket delivery
> consistency ve HTML reporting **henüz yok** — aşağıda hâlâ "PLANNED"
> olarak işaretlidir.

---

## 1. API Test Sisteminin Amacı

`QA-DEMO-SYSTEM`'in Phase 4'te inşa edilmiş **gerçek, çalışan**
REST API'sini (7 endpoint + WebSocket auth), Postman/Newman/AJV ile
fonksiyonel, contract, authorization ve regression açısından
doğrulamak. Detaylı metodoloji ve kapsam kararı için bkz.
[`07-API-TESTING/README.md`](../../02-FULL-STACK-QA-HANDBOOK/07-API-TESTING/README.md).

---

## 2. Hangi API'leri Test Edecek

Gerçek kaynak koddan doğrulanmış 7 REST endpoint + 1 WebSocket:

- `GET /api/health` (public)
- `POST /api/auth/login` (public)
- `GET /api/products`, `GET /api/products/:id` (public)
- `POST /api/orders`, `GET /api/orders/:id` (protected)
- `GET /api/notifications` (protected)
- `WS /ws?token=` (ayrı token-tabanlı auth)

Tam envanter (method/path/body/params/status/business rule) için bkz.
`07-API-TESTING/README.md` — "API Inventory" bölümü.

---

## 3. Toolchain

| Araç | Rol | Durum |
|---|---|---|
| Postman (collection format) | Collection authoring (JSON, v2.1.0 schema) | **DONE (P5.1)** — `postman/collections/qa-demo-system-public.postman_collection.json` |
| Newman | CLI runner, reproducible execution | **DONE (P5.1)** — `newman@6.2.2` devDependency, `api-tests/package.json` |
| AJV | JSON Schema validation | **DONE (P5.2)** — `ajv@^8.20.0` devDependency, `api-tests/scripts/run-schema-validation.js` |
| JSON Schema | Response contract tanımı | **DONE (P5.2)** — `shared/schemas/{health,auth,products,common}/` (bkz. bölüm 7) |
| Auth/Authorization suite | Protected endpoint auth matrix + ownership | **DONE (P5.3)** — `postman/collections/qa-demo-system-protected.postman_collection.json` (bkz. bölüm 8) |
| Products comprehensive suite | List/detail positive, negative, boundary, data-quality | **DONE (P5.4)** — `qa-demo-system-public.postman_collection.json` "Products" klasörü (bkz. bölüm 9) |
| Orders & Payment business suite | Duplicate aggregation, stock, quantity/product/items validation, payment outcomes | **DONE (P5.5)** — `qa-demo-system-orders-payment.postman_collection.json` (bkz. bölüm 10) |
| Notifications suite | PAID correlation, user isolation, declined/timeout non-generation, duplicate regression | **DONE (P5.6)** — `qa-demo-system-notifications.postman_collection.json` (bkz. bölüm 11) |
| API → DB validation | node:sqlite (read-only) + fetch, API<->DB persistence/consistency/ownership/integrity | **DONE (P5.7)** — `api-tests/scripts/run-api-db-validation.js` (bkz. bölüm 12) |
| Newman HTML reporter | Execution raporu | **DONE (P5.8)** — `newman-reporter-htmlextra@^1.23.1` devDependency, `api-tests/scripts/generate-html-report.js` (bkz. bölüm 15) |

Postman **desktop uygulaması** kullanılmadı — collection ve
environment dosyaları doğrudan geçerli Postman v2.1.0 JSON formatında
elle authoring edildi ve Newman CLI ile çalıştırıldı (Postman GUI'siz,
CI/reproducible-friendly bir yaklaşım). `postman-collection` SDK
dependency'si eklenmedi — P5.1 kapsamında gerekmedi (minimum
dependency ilkesi).

**P5.2 AJV entegrasyon yöntemi — gerçek bir compatibility gate
sonucudur, varsayım değil** (bkz. bölüm 7 için tam detay): Postman/
Newman'ın pm.test() sandbox'ı `require('ajv')` çağrısını
reddetmiyor, ama orada çözümlenen modül bizim pinlediğimiz
`ajv@^8.20.0` **değil**, Newman'ın kendi iç bağımlılık zincirinden
(postman-runtime → postman-request → har-validator) gelen eski,
kontrolsüz `ajv@6.15.0` kopyasıdır — ve sandbox'ın gerçek `fs`/relative
`require` erişimi yok (yalnızca npm paket adıyla `require` çalışıyor).
Bu yüzden AJV validation, collection'ın pm.test() script'lerine
**gömülmedi**; bunun yerine Newman'ın Node API'si (`newman.run()`)
üzerinden gerçek bir Node.js wrapper script'inde
(`api-tests/scripts/run-schema-validation.js`) çalıştırılıyor — orada
`require('ajv')` gerçekten bizim pinlediğimiz sürümü çözümlüyor ve
`shared/schemas/**/*.schema.json` dosyaları doğrudan (fs/require ile,
gerçek Node context'inde) okunabiliyor; duplication/drift riski yok.

Bu araçlar `QA-COMPETENCY-MAP.md` bölüm 7–9'daki (Postman, AJV & JSON
Schema, Newman) EXPERIENCE statüsüyle uyumludur.

---

## 4. Public/Protected Endpoint Özeti

| Public | Protected |
|---|---|
| `GET /api/health` | `POST /api/orders` |
| `POST /api/auth/login` | `GET /api/orders/:id` |
| `GET /api/products` | `GET /api/notifications` |
| `GET /api/products/:id` | `WS /ws` (ayrı mekanizma) |

**REST protected endpoint'ler** (`POST /api/orders`, `GET /api/orders/:id`,
`GET /api/notifications`) `requireAuth` middleware'i
(`backend/src/middleware/requireAuth.js`) ile korunur —
`Authorization: Bearer <token>` header'ı zorunludur, `sessions`
tablosuna karşı doğrulanır.

**`WS /ws` de protected/authenticated'dır, ancak REST `requireAuth`
akışını kullanmaz** — token `?token=` query parametresi olarak
gönderilir ve `websocketServer.js`'in HTTP upgrade handshake'i
sırasında ayrı bir kontrolle aynı `sessions` tablosuna karşı
doğrulanır (Express middleware zinciri veya `requireAuth` fonksiyonu
devreye girmez). "Protected olmak" ile "aynı auth transport/middleware'i
kullanmak" aynı şey değildir — bu ikisi karıştırılmamalıdır.

Detaylı authorization matrix için bkz. `07-API-TESTING/README.md`.

---

## 5. Klasör Yapısı

### Mevcut (P5.8 sonunda)

```text
QA-DEMO-SYSTEM/api-tests/
├── README.md
├── package.json                                  (newman + ajv + newman-reporter-htmlextra devDependency;
│                                                    "api:test:postman", "api:test:postman:basic",
│                                                    "api:test:schema:negative-proof", "api:test:auth",
│                                                    "api:test:orders-payment", "api:test:orders-payment:basic",
│                                                    "api:test:notifications", "api:test:notifications:basic",
│                                                    "api:test:db", "api:report:public", "api:report:auth",
│                                                    "api:report:products", "api:report:orders",
│                                                    "api:report:notifications", "api:report:all" script'leri)
├── scripts/
│   ├── run-schema-validation.js                  (P5.2 — Newman Node API + AJV wrapper; P5.4'te
│   │                                                Products klasörünü de kapsayacak şekilde genişletildi)
│   ├── run-orders-schema-validation.js           (P5.5 fix round, Codex B4 — aynı Newman Node API + AJV
│   │                                                modeli, Orders & Payment collection'ına özel)
│   ├── run-notifications-schema-validation.js    (P5.6 — aynı Newman Node API + AJV modeli,
│   │                                                Notifications collection'ına özel)
│   ├── run-api-db-validation.js                  (P5.7 — Postman/Newman değil: built-in
│   │                                                node:sqlite (read-only) + fetch, API<->DB karşılaştırması)
│   ├── generate-html-report.js                   (P5.8 — YENİ, newman.run() Node API + htmlextra reporter
│   │                                                wrapper; 5 suite + "all" modu, bkz. bölüm 15)
│   └── schema-negative-proof.js                  (P5.2 fix — tracked/reproducible negative+positive proof;
│                                                    P5.4'te 1 yeni vaka eklendi, 18→19)
├── reports/                                       (P5.8 — YENİ, GİT'E COMMIT EDİLMEZ, .gitignore'da;
│                                                    `npm run api:report:*` ile üretilen HTML dosyaları
│                                                    burada oluşur, bkz. bölüm 15)
└── postman/
    ├── collections/
    │   ├── qa-demo-system-public.postman_collection.json          (P5.1: Health/Login + P5.4: "Products"
    │   │                                                            klasörü — 11 request)
    │   ├── qa-demo-system-protected.postman_collection.json       (P5.3 — 19 request: auth gate, token
    │   │                                                            bootstrap, auth matrix, ownership/cross-user)
    │   ├── qa-demo-system-orders-payment.postman_collection.json  (P5.5, fix round sonrası — 64 request:
    │   │                                                            duplicate aggregation gate, payment
    │   │                                                            outcomes (gerçek before/after stok
    │   │                                                            kanıtıyla), stock/quantity/product/items
    │   │                                                            validation (temsili state-integrity
    │   │                                                            kanıtıyla), payment token matrix (false/0
    │   │                                                            dahil), malformed JSON, auth regression)
    │   └── qa-demo-system-notifications.postman_collection.json   (P5.6 — 20 request: PAID order → tam
    │                                                                bir korelasyonlu notification gate,
    │                                                                list contract, user isolation/cross-user
    │                                                                leakage, declined/timeout → notification
    │                                                                üretilmemesi, duplicate/merge olmayan
    │                                                                davranış, minimal auth regression)
    └── environments/
        └── local.postman_environment.json                  (P5.1 — baseUrl)

shared/schemas/                                    (P5.2 — canonical, active)
├── common/
│   └── error-response.schema.json                (P5.5 fix round'da orders/error contract'ı, P5.6'da
│                                                    notifications 401 contract'ı için de yeniden kullanıldı)
├── health/
│   └── health-response.schema.json
├── auth/
│   └── login-response.schema.json
├── products/
│   ├── product-item.schema.json                  (reusable, $ref'lenir)
│   ├── products-list-response.schema.json
│   └── product-detail-response.schema.json
├── orders/                                        (P5.5 fix round, Codex B4)
│   └── order-create-response.schema.json
└── notifications/                                 (P5.6 — YENİ)
    ├── notification-item.schema.json              (reusable, $ref'lenir)
    └── notifications-list-response.schema.json
```

### Hâlâ Planlanan (sonraki paketlerde kademeli olarak oluşturulacak)

```text
QA-DEMO-SYSTEM/api-tests/
└── postman/
    └── data/           (yalnızca gerçekten data-driven/multi-iteration bir senaryo gerektiğinde
                         oluşturulacak; bkz. not aşağıda)
```

Newman HTML reporting artık PLANNED değil — P5.8'de
`scripts/generate-html-report.js` ile tamamlandı (bkz. bölüm 15).
API→DB validation da PLANNED değil — P5.7'de
`scripts/run-api-db-validation.js` ile tamamlandı (bkz. bölüm 12).

**Not (P5.5 schema kararı — fix round'da değişti):** P5.5 ilk uygulamada
P5.3'ün protected collection'ıyla aynı mimari kararı izleyip plain
`pm.test()` assertion'ları kullanmıştı (AJV/Node-wrapper yoktu). Codex
delta review (blocker B4) bu kararı geçersiz kıldı; fix round'da
`shared/schemas/orders/order-create-response.schema.json` oluşturuldu
ve P5.2'nin kanonik AJV/Node-wrapper modeli
(`scripts/run-orders-schema-validation.js`) yeniden kullanıldı. Hata
contract'ı için ayrı bir şema oluşturulmadı — mevcut
`shared/schemas/common/error-response.schema.json` yeniden kullanıldı
(gerekçe: bölüm 10). Bkz. bölüm 10 ve
`evidence/P5-API-TESTING/P5.5-ORDERS-PAYMENT/EXECUTION.md` bölüm 9.

**Schema'lar burada değil `shared/schemas/` altında** (bkz. bölüm 7 —
canonical karar, P5.2'de active hale geldi). Reports/evidence de
burada değil `QA-DEMO-SYSTEM/evidence/P5-API-TESTING/` altında (bkz.
bölüm 16 — Evidence Yaklaşımı). `scripts/` klasörü **P5.2'de oluşturuldu** — iki dosya:
`run-schema-validation.js` (AJV'nin pm.test() sandbox'ında güvenilir
çalışmaması nedeniyle gereken Newman Node API wrapper'ı, bkz. bölüm 3
ve 7 — compatibility gate sonucu) ve `schema-negative-proof.js`
(tracked/reproducible negative+positive proof runner — Codex P5.2
review'inin B2 bulgusuna karşılık eklendi, bkz. bölüm 7); "devasa" bir
script altyapısı değildir.

**`postman/data/`** hâlâ **oluşturulmadı** — P5.1'in tek deterministic
kullanıcısı ve P5.3'ün iki deterministic kullanıcısı (USER A/B) da
ayrı request body'lerine doğrudan yazıldı, iterasyon data dosyası
gerektirmedi. Gerçekten çoklu iterasyon/veri seti gerektiren bir
senaryo (ör. büyük bir credential fuzzing/negative matrix) ortaya
çıktığında, Newman'ın `-d <data-file>` mekanizmasıyla (bkz. bölüm 14)
değerlendirilecektir.

---

## 6. Test Execution Modeli

**Canonical model** (kullanıcı tarafından belirlenmiştir):

```text
Claude: implementasyon → self-review → test → smoke → review manifest → commit/push
Codex:  yalnızca paket/milestone sonunda DELTA independent review
Codex FAIL → Claude fix → Codex re-review (yalnızca fix delta)
Codex PASS → PR + merge
```

Codex, her küçük commit'te değil, yalnızca paket/milestone
kapanışlarında çağrılır (Phase 4'te P4.2–P4.6'da uygulanan pattern).

**Gerçek çalıştırma komutu (P5.2'de güncellendi):**

```bash
cd QA-DEMO-SYSTEM
npm run dev              # ayrı bir terminalde — sunucu ayakta kalmalı
npm run api:test:postman # workspace root'tan, veya:
cd api-tests && npm run api:test:postman
```

Bu komut artık (P5.2) `api-tests/scripts/run-schema-validation.js`'yi
çalıştırır — aynı collection/environment'ı Newman'ın Node API'siyle
çalıştırır, her response için hem P5.1'in status-code pm.test()
sonuçlarını hem de P5.2'nin AJV schema + Content-Type validation
sonuçlarını raporlar. **Saf collection-only** (schema/header katmanı
olmadan, yalnızca P5.1 pm.test() assertion'ları) çalıştırmak için:

```bash
npm run api:test:postman:basic
```

bu, doğrudan `newman run postman/collections/qa-demo-system-public.postman_collection.json
-e postman/environments/local.postman_environment.json` komutunu
çalıştırır.

P5.2'de gerçek sisteme karşı çalıştırıldı: **4/4 request PASS (status
code), 4/4 AJV schema + Content-Type validation PASS** (bkz.
`evidence/P5-API-TESTING/P5.2-AJV-SCHEMA/EXECUTION.md`). **P5.4'te**
aynı collection'ın "Products" klasörü genişletildikten sonra tekrar
çalıştırıldı: **11/11 request PASS, 26/26 assertion PASS, 11/11 AJV
schema + Content-Type validation PASS** (bkz.
`evidence/P5-API-TESTING/P5.4-PRODUCTS/EXECUTION.md`). P5.1'in kendi
execution kaydı da geçerliliğini korur (tarihsel):
`evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md`.

**Protected (auth/authorization) suite (P5.3'te eklendi):**

```bash
cd QA-DEMO-SYSTEM/api-tests
npm run api:test:auth
```

Bu, `newman run postman/collections/qa-demo-system-protected.postman_collection.json
-e postman/environments/local.postman_environment.json` komutunu
çalıştırır — token bootstrap dahil tamamen otomatik (manuel token
kopyalama yok). P5.3'te gerçek sisteme karşı çalıştırıldı: **19/19
request PASS, 42/42 assertion PASS** (bkz.
`evidence/P5-API-TESTING/P5.3-AUTH-AUTHORIZATION/EXECUTION.md`).

**Orders & Payment business suite (P5.5'te eklendi):**

```bash
cd QA-DEMO-SYSTEM
npm run db:seed           # her tam suite çalıştırmasından ÖNCE — stok
                           # mutasyonları nedeniyle reproducibility için zorunlu
npm run dev                # ayrı bir terminalde
cd api-tests && npm run api:test:orders-payment
```

Bu, `scripts/run-orders-schema-validation.js`'i çalıştırır (P5.2'nin
Newman Node API + AJV wrapper modeli, Orders & Payment collection'ına
özel — fix round, Codex B4); ham Newman CLI için
`npm run api:test:orders-payment:basic`. Token bootstrap dahil tamamen
otomatik. P5.5 fix round'da gerçek sisteme karşı **iki ayrı
temiz-reset execution** ile çalıştırıldı: her ikisinde de **64/64
request PASS, 118/118 assertion PASS, 6/6 AJV schema + Content-Type
validation PASS** — birebir aynı sonuç, repeatability kanıtlandı (bkz.
`evidence/P5-API-TESTING/P5.5-ORDERS-PAYMENT/EXECUTION.md`).

**Notifications suite (P5.6'da eklendi):**

```bash
cd QA-DEMO-SYSTEM
npm run db:seed           # her tam suite çalıştırmasından ÖNCE — order/
                           # notification state mutasyonları nedeniyle
                           # reproducibility için zorunlu
npm run dev                # ayrı bir terminalde
cd api-tests && npm run api:test:notifications
```

Bu, `scripts/run-notifications-schema-validation.js`'i çalıştırır
(aynı P5.2 Newman Node API + AJV wrapper modeli, Notifications
collection'ına özel); ham Newman CLI için
`npm run api:test:notifications:basic`. Token bootstrap (User A + User
B) dahil tamamen otomatik. P5.6'da gerçek sisteme karşı **iki ayrı
temiz-reset execution** ile çalıştırıldı: her ikisinde de **20/20
request PASS, 48/48 assertion PASS, 4/4 AJV schema + Content-Type
validation PASS** — birebir aynı sonuç, repeatability kanıtlandı (bkz.
`evidence/P5-API-TESTING/P5.6-NOTIFICATIONS/EXECUTION.md`).

**API → DB validation (P5.7'de eklendi):**

```bash
cd QA-DEMO-SYSTEM/backend
npm run db:seed           # her tam suite çalıştırmasından ÖNCE
npm run dev                # ayrı bir terminalde
cd ../api-tests && npm run api:test:db
```

Bu, `scripts/run-api-db-validation.js`'i çalıştırır — Postman/Newman
**değil**, Node'un built-in `node:sqlite` (read-only) + `fetch`'i
kullanan, yeni dependency eklemeyen bir script. Her senaryo gerçek bir
API çağrısını gerçek SQLite satırıyla karşılaştırır — zero-write
kontrolleri content-level `fullSnapshot` (yalnızca count/identity
değil; `orders`/`order_items`/`notifications`/`events`'in tüm
satırları — `notifications.message` ve `events.payload` gibi
mutation-sensitive içerik alanları dahil — + 4 ürünün tamamının
stoğu) ile yapılır; approved order senaryosu ayrıca gerçek
`GET /api/products/:id` çağrısıyla API↔DB stok tutarlılığını
cross-layer kanıtlar; relational integrity DECLARED-IN-DDL (yapısal)
ve OBSERVED-DATA-INTEGRITY (gerçek satır sorgusu) olarak ayrı ayrı
raporlanır. P5.7'de, iki Codex delta review fix round'u dahil, gerçek
sisteme karşı **iki ayrı temiz-reset execution** ile çalıştırıldı: her
ikisinde de **17/17 senaryo PASS, 97/97 assertion PASS, 0 failure** —
`INTEGER PRIMARY KEY AUTOINCREMENT` satır ID'leri VE iş-mantığı
alanları (durum, miktar, fiyat, stok, mesaj metni) run'lar arası
birebir aynı; yalnızca `events.event_id` (`crypto.randomUUID()`,
AUTOINCREMENT değil) ve `created_at` zaman damgaları — tasarım gereği
— run'lar arası farklı. Bu, "tüm DB byte-for-byte aynı" gibi mutlak
bir iddia değildir; zero-write assertion'ının kendisi her run'ın
**kendi içindeki** before/after karşılaştırmasına dayanır, bu da her
iki run'da da bağımsız olarak PASS oldu (repeatability kanıtlandı,
bkz. `evidence/P5-API-TESTING/P5.7-API-DB-VALIDATION/EXECUTION.md`
bölüm 8).

**HTML rapor üretimi (P5.8'de eklendi):** yukarıdaki `api:test:*`
komutları yalnızca CLI/console çıktısı üretir. Tarayıcıda açılabilir bir
HTML raporu için `npm run api:report:<suite>` komutları kullanılır —
tam komut listesi, çıktı konumu, reset gereksinimleri ve secret-masking
detayları için bkz. bölüm 15.

---

## 7. Schema Validation Standardı

**Canonical schema path: `shared/schemas/`** — `ARCHITECTURE.md`
bölüm 14'te P4.0'da bu amaç için reserve edilmişti. `api-tests/`
altında **duplicate bir schema klasörü oluşturulmadı**. **P5.2'de
active hale getirildi** — `.gitkeep` kaldırıldı, 6 gerçek
`.schema.json` dosyası eklendi:

| Dosya | Kapsadığı Response | Not |
|---|---|---|
| `common/error-response.schema.json` | Tüm `{error:string}` hata response'ları | Reusable — auth 400/401 ve products 404'te ampirik doğrulandı |
| `health/health-response.schema.json` | `GET /api/health` 200 | `status` alanı `const:"ok"` — kaynak kod tek, koşulsuz literal üretir (Codex fix) |
| `auth/login-response.schema.json` | `POST /api/auth/login` 200 | `token` alanı `minLength:1` — boş string kabul edilmez (Codex fix B1) |
| `products/product-item.schema.json` | Tek ürün nesnesi | Reusable, `$ref` ile list/detail'e bağlanır |
| `products/products-list-response.schema.json` | `GET /api/products` 200 | `product-item`'a `$ref` |
| `products/product-detail-response.schema.json` | `GET /api/products/:id` 200 | `product-item`'a `$ref` |
| `orders/order-create-response.schema.json` | `POST /api/orders` 201 | P5.5 fix round (Codex B4) — `status` alanı `enum:[PAID,PAYMENT_FAILED,PAYMENT_TIMEOUT]`; hata response'ları için ayrı şema yok, `common/error-response.schema.json` yeniden kullanılıyor (kaynak koddan doğrulandı, contract aynı) |
| `notifications/notification-item.schema.json` | Tek notification nesnesi | Reusable, `$ref` ile list'e bağlanır. `type` alanı `enum:["order.paid"]` (sistemde şu an tek üretilebilir değer, kaynak koddan doğrulandı). `is_read` `type:integer, enum:[0,1]` — gerçek çalıştırmada `0`/`1` döner, boolean DEĞİL (ampirik doğrulandı) |
| `notifications/notifications-list-response.schema.json` | `GET /api/notifications` 200 | `notification-item`'a `$ref`; boş dizi geçerlidir. Hata response'ları için ayrı şema yok, `common/error-response.schema.json` yeniden kullanılıyor (401, kaynak koddan doğrulandı) |

Tüm şemalar gerçek kaynak koddan (`services/*.js`) ve gerçek
`curl`/Newman execution'larından doğrulandı — tahmin edilmedi. Her
dosyanın kendi `description` alanında kaynağı belgelenmiştir.

AJV kuralları (null yasak, strict type, `additionalProperties: false`,
açık `required`, enum, nested validation) için bkz.
`07-API-TESTING/README.md` — "Schema Governance" bölümü. Bu paket
kapsamında `additionalProperties: false` **tüm** şemalarda kullanıldı
— gerçek response'ların hiçbirinde dinamik/genişletilebilir bir map
alanı gözlemlenmedi (istisna yok).

### AJV Entegrasyon Yöntemi — Compatibility Gate Sonucu

Şemaları toplu yazmadan önce, Postman/Newman'ın script sandbox'ında
AJV'nin gerçekten nasıl çalıştığı **4 ayrı gerçek Newman execution**
ile test edildi (varsayım yapılmadı):

1. `require('ajv')` pm.test() içinde **hata vermiyor** — ama
   çözümlenen modül, bizim `api-tests/package.json`'a eklediğimiz
   `ajv@^8.20.0` **değil**; Newman'ın kendi iç bağımlılık zincirinden
   (`newman → postman-runtime → postman-request → har-validator →
   ajv@6.15.0`) gelen, bizim kontrolümüz dışındaki eski bir kopya.
   Kanıt: hem 8.20.0 hem 6.15.0 diskte kuruluyken (`npm ls ajv --all`
   ile doğrulandı), sandbox'taki AJV hata objeleri hâlâ v6'nın
   `dataPath` alanını üretiyor (v8'de bu alan `instancePath`'tir).
2. `require('ajv/package.json')` ve `require('<relative-path>.json')`
   → **"Cannot find module"** ile başarısız oluyor — yalnızca bare npm
   paket adıyla `require` çalışıyor, dosya yolu resolution'ı yok.
3. `require('fs')` sandbox'ta bir obje döndürüyor ama
   `readFileSync` **fonksiyon değil** (`"readFileSync is not a
   function"`) — gerçek dosya sistemi erişimi yok. `process` global'i
   de tanımsız.

**Sonuç:** Sandbox içinde AJV'yi doğrudan `pm.test()` script'ine
gömmek, hem hangi AJV sürümünün çalıştığını kontrol edemememize hem de
`shared/schemas/` dosyalarını runtime'da okuyamamamıza (relative
require/fs yok) yol açıyor — bu da "canonical schema, tek source of
truth" ilkesini garanti edilemez kılıyor. Bu yüzden AJV validation,
collection'ın pm.test() script'lerine **eklenmedi**; bunun yerine
`api-tests/scripts/run-schema-validation.js` — Newman'ın Node API'sini
(`newman.run(...)`, `'request'` event'i) kullanan, gerçek bir Node.js
script'i — yazıldı. Bu script gerçek Node module resolution'ında
çalıştığı için `require('ajv')` güvenilir şekilde bizim pinlediğimiz
`ajv@8.20.0`'ı çözümlüyor, ve `shared/schemas/**/*.schema.json`
dosyalarını doğrudan `require()` ile (gerçek dosya yolu, gerçek fs)
okuyor — duplication/drift riski yok, tek source of truth korunuyor.
Bu, "en sade, çalışan, reproducible, gerçek AJV kullanan" entegrasyon
yöntemidir; ayrı bir framework kurulmadı (tek dosya, ~140 satır).

AJV instance'ı `{ strict: true, allErrors: true }` ile oluşturuldu;
`removeAdditional`, `coerceTypes`, `useDefaults` **bilinçli olarak
set edilmedi** — validator yalnızca gözlemler, test edilen response'u
asla değiştirmez.

### Negative/Positive Proof (Validator'ın Gerçekten Doğru Karar Verdiğinin Kanıtı)

Uygulama kodu veya production response'u değiştirilmeden, aynı
şemalar + aynı pinlenmiş AJV sürümüyle, **tracked ve reproducible** bir
proof script'inde (`api-tests/scripts/schema-negative-proof.js`, `npm
run api:test:schema:negative-proof`) kasıtlı olarak bozuk (ve bazı
geçerli) payload'lar test edildi. P5.2'de **18/18** ile kapandı (bkz.
`evidence/P5-API-TESTING/P5.2-AJV-SCHEMA/EXECUTION.md` — tarihsel
kayıt, değiştirilmedi); **P5.4'te bir vaka daha eklendi**
(`PRODUCTS: missing required (name)` — önceden PRODUCTS kategorisinde
eksik olan tek gerçek kapsam boşluğu) ve script artık
**19/19 proof beklenen şekilde sonuçlanıyor** (bkz.
`evidence/P5-API-TESTING/P5.4-PRODUCTS/EXECUTION.md`): eksik `required`
alan, yanlış `type`, `null`, boş string (`token: ""`), ve beklenmeyen
`additionalProperties` — her kategori (HEALTH 5, AUTH 5, PRODUCTS 6,
ERROR 3) için AJV tarafından doğru şekilde kabul/reddedildi. Script
kayıtlı vaka sayısını kendi çıktısında yazdırır (`CASES.length`) —
evidence'teki sayı ile script çıktısı arasında fark olamaz.

---

## 8. Authentication & Authorization Test Standardı (P5.3)

**Kapsam:** `requireAuth` middleware'inin koruduğu 3 REST endpoint
(`POST /api/orders`, `GET /api/orders/:id`, `GET /api/notifications`)
üzerinde authentication matrix, ownership isolation ve cross-user
access testleri. **Business/functional senaryolar (order creation
kuralları, stock, payment kombinasyonları, notification business
akışı) bu paketin kapsamı dışındadır** — sırasıyla P5.5/P5.6'nın işi.

**Collection:** `postman/collections/qa-demo-system-protected.postman_collection.json`
(19 request, 5 klasör):

| Klasör | İçerik |
|---|---|
| 0. Authentication Gate | Token'sız `GET /api/orders/:id` → `401` (ilk uygulanan, tek başına doğrulanan adım) |
| 1. Token Bootstrap | `POST /api/auth/login` ile USER A ve USER B (`shared/test-data/auth-users.json`) — token/`user.id` collection variable'a yazılır |
| 2. Authentication Matrix | `GET /api/notifications` üzerinde: token yok, boş `Authorization`, yanlış scheme (`Basic`), malformed `Bearer` (token yok), bilinmeyen/random token, valid token |
| 3. Orders — Ownership & Cross-User | Order oluşturma (USER A) + owner erişimi + cross-user erişimi (USER B, `404`) + token yok/geçersiz + bilinmeyen order (`404`) |
| 4. Notifications — Ownership & Cross-User | USER A kendi `order_id`'sini görür + USER B'nin listesinde USER A'nın `order_id`'si **asla** yok (data-state-independent leakage kontrolü, bkz. P5.0 B2 kararı) + token yok/geçersiz |

**Authentication Matrix — gerçek kaynak koddan (`requireAuth.js`)
doğrulanan iki farklı hata sınıfı:**

| Senaryo | Status | Error body |
|---|---|---|
| Header yok / boş / yanlış scheme (`Basic ...`) / `Bearer` (token'sız) | `401` | `{"error":"Yetkilendirme gerekli"}` |
| `Bearer <bilinmeyen/geçersiz token>` (`sessions` tablosunda yok) | `401` | `{"error":"Geçersiz veya süresi dolmuş oturum"}` |
| Valid `Bearer <token>` | `200`/`201` | — |

Bu iki mesaj **kasıtlı olarak farklı** kod yollarından geliyor
(`requireAuth.js` — scheme/token format kontrolü vs. `sessions`
tablosu lookup) ve testler bu ikisini ayrı ayrı doğruluyor — tek bir
genel "401" assertion'ına indirgenmedi.

**Ownership/Cross-user assertion kalitesi:** Yalnızca status code
kontrolü değil, gerçek response body üzerinden doğrulama yapılıyor:
- Orders: `GET /api/orders/:id` — owner için `order.id` eşleşmesi,
  cross-user için `404` + `"Sipariş bulunamadı"` (kaynak:
  `orders.service.js` — `WHERE id = ? AND user_id = ?`, IDOR-bilinçli,
  `403` değil).
- Notifications: **"boş liste" değil, data-state-independent
  assertion** — USER A'nın gerçek `order_id`'si USER B'nin
  notification listesinde **hiçbir zaman** yok; USER A'nın kendi
  listesinde bu `order_id` **var**. Bu, P5.0'da Codex B2 review'inin
  düzelttiği aynı prensibin (`07-API-TESTING/README.md` Authorization
  Matrix) test-seviyesinde uygulanmasıdır.

**Token bootstrap:** Manuel token kopyalama **yok** — `Login as User
A/B` request'lerinin `pm.test()` script'i, response'tan `token` ve
`user.id`'yi `pm.collectionVariables.set(...)` ile runtime'a yazar;
sonraki request'ler `{{userAToken}}`/`{{userBToken}}` kullanır. Bu
değerler **hiçbir dosyaya commit edilmez** — yalnızca Newman'ın
in-memory run instance'ında yaşar (koleksiyon/environment JSON
dosyaları değişmez, evidence'te maskelenir).

**Error contract:** Ayrı bir yeni schema dosyası oluşturulmadı —
`common/error-response.schema.json` zaten `{error:string}` contract'ını
kapsıyor (P5.2'de auth 400/401 ve products 404'e karşı doğrulanmıştı).
P5.3'te bu aynı contract, sandbox-safe plain `pm.test()` assertion'larıyla
(`Object.keys(json)).to.eql(['error'])`, `error` alanının tam beklenen
string değeriyle eşleşmesi) doğrulandı — AJV/Node wrapper'a gerek
kalmadı (yeni bir "schema fabrikası" kurulmadı).

**WebSocket (`/ws`) bu pakete dahil DEĞİL** — P5.0'ın canonical kararı
(`07-API-TESTING/README.md` "Kapsam Dışı": "GraphQL/WebSocket
derinlemesine event testleri → Phase 6") gereği WS auth/event testleri
Phase 6'nın kapsamıdır; REST protected collection'a `/ws` request'i
eklenmedi.

**Runner:** `npm run api:test:auth` (→ `newman run
postman/collections/qa-demo-system-protected.postman_collection.json
-e postman/environments/local.postman_environment.json`) —
bootstrap dahil, tamamen otomatik, reproducible. P5.3'te gerçek
sisteme karşı çalıştırıldı: **19/19 request PASS, 42/42 assertion
PASS** (bkz. `evidence/P5-API-TESTING/P5.3-AUTH-AUTHORIZATION/EXECUTION.md`).

---

## 9. Products API Test Standardı (P5.4)

**Kapsam:** `GET /api/products` (list) ve `GET /api/products/:id`
(detail) — **yalnızca** response contract (functional/positive/negative/
boundary/data-quality). **Business/functional senaryolar bu paketin
kapsamı dışındadır** — Orders'ın Products'ı nasıl kullandığı (stok
düşüşü, aggregate/duplicate satır davranışı) P5.5'in işidir.

**Collection:** Ayrı bir dosya oluşturulmadı — mevcut
`postman/collections/qa-demo-system-public.postman_collection.json`'a
(P5.1) yeni bir **"Products"** klasörü eklendi (bkz. bölüm 5). Karar:
"gereksiz ikinci runner yaratma" ilkesi gereği, mevcut
`api:test:postman`/`api:test:postman:basic` script'leri zaten bu
collection'ı çalıştırıyor — ayrı bir `api:test:products` script'i
**oluşturulmadı**.

| Request | Amaç |
|---|---|
| List | Positive: en az 4 seed ürün, public access (Authorization header yok), stock/in_stock tutarlılığı (tüm ürünler), duplicate id / boş isim / negatif stok yok |
| Detail - In Stock | id=1 (`stock_quantity=25`) — id eşleşmesi, `in_stock===true`, **List → Detail consistency** (derin eşitlik) |
| Detail - Out of Stock | id=2 (`stock_quantity=0`) — `in_stock===false` |
| Unknown Product | id=9999 (sözdizimsel geçerli, seed'de yok) → `404` |
| Invalid ID (5 vaka) | non-numeric, zero, negative, decimal, very-large → hepsi `404`, **hiçbiri `500` değil** |

**İlk uygulanan adım (gate):** Deterministic test data (`shared/test-data/products.json`)
ve gerçek kaynak kod (`products.service.js`) önce doğrulandı (id=1
in-stock, id=2 out-of-stock), sonra `GET /api/products/2`'nin gerçek
`in_stock:false` döndürdüğü `curl` ile kanıtlandı — bu gate PASS
olmadan collection'ın geri kalanına geçilmedi.

**Path parameter davranışı — ampirik keşif, tahmin edilmedi:**
Negative matrix yazmadan önce 7 farklı girdi (`abc`, `0`, `-1`, `1.5`,
çok büyük sayı, safe-integer üstü, encoded whitespace) gerçek server'a
karşı `curl` ile test edildi — **hepsi güvenli şekilde `404` döndü,
hiçbiri `500` üretmedi** (`Number(req.params.id)` coercion + SQLite
parametreli sorgu). Representative bir alt küme (5 vaka) collection'a
eklendi (bkz. `evidence/P5-API-TESTING/P5.4-PRODUCTS/EXECUTION.md`
bölüm 2).

**List → Detail consistency:** `List` request'i id=1'in list-response
kaydını bir collection variable'a yazar; `Detail - In Stock` request'i
bunu detail-response ile derin eşitlik (`pm.expect(...).to.eql(...)`)
üzerinden karşılaştırır — iki farklı endpoint'in aynı alttaki satırı
tutarlı şekilde döndürdüğünü kanıtlar.

**Data-quality kuralı (business rule, kaynak koddan doğrulandı):**
`stock_quantity > 0 ⟺ in_stock === true` — `List` request'inin test
script'i bunu **listedeki her ürün için** (yalnızca tek bir örnek
değil) doğrular.

**Schema/AJV reuse:** P5.2'nin `shared/schemas/products/` şemaları
(`product-item`, `products-list-response`, `product-detail-response`)
**aynen yeniden kullanıldı** — yeni bir schema source of truth
kurulmadı. `product-item.schema.json`'ın `stock_quantity: {type:
"integer", minimum:0}` kuralı stok=0'ı zaten doğru kabul ettiği için
schema düzeltmesi **gerekmedi**. `api-tests/scripts/run-schema-validation.js`
(P5.2), Products'ın 9 request'ini de (List, Detail ×2, Unknown Product,
Invalid ID ×5 — son 6'sı `common/error-response.schema.json`'a karşı)
kapsayacak şekilde genişletildi; bu genişletme sırasında iki request
adı değişti (`GET /api/products` → `List`,
`GET /api/products/:id (deterministic existing product)` → `Detail -
In Stock (deterministic existing product)`) ve wrapper'daki
`REQUEST_CHECKS` anahtarları buna göre güncellendi.

**Negative proof genişletmesi:** P5.2'nin tracked
`schema-negative-proof.js`'ine tek bir yeni vaka eklendi —
`PRODUCTS: missing required (name)` (önceden bu kategoride eksik olan
gerçek kapsam boşluğu). Script artık **19/19 PROOF-OK** raporluyor
(HEALTH 5, AUTH 5, PRODUCTS 6, ERROR 3); P5.2'nin kendi evidence'i
("18/18") tarihsel kayıt olarak değiştirilmedi.

**Bulunan bug:** **Yok.** Ne application (hiçbir invalid ID `500`
üretmedi) ne de test/schema seviyesinde (mevcut şemalar gerçek
response'larla birebir uyumlu çıktı) bir hata bulunmadı.

**Runner:** Ayrı bir script yok — `npm run api:test:postman`
(schema+header dahil) veya `npm run api:test:postman:basic` (yalnızca
status-code). P5.4'te gerçek sisteme karşı çalıştırıldı: **11/11
request PASS, 26/26 assertion PASS, 11/11 AJV schema + Content-Type
validation PASS** (bkz.
`evidence/P5-API-TESTING/P5.4-PRODUCTS/EXECUTION.md`).

---

## 10. Orders & Payment Business API Test Standardı (P5.5)

**Kapsam:** `POST /api/orders`'ın **business-rule** seviyesi. **Business
feature testi kapsamı dışındadır** — Notifications'ın business akışı
P5.6'nın işi; API→DB doğrudan SQL doğrulaması P5.7'nin işi.

> **Fix round notu (Codex delta review, head commit `9cac4cc`, FAIL/4
> blocker + 1 non-blocking):** Bu bölüm, delta review sonrası yapılan
> düzeltmeleri yansıtır. Değişenler: gerçek before/after stok kanıtları
> (B1/B2), `payment_token: false`/`0` matris vakaları (B3), AJV/Node-
> wrapper şema doğrulaması (B4), kullanılmayan User B bootstrap'ının
> kaldırılması (non-blocking). Eski (40 request/82 assertion, AJV-yok)
> hâli **geçersizdir**. Tam detay:
> `evidence/P5-API-TESTING/P5.5-ORDERS-PAYMENT/EXECUTION.md` bölüm 0.

**Collection:** Ayrı bir dosya —
`postman/collections/qa-demo-system-orders-payment.postman_collection.json`
(fix round sonrası **64 request, 10 klasör**). Karar (P5.5'e özgü):
P5.3'ün protected collection'ına eklenmedi — P5.3 "Authentication &
Authorization"a özel kapsamlı, kapanmış (CLEAN) bir paket; P5.5 tamamen
farklı, çok daha geniş bir concern'dir (business rules). P5.4'ün
"Products, mevcut public collection'a katıl" kararının tersine, burada
ayrı dosya tercih edildi.

| Klasör | İçerik |
|---|---|
| 0. Bootstrap | Login User A (User B bootstrap'ı fix round'da kaldırıldı — hiçbir assertion tarafından kullanılmıyordu, bkz. bölüm 8 evidence) |
| 1. Duplicate Aggregation Gate | **İlk uygulanan adım.** P4.2 B1 regresyon testi — id=1, qty 2+3 aynı product_id'de → tek satırda quantity=5, stok 25→20 (gerçek before/after GET ile) |
| 2. Payment Outcomes | Approved (PAID, stok gerçek before/after GET ile azalır — B1), Declined (PAYMENT_FAILED, **201**, stok gerçek before/after GET ile değişmez), Timeout (PAYMENT_TIMEOUT, **201**, aynı şekilde) |
| 3. Stock Validation | Insufficient stock (409, tek satır) ve duplicate-aggregate stoğu aşıyor (409, iki satır toplamı) — ikisi de artık gerçek before/after GET ile "stok değişmedi" kanıtlıyor (B2) |
| 4. Quantity Validation | 0, -1, 1.5, `"2"`, `true`, `[2]`, `null`, missing, çok büyük (9 vaka — P4.2 B3 regresyon testi); `"2"`/`true`/`[2]`/`null` artık ayrıca before/after stok kanıtı taşıyor (B2, regresyon riski temsili) |
| 5. Product Validation | unknown id (**400**, `GET /products/:id`'in 404'ünden farklı), wrong type, null, missing + YENİ: mixed valid+invalid product testi — geçerli satırın stoğu değişmiyor, API-visible (before/after GET, B2; DB-seviyesi "partial write yok" iddiası P5.7'ye bırakıldı, bkz. evidence bölüm 12) |
| 6. Items Validation | items missing/null/empty/wrong-type, geçersiz item objesi |
| 7. Payment Token Validation | omitted (default, artık before/after GET ile stok azalması kanıtlı), null, empty string, wrong type (number), **`false`, `0`** (YENİ — B3, ikisi de before/after GET ile "sessizce default'a düşmüyor" kanıtlı), unknown string |
| 8. Malformed JSON | Bozuk JSON gövdesi → 400, 500 değil (P4.2 non-blocking #5 regresyon testi) |
| 9. Auth Regression | `POST /api/orders`'a özgü minimal no-token/invalid-token gate (P5.3 GET endpoint'lerini test etmişti, bu request şeklini etmemişti) |

**İlk uygulanan adım (gate):** Yalnızca `0. Bootstrap` + `1. Duplicate
Aggregation Gate` klasörleri izole çalıştırıldı (`--folder` bayrağıyla)
ve PASS aldıktan sonra suite'in geri kalanına geçildi. Gate, P4.2'nin
Codex-bulduğu blocker B1'in (aynı product'ın iki satırda gönderilip
stok kontrolünü atlatması) regresyon testidir; gerçek response body
üzerinden (`order.items.length===1`, `items[0].quantity===5`, stok
25→20) kanıtlandı — yalnızca status code'a güvenilmedi.

**Kritik, tahmin edilmeyen bulgular (kaynak koddan doğrulandı):**
- **Declined/timeout `201` döner, hata değil** — `orders.service.js`
  payment sonucunu her zaman `201` + `order.status` alanına yazar
  (`PAID`/`PAYMENT_FAILED`/`PAYMENT_TIMEOUT`); "başarısız ödeme = HTTP
  hata kodu" varsayımı **yanlıştır**.
- **Unknown `product_id` → `400`, `404` değil** — `GET /api/products/:id`
  ile `POST /api/orders`'ın aynı "ürün yok" durumu için **farklı**
  status kod contract'ı var; ikisi karıştırılmamalı.
- **Çok büyük `quantity` → `409` (stok hatası), `400` (format hatası)
  değil** — `isPositiveInteger()`'ın üst sınırı yok; format-geçerli
  ama gerçekçi olmayan bir değer format aşamasını geçip stok
  aşamasında reddedilir.
- **`payment_token: false`/`0` → `400`, sessiz default değil** (B3
  regresyon doğrulaması) — `resolvePaymentToken()` yalnızca gerçek
  `undefined` için default alır; `typeof paymentToken !== 'string'`
  kontrolü `false`/`0`'ı da `null`/`""`/sayı gibi açıkça reddeder.

**Test state reset:** Her tam suite çalıştırmasından önce mevcut,
canonical `npm run db:seed` komutu kullanıldı — yeni bir reset
mekanizması **oluşturulmadı**. **Repeatability iki ayrı temiz-reset
execution ile kanıtlandı** — ikisi de birebir aynı sonucu üretti
(64/64 request, 118/118 assertion, hem functional hem AJV katmanında),
bkz. evidence bölüm 3-4.

**Ownership/order-retrieval:** P5.3'ün protected collection'ında
zaten kapsanmıştır — burada **duplike edilmedi** (bkz. evidence bölüm 8).
Bu kararın önkoşulu olan User B bootstrap'ı, hiç kullanılmadığı için
fix round'da kaldırıldı.

**Schema kararı (fix round'da değişti — B4):** Codex delta review,
P5.3'ün "plain assertion, AJV yok" kararını P5.5 için geçersiz kıldı.
Artık P5.2'nin kanonik AJV/Node-wrapper modeli
(`scripts/run-orders-schema-validation.js`) kullanılıyor; yeni
`shared/schemas/orders/order-create-response.schema.json` oluşturuldu.
Hata contract'ı için ayrı bir şema **oluşturulmadı** — kaynak koddan
doğrulandı: tüm hata yolları (400/401/409) aynı `{error:string}`
şeklini kullanıyor, bu zaten `shared/schemas/common/error-response.schema.json`
ile birebir aynı; gereksiz duplicate şema yaratılmadı. Detay: evidence
bölüm 9.

**Header validation:** `Content-Type` CURRENT standardı, hem **2
temsili `pm.test()` request**inde (P5.3'ün aynı "temsili, tüm
request'lerde değil" yaklaşımı — gate'in başarılı `POST /api/orders`'ı
`201` ve Auth Regression'ın `no-token` request'i `401`) hem de fix
round'da eklenen **AJV wrapper'ın 6 request'inde bağımsız olarak**
doğrulanıyor.

**Bulunan bug:** **Yok.** P4.2'nin geçmiş blocker'larından (B1
duplicate-line bypass, B3 quantity coercion, non-blocking #4 payment
token fallback, non-blocking #5 malformed JSON 500) hiçbiri regresyon
olarak geri gelmedi; Codex'in B1-B4 bulguları da test/evidence
eksiklikleriydi, application kodunda bir hata değildi.

**Runner:** `npm run api:test:orders-payment` (AJV/Node-wrapper —
functional + schema doğrulaması; ham Newman CLI için
`npm run api:test:orders-payment:basic`). Fix round'da gerçek sisteme
karşı **2 ayrı temiz-reset execution** ile çalıştırıldı: her ikisinde
de **64/64 request PASS, 118/118 assertion PASS, 6/6 AJV schema +
Content-Type validation PASS** (bkz.
`evidence/P5-API-TESTING/P5.5-ORDERS-PAYMENT/EXECUTION.md`).

---

## 11. Notifications API Test Standardı (P5.6)

**Kapsam:** `GET /api/notifications`'ın business-rule seviyesi. Kaynak
kod inventory'si (`routes/notifications.routes.js`,
`services/notifications.service.js`) sistemde **yalnızca tek bir
gerçek endpoint** ortaya koydu — mark-as-read ve notification detail/id
endpoint'i **yoktur**, icat edilmedi (bkz. evidence bölüm 8-9, NOT
IMPLEMENTED / OUT OF SCOPE). **API→DB validation ve WebSocket delivery
consistency bu paketin kapsamı dışındadır** — sırasıyla P5.7 ve future
dedicated coverage'ın işi.

**Collection:** Ayrı bir dosya —
`postman/collections/qa-demo-system-notifications.postman_collection.json`
(20 request, 8 klasör). P5.4/P5.5 ile aynı gerekçeyle ayrı dosya
tercih edildi (business-rule concern, mevcut collection'lara
eklenmedi).

| Klasör | İçerik |
|---|---|
| 0. Bootstrap | Login User A + User B — P5.6'da User B **gerçekten kullanılır** (P5.5'in aksine), cross-user isolation testleri için |
| 1. PAID Order -> Exactly One Correlated Notification (Gate) | **İlk uygulanan tek adım.** PAID order sonrası tam olarak 1, order_id ile korelasyonlu notification oluştuğu gerçek before/after `GET` ile (hardcoded değil) kanıtlanır |
| 2. Notification List — Positive / Contract | Valid token, 200, array contract, ek top-level alan yok |
| 3. User Isolation / Cross-user Leakage | User B kendi order'ı için notification görür; User A/User B birbirinin `order_id`'sini görmez (bkz. P5.3 overlap kararı, evidence bölüm 10) |
| 4. Declined Payment -> No Notification | Gerçek before/after GET: count/`order_id` set'i değişmez, declined order'a korelasyonlu notification yok |
| 5. Timeout Payment -> No Notification | Aynı desen, timeout order için |
| 6. Duplicate Notification Regression | İki ayrı PAID order → her biri için tam olarak 1, birbirinden bağımsız, farklı `id`'li notification (bkz. evidence bölüm 7 — DB `UNIQUE(order_id,type)` neden doğrudan test edilmedi) |
| 7. Auth Regression | `GET /api/notifications` için minimal no-token/invalid-token gate (P5.3'ün tam matrisini tekrarlamaz, bkz. evidence bölüm 10) |

**İlk uygulanan adım (gate):** Yalnızca `0. Bootstrap` + `1. PAID Order
-> Exactly One Correlated Notification (Gate)` klasörleri izole
çalıştırıldı ve PASS aldıktan sonra suite'in geri kalanına geçildi.

**Kritik, tahmin edilmeyen bulgular (kaynak koddan + ampirik doğrulandı):**
- **`is_read` gerçek çalıştırmada INTEGER `0` döner, boolean `false`
  DEĞİL** — schema.js'in `CHECK (is_read IN (0, 1))` kısıtına uygun.
  Şema ve assertion'lar buna göre yazıldı.
- **Response'da `user_id` alanı YOKTUR** — `listNotificationsForUser()`
  sorgusu onu seçmez; leakage riski yapısal olarak azalır.
- **`type` sistemde şu an yalnızca `"order.paid"` değerini alabilir** —
  tek call-site, tek event type. Şemada gerçek, doğrulanmış bir `enum`
  olarak yazıldı, varsayılmadı.
- **`notifications` tablosunda `UNIQUE(order_id, type)` DB constraint'i
  var ama normal REST akışında tetiklenemez** — her sipariş yeni bir
  `order_id` alır. P5.6, gerçekten REST-visible olan invariant'ı
  (birden fazla PAID order → hiçbiri birleşmez/kaybolmaz) kanıtlar;
  doğrudan constraint-violation testi P5.7'ye bırakıldı.

**Test state reset:** Her tam suite çalıştırmasından önce mevcut,
canonical `npm run db:seed` komutu kullanıldı — yeni bir reset
mekanizması **oluşturulmadı**. **Repeatability iki ayrı temiz-reset
execution ile kanıtlandı** — ikisi de birebir aynı sonucu üretti
(20/20 request, 48/48 assertion, 4/4 AJV doğrulaması), bkz. evidence
bölüm 3-4.

**P5.3 overlap kararı:** P5.3'ün protected collection'ı `GET
/api/notifications` için zaten bir ownership/cross-user leakage kanıtı
ve tam bir authentication matrix'i içeriyor. P5.6 bunu **tekrar
etmedi** — Auth Regression klasörü minimal (2 request) tutuldu, User
Isolation klasörü ise P5.6'nın kendi paketinin ürettiği notification'lar
üzerinde, kendi self-contained suite'i içinde aynı invariant'ı yeniden
doğrular (P5.3'e bağımlı olmadan). Detaylı gerekçe: evidence bölüm 10.

**Header validation:** `Content-Type` CURRENT standardı, 2 temsili
`pm.test()` request'inde (gate'in başarı yolu, Auth Regression'ın
no-token hata yolu) ve AJV wrapper'ın 4 request'inde bağımsız olarak
doğrulandı.

**Bulunan bug:** **Yok.** PAID order korelasyonu, user isolation,
declined/timeout non-generation, çoklu-order duplicate/merge olmayan
davranış — hepsi gerçek assertion'larla doğrulandı, sapma bulunmadı.

**Runner:** `npm run api:test:notifications` (AJV/Node-wrapper). P5.6'da
gerçek sisteme karşı **2 ayrı temiz-reset execution** ile çalıştırıldı:
her ikisinde de **20/20 request PASS, 48/48 assertion PASS, 4/4 AJV
schema + Content-Type validation PASS** (bkz.
`evidence/P5-API-TESTING/P5.6-NOTIFICATIONS/EXECUTION.md`).

---

## 12. API → DB Validation Standardı (P5.7)

**Kapsam:** P5.1–P5.6'nın hiçbiri veritabanının kendisini açmadı —
yalnızca HTTP response'un doğru göründüğünü kanıtladılar. P5.7 bu
boşluğu kapatır: her senaryo gerçek bir API çağrısı yapar, sonra
sunucunun **gerçekten yazdığı** SQLite dosyasına **read-only** bir
bağlantıdan doğrudan `SELECT` çalıştırır ve ikisini karşılaştırır.
Database redesign, yeni domain feature, ORM değişikliği, migration
sistemi, performance tuning **bu paketin kapsamı dışındadır**.

**Mimari:** Yeni bir dosya —
`api-tests/scripts/run-api-db-validation.js`. Postman/Newman
**kullanılmadı** (SQL çalıştıramaz — bkz. P5.2'nin compatibility-gate
bulgusu, aynı gerekçe) ve mevcut Postman collection'ları da
değiştirilmedi; bu, onlara **ek, dördüncü** bir doğrulama katmanıdır.
Script, Node'un built-in `node:sqlite` (`DatabaseSync`, sunucunun
kendi canonical bağlantı modülüyle aynı driver) ve built-in `fetch`'i
dışında **hiçbir yeni dependency eklemez**. DB bağlantısı
`{readOnly:true, open:true}` ile açılır — SQLite seviyesinde gerçek
bir yazma-engeli garantisi; script hiçbir zaman `INSERT`/`UPDATE`/
`DELETE` çalıştırmaz, tek reset mekanizması mevcut, canonical
`npm run db:seed`'dir (script dışından, elle).

**Kritik, tahmin edilmeyen bulgu (kaynak koddan + ampirik doğrulandı):**
**Declined/timeout bir "zero write" senaryosu DEĞİLDİR.**
`orders.service.js`'in `createOrder()`'ı, `order` ve `order_items`
satırlarını `if (status === 'PAID')` kontrolünden **önce**, koşulsuz
yazar — yalnızca stock decrement, event ve notification `PAID`'e
özeldir. P5.5/P5.6'nın API-seviyesinde zaten doğru olarak belirttiği
("declined → 201 döner, order oluşturulur") bu davranış, P5.7'de artık
**doğrudan SQL ile, DB satırı seviyesinde** de kanıtlanmıştır.

**Senaryolar (17 senaryo, 97 assertion — fix round sonrası gerçek
sayı, bkz. aşağıdaki not; RUN #1 ve RUN #2'de birebir aynı, AUTOINCREMENT
satır ID'leri dahil):**

| # | Senaryo | Kanıtladığı |
|---|---|---|
| S0 | Baseline determinism | Reset sonrası tüm tablolar deterministik (orders/order_items/notifications/events=0, stok seed değerleriyle birebir) |
| S1 | **GATE** — unknown product_id | Gerçek zero-write: `fullSnapshot` ile content-level kanıt — yalnızca count değil, tüm satırlar (message/payload dahil) + tüm ürün stokları |
| S2 | Approved order — tam API↔DB izi + **API↔DB stock consistency** | Order/order_items satırları API response'uyla birebir; duplicate-line aggregation (2+3=5) TEK satır olarak DB'de kanıtlanır; **gerçek `GET /api/products/:id` çağrısıyla** API stoğu DB stoğuyla cross-layer karşılaştırılır |
| S3 | Insufficient stock | Zero-write (content-level — message/payload dahil) |
| S4 | Invalid quantity (×3 temsili) | Zero-write (content-level — message/payload dahil) |
| S5 | Invalid payment_token (false, 0) | Zero-write (content-level — message/payload dahil) |
| S6 | Malformed JSON | Zero-write (content-level — message/payload dahil) |
| S7 | Declined payment | order/order_items YAZILIR, stock/notification/event YAZILMAZ |
| S8 | Timeout payment | Aynı contract |
| S9 | Notification API↔DB korelasyonu | GET response'undaki notification ile DB satırı alan alan eşleşir |
| S10 | Duplicate notification DB kontrolü | İki ayrı PAID order → iki ayrı, birleşmeyen notification satırı |
| S11 | Ownership DB kontrolü | order/notification `user_id`'si doğru kullanıcıya ait, çapraz atama yok |
| S12 | Relational integrity — **OBSERVED DATA INTEGRITY** | Gerçek satırlar üzerinde orphan sorgusu — `notifications.user_id` dahil |
| S13 | Constraint tanımları — **DECLARED IN DDL** | `CHECK`/`UNIQUE`/`REFERENCES`/`NOT NULL` tanımları gerçek DDL'de mevcut (yapısal inceleme; S12'den bilinçli olarak ayrı, tek bir "FK PASS" cümlesine birleştirilmedi) |

**Fix round #1 (Codex bağımsız delta review, FAIL/3 blocker + 1
non-blocking):** B1 — S2'ye gerçek API↔DB stok karşılaştırması
eklendi (önceden yalnızca DB okunuyordu). B2 — zero-write kontrolleri
count+tek-ürün'den identity-level `fullSnapshot`'a yükseltildi (S1,
S3, S4, S5, S6). B3 — `notifications.user_id` orphan kontrolü (S12)
ve DDL kontrolü (S13) eklendi; DECLARED-IN-DDL/OBSERVED-DATA-INTEGRITY
ayrımı başlıklarda ve yorumlarda açık hale getirildi. Non-blocking —
Run #1/#2 ID karşılaştırması evidence'ta somut değerlerle gösterildi.

**Fix round #2 (Codex kısa fix-delta re-review, FAIL/1 açık kalan
blocker [B2] + 2 non-blocking):** B2 (tamamlandı) — `fullSnapshot`
identity-level'dan content-level'a genişletildi:
`notifications.message` ve `events.payload` (+`created_at`)
mutation-sensitive alanları eklendi — bir satırın id'si/count'u aynı
kalırken içeriği sessizce değişmesi artık yakalanıyor (özellikle
malformed JSON senaryosunun kanıt gücü güçlendi). Non-blocking #1 —
Run #1/#2 wording'i, AUTOINCREMENT ID'lerin/iş alanlarının
deterministik eşitliği ile `events.event_id`/`created_at`'ın run'lar
arası **beklenen şekilde farklı** olması arasında artık net bir ayrım
yapıyor; "snapshot JSON birebir aynı" gibi mutlak ifadeler kaldırıldı.
Non-blocking #2 — 88→97 assertion artışının itemized açıklaması
yanlıştı (+5 DDL yerine gerçekte +12); senaryo senaryo yeniden
sayılarak düzeltildi. Detay: `evidence/.../EXECUTION.md` bölüm 0.

**Runner:** `npm run api:test:db`. P5.7'de, fix round dahil, gerçek
sisteme karşı **2 ayrı temiz-reset execution** ile çalıştırıldı: her
ikisinde de **17/17 senaryo PASS, 97/97 assertion PASS, 0 failure** —
`created_at` ve `events.event_id` (UUID, beklenen) hariç çıktı birebir
aynı (bkz.
`evidence/P5-API-TESTING/P5.7-API-DB-VALIDATION/EXECUTION.md`).

**Bulunan bug:** **Yok.** Approved/declined/timeout persistence,
duplicate aggregation, API↔DB stock consistency, notification correlation,
ownership, observed data integrity, declared constraint'ler — hepsi kaynak
kodun söylediğiyle birebir uyuştu.

**Bilinen sınırlamalar:** Constraint ihlali davranışsal olarak
tetiklenmedi (yalnızca DDL'de tanımlı olduğu doğrulandı); P4.3'ün
bilinen event/notification commit-ordering limitation'ı bu pakette de
bağımsız test edilmedi (black-box API+DB testinin gözlemleyebileceği
bir şey değil — log satırı zamanlamasıyla ilgili, DB satırıyla değil).
Detay: evidence bölüm 9.

---

## 13. Header Validation Standardı

CURRENT (zorunlu) vs EXPECTED/FUTURE (yalnızca not edilir) ayrımı
`07-API-TESTING/README.md`'de tanımlıdır. Özet: `Content-Type` ve
`Authorization` zorunlu test edilir; CORS/security header'ları sistem
bugün üretmediği için zorunlu tutulmaz (false failure üretilmez).

**P5.2'de gerçekte ne yapıldı:** `run-schema-validation.js`, 4 PUBLIC
endpoint'in her birinde gerçek response'un `Content-Type` header'ının
tam olarak `application/json; charset=utf-8` olduğunu doğruluyor (bu
CURRENT değer, gerçek sistemin `curl -D` ile önceden ampirik olarak
doğrulanmış header'ıdır — bkz. `07-API-TESTING/README.md` "Gerçek
Response Header'ları"). `Authorization` header assertion'ı bu pakette
**yok** — 4 PUBLIC endpoint'in hiçbiri `Authorization` header'ı
göndermiyor/beklemiyor; bu, protected endpoint'ler test edilmeye
başladığında (P5.3) eklenecektir. CORS/security header'ları hâlâ
FUTURE HARDENING — assertion yok.

---

## 14. Test Data Kullanımı

Mevcut `shared/test-data/` (`auth-users.json`, `products.json`,
`payment-test-patterns.json`) **aynen yeniden kullanılacaktır** —
ancak pre-request script'ler bu dosyaları **doğrudan filesystem'den
okumaz**. Gerçek Newman/Postman modeli: local iteration data, Newman
CLI'a `-d <data-file>` parametresiyle verilir (veya Postman Collection
Runner'a data file olarak yüklenir); script'ler bu veriye runner'ın
**iteration-data/variable API**'si üzerinden erişir (ör.
`pm.iterationData.get(...)`), dosya yolunu kendileri açıp okumaz.
**Duplicate bir test data sistemi kurulmayacaktır.**

**P5.1'de gerçekte ne yapıldı:** `POST /api/auth/login` request'i,
`shared/test-data/auth-users.json`'daki tek bir deterministic kullanıcıyı
(`test.active01@example.com` / `ValidPass123!`) request body'sine
**doğrudan** (hardcoded, açıkça "synthetic/deterministic test credential"
olarak işaretlenmiş) yazdı — tek iterasyonluk bir smoke test için ayrı
bir `-d <data-file>` kurulumu gerekmedi. P5.3'ün iki kullanıcılı
(USER A/B) authentication/authorization suite'i de aynı şekilde iki
ayrı, doğrudan yazılmış login request'i kullandı — iterasyon data
dosyası gerekmedi. Gerçekten çoklu iterasyon/veri seti gerektiren bir
senaryo ortaya çıktığında `-d <data-file>` modeli kullanılacaktır.
Detaylı eşleme (`hangi veri hangi testte`) için bkz.
`07-API-TESTING/README.md` — "Test Data Yaklaşımı".

---

## 15. Reporting Yaklaşımı

P5.1–P5.7'de yalnızca Newman'ın standart CLI çıktısı (console reporter)
+ AJV wrapper script'lerinin kendi konsol özeti kullanıldı; bu çıktı
ilgili paketin `evidence/P5-API-TESTING/<paket>/EXECUTION.md`'sine
gerçek execution kaydı olarak yazıldı — ara execution'lar commit
edilmiyor, yalnızca paket kapanışındaki execution (P4.4/P4.5 evidence
pattern'i). **P5.8'de** bu console-only modele ek olarak, mevcut 5
Newman collection'ı için tarayıcıda açılabilir bir HTML raporu
üretilebilir hale getirildi — mevcut test mantığı/assertion'lar
DEĞİŞMEDİ, yalnızca reporting eklendi.

**P5.7 (`scripts/run-api-db-validation.js`) kapsam dışıdır** — bir
Postman/Newman collection'ı değil, `node:sqlite` + `fetch` kullanan
standalone bir Node script'i; kendi Markdown/evidence modeli aynen
korunur, Newman HTML reporter'a zorlanmadı.

### 15.1 Reporter ve dependency kararı

`newman-reporter-htmlextra` (`^1.23.1`, dev-only devDependency) seçildi
— `peerDependencies.newman: ^6.0.0` pinned `newman@^6.2.2` ile uyumlu,
`engines.node: >=6` kullanılan Node ile uyumlu, deprecated değil.
Newman'ın kendi major/minor versiyonu bu reporter'a uydurmak için
DEĞİŞTİRİLMEDİ. `npm audit` before/after paket-paket karşılaştırması
(`git stash` ile) yapıldı: reporter'ın kendi zincirinden gelen GERÇEK
yeni risk 0 critical / 0 high / 1 moderate (`@budibase/
handlebars-helpers`, dev-only, runtime uygulamaya etkisi yok) — kabul
edildi, blocker değil. Tüm critical/high bulgular zaten Newman'ın kendi
transitive zincirinde P5.1'den beri mevcuttu. Handlebars advisory'si iki
ayrı path'ten geliyor — biri Newman'ın kendi (pre-existing) zincirinden,
biri reporter'ın kendi nested kopyasından; ikisi de dev-only, backend/
frontend runtime koduna hiç girmiyor (KNOWN DEPENDENCY ADVISORY). Detaylı
paket-paket diff ve dependency-chain analizi:
`evidence/P5-API-TESTING/P5.8-NEWMAN-HTML-REPORTING/EXECUTION.md`
bölüm 2.

### 15.2 Rapor üretme komutları

```bash
cd QA-DEMO-SYSTEM
npm run dev                       # ayrı bir terminalde — sunucu ayakta kalmalı
cd api-tests

npm run api:report:public         # Public/Postman Foundation
npm run api:report:auth           # Auth & Authorization
npm run api:report:products       # Products (Public collection'ın "Products" klasörü, izole)
npm run api:report:orders         # Orders & Payment — reset gerektirir (otomatik yapılır, aşağıya bkz.)
npm run api:report:notifications  # Notifications — reset gerektirir (otomatik yapılır, aşağıya bkz.)
npm run api:report:all            # yukarıdaki 5'i sırayla çalıştırır
```

Orders & Payment ve Notifications **stateful**'dir (stok/order/
notification mutasyonu yapar) — `requiresReset: true` işaretli bu iki
suite, `scripts/generate-html-report.js` içinde kendi çalışmalarından
hemen önce otomatik olarak reset script'ini çalıştırır; manuel reset
gerekmez. Public/Auth/Products reset gerektirmez (mevcut `api:test:*`
script'leriyle aynı konvansiyon — bkz. bölüm 6).

Bu reset çağrısı npm'i hiç kullanmaz — `backend`'in `db:seed` script'i
zaten yalnızca `node src/database/seed.js` olduğundan (shell özelliği
yok), runner doğrudan `process.execPath` (o an çalışan Node
binary'sinin Node'un kendisi tarafından çözülen tam yolu) ile reset
script'inin gerçek path'ini çalıştırır. Kullanıcının Windows'ta manuel
olarak `npm.cmd` yazması GEREKMEZ; yukarıdaki komutlar tüm
platformlarda AYNI kod yolunu izler (fix round #2, Codex B1 — bkz.
`EXECUTION.md` bölüm 0.1 ve 10).

`api:report:all` suite'leri **sırayla** (paralel değil) çalıştırır,
hiçbir suite'in başarısızlığını yutmaz/gizlemez — bir suite FAIL olsa
bile diğerleri çalışmaya devam eder, ama en sonda herhangi biri FAIL
ise process exit code **1** olur.

### 15.3 Çıktı konumu ve commit politikası

Raporlar `QA-DEMO-SYSTEM/api-tests/reports/` altında, deterministik
isimlerle üretilir: `public-api-report.html`, `auth-api-report.html`,
`products-api-report.html`, `orders-payment-api-report.html`,
`notifications-api-report.html`. Bu dizin `QA-DEMO-SYSTEM/.gitignore`'a
eklendi (`api-tests/reports/`) — **üretilen HTML dosyaları default
olarak git'e commit edilmez.** Paket kapanışı evidence'ı
(`EXECUTION.md`) komutları/path'leri/özet sayıları kaydeder, ham HTML
içeriğini DEĞİL.

### 15.4 Exit code semantiği

Reporter eklenmesi Newman'ın PASS=0/FAIL≠0 exit code semantiğini
**değiştirmez**. "Rapor dosyası üretildi" hiçbir yerde "test geçti"
anlamına gelmez — her suite kendi `summary.run.failures.length`'ını
kontrol eder. Bu, gerçek bir controlled-failure proof ile kanıtlandı
(geçici, commit edilmeyen, session-local bir bozuk assertion kopyası
üzerinden — exit code 1 ve HTML'de görünür hata render'ı doğrulandı,
detay: `EXECUTION.md` bölüm 8).

### 15.5 Secret/token redaction

Her rapor `reporter.htmlextra.skipHeaders: "Authorization"` ile HTTP
header satırlarındaki gerçek session token'ı gizler. Bunun YETERSİZ
olduğu (login/bootstrap request'lerinin RESPONSE BODY'sinde gerçek
`demo-session-<uuid>` token'ının göründüğü) P5.8'in kendi execution'ında
bulundu ve `reporter.htmlextra.hideResponseBody` ile düzeltildi. Codex
delta review'i ayrıca login/bootstrap request'lerinin REQUEST body'sindeki
sentetik password'ün (`ValidPass123!`) de görünür olduğunu belirtti —
`reporter.htmlextra.hideRequestBody` aynı request isim listesiyle
eklendi. Yalnızca login/bootstrap request'lerinin body'leri gizli;
diğer tüm request/response body'leri debug değeri için görünür kalır.
Sentetik payment token'ları (`TEST-CARD-APPROVED/DECLINED/TIMEOUT`) ve
order status değerleri (`PAID`/`PAYMENT_FAILED`/`PAYMENT_TIMEOUT`)
bilinçli olarak maskelenMEdi — sentetik veri kullanıldığını
kanıtlamaları gerekiyor. Değer-bazlı (yalnızca field adı değil, gerçek
captured token/password VALUE'su aranarak) tarama sonucu ve detay:
`EXECUTION.md` bölüm 9.

### 15.6 Portability

Rapor tek bir `.html` dosyası, backend'e runtime bağımlılığı yok;
içerik (summary/request/response/assertion verisi) dosyanın içinde
gömülü. **Bilinen sınırlama:** görsel stilleme 10 harici CDN kaynağına
(jQuery/Bootstrap/Font Awesome/vb.) bağımlı — internet olmadan rapor
yine açılır ve ham içerik okunabilir, ama tam stil yüklenmez. Path'ler
`path.join(__dirname, ...)` ile tamamen relative — hardcoded Windows/
Linux path yok. **Windows notu:** reset artık `process.execPath` (Node
tarafından çözülen, o an çalışan Node binary'sinin tam yolu) ile
doğrudan çalışıyor — npm/npm.cmd hiç devreye girmiyor, dolayısıyla
platforma özel ayrı bir kod dalı yok; tüm platformlar aynı kod yolunu
izliyor (implementation-level cross-platform proof). Bu proje Linux
tabanlı bir execution ortamında geliştirildiği için gerçek bir Windows
makinesinde literal olarak çalıştırılarak test edilmedi — Linux'ta 6
ayrı gerçek execution'da doğrulandı. Detay: `EXECUTION.md` bölüm 10.

---

## 16. Evidence Yaklaşımı

`CONTRIBUTING.md` — Evidence Integrity kuralı aynen geçerlidir:
gerçekten çalıştırılmamış bir Newman run'ı veya AJV validation'ı PASS
olarak gösterilemez. P5.1'de gerçek bir Newman run'ı, P5.2'de gerçek
bir AJV schema validation run'ı (+ negative proof), P5.3'te gerçek bir
auth/authorization suite run'ı, P5.4'te gerçek bir Products suite
run'ı (+ genişletilmiş negative proof), P5.5'te gerçek bir Orders &
Payment business suite run'ı, P5.6'da gerçek bir Notifications suite
run'ı, P5.7'de gerçek bir API→DB validation run'ı (dördü de **2 ayrı
temiz-reset execution ile**, repeatability kanıtı — P5.7'de mutlak
satır ID'leri dahil), P5.8'de gerçek bir HTML report generation run'ı
(5 suite'in tamamı, **2 ayrı temiz-reset execution ile**, request/
assertion sayıları birebir aynı — repeatability kanıtı) gerçek sisteme
karşı çalıştırıldı ve sonuçları ilgili paketin
`evidence/P5-API-TESTING/<paket>/EXECUTION.md`'sinde kayıt altına
alındı. Her sonraki paket kapanışında da aynı şekilde gerçek execution
kaydı üretilecektir.

---

## 17. Security Boundaries

Bu klasördeki testler **penetration testing değildir**. Yalnızca
QA-seviyeli authorization/ownership/negative doğrulama yapılır (IDOR,
auth bypass senaryoları, hata mesajlarında bilgi sızıntısı kontrolü).
Exploit geliştirme, saldırı aracı kullanımı veya sistemin gerçek bir
güvenlik açığını istismar etmesi bu kapsamın **tamamen dışındadır**.

---

## 18. Phase 5 Paketleri

| Paket | Amaç | Durum |
|---|---|---|
| P5.0 | API Scope & Contract (bu doküman + `07-API-TESTING/README.md`) | CLEAN |
| P5.1 | Postman Foundation (collection, local environment, Newman runner, PUBLIC endpoint smoke) | CLEAN |
| P5.2 | AJV/JSON Schema (`shared/schemas/` doldurulması, Newman Node API wrapper, negative proof) | CLEAN |
| P5.3 | Authentication & Authorization API Tests (protected collection, auth matrix, ownership/cross-user) | CLEAN |
| P5.4 | Products API Tests (list/detail positive+negative+boundary, data-quality, schema/negative-proof reuse) | CLEAN |
| P5.5 | Orders & Payment API Tests (duplicate aggregation, stock, quantity/product/items validation, payment outcomes, repeatability) | CLEAN |
| P5.6 | Notifications API Tests (PAID correlation, user isolation, declined/timeout non-generation, duplicate regression, repeatability) | CLEAN |
| P5.7 | API → DB Validation (persistence contract, duplicate-aggregation DB proof, ownership, relational integrity, constraint definitions, repeatability) | CLEAN |
| P5.8 | Newman HTML Reporting (`newman-reporter-htmlextra`, 5 suite report, secret redaction, controlled-failure proof, repeatability) | CLEAN |
| P5.9 | Regression, Evidence & Phase 5 Closeout | PLANNED |

Her paketin amaç/kapsam/dosya/test/AC/dependency/evidence/Codex
review noktası detayları ilgili paketin kendi başlangıcında
netleştirilecektir (Phase 4'te uygulanan pattern).

---

## İlgili Repository Dokümanları

- [../../07-API-TESTING/README.md](../../02-FULL-STACK-QA-HANDBOOK/07-API-TESTING/README.md)
- [../ARCHITECTURE.md](../ARCHITECTURE.md)
- [../PHASE-4-CLOSEOUT.md](../PHASE-4-CLOSEOUT.md)
- [../../shared/schemas/](../../shared/schemas/)
- [../../shared/test-data/](../../shared/test-data/)
- [../evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md](../evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md)
- [../evidence/P5-API-TESTING/P5.2-AJV-SCHEMA/EXECUTION.md](../evidence/P5-API-TESTING/P5.2-AJV-SCHEMA/EXECUTION.md)
- [../evidence/P5-API-TESTING/P5.3-AUTH-AUTHORIZATION/EXECUTION.md](../evidence/P5-API-TESTING/P5.3-AUTH-AUTHORIZATION/EXECUTION.md)
- [../evidence/P5-API-TESTING/P5.4-PRODUCTS/EXECUTION.md](../evidence/P5-API-TESTING/P5.4-PRODUCTS/EXECUTION.md)
- [../evidence/P5-API-TESTING/P5.5-ORDERS-PAYMENT/EXECUTION.md](../evidence/P5-API-TESTING/P5.5-ORDERS-PAYMENT/EXECUTION.md)
- [../evidence/P5-API-TESTING/P5.6-NOTIFICATIONS/EXECUTION.md](../evidence/P5-API-TESTING/P5.6-NOTIFICATIONS/EXECUTION.md)
- [../evidence/P5-API-TESTING/P5.7-API-DB-VALIDATION/EXECUTION.md](../evidence/P5-API-TESTING/P5.7-API-DB-VALIDATION/EXECUTION.md)
