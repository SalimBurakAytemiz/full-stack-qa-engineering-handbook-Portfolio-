# P5.5 — Orders & Payment API Tests — Execution Evidence

**Branch:** `feat/phase-5-5-orders-payment-api-tests`
**Tarih:** 2026-09-23 (ilk uygulama), **fix round: 2026-09-23** (Codex delta
review, head commit `9cac4cc`, FAIL/4 blocker + 1 non-blocking not düzeltme
turu)

> Bu kayıt, aşağıdaki Newman run'larının **gerçekten çalıştırılmış**
> sonucudur (`CONTRIBUTING.md` — Evidence Integrity). Hiçbir sonuç
> tahmin edilmemiş veya kurgulanmamıştır.
>
> **P5.4'ün Codex review'inde bırakılan non-blocking not #3'e
> ("head commit açıkça belirtilmemiş") yanıt:** bu dosyanın kendisi,
> içerdiği kendi commit hash'ine matematiksel olarak self-reference
> edemez (hash, dosya içeriğinin bir fonksiyonudur — dosyaya hash'i
> yazmak hash'i değiştirir). Bu yüzden kesin hash burada değil, bu
> paketi kapatan Türkçe rapor'da ve `git log --oneline -1
> feat/phase-5-5-orders-payment-api-tests` çıktısında açıkça
> belirtilir — review sırasında oradan doğrulanmalıdır.

---

## 0. Fix Round Özeti (Codex Delta Review — 4 Blocker + 1 Non-blocking)

Bu bölüm, `9cac4cc` üzerinde alınan **FAIL/CHANGES REQUIRED** verdiktine
yanıttır. Aşağıdaki bölümlerin tamamı bu fix round'un **gerçek**
sonuçlarını yansıtır — eski (40 request/82 assertion) sayılar artık
**geçersizdir**, korunmamıştır.

| Bulgu | Durum | Nasıl düzeltildi |
|---|---|---|
| **B1** — Approved order stock before/after kanıtı yok | **Düzeltildi** | `Payment Outcomes` klasörüne gerçek `GET /api/products/1` before/after çifti eklendi; azalma miktarı runtime'da `stockBefore - stockAfter` olarak hesaplanıyor, hardcoded değil (`stockAssertDecreasedBy` helper'ı). |
| **B2** — Bazı negative senaryolarda "state unchanged" iddiası gerçek assertion'a dayanmıyordu | **Düzeltildi** | Declined/timeout/insufficient-stock/duplicate-aggregate-exceeds-stock ve regresyon riski taşıyan temsili invalid-quantity girdileri (`"2"`, `true`, `[2]`, `null`) artık gerçek before/after `GET` çifti ile kanıtlanıyor (`stockAssertUnchanged` helper'ı). Yeni bir "mixed valid+invalid product" atomicity testi eklendi. API-visible/DB-direct ayrımı bu dosyada her yerde açıkça belirtiliyor (bkz. bölüm 5 ve 12). |
| **B3** — `payment_token: false` ve `payment_token: 0` matriste eksikti | **Düzeltildi** | İki ayrı test case eklendi; her biri 400 + değişmeyen stok ile "sessiz default'a düşmüyor" kanıtlıyor. `omitted` senaryosu (canonical default, PAID) ayrı, kendi before/after kanıtıyla korunuyor — `OMITTED !== null !== false !== 0 !== ""` ayrımı testlerin isimlerinde ve açıklamalarında açık. |
| **B4** — Order/error response contract'ı gerçek şema doğrulaması ile test edilmiyordu | **Düzeltildi** | P5.2'nin kanonik AJV/Node-wrapper modeli yeniden kullanıldı (`scripts/run-orders-schema-validation.js`), yeni `shared/schemas/orders/order-create-response.schema.json` oluşturuldu; hata contract'ı mevcut `shared/schemas/common/error-response.schema.json` ile aynı olduğu için yeni bir hata şeması **oluşturulmadı** (gerekçe: bölüm 9). |
| Non-blocking — kullanılmayan User B bootstrap | **Düzeltildi (kaldırıldı)** | P5.5'in kendi collection'ında `userBToken` hiçbir assertion tarafından kullanılmıyordu; bootstrap request'i kaldırıldı. Ownership/cross-user P5.3'te zaten kapsanıyor. |

Uygulama business logic'inde (`orders.service.js`, `payment.service.js`,
`errorHandler.js`) **hiçbir değişiklik yapılmadı** — yalnızca test
collection'ı, yeni şema dosyaları ve yeni bir AJV wrapper script'i
eklendi/değiştirildi. Root-cause kanıtlanmış bir application bug
bulunmadı (bkz. bölüm 10).

---

## 1. İlk Uygulanan Adım — Duplicate Aggregation Gate

Diğer her şeyden önce, yalnızca Bootstrap + Gate klasörleri izole
çalıştırıldı (bu izole çalıştırma fix round'dan önce, ilk uygulamada
yapılmıştı; gate mantığı bu fix round'da değişmedi — aşağıdaki tam
suite RUN #1/#2 çıktısı bölüm 3/4'te, gate'in bu fix round'daki
**gerçek** sonucunu da içerir).

```text
❏ 0. Bootstrap
↳ Login as User A (test.active01)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 56ms]
  ✓  Status code is 200

