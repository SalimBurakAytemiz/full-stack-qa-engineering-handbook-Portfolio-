# Case Study 03 — Payment Flow

## Senaryo

`payment.service.js`'in deterministik, tamamen lokal ödeme
simülasyonu: bir `payment_token` gönderilir (`TEST-CARD-APPROVED` /
`TEST-CARD-DECLINED` / `TEST-CARD-TIMEOUT` veya `undefined` →
default), sonuca göre sipariş durumu (`PAID`/`PAYMENT_FAILED`/
`PAYMENT_TIMEOUT`) belirlenir. Gerçek bir dış ödeme sağlayıcısı
ÇAĞRILMAZ (bilinçli mimari karar).

## Risk Analizi

| Risk | Ciddiyet | Gerekçe |
|---|---|---|
| `payment_token` null/false/0/boş string sessizce "default"a düşüyor | Kritik | Açık geçersiz bir değerin sessizce onaylanmış ödemeye dönüşmesi |
| DECLINED/TIMEOUT sonucunda stok yine de düşüyor | Yüksek | Satılmayan ürün stoktan düşer |
| DECLINED/TIMEOUT sonucunda event/notification yine de üretiliyor | Orta | Yanlış "ödeme onaylandı" bildirimi |
| Hata mesajında ham girdi yansıması | Düşük-Orta | Bilgi sızıntısı riski (Phase 11'de detaylandırıldı) |

## Test Stratejisi ve GERÇEK Sonuçlar

| Risk | Kanıt | Sonuç |
|---|---|---|
| null/false/0 sessiz default | Phase 5 P5.5 Codex B3 bulgusu (`resolvePaymentToken` — yalnızca `undefined` default'a düşer, `null` REDDEDİLİR); Phase 6 GraphQL katmanında AYNI bug sınıfı YENİDEN önlendi (`paymentToken ?? undefined` yerine ham geçiş) | **KAPALI** — iki bağımsız transport'ta (REST+GraphQL) doğrulandı |
| Stok DECLINED'da düşüyor mu | `orders.test.js` — yalnızca `status === 'PAID'` durumunda stok düşürülüyor (kod incelemesi + test) | **KAPALI** |
| DECLINED'da event/notification | `events.test.js`/`notifications.test.js` — "a DECLINED order does not emit an order.paid event/notification" | **KAPALI** |
| Hata mesajı yansıması | Phase 11 `security.test.js` — GERÇEK bir bulgu: bilinmeyen `payment_token` hata mesajı ham girdiyi yansıtıyor, ama 3 bağımsız kontrolle (JSON content-type, `textContent` kullanımı, UI'da hiç gösterilmemesi) uçtan uca istismar edilemez olduğu kanıtlandı | **NON-BLOCKING HARDENING NOTU** (küçümsenmedi, ayrıntılı belgelendi) |

**Gerçek regresyon:** `orders.test.js`, `security.test.js`,
`graphql.test.js` (payment_token testleri) — 128 testlik tam suite'in
parçası.

## Bilinen Sınırlamalar

- Gerçek bir ödeme sağlayıcısı (Stripe/Iyzico vb.) entegrasyonu YOK —
  bilinçli mimari karar (`ARCHITECTURE.md`), sentetik test hedefi
  için gerçek bir 3.-parti API'ye bağımlılık istenmedi.
- Kısmi ödeme/iade akışları YOK — sistem yalnızca tek-adımlı
  approve/decline/timeout modelini destekliyor.

## Öğrenilenler

Bu case study, "en tehlikeli hata sınıfının" (falsy bir değerin
sessizce varsayılan davranışa düşmesi) BİRDEN FAZLA transport
katmanında (REST + GraphQL) NASIL tekrar tekrar test edilip
önlenmesi gerektiğini gösteriyor — bir katmanda düzeltilen bir güvenlik
açığı, yeni bir transport eklendiğinde OTOMATİK olarak korunmaz;
Phase 6'da GraphQL resolver'ı yazılırken bu class of bug'ın
KENDİLİĞİNDEN yeniden ortaya çıkma riski gerçekten fark edilip
önlendi (bkz. Phase 6 EXECUTION.md).
