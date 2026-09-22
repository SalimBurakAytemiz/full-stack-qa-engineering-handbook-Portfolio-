# QA Demo System — API Tests

**Phase: PHASE 5 — API TESTING**
**Doküman Statüsü: P5.3 — Authentication & Authorization API Tests**

> Bu klasör, Phase 5'in Postman/Newman/AJV tabanlı API test
> katmanının giriş noktasıdır. P5.0'da yalnızca bu README (kapsam/
> kontrat kararları) oluşturulmuştu. P5.1'de gerçek bir Postman
> collection, local environment ve Newman CLI dependency'si kuruldu.
> P5.2'de PUBLIC endpoint response'larına gerçek AJV/JSON Schema
> validation ve Content-Type header assertion'ı eklendi.
> **P5.3'te gerçek protected REST API yüzeyinde (requireAuth
> middleware) authentication matrix, ownership isolation ve
> cross-user access testleri eklendi** — ayrı bir protected
> collection, otomatik token bootstrap (manuel token kopyalama yok),
> 2 deterministic kullanıcı ile gerçek ownership/cross-user
> doğrulaması. Products/Orders/Notifications'ın **business/functional**
> senaryoları, DB validation ve HTML reporting **henüz yok** —
> aşağıda hâlâ "PLANNED" olarak işaretlidir.

---

## 1. API Test Sisteminin Amacı

`QA-DEMO-SYSTEM`'in Phase 4'te inşa edilmiş **gerçek, çalışan**
REST API'sini (7 endpoint + WebSocket auth), Postman/Newman/AJV ile
fonksiyonel, contract, authorization ve regression açısından
doğrulamak. Detaylı metodoloji ve kapsam kararı için bkz.
[`07-API-TESTING/README.md`](../../07-API-TESTING/README.md).

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
| Newman HTML reporter | Execution raporu | PLANNED (P5.8) |

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

### Mevcut (P5.3 sonunda)

```text
QA-DEMO-SYSTEM/api-tests/
├── README.md
├── package.json                                  (newman + ajv devDependency; "api:test:postman",
│                                                    "api:test:postman:basic", "api:test:schema:negative-proof",
│                                                    "api:test:auth" script'leri)
├── scripts/
│   ├── run-schema-validation.js                  (P5.2 — Newman Node API + AJV wrapper)
│   └── schema-negative-proof.js                  (P5.2 fix — tracked/reproducible negative+positive proof)
└── postman/
    ├── collections/
    │   ├── qa-demo-system-public.postman_collection.json      (P5.1 — 4 PUBLIC endpoint, status-code smoke)
    │   └── qa-demo-system-protected.postman_collection.json   (P5.3 — 19 request: auth gate, token bootstrap,
    │                                                            auth matrix, ownership/cross-user)
    └── environments/
        └── local.postman_environment.json                  (P5.1 — baseUrl)

shared/schemas/                                    (P5.2 — canonical, active)
├── common/
│   └── error-response.schema.json
├── health/
│   └── health-response.schema.json
├── auth/
│   └── login-response.schema.json
└── products/
    ├── product-item.schema.json                  (reusable, $ref'lenir)
    ├── products-list-response.schema.json
    └── product-detail-response.schema.json
```

### Hâlâ Planlanan (sonraki paketlerde kademeli olarak oluşturulacak)

```text
QA-DEMO-SYSTEM/api-tests/
└── postman/
    ├── collections/   + Products/Orders/Notifications business-functional collection'ları (P5.4-P5.6)
    └── data/           (yalnızca gerçekten data-driven/multi-iteration bir senaryo gerektiğinde
                         oluşturulacak; bkz. not aşağıda)

shared/schemas/
├── orders/         (P5.5 — gerçek Orders response'ları belirlendiğinde)
└── notifications/  (P5.6 — gerçek Notifications response'ları belirlendiğinde)
```

**Schema'lar burada değil `shared/schemas/` altında** (bkz. bölüm 7 —
canonical karar, P5.2'de active hale geldi). Reports/evidence de
burada değil `QA-DEMO-SYSTEM/evidence/P5-API-TESTING/` altında (bkz.
bölüm 12). `scripts/` klasörü **P5.2'de oluşturuldu** — iki dosya:
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
çıktığında, Newman'ın `-d <data-file>` mekanizmasıyla (bkz. bölüm 10)
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
`evidence/P5-API-TESTING/P5.2-AJV-SCHEMA/EXECUTION.md`). P5.1'in
kendi execution kaydı da geçerliliğini korur:
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
geçerli) payload'lar test edildi — **18/18 proof beklenen şekilde
sonuçlandı** (bkz. `evidence/P5-API-TESTING/P5.2-AJV-SCHEMA/EXECUTION.md`
bölüm 5): eksik `required` alan, yanlış `type`, `null`, boş string
(`token: ""`), ve beklenmeyen `additionalProperties` — her kategori
(HEALTH 5, AUTH 5, PRODUCTS 5, ERROR 3) için AJV tarafından doğru
şekilde kabul/reddedildi. Script kayıtlı vaka sayısını kendi çıktısında
yazdırır (`CASES.length`) — evidence'teki sayı ile script çıktısı
arasında fark olamaz.

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