❏ 1. Duplicate Aggregation Gate
↳ Create Order — duplicate product lines aggregate before stock check (qty 2+3=5)
  POST http://localhost:3000/api/orders [201 Created, 288B, 12ms]
  ✓  Status code is 201
  ✓  Content-Type is application/json
  ✓  Order created with PAID status

↳ Verify order_items — exactly ONE aggregated row (quantity=5), not two
  GET http://localhost:3000/api/orders/1 [200 OK, 422B, 5ms]
  ✓  Status code is 200
  ✓  Exactly one order_item row (aggregated, not duplicated)
  ✓  Aggregated quantity is 5 (2+3), not 2 or 3 separately

↳ Verify stock decreased by exactly the aggregated quantity (25 -> 20)
  GET http://localhost:3000/api/products/1 [200 OK, 329B, 4ms]
  ✓  Status code is 200
  ✓  Stock decreased by exactly 5 (25 -> 20) — no double-decrement, no bypass
```

**Gate PASS (4/4 request, 9/9 assertion — Bootstrap 1/1 + Gate 3/8; fix
round'da `Login as User B` kaldırıldığı için Bootstrap artık 1
request)** — P4.2'nin blocker B1'i
(duplicate-line stock bypass) **geri gelmemiş**: aynı `product_id`'ye
ait iki ayrı satır (`quantity:2` + `quantity:3`), `aggregateItems()`
tarafından TEK bir `product_id=1, quantity=5` girdisine toplanıyor;
stok kontrolü ve `order_items` satırı bu toplam üzerinden yapılıyor —
iki ayrı satır olarak işlenmiyor.

---

## 2. Ortam, Reset ve Test Kullanıcıları

- Sunucu: resmi `docs/RUN-INSTRUCTIONS.md` yöntemiyle (`node --watch src/server.js`).
- **Reset:** Her tam suite çalıştırmasından önce `npm run db:seed` —
  mevcut, canonical, önceden dokümante edilmiş komut (yeni bir reset
  mekanizması oluşturulmadı). Orders/Payment testleri stok gibi
  mutating state ürettiği için bu adım reproducibility için zorunludur.
- USER A: `test.active01@example.com` (synthetic/deterministic,
  `shared/test-data/auth-users.json`).
- **User B bootstrap'ı kaldırıldı** (fix round, non-blocking not) —
  ownership/cross-user P5.3'ün protected collection'ında zaten
  kapsanıyor ve P5.5'in kendi testleri `userBToken`'ı hiç kullanmıyordu.
- Komut: `cd QA-DEMO-SYSTEM/api-tests && npm run api:test:orders-payment`
  — fix round'dan itibaren bu komut **AJV/Node-wrapper** script'ini
  (`scripts/run-orders-schema-validation.js`) çalıştırır (P5.2/P5.4 ile
  aynı isimlendirme konvansiyonu); ham Newman CLI çıktısı için
  `npm run api:test:orders-payment:basic`.

## 3. Gerçek Çalıştırma Sonucu — RUN #1 (fresh `db:seed` sonrası, fix round)

```text
❏ 0. Bootstrap
↳ Login as User A (test.active01)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 56ms]
  ✓  Status code is 200

