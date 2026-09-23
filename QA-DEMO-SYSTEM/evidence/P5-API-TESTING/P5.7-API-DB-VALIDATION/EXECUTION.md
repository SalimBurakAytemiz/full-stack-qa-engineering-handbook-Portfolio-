# P5.7 — API → DB Validation — Execution Evidence

**Branch:** `feat/phase-5-7-api-db-validation`
**Tarih:** 2026-09-23 (ilk uygulama), **fix round #1: 2026-09-23**
(Codex bağımsız delta review, head commit `658424b`, FAIL/3 blocker +
1 non-blocking not düzeltme turu), **fix round #2: 2026-09-23** (Codex
kısa fix-delta re-review, head commit `e93d3fb`, FAIL/1 açık kalan
blocker [B2, kapsam] + 2 non-blocking not düzeltme turu)

> Bu kayıt, aşağıdaki validation run'larının **gerçekten çalıştırılmış**
> sonucudur (`CONTRIBUTING.md` — Evidence Integrity). Hiçbir sonuç
> tahmin edilmemiş veya kurgulanmamıştır. Bu dosya kendi commit
> hash'ine self-reference edemez (P5.4-P5.6'da açıklanan aynı
> matematiksel kısıt) — kesin hash bu paketi kapatan Türkçe rapor'da
> ve `git log --oneline -1 feat/phase-5-7-api-db-validation`
> çıktısında belirtilir.

---

## 0. Fix Round Özeti

### Fix Round #1 (Codex Bağımsız Delta Review — 3 Blocker + 1 Non-blocking, head `658424b`)

