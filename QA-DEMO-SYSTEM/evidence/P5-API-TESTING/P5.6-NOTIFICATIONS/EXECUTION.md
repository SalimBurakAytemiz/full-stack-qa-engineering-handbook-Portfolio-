# P5.6 — Notifications API Tests — Execution Evidence

**Branch:** `feat/phase-5-6-notifications-api-tests`
**Tarih:** 2026-09-23

> Bu kayıt, aşağıdaki Newman run'larının **gerçekten çalıştırılmış**
> sonucudur (`CONTRIBUTING.md` — Evidence Integrity). Hiçbir sonuç
> tahmin edilmemiş veya kurgulanmamıştır. Bu dosya kendi commit
> hash'ine self-reference edemez (P5.4/P5.5'te açıklanan aynı
> matematiksel kısıt) — kesin hash bu paketi kapatan Türkçe rapor'da
> ve `git log --oneline -1 feat/phase-5-6-notifications-api-tests`
> çıktısında belirtilir.

---

## 0. Gerçek Notifications API Inventory (Kaynak Koddan)

Kaynak kod tekrar doğrulandı (`backend/src/routes/notifications.routes.js`,
`backend/src/services/notifications.service.js`,
`backend/src/database/schema.js`). Sistemde **yalnızca tek bir gerçek
endpoint** vardır:

| Method | Path | Auth | Side effect |
|---|---|---|---|
| GET | `/api/notifications` | `requireAuth` (Bearer token) | Yok — yalnızca `req.userId`'ye ait notification'ları döner |

**Var olmayan, dolayısıyla bu pakette test EDİLMEYEN endpoint'ler:**
- Mark-as-read (`PATCH`/`POST /api/notifications/:id/read` veya
  eşdeğeri) — kaynak kodda **yoktur**. `is_read` her zaman `0` olarak
  set edilir (`notifications.service.js`
  `createNotificationFromOrderPaidEvent()`), hiçbir yerde `1`'e
  güncellenmez.
- Notification detail/id-bazlı endpoint (`GET /api/notifications/:id`) —
  **yoktur**.

Bu iki özellik **icat edilmedi**; NOT IMPLEMENTED / OUT OF SCOPE olarak
işaretlenmiştir (bkz. bölüm 8).

**Gerçek response contract'ı** (`GET /api/notifications`, 200):
```json
{ "notifications": [ { "id": 1, "type": "order.paid", "message": "Order #1 payment approved.", "order_id": 1, "is_read": 0, "created_at": "2026-09-23 13:30:59" } ] }
```
Ampirik olarak `curl` ile doğrulandı — kritik, tahmin edilmeyen bulgular:
- `is_read` gerçek çalıştırmada **INTEGER `0`** döner, **boolean `false`
  DEĞİL** (schema.js: `is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read
  IN (0, 1))`). Şema ve assertion'lar buna göre `0`/`1` integer olarak
  yazıldı, `true`/`false` değil.
- `user_id` alanı response'da **YOKTUR** — `listNotificationsForUser()`
  sorgusu onu seçmez. Bu, ownership/leakage riskini yapısal olarak
  azaltır (leaked bir notification'ın `user_id`'sini response'dan
  okumak zaten mümkün değildir) — testler bunun yerine `order_id`
  korelasyonu üzerinden cross-user leakage'ı doğrular.
- `type` sistemde şu an yalnızca `"order.paid"` değerini alabilir —
  `events.service.js`'in tek `ORDER_PAID_EVENT_TYPE` sabiti,
  `notifications.service.js`'in tek call-site'ı. Şemada `enum:
  ["order.paid"]` olarak yazıldı (gerçek, doğrulanmış contract; başka
  bir event type varsayılmadı).
- `created_at`, SQLite `CURRENT_TIMESTAMP` formatındadır
  (`"YYYY-MM-DD HH:MM:SS"`), ISO 8601/RFC3339 **DEĞİLDİR** — AJV
  şemasında `format: date-time` **kullanılmadı** (yanlış-pozitif red
  üretirdi); yalnızca `type: string` doğrulanır.
- `notifications` tablosunda `UNIQUE (order_id, type)` DB constraint'i
  vardır (schema.js) — ayrıca `events` tablosunda `UNIQUE (order_id,
  event_type)`. Bkz. bölüm 7 — bu neden normal REST akışında
  tetiklenemediği.

---

## 1. İlk Uygulanan TEK Adım — PAID Order → Exactly One Correlated Notification (Gate)

