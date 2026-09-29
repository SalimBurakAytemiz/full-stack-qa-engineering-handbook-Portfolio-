# QA Demo System — Architecture

**Phase: PHASE 4 — QA DEMO SYSTEM**
**Doküman Statüsü: P4.0 — Scope, Architecture & Tech Stack Decision**

> Bu doküman, Phase 4'ün mimari ve kapsam kararlarını kayıt altına alır.
> Bu aşamada hiçbir kod, dependency veya database oluşturulmamıştır —
> bu yalnızca bir planlama dokümanıdır.

---

## 1. Phase 4 Amacı

Phase 5–10'un (API Testing, GraphQL/WebSocket/Event Testing, Database
Testing, Web & Mobile QA, Automation Learning Labs) üzerinde
çalışacağı; Phase 3'te dokümante edilen Test & Defect Management
metodolojisinin gerçek evidence ile kanıtlanabileceği, **gerçekten
çalıştırılabilir, kontrollü** bir demo sistem kurmak.

Phase 4, derinlemesine test **içeriği** üretmez — test **edilecek
hedefi** inşa eder. Bu ayrım, `ROADMAP.md`'nin kendi faz sırasından
(Phase 4'ün Kapsam/Deliverables bölümü yok, yalnızca Phase 5/7/8/10'un
var) doğrudan türetilmiştir.

---

## 2. Kapsam

- Çalışan bir demo sistem: Frontend → API → Backend → Database →
  Events → Notifications.
- **Human Founder kararına göre** (bkz. bölüm 7) ilk çekirdek: Authentication,
  Products, Orders, Notifications.
- Fake/internal Payment Simulation (bkz. bölüm 12).
- Sistemin gerçekten ayağa kalktığının kanıtı (kurulum talimatı +
  smoke doğrulama).
- `06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/` senaryosunun
  gerçek sistemde tekrar üretilmesi ve gerçek evidence üretilmesi —
  **Phase 3 kayıtlarını değiştirmeden**, Phase 4'e ait yeni bir kayıt
  olarak (bkz. bölüm 19).
- Repository entegrasyonu: `QA-DEMO-SYSTEM/README.md`, `ROADMAP.md`
  güncellemesi, Phase 5/6/7/8/10'a ileri referanslar.

---

## 3. Kapsam Dışı

- Derinlemesine API test suite'i → **Phase 5**.
- GraphQL/WebSocket/Event derinlemesine test senaryoları → **Phase 6**.
- SQL/Database validation test suite'i → **Phase 7**.
- Web/Mobile fonksiyonel test suite'i → **Phase 8**.
- Selenium/Appium/JMeter otomasyonu → **Phase 10** (QA-COMPETENCY-MAP.md'de
  LEARNING statüsünde, ayrı fazı var).
- CI/CD pipeline kurulumu → **Phase 12**.
- ROADMAP'ın "Temel Feature'lar" listesindeki User Management, Role
  Management, Payment (gerçek), Pagination/Filtering/Sorting, WebSocket,
  File Upload — **Human Founder kararıyla** FUTURE / ITERATIVE
  EXPANSION olarak işaretlenmiştir (bkz. bölüm 26).
- Gerçek ödeme sağlayıcısı, gerçek banka, sandbox credential, gerçek
  3DS entegrasyonu, herhangi bir dış servis bağımlılığı.
- Docker/Docker Compose'un zorunlu kurulum şartı haline gelmesi (bkz.
  bölüm 6).
- Phase 0–3'ün teslim edilmiş dosyalarının içeriğinin veya statülerinin
  geriye dönük değiştirilmesi.

---

## 4. Sistem Diyagramı

