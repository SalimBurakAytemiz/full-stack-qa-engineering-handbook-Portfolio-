# QA Demo System — Run Instructions

> Bu doküman, `ARCHITECTURE.md`'de kararlaştırılan çalıştırma
> yöntemine (`npm install && npm run dev`) göre QA Demo System'in
> (P4.1 Authentication + Products, P4.2 Orders + Fake Payment, P4.3
> Events + Notifications kümülatif kapsamı) nasıl kurulup
> çalıştırılacağını, resetleneceğini ve doğrulanacağını anlatır.
> Smoke doğrulamasını kendiniz çalıştırmak için bkz.
> [`SMOKE-CHECKLIST.md`](SMOKE-CHECKLIST.md).

---

## Gereksinimler

- Node.js `>= 22.5.0` (bu sistem `node:sqlite` yerleşik modülünü
  kullanır; harici bir SQLite paketi/native binding gerekmez).
- Docker **gerekli değildir** (Human Founder kararı — bkz.
  `ARCHITECTURE.md` bölüm 6).

---

## Kurulum

Repository kökünden:

```bash
cd QA-DEMO-SYSTEM
npm install
```

Bu komut, `backend/` workspace'inin tüm bağımlılıklarını (yalnızca
`express`) kurar.

---

## Çalıştırma

```bash
npm run dev
```

