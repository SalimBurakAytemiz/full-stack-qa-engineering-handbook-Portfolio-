# PHASE 6 — GraphQL / WebSocket / Event Testing — Execution Evidence

**Branch:** `feat/phase-6-19-full-completion-campaign`
**Campaign statüsü:** CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT
**Tarih:** 2026-09-24

> Evidence Integrity: aşağıdaki tüm sayılar bu oturumda gerçekten
> çalıştırılan komutların gerçek çıktısıdır. Hiçbir sonuç tahmin
> edilmemiş veya kurgulanmamıştır. Kesin base/head commit SHA'ları
> `.ai/PHASE-6-19-CAMPAIGN-STATE.md`'de ve bu paketi kapatan checkpoint
> commit mesajında belirtilir.

---

## 1. Kapsam (ROADMAP.md Phase 6) ve Karşılık Gelen Uygulama/Test

| ROADMAP kapsam maddesi | Uygulama | Test kanıtı |
|---|---|---|
| GraphQL Query | `backend/src/graphql/schema.js` (`Query`: health/products/product/order/me), `resolvers.js` | `graphql.test.js` — 8 Query testi |
| GraphQL Mutation | `Mutation`: login, createOrder | `graphql.test.js` — 3 login + 5 createOrder testi |
| GraphQL Error Handling | `graphql/index.js`: transport 400 (malformed request) vs. resolver-level `errors[]` + HTTP 200 ayrımı | `graphql.test.js` — validasyon hatası (unknown field) ve eksik `query` alanı testleri |
| Data Mapping | Resolver'lar `products.service`/`orders.service`'in ham DB satırlarını GraphQL tiplerine eşler (`in_stock` hesaplanmış boolean, nested `OrderItem[]`) | `graphql.test.js` — field-mapping assertion'ları (stock_quantity/in_stock, nested items) |
| WebSocket / Connection | Mevcut `websocketServer.js` (P4.3) — değişmedi | `websocket.test.js` (mevcut, 7 test) |
| Disconnect | Mevcut — `removeSocket` | `websocket.test.js` — "closing a connection removes it from the connected-user set" |
| Reconnect | Mevcut altyapı (yeniden `addSocket` çağrısı) — yeni testle kanıtlandı | `websocket-events-advanced.test.js` — WS Reconnect testi |
| Payload Validation | Mevcut `pushNotificationToUser` payload şekli — yeni testle kanıtlandı | `websocket-events-advanced.test.js` — WS Payload Validation testi |
| Duplicate Events | Delivery-katmanı fan-out (P5.7'nin DB-katmanı kanıtından FARKLI) | `websocket-events-advanced.test.js` — WS Duplicate Events testi |
| Delayed Events | Canlı bağlantı yokken oluşan notification'ın kalıcı olması ve sonradan fetch edilebilmesi | `websocket.test.js` (mevcut) — "an order created without any live connection still persists a fetchable notification" |
| Event Ordering | Ardışık order'ların push sırası | `websocket-events-advanced.test.js` — WS Event Ordering testi |
| Inbound Events | Sunucunun push-only olduğunun kanıtı — `websocketServer.js`'te `ws.on('message', ...)` YOK | `websocket-events-advanced.test.js` — WS Inbound Events testi |
| Outbound Events | Sunucudan istemciye push (notification mesajları) | Yukarıdaki tüm WS testleri zaten outbound push'u kanıtlıyor |
| Notification Events | `order.paid` event → notification persist → WS push zinciri | `websocket.test.js` + `websocket-events-advanced.test.js` + Phase 5 P5.6/P5.7 (REST/DB tarafı) |
| Firebase Events | **NOT IMPLEMENTED — bkz. Bölüm 5** | LEARNING-only, test edilmedi |

---

## 2. Yeni GraphQL Katmanı — Tasarım Kararları

- **Dependency:** `graphql` (npm, ^17.0.2, MIT, 0 transitive dependency,
  `npm audit` → 0 vulnerability). `graphql-http` / `express-graphql` /
  Apollo Server gibi bir framework EKLENMEDİ — `buildSchema()` (SDL) +
  `graphql()` execute fonksiyonu doğrudan kullanıldı. Gerekçe: tek
  endpoint, küçük şema; ek framework gereksiz dependency-ayak izi
  eklerdi (campaign dependency-policy kontrolü).
- **Business logic tekrarı YOK:** Resolver'lar mevcut
  `products.service.js` / `orders.service.js` / `auth.service.js`
  fonksiyonlarını doğrudan çağırır. Böylece stock validasyonu, ownership
  kontrolü, payment_token strictness, generic-auth-error (no info leak)
  gibi tüm güvenlik garantileri REST ile GraphQL arasında otomatik
  olarak parity'dedir (testlerde doğrudan aynı hata mesajlarıyla
  doğrulandı).
- **Auth paylaşımı:** `requireAuth.js` refactor edilerek
  `resolveSession(db, authorizationHeader)` export edildi; REST
  middleware'i de GraphQL context builder'ı da AYNI fonksiyonu çağırır
  — token parsing/validation mantığı iki kez yazılmadı.