Diğer her şeyden önce, yalnızca `0. Bootstrap` + `1. PAID Order ->
Exactly One Correlated Notification (Gate)` klasörleri izole
çalıştırıldı:

```bash
npx newman run postman/collections/qa-demo-system-notifications.postman_collection.json \
  -e postman/environments/local.postman_environment.json \
  --folder "0. Bootstrap" --folder "1. PAID Order -> Exactly One Correlated Notification (Gate)"
```

```text
❏ 0. Bootstrap
↳ Login as User A (test.active01)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 33ms]
  ✓  Status code is 200

↳ Login as User B (test.active02)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 8ms]
  ✓  Status code is 200

❏ 1. PAID Order -> Exactly One Correlated Notification (Gate)
↳ Capture notification baseline before PAID order (User A)
  GET http://localhost:3000/api/notifications [200 OK, 255B, 17ms]
  ✓  Status code is 200

↳ Create PAID order for notification correlation (User A, product 4 qty 1)
  POST http://localhost:3000/api/orders [201 Created, 288B, 7ms]
  ✓  Status code is 201
  ✓  Order created with PAID status

↳ Verify exactly one new, correlated notification appears (order.paid)
  GET http://localhost:3000/api/notifications [200 OK, 383B, 4ms]
  ✓  Status code is 200
  ✓  Content-Type is application/json
  ✓  Notification count increased by exactly 1
  ✓  Exactly one notification correlated to this order_id
  ✓  Correlated notification has correct contract fields (type/message/is_read/id/created_at)

┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │                5 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │                5 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │               10 │                0 │
└─────────────────────────┴──────────────────┴──────────────────┘
```

**Gate PASS (5/5 request, 10/10 assertion).** `stock_before`/`stock_after`
gibi bir kavram bu pakette yok — bunun yerine "notification count
before/after" ve "order_id ile korelasyon" gerçek runtime değerleriyle
(hardcoded değil) kanıtlandı: `notifBeforeCount` gerçek bir GET'ten
okunur, `gateOrderId` gerçek POST response'undan okunur, sonraki GET
bu ikisine göre hesaplanan (`before + 1`) bir sayıyla karşılaştırılır.
Bu gate PASS olmadan suite'in geri kalanına geçilmedi.

## 2. Ortam, Reset ve Test Kullanıcıları

- Sunucu: resmi `docs/RUN-INSTRUCTIONS.md` yöntemiyle (`node --watch src/server.js`).
- **Reset:** Her tam suite çalıştırmasından önce `npm run db:seed` —
  mevcut, canonical, önceden dokümante edilmiş komut (yeni bir reset
  mekanizması oluşturulmadı). Order/notification state mutasyonları
  nedeniyle reproducibility için zorunludur.
- USER A: `test.active01@example.com`, USER B: `test.active02@example.com`
  (synthetic/deterministic, `shared/test-data/auth-users.json`). P5.5'in
  aksine, **User B burada gerçekten kullanılır** — cross-user
  isolation/leakage testleri için gereklidir (bkz. bölüm 4).
- Product 4 (QA Demo Webcam, stock=12) — User A'nın tüm sipariş
  senaryolarında kullanıldı; product 1 (QA Demo Klavye, stock=25) —
  yalnızca User B'nin isolation testinde kullanıldı. İkisi de bu
  koleksiyonda çakışmadan yeterli stoğa sahip (toplam kullanım:
  product 4 için 3 adet — gate, declined, timeout, second-order arası
  yalnızca approved olanlar stok tüketir: gate 1 + second-order 1 = 2/12;
  product 1 için 1/25).
- Komut: `cd QA-DEMO-SYSTEM/api-tests && npm run api:test:notifications`
  (AJV/Node-wrapper — P5.2/P5.5 ile aynı isimlendirme konvansiyonu); ham
  Newman CLI için `npm run api:test:notifications:basic`.

## 3. Gerçek Çalıştırma Sonucu — RUN #1 (fresh `db:seed` sonrası)