- Backend `http://localhost:3000` adresinde ayağa kalkar (varsayılan
  port, `PORT` environment variable'ı ile değiştirilebilir).
- Frontend, backend tarafından statik olarak aynı adresten servis
  edilir — ayrı bir frontend sunucusu/port gerekmez.
- Veritabanı boşsa (`backend/data/qa-demo.db` yoksa veya `users`
  tablosu boşsa) sistem otomatik olarak `shared/test-data/` içindeki
  seed data ile kendini doldurur.

Tarayıcıda:

- `http://localhost:3000/` → Login ekranı
- `http://localhost:3000/products.html` → Ürün listesi ekranı

---

## Database Reset

Veritabanını sıfırlayıp yeniden seed etmek için:

```bash
npm run db:seed
```

Bu komut `notifications`, `events`, `order_items`, `orders`,
`sessions`, `users` ve `products` tablolarındaki **tüm** satırları
siler (yalnızca `users`/`products` değil — sipariş/oturum/event/
notification geçmişi de tamamen temizlenir), AUTOINCREMENT
sayaçlarını sıfırlar, ardından `users`/`products` tablolarını
`shared/test-data/auth-users.json` + `shared/test-data/products.json`
dosyalarından yeniden doldurur — deterministik ve tekrar
üretilebilirdir.

Veritabanı dosyasını (`backend/data/qa-demo.db`) tamamen silmek de
güvenlidir; bir sonraki `npm run dev` çalıştırıldığında dosya ve şema
otomatik olarak yeniden oluşturulur.

---

## Test Kullanıcıları

Kaynak: `shared/test-data/auth-users.json` (Phase 2'nin
`03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/11-TEST-DATA.md`
dosyasındaki USER-01/USER-02 ile birebir aynı sentetik veriler).

| Email | Password | Status | Kullanım |
|---|---|---|---|
| `test.active01@example.com` | `ValidPass123!` | ACTIVE | Valid login senaryosu |
| `test.active02@example.com` | `ValidPass123!` | ACTIVE | İkinci aktif kullanıcı |

- **Invalid password senaryosu:** Yukarıdaki kullanıcılardan biriyle,
  yanlış bir şifre (örn. `WrongPass999!`) kullanın.
- **Unknown user senaryosu:** Sistemde kayıtlı olmayan herhangi bir
  email (örn. `nope@example.com`) kullanın.

Her iki hatalı senaryo da BR-AUTH-003 gereği **aynı** genel mesajı
döner: `"Email veya şifre hatalı"` — hangi alanın hatalı olduğu
belirtilmez.

> Not: Bu şifreler tamamen kurgusal test verisidir, gerçek bir
> kullanıcıya ait değildir (bkz. `CONTRIBUTING.md` — Real Company Data
> Rule). Demo veritabanında parolalar düz metin olarak saklanır; bu,
> P4.1'in minimum bağımlılık ilkesi gereği bilinçli bir tercihtir ve
> gerçek bir üretim güvenlik pratiği değildir.

---

## Seed Ürünleri

Kaynak: `shared/test-data/products.json`.

| Ürün | Fiyat | Stok |
|---|---|---|
| QA Demo Klavye | 149.90 | 25 (stokta) |
| QA Demo Mouse | 49.90 | 0 (stok yok) |
| QA Demo Monitör | 899.90 | 5 (stokta) |
| QA Demo Webcam | 259.90 | 12 (stokta) |

---

## Endpoint'ler (P4.1 + P4.2 + P4.3 Kapsamı)

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/health` | Servis ayakta mı kontrolü |
| POST | `/api/auth/login` | `{ email, password }` → `200 + token/user` veya `401` |
| GET | `/api/products` | Tüm ürünlerin listesi (`in_stock` alanıyla) |
| GET | `/api/products/:id` | Tek ürün; yoksa `404` |
| POST | `/api/orders` | **Authenticated.** `{ items: [{product_id, quantity}], payment_token }` → `201` + sipariş durumu, veya `400`/`401`/`409` |
| GET | `/api/orders/:id` | **Authenticated.** Yalnızca siparişin sahibi görebilir; başkasının siparişi veya yoksa `404` |
| GET | `/api/notifications` | **Authenticated.** Yalnızca kendi notification'larını listeler |
| WS | `/ws?token=<token>` | **Authenticated.** Realtime notification delivery (bkz. aşağıda) |

`POST /api/orders`, `GET /api/orders/:id` ve `GET /api/notifications`,
`Authorization: Bearer <token>` header'ı ister (`token`, login
yanıtından alınır).

### Events & Notifications (P4.3)

Yalnızca **PAID** olan bir sipariş `order.paid` event'i üretir (bkz.
`events` tablosu); `declined`/`timeout` siparişler hiçbir event/
notification üretmez. Her `order.paid` event'i, ilgili kullanıcı için
bir `notifications` satırı oluşturur (`GET /api/notifications` ile
görüntülenebilir) ve eş zamanlı olarak WebSocket üzerinden bağlı
client'a `{"type":"notification","notification":{...}}` şeklinde push
edilir.

WebSocket bağlantısı `ws://<host>/ws?token=<sessionToken>` adresine
kurulur (token, query string ile — tarayıcı WebSocket API'si custom
header desteklemediği için). Geçersiz/eksik token veya `/ws` dışında
bir path → bağlantı `401` ile reddedilir, anonim erişim yoktur.
Realtime delivery **best-effort**'tür: notification zaten kalıcı
olarak DB'ye yazıldığından, kullanıcı o an bağlı değilse bile
`GET /api/notifications` ile daha sonra görebilir.

`events` ve `notifications` tablolarında `UNIQUE(order_id, event_type)`
/ `UNIQUE(order_id, type)` constraint'leri, aynı sipariş için yanlışlıkla
iki kez event/notification üretilmesine karşı basit, deterministik bir
koruma sağlar (genel bir idempotency sistemi değildir — bkz. aşağıdaki
"Bilinen Sınırlama").

### Fake Payment Simulation Test Token'ları

Kaynak: `shared/test-data/payment-test-patterns.json`. Gerçek bir kart
numarası formatı **kullanılmaz** — açıkça test amaçlı, deterministik
token'lar kullanılır:

| `payment_token` | Sonuç | Sipariş Durumu |
|---|---|---|
| `TEST-CARD-APPROVED` (varsayılan, gönderilmezse otomatik uygulanır) | approved | `PAID` |
| `TEST-CARD-DECLINED` | declined | `PAYMENT_FAILED` |
| `TEST-CARD-TIMEOUT` | timeout | `PAYMENT_TIMEOUT` |

Stok yalnızca `PAID` durumundaki siparişlerde düşülür — `declined`/
`timeout` siparişleri ürün stokunu etkilemez.

### Bilinen Sınırlama — Idempotency

`POST /api/orders` **idempotent değildir**: aynı istek (örn. bir ağ
zaman aşımı sonrası client retry'ı) birden fazla kez gönderilirse,
her istek **ayrı bir sipariş** oluşturur ve `PAID` sonuçlar için ayrı
ayrı stok düşer. Bu, P4.0/P4.2 acceptance criteria'sında (bkz.
`ARCHITECTURE.md` bölüm 24) yer almayan bir gereksinimdir; bu yüzden
P4.2 kapsamında ayrı bir idempotency-key alt sistemi **kurulmamıştır**
(scope creep'ten kaçınmak için). Bu risk bilinçli olarak
dokümante edilmiştir ve gelecekteki bir Phase 4 paketi/backlog
maddesi olarak değerlendirilebilir. P4.3'te de aynı ilke korunmuştur:
`events`/`notifications` tablolarındaki `UNIQUE` constraint'leri yalnızca
aynı sipariş için *yanlışlık sonucu* iki kez event/notification
üretilmesini engeller — genel bir HTTP request idempotency sistemi
**değildir** ve P4.2'nin bilinçli olarak kapsam dışı bıraktığı
idempotency riskini kapatmaz.

### Bilinen Sınırlamalar — Codex P4.3 Delta Review Notları (Non-Blocking)

Codex'in P4.3 bağımsız review'ünde (verdict: PASS WITH NON-BLOCKING
NOTES) tespit edilen, blocker sayılmayan ve bilinçli olarak
düzeltilmeyen 3 konu:

1. **Frontend'de olası çift görünüm (technical QA note):**
   `products.html` açıldığında hem `GET /api/notifications` (geçmiş)
   hem WebSocket (canlı) yüklemesi eş zamanlı gerçekleşebilir; aynı
   notification frontend'de iki kez listelenebilir. **Database'de
   duplicate satır oluşmaz** (`UNIQUE(order_id, type)` korur) — bu
   yalnızca bir görsel/UI sunum sorunudur, veri bütünlüğü sorunu
   değildir. Future hardening: frontend'de `notification.id` bazlı
   de-duplication (P4.3 sonrası bir pakette ele alınabilir).
2. **Log zamanlaması (known limitation):** `[event] emitted` ve
   `[notification] persisted` logları, ilgili `INSERT` çalıştığı anda
   yazılır — bu satırlar SQLite transaction'ı henüz `COMMIT`
   edilmeden önce üretilir. Transaction daha sonra (teorik olarak) bir
   hata nedeniyle `ROLLBACK` olursa, log çıktısı gerçekleşmemiş bir
   durumu "emitted/persisted" olarak yanıltıcı şekilde gösterebilir.
   Bu Phase 4 demo kapsamında düşük risklidir (P4.3 test suite'inde
   bu yolu tetikleyen bir hata senaryosu yoktur); future hardening:
   log'u transaction commit'inden sonra yazmak.
3. **WebSocket negatif testlerindeki sabit bekleme penceresi
   (technical QA note):** `websocket.test.js`'teki "başka kullanıcı
   mesaj almıyor" ve "DECLINED order mesaj push etmiyor" testleri,
   "mesaj gelmedi" durumunu doğrulamak için 100ms'lik sabit bir
   bekleme kullanır. Yoğun/yavaş CI ortamlarında teorik olarak düşük
   olasılıklı bir false-positive (test'in gerçekte push edilecek bir
   mesajı, süre dolmadan henüz gelmediği için "gelmedi" olarak
   yanlış raporlaması) riski taşır. Backlog: event-driven senkron bir
   doğrulama deseni (örn. birkaç kontrol turu / polling) ile
   değiştirilmesi ileride değerlendirilebilir.

---

## Otomatik Testler

```bash
npm test
```

`backend/tests/` altında `node --test` (harici test framework
gerekmez) ile çalışan minimum kapsam:

- `auth.test.js`: valid login, invalid password, unknown user
- `products.test.js`: ürün listesi (stokta/stok yok), tekil ürün,
  bilinmeyen ürün → 404
- `orders.test.js`: approved/declined/timeout payment token'ları,
  varsayılan token, authsız istek → 401, yetersiz stok → 409, sipariş
  görüntüleme ve başka kullanıcının siparişine erişim → 404, duplicate
  ürün satırı aggregation, geçersiz tip validasyonu, malformed JSON
- `events.test.js`: PAID → tek `order.paid` event, DECLINED/TIMEOUT →
  event yok, `event_id` unique, event contract, duplicate event UNIQUE
  guard
- `notifications.test.js`: PAID → notification persist, DECLINED/
  TIMEOUT → notification yok, başka kullanıcı göremiyor, anonim/forged
  token → 401, duplicate notification UNIQUE guard
- `websocket.test.js`: authenticated bağlantı, geçersiz token reddi,
  yanlış path reddi, doğru kullanıcıya realtime delivery, başka
  kullanıcı almıyor, DECLINED sipariş mesaj push etmiyor, bağlantı
  kapanınca temizleniyor, bağlantısız kullanıcı için notification yine
  de kalıcı/erişilebilir
- `seed.test.js`: seed işleminin deterministik şekilde users/products/
  events/notifications tablolarını doldurduğu ve resetlediği, CHECK/
  FOREIGN KEY/UNIQUE constraint'lerinin DB seviyesinde uygulandığı

---

## Smoke Doğrulama Adımları (Tarihsel — P4.1–P4.3 Kapanışları)

Aşağıdaki adımlar, ilgili paketlerin kapanışlarında (P4.1: madde
1–9; P4.2: madde 10–15; P4.3: madde 16–21) gerçek sistem üzerinde
çalıştırılıp doğrulanmıştır. **P4.5'in resmi, güncel ve tekrar
çalıştırılabilir smoke checklist'i için bkz.
[`SMOKE-CHECKLIST.md`](SMOKE-CHECKLIST.md)** — bu liste tarihsel bir
kayıt olarak burada bırakılmıştır.

1. `npm install` → hatasız tamamlanır.
2. `npm run dev` → `"QA Demo System backend http://localhost:3000
   adresinde çalışıyor."` log satırı görülür.
3. `GET /api/health` → `{"status":"ok"}`.
4. `GET /` ve `GET /products.html` → `200 OK`.
5. `POST /api/auth/login` (valid user) → `200` + token.
6. `POST /api/auth/login` (invalid password) → `401` + genel mesaj.
7. `POST /api/auth/login` (unknown user) → `401` + aynı genel mesaj.
8. `GET /api/products` → 4 ürün, en az biri `in_stock:false`.
9. `GET /api/products/:id` (var olan) → `200`; (olmayan) → `404`.
10. `POST /api/orders` (token olmadan) → `401`.
11. `POST /api/orders` (`TEST-CARD-APPROVED`) → `201` + `PAID`; ilgili
    ürünün stoku düşer.
12. `POST /api/orders` (`TEST-CARD-DECLINED`) → `201` + `PAYMENT_FAILED`;
    stok değişmez.
13. `POST /api/orders` (`TEST-CARD-TIMEOUT`) → `201` + `PAYMENT_TIMEOUT`;
    stok değişmez.
14. `POST /api/orders` (stoktan fazla adet) → `409`.
15. `GET /api/orders/:id` (sahibi) → `200` + items; (başka kullanıcı) →
    `404`.
16. `GET /api/notifications` (token olmadan) → `401`.
17. `POST /api/orders` (`TEST-CARD-APPROVED`) sonrası
    `GET /api/notifications` → 1 notification, `type: "order.paid"`.
18. `POST /api/orders` (`TEST-CARD-DECLINED`) sonrası notification
    sayısı **artmaz**.
19. `ws://<host>/ws?token=<geçersiz>` → bağlantı `401` ile reddedilir.
20. `ws://<host>/ws?token=<geçerli>` bağlıyken `TEST-CARD-APPROVED`
    siparişi verildiğinde, bağlı client
    `{"type":"notification",...}` mesajını gerçek zamanlı alır.
21. Server log'unda beklenmeyen hata yok (yalnızca beklenen
    `node:sqlite` experimental uyarısı); `[event]`/`[notification]`/
    `[websocket]` log satırları secret/token/password içermez.