```text
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │─────▶│     API     │─────▶│   Backend   │─────▶│  Database   │
│ (minimal UI)│◀─────│  (REST)     │◀─────│  (business  │◀─────│  (SQLite)   │
└─────────────┘      └─────────────┘      │   logic)    │      └─────────────┘
                              │            └──────┬──────┘
                              │                   │
                              ▼                   ▼
                      ┌─────────────┐     ┌───────────────┐
                      │  WebSocket  │     │ Notifications │
                      │  (events)   │────▶│  (in-app log) │
                      └─────────────┘     └───────────────┘
```

Bu diyagram, `ROADMAP.md`'nin Phase 4 "Sistem" akışıyla (Frontend →
API → Backend → Database → Events → Notifications) birebir
tutarlıdır. Bu Phase'de yalnızca **Authentication, Products, Orders,
Notifications** akışları bu diyagramı kullanacak şekilde inşa
edilecektir (bkz. bölüm 7).

---

## 5. Teknoloji Seçimi

| Katman | Seçim |
|---|---|
| Backend / API | Node.js + Express |
| Database | SQLite |
| Frontend | Framework'süz, minimal HTML/CSS/vanilla JS |
| Events | `ws` (WebSocket) kütüphanesi |
| Notifications | Uygulama içi log/store (gerçek SMS/email sağlayıcı yok) |
| Payment | Tamamen dahili, deterministik simülasyon (dış servis yok) |
| Çalıştırma | `npm install` + `npm run dev` |

---

## 6. Teknoloji Seçim Gerekçeleri

### Neden Node.js + Express?

REST API üretimi basittir, `QA-COMPETENCY-MAP.md`'de EXPERIENCE
statüsündeki REST API Testing, Postman/Newman ile doğrudan test
edilebilir bir yüzey üretir. Ek framework karmaşıklığı gerektirmez.

### Neden SQLite?

Gerçek SQL çalışır (Phase 7'nin `SELECT/WHERE/JOIN` odaklı Database
Testing kapsamıyla uyumlu), ama ayrı bir database sunucusu kurulumu
gerektirmez — "lokal, kolay, deterministik, az bağımlılıklı" kurulum
şartını (Human Founder kararı, OPEN QUESTION #3) karşılar.

### Neden Framework'süz Frontend?

Demo sistemin amacı bir ürün geliştirmek değil, test edilebilir bir
yüzey üretmektir (bkz. bölüm 3 — Kapsam Dışı). Framework'süz bir
arayüz, hem kurulum bağımlılığını azaltır hem de "büyük SaaS platform
kurma" riskinden (kullanıcı kısıtı) uzak durur. Web Testing (manual —
Phase 8) için yeterli bir DOM yüzeyi sağlar.

### Neden `ws` (WebSocket)?

`QA-COMPETENCY-MAP.md`'de Socket/WebSocket Testing EXPERIENCE
statüsündedir; hafif ve bağımsız bir kütüphane, Notifications akışını
gerçek zamanlı tetiklemek için yeterlidir.

### Neden Docker Zorunlu Değil?

