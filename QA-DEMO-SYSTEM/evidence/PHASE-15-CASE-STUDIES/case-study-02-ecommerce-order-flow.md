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
| Kısmi yazma (sipariş var ama kalemler yok) | Phase 5 P5.5 — `db.exec('BEGIN')`/`COMMIT`/`ROLLBACK` transaction testleri; Phase 7 `database-testing.test.js` CRUD/FK/CHECK testleri | **KAPALI** — tek transaction, all-or-nothing |
| Overselling (iki EŞZAMANLI sipariş) | **[Codex fix-campaign B8 ile eklendi]** `backend/tests/order-concurrency.test.js` — GERÇEK, `Promise.all` ile aynı anda ateşlenen 2 ve ardından 5 eşzamanlı `POST /api/orders`, son 1 birim stok için canlı sunucuya karşı. Sonuç: HER İKİ senaryoda da TAM OLARAK 1 kazanan (201/PAID), kalanı 409 (Yetersiz stok), final stok TAM OLARAK 0 (asla negatif). **Önceki tur bu satırı yalnızca tek-transaction atomicity kanıtıyla "KAPALI" etiketlemişti — bu, TEK bir siparişin all-or-nothing yazıldığını kanıtlar ama İKİ AYRI, eşzamanlı siparişin aynı son birimi "kazanamayacağını" KANITLAMAZ. Codex'in bulduğu tam olarak buydu; şimdi gerçek eşzamanlılık testiyle kapatıldı.** | **KAPALI** — gerçek eşzamanlılık testiyle kanıtlandı (bkz. not aşağıda) |
| Yanlış toplam | Phase 7 `database-testing.test.js` — `orders.total == SUM(order_items.quantity*unit_price)` SQL aggregate ile çok-satırlı gerçek siparişler üzerinde doğrulandı | **KAPALI** |
| IDOR | Phase 5 P5.3 + Phase 11 `security.test.js` (non-numeric/negative/sequential enumeration) | **KAPALI** — 404, cross-user sızıntı yok |
| Mass Assignment | Phase 11 `security.test.js` — `user_id`/`status`/`total` enjeksiyonu tamamen etkisiz | **KAPALI** |
| Frontend↔Backend↔DB tutarlılığı | **[Codex fix-campaign B2 ile düzeltildi]** `web-tests/tests/ui-to-db-validation.spec.js` — GERÇEK Playwright tarayıcı akışı (login + ürün gezinme), DB'deki gerçek satırlarla eşleştiği kanıtlandı. (Önceki tur "Phase 8 web-tests" diye atıf yapıyordu ama o zaman web-tests'te BÖYLE bir test yoktu — gerçek UI→DB testi bu campaign'in B2 fix'iyle eklendi; atıf düzeltildi.) Sipariş oluşturma UI'ı bu uygulamada hiç YOK, dolayısıyla bu satır yalnızca login+gezinme için geçerlidir. | **KAPALI** (login+gezinme kapsamında) |
| Gerçek-dünya performans altında davranış (ürün listeleme + login) | Phase 14 Locust — 526 istek, 0 hata, p99=15ms (ürün listeleme + login ağırlıklı) | **KAPALI** (bu trafik profili için) |
| Gerçek-dünya performans altında davranış (sipariş oluşturma) | **[Codex fix-campaign B8 ile eklendi]** Locust'un `locustfile.py`'ı, kendi docstring'inin İDDİA ETTİĞİ ("occasionally place an order") ama önceki turda hiçbir task'ta GERÇEKTEN çağrılmayan `POST /api/orders`'ı artık gerçekten içeriyor (`place_order` task'ı). Aynı gerçek backend'e karşı yeniden çalıştırıldı: 549 istek toplam, **22 gerçek `POST /api/orders`, 0 hata**, sipariş p99=6ms. Önceki tur bu satırı hiç içermiyordu — order load test iddiası YOKTU, şimdi gerçek | **KAPALI** — gerçek order-load koşusuyla kanıtlandı |

**Overselling'in NEDEN güvenli olduğuna dair teknik not:** Bu backend,
`node:sqlite`'ın SENKRON `DatabaseSync` API'sini kullanıyor —
`db.exec('BEGIN')`'den `COMMIT`'e kadar HİÇBİR `await` YOK
(`orders.service.js`). Node'un tek-threadli event loop'u ile
birleşince, bu, bir siparişin transaction'ı BAŞLADIĞINDA event loop'a
GERİ DÖNMEDEN tamamlanacağı, dolayısıyla İKİ isteğin process İÇİNDE
gerçekten kesişemeyeceği anlamına gelir — bu, testlerin GERÇEKTEN
kanıtladığı davranışın MİMARİ nedenidir. **Önemli sınır:** bu garanti
TEK bir Node.js process'e özgüdür; uygulama gelecekte yatay olarak
ölçeklenirse (birden fazla process/instance, paylaşılan bir DB'ye karşı),
bu senkron-tek-thread korumasının YERİNİ DB seviyesinde satır kilitleme/
isolation level alması gerekir — bu şu an test edilmemiştir (tek-process
mimari, bu case study'nin gerçek kapsamıdır).

**Gerçek regresyon:** Bu akış, campaign boyunca EN ÇOK test edilen
akıştır — `orders.test.js`, `events.test.js`, `notifications.test.js`,
`database-testing.test.js`, `security.test.js`, `graphql.test.js`
(createOrder mutation), `graphql-websocket-notification.test.js`,
`order-concurrency.test.js`, `web-tests` (`realtime-notification.spec.js`,
`ui-to-db-validation.spec.js`) — hepsi (bu fix-campaign sonrası itibarıyla)
144 testlik backend suite'inin ve 26 testlik web-tests suite'inin bir
parçası olarak defalarca PASS.

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
