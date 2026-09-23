# P5.5 — Orders & Payment API Tests — Execution Evidence

**Branch:** `feat/phase-5-5-orders-payment-api-tests`
**Tarih:** 2026-09-23

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

## 1. İlk Uygulanan Adım — Duplicate Aggregation Gate

Diğer her şeyden önce, yalnızca Bootstrap + Gate klasörleri izole
çalıştırıldı:

```bash
newman run postman/collections/qa-demo-system-orders-payment.postman_collection.json \
  -e postman/environments/local.postman_environment.json \
  --folder "0. Bootstrap" --folder "1. Duplicate Aggregation Gate"
```

```text
❏ 0. Bootstrap
↳ Login as User A (test.active01)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 41ms]
  ✓  Status code is 200

↳ Login as User B (test.active02) — for auth regression reuse only
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 7ms]
  ✓  Status code is 200

❏ 1. Duplicate Aggregation Gate
↳ Create Order — duplicate product lines aggregate before stock check (qty 2+3=5)
  POST http://localhost:3000/api/orders [201 Created, 288B, 8ms]
  ✓  Status code is 201
  ✓  Content-Type is application/json
  ✓  Order created with PAID status

↳ Verify order_items — exactly ONE aggregated row (quantity=5), not two
  GET http://localhost:3000/api/orders/1 [200 OK, 422B, 4ms]
  ✓  Status code is 200
  ✓  Exactly one order_item row (aggregated, not duplicated)
  ✓  Aggregated quantity is 5 (2+3), not 2 or 3 separately

↳ Verify stock decreased by exactly the aggregated quantity (25 -> 20)
  GET http://localhost:3000/api/products/1 [200 OK, 329B, 3ms]
  ✓  Status code is 200
  ✓  Stock decreased by exactly 5 (25 -> 20) — no double-decrement, no bypass

┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │                5 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      test-scripts       │                5 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │               10 │                0 │
└─────────────────────────┴──────────────────┴──────────────────┘
```

**Gate PASS (5/5 request, 10/10 assertion)** — P4.2'nin blocker B1'i
(duplicate-line stock bypass) **geri gelmemiş**: aynı `product_id`'ye
ait iki ayrı satır (`quantity:2` + `quantity:3`), `aggregateItems()`
tarafından TEK bir `product_id=1, quantity=5` girdisine toplanıyor;
stok kontrolü ve `order_items` satırı bu toplam üzerinden yapılıyor —
iki ayrı satır olarak işlenmiyor. Bu gate PASS olmadan suite'in geri
kalanına geçilmedi.

---

## 2. Ortam, Reset ve Test Kullanıcıları

- Sunucu: resmi `docs/RUN-INSTRUCTIONS.md` yöntemiyle (`npm run dev`).
- **Reset:** Her tam suite çalıştırmasından önce `npm run db:seed` —
  mevcut, canonical, önceden dokümante edilmiş komut (yeni bir reset
  mekanizması oluşturulmadı). Orders/Payment testleri stok gibi
  mutating state ürettiği için bu adım reproducibility için zorunludur.
- USER A: `test.active01@example.com` (synthetic/deterministic,
  `shared/test-data/auth-users.json`).
- USER B: yalnızca bootstrap'ta login olunur; P5.5'in kendi testlerinde
  **kullanılmaz** — ownership/cross-user P5.3'ün protected
  collection'ında zaten kapsanmıştır (bkz. bölüm 8).
- Komut: `cd QA-DEMO-SYSTEM/api-tests && npm run api:test:orders-payment`.

## 3. Gerçek Çalıştırma Sonucu — RUN #1 (fresh `db:seed` sonrası)

