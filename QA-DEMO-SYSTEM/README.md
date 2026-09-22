# QA Demo System

**Phase: PHASE 4 — QA DEMO SYSTEM**
**Durum: CLEAN** (bkz. [`PHASE-4-CLOSEOUT.md`](PHASE-4-CLOSEOUT.md))

---

## 1. QA Demo System Nedir?

QA Demo System, bu repository'nin Phase 0–3'te dokümante ettiği QA
metodolojisinin (requirement analysis, test design, test/defect
management) **gerçekten çalıştırılabileceği** kontrollü bir test
hedefidir: Node.js + Express backend, SQLite database, framework'süz
frontend ve WebSocket ile kurulan, `npm install && npm run dev` ile
lokal olarak ayağa kalkan gerçek bir uygulama.

Bu bir production ürünü, büyük bir SaaS platformu veya AI agent
sistemi **değildir** — yalnızca Authentication, Products, Orders,
Fake Payment, Events ve Notifications akışlarını gösteren minimum bir
QA test target'ıdır (bkz. `ARCHITECTURE.md` bölüm 2–3).

---

## 2. Neden Oluşturuldu?

Phase 2 ve Phase 3'ün örnekleri (`AUTHENTICATION-FEATURE`,
`AUTHENTICATION-BUG`) bilinçli olarak **kurgusal** ve **NOT EXECUTED**
işaretliydi — amaç yalnızca metodolojiyi göstermekti, gerçek bir
sistem yoktu. `06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/09-EVIDENCE-PLAN.md`
bu boşluğu açıkça belirtip gelecekteki bir QA Demo System'e forward
reference veriyordu. Phase 4, tam olarak bu boşluğu kapatır: artık
gerçek HTTP request/response, gerçek server log, gerçek ekran
görüntüsü üretilebilir.

---

## 3. Phase 0–3 ile İlişkisi

| Phase | Katkısı | QA Demo System'e Bağlantısı |
|---|---|---|
| Phase 1 — QA Foundations | Temel metodoloji/terminoloji | Test Oracle, Traceability gibi kavramlar burada uygulanıyor |
| Phase 2 — Requirement & Test Design | `AUTHENTICATION-FEATURE` kontrollü örneği (AC-AUTH-004, BR-AUTH-003) | Authentication implementasyonu bu AC/BR'lere birebir uyacak şekilde yazıldı |
| Phase 3 — Test & Defect Management | `AUTHENTICATION-BUG` kontrollü örneği (`BUG-AUTH-EDU-001`, hep `NOT EXECUTED`) | P4.4'te gerçek sistemde çalıştırıldı — sonuç `NOT REPRODUCED`, gerçek evidence üretildi (bkz. bölüm 10) |
| **Phase 3 tarihsel kayıtları** | — | **Hiç değiştirilmedi** — Phase 4, Phase 3'ü tamamlayan ayrı, yeni bir kayıt setidir (bkz. `ARCHITECTURE.md` bölüm 19) |

---

## 4. Phase 4'ün Amacı