❏ 1. Duplicate Aggregation Gate
[... bkz. bölüm 1 ...]

❏ 2. Payment Outcomes
↳ Capture stock before approved payment (product 1)
  GET http://localhost:3000/api/products/1 [200 OK, 329B, 4ms]
  ✓  Status code is 200

↳ Approved payment — order PAID, stock decreases
  POST http://localhost:3000/api/orders [201 Created, 288B, 9ms]
  ✓  Status code is 201
  ✓  status PAID
  ✓  total is a number

↳ Verify stock decreased by exactly 1 after approved payment (product 1) — B1
  GET http://localhost:3000/api/products/1 [200 OK, 329B, 3ms]
  ✓  Status code is 200
  ✓  Stock decreased by exactly 1 (before=20, after=19)

↳ Capture stock before declined payment (product 3)
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 4ms]
  ✓  Status code is 200

↳ Declined payment — order created but PAYMENT_FAILED, stock NOT decremented
  POST http://localhost:3000/api/orders [201 Created, 298B, 8ms]
  ✓  Status code is 201
  ✓  status PAYMENT_FAILED (not PAID, not an HTTP error)

↳ Verify stock unchanged after declined payment (product 3) — captured before/after, not hardcoded
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 3ms]
  ✓  Status code is 200
  ✓  Stock unchanged (before=5, after=5)

↳ Capture stock before timeout payment (product 3)
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 3ms]
  ✓  Status code is 200

↳ Timeout payment — order created but PAYMENT_TIMEOUT, stock NOT decremented
  POST http://localhost:3000/api/orders [201 Created, 299B, 5ms]
  ✓  Status code is 201
  ✓  status PAYMENT_TIMEOUT (not PAID, not an HTTP error)

↳ Verify stock unchanged after timeout payment (product 3) — captured before/after, not hardcoded
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 2ms]
  ✓  Status code is 200
  ✓  Stock unchanged (before=5, after=5)

❏ 3. Stock Validation
↳ Capture stock before insufficient-stock rejection (product 3)
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 2ms]
  ✓  Status code is 200

↳ Insufficient stock — single line exceeds available (qty=6 > 5) -> 409
  POST http://localhost:3000/api/orders [409 Conflict, 284B, 4ms]
  ✓  Status code is 409
  ✓  Error body: Yetersiz stok: QA Demo Monitör

↳ Verify no partial state — stock unchanged, no order created for that attempt (API-visible only; bkz. bölüm 12 — P5.7 notu)
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 2ms]
  ✓  Status code is 200
  ✓  Stock unchanged (before=5, after=5)

↳ Capture stock before duplicate-aggregate-exceeds-stock rejection (product 3)
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 2ms]
  ✓  Status code is 200

↳ Duplicate lines aggregate to exceed stock (2+4=6 > 5) -> 409, not silently accepted
  POST http://localhost:3000/api/orders [409 Conflict, 284B, 3ms]
  ✓  Status code is 409
  ✓  Error body: Yetersiz stok: QA Demo Monitör

↳ Verify stock still untouched after duplicate-aggregate rejection — captured before/after, not hardcoded
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 2ms]
  ✓  Status code is 200
  ✓  Stock unchanged (before=5, after=5)

❏ 4. Quantity Validation
↳ Invalid quantity — zero (0) -> 400 "quantity pozitif bir tam sayı olmalıdır."
↳ Invalid quantity — negative (-1) -> 400 (aynı mesaj)
↳ Invalid quantity — decimal (1.5) -> 400 (aynı mesaj)
↳ [before/after capture] Invalid quantity — string ("2") -> 400 (aynı mesaj, coercion yok)
  — Stock unchanged (before=19, after=19) — B2 representative regression-risk input
