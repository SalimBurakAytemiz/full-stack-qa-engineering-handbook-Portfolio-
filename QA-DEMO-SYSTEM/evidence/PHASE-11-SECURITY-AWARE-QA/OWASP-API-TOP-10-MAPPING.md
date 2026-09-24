# PHASE 11 — OWASP API Security Top 10 (2023) — Real Mapping

Bu eşleştirme, QA-DEMO-SYSTEM'in GERÇEK kaynak kodu ve bu campaign
boyunca çalıştırılmış GERÇEK testlere dayanır (P5.3 + bu paketin
`security.test.js`'i). İcat edilmiş bir bulgu YOKTUR — bir madde
sistemde uygulanabilir değilse (N/A), dürüstçe öyle işaretlenmiştir.

| # | OWASP API Top 10 Madde | Durum | Kanıt |
|---|---|---|---|
| API1:2023 | Broken Object Level Authorization | **TESTED** | P5.3 + `security.test.js` IDOR/BOLA testleri — cross-user order erişimi 404 (IDOR-conscious, 403 değil) |
| API2:2023 | Broken Authentication | **TESTED** | P5.3 auth suite — generic hata mesajı (no info leak), `crypto.randomUUID()` tabanlı session token |
| API3:2023 | Broken Object Property Level Authorization (Mass Assignment) | **TESTED** | `security.test.js` — `user_id`/`status`/`total` enjeksiyonu tamamen etkisiz (route hiç okumuyor) |
| API4:2023 | Unrestricted Resource Consumption | **KISMEN N/A** | Rate limiting YOK (kaynak kodda doğrulandı, bkz. EXECUTION.md §4) — sistemin kendisi sınırsız istek kabul eder; bu dürüstçe NOT IMPLEMENTED, JMeter lab (Phase 10) bunun performans yönünü kısmen ele alır (execution blocked, bkz. Phase 10) |
| API5:2023 | Broken Function Level Authorization | **KISMEN N/A** | RBAC/rol sistemi YOK — tüm authenticated kullanıcılar aynı fonksiyon setine erişir, farklılaştırılmış bir "admin" fonksiyonu yok, dolayısıyla bu madde bu sistemde test edilebilir bir yüzeye sahip değil |
| API6:2023 | Unrestricted Access to Sensitive Business Flows | **N/A** | Sistemde bot/otomasyon-karşıtı bir iş akışı (örn. sınırlı-stok satın alma yarışı önleme) tanımlı değil; mevcut stok-kontrolü zaten transaction içinde (Phase 5 P5.5) |
| API7:2023 | Server Side Request Forgery (SSRF) | **N/A** | Sistem hiçbir kullanıcı-sağlanan URL'yi sunucu tarafında fetch etmiyor (dış servis çağrısı yok, ödeme tamamen lokal simülasyon) |
| API8:2023 | Security Misconfiguration | **TESTED** | `errorHandler.js` — 500'lerde stack trace/detay sızdırmıyor (`{error: 'Sunucu hatası'}` sabit mesaj); `security.test.js` — sensitive data testleri |
| API9:2023 | Improper Inventory Management | **N/A** | Tek bir API versiyonu var, deprecated/gölge endpoint yok (kaynak kodda doğrulandı — routes/ dizini küçük ve tam envanteri çıkarılabilir) |
| API10:2023 | Unsafe Consumption of APIs | **N/A** | Sistem hiçbir üçüncü-parti API'yi tüketmiyor (ödeme tamamen lokal simülasyon, gerçek bir dış API çağrısı yok) |

**Özet:** 10 maddeden 3'ü doğrudan TESTED (API1, API2, API3), 1'i
kısmen TESTED + kısmen N/A (API8: misconfiguration kısmı test edildi,
ama kapsamlı bir config-audit değil), 2'si kısmen N/A (API4 rate
limiting yok, API5 RBAC yok — ikisi de mimari olarak bu sistemde
gerçekten yok, icat edilmedi), 4'ü tamamen N/A (bu sistemin mimarisi
gereği — SSRF/3rd-party-API-tüketimi/API-envanteri/bot-business-flow
saldırı yüzeyleri hiç mevcut değil).