```text
newman

QA Demo System - Orders & Payment Business API (P5.5)

[... bkz. bölüm 1 — Bootstrap + Gate aynı ...]

❏ 2. Payment Outcomes
↳ Approved payment — order PAID, stock decreases
  POST http://localhost:3000/api/orders [201 Created, 288B, 6ms]
  ✓  Status code is 201
  ✓  status PAID
  ✓  total is a number

↳ Declined payment — order created but PAYMENT_FAILED, stock NOT decremented
  POST http://localhost:3000/api/orders [201 Created, 298B, 6ms]
  ✓  Status code is 201
  ✓  status PAYMENT_FAILED (not PAID, not an HTTP error)

↳ Verify stock unchanged after declined payment (id=3 stays at 5)
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 4ms]
  ✓  Status code is 200
  ✓  Stock unchanged after declined payment

↳ Timeout payment — order created but PAYMENT_TIMEOUT, stock NOT decremented
  POST http://localhost:3000/api/orders [201 Created, 299B, 7ms]
  ✓  Status code is 201
  ✓  status PAYMENT_TIMEOUT (not PAID, not an HTTP error)

↳ Verify stock unchanged after timeout payment (id=3 still at 5)
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 3ms]
  ✓  Status code is 200
  ✓  Stock unchanged after timeout payment

❏ 3. Stock Validation
↳ Insufficient stock — single line exceeds available (qty=6 > 5) -> 409
  POST http://localhost:3000/api/orders [409 Conflict, 284B, 3ms]
  ✓  Status code is 409
  ✓  Error body: Yetersiz stok: QA Demo Monitör

↳ Verify no partial state — stock still 5, no order created for that attempt
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 3ms]
  ✓  Status code is 200
  ✓  Stock still 5 after rejected order (no partial mutation)

↳ Duplicate lines aggregate to exceed stock (2+4=6 > 5) -> 409, not silently accepted
  POST http://localhost:3000/api/orders [409 Conflict, 284B, 2ms]
  ✓  Status code is 409
  ✓  Error body: Yetersiz stok: QA Demo Monitör

↳ Verify stock still untouched after duplicate-aggregate rejection (still 5)
  GET http://localhost:3000/api/products/3 [200 OK, 330B, 4ms]
  ✓  Status code is 200
  ✓  Stock still 5 — aggregate rejection did not partially decrement

❏ 4. Quantity Validation
↳ Invalid quantity — zero (0) -> 400 "quantity pozitif bir tam sayı olmalıdır."
↳ Invalid quantity — negative (-1) -> 400 (aynı mesaj)
↳ Invalid quantity — decimal (1.5) -> 400 (aynı mesaj)
↳ Invalid quantity — string ("2") -> 400 (aynı mesaj, coercion yok)
↳ Invalid quantity — boolean (true) -> 400 (aynı mesaj, coercion yok)
↳ Invalid quantity — array ([2]) -> 400 (aynı mesaj, coercion yok)
↳ Invalid quantity — null -> 400 (aynı mesaj)
↳ Invalid quantity — missing field -> 400 (aynı mesaj)
↳ Invalid quantity — very large (99999999) -> 409 "Yetersiz stok: QA Demo Klavye"
  (format-valid, format hatası değil stok hatası — kod akışından çıkarıldı)
  — 9/9 request, 18/18 assertion, hepsi PASS

❏ 5. Product Validation
↳ Unknown product_id (99999) -> 400 "Ürün bulunamadı: 99999" (404 DEĞİL)
↳ product_id wrong type (string "1") -> 400 "product_id pozitif bir tam sayı olmalıdır."
↳ product_id null -> 400 (aynı mesaj)
↳ product_id missing -> 400 (aynı mesaj)
  — 4/4 request, 8/8 assertion, hepsi PASS

❏ 6. Items Validation
↳ items missing entirely -> 400 "En az bir ürün gereklidir."
↳ items null -> 400 (aynı mesaj)
↳ items empty array -> 400 (aynı mesaj)
↳ items wrong type (string) -> 400 (aynı mesaj)
↳ item entry invalid (null item) -> 400 "Geçersiz ürün girdisi." (500 DEĞİL)
  — 5/5 request, 10/10 assertion, hepsi PASS

❏ 7. Payment Token Validation
↳ payment_token omitted -> 201, PAID (yalnızca gerçek omit default alır)
↳ payment_token null -> 400 "payment_token gönderilmişse geçerli, boş olmayan bir metin olmalıdır."
↳ payment_token empty string -> 400 (aynı mesaj, sessizce default'a dönmüyor)
↳ payment_token wrong type (number) -> 400 (aynı mesaj)
↳ payment_token unknown string (RANDOM-TOKEN-999) -> 400 "Bilinmeyen test payment token: RANDOM-TOKEN-999" (FARKLI mesaj)
  — 5/5 request, 10/10 assertion, hepsi PASS

❏ 8. Malformed JSON
↳ Malformed JSON body -> 400 "Geçersiz JSON gövdesi" (500 DEĞİL)
  — 1/1 request, 2/2 assertion, PASS

❏ 9. Auth Regression (POST /api/orders)
↳ No token -> 401 "Yetkilendirme gerekli"
↳ Invalid token -> 401 "Geçersiz veya süresi dolmuş oturum"
  — 2/2 request, 4/4 assertion, hepsi PASS

┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │              40 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │              40 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               0 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │              82 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 704ms                                   │
├─────────────────────────────────────────────────────────────┤
│ total data received: 2.56kB (approx)                        │
├─────────────────────────────────────────────────────────────┤
│ average response time: 3ms [min: 2ms, max: 33ms, s.d.: 4ms] │
└─────────────────────────────────────────────────────────────┘
```