↳ [before/after capture] Invalid quantity — boolean (true) -> 400 (aynı mesaj, coercion yok)
  — Stock unchanged (before=19, after=19) — B2 representative regression-risk input
↳ [before/after capture] Invalid quantity — array ([2]) -> 400 (aynı mesaj, coercion yok)
  — Stock unchanged (before=19, after=19) — B2 representative regression-risk input
↳ [before/after capture] Invalid quantity — null -> 400 (aynı mesaj)
  — Stock unchanged (before=19, after=19) — B2 representative regression-risk input
↳ Invalid quantity — missing field -> 400 (aynı mesaj)
↳ Invalid quantity — very large (99999999) -> 409 "Yetersiz stok: QA Demo Klavye"
  (format-valid, format hatası değil stok hatası — kod akışından çıkarıldı)
  — 17/17 request, 30/30 assertion, hepsi PASS

❏ 5. Product Validation
↳ Unknown product_id (99999) -> 400 "Ürün bulunamadı: 99999" (404 DEĞİL)
↳ product_id wrong type (string "1") -> 400 "product_id pozitif bir tam sayı olmalıdır."
↳ product_id null -> 400 (aynı mesaj)
↳ product_id missing -> 400 (aynı mesaj)
↳ [before/after capture] Mixed valid + invalid product in one request -> 400, all-or-nothing (B2 atomicity testi — YENİ)
  GET/POST/GET: Stock unchanged (before=19, after=19) — product 1'in geçerli satırı, product 99999'un
  bilinmezliği yüzünden KISMEN dahi işlenmedi; transaction hiç BEGIN edilmeden reddedildi
  — 7/7 request, 13/13 assertion, hepsi PASS

❏ 6. Items Validation
↳ items missing entirely -> 400 "En az bir ürün gereklidir."
↳ items null -> 400 (aynı mesaj)
↳ items empty array -> 400 (aynı mesaj)
↳ items wrong type (string) -> 400 (aynı mesaj)
↳ item entry invalid (null item) -> 400 "Geçersiz ürün girdisi." (500 DEĞİL)
  — 5/5 request, 10/10 assertion, hepsi PASS

❏ 7. Payment Token Validation
↳ [before/after capture] payment_token omitted -> 201, PAID (yalnızca gerçek omit default alır)
  — Stock decreased by exactly 1 (before=19, after=18) — canonical default, false/0/null/empty'den AYRI