## 9. Header Validation Standardı

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

## 10. Test Data Kullanımı

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

## 11. DB Validation Yaklaşımı

Yalnızca Orders (PAID/DECLINED/TIMEOUT) ve Notifications akışlarında
— her `GET` için DB kontrolü konulmaz. Detay için bkz.
`07-API-TESTING/README.md` — "API → Database Validation Kapsamı".

---

## 12. Reporting Yaklaşımı

Newman HTML raporları (`newman-reporter-htmlextra` vb.) **PLANNED
(P5.8)** — henüz kurulmadı. P5.1/P5.2'de yalnızca Newman'ın standart
CLI çıktısı (console reporter) + `run-schema-validation.js`'nin kendi
konsol özeti kullanıldı; bu çıktı ilgili paketin
`evidence/P5-API-TESTING/<paket>/EXECUTION.md`'sine gerçek execution
kaydı olarak yazıldı — ara execution'lar commit edilmiyor, yalnızca
paket kapanışındaki execution (P4.4/P4.5 evidence pattern'i).

---

## 13. Evidence Yaklaşımı

`CONTRIBUTING.md` — Evidence Integrity kuralı aynen geçerlidir:
gerçekten çalıştırılmamış bir Newman run'ı veya AJV validation'ı PASS
olarak gösterilemez. P5.1'de gerçek bir Newman run'ı, P5.2'de gerçek
bir AJV schema validation run'ı (+ negative proof), P5.3'te gerçek bir
auth/authorization suite run'ı gerçek sisteme karşı çalıştırıldı ve
sonuçları ilgili paketin `evidence/P5-API-TESTING/<paket>/EXECUTION.md`'sinde
kayıt altına alındı. Her sonraki paket kapanışında da aynı şekilde gerçek execution
kaydı üretilecektir.

---

## 14. Security Boundaries

Bu klasördeki testler **penetration testing değildir**. Yalnızca
QA-seviyeli authorization/ownership/negative doğrulama yapılır (IDOR,
auth bypass senaryoları, hata mesajlarında bilgi sızıntısı kontrolü).
Exploit geliştirme, saldırı aracı kullanımı veya sistemin gerçek bir
güvenlik açığını istismar etmesi bu kapsamın **tamamen dışındadır**.

---

## 15. Phase 5 Paketleri

| Paket | Amaç | Durum |
|---|---|---|
| P5.0 | API Scope & Contract (bu doküman + `07-API-TESTING/README.md`) | CLEAN |
| P5.1 | Postman Foundation (collection, local environment, Newman runner, PUBLIC endpoint smoke) | CLEAN |
| P5.2 | AJV/JSON Schema (`shared/schemas/` doldurulması, Newman Node API wrapper, negative proof) | CLEAN |
| P5.3 | Authentication & Authorization API Tests (protected collection, auth matrix, ownership/cross-user) | CLEAN |
| P5.4 | Products API Tests | PLANNED |
| P5.5 | Orders & Payment API Tests | PLANNED |
| P5.6 | Notifications API Tests | PLANNED |
| P5.7 | API → DB Validation | PLANNED |
| P5.8 | Newman Reporting & Reproducible Execution | PLANNED |
| P5.9 | Regression, Evidence & Phase 5 Closeout | PLANNED |

Her paketin amaç/kapsam/dosya/test/AC/dependency/evidence/Codex
review noktası detayları ilgili paketin kendi başlangıcında
netleştirilecektir (Phase 4'te uygulanan pattern).

---

## İlgili Repository Dokümanları

- [../../07-API-TESTING/README.md](../../07-API-TESTING/README.md)
- [../ARCHITECTURE.md](../ARCHITECTURE.md)
- [../PHASE-4-CLOSEOUT.md](../PHASE-4-CLOSEOUT.md)
- [../../shared/schemas/](../../shared/schemas/)
- [../../shared/test-data/](../../shared/test-data/)
- [../evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md](../evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md)
- [../evidence/P5-API-TESTING/P5.2-AJV-SCHEMA/EXECUTION.md](../evidence/P5-API-TESTING/P5.2-AJV-SCHEMA/EXECUTION.md)
- [../evidence/P5-API-TESTING/P5.3-AUTH-AUTHORIZATION/EXECUTION.md](../evidence/P5-API-TESTING/P5.3-AUTH-AUTHORIZATION/EXECUTION.md)
