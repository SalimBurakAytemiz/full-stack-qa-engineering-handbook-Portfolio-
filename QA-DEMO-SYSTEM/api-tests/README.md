# QA Demo System — API Tests

**Phase: PHASE 5 — API TESTING**
**Doküman Statüsü: P5.1 — Postman Foundation**

> Bu klasör, Phase 5'in Postman/Newman/AJV tabanlı API test
> katmanının giriş noktasıdır. P5.0'da yalnızca bu README (kapsam/
> kontrat kararları) oluşturulmuştu. **P5.1'de gerçek bir Postman
> collection, local environment ve Newman CLI dependency'si
> kuruldu** — yalnızca **PUBLIC** REST endpoint'ler için, smoke
> seviyesinde. AJV/JSON Schema, protected endpoint suite, DB
> validation ve HTML reporting **henüz oluşturulmadı** — aşağıda
> hâlâ "PLANNED" olarak işaretlidir.

---

## 1. API Test Sisteminin Amacı

`QA-DEMO-SYSTEM`'in Phase 4'te inşa edilmiş **gerçek, çalışan**
REST API'sini (7 endpoint + WebSocket auth), Postman/Newman/AJV ile
fonksiyonel, contract, authorization ve regression açısından
doğrulamak. Detaylı metodoloji ve kapsam kararı için bkz.
[`07-API-TESTING/README.md`](../../07-API-TESTING/README.md).

---

## 2. Hangi API'leri Test Edecek

Gerçek kaynak koddan doğrulanmış 7 REST endpoint + 1 WebSocket:

- `GET /api/health` (public)
- `POST /api/auth/login` (public)
- `GET /api/products`, `GET /api/products/:id` (public)
- `POST /api/orders`, `GET /api/orders/:id` (protected)
- `GET /api/notifications` (protected)
- `WS /ws?token=` (ayrı token-tabanlı auth)

Tam envanter (method/path/body/params/status/business rule) için bkz.
`07-API-TESTING/README.md` — "API Inventory" bölümü.

---

## 3. Toolchain

| Araç | Rol | Durum |
|---|---|---|
| Postman (collection format) | Collection authoring (JSON, v2.1.0 schema) | **DONE (P5.1)** — `postman/collections/qa-demo-system-public.postman_collection.json` |
| Newman | CLI runner, reproducible execution | **DONE (P5.1)** — `newman@6.2.2` devDependency, `api-tests/package.json` |
| AJV | JSON Schema validation | PLANNED (P5.2) |
| JSON Schema | Response contract tanımı | PLANNED (P5.2, `shared/schemas/` altında) |
| Newman HTML reporter | Execution raporu | PLANNED (P5.8) |

Postman **desktop uygulaması** kullanılmadı — collection ve
environment dosyaları doğrudan geçerli Postman v2.1.0 JSON formatında
elle authoring edildi ve Newman CLI ile çalıştırıldı (Postman GUI'siz,
CI/reproducible-friendly bir yaklaşım). `postman-collection` SDK
dependency'si eklenmedi — P5.1 kapsamında gerekmedi (minimum
dependency ilkesi).

Bu araçlar `QA-COMPETENCY-MAP.md` bölüm 7–9'daki (Postman, AJV & JSON
Schema, Newman) EXPERIENCE statüsüyle uyumludur.

---

## 4. Public/Protected Endpoint Özeti

| Public | Protected |
|---|---|
| `GET /api/health` | `POST /api/orders` |
| `POST /api/auth/login` | `GET /api/orders/:id` |
| `GET /api/products` | `GET /api/notifications` |
| `GET /api/products/:id` | `WS /ws` (ayrı mekanizma) |

**REST protected endpoint'ler** (`POST /api/orders`, `GET /api/orders/:id`,
`GET /api/notifications`) `requireAuth` middleware'i
(`backend/src/middleware/requireAuth.js`) ile korunur —
`Authorization: Bearer <token>` header'ı zorunludur, `sessions`
tablosuna karşı doğrulanır.

**`WS /ws` de protected/authenticated'dır, ancak REST `requireAuth`
akışını kullanmaz** — token `?token=` query parametresi olarak
gönderilir ve `websocketServer.js`'in HTTP upgrade handshake'i
sırasında ayrı bir kontrolle aynı `sessions` tablosuna karşı
doğrulanır (Express middleware zinciri veya `requireAuth` fonksiyonu
devreye girmez). "Protected olmak" ile "aynı auth transport/middleware'i
kullanmak" aynı şey değildir — bu ikisi karıştırılmamalıdır.

Detaylı authorization matrix için bkz. `07-API-TESTING/README.md`.

---

## 5. Klasör Yapısı

### Mevcut (P5.1 sonunda)

