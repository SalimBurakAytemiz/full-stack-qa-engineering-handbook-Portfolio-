# P5.3 — Authentication & Authorization API Tests — Execution Evidence

**Branch:** `feat/phase-5-3-auth-authorization-tests`
**Tarih:** 2026-09-22

> Bu kayıt, aşağıdaki Newman run'ının **gerçekten çalıştırılmış**
> sonucudur (`CONTRIBUTING.md` — Evidence Integrity). Hiçbir sonuç
> tahmin edilmemiş veya kurgulanmamıştır. Gerçek session token değerleri
> bu dosyada **hiçbir yerde** yazılı değildir (bkz. bölüm 6).

---

## 1. İlk Uygulama Adımı — Authentication Gate (Tek Request)

Diğer her şeyden önce, tek başına doğrulandı:

```bash
newman run postman/collections/qa-demo-system-protected.postman_collection.json \
  -e postman/environments/local.postman_environment.json \
  --folder "0. Authentication Gate (No Token)"
```

```text
❏ 0. Authentication Gate (No Token)
↳ GET /api/orders/1 — no Authorization header -> 401
  GET http://localhost:3000/api/orders/1 [401 Unauthorized, 278B, 29ms]
  ✓  Status code is 401
  ✓  Content-Type is application/json
  ✓  Error body: Yetkilendirme gerekli
```

**PASS (3/3 assertion)** — bu gate geçmeden koleksiyonun geri kalanına
geçilmedi.

---

## 2. Ortam ve Test Kullanıcıları

- Sunucu: `QA-DEMO-SYSTEM` backend, resmi `docs/RUN-INSTRUCTIONS.md`
  yöntemiyle ayağa kaldırıldı: `cd QA-DEMO-SYSTEM && npm run dev`.
- Reproducibility için önce `npm run db:seed` çalıştırıldı (fresh
  users/products/orders/sessions/notifications).
- USER A: `test.active01@example.com` (`shared/test-data/auth-users.json`,
  synthetic/deterministic).
- USER B: `test.active02@example.com` (aynı dosya, synthetic/deterministic).
- Komut: `cd QA-DEMO-SYSTEM/api-tests && npm run api:test:auth`.

## 3. Gerçek Çalıştırma Çıktısı (Tam Koleksiyon, 19 Request)