`ROADMAP.md`'nin kendi yapısından türetilen ilke: Phase 4'ün
Kapsam/Deliverables bölümü yok (Phase 5/6/7/8/10'un var) — yani Phase
4 **derinlemesine test içeriği üretmez, test edilecek hedefi inşa
eder**. Derin API/DB/Web/Automation test senaryoları Phase 5+'ın
işidir; bu sistem onlara gerçek bir zemin sağlar (bkz.
`ARCHITECTURE.md` bölüm 1).

---

## 5. Mevcut Özellikler

| Özellik | Durum | Paket |
|---|---|---|
| Authentication | Çalışıyor (valid/invalid/unknown login, AC-AUTH-004/BR-AUTH-003) | P4.1 |
| Products | Çalışıyor (listeleme, stok verisi) | P4.1 |
| Orders | Çalışıyor (authenticated, stok/aggregate validasyonu) | P4.2 |
| Fake Payment | Çalışıyor (deterministik `TEST-CARD-APPROVED/DECLINED/TIMEOUT`, gerçek kart formatı yok) | P4.2 |
| Events | Çalışıyor (`order.paid`, yalnızca PAID sipariş) | P4.3 |
| Notifications | Çalışıyor (persist + `GET /api/notifications`, owner-scoped) | P4.3 |
| WebSocket | Çalışıyor (authenticated realtime delivery) | P4.3 |
| Defect Reproduction | Çalıştırıldı (`BUG-AUTH-EDU-001` → **NOT REPRODUCED**, gerçek evidence) | P4.4 |
| Evidence | Üretiliyor (`evidence/` altında, gerçek request/response/log/screenshot) | P4.4, P4.5 |
| Smoke Validation | Çalışıyor (24 maddelik checklist, tekrar üretilebilir) | P4.5 |

---

## 6. Teknoloji Özeti

| Katman | Seçim | Gerekçe (özet) |
|---|---|---|
| Backend/API | Node.js + Express | Basit, REST API Testing (EXPERIENCE) için doğrudan test edilebilir yüzey |
| Database | SQLite (`node:sqlite`, yerleşik) | Gerçek SQL, ayrı sunucu gerektirmez, native binding bağımlılığı yok |
| Frontend | Framework'süz HTML/CSS/JS | Minimum bağımlılık, test edilebilir DOM yüzeyi |
| Events/Realtime | `ws` kütüphanesi | Hafif, bağımsız WebSocket implementasyonu |
| Payment | Tamamen dahili, deterministik simülasyon | Dış servis/gerçek kart formatı yok |
| Çalıştırma | `npm install && npm run dev` | Docker zorunlu değil (Human Founder kararı) |

Detaylı gerekçeler için bkz. `ARCHITECTURE.md` bölüm 5–6.

---

## 7. Klasör Yapısı

```text
QA-DEMO-SYSTEM/
├── ARCHITECTURE.md          Phase 4 mimari/kapsam kararları (P4.0)
├── README.md                Bu dosya
├── PHASE-4-CLOSEOUT.md      Phase 4 kapanış kaydı
├── package.json             npm workspace kökü
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── server.js, app.js, config/
│   │   ├── database/        schema.js, connection.js, seed.js
│   │   ├── routes/          auth, products, orders, notifications
│   │   ├── services/        auth, products, orders, payment, events, notifications
│   │   ├── middleware/      requireAuth, errorHandler
│   │   └── realtime/        websocketServer.js
│   └── tests/                node --test suite (72 test)
├── frontend/
│   ├── index.html, products.html
│   ├── css/style.css
│   └── js/                  login.js, products.js, notifications.js
├── docs/
│   ├── RUN-INSTRUCTIONS.md  Kurulum/çalıştırma/reset (source of truth)
│   └── SMOKE-CHECKLIST.md   Tekrar çalıştırılabilir smoke checklist
└── evidence/
    ├── BUG-AUTH-EDU-001/    P4.4 — gerçek defect reproduction evidence
    └── P4.5-RUN-SMOKE/      P4.5 — clean-install + smoke execution evidence
```

`shared/{test-data, schemas}/` (repository kökünde) da bu sistem
tarafından kullanılır — bkz. `ARCHITECTURE.md` bölüm 14.

---

## 8. Nasıl Çalıştırılır?

Detaylı kurulum, çalıştırma, reset ve test kullanıcı bilgileri için:

→ **[`docs/RUN-INSTRUCTIONS.md`](docs/RUN-INSTRUCTIONS.md)**

Özet: `cd QA-DEMO-SYSTEM && npm install && npm run dev` →
`http://localhost:3000`.

---

## 9. Smoke Validation

Sistemin gerçekten çalıştığını doğrulamak için tekrar çalıştırılabilir
checklist:

→ **[`docs/SMOKE-CHECKLIST.md`](docs/SMOKE-CHECKLIST.md)**

P4.5'te bu checklist'in 24/24 maddesi gerçek sistem üzerinde PASS
almıştır (bkz. `evidence/P4.5-RUN-SMOKE/EXECUTION.md`).

---

## 10. Evidence Nerede?

`evidence/` klasörü altında, gerçekten üretilmiş (hiçbiri sentetik
değil) evidence bulunur:

- **`evidence/BUG-AUTH-EDU-001/`** — Phase 3'ün kurgusal
  `BUG-AUTH-EDU-001` senaryosunun gerçek sistemde çalıştırılması:
  gerçek HTTP request/response, gerçek server log, gerçek Playwright
  ekran görüntüsü. Sonuç: **NOT REPRODUCED**.
- **`evidence/P4.5-RUN-SMOKE/`** — Temiz kurulum + 24 maddelik smoke
  checklist'in gerçek execution kaydı (install/startup log'ları, smoke
  sonuçları, ekran görüntüleri).

---

## 11. Bilinen Sınırlamalar

Tüm known limitation'lar (idempotency, DB hardening notu, frontend
duplicate presentation riski, log zamanlaması, test timeout penceresi
vb.) `PHASE-4-CLOSEOUT.md`'de tek yerde konsolide edilmiştir — hiçbiri
blocker değildir.

---

## 12. Test Kapsamı Özeti

`backend/tests/` altında `node --test` (harici framework yok) ile
**72 test**, 6 dosyada: `auth`, `products`, `orders`, `events`,
`notifications`, `websocket`, `seed`. Tüm testler P4.5 kapanışında
72/72 PASS durumundaydı (bkz. `evidence/P4.5-RUN-SMOKE/logs/npm-test-output.txt`).

---

## 13. Security / Test Data Notları

- **Gerçek kullanıcı/şirket verisi kullanılmaz** — tüm test
  kullanıcıları ve şifreler tamamen sentetiktir (bkz.
  `CONTRIBUTING.md` — Real Company Data Rule).
- Demo veritabanında parolalar **düz metin** olarak saklanır — bu,
  minimum bağımlılık ilkesi gereği bilinçli bir demo tercihidir,
  **gerçek bir üretim güvenlik pratiği değildir** (bkz.
  `docs/RUN-INSTRUCTIONS.md`).
- Payment tamamen dahili/fake'tir — gerçek ödeme sağlayıcısı, gerçek
  kart numarası formatı veya dış servis bağımlılığı yoktur.

---

## 14. Phase 4 Sonucu

**PHASE 4 — CLEAN.** Tüm paketler (P4.0–P4.6) tamamlandı, bilinen tüm
Codex bağımsız review'leri (P4.2–P4.5) **PASS** veya **PASS WITH
NON-BLOCKING NOTES** ile sonuçlandı, açık blocker yok. Detaylar için
bkz. **[`PHASE-4-CLOSEOUT.md`](PHASE-4-CLOSEOUT.md)**.

---

## 15. Sonraki Faza Bağlantı

Phase 5 (API Testing) artık QA Demo System'in gerçek REST API'lerini
(`/api/auth`, `/api/products`, `/api/orders`, `/api/notifications`)
derinlemesine test edebilir — Postman/AJV/JSON Schema/Newman ile
(bkz. `ROADMAP.md` Phase 5). Phase 4 bu API'yi **inşa etti**; Phase
5 onu **derinlemesine test edecek**.