```text
QA-DEMO-SYSTEM/api-tests/
├── README.md
├── package.json                                  (P5.1 — newman devDependency, "api:test:postman" script)
└── postman/
    ├── collections/
    │   └── qa-demo-system-public.postman_collection.json   (P5.1 — 4 PUBLIC endpoint, smoke assertion)
    └── environments/
        └── local.postman_environment.json                  (P5.1 — baseUrl)
```

### Hâlâ Planlanan (sonraki paketlerde kademeli olarak oluşturulacak)

```text
QA-DEMO-SYSTEM/api-tests/
└── postman/
    ├── collections/   + protected endpoint collection'ı (P5.3+), auth negative matrix
    └── data/           (yalnızca gerçekten data-driven/multi-iteration bir senaryo — ör. P5.3
                         auth negative matrix — gerektiğinde oluşturulacak; bkz. not aşağıda)
```

**Schema'lar burada değil `shared/schemas/` altında olacak** (bkz.
bölüm 7 — canonical karar). Reports/evidence de burada değil
`QA-DEMO-SYSTEM/evidence/P5-API-TESTING/` altında (bkz. bölüm 11).
Ayrı bir `scripts/` klasörü **oluşturulmadı** — Newman çalıştırma
komutu `api-tests/package.json`'daki `api:test:postman` npm script'i
ile karşılanıyor, ayrı bir shell script gerekmedi (minimum dependency/
dosya ilkesi).

**`postman/data/`** P5.1'de **oluşturulmadı** — bu paketin tek
data-driven ihtiyacı (`POST /api/auth/login` için tek bir deterministic
kullanıcı) request body'sine doğrudan yazıldı, ayrı bir iterasyon data
dosyası gerektirmedi. Birden fazla iterasyon/veri seti gerektiren bir
senaryo (ör. P5.3'ün auth negative matrix'i) ortaya çıktığında, Newman'ın
`-d <data-file>` mekanizmasıyla (bkz. bölüm 9) değerlendirilecektir.

---

## 6. Test Execution Modeli

**Canonical model** (kullanıcı tarafından belirlenmiştir):

```text
Claude: implementasyon → self-review → test → smoke → review manifest → commit/push
Codex:  yalnızca paket/milestone sonunda DELTA independent review
Codex FAIL → Claude fix → Codex re-review (yalnızca fix delta)
Codex PASS → PR + merge
```

Codex, her küçük commit'te değil, yalnızca paket/milestone
kapanışlarında çağrılır (Phase 4'te P4.2–P4.6'da uygulanan pattern).

**Gerçek çalıştırma komutu (P5.1'de kuruldu):**

```bash
cd QA-DEMO-SYSTEM
npm run dev              # ayrı bir terminalde — sunucu ayakta kalmalı
npm run api:test:postman # workspace root'tan, veya:
cd api-tests && npm run api:test:postman
```

İkinci komut, `api-tests/package.json`'daki script üzerinden şunu
çalıştırır: `newman run postman/collections/qa-demo-system-public.postman_collection.json
-e postman/environments/local.postman_environment.json` — gerçek
çalışan `QA-DEMO-SYSTEM` sunucusuna (`http://localhost:3000`) karşı.
P5.1'de bu gerçekten çalıştırıldı: **4/4 request, 4/4 assertion PASS**
(bkz. `evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md`).

---

## 7. Schema Validation Standardı

**Canonical schema path: `shared/schemas/`** — `ARCHITECTURE.md`
bölüm 14'te P4.0'da bu amaç için reserve edilmişti. `api-tests/`
altında **duplicate bir schema klasörü oluşturulmayacaktır**.
`shared/schemas/` şu an `.gitkeep`'ten ibarettir; **P5.2**'de gerçek
`.schema.json` dosyalarıyla doldurulup active kullanım alanına
dönüştürülecektir.

AJV kuralları (null yasak, strict type, `additionalProperties: false`,
açık `required`, enum, nested validation) için bkz.
`07-API-TESTING/README.md` — "Schema Governance" bölümü.

---

## 8. Header Validation Standardı

CURRENT (zorunlu) vs EXPECTED/FUTURE (yalnızca not edilir) ayrımı
`07-API-TESTING/README.md`'de tanımlıdır. Özet: `Content-Type` ve
`Authorization` zorunlu test edilir; CORS/security header'ları sistem
bugün üretmediği için zorunlu tutulmaz (false failure üretilmez).

---

## 9. Test Data Kullanımı

Mevcut `shared/test-data/` (`auth-users.json`, `products.json`,
`payment-test-patterns.json`) **aynen yeniden kullanılacaktır** —
ancak pre-request script'ler bu dosyaları **doğrudan filesystem'den
okumaz**. Gerçek Newman/Postman modeli: local iteration data, Newman
CLI'a `-d <data-file>` parametresiyle verilir (veya Postman Collection
Runner'a data file olarak yüklenir); script'ler bu veriye runner'ın
**iteration-data/variable API**'si üzerinden erişir (ör.
`pm.iterationData.get(...)`), dosya yolunu kendileri açıp okumaz.
**Duplicate bir test data sistemi kurulmayacaktır.**