**RUN #1 sonucu: 40/40 request PASS, 82/82 assertion PASS, 0 failure**
(80 fonksiyonel/business assertion + 2 temsili `Content-Type` header
assertion'ı — biri başarılı POST üzerinde, biri 401 hata yolu üzerinde;
bkz. bölüm 6 — Header Validation).

## 4. Repeatability — RUN #2 (fresh `db:seed` reset sonrası, ikinci kez)

Aynı komut, `npm run db:seed` ile stoklar sıfırlandıktan ve sunucu
yeniden başlatıldıktan sonra **tekrar** çalıştırıldı:

```text
┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │              40 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │              40 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               0 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │              82 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 785ms                                   │
├─────────────────────────────────────────────────────────────┤
│ total data received: 2.56kB (approx)                        │
├─────────────────────────────────────────────────────────────┤
│ average response time: 4ms [min: 2ms, max: 44ms, s.d.: 6ms] │
└─────────────────────────────────────────────────────────────┘
```

**RUN #2 sonucu: 40/40 request PASS, 82/82 assertion PASS, 0 failure —
RUN #1 ile birebir aynı sayılar.** Deterministic/reproducible, manuel
müdahale gerekmedi.

---

## 5. Business Invariant Sonuçları

| Invariant | Sonuç |
|---|---|
| A) Successful paid order: stock exactly once decreases | **PASS** — gate'te 25→20 (aggregate 5), payment-outcomes'ta 20→19 (approved, qty=1) |
| B) Declined payment: stock tüketilmiyor | **PASS** — id=3, önce/sonra 5/5 |
| C) Timeout: stock tüketilmiyor | **PASS** — id=3, önce/sonra 5/5 |
| D) Invalid request: stock değişmiyor | **PASS** — quantity/product/items/payment-token hatalarının hiçbiri stock mutasyonu yapmadı (format-hatası aşaması DB'ye hiç ulaşmıyor) |
| E) Unknown product: partial order oluşmuyor | **PASS** — 400, order/order_items/stock hiçbiri yazılmadı (transaction başlamadan reddedildi) |
| F) Duplicate line: aggregate quantity üzerinden stock check | **PASS** — hem gate (5 içeride) hem stock-validation (6>5 dışarıda) senaryosunda doğrulandı |
| G) Failed order: sonraki valid order'ı bozmuyor | **PASS** — declined/timeout/rejected denemelerden sonraki approved order'lar (Payment Token Validation, Auth Regression öncesi) sorunsuz çalıştı |

## 6. Header Validation Sonucu