- **Kritik güvenlik detayı — `payment_token` null/undefined ayrımı:**
  `createOrder` resolver'ında `payment_token` argümanı HİÇBİR dönüşüm
  yapılmadan `orders.service.createOrder()`'a geçirilir. `undefined`
  (argüman hiç verilmemiş) → servis onu "default: approved test token"
  olarak yorumlar (REST ile aynı davranış). Açıkça gönderilen
  `payment_token: null` ise servis tarafından REDDEDİLİR (400). İlk
  yazımda `paymentToken ?? undefined` kullanılmıştı — bu, açık `null`'ı
  sessizce `undefined`'a çevirip yanlışlıkla approve edilmesine yol
  açacaktı (P5.5 Codex B3 bulgusunun GraphQL transport'unda yeniden
  ortaya çıkması). Kod yazılırken (herhangi bir test çalıştırılmadan
  önce) fark edildi ve düzeltildi; regresyon testi
  (`graphql.test.js` — "explicit null payment_token is REJECTED")
  bunu kilitler.
- **HTTP status sözleşmesi:** Yalnızca gerçek bir transport hatası
  (`query` alanı hiç yoksa/boşsa) HTTP 400 döner. Çalıştırılan ama
  resolver-seviyesinde hata üreten her istek HTTP 200 + GraphQL'in
  kendi `errors[]` dizisi ile döner — GraphQL-over-HTTP spesifikasyonunun
  standart davranışı, REST'in status-code-based hata modeliyle
  KARIŞTIRILMADI.

---

## 3. Gerçek Test Çalıştırmaları

### 3.1 GraphQL test suite (yeni)

```
$ node --test tests/graphql.test.js
```
**Sonuç:** `tests 19, pass 19, fail 0` (ilk çalıştırmada 1 test
assertion hatası bulundu ve düzeltildi — bkz. Bölüm 4).

### 3.2 WebSocket advanced events test suite (yeni)

```
$ node --test tests/websocket-events-advanced.test.js
```
**Sonuç:** `tests 5, pass 5, fail 0` (ilk çalıştırmada geçti, ek
düzeltme gerekmedi).

### 3.3 Tam backend regresyonu (`node:test`, tüm dosyalar)

```
$ node --test tests/**/*.test.js tests/*.test.js
```
**Sonuç:** `tests 96, pass 96, fail 0` — Phase 0-5'in tüm mevcut
testleri (auth/products/orders/notifications/websocket/vb.) + yeni
Phase 6 testleri (19 GraphQL + 5 WS-advanced) birlikte, sıfır
regresyon.

### 3.4 Phase 5 bağımlılık spot-check (gerçek HTTP sunucu + Postman)