**P5.1'de gerçekte ne yapıldı:** `POST /api/auth/login` request'i,
`shared/test-data/auth-users.json`'daki tek bir deterministic kullanıcıyı
(`test.active01@example.com` / `ValidPass123!`) request body'sine
**doğrudan** (hardcoded, açıkça "synthetic/deterministic test credential"
olarak işaretlenmiş) yazdı — tek iterasyonluk bir smoke test için ayrı
bir `-d <data-file>` kurulumu gerekmedi. Çoklu iterasyon/veri seti
gerektiren senaryolarda (ör. P5.3'ün auth negative matrix'i — birden
fazla email/password kombinasyonu) `-d <data-file>` modeli
kullanılacaktır. Detaylı eşleme (`hangi veri hangi testte`) için bkz.
`07-API-TESTING/README.md` — "Test Data Yaklaşımı".

---

## 10. DB Validation Yaklaşımı

Yalnızca Orders (PAID/DECLINED/TIMEOUT) ve Notifications akışlarında
— her `GET` için DB kontrolü konulmaz. Detay için bkz.
`07-API-TESTING/README.md` — "API → Database Validation Kapsamı".

---

## 11. Reporting Yaklaşımı

Newman HTML raporları (`newman-reporter-htmlextra` vb.) **PLANNED
(P5.8)** — henüz kurulmadı. P5.1'de yalnızca Newman'ın standart CLI
çıktısı (console reporter) kullanıldı ve bu çıktı
`evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md`'ye
gerçek execution kaydı olarak yazıldı — ara execution'lar commit
edilmiyor, yalnızca paket kapanışındaki execution (P4.4/P4.5 evidence
pattern'i).

---

## 12. Evidence Yaklaşımı

`CONTRIBUTING.md` — Evidence Integrity kuralı aynen geçerlidir:
gerçekten çalıştırılmamış bir Newman run'ı PASS olarak gösterilemez.
P5.1'de gerçek bir Newman run'ı gerçek sisteme karşı çalıştırıldı ve
sonucu `evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md`'de
kayıt altına alındı. Her sonraki paket kapanışında da aynı şekilde
gerçek execution kaydı üretilecektir.

---

## 13. Security Boundaries

Bu klasördeki testler **penetration testing değildir**. Yalnızca
QA-seviyeli authorization/ownership/negative doğrulama yapılır (IDOR,
auth bypass senaryoları, hata mesajlarında bilgi sızıntısı kontrolü).
Exploit geliştirme, saldırı aracı kullanımı veya sistemin gerçek bir
güvenlik açığını istismar etmesi bu kapsamın **tamamen dışındadır**.

---

## 14. Phase 5 Paketleri

| Paket | Amaç | Durum |
|---|---|---|
| P5.0 | API Scope & Contract (bu doküman + `07-API-TESTING/README.md`) | CLEAN |
| P5.1 | Postman Foundation (collection, local environment, Newman runner, PUBLIC endpoint smoke) | CLEAN |
| P5.2 | AJV/JSON Schema (`shared/schemas/` doldurulması) | PLANNED |
| P5.3 | Authentication & Authorization API Tests | PLANNED |
| P5.4 | Products API Tests | PLANNED |
| P5.5 | Orders & Payment API Tests | PLANNED |
| P5.6 | Notifications API Tests | PLANNED |
| P5.7 | API → DB Validation | PLANNED |
| P5.8 | Newman Reporting & Reproducible Execution | PLANNED |
| P5.9 | Regression, Evidence & Phase 5 Closeout | PLANNED |

Her paketin amaç/kapsam/dosya/test/AC/dependency/evidence/Codex
review noktası detayları ilgili paketin kendi başlangıcında
netleştirilecektir (Phase 4'te uygulanan pattern).

---

## İlgili Repository Dokümanları

- [../../07-API-TESTING/README.md](../../07-API-TESTING/README.md)
- [../ARCHITECTURE.md](../ARCHITECTURE.md)
- [../PHASE-4-CLOSEOUT.md](../PHASE-4-CLOSEOUT.md)
- [../../shared/schemas/](../../shared/schemas/)
- [../../shared/test-data/](../../shared/test-data/)
- [../evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md](../evidence/P5-API-TESTING/P5.1-POSTMAN-FOUNDATION/EXECUTION.md)