```text
❏ 0. Bootstrap
[... bkz. bölüm 1 ...]

❏ 2. Notification List — Positive / Contract
↳ GET /api/notifications — valid token, contract
  GET http://localhost:3000/api/notifications [200 OK, 383B, 3ms]
  ✓  Status code is 200
  ✓  Content-Type is application/json
  ✓  notifications is an array
  ✓  response has no extra top-level fields

❏ 3. User Isolation / Cross-user Leakage
↳ Create PAID order for User B (product 1 qty 1)
  POST http://localhost:3000/api/orders [201 Created, 288B, 7ms]
  ✓  Status code is 201
  ✓  Order created with PAID status

↳ Verify User B sees their own notification
  GET http://localhost:3000/api/notifications [200 OK, 383B, 3ms]
  ✓  Status code is 200
  ✓  User B notification list contains own order

↳ Verify User A notification list does NOT contain User B notification (cross-user leakage)
  GET http://localhost:3000/api/notifications [200 OK, 383B, 5ms]
  ✓  Status code is 200
  ✓  No cross-user leakage: User A list does not contain User B order_id
  ✓  User A still sees own gate notification (no cross-contamination)

↳ Verify User B notification list does NOT contain User A gate notification (cross-user leakage)
  GET http://localhost:3000/api/notifications [200 OK, 383B, 3ms]
  ✓  Status code is 200
  ✓  No cross-user leakage: User B list does not contain User A order_id

❏ 4. Declined Payment -> No Notification
↳ Capture notification state before declined payment (User A)
  GET http://localhost:3000/api/notifications [200 OK, 383B, 2ms]
  ✓  Status code is 200

↳ Declined payment order (User A, product 4 qty 1)
  POST http://localhost:3000/api/orders [201 Created, 298B, 5ms]
  ✓  Status code is 201
  ✓  status PAYMENT_FAILED (not PAID)

↳ Verify no new notification after declined payment
  GET http://localhost:3000/api/notifications [200 OK, 383B, 2ms]
  ✓  Status code is 200
  ✓  Notification count unchanged after declined payment
  ✓  Notification set unchanged (same order_id set)
  ✓  No notification correlated to the declined order_id

❏ 5. Timeout Payment -> No Notification
↳ Capture notification state before timeout payment (User A)
  GET http://localhost:3000/api/notifications [200 OK, 383B, 3ms]
  ✓  Status code is 200

↳ Timeout payment order (User A, product 4 qty 1)
  POST http://localhost:3000/api/orders [201 Created, 299B, 5ms]
  ✓  Status code is 201
  ✓  status PAYMENT_TIMEOUT (not PAID)

↳ Verify no new notification after timeout payment
  GET http://localhost:3000/api/notifications [200 OK, 383B, 2ms]
  ✓  Status code is 200
  ✓  Notification count unchanged after timeout payment
  ✓  Notification set unchanged (same order_id set)
  ✓  No notification correlated to the timeout order_id

❏ 6. Duplicate Notification Regression
↳ Create second PAID order for User A (product 4 qty 1)
  POST http://localhost:3000/api/orders [201 Created, 288B, 6ms]
  ✓  Status code is 201
  ✓  status PAID

↳ Verify exactly one notification per order — no merging/duplication across multiple PAID orders
  GET http://localhost:3000/api/notifications [200 OK, 512B, 3ms]
  ✓  Status code is 200
  ✓  Exactly one notification for the first (gate) order — not duplicated
  ✓  Exactly one notification for the second order — distinct, not merged
  ✓  The two notifications are different records

❏ 7. Auth Regression
↳ No token -> 401
  GET http://localhost:3000/api/notifications [401 Unauthorized, 278B, 3ms]
  ✓  Status code is 401
  ✓  Content-Type is application/json
  ✓  Error body: Yetkilendirme gerekli

↳ Invalid token -> 401
  GET http://localhost:3000/api/notifications [401 Unauthorized, 294B, 2ms]
  ✓  Status code is 401
  ✓  Error body: Geçersiz veya süresi dolmuş oturum

--- P5.6 AJV / Header Validation Results (Notifications) ---
PASS  Capture notification baseline before PAID order (User A) — schema + Content-Type PASS
PASS  Verify exactly one new, correlated notification appears (order.paid) — schema + Content-Type PASS
PASS  GET /api/notifications — valid token, contract — schema + Content-Type PASS
PASS  No token -> 401 — schema + Content-Type PASS

Newman functional assertions (status code, from pm.test): PASS
AJV schema + Content-Type validations: PASS

P5.6 schema validation run: PASS

┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │              20 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │              20 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               0 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │              48 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 463ms                                   │
├─────────────────────────────────────────────────────────────┤
│ total data received: 2.19kB (approx)                        │
├─────────────────────────────────────────────────────────────┤
│ average response time: 5ms [min: 2ms, max: 29ms, s.d.: 5ms] │
└─────────────────────────────────────────────────────────────┘
```

