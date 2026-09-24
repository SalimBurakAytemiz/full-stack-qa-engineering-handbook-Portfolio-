# FIX-2 — B6 (P2, Phase 13)

**Codex audited HEAD:** `a359b39`

---

## B6 — Malformed JSON, requestContext'ten önce döndüğü için X-Request-Id üretilemiyor

### Kök neden (kod okunarak doğrulandı)

`app.js`'in ESKİ middleware sırası:

```js
app.use(express.json());
app.use(jsonParseErrorHandler);
app.use(requestContext);
```

`jsonParseErrorHandler` 4-argümanlı bir Express ERROR-handling
middleware'idir. `express.json()` bir `SyntaxError` fırlattığında,
Express doğrudan `jsonParseErrorHandler`'a atlar; o da `next()`
ÇAĞIRMADAN 400 yanıtını doğrudan gönderir. `requestContext` ondan
SONRA kayıtlı olduğu için, malformed-JSON isteklerinde ASLA
çalışmıyordu — bu yanıtın ne `X-Request-Id` header'ı ne de
`[http]` access-log satırı vardı.

### Düzeltme

`requestContext`, `express.json()`'dan ÖNCE çalışacak şekilde
taşındı:

```js
app.use(requestContext);
app.use(express.json());
app.use(jsonParseErrorHandler);
```

`requestContext.js` parse edilmiş body'e hiçbir şekilde bağımlı
değil (yalnızca `req.method`/`req.originalUrl` okuyor, `res.on('finish')`
ile logluyor) — bu nedenle en başa taşınması güvenli. Artık HER
yanıt (malformed-JSON 400 dahil) gerçek bir correlation id taşıyor.

### Test kanıtı

`backend/tests/observability.test.js`'e 2 yeni regresyon-kilidi testi
eklendi:

1. Malformed JSON → 400 + gerçek UUID formatında `X-Request-Id` header'ı.
2. Malformed JSON → `[http]` access-log satırı gerçek `request_id` ve
   `path=/api/orders`, `status=400` ile üretiliyor.

```
$ node --test tests/observability.test.js
tests 7, pass 7, fail 0
```

### N4 (non-blocking) — bu fix'in kapsamında AYRICA değerlendirildi

Codex'in N4 notu: "Access log originalUrl query değerlerini
yazabiliyor. Sensitive query data leakage riski değerlendirilmeli."

Bu campaign'in TÜM REST route'ları (`routes/*.js`) tarandı: **hiçbir
route `req.query` OKUMUYOR** — auth token'ı `Authorization` header'ı
ile taşınıyor (query string'de DEĞİL), diğer tüm route'lar body/params
kullanıyor. Query string kullanan TEK yer, WebSocket handshake'i
(`?token=...`) — ama bu, Express'in `app`'ına HİÇ ULAŞMIYOR: Node'un
`http.Server`'ı, bir `'upgrade'` event listener'ı kayıtlıysa (bu
projede `websocketServer.js`'in `httpServer.on('upgrade', ...)`'ı
kayıtlı), `Connection: Upgrade` header'lı istekleri `'request'`
event'ine HİÇ yönlendirmiyor — yalnızca `'upgrade'`'e gidiyor.

**Bu, VARSAYILMADI — doğrudan ampirik olarak test edildi:**

```
$ node -e "... ws://.../ws?token=SUPER-SECRET-TOKEN-VALUE ..."
SERVER_UP 39087
WS_REJECTED_AS_EXPECTED
```
(Konsol çıktısında `[http] ... path=/ws?token=...` satırı YOK —
`requestContext` bu isteğe hiç çalışmadı, çünkü Express'in `app`'ı bu
isteği hiç görmedi.)

**Sonuç: N4 bu kod tabanında GERÇEK bir sorun DEĞİL — doğrulanmış,
redaction eklenmesine gerek yok.** Bu bulgu evidence'a açıkça
kaydedildi (sessizce atlanmadı).

---

## Regresyon

```
$ node --test tests/**/*.test.js
tests 142, pass 142, fail 0
```
(140 önceki [FIX-1 sonrası] + 2 yeni B6 testi.)

`requestContext` global middleware olduğu için, gerçek bir sunucuya
karşı Postman suite'leriyle de ayrıca doğrulandı (Phase 13'teki AYNI
disiplin):

```
$ npm run api:test:postman
requests: 11/11, assertions: 26/26, 0 failed

$ npm run api:test:auth
requests: 19/19, assertions: 42/42, 0 failed
```

**Açık blocker (B6): 0 — RESOLVED.**
**N4 (non-blocking): CLOSED — doğrulandı, kod değişikliği gerekmedi.**
