# Case Study 06 — Production Incident Investigation

## Gerçek Sistem Durumu

QA-DEMO-SYSTEM'in gerçek bir production dağıtımı/gerçek kullanıcı
trafiği YOKTUR (Phase 12 `ENVIRONMENT-CONCEPTS.md`'de zaten dürüstçe
belirtildi). Bu nedenle GERÇEK bir incident hiç YAŞANMADI. Ancak bu
campaign, bir incident'ın QA tarafındaki en kritik ön-koşulunu —
**bir isteği log satırlarına kadar izleyebilme yeteneğini** —
GERÇEKTEN inşa etti (Phase 13).

## Kurgusal Senaryo (Gerçek Araçlarla)

**Senaryo:** Bir kullanıcı "sipariş verdim ama bildirim gelmedi"
şikayetinde bulunuyor. Support ekibi QA'dan kök nedeni bulmasını
istiyor.

**Bu sistemde GERÇEKTEN mevcut olan araçlarla nasıl araştırılır:**

1. **Correlation ID ile izleme** (Phase 13): Kullanıcının browser'ından
   alınan `X-Request-Id` (her yanıtta gerçekten mevcut,
   `observability.test.js` ile doğrulandı) ile sunucu loglarında
   `request_id=<id>` satırı aranır — bu satır GERÇEK method/path/
   status/süre içerir (Phase 13'te bulunan `req.path` bug'ı
   düzeltildikten sonra artık DOĞRU path'i gösteriyor).
2. **DB'yi test oracle olarak kullanma** (Phase 7): `SELECT * FROM
   orders WHERE user_id = ?` ve `SELECT * FROM events WHERE order_id =
   ?` ile siparişin GERÇEKTEN `PAID` durumuna ulaşıp ulaşmadığı,
   `order.paid` event'inin GERÇEKTEN emit edilip edilmediği
   doğrulanır.
3. **WebSocket delivery'yi izole etme** (Phase 6): Eğer event
   emit edildiyse ama bildirim gelmediyse, sorun `pushNotificationToUser`
   çağrısında mı yoksa kullanıcının o an bağlı olmamasında mı —
   `websocketServer.js`'in "best-effort delivery" mimarisi (bağlantı
   yoksa `false` döner, hata FIRLATMAZ) zaten bunun GERÇEK, beklenen
   bir durum olduğunu gösterir; kullanıcı `GET /api/notifications`
   ile bildirimi HER ZAMAN fetch edebilir (Phase 6 `websocket.test.js`
   ile kanıtlandı).
4. **Regresyon mu yeni bug mu?** (Phase 13 §4): İlgili test dosyaları
   (`events.test.js`, `notifications.test.js`, `websocket.test.js`)
   ÇALIŞTIRILIR — hepsi PASS ise, bu üretim-spesifik bir konfigürasyon/
   ortam sorunudur, kod hatası DEĞİLDİR.

## Gerçek Bir Bulgu Bu Yaklaşımla Nasıl Yakalanırdı (Örnek)

Phase 13'ün kendi gerçek bulgusu (req.path'in yanlış loglanması) TAM
OLARAK bu senaryodaki 1. adımın gerçek bir örneğidir: "bu isteğin log
satırı neden yanlış path gösteriyor?" sorusu, doğrudan bir production
incident investigation adımıdır — ve bu campaign'de GERÇEKTEN
yaşandı, gerçek kod incelemesiyle kök nedeni bulundu, düzeltildi.

## Sınıflandırma

**Kısmen GERÇEK (Phase 13'ün correlation-ID altyapısı + Phase 6/7'nin
gerçek test kanıtı), kısmen LEARNING (gerçek bir production incident
hiç yaşanmadı — senaryo kurgusal, ama kullanılan ARAÇLAR ve TEKNİKLER
GERÇEK ve bu repoda ÇALIŞIR durumda).**
