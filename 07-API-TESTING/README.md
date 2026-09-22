# 07 — API Testing

**Knowledge Status: EXPERIENCE**
**Phase: PHASE 5 — API TESTING**
**Doküman Statüsü: P5.0 — API Scope & Contract**

> Bu doküman P5.0 paketinin ürünüdür — yalnızca kapsam/kontrat
> kararlarını kayıt altına alır. Bu aşamada hiçbir Postman collection,
> JSON Schema dosyası veya dependency oluşturulmamıştır.

---

## Bölümün Amacı

Bu bölüm, bir QA Engineer'ın bir REST API'yi **fonksiyonel, contract,
authorization ve regression** açısından nasıl test ettiğini,
Phase 4'te inşa edilen **gerçek, çalışan** QA Demo System API'si
üzerinde göstermeyi amaçlar.

Phase 2/3'ün kontrollü (kurgusal, NOT EXECUTED) örneklerinin aksine,
bu bölümün test hedefi **gerçekten çalışan** bir sistemdir — testler
gerçekten çalıştırılacak, gerçek evidence üretilecektir (bkz.
`CONTRIBUTING.md` — Evidence Integrity).

---

## Kapsam

- `QA-DEMO-SYSTEM`'in gerçek REST API'sinin (7 endpoint) ve WebSocket
  authentication mekanizmasının fonksiyonel, contract, authorization
  ve regression testi.
- Postman + Newman + AJV/JSON Schema + Newman HTML reporting ile
  (bkz. `QA-COMPETENCY-MAP.md` bölüm 7–9, EXPERIENCE statüsü).
- Public/Protected endpoint ayrımının doğrulanması.
- Request/Response contract (JSON Schema) validasyonu.
- Header validation (yalnızca sistemin gerçekten ürettiği header'lar
  için zorunlu; bkz. bölüm "Header Validation Standardı").
- API → Database validation (yalnızca değer sağlayan akışlarda).
- Idempotency **riskinin** dokümante edilmesi/gösterilmesi (Phase
  4'ün bilinçli kararı gereği yeni bir idempotency sistemi
  **kurulmayacaktır**).
- Positive / Negative / Boundary / Security-oriented (IDOR,
  authorization bypass, hata mesajı bilgi sızıntısı) testler.
- Basit response-time **baseline** (yük/stres testi değil).

## Kapsam Dışı

- **Pagination / Filtering / Sorting** — sistemde implement
  edilmemiş (ROADMAP Phase 4'te FUTURE); var olmayan özellik test
  edilemez.
- **Rate Limiting, API Versioning, API Gateway** — sistemde yok.
- **Load / Stress / Soak performans testi** — Phase 10/14'ün (JMeter)
  kapsamı; Phase 5 yalnızca basit bir response-time baseline'ı
  değerlendirir.
- **Mock Server / Service Virtualization** — `QA-COMPETENCY-MAP.md`
  bölüm 8'de ayrı, LEARNING statülü bir kapsam; P5.x paketlerinin
  parçası değildir.
- **Penetration testing / exploit geliştirme** — kesinlikle kapsam
  dışı; yalnızca QA-seviyeli authorization/ownership/negative
  doğrulama yapılır.
- **Backend geliştirme / mimari değişiklik** — Phase 5, sistemi
  **olduğu gibi** test eder; bulunan gap'ler (CORS/security header
  eksikliği, idempotency, existing-DB migration — bkz. Known
  Limitations) düzeltilmez, yalnızca dokümante edilir (Phase 4'ün
  "sistemi değiştirme, test et" disiplini korunur).
- GraphQL/WebSocket derinlemesine event testleri → **Phase 6**.

---

## API Inventory (Gerçek Kaynak Koddan Çıkarılmıştır)

QA Demo System'in tüm gerçek endpoint'leri, `QA-DEMO-SYSTEM/backend/src/app.js`
ve `routes/*.js` dosyalarından doğrulanmıştır — hiçbiri uydurulmamıştır.

### PUBLIC Endpoint'ler

Hiçbiri `requireAuth` middleware'ini kullanmaz (`app.js`'te route
mount sırası ve `routes/auth.routes.js`, `routes/products.routes.js`
doğrulanmıştır):

