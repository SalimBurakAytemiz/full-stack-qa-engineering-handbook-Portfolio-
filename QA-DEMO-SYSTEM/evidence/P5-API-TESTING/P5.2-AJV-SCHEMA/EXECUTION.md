# P5.2 — AJV / JSON Schema Validation — Execution Evidence

**Branch:** `feat/phase-5-2-ajv-json-schema`
**Tarih:** 2026-09-22

> Bu kayıt, aşağıdaki AJV/Newman run'larının ve negative proof'ların
> **gerçekten çalıştırılmış** sonucudur (`CONTRIBUTING.md` — Evidence
> Integrity). Hiçbir sonuç tahmin edilmemiş veya kurgulanmamıştır.

---

## 1. AJV Compatibility Gate (Varsayım Değil, 4 Gerçek Newman Execution)

Şemaları yazmadan önce, Postman/Newman pm.test() sandbox'ında AJV'nin
gerçek çalışma modeli 4 ayrı gerçek Newman run'ı ile test edildi
(geçici, repository'ye commit edilmemiş scratch collection'larla):

| # | Test | Gerçek Sonuç |
|---|---|---|
| 1 | `require('ajv')` pm.test() içinde | Hata vermiyor, ama çözümlenen modül bizim `ajv@^8.20.0` devDependency'miz değil — Newman'ın kendi iç zincirinden (`postman-runtime → postman-request → har-validator`) gelen kontrolsüz `ajv@6.15.0`. Kanıt: hem 8.20.0 hem 6.15.0 diskte kuruluyken (`npm ls ajv --all`), sandbox'taki AJV hataları hâlâ v6'nın `dataPath` alanını üretiyor (v8: `instancePath`). |
| 2 | `require('ajv/package.json')`, `require('<relative-path>.json')` | `Cannot find module` — yalnızca bare npm paket adı resolution'ı çalışıyor. |
| 3 | `require('fs').readFileSync(...)` (relative/absolute/bare path) | `readFileSync is not a function` — sandbox'ın `fs` shim'i gerçek dosya erişimi sağlamıyor. `process` global'i de tanımsız. |
| 4 | Fonksiyonel AJV proof (`new Ajv()`, `compile()`, geçerli+geçersiz payload) | `require('ajv')` sonucu gerçek/fonksiyonel bir AJV instance'ı (compile/validate/errors doğru çalışıyor) — ama madde 1'deki versiyon belirsizliği nedeniyle güvenilir/kontrollü değil. |

**Karar:** AJV validation, collection'ın pm.test() script'lerine
**gömülmedi**. Bunun yerine `api-tests/scripts/run-schema-validation.js`
— Newman'ın Node API'si (`newman.run()`, `'request'` event) üzerinde
çalışan gerçek bir Node.js script'i — yazıldı. Bu script gerçek Node
module resolution'ında çalıştığı için hem pinlenmiş `ajv@8.20.0`'ı
güvenilir şekilde kullanıyor hem de `shared/schemas/**/*.schema.json`
dosyalarını doğrudan `require()` ile okuyor (fs/require sandbox
kısıtlaması yok — gerçek Node process).