```text
newman

QA Demo System - Protected API / Auth & Authorization (P5.3)

❏ 0. Authentication Gate (No Token)
↳ GET /api/orders/1 — no Authorization header -> 401
  GET http://localhost:3000/api/orders/1 [401 Unauthorized, 278B, 27ms]
  ✓  Status code is 401
  ✓  Content-Type is application/json
  ✓  Error body: Yetkilendirme gerekli

❏ 1. Token Bootstrap
↳ Login as User A (test.active01)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 16ms]
  ✓  Status code is 200
  ✓  Response has token and user.id

↳ Login as User B (test.active02)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 13ms]
  ✓  Status code is 200
  ✓  Response has token and user.id
  ✓  User B is a different user than User A

❏ 2. Authentication Matrix (GET /api/notifications)
↳ No Authorization header -> 401 (Yetkilendirme gerekli)
  GET http://localhost:3000/api/notifications [401 Unauthorized, 278B, 3ms]
  ✓  Status code is 401
  ✓  Error body: Yetkilendirme gerekli

↳ Empty Authorization header -> 401 (Yetkilendirme gerekli)
  GET http://localhost:3000/api/notifications [401 Unauthorized, 278B, 4ms]
  ✓  Status code is 401
  ✓  Error body: Yetkilendirme gerekli

↳ Wrong scheme (Basic) -> 401 (Yetkilendirme gerekli)
  GET http://localhost:3000/api/notifications [401 Unauthorized, 278B, 3ms]
  ✓  Status code is 401
  ✓  Error body: Yetkilendirme gerekli

↳ Malformed Bearer (scheme, no token) -> 401 (Yetkilendirme gerekli)
  GET http://localhost:3000/api/notifications [401 Unauthorized, 278B, 3ms]
  ✓  Status code is 401
  ✓  Error body: Yetkilendirme gerekli

↳ Random/unknown token -> 401 (Gecersiz veya suresi dolmus oturum)
  GET http://localhost:3000/api/notifications [401 Unauthorized, 294B, 4ms]
  ✓  Status code is 401
  ✓  Error body: Gecersiz veya suresi dolmus oturum

↳ Valid token (User A) -> 200
  GET http://localhost:3000/api/notifications [200 OK, 255B, 5ms]
  ✓  Status code is 200
  ✓  Content-Type is application/json
  ✓  Authorization header actually sent as Bearer {{userAToken}}
  ✓  Response has notifications array

❏ 3. Orders — Ownership & Cross-User
↳ Create Order (User A) -> 201 PAID
  POST http://localhost:3000/api/orders [201 Created, 288B, 7ms]
  ✓  Status code is 201
  ✓  Order is PAID

↳ Get Order (User A, owner) -> 200
  GET http://localhost:3000/api/orders/1 [200 OK, 422B, 3ms]
  ✓  Status code is 200
  ✓  Order id matches (owner can see own order)

↳ Get Order (User B, cross-user) -> 404 (ownership denial, not 403)
  GET http://localhost:3000/api/orders/1 [404 Not Found, 274B, 3ms]
  ✓  Status code is 404 (not 403 — IDOR-conscious)
  ✓  Error body: Siparis bulunamadi

↳ Get Order (no token) -> 401
  GET http://localhost:3000/api/orders/1 [401 Unauthorized, 278B, 3ms]
  ✓  Status code is 401
  ✓  Error body: Yetkilendirme gerekli

↳ Get Order (invalid token) -> 401
  GET http://localhost:3000/api/orders/1 [401 Unauthorized, 294B, 2ms]
  ✓  Status code is 401
  ✓  Error body: Gecersiz veya suresi dolmus oturum

↳ Get Unknown Order (User A) -> 404
  GET http://localhost:3000/api/orders/999999999 [404 Not Found, 274B, 2ms]
  ✓  Status code is 404
  ✓  Error body: Siparis bulunamadi

❏ 4. Notifications — Ownership & Cross-User
↳ Get Notifications (User A) — own order_id present
  GET http://localhost:3000/api/notifications [200 OK, 383B, 2ms]
  ✓  Status code is 200
  ✓  User A sees a notification for their own PAID order

↳ Get Notifications (User B) — User A's order_id must NOT leak
  GET http://localhost:3000/api/notifications [200 OK, 255B, 2ms]
  ✓  Status code is 200
  ✓  User B never sees a notification for User A order_id (no cross-user leakage)

↳ Get Notifications (no token) -> 401
  GET http://localhost:3000/api/notifications [401 Unauthorized, 278B, 2ms]
  ✓  Status code is 401
  ✓  Error body: Yetkilendirme gerekli

↳ Get Notifications (invalid token) -> 401
  GET http://localhost:3000/api/notifications [401 Unauthorized, 294B, 2ms]
  ✓  Status code is 401
  ✓  Error body: Gecersiz veya suresi dolmus oturum

┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │              19 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │              19 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               0 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │              42 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 412ms                                   │
├─────────────────────────────────────────────────────────────┤
│ total data received: 1.09kB (approx)                         │
├─────────────────────────────────────────────────────────────┤
│ average response time: 5ms [min: 2ms, max: 27ms, s.d.: 6ms] │
└─────────────────────────────────────────────────────────────┘
```

**Sonuç: 19/19 request PASS, 42/42 assertion PASS, 0 failure.**

---

## 4. Authentication Matrix Sonucu

| Senaryo | Beklenen | Gerçek Sonuç |
|---|---|---|
| No Authorization header | `401` "Yetkilendirme gerekli" | PASS |
| Empty Authorization header | `401` "Yetkilendirme gerekli" | PASS |
| Wrong scheme (`Basic ...`) | `401` "Yetkilendirme gerekli" | PASS |
| Malformed Bearer (`Bearer`, token yok) | `401` "Yetkilendirme gerekli" | PASS |
| Random/unknown token | `401` "Geçersiz veya süresi dolmuş oturum" | PASS |
| Valid token | `200`/`201` | PASS |