| # | Method | Path | Request Body | Path/Query Params | Success | Error Status'lar |
|---|---|---|---|---|---|---|
| 1 | GET | `/api/health` | — | — | `200` `{status:"ok"}` | — |
| 2 | POST | `/api/auth/login` | `{email, password}` | — | `200` `{token, user:{id,email}}` | `400` (alan eksik), `401` (geçersiz kimlik) |
| 3 | GET | `/api/products` | — | — | `200` `{products:[{id,name,price,stock_quantity,in_stock}]}` | — |
| 4 | GET | `/api/products/:id` | — | path: `id` | `200` `{product:{...}}` | `404` (bulunamadı) |

### PROTECTED Endpoint'ler

Üçü de `router.use(requireAuth(db))` ile korunur
(`routes/orders.routes.js`, `routes/notifications.routes.js`) —
`Authorization: Bearer <token>` zorunludur, `sessions` tablosuna
karşı doğrulanır:

| # | Method | Path | Request Body | Params | Success | Error Status'lar |
|---|---|---|---|---|---|---|
| 5 | POST | `/api/orders` | `{items:[{product_id,quantity}], payment_token?}` | — | `201` `{order:{id,status,total}}` | `400`, `401`, `409` |
| 6 | GET | `/api/orders/:id` | — | path: `id` | `200` `{order:{...,items:[...]}}` | `401`, `404` |
| 7 | GET | `/api/notifications` | — | — | `200` `{notifications:[...]}` | `401` |

### WebSocket — Ayrı Auth Mekanizması

| Endpoint | Auth | Başarı | Hata |
|---|---|---|---|
| `WS /ws?token=<sessionToken>` | Query string token, `sessions` tablosuna karşı (`websocketServer.js`, Express middleware **değil**) | Upgrade (101) + `{"type":"notification",...}` push | Upgrade öncesi `401 Unauthorized` yazılıp socket destroy edilir; yanlış path → socket sessizce destroy edilir |

**Bu envanter dışında hiçbir endpoint mevcut değildir.**

---

## Gerçek Response Header'ları (Ampirik Doğrulandı)

`curl -D` ile gerçek çalışan sistem üzerinde doğrulanmıştır:
`X-Powered-By: Express`, `Content-Type: application/json; charset=utf-8`,
`Content-Length`, `ETag` (weak), `Date`, `Connection: keep-alive`,
`Keep-Alive: timeout=5`. **CORS, `Cache-Control`, güvenlik header'ları
(`X-Content-Type-Options`, `X-Frame-Options` vb.) mevcut değildir** —
hiçbir `helmet`/`cors` middleware'i kurulu değil.

---

## API Business Rules (Kaynak Koddan Doğrulanmıştır)

- **BR-AUTH-003:** Yanlış şifre ve bilinmeyen kullanıcı aynı `401`
  mesajını döner (`"Email veya şifre hatalı"`); email case-insensitive
  aranır; yalnızca `status='ACTIVE'` kullanıcı login olabilir.
- **Session token:** `crypto.randomUUID()` tabanlı, `sessions`
  tablosunda persist edilir.
- **Orders — duplicate aggregation:** Aynı `product_id`'ye ait birden
  fazla satır, stok kontrolünden önce toplanır.
- **Orders — strict type validation:** `product_id`/`quantity`
  yalnızca `typeof number && Number.isInteger && >0`; coercion yok.
- **Orders — payment_token:** Yalnızca gerçekten omit edilmişse
  default (`TEST-CARD-APPROVED`); `null/false/0/""`/yanlış tip → `400`.
- **Orders — stock/state:** Stok yalnızca `PAID` sonucunda düşülür;
  `order.paid` event/notification yalnızca `PAID` siparişte üretilir.
- **Ownership isolation:** `GET /api/orders/:id` ve
  `GET /api/notifications`, `req.userId`'ye sıkı scope'lu; başka
  kullanıcının kaydına erişim `403` değil `404` döner.
- **Duplicate prevention (basit):** `UNIQUE(order_id, event_type/type)`
  — genel bir idempotency sistemi değildir.

---

## Test Methodology

### Positive

Her PUBLIC/PROTECTED endpoint için happy-path senaryosu (bkz. API
Inventory tablosu "Success" sütunu).

### Negative

Bkz. aşağıdaki **Negative Test Matrix**.

### Boundary

