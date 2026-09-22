# QA Demo System — API Tests

**Phase: PHASE 5 — API TESTING**
**Doküman Statüsü: P5.0 — API Scope & Contract**

> Bu klasör, Phase 5'in Postman/Newman/AJV tabanlı API test
> katmanının giriş noktasıdır. P5.0 kapsamında yalnızca bu README
> oluşturulmuştur — **henüz hiçbir Postman collection, JSON Schema
> dosyası veya dependency mevcut değildir**. Aşağıdaki yapı/planlar
> "PLANNED" olarak işaretlenmiştir.

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
| Postman | Collection authoring, manuel/keşif testleri | PLANNED (P5.1) |
| Newman | CLI runner, reproducible/CI execution | PLANNED (P5.1) |
| AJV | JSON Schema validation | PLANNED (P5.2) |
| JSON Schema | Response contract tanımı | PLANNED (P5.2, `shared/schemas/` altında) |
| Newman HTML reporter | Execution raporu | PLANNED (P5.8) |

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

### Mevcut (P5.0 sonunda)

```text
QA-DEMO-SYSTEM/api-tests/
└── README.md          (bu dosya)
```

### Planlanan (P5.1+ paketlerde kademeli olarak oluşturulacak)

```text
QA-DEMO-SYSTEM/api-tests/
├── README.md
├── postman/
│   ├── collections/    (P5.1)
│   ├── environments/    (P5.1)
│   └── data/            (gerekirse, P5.1+ — bkz. not aşağıda)
└── scripts/              (gerekirse, Newman çalıştırma script'i — P5.8)
```

**Schema'lar burada değil `shared/schemas/` altında olacak** (bkz.
bölüm 7 — canonical karar). Reports/evidence de burada değil
`QA-DEMO-SYSTEM/evidence/P5-API-TESTING/` altında olacak (bkz. bölüm
11). Bu, `07-API-TESTING/README.md`'nin "Önerilen Klasör Yapısı"
taslağına göre daraltılmıştır: boş/duplicate klasör oluşturmamak için
yalnızca gerçekten farklı bir source-of-truth gerektiren `postman/`
ve (gerekirse) `scripts/` burada tutulur.

**`postman/data/`** yalnızca Postman'e özgü bir format (örn. CSV data
file, Collection Runner için) gerekirse P5.1'de değerlendirilecektir
— mevcut `shared/test-data/` zaten JSON formatındadır ve Newman'ın
`-d <data-file>` parametresi veya Postman Collection Runner'ın data
file mekanizmasıyla (doğrudan filesystem okuması değil,
iteration-data API'si üzerinden) kullanılabilir; bu yüzden
`postman/data/`'nın gerçekten gerekip gerekmediği P5.1'de netleşecek
(duplicate test data sistemi kurulmayacak, bkz. bölüm 9).

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

Çalıştırma (P5.1+'te gerçekleşecek): `newman run postman/collections/<collection>.json -e postman/environments/local.json` —
gerçek çalışan `QA-DEMO-SYSTEM` sunucusuna karşı (`npm run dev`
sonrası).

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
Kesin komut/alan eşlemesi (`-d` ile hangi dosya, hangi alan adlarıyla)
**P5.1**'de netleşecektir. **Duplicate bir test data sistemi
kurulmayacaktır.** Detaylı eşleme (`hangi veri hangi testte`) için
bkz. `07-API-TESTING/README.md` — "Test Data Yaklaşımı".

---

## 10. DB Validation Yaklaşımı

Yalnızca Orders (PAID/DECLINED/TIMEOUT) ve Notifications akışlarında
— her `GET` için DB kontrolü konulmaz. Detay için bkz.
`07-API-TESTING/README.md` — "API → Database Validation Kapsamı".

---

## 11. Reporting Yaklaşımı

Planlanan konum: `QA-DEMO-SYSTEM/evidence/P5-API-TESTING/{reports,execution,results}/`
(henüz oluşturulmadı). Newman HTML raporları yalnızca paket
kapanışlarında commit edilecek; ara execution'lar commit edilmeyecek
(P4.4/P4.5 evidence pattern'i).

---

## 12. Evidence Yaklaşımı

`CONTRIBUTING.md` — Evidence Integrity kuralı aynen geçerlidir:
gerçekten çalıştırılmamış bir Newman run'ı PASS olarak gösterilemez.
Her paket kapanışında gerçek execution kaydı (`evidence/P5-API-TESTING/`
altında) üretilecektir.

---

## 13. Security Boundaries

Bu klasördeki testler **penetration testing değildir**. Yalnızca
QA-seviyeli authorization/ownership/negative doğrulama yapılır (IDOR,
auth bypass senaryoları, hata mesajlarında bilgi sızıntısı kontrolü).
Exploit geliştirme, saldırı aracı kullanımı veya sistemin gerçek bir
güvenlik açığını istismar etmesi bu kapsamın **tamamen dışındadır**.

---

## 14. Phase 5 Paketleri

| Paket | Amaç |
|---|---|
| P5.0 | API Scope & Contract (bu doküman + `07-API-TESTING/README.md`) |
| P5.1 | Postman Foundation (collection iskeleti, environment) |
| P5.2 | AJV/JSON Schema (`shared/schemas/` doldurulması) |
| P5.3 | Authentication & Authorization API Tests |
| P5.4 | Products API Tests |
| P5.5 | Orders & Payment API Tests |
| P5.6 | Notifications API Tests |
| P5.7 | API → DB Validation |
| P5.8 | Newman Reporting & Reproducible Execution |
| P5.9 | Regression, Evidence & Phase 5 Closeout |

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