**RUN #1 sonucu: 20/20 request PASS, 48/48 assertion PASS, 4/4 AJV
schema+Content-Type doğrulaması PASS, 0 failure.**

## 4. Repeatability — RUN #2 (fresh `db:seed` reset sonrası, ikinci kez)

Aynı komut (`npm run api:test:notifications`), `npm run db:seed` ile
state sıfırlandıktan sonra **tekrar** çalıştırıldı — manuel müdahale
yok:

```text
┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │              20 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │              20 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               0 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │              48 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 433ms                                   │
├─────────────────────────────────────────────────────────────┤
│ total data received: 2.19kB (approx)                        │
├─────────────────────────────────────────────────────────────┤
│ average response time: 4ms [min: 2ms, max: 27ms, s.d.: 5ms] │
└─────────────────────────────────────────────────────────────┘
```

**RUN #2 sonucu: 20/20 request PASS, 48/48 assertion PASS, 4/4 AJV
doğrulaması PASS — RUN #1 ile birebir aynı sayılar** (`total data
received` dahil, yalnızca timing farklı). Deterministic/reproducible,
manuel müdahale gerekmedi.

---

## 5. Business Invariant Sonuçları

| Invariant | Sonuç | Nasıl ölçüldü |
|---|---|---|
| A) PAID order → tam olarak 1 korelasyonlu notification oluşur | **PASS** | Gate: gerçek before/after GET, `count === before + 1`, `order_id` ile filtrelenmiş eşleşme `length === 1`, tüm contract alanları doğrulandı |
| B) Declined payment → notification ÜRETİLMEZ | **PASS** | Gerçek before/after GET: count değişmedi, order_id set'i değişmedi, declined order'ın order_id'sine korelasyonlu notification yok |
| C) Timeout payment → notification ÜRETİLMEZ | **PASS** | Aynı desen, timeout order için |
| D) User isolation — her kullanıcı yalnızca kendi notification'larını görür | **PASS** | User A ve User B ayrı ayrı kendi order_id'lerini içeren notification görüyor |
| E) Cross-user leakage yok | **PASS** | User A'nın listesi User B'nin order_id'sini İÇERMİYOR, User B'nin listesi User A'nın order_id'sini İÇERMİYOR — gerçek filter/length assertion ile (yalnızca count değil) |
| F) Birden fazla PAID order → notification'lar birleşmiyor/kaybolmuyor | **PASS** | İki ayrı PAID order (gate + second), her biri için ayrı ayrı `length===1` eşleşme + iki notification'ın `id`'lerinin farklı olduğu doğrulandı |
| G) `is_read` yeni notification'da doğru default değerde | **PASS** | Gate'in korelasyon kontrolünde `is_read === 0` (integer, boolean değil) doğrulandı |

**Not — duplicate/constraint sınırı:** `notifications` tablosundaki
`UNIQUE(order_id, type)` DB constraint'i, normal `POST /api/orders`
akışında REST API üzerinden **tetiklenemez** (her sipariş yeni bir
auto-increment `order_id` alır). Bu pakette test edilen "duplicate
yok" invariant'ı, gerçekte REST-visible olan şeydir: birden fazla ayrı
PAID order'ın her biri için tam olarak bir, bağımsız notification
üretilmesi (madde F). Doğrudan SQL ile `UNIQUE` constraint ihlali
üretme/doğrulama bu paketin kapsamı dışındadır — **P5.7'ye
bırakılmıştır**.

## 6. Header Validation Sonucu

CURRENT header standardı (`api-tests/README.md`) — `Content-Type` —
hem **2 temsili `pm.test()` request**inde (gate'in başarı yolu `200`
ve Auth Regression'ın `no-token` hata yolu `401`) hem de AJV
wrapper'ın **4 request'inde bağımsız olarak** doğrulanıyor.

## 7. Duplicate Notification — Neden Doğrudan Constraint Testi Yapılmadı

`notifications` tablosu: `UNIQUE (order_id, type)`. `events` tablosu:
`UNIQUE (order_id, event_type)`. Her iki constraint de kaynak koddan
doğrulandı (`schema.js`). Ancak `createOrder()` (`orders.service.js`)
her başarılı POST için **yeni** bir `orders.id` (auto-increment) üretir
ve `createOrderPaidEvent()`/`createNotificationFromOrderPaidEvent()`'i
yalnızca o tek, yeni `orderId` ile bir kez çağırır — REST API üzerinden
aynı `order_id` ile ikinci bir "PAID" sonucu üretmenin (ve dolayısıyla
constraint'i ihlal etmeye çalışmanın) normal bir yolu **yoktur**. Bu
constraint'i gerçekten ihlal etmeye çalışmak (ör. doğrudan iki kez
`INSERT` denemek) SQL erişimi gerektirir — **P5.7 kapsamı**. Bu pakette
yalnızca REST-visible, gerçekten API üzerinden tetiklenebilir olan
"her PAID order kendi, tek, ayrı notification'ını üretir" davranışı
kanıtlanmıştır (bkz. bölüm 5, madde F).

## 8. Read/Unread ve Mark-as-Read — NOT IMPLEMENTED / OUT OF SCOPE

Kaynak kod inventory'si (bölüm 0), sistemde **hiçbir mark-as-read
endpoint'i olmadığını** doğruladı. `is_read` alanı her zaman `0`
(integer) olarak yazılır, hiçbir kod yolu onu `1`'e güncellemez. Bu
yüzden:
- Yeni notification'ın `is_read === 0` (integer) olduğu doğrulandı
  (bölüm 1 — gate).
- Mark-as-read davranışı (owner read yapabilir, başkası yapamaz,
  sonraki GET'te `is_read===true`) **test EDİLMEDİ** — böyle bir
  endpoint icat edilmedi. **NOT IMPLEMENTED / OUT OF SCOPE** olarak
  işaretlenmiştir.

## 9. Unknown Notification / Invalid ID Matrix — N/A

Kaynak kodda notification detail/id-bazlı bir endpoint (`GET
/api/notifications/:id` veya eşdeğeri) **yoktur**. Bu yüzden bilinmeyen
notification id veya invalid-id matrix testi **uygulanamaz (N/A)** —
sırf test sayısını doldurmak için var olmayan bir endpoint icat
edilmedi.

## 10. P5.3 Overlap Kararı — User Isolation ve Auth Regression

P5.3'ün protected collection'ı (`qa-demo-system-protected.postman_collection.json`,
"4. Notifications — Ownership & Cross-User" klasörü) `GET
/api/notifications` üzerinde **zaten** şunları kapsıyor: USER A kendi
`order_id`'sini görür, USER B'nin listesinde USER A'nın `order_id`'si
**asla** yok (aynı order_id-tabanlı leakage tekniği), no-token → 401,
invalid-token → 401 (tam authentication matrix — boş header, yanlış
scheme, malformed Bearer, bilinmeyen token dahil).

Bu, P5.6'nın folder 3 (User Isolation) ve folder 7 (Auth Regression)
ile **kısmen örtüşür**. Bilinçli karar:
- **Folder 7 (Auth Regression) küçültüldü değil, zaten minimaldi** —
  yalnızca 2 temsili request (no-token, invalid-token), P5.3'ün tam
  matrisini (boş header, yanlış scheme, malformed Bearer, bilinmeyen
  token) **tekrarlamaz**. Amaç: P5.6'nın collection'ının P5.3'e
  bağımlı olmadan standalone çalışabilir bir regression gate'i olması
  — P5.4/P5.5'in kendi business collection'larında izlediği aynı
  desen.
- **Folder 3 (User Isolation) kasıtlı olarak korundu, kaldırılmadı** —
  ama P5.3'ün çalışmasını tekrar etmez: P5.3'ün ownership kanıtı,
  P5.3'ün KENDİ bootstrap/order akışının ürettiği notification'lar
  üzerinedir. P5.6'nın folder 3'ü, P5.6'nın KENDİ paketinin (gate +
  bu isolation adımının) ürettiği notification'lar üzerinde aynı
  invariant'ı, bu paketin kendi self-contained suite'i içinde
  yeniden doğrular — P5.3'ün önceden/ayrıca çalışmış olmasına bağımlı
  değildir. Bu, P5.6'nın Notifications business-rule'unun **sahibi**
  olan paket olarak, isolation'ın kendi ürettiği veriler üzerinde de
  tuttuğunu kanıtlaması gerektiği gerekçesiyle tutuldu — sırf sayı
  doldurmak için değil.

Her iki klasörün description alanlarında bu karar açıkça belirtilmiştir
(collection JSON'da, koddan okunabilir).

## 11. WebSocket Sınırı

P5.6'nın ana kapsamı **REST** Notifications business contract'ıdır.
Mevcut altyapı (Postman/Newman) WebSocket bağlantılarını doğal olarak
desteklemez — P4.3'ün WS testleri ayrı, özel bir `node --test` script'i
kullanıyordu (Postman/Newman değil). Bu paket kapsamında REST↔WebSocket
tutarlılığı için yeni bir WebSocket test altyapısı **kurulmadı** (bu,
"mevcut altyapı ile düşük maliyetle" kriterini karşılamıyor — ayrı bir
gerçek WS client/test framework gerektirir). Bu:

**WebSocket delivery consistency → KNOWN LIMITATION / FUTURE DEDICATED
COVERAGE.**

olarak bırakılmıştır. Ayrıca bkz. Phase 4 closeout'ta zaten belgelenmiş
non-blocking not: "Frontend'de GET/WebSocket yarışı → olası çift
notification GÖRÜNÜMÜ" — bu, **yalnızca UI-seviyesi görsel** bir
durumdur, `UNIQUE(order_id, type)` sayesinde DB'de duplicate satır
oluşmaz (`PHASE-4-CLOSEOUT.md` bölüm 9, madde 3). P5.6'nın REST-only
kapsamı bu UI sınırının dışındadır — karıştırılmamalıdır.

## 12. Event / Transaction Sınırı

Phase 4 closeout'ta zaten belgelenmiş bilinen sınırlama: `[event]`/
`[notification]` logları transaction commit'ten ÖNCE yazılıyor
(`PHASE-4-CLOSEOUT.md` bölüm 9, madde 4). P5.6 doğrudan DB transaction
seviyesi doğrulama **yapmamıştır** — bu konu P5.7 (API→DB) veya future
hardening'e bırakılmıştır. P5.6'daki tüm assertion'lar API-visible
davranışla sınırlıdır.

---

## 13. Bulunan Bug'lar

**Application bug: YOK.** PAID order → tam olarak 1 korelasyonlu
notification; declined/timeout → notification üretilmiyor; user
isolation/cross-user leakage yok; birden fazla PAID order birbirini
bozmuyor/duplicate üretmiyor — hepsi gerçek, API-visible assertion'larla
doğrulandı, hiçbir sapma bulunmadı.

**Test/schema/documentation bug: YOK.**

**Düzeltilen bug: Yok (düzeltilecek bir şey bulunmadı).**

---

## 14. Sonuç

**PASS** — Notifications REST API'si (PAID order korelasyonu, user
isolation/cross-user leakage, declined/timeout non-generation, birden
fazla order için duplicate/merge olmayan davranış, minimal auth
regression, response contract'ı gerçek AJV şema doğrulamasıyla)
kapsamlı şekilde doğrulandı; 2 ayrı temiz-reset execution'da birebir
aynı sonuç (20/20 request, 48/48 assertion, 4/4 AJV doğrulaması);
hiçbir application bug'ı bulunmadı. Mark-as-read ve notification
detail/id endpoint'leri kaynak kodda mevcut olmadığı için test
edilmedi (N/A, icat edilmedi). API→DB transaction validation ve
WebSocket delivery consistency bilinçli olarak bu paketin kapsamı
dışında bırakıldı.

## 15. Bilinen Sınırlamalar (Bu Paket Kapsamında)

- **API→DB doğrudan SQL assertion'ı yok.** Tüm notification kanıtları
  yalnızca `GET /api/notifications` response'u üzerinden yapıldı.
  `UNIQUE(order_id, type)` constraint'inin doğrudan SQL ile ihlal
  edilmeye çalışılması — **P5.7'ye bırakıldı** (bkz. bölüm 7).
- **Mark-as-read endpoint yok** — bu pakette test edilmedi, icat
  edilmedi (bkz. bölüm 8).
- **Notification detail/id endpoint yok** — invalid-id matrix testi
  N/A (bkz. bölüm 9).
- **WebSocket delivery consistency test edilmedi** — mevcut altyapı
  bunu Postman/Newman ile düşük maliyetle desteklemiyor; future
  dedicated coverage'a bırakıldı (bkz. bölüm 10).
- Event/notification logları transaction commit öncesi yazılıyor
  (P4.3'ten devralınan, bilinen, non-blocking limitation) — bu pakette
  ayrıca doğrulanmadı (bkz. bölüm 11).
- Newman'ın kendi transitive dependency ağacında (P5.1'den devralınan,
  bilinen, non-blocking) `npm audit` uyarıları hâlâ mevcut.
