# P5.4 — Products API Tests — Execution Evidence

**Branch:** `feat/phase-5-4-products-api-tests`
**Tarih:** 2026-09-22

> Bu kayıt, aşağıdaki Newman/AJV run'larının **gerçekten çalıştırılmış**
> sonucudur (`CONTRIBUTING.md` — Evidence Integrity). Hiçbir sonuç
> tahmin edilmemiş veya kurgulanmamıştır.

---

## 1. Deterministic Test Data Doğrulaması (İlk Adım)

`shared/test-data/products.json` ve gerçek `backend/src/services/products.service.js`
kaynak kodundan doğrulandı:

- **id=1** (QA Demo Klavye, `stock_quantity=25`) — deterministic **in-stock** ürün.
- **id=2** (QA Demo Mouse, `stock_quantity=0`) — deterministic **out-of-stock** ürün.
- `toApiShape()`: `in_stock: row.stock_quantity > 0` — alan adı ve mantık
  tahmin edilmedi, kaynak koddan alındı.

Gerçek sunucudan `curl` ile ilk doğrulama:

```text
GET /api/products/2 -> 200 {"product":{"id":2,"name":"QA Demo Mouse","price":49.9,"stock_quantity":0,"in_stock":false}}
GET /api/products/1 -> 200 {"product":{"id":1,"name":"QA Demo Klavye","price":149.9,"stock_quantity":25,"in_stock":true}}
```

**Gate PASS** — bu doğrulamadan sonra collection'a eklendi ve tam
suite'in parçası olarak Newman ile de PASS aldı (bkz. bölüm 3).

## 2. Path Parameter Davranışı — Ampirik Keşif (Tahmin Edilmedi)

Negative matrix yazmadan önce gerçek server'a karşı ampirik olarak
test edildi (`Number(req.params.id)` — router kaynağı):

| Girdi | Gerçek Sonuç |
|---|---|
| `abc` (non-numeric) | `404` `{"error":"Ürün bulunamadı"}` |
| `0` (zero) | `404` |
| `-1` (negative) | `404` |
| `1.5` (decimal) | `404` |
| `99999999999999999999` (beyond safe integer) | `404` |
| `%20` (encoded whitespace) | `404` |

**Hiçbir girdi `500` üretmedi** — `Number()` coercion + SQLite
parametreli sorgu, geçersiz/eşleşmeyen her girdiyi güvenli şekilde
"bulunamadı" olarak ele alıyor. Representative bir alt küme (5 vaka:
non-numeric, zero, negative, decimal, very-large) collection'a eklendi;
encoded-whitespace ve ayrı bir "beyond safe integer" vakası aynı
mekanizmayı kanıtladığı için (yeni bilgi eklemediği için) dahil
edilmedi.

---

## 3. Ortam ve Çalıştırma

- Sunucu: resmi `docs/RUN-INSTRUCTIONS.md` yöntemiyle (`npm run dev`),
  önce `npm run db:seed` ile fresh state.
