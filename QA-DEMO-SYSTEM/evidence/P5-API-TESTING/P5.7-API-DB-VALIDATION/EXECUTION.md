# P5.7 — API → DB Validation — Execution Evidence

**Branch:** `feat/phase-5-7-api-db-validation`
**Tarih:** 2026-09-23

> Bu kayıt, aşağıdaki validation run'larının **gerçekten çalıştırılmış**
> sonucudur (`CONTRIBUTING.md` — Evidence Integrity). Hiçbir sonuç
> tahmin edilmemiş veya kurgulanmamıştır. Bu dosya kendi commit
> hash'ine self-reference edemez (P5.4/P5.5/P5.6'da açıklanan aynı
> matematiksel kısıt) — kesin hash bu paketi kapatan Türkçe rapor'da
> ve `git log --oneline -1 feat/phase-5-7-api-db-validation`
> çıktısında belirtilir.

---

## 0. P5.7'nin Kapattığı Boşluk

P5.1–P5.6, API response'larının **doğru göründüğünü** kanıtladı —
hiçbiri veritabanının kendisini açmadı. P5.5 ve P5.6'nın evidence'ları
bu boşluğu açıkça belgeledi (ör. P5.5 bölüm 12: "order/order_items
DB'de hiç yazılmadığı iddiası... doğrudan SQL gerektirir — P5.7'ye
bırakıldı"; P5.6 bölüm 15: "API→DB doğrudan SQL assertion'ı yok").
P5.7 bu boşluğu kapatır: her senaryo için gerçek API çağrısı + gerçek
SQLite dosyasına doğrudan, **read-only** bir bağlantıdan `SELECT`
sorgusu — ikisi karşılaştırılır.

## 1. Mimari ve DB Access Model

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
  — SQLite seviyesinde gerçek read-only garanti (yazma denemesi
  reddedilir). Validation script'i **hiçbir zaman** `INSERT`/`UPDATE`/
  `DELETE` çalıştırmaz; tek reset mekanizması, mevcut, canonical
  `npm run db:seed` komutudur (script dışından, elle çalıştırılır —
  P5.1'den beri kullanılan pattern).
- **Neden Postman/Newman değil:** Newman'ın SQL çalıştırma kapasitesi
  yok — P5.2'nin compatibility-gate bulgusu zaten Newman'ın pm.test()
  sandbox'ının pinlenmiş bir dependency'yi bile güvenilir şekilde
  çözemediğini kanıtlamıştı (bkz. `run-schema-validation.js`). Bu
  yüzden `scripts/run-api-db-validation.js` — Node'un **built-in**
  `node:sqlite` ve `fetch`'i dışında hiçbir yeni dependency eklemeyen,
  minimal, tek dosyalık bir script — yazıldı. Mevcut Postman
  collection'ları (P5.1-P5.6) **değiştirilmedi/atılmadı**; bu, onlara
  ek, dördüncü bir doğrulama katmanıdır.
- **Concurrent access güvenliği:** Sunucu (read-write) ve validation
  script'i (read-only) aynı SQLite dosyasını eşzamanlı açar. Bu,
  script yazılmadan önce gerçek bir concurrent-read probe'u ile
  ampirik olarak doğrulandı (bkz. bölüm 2) — kilitlenme/tutarsızlık
  gözlenmedi.

## 2. Ön-Doğrulama Probe'ları (Script Yazılmadan Önce, Ampirik)

Script'in mimari varsayımlarını (readOnly açılış çalışır mı, sunucu
ile eşzamanlı okuma güvenli mi, declined/timeout gerçekten satır
bırakıyor mu) kod yazmadan önce gerçek `curl`/`node -e` prob'larıyla
doğruladım — tahmin edilmedi:

1. `new DatabaseSync(dbPath, {readOnly:true, open:true})` gerçek dosya
   üzerinde başarıyla açıldı, `sqlite_master`'ı sorguladı.
2. Sunucu ayaktayken (`node --watch src/server.js`) aynı dosyaya
   read-only bağlantı açıp sorgu çalıştırmak sorunsuz çalıştı.
3. Gerçek bir `POST /api/orders` (approved) çağrısından hemen sonra
   yeni bir read-only bağlantıyla `SELECT * FROM orders WHERE id=?`
   çalıştırıldığında, satır **anında** görünür oldu (commit sonrası
   gecikme/stale-read yok — `db.exec('COMMIT')` senkron ve HTTP
   response'dan önce tamamlanıyor, kaynak koddan doğrulandı).
4. **Kritik bulgu — declined/timeout "zero write" DEĞİLDİR:** Kaynak
   kod (`orders.service.js`) okunduğunda `insertOrder.run(...)` ve her
   satır için `insertItem.run(...)`'ın `if (status === 'PAID')`
   bloğundan **ÖNCE**, koşulsuz çalıştığı görüldü — yalnızca
   `decrementStock`, `createOrderPaidEvent`, `createNotificationFromOrderPaidEvent`
   `PAID`'e özeldir. Bu, gerçek bir declined çağrısıyla ampirik olarak
   da doğrulandı: `order` ve `order_items` satırları **var**,
   `stock`/`notification`/`event` **yok**. P5.5/P5.6'nın "declined →
   201 döner, order oluşturulur" ifadeleri API-seviyesinde zaten
   doğruydu; P5.7 bunu artık DB satırı seviyesinde de kanıtlıyor.

## 3. Reset ve Baseline

- **Reset:** `cd QA-DEMO-SYSTEM/backend && npm run db:seed` — mevcut,
  canonical komut (yeni bir reset mekanizması **oluşturulmadı**).
  `seed.js` yalnızca `DELETE FROM ...` + `INSERT` yapar, AUTOINCREMENT
  sayaçlarını da sıfırlar (`resetAutoincrement Counters`) — bu yüzden
  her reset sonrası üretilen ID'ler **deterministik olarak aynıdır**
  (kaynak koddan doğrulandı, bkz. `seed.js`).
- **Baseline (S0 senaryosu, gerçek sorgu sonucu):** `orders=0`,
  `order_items=0`, `notifications=0`, `events=0`, `users=2`,
  `products` stok: `{1:25, 2:0, 3:5, 4:12}` — `shared/test-data/`
  ile birebir eşleşiyor.
- **Komut:** `cd QA-DEMO-SYSTEM/api-tests && npm run api:test:db`
  (sunucunun `npm run dev`/`node --watch src/server.js` ile ayakta
  olması ve hemen öncesinde `db:seed` çalıştırılmış olması önkoşuldur
  — script bunu kendisi yapmaz, P5.1-P5.6 ile aynı manuel-reset
  konvansiyonu).

## 4. Senaryo Kategorileri

| # | Senaryo | Kategori | Talimat maddesi |
|---|---|---|---|
| S0 | Baseline determinism | Reset | 26 |
| S1 | **GATE** — unknown product_id → zero write | Atomicity | 4, 11 |
| S2 | Approved order — full API↔DB trace + duplicate aggregation | Persistence + Consistency | 7, 8, 16, 17, 18, 21 |
| S3 | Insufficient stock → zero write | Atomicity | 9 |
| S4 | Invalid quantity (×3 temsili) → zero write | Atomicity | 10 |
| S5 | Invalid payment_token (false, 0) → zero write | Atomicity | 14 |
| S6 | Malformed JSON → zero write | Atomicity | 15 |
| S7 | Declined payment → persistence contract | Persistence | 12 |
| S8 | Timeout payment → persistence contract | Persistence | 13 |
| S9 | Notification API↔DB correlation | Consistency | 19 |
| S10 | Duplicate notification DB check | Persistence | 20 |
| S11 | Ownership DB check | Ownership | 21 |
| S12 | Relational integrity (orphan-row check) | Integrity | 22 |
| S13 | Constraint definitions (structural, DDL inceleme) | Constraint | 23 |

**Duplike edilmeyen/gerekçeli atlanan maddeler:**
- Madde 11'in "invalid product → zero write" isteği, S1'in gate'iyle
  **birebir aynı regresyondur** — ayrı bir senaryo olarak tekrar
  edilmedi (talimatın kendi notu: "Bu P5.7'nin ilk gate'iyle aynı
  regression olabilir. Duplicate test üretme.").
- Madde 25 (event/notification commit ordering): P4.3'ün bilinen
  limitation'ı **log satırlarının** commit'ten önce yazılmasıyla
  ilgilidir (`console.log`), DB satırlarıyla değil. `createOrder()`
  senkron çalışır ve `db.exec('COMMIT')` HTTP response'dan önce
  tamamlanır — bu, black-box API+DB testinin gözlemleyebileceği bir
  race değildir (log satırının stdout'a ne zaman yazıldığı, DB
  read-only sorgusuyla gözlenemez). Bu yüzden **KNOWN LIMITATION,
  P5.7'de bağımsız olarak test edilmedi/reprodüklenmedi** olarak
  bırakıldı — "RESOLVED" yazılmadı (bkz. bölüm 9).

## 5. Runner ve Gerçek Çalıştırma Sonucu — RUN #1

```bash
cd QA-DEMO-SYSTEM/backend && npm run db:seed
cd QA-DEMO-SYSTEM/api-tests && npm run api:test:db
```

Tam çıktı (RUN #1, `npm run db:seed` sonrası ilk çalıştırma):

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
  ✓  orders/order_items/notifications/events counts unchanged (zero write) — = {"orders":0,"order_items":0,"notifications":0,"events":0}
  ✓  product stock unchanged — = 12

PASS  S2. Approved order — full API<->DB trace + duplicate-line aggregation DB proof
  ✓  API returns 201 — = 201
  ✓  API order.status is PAID — = "PAID"
  ✓  order row exists in DB — {"id":1,"user_id":1,"status":"PAID","total":749.5,"created_at":"2026-09-23 14:59:05"}
  ✓  order.user_id in DB matches authenticated USER A (seeded id 1) — = 1
  ✓  order.status in DB matches API response — = "PAID"
  ✓  order.total in DB matches API response — = 749.5
  ✓  exactly ONE order_items row (Map-based aggregation, not two separate rows) — = 1
  ✓  aggregated row product_id is 1 — = 1
  ✓  aggregated row quantity is 5 (2+3), proven via direct SQL not API inference — = 5
  ✓  aggregated row unit_price matches product 1 price — = 149.9
  ✓  product 1 stock decreased by exactly the aggregated quantity (5), read via direct SQL — = 20

PASS  S3. Insufficient stock request -> zero DB write
  ✓  API rejects with 409 — = 409
  ✓  orders/order_items/notifications/events counts unchanged — = {"orders":1,"order_items":1,"notifications":1,"events":1}
  ✓  product 3 stock unchanged — = 5

PASS  S4. Invalid quantity (string "2") -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  orders/order_items/notifications/events counts unchanged — = {"orders":1,"order_items":1,"notifications":1,"events":1}
  ✓  product 1 stock unchanged — = 20

PASS  S4. Invalid quantity (boolean true) -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  orders/order_items/notifications/events counts unchanged — = {"orders":1,"order_items":1,"notifications":1,"events":1}
  ✓  product 1 stock unchanged — = 20

PASS  S4. Invalid quantity (null) -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  orders/order_items/notifications/events counts unchanged — = {"orders":1,"order_items":1,"notifications":1,"events":1}
  ✓  product 1 stock unchanged — = 20

PASS  S5. Invalid payment_token (false) -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  orders/order_items/notifications/events counts unchanged — = {"orders":1,"order_items":1,"notifications":1,"events":1}
  ✓  product 4 stock unchanged — = 12

PASS  S5. Invalid payment_token (0) -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  orders/order_items/notifications/events counts unchanged — = {"orders":1,"order_items":1,"notifications":1,"events":1}
  ✓  product 4 stock unchanged — = 12

PASS  S6. Malformed JSON body -> zero DB write
  ✓  API rejects with 400 — = 400
  ✓  orders/order_items/notifications/events counts unchanged — = {"orders":1,"order_items":1,"notifications":1,"events":1}

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
  ✓  notification created_at matches between API and DB — = "2026-09-23 14:59:05"
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

PASS  S12. Relational integrity — no orphan rows
  ✓  no order_items row references a non-existent order — = 0
  ✓  no notifications row references a non-existent order — = 0
  ✓  no events row references a non-existent order — = 0
  ✓  no order_items row references a non-existent product — = 0
  ✓  no orders row references a non-existent user — = 0

PASS  S13. Constraint definitions present in schema (structural, read-only)
  ✓  products.stock_quantity has CHECK (>= 0) — true
  ✓  order_items.quantity has CHECK (> 0) — true
  ✓  notifications.is_read has CHECK (IN (0,1)) — true
  ✓  notifications has UNIQUE(order_id, type) — true
  ✓  events has UNIQUE(order_id, event_type) — true
  ✓  orders.user_id REFERENCES users(id) — true
  ✓  order_items.order_id REFERENCES orders(id) — true
  ✓  order_items.product_id REFERENCES products(id) — true

--- Summary ---
Scenarios: 17 (failed: 0)
Assertions: 88 (failed: 0)

P5.7 API -> DB validation run: PASS
```

**RUN #1 sonucu: 17/17 senaryo PASS, 88/88 assertion PASS, 0 failure.**

## 6. Repeatability — RUN #2

`npm run db:seed` ile tekrar reset edildikten sonra **aynı komut**
tekrar çalıştırıldı:

```text
--- Summary ---
Scenarios: 17 (failed: 0)
Assertions: 88 (failed: 0)

P5.7 API -> DB validation run: PASS
```

**RUN #2 sonucu: 17/17 senaryo PASS, 88/88 assertion PASS, 0 failure.**
RUN #1 ile karşılaştırıldığında (yalnızca `created_at` timestamp
değerleri hariç) **çıktı birebir aynıdır** — `seed.js`'in AUTOINCREMENT
sayaçlarını da sıfırlaması sayesinde üretilen `order.id`,
`order_items.id`, `notifications.id` değerleri bile iki run'da
**birebir eşleşiyor** (P5.5/P5.6'dan daha güçlü bir determinism kanıtı
— onlarda yalnızca business-state deltaları eşleşiyordu, burada mutlak
ID'ler de eşleşiyor). Manuel müdahale gerekmedi.

---

## 7. Bulunan Bug'lar

**Application bug: YOK.** Approved/declined/timeout persistence
contract'ı, duplicate-line aggregation, stock consistency, notification
correlation, ownership, relational integrity, constraint tanımları —
hepsi kaynak kodun söylediğiyle DB'nin gerçekte yaptığı birebir
uyuştu. P5.5/P5.6'nın "kaynak koddan okundu ama doğrulanmadı" olarak
işaretlediği tüm iddialar (transaction atomicity, declined/timeout
persistence, notification duplicate-önleme) burada **gerçekten
doğrulandı**, hiçbir sapma bulunmadı.

**Database contract bug: YOK.** Dokümante edilen constraint'lerin
hepsi (`CHECK`, `UNIQUE`, `REFERENCES`) gerçek `sqlite_master` DDL'inde
mevcut.

**Test/documentation bug: YOK** (P5.7'nin kendi script'inde, ilk
taslakta USER A/USER B seeded id'lerini yanlış varsaymıştım —
`auth-users.json`'ı tekrar okuyup script'i çalıştırmadan **önce**
düzelttim; bu evidence'a yansıyan hiçbir yanlış sayı yoktur, ayrı bir
"düzeltilen bug" maddesi olarak da sayılmaz çünkü hiç commit/evidence'a
girmedi).

---

## 8. Sonuç

**PASS** — API→DB tutarlılığı (approved/declined/timeout persistence
contract'ı, duplicate-line aggregation DB satırı seviyesinde, stock
API↔DB consistency, notification API↔DB correlation, duplicate
notification yokluğu, ownership, relational integrity, constraint
tanımları) kapsamlı şekilde, gerçek read-only SQL sorgularıyla
doğrulandı; 2 ayrı temiz-reset execution'da (mutlak ID'ler dahil)
birebir aynı sonuç; hiçbir application veya database-contract bug'ı
bulunmadı.

## 9. Bilinen Sınırlamalar (Bu Paket Kapsamında)

- **Constraint ihlali davranışsal olarak tetiklenmedi.** S13, `CHECK`/
  `UNIQUE`/`REFERENCES` tanımlarının DDL'de **var olduğunu** doğrular
  (yapısal inceleme) — bu script read-only olduğu için gerçek bir
  ihlal denemesi (ör. duplicate `INSERT`) **yapılmadı**. Constraint'in
  DEFINE edildiği kanıtlanmıştır; RUNTIME'da gerçekten reddettiği ayrı
  bir iddiadır ve burada test edilmemiştir.
- **`PRAGMA foreign_keys = ON` bu script'in kendi bağlantısında
  yeniden doğrulanmadı.** Bu pragma'nın sunucunun kendi bağlantısında
  ayarlandığı yalnızca kaynak koddan (`connection.js`) doğrulandı —
  read-only bir script'in FK enforcement'ı davranışsal olarak
  kanıtlaması bir ihlal denemesi gerektirir, bu paket kapsamında
  yapılmadı.
- **Event/notification commit-ordering limitation (P4.3, bilinen)**
  bu pakette bağımsız olarak test edilmedi/reprodüklenmedi — black-box
  API+DB testinin gözlemleyebileceği bir şey değil (bkz. bölüm 4).
  RESOLVED olarak işaretlenmedi, KNOWN LIMITATION olarak kalır.
- **"Observed atomicity", garantili ACID transaction iddiası
  DEĞİLDİR.** S1/S3/S4/S5/S6, test edilen senaryolarda gerçek zero-write
  davranışı kanıtlar — bu, test edilmemiş senaryolar için (ör. process
  crash tam `COMMIT` sırasında) bir garanti iddiası değildir.
- Representative invalid-quantity matrix (S4) P5.5'in tam matrisini
  (9 vaka) tekrar etmedi — yalnızca 3 risk-based temsili vaka (`"2"`,
  `true`, `null`) SQL seviyesinde doğrulandı, talimatın kendi notuna
  uygun ("bütün matrix'i SQL'e kopyalama").
- Newman'ın kendi transitive dependency ağacında (P5.1'den devralınan,
  bilinen, non-blocking) `npm audit` uyarıları hâlâ mevcut.
