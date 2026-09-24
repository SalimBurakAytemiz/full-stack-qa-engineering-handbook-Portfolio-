# Case Study 05 — Real-Time WebSocket / Event Flow

## Senaryo

Bir sipariş ödendiğinde (`order.paid`), sistem: (1) `events` tablosuna
bir olay yazar, (2) bir notification kalıcılaştırır, (3) kullanıcı o
an bağlıysa WebSocket üzerinden GERÇEK ZAMANLI push eder. Kullanıcı
bağlı DEĞİLSE, bildirim yalnızca DB'de kalır, sonradan
`GET /api/notifications` ile fetch edilebilir.

## Risk Analizi

| Risk | Ciddiyet | Gerekçe |
|---|---|---|
| Duplicate event/notification (aynı sipariş için iki kez) | Yüksek | Kullanıcı iki kez bildirim alır, veri tutarsızlığı |
| Cross-user leakage (başka kullanıcının bildirimi bana geliyor) | Kritik | Veri sızıntısı |
| Bağlantı yokken bildirim kaybolması | Yüksek | Kullanıcı önemli bir bildirimi kaçırır |
| Reconnect sonrası state tutarsızlığı | Orta | "Kaç kullanıcı bağlı" sayımının bozulması |
| Sunucunun inbound mesajları güvensiz şekilde işlemesi | Orta | Push-only mimarisinin yanlışlıkla genişletilmesi |

## Test Stratejisi ve GERÇEK Sonuçlar

| Risk | Kanıt | Sonuç |
|---|---|---|
| Duplicate event (DB katmanı) | Phase 5 P5.7 + `seed.test.js`/`events.test.js` — `UNIQUE(order_id, event_type)` constraint | **KAPALI** |
| Duplicate event (WS delivery katmanı) | Phase 6 `websocket-events-advanced.test.js` — iki eşzamanlı bağlantı, TEK olay, HER İKİSİ de tam olarak 1 kopya alıyor | **KAPALI** (DB katmanından FARKLI bir açıdan) |
| Cross-user leakage | `websocket.test.js` — "another connected user does not receive someone else's notification" | **KAPALI** |
| Bağlantı yokken kayıp | `websocket.test.js` — "an order created without any live connection still persists a fetchable notification" | **KAPALI** |
| Reconnect | Phase 6 `websocket-events-advanced.test.js` — eski socket temizleniyor, `connectedUserCount()` doğru, yeni bağlantı yeni push'ları alıyor | **KAPALI** |
| Inbound mesaj güvenliği | Phase 6 — sunucunun GERÇEKTEN `ws.on('message', ...)` handler'ı OLMADIĞI kaynak kodda doğrulandı; keyfi/bozuk inbound mesaj gönderilip bağlantının etkilenmediği kanıtlandı | **KAPALI** |
| Event Ordering | Phase 6 — ardışık siparişlerin bildirimleri OLUŞTURULMA sırasıyla push edildi | **KAPALI** |
| Payload doğruluğu | Phase 6 — push edilen JSON'ın alan-alan şeması kilitlendi | **KAPALI** |

**Gerçek regresyon:** `websocket.test.js` (7 test, P4.3) +
`websocket-events-advanced.test.js` (5 test, Phase 6) — 128 testlik
tam suite'in parçası, ayrıca `web-tests/realtime-notification.spec.js`
ile GERÇEK bir tarayıcıda uçtan uca doğrulandı (Phase 8).

## Bilinen Sınırlamalar

- Firebase Cloud Messaging (push notification'ın mobil/arka-plan
  eşdeğeri) — Phase 6'da dürüstçe LEARNING-only (gerçek bulut hesabı
  yok).
- GraphQL subscription (WS üzerinden GraphQL) YOK — bilinçli kapsam
  kararı, REST-tetiklemeli WS push zaten aynı gerçek-zamanlılığı
  sağlıyor.

## Öğrenilenler

Bu case study, "duplicate event" riskinin İKİ FARKLI KATMANDA (DB
constraint VE WS delivery fan-out) BAĞIMSIZ olarak test edilmesi
gerektiğini gösteriyor — biri diğerinin yerini TUTMAZ (bir DB
constraint'i, aynı event'in İKİ farklı canlı bağlantıya YANLIŞLIKLA
İKİ KEZ gönderilmesini yakalayamaz; bu yalnızca delivery-katmanı testiyle
yakalanabilir).