`requireAuth.js` refactor edildiği (yeni `resolveSession` export'u)
için, bu refactor'a en çok bağımlı olan Phase 5 paketi — protected
(auth) Postman koleksiyonu — gerçek bir çalışan sunucuya karşı ayrıca
çalıştırıldı (in-process `node:test` değil, gerçek `newman run`):

```
$ node src/server.js   # taze seed edilmiş DB, port 3000
$ npm run api:test:auth   # (api-tests/) qa-demo-system-protected.postman_collection.json
```
**Sonuç:** `requests 19/19, assertions 42/42, failed 0`. `resolveSession`
refactor'ı REST tarafında da davranışsal olarak birebir aynı.

Ayrıca canlı sunucuya karşı gerçek bir GraphQL isteği de manuel
doğrulandı:
```
$ curl -s -X POST http://localhost:3000/graphql -H 'Content-Type: application/json' \
    -d '{"query":"{ health products { id name in_stock } }"}'
{"data":{"health":"ok","products":[{"id":1,"name":"QA Demo Klavye","in_stock":true}, ...]}}
```

Test sonrası: sunucu durduruldu, `QA-DEMO-SYSTEM/data/qa-demo.db`
(runtime-generated, git-tracked DEĞİL) silindi; `git status --short`
yalnızca beklenen Phase 6 kaynak/test değişikliklerini gösterdi (stray
artifact yok).

**Toplam yeni test sayısı (Phase 6):** 19 (GraphQL) + 5 (WS-advanced)
= **24 yeni test**, hepsi geçiyor. Toplam backend suite: **96 test**.

---

## 4. Self-Review Sırasında Bulunan ve Düzeltilen Sorunlar

| # | Sorun | Düzeltme |
|---|---|---|
| 1 | (Kod yazımı sırasında, test'e gelmeden) `createOrder` resolver'ında `paymentToken ?? undefined` açık `null`'ı sessizce default'a çeviriyordu | `paymentToken` değiştirilmeden geçirildi; regresyon testi eklendi (Bölüm 2) |
| 2 | İlk test çalıştırmasında `order(id) requires auth` testi `body.data === null` bekliyordu, gerçek sonuç `body.data.order === null` idi | Bu bir kod hatası DEĞİL — `order` şemada NULLABLE bir alan, GraphQL null-propagation yalnızca NON-NULL (`!`) alan zincirlerinde `data`'yı tamamen null'lar. Test assertion'ı GraphQL spec'ine göre düzeltildi (`body.data.order`), resolver/schema değiştirilmedi. |

Başka blocker veya regresyon bulunmadı.

---

## 5. Firebase Events — Neden Test Edilmedi (Dürüst Sınıflandırma)

ROADMAP Phase 6 kapsamı "Firebase Events" içeriyor. Bu ortamda
(sandboxed container) gerçek bir Firebase projesi/hesabı, servis
hesabı kimlik bilgisi veya bulut erişimi YOKTUR — bu, repository
dışı yetki/gerçek bulut hesabı gerektiren bir durumdur (campaign'in
kendi "genuinely human-only" durdurma kriterlerinden biri: "authority
outside this repository is required"). Bu nedenle:

- Gerçek bir Firebase Cloud Messaging (FCM) entegrasyonu KURULMADI.
- Sahte/mock bir "Firebase test PASS" evidence'ı ÜRETİLMEDİ.
- Bunun yerine bu bölüm, QA-DEMO-SYSTEM'in mevcut push mimarisiyle
  FCM arasındaki kavramsal farkı LEARNING içeriği olarak belgeler:
  - Mevcut sistem: sunucu tarafında tutulan ham `ws` socket'leri
    (`Map<userId, Set<ws>>`), yalnızca aktif bağlantıya push; bağlantı
    yoksa mesaj yalnızca DB'de kalır (bkz. "Delayed Events" testi).
  - FCM ile gerçek bir kurulum farklı olurdu: sunucu tarafında bir
    FCM Admin SDK service-account credential'ı, istemci tarafında bir
    FCM device/registration token, ve Firebase'in kendi bulut
    altyapısı üzerinden (uygulama arka planda/kapalıyken bile)
    teslimat. Bu, bu projenin kapsamındaki (lokal, kimlik bilgisiz,
    tamamen self-hosted) demo sisteminin bilinçli mimari tercihinin
    (bkz. `ROADMAP.md` — framework-less, harici bulut bağımlılığı
    yok) dışındadır.
- **Sınıflandırma:** LEARNING/DOCUMENTATION-ONLY, NOT TESTED, NOT A
  BLOCKER (gerçek bulut kimlik bilgisi/hesap gerektirdiği için scope
  dışı — bkz. campaign'in insan-onayı gerektiren durumlar listesi).

---

## 6. Güvenlik / Secret / Generated-Artifact Taraması

```
$ git status --short
 M QA-DEMO-SYSTEM/backend/package.json
 M QA-DEMO-SYSTEM/backend/src/app.js
 M QA-DEMO-SYSTEM/backend/src/middleware/requireAuth.js
 M QA-DEMO-SYSTEM/package-lock.json
?? QA-DEMO-SYSTEM/backend/src/graphql/
?? QA-DEMO-SYSTEM/backend/tests/graphql.test.js
?? QA-DEMO-SYSTEM/backend/tests/websocket-events-advanced.test.js
```
- Runtime-generated `data/qa-demo.db` commit edilmedi (silindi).
- `jmeter.log` (önceki oturumdan kalan scratch dosyası) zaten
  temizlenmişti.
- Yeni dosyalarda gerçek secret/token/credential literal YOK —
  testlerde kullanılan `TEST-CARD-APPROVED`/`TEST-CARD-DECLINED`
  değerleri Phase 5'ten beri bilinen, deterministik SAHTE ödeme
  simülasyon token'larıdır (gerçek ödeme sistemine bağlanmaz).
- `package-lock.json` diff'i yalnızca `graphql` paketinin eklenmesiyle
  sınırlı (10 satır ekleme).

---

## 7. Bilinen Sınırlamalar (Known Limitations, Blocker DEĞİL)

1. GraphQL katmanında subscription (GraphQL-over-WebSocket real-time
   query) YOK — ROADMAP bunu ayrı bir madde olarak istemiyor (WebSocket
   zaten REST tetiklemesiyle ayrı bir push kanalı olarak var); bu
   bilinçli bir kapsam kararıdır, eksiklik değildir.
2. Firebase Events — Bölüm 5'te açıklandığı gibi LEARNING-only.
3. GraphQL şeması yalnızca mevcut REST yüzeyinin bir alt/eşdeğer
   kümesini kapsar (health/products/product/order/me query'leri,
   login/createOrder mutation'ları) — REST'te olmayan yeni bir iş
   kuralı GraphQL için icat edilmedi (campaign'in "no scope creep"
   kuralı).

---

## 8. Açık Blocker Sayısı: **0**

## 9. Sonuç

Phase 6 kapsamındaki 16 ROADMAP maddesinden 15'i gerçek kod + gerçek
test ile kanıtlandı; 1'i (Firebase Events) dürüstçe LEARNING-only
olarak sınıflandırıldı. Toplam 24 yeni test (19 GraphQL + 5 WS
advanced) eklendi, tam backend regresyonu 96/96 yeşil, Phase 5
bağımlılığı (requireAuth refactor) gerçek Postman koleksiyonuna karşı
ayrıca doğrulandı (19/19 request, 42/42 assertion). Açık blocker: 0.

**Statü: CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT.**