AJV instance: `new Ajv({ strict: true, allErrors: true })`.
`removeAdditional`, `coerceTypes`, `useDefaults` **set edilmedi**
(validator yalnızca gözlemler, response'u değiştirmez).

---

## 2. Canonical Schemas (`shared/schemas/`, Active)

| Dosya | Kapsadığı Response |
|---|---|
| `common/error-response.schema.json` | Tüm `{error:string}` hata response'ları (reusable) |
| `health/health-response.schema.json` | `GET /api/health` 200 |
| `auth/login-response.schema.json` | `POST /api/auth/login` 200 |
| `products/product-item.schema.json` | Tek ürün nesnesi (reusable, `$ref`) |
| `products/products-list-response.schema.json` | `GET /api/products` 200 |
| `products/product-detail-response.schema.json` | `GET /api/products/:id` 200 |

Tüm alanlar gerçek kaynak koddan doğrulandı:
`backend/src/services/auth.service.js` (`authenticate()` başarı dalı),
`backend/src/services/products.service.js` (`toApiShape()`),
`backend/src/routes/auth.routes.js` + `products.routes.js` (hata
şekli: `{ error: result.message }`).

---

## 3. Ortam ve Çalıştırma Komutu

- Sunucu: `QA-DEMO-SYSTEM` backend, resmi `docs/RUN-INSTRUCTIONS.md`
  yöntemiyle ayağa kaldırıldı: `cd QA-DEMO-SYSTEM && npm run dev`.
- Komut: `cd QA-DEMO-SYSTEM/api-tests && npm run api:test:postman`
  (→ `node scripts/run-schema-validation.js`).

## 4. Gerçek Çalıştırma Çıktısı

```text
newman

QA Demo System - Public API (P5.1)

→ GET /api/health
  GET http://localhost:3000/api/health [200 OK, 249B, 21ms]
  ✓  Status code is 200

→ POST /api/auth/login (valid, deterministic test user)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 7ms]
  ✓  Status code is 200

→ GET /api/products
  GET http://localhost:3000/api/products [200 OK, 582B, 5ms]
  ✓  Status code is 200

→ GET /api/products/:id (deterministic existing product)
  GET http://localhost:3000/api/products/1 [200 OK, 329B, 3ms]
  ✓  Status code is 200

--- P5.2 AJV / Header Validation Results ---
PASS  GET /api/health — schema + Content-Type PASS
PASS  POST /api/auth/login (valid, deterministic test user) — schema + Content-Type PASS
PASS  GET /api/products — schema + Content-Type PASS
PASS  GET /api/products/:id (deterministic existing product) — schema + Content-Type PASS

Newman functional assertions (status code, from pm.test): PASS
AJV schema + Content-Type validations: PASS

P5.2 schema validation run: PASS

┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │               4 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │               4 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               0 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │               4 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 119ms                                   │
├─────────────────────────────────────────────────────────────┤
│ total data received: 567B (approx)                          │
├─────────────────────────────────────────────────────────────┤
│ average response time: 9ms [min: 3ms, max: 21ms, s.d.: 7ms] │
└─────────────────────────────────────────────────────────────┘
```

**Sonuç:** 4/4 request PASS (status code), 4/4 AJV schema + Content-Type
validation PASS, 0 failure.

---

## 5. Negative Proof (AJV'nin Gerçekten Reddettiğinin Kanıtı)

Uygulama kodu ve production response'ları **değiştirilmeden**, aynı
şemalar + aynı pinlenmiş `ajv@8.20.0` sürümüyle, ayrı bir (repository'ye
commit edilmemiş) proof script'inde kasıtlı olarak bozuk payload'lar
test edildi:

```text
=== HEALTH ===
[PROOF-OK] valid response -> valid=true (expected true)
[PROOF-OK] missing required (status) -> valid=false (expected false)
    errors: must have required property 'status'
[PROOF-OK] wrong type (status: number) -> valid=false (expected false)
    errors: must be string
[PROOF-OK] null (status: null) -> valid=false (expected false)
    errors: must be string

=== AUTH LOGIN ===
[PROOF-OK] valid response -> valid=true (expected true)
[PROOF-OK] wrong type (token: number) -> valid=false (expected false)
    errors: must be string
[PROOF-OK] missing required (token) -> valid=false (expected false)
    errors: must have required property 'token'
[PROOF-OK] null (token: null) -> valid=false (expected false)
    errors: must be string

=== PRODUCTS ===
[PROOF-OK] valid list -> valid=true (expected true)
[PROOF-OK] valid detail -> valid=true (expected true)
[PROOF-OK] invalid item type (id as string) -> valid=false (expected false)
    errors: must be integer
[PROOF-OK] null forbidden (stock_quantity: null) -> valid=false (expected false)
    errors: must be integer
[PROOF-OK] unexpected additional property -> valid=false (expected false)
    errors: must NOT have additional properties
```

**15/15 proof beklenen şekilde sonuçlandı.** `PROOF-OK`, "validator'ın
davranışı beklentiyle eşleşti" anlamına gelir (geçerli payload → PASS,
bozuk payload → FAIL) — bu, uygulamanın veya test suite'inin FAIL
olduğu anlamına gelmez; tam tersine validator'ın gerçekten çalıştığının
kanıtıdır.

Ayrıca `common/error-response.schema.json`, gerçek 400/401/404
response body'lerine (aynı oturumda `curl` ile yakalanan) karşı da
doğrulandı:

```text
PASS  POST /api/auth/login 400 (missing password) -> {"error":"Email ve şifre zorunludur."}
PASS  POST /api/auth/login 401 (wrong password) -> {"error":"Email veya şifre hatalı"}
PASS  GET /api/products/9999 404 (unknown product) -> {"error":"Ürün bulunamadı"}
```

3/3 PASS.

---

## 6. Header Validation Sonucu

4/4 PUBLIC endpoint'te `Content-Type: application/json; charset=utf-8`
gerçek response'ta doğrulandı (CURRENT standart, `07-API-TESTING/README.md`
"Gerçek Response Header'ları" ile tutarlı). `Authorization` header
assertion'ı bu pakette yok (4 PUBLIC endpoint hiçbiri bu header'ı
kullanmıyor) — P5.3'te protected endpoint'lerle eklenecek.

---

## 7. Sonuç

**PASS** — AJV compatibility gate netleşti (in-sandbox embedding
güvenilir değil → Node API wrapper), 6 canonical şema oluşturuldu ve
gerçek response'lara karşı doğrulandı, 15 negative proof + 3 error-schema
proof beklenen şekilde sonuçlandı, 4/4 gerçek endpoint schema+header
validation PASS.

---

## 8. Bilinen Sınırlamalar (Bu Paket Kapsamında)

- AJV validation, Postman collection'ın pm.test() script'lerinde
  **değil**, ayrı bir Node.js wrapper script'inde çalışır (bkz. bölüm
  1 — compatibility gate gerekçesi). Postman Desktop App'te collection
  doğrudan çalıştırılırsa (Newman CLI değil), yalnızca P5.1'in
  status-code pm.test()'leri çalışır — AJV/header validation
  çalışmaz. Bu, repo'nun zaten P5.1'de benimsediği "Postman GUI
  kullanılmaz, yalnızca Newman CLI" kararıyla tutarlıdır ve
  `api-tests/README.md` bölüm 3/7'de açıkça belgelenmiştir.
- Protected endpoint'ler (`orders`, `notifications`), `WS /ws`, ve
  Orders/Notifications şemaları bu pakette **yok** (P5.3+ kapsamı).
  `shared/schemas/orders/` ve `notifications/` klasörleri henüz
  oluşturulmadı (yalnızca gerçekten gerektiğinde oluşturulacak).
  Health error response (üretmez), Login error response
  (`common/error-response.schema.json`'a $ref edilebilir) için ayrı
  dosya oluşturulmadı — duplike edilmedi, tek reusable şema kullanıldı.
  Products list/detail'in 404 response'u için de aynı reusable şema
  geçerlidir.
- Newman'ın kendi transitive dependency ağacında (P5.1'den devralınan,
  bilinen, non-blocking) `npm audit` uyarıları hâlâ mevcut; bu pakette
  yeni bir dependency araştırması yapılmadı.