| Bulgu | Durum | Nasıl düzeltildi |
|---|---|---|
| **B1** — "API↔DB stock consistency" iddia ediliyordu ama gerçek API `GET /api/products/:id` çağrısı hiç yapılmıyordu | **Düzeltildi** | S2'ye gerçek `GET /api/products/:id` çağrıları eklendi — approved order öncesi/sonrası hem API hem DB'den okunan stok değerleri birbirleriyle VE kendi before/after delta'larıyla (effective quantity=5) karşılaştırılıyor. Artık gerçekten cross-layer bir kanıt. |
| **B2** — "Zero-write" iddiaları yalnızca table count + tek bir ürünün stoğuyla ölçülüyordu; yanlış bir satırın update edilmesi veya farklı bir ürünün stoğunun değişmesi bu kontrolle yakalanamazdı | **Kısmen düzeltildi (round #2'de tamamlandı)** | Yeni `fullSnapshot()` helper'ı — tüm `orders`/`order_items`/`notifications`/`events` satırlarını (id + ilişki alanları) VE 4 ürünün TAMAMININ stoğunu identity-level yakalar. S1 (gate), S3, S4 (×3), S5 (×2), S6 artık bunu kullanıyor. **Round #2'de Codex bu kapsamın hâlâ eksik olduğunu bulmuştur** — bkz. aşağıdaki tablo. |
| **B3** — Relational integrity kısmi: `notifications.user_id` için orphan kontrolü yoktu; DECLARED-IN-DDL ve OBSERVED-DATA-INTEGRITY ayrımı belirsizdi | **Düzeltildi** | S12'ye `notifications.user_id → users.id` orphan sorgusu eklendi. S12/S13 başlıkları ve iç yorumları artık açıkça ayrılıyor: S12 = OBSERVED DATA INTEGRITY (gerçek satırlar üzerinde sorgu), S13 = DECLARED IN DDL (yalnızca şema metni incelemesi). S13'e `notifications.user_id REFERENCES users(id)`, `events.user_id REFERENCES users(id)`, `sessions.user_id REFERENCES users(id)` ve representative `NOT NULL` kontrolleri eklendi. |
| Non-blocking — Run #1/#2 mutlak ID eşitliği iddiası yeterince somut gösterilmiyordu | **Düzeltildi (round #1), wording round #2'de daha da netleştirildi** | Bölüm 8'de gerçek Run #1 ve Run #2 değerleri yan yana gösterildi; `events.event_id` (UUID) istisnası belirtildi. |

### Fix Round #2 (Codex Kısa Fix-Delta Re-review — 1 Açık Kalan Blocker [B2] + 2 Non-blocking, head `e93d3fb`)

| Bulgu | Durum | Nasıl düzeltildi |
|---|---|---|
| **B2 (açık kalan)** — `fullSnapshot()` yalnızca id + ilişki alanlarını yakalıyordu; `notifications.message` ve `events.payload` gibi mutation-sensitive İÇERİK alanları snapshot'ın dışındaydı — bir satırın id'si/count'u aynı kalırken İÇERİĞİ sessizce değişse bile test PASS verebilirdi (özellikle malformed JSON senaryosunun "zero-write" iddiası bu yüzden yeterince güçlü değildi) | **Düzeltildi** | `fullSnapshot()` genişletildi: `notifications` sorgusuna `message` ve `created_at`, `events` sorgusuna `payload` ve `created_at` eklendi — ikisi de gerçek `schema.js`'te var olan, uydurulmamış sütunlar. `events.payload`'ın `JSON.stringify({orderId,userId,total})` ile TEK bir sabit key-order'la yazıldığı kaynak koddan doğrulandı (`events.service.js`) — bu yüzden herhangi bir JSON re-parse/normalize adımına gerek yok, ham TEXT string olarak karşılaştırılıyor (yanlış-pozitif/negatif riski yok). `created_at`'ın aynı run içindeki before/after karşılaştırmasında güvenli olduğu gerekçelendirildi: dokunulmayan bir satırın `created_at`'ı değişemez (yalnızca INSERT'te set edilir). Assertion label'ları da "identity-level" yerine "content-level" olarak güncellendi. |
| Non-blocking #1 — Run #1/#2 wording'i hâlâ "snapshot JSON birebir aynı" gibi mutlak ifadeler içeriyordu, UUID istisnası tabloda vardı ama düzyazıda tam netleşmemişti | **Düzeltildi** | Bölüm 8 yeniden yazıldı: AUTOINCREMENT satırların deterministik eşitliği ile `events.event_id` UUID'sinin **tasarım gereği** farklı olması arasındaki ayrım, hem tabloda hem düzyazıda tutarlı şekilde ifade ediliyor; "tamamen birebir" gibi mutlak/genel ifadeler kaldırıldı. |
| Non-blocking #2 — 88→97 assertion artışının itemized açıklaması (bölüm 7'de "+3/+1/+5") gerçek dağılımla uyuşmuyordu | **Düzeltildi** | Round #1 ile round #2 arası çalıştırmaların ham çıktısı senaryo senaryo yeniden sayıldı (bkz. bölüm 7 — gerçek dağılım: S2 +3, S12 +1, S13 +12; S1/S3/S4×3/S5×2'de count+tek-ürün kontrolü TEK bir `fullSnapshot` assertion'ına birleştiği için toplam −7; net +9, 88+9=97). Eski, yanlış "+5 DDL" itemization'ı düzeltildi. |

Uygulama/database mimarisi bu turlarda **hiçbir şekilde değiştirilmedi** —
yalnızca `scripts/run-api-db-validation.js` (validation script)
güçlendirildi. Application/database bug bulunmadı (bkz. bölüm 9).

---

## 1. P5.7'nin Kapattığı Boşluk

P5.1–P5.6, API response'larının **doğru göründüğünü** kanıtladı —
hiçbiri veritabanının kendisini açmadı. P5.5 ve P5.6'nın evidence'ları
bu boşluğu açıkça belgeledi (ör. P5.5 bölüm 12: "order/order_items
DB'de hiç yazılmadığı iddiası... doğrudan SQL gerektirir — P5.7'ye
bırakıldı"; P5.6 bölüm 15: "API→DB doğrudan SQL assertion'ı yok").
P5.7 bu boşluğu kapatır: her senaryo için gerçek API çağrısı + gerçek
SQLite dosyasına doğrudan, **read-only** bir bağlantıdan `SELECT`
sorgusu — ikisi karşılaştırılır.

## 2. Mimari ve DB Access Model

- **DB engine:** SQLite (`node:sqlite` `DatabaseSync`) — sistemin kendi
  canonical bağlantı modülü (`backend/src/database/connection.js`)
  ile birebir aynı driver, farklı bir abstraction icat edilmedi.
- **Test target:** Sunucunun gerçekten yazdığı dosya —
  `backend/src/config/index.js`'in `config.dbPath`'i doğrudan
  `require` edilerek okunur (path/secret elle kopyalanmadı, tek
  kaynak). Varsayılan: `QA-DEMO-SYSTEM/backend/data/qa-demo.db`
  (repo-relative; gerçek makine yolu veya herhangi bir secret bu
  dosyada yazılı değildir).
- **Erişim modu:** `new DatabaseSync(dbPath, { readOnly: true, open: true })`
  — SQLite seviyesinde gerçek read-only garanti. Script hiçbir zaman
  `INSERT`/`UPDATE`/`DELETE` çalıştırmaz; tek reset mekanizması,
  mevcut, canonical `npm run db:seed` komutudur (script dışından, elle
  çalıştırılır).
- **Neden Postman/Newman değil:** Newman'ın SQL çalıştırma kapasitesi
  yok. `scripts/run-api-db-validation.js` — Node'un **built-in**
  `node:sqlite` ve `fetch`'i dışında hiçbir yeni dependency eklemeyen,
  minimal, tek dosyalık bir script.
- **Identity-level "zero write" kanıtı (fix round, B2):** `fullSnapshot(db)`
  fonksiyonu, `orders`/`order_items`/`notifications`/`events`
  tablolarının TAMAMINI (id + ilişki alanları) ve 4 ürünün TAMAMININ
  stoğunu tek bir nesne olarak yakalar; before/after karşılaştırması
  bu nesnenin derin eşitliğiyle yapılır — yalnızca satır sayısı veya
  tek bir ürünün stoğu değil.

## 3. Ön-Doğrulama Probe'ları (Script Yazılmadan Önce, Ampirik)

1. `new DatabaseSync(dbPath, {readOnly:true, open:true})` gerçek dosya
   üzerinde başarıyla açıldı.
2. Sunucu ayaktayken aynı dosyaya read-only bağlantı açıp sorgu
   çalıştırmak sorunsuz çalıştı (concurrent read güvenli).
3. Gerçek bir approved `POST /api/orders` çağrısından hemen sonra
   satır anında görünür oldu (stale-read yok).
4. **Kritik bulgu — declined/timeout "zero write" DEĞİLDİR:** Kaynak
   kod (`orders.service.js`) okunduğunda `insertOrder.run(...)` ve her
   satır için `insertItem.run(...)`'ın `if (status === 'PAID')`
   bloğundan **ÖNCE**, koşulsuz çalıştığı görüldü — yalnızca
   `decrementStock`, `createOrderPaidEvent`, `createNotificationFromOrderPaidEvent`
   `PAID`'e özeldir. Bu, gerçek bir declined çağrısıyla ampirik olarak
   da doğrulandı.

## 4. Reset ve Baseline

- **Reset:** `cd QA-DEMO-SYSTEM/backend && npm run db:seed` — mevcut,
  canonical komut. `seed.js` yalnızca `DELETE FROM ...` + `INSERT`
  yapar, AUTOINCREMENT sayaçlarını da sıfırlar (`resetAutoincrementCounters`)
  — bu yüzden `orders`/`order_items`/`notifications`/`users`/`products`
  gibi `INTEGER PRIMARY KEY AUTOINCREMENT` sütunlu tabloların ID'leri
  her reset sonrası deterministiktir. **İstisna:** `events.event_id`
  `crypto.randomUUID()` ile üretilir (`events.service.js`) — bu sütun
  AUTOINCREMENT değildir, dolayısıyla reset'ten bağımsız olarak her
  çalıştırmada farklı bir değer alır; bu, bir reset-determinism
  eksikliği değil, UUID'nin doğası gereğidir (bkz. bölüm 8).
- **Baseline (S0, gerçek sorgu sonucu):** `orders=0`, `order_items=0`,
  `notifications=0`, `events=0`, `users=2`, `products` stok:
  `{1:25, 2:0, 3:5, 4:12}`.
- **Komut:** `cd QA-DEMO-SYSTEM/api-tests && npm run api:test:db`
  (sunucunun ayakta olması ve hemen öncesinde `db:seed` çalıştırılmış
  olması önkoşuldur).

## 5. Senaryo Kategorileri (Fix Round #2 Sonrası)

| # | Senaryo | Kategori | Fix round'larda değişen |
|---|---|---|---|
| S0 | Baseline determinism | Reset | — |
| S1 | **GATE** — unknown product_id → zero write | Atomicity | Round #1: identity-level `fullSnapshot`. Round #2: content-level (message/payload dahil) |
| S2 | Approved order — full API↔DB trace + duplicate aggregation + **API↔DB stock consistency** | Persistence + Consistency | Round #1 (B1): gerçek `GET /api/products/:id` before/after eklendi |
| S3 | Insufficient stock → zero write | Atomicity | Round #1: identity-level. Round #2: content-level |
| S4 | Invalid quantity (×3 temsili) → zero write | Atomicity | Round #1: identity-level. Round #2: content-level |
| S5 | Invalid payment_token (false, 0) → zero write | Atomicity | Round #1: identity-level. Round #2: content-level |
| S6 | Malformed JSON → zero write | Atomicity | Round #1: identity-level. Round #2: content-level (bu senaryonun kanıt gücü Codex'in özellikle işaret ettiği yerdi) |
| S7 | Declined payment → persistence contract | Persistence | — |
| S8 | Timeout payment → persistence contract | Persistence | — |
| S9 | Notification API↔DB correlation | Consistency | — |
| S10 | Duplicate notification DB check | Persistence | — |
| S11 | Ownership DB check | Ownership | — |
| S12 | Relational integrity — **OBSERVED DATA INTEGRITY** | Integrity | Round #1 (B3): `notifications.user_id` orphan check eklendi |
| S13 | Constraint definitions — **DECLARED IN DDL** | Constraint | Round #1 (B3): `notifications.user_id`/`events.user_id`/`sessions.user_id` REFERENCES + 9 representative NOT NULL kontrolü eklendi |

**Duplike edilmeyen/gerekçeli atlanan maddeler (değişmedi):** unknown
product_id zero-write, S1'in gate'iyle aynı regresyon olduğu için ayrı
test edilmedi. Event/notification commit-ordering (P4.3, log
zamanlaması) black-box API+DB testiyle gözlemlenemeyeceği için bu
pakette bağımsız test edilmedi — KNOWN LIMITATION olarak kalır (bkz.
bölüm 11).

## 6. DECLARED IN DDL vs OBSERVED DATA INTEGRITY — Neden Ayrı

Codex'in B3 bulgusu bu ayrımın net olmamasıydı. Artık:

- **S13 (DECLARED IN DDL):** `sqlite_master`'ın `sql` sütunundaki DDL
  metnini regex ile inceler — bir constraint'in **tanımlandığını**
  kanıtlar. Bu, runtime'da gerçekten **uygulandığını** kanıtlamaz (bir
  ihlal denemesi gerektirir, bu read-only script bunu yapmaz).
- **S12 (OBSERVED DATA INTEGRITY):** Gerçek satırlar üzerinde `LEFT
  JOIN ... WHERE ... IS NULL` sorgularıyla orphan satır arar — mevcut
  **verinin** tutarlı olduğunu kanıtlar. Bu, constraint'in var olup
  olmadığından bağımsız bir gözlemdir (constraint olmasa bile veri
  hâlâ tutarlı olabilir/olmayabilir).

Bu iki iddia **asla** tek bir "FK PASS" cümlesinde birleştirilmedi.
`notifications.user_id` özelinde: DDL'de gerçekten `REFERENCES
users(id)` **vardır** (S13'te doğrulandı) VE gerçek veride orphan
satır **yoktur** (S12'de doğrulandı) — ikisi ayrı assertion, ayrı
kanıt.

**Fresh vs existing DB (P4.6 bilinen sınırlaması, korunuyor):**
`CREATE TABLE IF NOT EXISTS` yalnızca dosya hiç yokken gerçekten
çalışır — bu test, bu oturumdaki mevcut `qa-demo.db` dosyasına karşı
çalıştırıldı ve güncel `schema.js`'in tüm constraint'lerini gösterdi.
Bu, çok eski bir schema sürümünden kalma, hiç yeniden oluşturulmamış
bir DB dosyasının aynı constraint'lere sahip olacağını **garanti
etmez** (bkz. `PHASE-4-CLOSEOUT.md` bölüm 9, madde 2) — migration/
backfill bu paketin de kapsamı dışındadır.

## 7. Runner ve Gerçek Çalıştırma Sonucu — RUN #1 (Fix Round #2)

```bash
cd QA-DEMO-SYSTEM/backend && npm run db:seed
cd QA-DEMO-SYSTEM/api-tests && npm run api:test:db
```

Tam çıktı (RUN #1, fix round #2 — content-level `fullSnapshot`
sonrası ilk çalıştırma):

```text
--- P5.7 API -> DB Validation Results ---

PASS  S0. Baseline determinism (post db:seed)
  ✓  orders table is empty after db:seed — = 0
  ✓  order_items table is empty after db:seed — = 0
  ✓  notifications table is empty after db:seed — = 0
  ✓  events table is empty after db:seed — = 0
  ✓  users table has exactly the 2 seeded deterministic users — = 2
  ✓  product stock matches shared/test-data/products.json exactly — = [{"id":1,"stock_quantity":25},{"id":2,"stock_quantity":0},{"id":3,"stock_quantity":5},{"id":4,"stock_quantity":12}]

PASS  S1. GATE — unknown product_id request produces zero DB writes
  ✓  API rejects with 400 — = 400
  ✓  API error message matches source contract — = "Ürün bulunamadı: 99999"
  ✓  full content-level DB state unchanged (all order/order_items/notifications/events rows including notification.message && event.payload + all 4 products stock — not count-only) — = {"orders":[],"order_items":[],"notifications":[],"events":[],"products":[{"id":1,"stock_quantity":25},{"id":2,"stock_quantity":0},{"id":3,"stock_quantity":5},{"id":4,"stock_quantity":12}]}

PASS  S2. Approved order — full API<->DB trace + duplicate-line aggregation + API<->DB stock consistency
  ✓  API stock_quantity matches DB stock_quantity BEFORE the order (cross-layer, not assumed) — = 25
  ✓  API returns 201 — = 201
  ✓  API order.status is PAID — = "PAID"
  ✓  order row exists in DB — {"id":1,"user_id":1,"status":"PAID","total":749.5,"created_at":"2026-09-23 21:47:04"}
  ✓  order.user_id in DB matches authenticated USER A (seeded id 1) — = 1
  ✓  order.status in DB matches API response — = "PAID"
  ✓  order.total in DB matches API response — = 749.5
  ✓  exactly ONE order_items row (Map-based aggregation, not two separate rows) — = 1
  ✓  aggregated row product_id is 1 — = 1
  ✓  aggregated row quantity is 5 (2+3), proven via direct SQL not API inference — = 5
  ✓  aggregated row unit_price matches product 1 price — = 149.9
  ✓  API stock_quantity matches DB stock_quantity AFTER the order (cross-layer) — = 20
  ✓  DB stock decreased by exactly the aggregated quantity (5) — = 20
  ✓  API-visible stock decreased by exactly the aggregated quantity (5) — same delta as DB — = 20

PASS  S3. Insufficient stock request -> zero DB write
  ✓  API rejects with 409 — = 409
  ✓  full content-level DB state unchanged (all rows including notification.message && event.payload + all 4 products stock) — = {"orders":[{"id":1,"user_id":1,"status":"PAID","total":749.5}],"order_items":[{"id":1,"order_id":1,"product_id":1,"quantity":5,"unit_price":149.9}],"notifications":[{"id":1,"user_id":1,"order_id":1,"type":"order.paid","message":"Order #1 payment approved.","is_read":0,"created_at":"2026-09-23 21:47:04"}],"events":[{"event_id":"18350b30-8fb5-418f-8e3c-f2054529889e","event_type":"order.paid","user_id":1,"order_id":1,"payload":"{\"orderId\":1,\"userId\":1,\"total\":749.5}","created_at":"2026-09-23 21:47:04"}],"products":[{"id":1,"stock_quantity":20},{"id":2,"stock_quantity":0},{"id":3,"stock_quantity":5},{"id":4,"stock_quantity":12}]}

PASS  S4. Invalid quantity (string "2") -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  full content-level DB state unchanged (all rows including notification.message && event.payload + all 4 products stock) — [aynı snapshot, değişmedi]

PASS  S4. Invalid quantity (boolean true) -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  full content-level DB state unchanged (all rows including notification.message && event.payload + all 4 products stock) — [aynı snapshot, değişmedi]

PASS  S4. Invalid quantity (null) -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  full content-level DB state unchanged (all rows including notification.message && event.payload + all 4 products stock) — [aynı snapshot, değişmedi]

PASS  S5. Invalid payment_token (false) -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  full content-level DB state unchanged (all rows including notification.message && event.payload + all 4 products stock) — [aynı snapshot, değişmedi]

PASS  S5. Invalid payment_token (0) -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  full content-level DB state unchanged (all rows including notification.message && event.payload + all 4 products stock) — [aynı snapshot, değişmedi]

PASS  S6. Malformed JSON body -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  full content-level DB state unchanged (all rows including notification.message && event.payload + all 4 products stock) — [aynı snapshot, değişmedi — bu senaryonun kanıt gücü Codex'in özellikle işaret ettiği yerdi, artık message/payload içeriği de kapsam dahilinde]

PASS  S7. Declined payment — order+order_items persisted, stock/notification/event are not
  ✓  API returns 201 (declined is not an HTTP error) — = 201
  ✓  API order.status is PAYMENT_FAILED — = "PAYMENT_FAILED"
  ✓  order row EXISTS in DB (declined is NOT a zero-write case) — true
  ✓  order.status in DB is PAYMENT_FAILED — = "PAYMENT_FAILED"
  ✓  order_items row EXISTS for the declined order — = 1
  ✓  product 4 stock unchanged (declined never reaches decrementStock) — = 12
  ✓  notifications count unchanged — = 1
  ✓  no notification row correlated to the declined order_id — = 0
  ✓  no event row correlated to the declined order_id — = 0

PASS  S8. Timeout payment — order+order_items persisted, stock/notification/event are not
  ✓  API returns 201 (timeout is not an HTTP error) — = 201
  ✓  API order.status is PAYMENT_TIMEOUT — = "PAYMENT_TIMEOUT"
  ✓  order row EXISTS in DB (timeout is NOT a zero-write case) — true
  ✓  order.status in DB is PAYMENT_TIMEOUT — = "PAYMENT_TIMEOUT"
  ✓  order_items row EXISTS for the timeout order — = 1
  ✓  product 4 stock unchanged — = 12
  ✓  no notification row correlated to the timeout order_id — = 0
  ✓  no event row correlated to the timeout order_id — = 0

PASS  S9. Notification — API response <-> DB row correlation (S2 order)
  ✓  API GET /api/notifications contains a notification for the S2 order_id — true
  ✓  DB notifications row exists for the S2 order_id — true
  ✓  notification id matches between API and DB — = 1
  ✓  notification type matches between API and DB — = "order.paid"
  ✓  notification message matches between API and DB — = "Order #1 payment approved."
  ✓  notification is_read matches between API and DB (both integer 0) — = 0
  ✓  notification created_at matches between API and DB — = "2026-09-23 21:33:09"
  ✓  DB notification.user_id is USER A (not exposed via API, checked here only) — = 1

PASS  S10. Duplicate notification DB check — second distinct PAID order
  ✓  API returns 201 for the second approved order — = 201
  ✓  exactly one persisted notification row for the FIRST order (not duplicated by the second) — = 1
  ✓  exactly one persisted notification row for the SECOND order — = 1
  ✓  the two notification rows are different records (different ids) — true

PASS  S11. Ownership DB check — USER B order/notification correctly attributed
  ✓  API returns 201 for USER B order — = 201
  ✓  USER B order.user_id in DB is USER B (seeded id 2) — = 2
  ✓  notification row exists for USER B order — true
  ✓  notification.user_id in DB is USER B, not USER A — = 2
  ✓  USER A is never attributed as owner of USER B order — = 0

PASS  S12. Relational integrity — OBSERVED DATA INTEGRITY (orphan-row queries)
  ✓  no order_items row references a non-existent order — = 0
  ✓  no notifications row references a non-existent order — = 0
  ✓  no notifications row references a non-existent user (notifications.user_id) — = 0
  ✓  no events row references a non-existent order — = 0
  ✓  no order_items row references a non-existent product — = 0
  ✓  no orders row references a non-existent user — = 0

PASS  S13. Constraint definitions — DECLARED IN DDL (structural, read-only)
  ✓  products.stock_quantity has CHECK (>= 0) — true
  ✓  order_items.quantity has CHECK (> 0) — true
  ✓  notifications.is_read has CHECK (IN (0,1)) — true
  ✓  notifications has UNIQUE(order_id, type) — true
  ✓  events has UNIQUE(order_id, event_type) — true
  ✓  orders.user_id REFERENCES users(id) — true
  ✓  order_items.order_id REFERENCES orders(id) — true
  ✓  order_items.product_id REFERENCES products(id) — true
  ✓  notifications.user_id REFERENCES users(id) — true
  ✓  events.user_id REFERENCES users(id) — true
  ✓  sessions.user_id REFERENCES users(id) — true
  ✓  orders.user_id is NOT NULL — true
  ✓  orders.status is NOT NULL — true
  ✓  orders.total is NOT NULL — true
  ✓  order_items.quantity is NOT NULL — true
  ✓  notifications.user_id is NOT NULL — true
  ✓  notifications.type is NOT NULL — true
  ✓  notifications.message is NOT NULL — true
  ✓  products.name is NOT NULL — true
  ✓  products.price is NOT NULL — true

--- Summary ---
Scenarios: 17 (failed: 0)
Assertions: 97 (failed: 0)

P5.7 API -> DB validation run: PASS
```

**RUN #1 sonucu: 17/17 senaryo PASS, 97/97 assertion PASS, 0 failure.**
(Eski 88 sayısı artık **geçersizdir**.)

**Gerçek 88→97 dağılımı (fix round #2'de senaryo senaryo yeniden
sayılarak doğrulandı — önceki "+3/+1/+5" itemization'ı yanlıştı,
düzeltildi):**

| Senaryo | Öncesi | Sonrası | Fark | Neden |
|---|---|---|---|---|
| S1 | 4 | 3 | −1 | count+tek-ürün-stok kontrolü TEK `fullSnapshot` assertion'ına birleşti |
| S2 | 11 | 14 | +3 | B1 — API↔DB stock before/after/delta karşılaştırması eklendi |
| S3 | 3 | 2 | −1 | aynı birleşme |
| S4 (×3) | 3 her biri (9) | 2 her biri (6) | −3 | aynı birleşme |
| S5 (×2) | 3 her biri (6) | 2 her biri (4) | −2 | aynı birleşme |
| S6 | 2 | 2 | 0 | sayı aynı kaldı, İÇERİK güçlendi (round #2) |
| S12 | 5 | 6 | +1 | B3 — `notifications.user_id` orphan check eklendi |
| S13 | 8 | 20 | +12 | B3 — `notifications`/`events`/`sessions.user_id` REFERENCES (+3) + 9 representative NOT NULL kontrolü (+9) |
| Diğerleri (S0,S7,S8,S9,S10,S11) | değişmedi | değişmedi | 0 | — |

Net: (+3+1+12) − (1+1+3+2) = 16 − 7 = **+9** → 88+9=97. Fix round #2
(`fullSnapshot`'a `message`/`payload`/`created_at` eklenmesi) bu
dağılımı **değiştirmedi** — aynı sayıda assertion, daha zengin
karşılaştırılan içerik (bkz. bölüm 0, Fix Round #2 tablosu).

## 8. Repeatability — RUN #2 (Fix Round #2)

`npm run db:seed` ile tekrar reset edildikten sonra **aynı komut**
tekrar çalıştırıldı: **17/17 senaryo PASS, 97/97 assertion PASS, 0
failure.**

**Somut karşılaştırma (Codex'in her iki turdaki non-blocking notuna
yanıt — gerçek değerler yan yana, ve fix round #2'de `fullSnapshot`'a
`created_at`/`payload` eklendiği için bu tablo tekrar, dikkatle
gözden geçirildi):**

| Alan | RUN #1 | RUN #2 | Eşit mi? |
|---|---|---|---|
| S2 `orders.id` (approved order) | `1` | `1` | ✅ Evet — AUTOINCREMENT, deterministik |
| S2 `order_items.id` (aggregated row) | `1` | `1` | ✅ Evet — AUTOINCREMENT |
| S9 `notifications.id` (S2'nin notification'ı) | `1` | `1` | ✅ Evet — AUTOINCREMENT |
| S3-S6 snapshot'larındaki iş alanları (`user_id`, `status`, `total`, `product_id`, `quantity`, `unit_price`, `type`, `message`, `is_read`, tüm ürün `stock_quantity`'leri) | aynı değerler | aynı değerler | ✅ Evet — deterministik business state |
| S3-S6 snapshot'larının **TAM JSON metni** (`created_at`/`event_id`/`payload` dahil) | ör. `"created_at":"...21:47:33"`, `event_id:"3fa267ca-..."` | ör. `"created_at":"...21:47:38"`, `event_id:"be120b0e-..."` | ❌ **Hayır — beklenen, aşağıda açıklanıyor** |
| `events.event_id` | UUID (`crypto.randomUUID()`) | farklı UUID | ❌ **Hayır — beklenen** |
| `created_at` (tüm satırlarda) | gerçek wall-clock zaman damgası | farklı wall-clock zaman damgası | ❌ **Hayır — beklenen** |

**Doğru, tam kapsamlı ifade (fix round #2'de düzeltildi):**
`INTEGER PRIMARY KEY AUTOINCREMENT` sütunlu her tablonun (`orders`,
`order_items`, `notifications`, `products`, `users`) ID'leri VE bu
satırların iş-mantığı alanları (durum, miktar, fiyat, stok, mesaj
metni, `is_read`) iki run'da **gerçekten birebir aynıdır** —
`seed.js`'in AUTOINCREMENT sayaçlarını da sıfırlaması ve business
logic'in deterministik olması sayesinde. **Ancak** fix round #2'de
`fullSnapshot`'a eklenen `created_at` ve `events.payload`/`event_id`
alanları YÜZÜNDEN, S3-S6'nın before/after karşılaştırmasında
kullanılan snapshot'ın **TAM JSON metni**, RUN #1 ile RUN #2 arasında
**artık birebir aynı DEĞİLDİR** — her run kendi gerçek wall-clock
`created_at`'ını ve kendi rastgele `event_id`'sini üretir. **Bu bir
hata değildir ve zero-write assertion'ını geçersiz kılmaz:** S3-S6'nın
gerçek assertion'ı, AYNI RUN içinde alınan before-snapshot ile
after-snapshot'ın birbirine eşit olduğunu kanıtlar (`assertEqual(after,
before, ...)`) — bu karşılaştırma RUN #1'in kendi içinde ve RUN #2'nin
kendi içinde ayrı ayrı, gerçekten PASS oldu (her ikisinde de 0
failure). RUN #1 ile RUN #2'nin snapshot'larını birbirine eşitlemek
gibi bir iddia script'te **hiç yoktu ve evidence'ta da artık iddia
edilmiyor** — yalnızca yukarıdaki tabloda özetlenen, gerçekten
deterministik olan alt-küme (AUTOINCREMENT ID'ler + iş alanları)
run'lar arası karşılaştırılıyor.

---

## 9. Bulunan Bug'lar

**Application bug: YOK.** Approved/declined/timeout persistence
contract'ı, duplicate-line aggregation, API↔DB stock consistency
(artık gerçek cross-layer kanıtla), notification correlation,
ownership, observed data integrity, declared constraint'ler — hepsi
kaynak kodun söylediğiyle DB'nin gerçekte yaptığı birebir uyuştu.

**Database contract bug: YOK.** `notifications.user_id` dahil, tüm
DECLARED-IN-DDL constraint'ler gerçek `sqlite_master` DDL'inde mevcut;
OBSERVED-DATA-INTEGRITY sorguları da (`notifications.user_id` dahil)
0 orphan satır buldu.

**Test/documentation bug: YOK** (bu fix round'da script'in kendisinde
yeni bir hata bulunmadı; ilk uygulamadaki B1/B2/B3 eksiklikleri kod
hatası değil, kanıt gücü/kapsam eksikliğiydi).

---

## 10. Sonuç

**PASS** — API→DB tutarlılığı, **test edilen senaryolar kapsamında**,
şunları gerçek, cross-layer kanıtla içeriyor: approved order için hem
API hem DB'den okunan stok değerinin birbirine ve gerçek before/after
delta'sına eşit olduğu (B1); zero-write iddialarının artık
content-level (yalnızca count/identity değil — `notifications.message`
ve `events.payload` dahil mutation-sensitive içerik) kanıtlandığı
(B2, iki fix round'da tamamlandı); relational integrity'nin
DECLARED-IN-DDL ve OBSERVED-DATA-INTEGRITY olarak ayrı ayrı,
`notifications.user_id` dahil tam raporlandığı (B3). 2 ayrı
temiz-reset execution'da AUTOINCREMENT ID'ler ve iş-mantığı alanları
birebir aynı sonuç verdi (yalnızca `created_at` ve `events.event_id`
run'lar arası farklı — tasarım gereği, bkz. bölüm 8). Bu, "tüm
veritabanı byte-for-byte değişmedi" veya "genel ACID sertifikasyonu"
gibi bir iddia DEĞİLDİR — yalnızca S1/S3/S4/S5/S6'nın test ettiği
senaryolarda, ilgili tablo/alan kümesinin gözlemlendiği şekliyle
değişmediği kanıtlanmıştır. Hiçbir application veya database-contract
bug'ı bulunmadı.

## 11. Bilinen Sınırlamalar (Bu Paket Kapsamında)

- **Constraint ihlali davranışsal olarak tetiklenmedi.** S13 yalnızca
  DDL'de **tanımlı olduğunu** doğrular (yapısal); runtime'da gerçekten
  reddettiği ayrı bir iddiadır ve read-only script tarafından test
  edilmemiştir.
- **`PRAGMA foreign_keys = ON`** yalnızca sunucunun kendi bağlantısı
  için kaynak koddan doğrulandı; read-only script'in kendi
  bağlantısında yeniden test edilmedi.
- **Event/notification commit-ordering limitation (P4.3, bilinen)**
  bu pakette bağımsız test edilmedi/reprodüklenmedi — black-box API+DB
  testinin gözlemleyebileceği bir şey değil.
- **"Observed atomicity", garantili ACID transaction iddiası
  DEĞİLDİR.** Yalnızca test edilen senaryolarda (S1, S3, S4, S5, S6)
  gerçek zero-write davranışı kanıtlanmıştır.
- **Fresh vs existing DB (P4.6 bilinen sınırlaması):** Bu test, bu
  oturumdaki mevcut DB dosyasına karşı çalıştırıldı; çok eski, hiç
  yeniden oluşturulmamış bir DB dosyasının aynı constraint'lere sahip
  olacağı **garanti edilmez** (bkz. bölüm 6).
- Representative invalid-quantity matrix (S4) P5.5'in tam matrisini
  tekrar etmedi — yalnızca 3 risk-based temsili vaka.
- Newman'ın kendi transitive dependency ağacında (P5.1'den devralınan,
  bilinen, non-blocking) `npm audit` uyarıları hâlâ mevcut.
