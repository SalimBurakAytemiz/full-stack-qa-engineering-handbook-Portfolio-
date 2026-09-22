# P5.1 — Postman Foundation — Execution Evidence

**Branch:** `feat/phase-5-1-postman-foundation`
**Tarih:** 2026-09-22

> Bu kayıt, aşağıdaki Newman run'ının **gerçekten çalıştırılmış**
> sonucudur (`CONTRIBUTING.md` — Evidence Integrity). Hiçbir sonuç
> tahmin edilmemiş veya kurgulanmamıştır.

---

## 1. Ortam

- Sunucu: `QA-DEMO-SYSTEM` backend, resmi `docs/RUN-INSTRUCTIONS.md`
  yöntemiyle ayağa kaldırıldı: `cd QA-DEMO-SYSTEM && npm run dev`.
- `GET /api/health` ile reachability doğrulandı (`200 OK`,
  `{"status":"ok"}`) — çalıştırma öncesi.
- Newman: `newman@6.2.2` (`api-tests/package.json` devDependency).

## 2. Collection / Environment

- Collection: `postman/collections/qa-demo-system-public.postman_collection.json`
- Environment: `postman/environments/local.postman_environment.json` (`baseUrl=http://localhost:3000`)

## 3. Çalıştırma Komutu

```bash
cd QA-DEMO-SYSTEM/api-tests
npm run api:test:postman
```

Bu script şunu çalıştırır:

```bash
newman run postman/collections/qa-demo-system-public.postman_collection.json \
  -e postman/environments/local.postman_environment.json
```

## 4. Endpoint Listesi (Bu Pakette Test Edilen, Yalnızca PUBLIC)

1. `GET /api/health`
2. `POST /api/auth/login` (deterministic test user: `test.active01@example.com`)
3. `GET /api/products`
4. `GET /api/products/1`

## 5. Newman Sonucu (Gerçek Konsol Çıktısı)

```text
newman

QA Demo System - Public API (P5.1)

→ GET /api/health
  GET http://localhost:3000/api/health [200 OK, 249B, 28ms]
  ✓  Status code is 200

→ POST /api/auth/login (valid, deterministic test user)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 32ms]
  ✓  Status code is 200

→ GET /api/products
  GET http://localhost:3000/api/products [200 OK, 582B, 3ms]
  ✓  Status code is 200

→ GET /api/products/:id (deterministic existing product)
  GET http://localhost:3000/api/products/1 [200 OK, 329B, 4ms]
  ✓  Status code is 200

┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      prerequest-scripts │                0 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │                4 │                0 │
├─────────────────────────┴──────────────────┴──────────────────┤
│ total run duration: 165ms                                     │
├───────────────────────────────────────────────────────────────┤
│ total data received: 567B (approx)                            │
├───────────────────────────────────────────────────────────────┤
│ average response time: 16ms [min: 3ms, max: 32ms, s.d.: 13ms] │
└───────────────────────────────────────────────────────────────┘
```

## 6. Gerçek Response Body'leri (Ampirik, `curl` ile Çapraz Doğrulandı)

Session token maskelenmiştir (`***MASKED***`); değer dinamik/gerçek
oturuma özgüdür, secret değildir ama tekrar üretilebilirlik için
maskelenmiştir.

```text
GET /api/health
{"status":"ok"}

POST /api/auth/login
{"token":"***MASKED***","user":{"id":1,"email":"test.active01@example.com"}}

GET /api/products
{"products":[
  {"id":1,"name":"QA Demo Klavye","price":149.9,"stock_quantity":25,"in_stock":true},
  {"id":2,"name":"QA Demo Mouse","price":49.9,"stock_quantity":0,"in_stock":false},
  {"id":3,"name":"QA Demo Monitör","price":899.9,"stock_quantity":5,"in_stock":true},
  {"id":4,"name":"QA Demo Webcam","price":259.9,"stock_quantity":12,"in_stock":true}
]}

GET /api/products/1
{"product":{"id":1,"name":"QA Demo Klavye","price":149.9,"stock_quantity":25,"in_stock":true}}
```

## 7. Sonuç

**PASS** — 4/4 request, 4/4 test-script, 4/4 assertion, 0 failure.
Tüm request'ler gerçekten çalışan `http://localhost:3000` sunucusuna
gitti; mock response kullanılmadı.

## 8. Bilinen Sınırlamalar (Bu Paket Kapsamında)

- Assertion'lar yalnızca smoke seviyesinde (`status code == 200`) —
  AJV/JSON Schema, full response contract validation, negative/
  authorization matrix bu pakette **yok** (P5.2+ kapsamı).
- Protected endpoint'ler (`orders`, `notifications`) ve `WS /ws` bu
  collection'da **yok** (P5.1 yalnızca PUBLIC endpoint foundation'ı).
- Newman'ın transitive dependency ağacında `npm install` sırasında
  raporlanan moderate/high severity advisory'ler mevcuttur (Newman'ın
  kendi eski alt-bağımlılıkları — `request`, `uuid@3/8`,
  `@faker-js/faker@5` vb.). Bunlar Newman paketinin kendi bağımlılık
  zincirinden gelir, bu repository'nin kodunu etkilemez;
  `npm audit fix --force` gibi breaking-change içeren bir müdahale bu
  pakette **yapılmamıştır** (minimum/gerekli dependency ilkesi —
  yalnızca Newman'ın kendisi kontrol edilebilir, transitive ağacı
  değil).