Human Founder kararı (OPEN QUESTION #3): varsayılan kurulum
`npm install && npm run dev` olmalı. Docker, yalnızca gerçekten
teknik bir bağımlılık zorunlu kılarsa **opsiyonel** olarak
önerilebilir — bu Phase'de böyle bir zorunluluk yoktur, bu yüzden
Docker Compose bu Phase'de **oluşturulmayacaktır**.

---

## 7. Demo Feature Kapsamı

Human Founder kararı (OPEN QUESTION #2): ROADMAP'taki 12 temel
özelliğin tamamı bu Phase'de implemente edilmeyecek. İlk çalışan
çekirdek:

| # | Feature | Bu Phase'de Durumu |
|---|---|---|
| 1 | Authentication | Çekirdek kapsamda |
| 2 | Products | Çekirdek kapsamda |
| 3 | Orders | Çekirdek kapsamda |
| 4 | Notifications | Çekirdek kapsamda |
| 5 | Payment Simulation | Minimum kapsamda (Orders'a bağımlı, fake — bkz. bölüm 12) |
| 6 | User Management | FUTURE / ITERATIVE EXPANSION |
| 7 | Role Management | FUTURE / ITERATIVE EXPANSION |
| 8 | Pagination | FUTURE / ITERATIVE EXPANSION |
| 9 | Filtering | FUTURE / ITERATIVE EXPANSION |
| 10 | Sorting | FUTURE / ITERATIVE EXPANSION |
| 11 | WebSocket | Notifications'ın taşıyıcı katmanı olarak minimum kapsamda |
| 12 | File Upload | FUTURE / ITERATIVE EXPANSION |

Payment Simulation ve WebSocket, bağımsız feature olarak değil,
Orders ve Notifications akışlarının **gerçek QA demonstrasyonu için
gereken minimum destek katmanları** olarak dahil edilmiştir — bu,
Human Founder'ın "File Upload veya başka çapraz özellikler ancak
gerçek QA demonstrasyonu için gerekiyorsa minimum kapsamda
eklenebilir" yönlendirmesiyle tutarlıdır.

---

## 8. Authentication Akışı

`03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md`'deki
kontrollü requirement'ın gerçek implementasyonu olacaktır:

```text
Kullanıcı → POST /api/auth/login (email, password)
    ↓
Backend: kullanıcı durumu kontrolü (ACTIVE/DISABLED/DELETED/LOCKED)
    ↓
Geçerli ise → session/token oluşturulur → 200 + kullanıcı bilgisi
Geçersiz ise → 401 + "Email veya şifre hatalı" (AC-AUTH-004,
               BR-AUTH-003 ile tutarlı — alan belirtilmez)
```

Bu akış, Phase 2'nin `AC-AUTH-001…AC-AUTH-012` Acceptance
Criteria'larını hedefler; P4.1'de yalnızca çekirdek senaryolar (valid
login, invalid password) gerçek kod olarak var olacak, kalan AC'ler
(account lock, multiple session vb.) FUTURE / ITERATIVE EXPANSION
kapsamında iteratif olarak eklenecektir.

---

## 9. Products Akışı

```text
GET  /api/products        → ürün listesi (seed data'dan)
GET  /api/products/:id    → tek ürün detayı
```

Yalnızca **okuma (read)** uçları çekirdek kapsamdadır — ürün
oluşturma/güncelleme/silme (admin/CMS benzeri işlevler) FUTURE
kapsamındadır. Amaç, Orders akışının bağlanacağı gerçek bir veri
kaynağı sağlamaktır.

---

## 10. Orders Akışı

```text
Kullanıcı (authenticated) → POST /api/orders (ürün + adet listesi)
    ↓
Backend: stok/ürün doğrulaması → Payment Simulation çağrısı (bölüm 12)
    ↓
approved  → Order DB'ye "PAID" durumunda yazılır → Notification tetiklenir
declined  → Order "PAYMENT_FAILED" durumunda kalır → Notification tetiklenir
timeout   → Order "PAYMENT_TIMEOUT" durumunda kalır → Notification tetiklenir
    ↓
GET /api/orders/:id → sipariş durumu sorgulanabilir
```

Bu akış, `03-TEST-DESIGN/05-STATE-TRANSITION-TESTING.md`'deki Order
state diyagramı örneğinin gerçek bir uygulamasıdır ve Phase 7
(Database Testing) için CRUD State Validation yüzeyi sağlar.

---

## 11. Notifications Akışı

```text
Backend event (örn. "order.paid") → WebSocket sunucusu → bağlı client'a
push → aynı anda in-app notification log'una yazılır (Database)
```

Gerçek bir SMS/email sağlayıcısı **kullanılmaz** — notification,
uygulama içi bir log/store olarak gerçekleşir ve WebSocket üzerinden
gerçek zamanlı iletilir. Bu, hem `CONTRIBUTING.md` — Real Company Data
Rule'a (harici credential yok) hem de Human Founder'ın "gerçek
SMS/email sağlayıcı yok" ilkesine uygundur.

---

## 12. Fake Payment Simulation

Human Founder kararı (OPEN QUESTION #5): Payment tamamen **FAKE /
INTERNAL SIMULATION**'dır. Hiçbir harici payment provider, banka,
sandbox credential veya 3DS entegrasyonu kullanılmaz.

### Minimum Deterministik Durumlar

| Durum | Tetiklenme Kuralı (deterministik) |
|---|---|
| `approved` | Varsayılan/çoğunluk senaryo |
| `declined` | Kontrollü bir test tutarı/kart deseni ile tetiklenir |
| `timeout` / `error` | Kontrollü bir test tutarı/kart deseni ile tetiklenir |

Tetikleme kuralları, gerçek bir banka mantığını taklit etmeyecek
şekilde **açıkça test amaçlı** (örn. belirli bir sabit tutar veya
"test kartı" deseni) tanımlanacak ve `shared/test-data/` içinde
dokümante edilecektir (bkz. bölüm 13). Gerekirse ek kontrollü state'ler
(örn. `pending`) QA senaryolarını daha iyi göstermek için P4.2'de
eklenebilir — ama sistem hiçbir zaman gerçek bir finansal sistem gibi
davranmaya çalışmayacaktır.

---

## 13. Test Data Yaklaşımı

Tüm test verisi **sentetik**tir — `03-TEST-DESIGN/09-TEST-DATA-DESIGN.md`
ve `CONTRIBUTING.md` — Real Company Data Rule ile tutarlı olarak
hiçbir gerçek kullanıcı/müşteri verisi kullanılmaz.

- Seed data (kullanıcılar, ürünler), `shared/test-data/` altında
  version-controlled JSON/SQL dosyaları olarak tutulur (bkz. bölüm 14).
- Kullanıcı hesapları, Phase 2'nin `test.active01@example.com` gibi
  kurgusal formatını sürdürür.
- Payment test desenleri (approved/declined/timeout tetikleyen
  tutarlar/kartlar) `shared/test-data/` içinde açıkça dokümante
  edilir.

---

## 14. `shared/` Sorumlulukları

Human Founder kararı (OPEN QUESTION #4): `shared/` klasörü genel bir
helper/utility çöplüğüne dönüştürülmeyecektir. Rolü şu şekilde
netleştirilmiştir:

```text
shared/
├── test-data/     Seed data, sentetik kullanıcılar, payment test
│                  desenleri — QA Demo System VE ileriki test
│                  paketleri (Phase 5, 7, 8, 10) tarafından
│                  ortak kullanılır.
├── schemas/       API response şemaları (JSON Schema) — Phase 5'in
│                  AJV/JSON Schema Validation (EXPERIENCE) çalışması
│                  için hazır bir sözleşme kaynağı.
└── contracts/     Yalnızca gerçekten gerekiyorsa: servisler arası
                   (API ↔ Frontend, API ↔ Events) sözleşme
                   dokümanları. Bu Phase'de yalnızca gerekiyorsa
                   oluşturulur — boş bırakılabilir.
```

`shared/helpers/`, `shared/templates/`, `shared/evidence/` (Phase 0'da
scaffold edilmiş) klasörleri bu Phase'de **kullanılmayacaktır** —
bunların rolü ileride, gerçekten ortak bir helper/template/evidence
ihtiyacı doğduğunda ayrıca değerlendirilecektir; şimdiden doldurulmaz.

`shared/`, tek bir sistemin (QA-DEMO-SYSTEM) değil, **birden fazla
Phase'in** ortak kullanacağı varlıkları barındırır — bu yüzden
QA-DEMO-SYSTEM kod tabanının içine değil, repository kökünde kalmaya
devam eder.

---

## 15. Manual QA Bağlantısı

Demo sistem, `04-MANUAL-TESTING/` (Phase 8 civarında derinleşecek) ve
`00-QA-FOUNDATIONS/`, `01-REQUIREMENT-ANALYSIS/`,
`03-TEST-DESIGN/`'daki tüm manuel test tasarım tekniklerinin (EP, BVA,
Decision Table, State Transition) **gerçek bir hedef üzerinde**
uygulanabileceği sistemdir. Bu Phase'de manuel test senaryosu
**yazılmaz** — yalnızca bu senaryoların ileride yazılabileceği gerçek
davranış (Authentication, Orders state geçişleri, Payment sonuçları)
üretilir.

---

## 16. API QA Bağlantısı

Tüm API uçları (`/api/auth/*`, `/api/products/*`, `/api/orders/*`),
Phase 5'in REST API Testing (EXPERIENCE) ve Postman/Newman
(EXPERIENCE) çalışmasının doğrudan hedefi olacak şekilde tasarlanır:
tutarlı HTTP status code kullanımı, öngörülebilir request/response
şeması, `shared/schemas/`'a bağlanabilir sözleşmeler.

---

## 17. Database Validation Yaklaşımı

SQLite üzerindeki `users`, `products`, `orders`, `notifications`
tabloları, Phase 7'nin `01-REQUIREMENT-ANALYSIS`/`03-TEST-DESIGN`
tekniklerinde anlatılan API → DB ve UI → DB Validation'ı
uygulayabileceği gerçek bir kaynak olacaktır (bkz.
`00-QA-FOUNDATIONS/08-TEST-ORACLE.md` — Database'in Test Oracle
olarak kullanımı ve sınırları). Bu Phase'de yalnızca şema ve seed data
kurulur; validation senaryoları yazılmaz.

---

## 18. Automation'a Hazırlanma Yaklaşımı

Selenium (Phase 10, LEARNING → PRACTICED) için sistemin frontend'i,
kararlı ve tahmin edilebilir `id`/`data-testid` attribute'ları
taşıyacak şekilde inşa edilir — ancak bu Phase'de hiçbir Selenium
kodu **yazılmaz**. Bu, yalnızca ileriki bir Phase'in işini
kolaylaştıran bir tasarım tercihidir, automation implementasyonu
değildir.

---

## 19. Defect / Retest / Regression Bağlantısı

Human Founder kararı (OPEN QUESTION #1): Phase 3'ün teslim edilmiş
kayıtları **tarihsel olarak korunur**, geriye dönük değiştirilmez.

- `06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/10-RETEST.md` ve
  `11-REGRESSION.md` **olduğu gibi kalır** ("Phase 3'te planlanan,
  NOT EXECUTED" kaydı olarak).
- Phase 4'te `BUG-AUTH-EDU-001` senaryosu gerçek sistemde
  çalıştırıldığında, sonuç **yeni bir Phase 4 kaydı** olarak
  (örn. `QA-DEMO-SYSTEM/evidence/phase-4-authentication-bug-retest.md`
  gibi bir addendum dosyasında) tutulur ve ilgili Phase 3 defect'ine
  (`BUG-AUTH-EDU-001`) açıkça referans verir.
- Bu addendum dosyasının kesin adı/yeri P4.4 paketinde
  netleştirilecektir; bu doküman yalnızca **ilkeyi** sabitler: "Phase
  3'te planlanan neydi" ve "Phase 4'te gerçekten ne çalıştırıldı"
  ayrı ayrı izlenebilir kalacaktır.
- `05-TEST-MANAGEMENT/templates/RETEST-TEMPLATE.md` ve
  `06-DEFECT-MANAGEMENT/templates/REGRESSION-IMPACT-TEMPLATE.md`,
  bu yeni Phase 4 kaydında yeniden kullanılır — yeniden yazılmaz.

---

## 20. Evidence Yaklaşımı

`05-TEST-MANAGEMENT/08-TEST-EVIDENCE-MANAGEMENT.md` ve
`06-DEFECT-MANAGEMENT/08-DEFECT-EVIDENCE.md`'de tanımlanan ilkeler
aynen geçerlidir: evidence, "bug var" demek değil, "tekrar
üretilebilir ve teknik olarak kanıtlanabilir" hale getirmektir.

Bu Phase'de üretilecek evidence **gerçek** olacaktır (Phase 3'ün
aksine, orada bilinçli olarak `NOT CAPTURED`/`NOT EXECUTED`
işaretlenmişti). `QA-DEMO-SYSTEM/evidence/` klasörü, gerçek
screenshot, gerçek API request/response, gerçek log çıktısını
barındırır — hiçbiri sentetik/uydurma olmayacaktır. Hassas veri
maskeleme kuralları (`CONTRIBUTING.md` — Real Company Data Rule)
aynen uygulanır.

---

## 21. Reporting Yaklaşımı

Bu Phase'de tam bir Test Summary Report üretilmez (bu, Phase 5+'ın
gerçek test execution'larının işi olacaktır). Yalnızca:

- P4.5'te bir **Smoke Checklist** sonucu (PASS/FAIL, sistemin ayakta
  olup olmadığı) raporlanır.
- P4.4'te üretilen gerçek evidence, `05-TEST-MANAGEMENT/templates/TEST-EXECUTION-TEMPLATE.md`
  formatında kısa bir execution kaydına dönüştürülür.

---

## 22. Phase 4 Paketleri

| Paket | Amaç |
|---|---|
| P4.0 | Scope, Architecture & Tech Stack Decision (bu doküman) |
| P4.1 | Demo Application Skeleton (Auth + Products çekirdek) |
| P4.2 | Core Feature Completion (Orders + Fake Payment Simulation) |
| P4.3 | Events & Notifications Layer (WebSocket + in-app notification) |
| P4.4 | Controlled Defect Reproduction (BUG-AUTH-EDU-001 gerçek evidence) |
| P4.5 | Run Documentation & Smoke Validation |
| P4.6 | Repository Integration & Closeout |

---

## 23. Paket Bağımlılıkları

```text
P4.0 (bu doküman)
   ↓
P4.1 (Auth + Products)
   ↓
P4.2 (Orders + Payment — Auth'a ve Products'a bağımlı)
   ↓
P4.3 (Notifications — Orders event'lerine bağımlı)
   ↓
P4.4 (Defect Reproduction — Auth akışının çalışıyor olmasına bağımlı,
      P4.1 sonrası herhangi bir noktada da yapılabilir)
   ↓
P4.5 (Smoke Validation — tüm çekirdek akışların var olmasına bağımlı)
   ↓
P4.6 (Closeout — tüm paketlerin tamamlanmasına bağımlı)
```

P4.4, teknik olarak yalnızca P4.1'e bağımlıdır ve paralel
ilerleyebilir; sıralama pratik/izlenebilirlik amacıyla önerilmiştir.

---

## 24. Acceptance Criteria (Paket Bazlı Özet)

| Paket | Acceptance Criteria |
|---|---|
| P4.0 | Bu doküman Human Founder tarafından onaylanmış |
| P4.1 | Sistem `npm install && npm run dev` ile ayağa kalkıyor; login + Products listeleme gerçekten çalışıyor |
| P4.2 | Bir sipariş gerçekten oluşturuluyor; approved/declined/timeout durumları deterministik şekilde tetiklenebiliyor |
| P4.3 | WebSocket bağlantısı kuruluyor; en az bir order event'i gerçek zamanlı notification'a dönüşüyor |
| P4.4 | BUG-AUTH-EDU-001 için gerçek sistemde bir reproduction attempt gerçekten çalıştırıldı (API + UI); sonuç: **NOT REPRODUCED** (tarif edilen davranış bu implementasyonda hiç mevcut olmamış); mevcut regression coverage (`backend/tests/auth.test.js`) bu senaryoyu zaten kapsadığı için yeni bir regression testi eklenmedi; gerçek evidence üretildi; Phase 3 kayıtları değişmedi; yeni Phase 4 kaydı Phase 3'e referans veriyor (bkz. `evidence/BUG-AUTH-EDU-001/EXECUTION.md`) |
| P4.5 | Sıfır bir ortamda RUN-INSTRUCTIONS takip edilerek sistem çalıştırılabiliyor; Smoke Checklist PASS |
| P4.6 | `QA-DEMO-SYSTEM/README.md` eksiksiz; `ROADMAP.md` Phase 4 → CLEAN, Phase 5 → IN PROGRESS; broken link yok |

---

## 25. Riskler

1. **Scope creep:** Çekirdek dört özelliğin (Auth/Products/Orders/
   Notifications) ötesine genişleme baskısı olabilir. Mitigasyon: bu
   dokümanın bölüm 7'deki tablo referans alınır, sapma Human
   Founder onayı gerektirir.
2. **Evidence Integrity karışıklığı:** Phase 4'te üretilen gerçek
   evidence'ın, Phase 3'ün NOT EXECUTED kayıtlarıyla karıştırılması
   riski. Mitigasyon: bölüm 19'daki ayrım (ayrı dosya, açık referans)
   kesin kural olarak uygulanır.
3. **Payment simulasyonunun gerçekçi finansal sistem izlenimi
   vermesi:** Mitigasyon: yalnızca deterministik, açıkça test amaçlı
   tetikleyiciler kullanılır (bölüm 12), gerçek ödeme terminolojisi
   (IBAN, gerçek kart numarası formatı vb.) kullanılmaz.
4. **`shared/` klasörünün yeniden amaçsız büyümesi:** Mitigasyon:
   bölüm 14'teki sınır (yalnızca `test-data/`, `schemas/`,
   gerekiyorsa `contracts/`) korunur.
5. **Docker'sız kurulumun teknik bir bağımlılıkta tıkanması:**
   Örn. native bir SQLite binding sorunu. Mitigasyon: P4.1'de
   bağımlılıklar mümkün olduğunca saf JavaScript/well-supported
   paketlerle sınırlı tutulur.

---

## 26. Future / Iterative Expansion

ROADMAP'ın Phase 4 "Temel Feature'lar" listesindeki, bu Phase'in
çekirdek kapsamına dahil edilmeyen maddeler:

- User Management (ayrıntılı profil/hesap yönetimi)
- Role Management (Admin/Moderator gibi çoklu rol modeli)
- Pagination / Filtering / Sorting (Products/Orders listelerinde)
- File Upload
- Account Lock, Multiple Session, Session Timeout gibi Phase 2'nin
  tüm Authentication AC'lerinin tam kapsamı

Bu maddeler **iptal edilmemiştir** — yalnızca bu Phase'in minimum
çekirdek kapsamının dışına, iteratif genişletmeye bırakılmıştır. Hangi
Phase'de veya hangi tetikleyiciyle (örn. Phase 5'in API test
senaryoları Pagination gerektirdiğinde) ele alınacakları, ilgili
Phase'in kendi planlama adımında (bu dokümanın P4.0 emsaliyle)
netleştirilir.

---

## İlgili Repository Dokümanları

- [ROADMAP.md — Phase 4](../ROADMAP.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE](../02-FULL-STACK-QA-HANDBOOK/03-TEST-DESIGN/examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md)
- [06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG](../02-FULL-STACK-QA-HANDBOOK/06-DEFECT-MANAGEMENT/examples/AUTHENTICATION-BUG/README.md)
- [05-TEST-MANAGEMENT/templates/](../02-FULL-STACK-QA-HANDBOOK/05-TEST-MANAGEMENT/templates/)
- [06-DEFECT-MANAGEMENT/templates/](../02-FULL-STACK-QA-HANDBOOK/06-DEFECT-MANAGEMENT/templates/)