Stok sınırları (`stock_quantity=0` ürünü, tam stok kadar sipariş),
`quantity`/`product_id` için pozitif tam sayı sınırı (`0`, negatif
değerler zaten Negative Matrix'te).

### Auth / Authorization

Bkz. aşağıdaki **Authorization Matrix**.

### Contract / Schema

Bkz. **Schema Governance**.

### Headers

Bkz. **Header Validation Standardı**.

### API → DB

Bkz. **API → Database Validation Kapsamı**.

### Regression

Mevcut `backend/tests/` altındaki 72 unit test'in **yanına**,
dışarıdan-içeri (black-box, HTTP seviyeli) API testleri eklenir —
aynı senaryoları unit test seviyesinde **duplicate etmez**, dış
sözleşmeyi (contract) doğrular.

### Evidence / Reporting

Bkz. **Reporting Yaklaşımı**.

---

## Authorization Matrix

| Senaryo | Beklenen |
|---|---|
| No token → protected endpoint | `401` |
| Invalid/forged token → protected endpoint | `401` |
| Valid token → protected endpoint | `200`/`201` |
| Valid token, başka kullanıcının order'ı | `404` (`403` değil — IDOR-bilinçli) |
| Valid token, başka kullanıcının notification listesi | Boş liste |
| WS: token yok/geçersiz | Upgrade reddi, `401` |
| WS: yanlış path | Socket destroy |

---

## Negative Test Matrix

Kategoriler **yalnızca ilgili endpoint'lere** uygulanır (körlemesine
her kategori her endpoint'e uygulanmaz):

| Kategori | Uygulanan Endpoint(ler) |
|---|---|
| Missing field | `POST /api/auth/login` (email/password), `POST /api/orders` (items) |
| Null / wrong type / empty value | `POST /api/orders` (`product_id`, `quantity`, `payment_token`) |
| Malformed JSON | `POST /api/auth/login`, `POST /api/orders` |
| Missing/invalid token | `POST /api/orders`, `GET /api/orders/:id`, `GET /api/notifications`, `WS /ws` |
| Ownership violation | `GET /api/orders/:id` (cross-user) |
| Invalid / unknown ID | `GET /api/products/:id`, `GET /api/orders/:id` |
| Invalid enum | `payment_token` (tanınmayan string) |
| Stock conflict | `POST /api/orders` (yetersiz stok, tek satır veya aggregate edilmiş duplicate satır) |
| Invalid payment token | `POST /api/orders` |

---

## Schema Governance

**Canonical schema path kararı: `shared/schemas/`.**

`ARCHITECTURE.md` bölüm 14, bu klasörü P4.0'da tam bu amaç için
("Phase 5'in AJV/JSON Schema Validation çalışması için hazır bir
sözleşme kaynağı") reserve etmişti — `QA-DEMO-SYSTEM/api-tests/`
altında **ayrı/duplicate bir schema klasörü oluşturulmayacaktır**.
`shared/schemas/` şu an yalnızca `.gitkeep` içerir (reserved/planned)
— **P5.2 paketinde** gerçek `.schema.json` dosyalarıyla doldurulup
active kullanım alanına dönüştürülecektir. Bu doküman (P5.0),
yalnızca yapıyı ve kuralları tanımlar; henüz hiçbir şema dosyası
oluşturulmamıştır.

Planlanan alt yapı (P5.2'de oluşturulacak):

```text
shared/schemas/
├── auth/          login-response.schema.json, login-error.schema.json
├── products/      products-list.schema.json, product.schema.json
├── orders/        order.schema.json, order-detail.schema.json
└── notifications/ notifications-list.schema.json
```

### AJV Kuralları

- **Validator:** AJV (`QA-COMPETENCY-MAP.md` bölüm 8, EXPERIENCE).
- **`additionalProperties: false`** — strict, tanımsız alan kabul
  edilmez.
- **`required`** alanlar açık şekilde listelenir.
- **`null` yasak** — opsiyonel alanlar şemadan tamamen çıkarılır,
  `type` içine `"null"` eklenmez.
- **Type strict:** her alan tam tip (`string`/`integer`/`number`/`boolean`).
- **Nested object/array validation:** örn. `order.items[]`, her item
  kendi şemasıyla doğrulanır.
- **`enum`** gerektiğinde kullanılır (örn. `order.status`:
  `["PAID","PAYMENT_FAILED","PAYMENT_TIMEOUT"]`).
- **Reusable schema:** ortak alt şemalar (örn. `error-response.schema.json`
  — tüm `{error:string}` response'ları için tek şema) tekrar
  kullanılır, duplicate edilmez.
- **Versioning:** P5.0 kapsamında versiyonlama gerekmez (tek, mevcut
  API sürümü); ileride API versiyonlanırsa şema dosya adlarına
  (`v1/`) taşınabilir — bu **kapsam dışıdır** (bkz. "Kapsam Dışı" —
  API Versioning).

---

## Header Validation Standardı — CURRENT vs EXPECTED/FUTURE

| Header | CURRENT (zorunlu test edilir) | EXPECTED / FUTURE HARDENING (yalnızca not edilir) |
|---|---|---|
| `Content-Type` (response) | `application/json; charset=utf-8` | — |
| `Authorization` (request) | Protected endpoint'lerde `Bearer <token>` | — |
| `X-Powered-By` | `Express` (gözlemlenir, değiştirilmez) | Kaldırılması güvenlik best-practice'i |
| `Cache-Control` | Yok | Future hardening |
| CORS header'ları | Yok | Future — sistem cross-origin için tasarlanmadı |
| Security header'ları | Yok | Future hardening |

**Kural:** Testler yalnızca CURRENT sütununu zorunlu (`PASS/FAIL`)
olarak doğrular; sistemin bugün üretmediği bir header'ı zorunlu hale
getirip false failure üretmek **yasaktır**.

---

## Test Data Yaklaşımı

Mevcut `shared/test-data/` **aynen yeniden kullanılır**, duplicate
test data sistemi **oluşturulmaz**:

| Kaynak | Kullanım |
|---|---|
| `auth-users.json` (`test.active01@example.com`, `test.active02@example.com`) | Valid login, cross-user ownership testleri |
| `products.json` (4 ürün, biri stok yok) | Products testleri, stock conflict senaryosu |
| `payment-test-patterns.json` (`TEST-CARD-APPROVED/DECLINED/TIMEOUT`) | Orders state transition testleri |
| Sentetik değerler (`WrongPass999!`, bilinmeyen email) | Auth negative testleri (Phase 2/3/4'ten beri kullanılan aynı değerler) |

---

## API → Database Validation Kapsamı

Yalnızca gerçekten değer sağlayan akışlar (her `GET` için DB kontrolü
**koyulmaz**):

- **Create Order (PAID):** API `201` → `orders` satırı → `order_items`
  → `products.stock_quantity` düşüşü → `events` (`order.paid`) →
  `notifications` satırı — tam zincir.
- **Create Order (DECLINED/TIMEOUT):** Stok **değişmediği** ve
  event/notification **üretilmediği** negatif DB assertion'ı.
- **Notification:** `UNIQUE(order_id,type)` constraint'inin gerçekten
  çalıştığının doğrulanması.

---

## Reporting Yaklaşımı

`QA-DEMO-SYSTEM/evidence/P5-API-TESTING/{reports,execution,results}/`
(P5.8/P5.9'da kullanılacak). Newman HTML raporları **her ara
execution'da commit edilmez** — yalnızca paket/milestone kapanışlarında
(P4.5/P4.4 paterni) bir execution kaydı commit edilir.

---

## Known Limitations (Phase 4'ten Devralınan, P5'te Yeniden Açılmayacak)

- `POST /api/orders` idempotent değildir (Accepted Scope Boundary).
- SQLite CHECK/FOREIGN KEY constraint'leri yalnızca fresh (yeni)
  veritabanında geçerlidir; existing DB migrate edilmez (Known
  Limitation / Future Hardening).
- CORS/güvenlik header'ları mevcut değil (bu doküman kapsamında yeni
  bir "Known Limitation" olarak eklenmiştir — bkz. Header Validation
  Standardı).

Bu liste Phase 5'te **çözülmeye çalışılmayacaktır** — yalnızca test
edilip/dokümante edilecektir (bkz. `QA-DEMO-SYSTEM/PHASE-4-CLOSEOUT.md`
bölüm 9).

---

## İlgili Repository Dokümanları

- [QA-DEMO-SYSTEM/api-tests/README.md](../QA-DEMO-SYSTEM/api-tests/README.md)
- [QA-DEMO-SYSTEM/ARCHITECTURE.md](../QA-DEMO-SYSTEM/ARCHITECTURE.md)
- [QA-DEMO-SYSTEM/PHASE-4-CLOSEOUT.md](../QA-DEMO-SYSTEM/PHASE-4-CLOSEOUT.md)
- [QA-COMPETENCY-MAP.md](../QA-COMPETENCY-MAP.md) (bölüm 7–9)
- [ROADMAP.md](../ROADMAP.md) (Phase 5)