- Komut: `cd QA-DEMO-SYSTEM/api-tests && npm run api:test:postman`
  (→ `node scripts/run-schema-validation.js` — P5.2'nin Newman Node API
  + AJV wrapper'ı, P5.4'te Products'ı da kapsayacak şekilde genişletildi).

## 4. Gerçek Çalıştırma Çıktısı (Tam Public Collection, 11 Request)

```text
newman

QA Demo System - Public API (P5.1)

→ GET /api/health
  GET http://localhost:3000/api/health [200 OK, 249B, 28ms]
  ✓  Status code is 200

→ POST /api/auth/login (valid, deterministic test user)
  POST http://localhost:3000/api/auth/login [200 OK, 349B, 17ms]
  ✓  Status code is 200

❏ Products
↳ List
  GET http://localhost:3000/api/products [200 OK, 582B, 3ms]
  ✓  Status code is 200
  ✓  Public endpoint: no Authorization header required/sent
  ✓  At least the 4 deterministic seed products are present
  ✓  Data quality: stock_quantity/in_stock consistency for every product
  ✓  Data quality: no duplicate product id, no empty name, no negative stock

↳ Detail - In Stock (deterministic existing product)
  GET http://localhost:3000/api/products/1 [200 OK, 329B, 4ms]
  ✓  Status code is 200
  ✓  Requested id matches response id
  ✓  In-stock product: stock_quantity > 0 and in_stock === true
  ✓  List -> Detail consistency (same underlying row)

↳ Detail - Out of Stock
  GET http://localhost:3000/api/products/2 [200 OK, 327B, 3ms]
  ✓  Status code is 200
  ✓  Requested id matches response id
  ✓  Out-of-stock product: stock_quantity === 0 and in_stock === false

↳ Unknown Product (well-formed, non-existent id)
  GET http://localhost:3000/api/products/9999 [404 Not Found, 272B, 3ms]
  ✓  Status code is 404
  ✓  Error body: Urun bulunamadi

↳ Invalid ID - non-numeric
  GET http://localhost:3000/api/products/abc [404 Not Found, 272B, 3ms]
  ✓  Status code is 404 (not 500)
  ✓  Error body: Urun bulunamadi

↳ Invalid ID - zero
  GET http://localhost:3000/api/products/0 [404 Not Found, 272B, 3ms]
  ✓  Status code is 404 (not 500)
  ✓  Error body: Urun bulunamadi

↳ Invalid ID - negative
  GET http://localhost:3000/api/products/-1 [404 Not Found, 272B, 4ms]
  ✓  Status code is 404 (not 500)
  ✓  Error body: Urun bulunamadi

↳ Invalid ID - decimal
  GET http://localhost:3000/api/products/1.5 [404 Not Found, 272B, 3ms]
  ✓  Status code is 404 (not 500)
  ✓  Error body: Urun bulunamadi

↳ Invalid ID - very large
  GET http://localhost:3000/api/products/99999999999999999999 [404 Not Found, 272B, 2ms]
  ✓  Status code is 404 (not 500)
  ✓  Error body: Urun bulunamadi

--- P5.2 AJV / Header Validation Results ---
PASS  GET /api/health — schema + Content-Type PASS
PASS  POST /api/auth/login (valid, deterministic test user) — schema + Content-Type PASS
PASS  List — schema + Content-Type PASS
PASS  Detail - In Stock (deterministic existing product) — schema + Content-Type PASS
PASS  Detail - Out of Stock — schema + Content-Type PASS
PASS  Unknown Product (well-formed, non-existent id) — schema + Content-Type PASS
PASS  Invalid ID - non-numeric — schema + Content-Type PASS
PASS  Invalid ID - zero — schema + Content-Type PASS
PASS  Invalid ID - negative — schema + Content-Type PASS
PASS  Invalid ID - decimal — schema + Content-Type PASS
PASS  Invalid ID - very large — schema + Content-Type PASS

Newman functional assertions (status code, from pm.test): PASS
AJV schema + Content-Type validations: PASS

P5.2 schema validation run: PASS

┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │              11 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │              11 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               0 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │              26 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 280ms                                   │
├─────────────────────────────────────────────────────────────┤
│ total data received: 839B (approx)                          │
├─────────────────────────────────────────────────────────────┤
│ average response time: 6ms [min: 2ms, max: 28ms, s.d.: 7ms] │
└─────────────────────────────────────────────────────────────┘
```

**Sonuç: 11/11 request PASS, 26/26 assertion PASS, 11/11 AJV schema +
Content-Type validation PASS, 0 failure.**

---

## 5. Schema Negative/Positive Proof (Genişletildi)

P5.2'nin tracked proof script'i (`api-tests/scripts/schema-negative-proof.js`,
`npm run api:test:schema:negative-proof`) — Products kategorisine
`missing required (name)` vakası eklendi (P5.2'de eksik olan tek
gerçek boşluk, bölüm 12'nin ayrı bir kategori olarak istediği). Yeni
sayı kendi çıktısında raporlanır:

```text
Total registered cases: 19
...
[PROOF-OK] [PRODUCTS] missing required (name) -> valid=false (expected false)
    errors: [{"instancePath":"/product","schemaPath":"...product-item.schema.json/required","keyword":"required","params":{"missingProperty":"name"},"message":"must have required property 'name'"}]
...

--- Summary ---
Total cases: 19
PROOF-OK: 19
PROOF-BROKEN: 0

Schema negative/positive proof run: PASS
```

**19/19 PROOF-OK** (HEALTH 5, AUTH 5, PRODUCTS 6, ERROR 3). P5.2'nin
kendi evidence dosyası (`P5.2-AJV-SCHEMA/EXECUTION.md`, "18/18") **tarihsel
kayıt olarak değiştirilmedi** — o an doğruydu, artan sayı bu dosyada ve
`api-tests/README.md`'de (canlı doküman) yansıtıldı.

**Yeni schema düzeltmesi gerekmedi** — `product-item.schema.json`'ın
mevcut `stock_quantity: {type:"integer", minimum:0}` kuralı, stok=0
(out-of-stock) değerini zaten doğru şekilde kabul ediyor (minimum
inclusive); gerçek response'lar (in-stock ve out-of-stock) her ikisi
de mevcut şemayla birebir uyumlu çıktı.

---

## 6. Stock/in_stock Data-Quality Tutarlılığı

`GET /api/products` listesindeki **tüm** ürünler için (yalnızca tek
bir örnek değil) doğrulandı: `stock_quantity > 0 ⟺ in_stock === true`.
4/4 deterministic seed ürünü için PASS (id=1: 25→true, id=2: 0→false,
id=3: 5→true, id=4: 12→true).

## 7. List → Detail Consistency

`GET /api/products` listesindeki id=1 kaydı ile `GET /api/products/1`
detail response'u **derin eşitlik** (`pm.expect(...).to.eql(...)`) ile
karşılaştırıldı — birebir aynı (aynı `toApiShape()` fonksiyonundan
geldikleri için beklenen ve doğrulanan davranış).

## 8. Public Access

`GET /api/products` request'inde açıkça doğrulandı: `Authorization`
header'ı **gönderilmedi** ve endpoint yine de `200` döndü — P5.0'ın
"Products PUBLIC" kararıyla tutarlı, gerçek execution ile kanıtlandı
(varsayım değil).

---

## 9. Bulunan Bug'lar

**Application bug: YOK.** Tüm path-parameter negative matrix (6 vaka:
unknown numeric id, non-numeric, zero, negative, decimal, very-large)
güvenli şekilde `404` + standart error contract döndürdü — hiçbir
girdi `500` veya beklenmeyen davranış üretmedi.

**Test/schema/documentation bug: YOK.** P5.2'nin mevcut şemaları
(`product-item.schema.json` dahil) gerçek response'larla (in-stock ve
out-of-stock) tam uyumlu çıktı, düzeltme gerekmedi.

---

## 10. Sonuç

**PASS** — Products API'nin list/detail contract'ı (positive, negative,
boundary, data-quality) kapsamlı şekilde doğrulandı; P5.2'nin AJV/schema
altyapısı ve negative-proof runner'ı genişletilerek yeniden kullanıldı
(yeni bir schema source of truth veya AJV entegrasyon modeli
kurulmadı); public access gerçek execution ile kanıtlandı; hiçbir
application/test/schema bug'ı bulunmadı.

## 11. Bilinen Sınırlamalar (Bu Paket Kapsamında)

- Products **read-only** endpoint'ler olduğu için mutation-based
  boundary testi (ör. stok değerini API üzerinden değiştirme) yok —
  seed data'nın kendi doğal sınırları (`stock_quantity=0` id=2) yeterli
  boundary kapsamı sağladı; sırf P5.4 için application data'sı
  bozulmadı.
- Orders/Notifications ile Products'ın etkileşimi (sipariş sırasında
  stok düşüşü, aggregate/duplicate satır davranışı) bu paketin
  kapsamı **dışında** — P5.5'in işi.
- API→DB validation, HTML reporting bu pakette yok.
- Ayrı bir `npm run api:test:products` script'i **oluşturulmadı** —
  Products aynı public collection içinde olduğu için mevcut
  `api:test:postman`/`api:test:postman:basic` script'leri zaten kapsıyor
  (bkz. `api-tests/README.md` bölüm 18 kararı).
- Newman'ın kendi transitive dependency ağacında (P5.1'den devralınan,
  bilinen, non-blocking) `npm audit` uyarıları hâlâ mevcut.