Kaynak: `backend/src/middleware/requireAuth.js` — iki ayrı kod yolu
(scheme/token format kontrolü vs. `sessions` tablosu lookup) iki farklı
error message üretir; testler bu ikisini ayrı ayrı doğruladı.

## 5. Authorization / Ownership Matrix Sonucu

| Senaryo | Beklenen | Gerçek Sonuç |
|---|---|---|
| Orders: owner erişimi (User A → kendi order'ı) | `200`, `order.id` eşleşir | PASS |
| Orders: cross-user erişimi (User B → User A'nın order'ı) | `404` "Sipariş bulunamadı" (`403` değil) | PASS |
| Orders: bilinmeyen order (User A → var olmayan id) | `404` "Sipariş bulunamadı" | PASS |
| Notifications: User A kendi `order_id`'sini görür | `order_id` listede var | PASS |
| Notifications: User B, User A'nın `order_id`'sini görmez | `order_id` listede **yok** (data-state-independent) | PASS |

## 6. Token Bootstrap ve Güvenlik Hijyeni

- Token'lar `POST /api/auth/login` response'undan `pm.collectionVariables.set(...)`
  ile runtime'da yakalandı — manuel kopyalama **yok**.
- Koleksiyon JSON'ında (`{{userAToken}}`, `{{userBToken}}`) yalnızca
  **template değişken referansları** var, gerçek token değeri yok.
- `postman/environments/local.postman_environment.json` **değişmedi**
  — yalnızca `baseUrl` içeriyor, hiçbir auth token'ı içermiyor/içermeyecek.
  `git diff` ile doğrulandı (bkz. bölüm 8).
- Bu evidence dosyasında ve yukarıdaki konsol çıktısında **gerçek
  token değeri hiçbir yerde yazılı değildir** — Newman'ın standart
  konsol çıktısı zaten yalnızca status/boyut/süre gösterir, response
  body'lerinin tamamını basmaz.
- Test sonunda `sessions` tablosundaki token'lar yalnızca lokal SQLite
  dosyasında (`backend/data/qa-demo.db`, `.gitignore`'da, repository'ye
  commit edilmez) kalır.

## 7. WebSocket Kapsamı

`WS /ws` bu pakete **dahil edilmedi** — P5.0'ın canonical kararı
(`07-API-TESTING/README.md` "Kapsam Dışı": "GraphQL/WebSocket
derinlemesine event testleri → Phase 6") gereği.

## 8. Repository Hygiene

- `git status --short` — yalnızca beklenen P5.3 dosyaları (bkz. Review
  Manifest).
- `postman/environments/local.postman_environment.json` diff'i boş
  (değişmedi).
- Secret scan: temiz.

## 9. Sonuç

**PASS** — authentication gate ilk tek adım olarak doğrulandı, tam
protected collection (19 request, 5 klasör) otomatik token bootstrap
ile reproducible şekilde çalıştı, authentication matrix'in her iki
farklı hata sınıfı (`Yetkilendirme gerekli` / `Geçersiz veya süresi
dolmuş oturum`) ayrı ayrı doğrulandı, ownership isolation ve cross-user
leakage kontrolü gerçek response body üzerinden (status code'un ötesinde)
kanıtlandı.

## 10. Bilinen Sınırlamalar (Bu Paket Kapsamında)

- Orders/Notifications için yalnızca **auth/ownership** davranışı test
  edildi — order creation business rules (stock, duplicate aggregation,
  payment kombinasyonları) ve notification business akışının derinlemesine
  testi **P5.5/P5.6** kapsamındadır.
- `POST /api/orders` her çalıştırmada `product_id=1`'in stok'unu 1
  azaltır — suite'in tekrar tekrar (onlarca kez) çalıştırılması
  eninde sonunda stoğu tüketebilir; bu durumda `npm run db:seed` ile
  reset gerekir (mevcut, dokümante edilmiş bir komut — yeni bir
  mekanizma eklenmedi).
- Yalnızca 2 deterministic kullanıcı (`shared/test-data/auth-users.json`)
  kullanıldı — daha büyük bir kullanıcı seti gerektiren senaryo yok.
- Newman'ın kendi transitive dependency ağacında (P5.1'den devralınan,
  bilinen, non-blocking) `npm audit` uyarıları hâlâ mevcut.
