# Case Study 02 — E-Commerce Order Flow

## Senaryo

Bir kullanıcı giriş yapar, ürünleri görür, `POST /api/orders` ile bir
sipariş oluşturur — sistem stok kontrolü yapar, ödemeyi simüle eder,
sipariş+kalemleri+stok güncellemesini tek bir transaction içinde
kalıcılaştırır, ve (ödeme onaylandıysa) bir `order.paid` event'i +
notification üretir.

## Risk Analizi

| Risk | Ciddiyet | Gerekçe |
|---|---|---|
| Stok altına düşme (overselling) | Kritik | İki eşzamanlı sipariş aynı son stoğu "kazanabilir" |
| Kısmi yazma (sipariş var ama kalemler yok) | Kritik | Veri bütünlüğü ihlali |
| Yanlış toplam hesaplama | Yüksek | Finansal hata |
| Başka kullanıcının siparişine erişim (IDOR) | Yüksek | Veri sızıntısı |
| Mass assignment (fiyat/durum manipülasyonu) | Kritik | Sahte "ücretsiz" sipariş |

## Test Stratejisi ve GERÇEK Sonuçlar

| Risk | Kanıt | Sonuç |
|---|---|---|
| Overselling / kısmi yazma | Phase 5 P5.5 — `db.exec('BEGIN')`/`COMMIT`/`ROLLBACK` transaction testleri; Phase 7 `database-testing.test.js` CRUD/FK/CHECK testleri | **KAPALI** — tek transaction, all-or-nothing |
| Yanlış toplam | Phase 7 `database-testing.test.js` — `orders.total == SUM(order_items.quantity*unit_price)` SQL aggregate ile çok-satırlı gerçek siparişler üzerinde doğrulandı | **KAPALI** |
| IDOR | Phase 5 P5.3 + Phase 11 `security.test.js` (non-numeric/negative/sequential enumeration) | **KAPALI** — 404, cross-user sızıntı yok |
| Mass Assignment | Phase 11 `security.test.js` — `user_id`/`status`/`total` enjeksiyonu tamamen etkisiz | **KAPALI** |
| Frontend↔Backend↔DB tutarlılığı | Phase 8 `web-tests` "UI → DB Validation" testi — gerçek bir tarayıcı akışının DB'deki gerçek satırlarla eşleştiği kanıtlandı | **KAPALI** |
| Gerçek-dünya performans altında davranış | Phase 14 Locust — 526 istek, 0 hata, p99=15ms (ürün listeleme + login ağırlıklı) | **KAPALI** (bu trafik profili için) |

**Gerçek regresyon:** Bu akış, campaign boyunca EN ÇOK test edilen
akıştır — `orders.test.js`, `events.test.js`, `notifications.test.js`,
`database-testing.test.js`, `security.test.js`, `graphql.test.js`
(createOrder mutation), `web-tests` (realtime-notification.spec.js) —
hepsi tam 128 testlik backend suite'inin ve 23 testlik web-tests
suite'inin bir parçası olarak defalarca PASS.

## Bilinen Sınırlamalar

- Frontend'de gerçek bir sepet/checkout UI'ı YOK (Phase 8'de
  doğrulandı) — sipariş oluşturma yalnızca API üzerinden mümkün.
- Yalnızca tek bir ödeme "sağlayıcısı" (deterministik simülasyon) var
  — gerçek bir çoklu-sağlayıcı senaryosu test edilmedi.

## Öğrenilenler

Bu case study, TEK bir iş akışının (sipariş oluşturma) birden fazla
QA disiplini (fonksiyonel, veri bütünlüğü, güvenlik, UI, performans)
tarafından BAĞIMSIZ olarak, farklı fazlarda, farklı araçlarla
doğrulandığında ne kadar güçlü bir güven oluşturduğunu gösteriyor —
her katman bir öncekinin bulamayacağı hata sınıflarını yakalıyor
(örn. transaction testleri overselling'i yakalar ama IDOR'u yakalamaz;
security testleri IDOR'u yakalar ama toplam hesaplama hatasını
yakalamaz).