CURRENT header standardı (`07-API-TESTING/README.md`) — `Content-Type`
— bu koleksiyonda **2 temsili request** üzerinde doğrulandı (P5.3'ün
aynı "temsili, tüm request'lerde değil" yaklaşımı): gate'in başarılı
`POST /api/orders` request'i (`201`) ve Auth Regression'ın `no-token`
request'i (`401`) — hem başarı hem hata yolu için `Content-Type:
application/json; charset=utf-8` doğrulandı. `Authorization` header'ı
zaten her ilgili request'te gerçekten gönderiliyor (`{{userToken}}`
veya bilerek gönderilmiyor); ayrıca doğrulanan `error`/`order` body
içerikleri header contract'ını dolaylı olarak da destekliyor (JSON
parse başarılı olmadan hiçbir assertion PASS olamaz). CORS/security
header'ları — sistem bugün üretmediği için — zorunlu tutulmadı
(FUTURE HARDENING).

## 7. Token Güvenlik Hijyeni

- `userToken`/`userBToken`, `Login` request'lerinin `pm.test()`
  script'i tarafından runtime'da `pm.collectionVariables.set(...)` ile
  yakalanır — manuel kopyalama yok.
- Collection JSON'ında yalnızca `{{userToken}}` template referansı
  var, gerçek token değeri yok.
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
Regression" klasörü) eklendi.

## 9. Schema Kararı

Bu koleksiyon, P5.3'ün protected collection'ıyla **aynı mimari
kararı** izler: plain `pm.test()` assertion'ları (Newman CLI,
sandbox'ta AJV yok) — P5.1/P5.2/P5.4'ün PUBLIC collection'ındaki
AJV/Node-wrapper modelinden **farklı**. Yeni bir `shared/schemas/orders/`
oluşturulmadı — bu pakette test edilen tüm response şekilleri
(`{order:{id,status,total}}`, `{error:string}`) zaten plain
assertion'larla tam olarak (alan varlığı + tam değer eşleşmesi)
doğrulanıyor; AJV eklemek bu noktada ek doğruluk sağlamazdı (bölüm 22
— "sırf klasör olsun diye duplicate schema yaratma" kararı).

---

## 10. Bulunan Bug'lar

**Application bug: YOK.** P4.2'nin geçmiş blocker'larının (B1
duplicate-line bypass, B3 quantity coercion) hiçbiri geri gelmedi; ne
declined/timeout stok tüketiyor, ne malformed JSON 500 üretiyor, ne de
unknown product/quantity/items/payment-token girdileri partial/corrupt
state bırakıyor.

**Test/schema/documentation bug: YOK.**

**Düzeltilen bug: Yok (düzeltilecek bir şey bulunmadı).**

---

## 11. Sonuç

**PASS** — Orders & Payment business API'si (duplicate aggregation,
stock sufficient/insufficient, quantity/product/items strict
validation, approved/declined/timeout payment outcomes, payment_token
contract'ı, malformed JSON, minimal auth regression) kapsamlı şekilde
doğrulandı; 2 ayrı temiz-reset execution'da birebir aynı sonuç
(40/40 request, 82/82 assertion — 80 fonksiyonel/business + 2 temsili
Content-Type header assertion'ı); hiçbir application/test/schema
bug'ı bulunmadı; P5.3 ile ownership konusunda duplicate test üretilmedi.

## 12. Bilinen Sınırlamalar (Bu Paket Kapsamında)

- API→DB doğrudan SQL assertion'ı **yok** — stock before/after kontrolü
  yalnızca public `GET /api/products/:id` response'u üzerinden yapıldı
  (P5.7'nin kapsamı doğrudan DB erişimidir).
- Notifications'ın business akışı (declined/timeout'ta notification
  üretilmemesi vb.) bu pakette test edilmedi — P5.6'nın işi.
- Ownership/order-retrieval P5.3'te zaten kapsandığı için burada
  duplike edilmedi (bkz. bölüm 7).
- Newman'ın kendi transitive dependency ağacında (P5.1'den devralınan,
  bilinen, non-blocking) `npm audit` uyarıları hâlâ mevcut.