↳ payment_token null -> 400 "payment_token gönderilmişse geçerli, boş olmayan bir metin olmalıdır."
↳ payment_token empty string -> 400 (aynı mesaj, sessizce default'a dönmüyor)
↳ payment_token wrong type (number) -> 400 (aynı mesaj)
↳ [before/after capture] payment_token false -> 400 (aynı mesaj) — B3 YENİ
  — Stock unchanged (before=18, after=18) — sessizce approved'a düşmüyor
↳ [before/after capture] payment_token 0 -> 400 (aynı mesaj) — B3 YENİ
  — Stock unchanged (before=18, after=18) — sessizce approved'a düşmüyor
↳ payment_token unknown string (RANDOM-TOKEN-999) -> 400 "Bilinmeyen test payment token: RANDOM-TOKEN-999" (FARKLI mesaj)
  — 13/13 request, 23/23 assertion, hepsi PASS

❏ 8. Malformed JSON
↳ Malformed JSON body -> 400 "Geçersiz JSON gövdesi" (500 DEĞİL)
  — 1/1 request, 2/2 assertion, PASS

❏ 9. Auth Regression (POST /api/orders)
↳ No token -> 401 "Yetkilendirme gerekli" (+ Content-Type assertion)
↳ Invalid token -> 401 "Geçersiz veya süresi dolmuş oturum"
  — 2/2 request, 5/5 assertion, hepsi PASS

--- P5.5 AJV / Header Validation Results (Orders & Payment) ---
PASS  Approved payment — order PAID, stock decreases — schema + Content-Type PASS
PASS  Declined payment — order created but PAYMENT_FAILED, stock NOT decremented — schema + Content-Type PASS
PASS  Timeout payment — order created but PAYMENT_TIMEOUT, stock NOT decremented — schema + Content-Type PASS
PASS  Insufficient stock — single line exceeds available (qty=6 > 5) -> 409 — schema + Content-Type PASS
PASS  Invalid quantity — zero (0) — schema + Content-Type PASS
PASS  No token -> 401 (representative gate; full auth matrix already in P5.3) — schema + Content-Type PASS

Newman functional assertions (status code, from pm.test): PASS
AJV schema + Content-Type validations: PASS

P5.5 schema validation run: PASS

┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │              64 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │              64 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               0 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │             118 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 1202ms                                  │
├─────────────────────────────────────────────────────────────┤
│ total data received: 4.73kB (approx)                        │
├─────────────────────────────────────────────────────────────┤
│ average response time: 3ms [min: 1ms, max: 56ms, s.d.: 6ms] │
└─────────────────────────────────────────────────────────────┘
```

**RUN #1 sonucu: 64/64 request PASS, 118/118 assertion PASS, 0 failure**
(Newman functional assertions + 6/6 AJV schema/Content-Type doğrulaması
PASS). Eski (40/82) sayılar bu fix round ile **geçersiz** — yeni before/after
stok proof request'leri ve `false`/`0` payment_token case'leri eklendiği
için gerçek sayı arttı; hiçbir test sayı şişirmek için eklenmedi (her
yeni request Codex'in B1/B2/B3 bulgularından birine doğrudan karşılık
gelir).

## 4. Repeatability — RUN #2 (fresh `db:seed` reset sonrası, ikinci kez, fix round)

Aynı komut (`npm run api:test:orders-payment`), `npm run db:seed` ile
stoklar sıfırlandıktan sonra **tekrar** çalıştırıldı — manuel müdahale
yok:

```text
--- P5.5 AJV / Header Validation Results (Orders & Payment) ---
PASS  Approved payment — order PAID, stock decreases — schema + Content-Type PASS
PASS  Declined payment — order created but PAYMENT_FAILED, stock NOT decremented — schema + Content-Type PASS
PASS  Timeout payment — order created but PAYMENT_TIMEOUT, stock NOT decremented — schema + Content-Type PASS
PASS  Insufficient stock — single line exceeds available (qty=6 > 5) -> 409 — schema + Content-Type PASS
PASS  Invalid quantity — zero (0) — schema + Content-Type PASS
PASS  No token -> 401 (representative gate; full auth matrix already in P5.3) — schema + Content-Type PASS

Newman functional assertions (status code, from pm.test): PASS
AJV schema + Content-Type validations: PASS

P5.5 schema validation run: PASS

┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │              64 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │              64 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               0 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │             118 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 1122ms                                  │
├─────────────────────────────────────────────────────────────┤
│ total data received: 4.73kB (approx)                        │
├─────────────────────────────────────────────────────────────┤
│ average response time: 3ms [min: 2ms, max: 33ms, s.d.: 4ms] │
└─────────────────────────────────────────────────────────────┘
```

**RUN #2 sonucu: 64/64 request PASS, 118/118 assertion PASS, 0 failure —
RUN #1 ile birebir aynı sayılar.** Ayrıca tüm computed before/after stok
değerleri de RUN #1 ile birebir aynı çıktı (her iki run'da da: gate
25→20, approved 20→19, declined/timeout 5→5, insufficient/duplicate-
aggregate 5→5, quantity-matrix representative case'leri 19→19,
atomicity testi 19→19, payment_token omitted 19→18, false/0 18→18) —
deterministic/reproducible, manuel müdahale gerekmedi.

---

## 5. Business Invariant Sonuçları

Her satırda **API-visible olarak gerçek assertion ile ölçülen** sonuç
belirtilir; DB'ye doğrudan erişim gerektiren hiçbir iddia burada
yapılmaz (bkz. bölüm 12).

| Invariant | Sonuç | Nasıl ölçüldü (API-visible) |
|---|---|---|
| A) Successful paid order: stock exactly once decreases | **PASS** | Gate: gerçek before/after GET, 25→20 (aggregate qty=5). Payment Outcomes: gerçek before/after GET, 20→19 (approved, qty=1) — B1, runtime'da hesaplanmış, hardcoded değil |
| B) Declined payment: stock tüketilmiyor | **PASS** | Gerçek before/after GET, id=3: 5→5 |
| C) Timeout: stock tüketilmiyor | **PASS** | Gerçek before/after GET, id=3: 5→5 |
| D) Invalid request: stock değişmiyor (temsili) | **PASS** | Insufficient-stock (5→5), duplicate-aggregate-exceeds-stock (5→5), regresyon riski taşıyan quantity `"2"`/`true`/`[2]`/`null` (19→19), payment_token `false`/`0` (18→18) — hepsi gerçek before/after GET ile |
| E) Unknown product: partial order oluşmuyor (atomicity) | **PASS (API-visible)** | YENİ atomicity testi: `{product 1 (geçerli), product 99999 (yok)}` -> 400; product 1'in stoğu before/after GET ile **değişmediği** kanıtlandı — geçerli satır bile kısmen işlenmedi. DB'de order/order_items satırının hiç yazılmadığı iddiası doğrudan SQL gerektirir — **P5.7'ye bırakıldı**, burada iddia edilmedi |
| F) Duplicate line: aggregate quantity üzerinden stock check | **PASS** | Gate (5 içeride, aggregate kabul) ve Stock Validation (6>5 dışarıda, aggregate red + stok değişmedi) senaryolarının ikisinde de gerçek assertion |
| G) Failed order: sonraki valid order'ı bozmuyor | **PASS** | Declined/timeout/rejected denemelerden sonraki approved order'lar (payment_token omitted case'i, Payment Outcomes/Stock Validation'dan sonra) sorunsuz 201/PAID döndü ve stoğu doğru şekilde azalttı |

**API-visible vs DB-direct ayrımı (B2 gereği açıkça belirtilir):** Bu
pakette "stok değişmedi" ve "order/order_items DB'de görünmüyor" iki
FARKLI iddiadır. Birincisi `GET /api/products/:id` ile doğrudan API
üzerinden ölçülür ve bu pakette **DOĞRULANDI**. İkincisi (bir order
satırının DB'de hiç var olmadığının doğrudan SQL ile kanıtlanması) bu
paketin kapsamı dışındadır ve **P5.7 — API→DB Validation'a
bırakılmıştır**; bu evidence dosyası o iddiayı hiçbir yerde yapmaz.

## 6. Header Validation Sonucu

CURRENT header standardı (`api-tests/README.md`) — `Content-Type` —
Newman collection'ında **2 temsili request** üzerinde `pm.test()` ile
doğrulanıyor (P5.3'ün aynı "temsili, tüm request'lerde değil"
yaklaşımı): gate'in başarılı `POST /api/orders` request'i (`201`) ve
Auth Regression'ın `no-token` request'i (`401`). Fix round'da (B4)
buna ek olarak **AJV wrapper script'i** (`run-orders-schema-validation.js`)
6 request üzerinde `Content-Type: application/json; charset=utf-8`
header'ını **ayrıca, bağımsız olarak** doğruluyor (bkz. bölüm 9) —
bu, header validation'ın artık hem temsili pm.test hem de gerçek AJV
katmanında kanıtlandığı anlamına gelir. `Authorization` header'ı zaten
her ilgili request'te gerçekten gönderiliyor (`{{userToken}}` veya
bilerek gönderilmiyor). CORS/security header'ları — sistem bugün
üretmediği için — zorunlu tutulmadı (FUTURE HARDENING).

## 7. Token Güvenlik Hijyeni

- `userToken`, `Login` request'inin `pm.test()` script'i tarafından
  runtime'da `pm.collectionVariables.set(...)` ile yakalanır — manuel
  kopyalama yok.
- Collection JSON'ında yalnızca `{{userToken}}` template referansı
  var, gerçek token değeri yok (secret scan ile doğrulandı, bkz.
  Türkçe rapor madde 22).
- `postman/environments/local.postman_environment.json` **değişmedi**.
- Bu evidence dosyasında ve konsol çıktısında gerçek token değeri
  hiçbir yerde yazılı değildir.

## 8. Ownership / Order Retrieval — P5.3 ile Overlap Kararı

P5.3'ün protected collection'ı (`qa-demo-system-protected.postman_collection.json`)
zaten şunları kapsıyor: owner erişimi (`200`), cross-user erişimi
(`404`, IDOR-bilinçli), no-token/invalid-token erişimi, bilinmeyen
order (`404`). P5.5 bunları **duplike etmedi** — yalnızca
`POST /api/orders`'a özgü, P5.3'te test edilmemiş minimal bir auth
regression gate'i (no-token, invalid-token — collection'ın "9. Auth
Regression" klasörü) eklendi. Fix round'da (non-blocking not) bu
kararın önkoşulu olan `userBToken` bootstrap'ı da — hiç kullanılmadığı
için — kaldırıldı; P5.5'in artık ownership/cross-user testine hiçbir
şekilde ihtiyacı yok, dolayısıyla User B'ye de ihtiyacı yok.

## 9. Schema Kararı (Fix Round'da DEĞİŞTİ — B4)

**Önceki karar (9cac4cc'a kadar, artık geçersiz):** Bu koleksiyon
P5.3'ün protected collection'ıyla aynı mimari kararı izliyordu — plain
`pm.test()` assertion'ları, AJV yok. Codex delta review (B4) bu kararı
P5.5 için **açıkça geçersiz kıldı**: response contract'ının (özellikle
`{order:{id,status,total}}`'ın `status` enum'unun ve `additionalProperties`
kısıtının) gerçek, strict bir şema ile doğrulanması gerekiyor.

**Yeni karar (bu fix round):** P5.1/P5.2/P5.4'ün PUBLIC collection'ında
kurulan kanonik AJV/Node-wrapper modeli yeniden kullanıldı — yeni bir
validation framework icat edilmedi:

- `shared/schemas/orders/order-create-response.schema.json` (YENİ) —
  `POST /api/orders`'ın 201 response'u (`{order:{id:integer,
  status:enum[PAID,PAYMENT_FAILED,PAYMENT_TIMEOUT], total:number}}`,
  `required` tüm alanlar, `additionalProperties:false`, null hiçbir
  alanda kabul edilmiyor — kaynak: `orders.routes.js` +
  `orders.service.js` `STATUS_BY_PAYMENT_RESULT`).
- **Ayrı bir hata şeması oluşturulmadı.** Kaynak koddan doğrulandı:
  `orders.routes.js`'in tüm hata yolları (`400`, `401`, `409`) aynı
  `res.status(result.status).json({ error: result.message })`
  şeklini kullanıyor — bu, P5.2'de zaten kanıtlanmış olan
  `shared/schemas/common/error-response.schema.json` (`{error:string}`)
  ile **birebir aynı contract**. Codex'in "yalnızca gerçekten farklıysa
  ayrı şema oluştur" talimatı gereği, burada gereksiz bir duplicate
  şema yaratılmadı — mevcut reusable şema 3 farklı status kodunda
  (400/409/401) yeniden kullanılarak doğrulandı.
- `scripts/run-orders-schema-validation.js` (YENİ) — P5.2'nin
  `run-schema-validation.js`'ini birebir mimari olarak taklit eder:
  Newman'ın Node API'si (`newman.run()`, `'request'` event) ile gerçek
  bir Node process içinde, pinned `ajv@^8.20.0` (`strict:true,
  allErrors:true`, `coerceTypes`/`useDefaults`/`removeAdditional`
  **YOK**) kullanarak, canonical `shared/schemas/**/*.schema.json`
  dosyalarını doğrudan `require()` ile okur. 6 request doğrulanır:
  approved/declined/timeout order response'ları (aynı şema, 3 farklı
  `status` enum değeri — enum'un gerçekten test edildiğini kanıtlar)
  ve 3 farklı status kodundaki (400/409/401) hata response'u (aynı
  ortak şemanın gerçekten status kodundan bağımsız geçerli olduğunu
  kanıtlar).
- `package.json`'da `api:test:orders-payment` artık bu wrapper'ı
  çalıştırır (PUBLIC collection'ın `api:test:postman` konvansiyonuyla
  tutarlı); ham Newman CLI çıktısı `api:test:orders-payment:basic` ile
  alınabilir.

Bu fix round'un gerçek çalıştırma sonucu: **RUN #1 ve RUN #2'de 6/6 AJV
schema + Content-Type doğrulaması PASS** (bkz. bölüm 3 ve 4).

---

## 10. Bulunan Bug'lar

**Application bug: YOK.** P4.2'nin geçmiş blocker'larının (B1
duplicate-line bypass, B3 quantity coercion) hiçbiri geri gelmedi; ne
declined/timeout stok tüketiyor, ne malformed JSON 500 üretiyor, ne de
unknown product/quantity/items/payment-token girdileri partial/corrupt
state bırakıyor. `payment_token: false` ve `payment_token: 0` da
(B3'ün asıl regresyon endişesi) `resolvePaymentToken()`'ın
`typeof paymentToken !== 'string'` kontrolü sayesinde doğru şekilde
reddediliyor — sessizce approved'a düşmüyor.

**Test/schema/documentation bug: YOK** — Codex'in delta review'i
gerçek eksiklikler buldu (B1-B4), ama bunlar test/evidence'ın
kendisindeki eksik kanıt/dokümantasyon sorunlarıydı, uygulanan
business logic'te bir hata değildi. Bu fix round bu eksiklikleri
kapattı.

**Düzeltilen bug: Yok (application kodunda düzeltilecek bir şey
bulunmadı — yalnızca test/evidence eksiklikleri düzeltildi).**

---

## 11. Sonuç

**PASS (fix round sonrası)** — Orders & Payment business API'si
(duplicate aggregation, stock sufficient/insufficient, quantity/
product/items strict validation, approved/declined/timeout payment
outcomes — artık gerçek before/after stok kanıtıyla, payment_token
contract'ı — artık `false`/`0` dahil, order/error response contract'ı
— artık gerçek AJV şema doğrulamasıyla, malformed JSON, minimal auth
regression) kapsamlı şekilde doğrulandı; 2 ayrı temiz-reset
execution'da birebir aynı sonuç (64/64 request, 118/118 assertion,
6/6 AJV schema+Content-Type doğrulaması); hiçbir application bug'ı
bulunmadı; P5.3 ile ownership konusunda duplicate test üretilmedi
(kullanılmayan User B bootstrap'ı da kaldırıldı).

## 12. Bilinen Sınırlamalar (Bu Paket Kapsamında)

- **API→DB doğrudan SQL assertion'ı yok.** Bu paketteki TÜM stok
  before/after kanıtları yalnızca public `GET /api/products/:id`
  response'u üzerinden yapıldı — bu API-visible bir kanıttır, DB
  satırının varlığı/yokluğu/içeriği hakkında doğrudan bir iddia
  DEĞİLDİR. Özellikle: "bilinmeyen/geçersiz istekte order/order_items
  DB'de hiç yazılmadı" iddiası bu pakette YAPILMAMIŞTIR — yalnızca
  "ilgili ürünün API-visible stoğu değişmedi" kanıtlanmıştır. DB satırı
  seviyesindeki doğrudan doğrulama **P5.7 — API→DB Validation**'ın
  kapsamıdır.
- Notifications'ın business akışı (declined/timeout'ta notification
  üretilmemesi vb.) bu pakette test edilmedi — P5.6'nın işi.
- Ownership/order-retrieval P5.3'te zaten kapsandığı için burada
  duplike edilmedi (bkz. bölüm 8).
- Newman'ın kendi transitive dependency ağacında (P5.1'den devralınan,
  bilinen, non-blocking) `npm audit` uyarıları hâlâ mevcut.
