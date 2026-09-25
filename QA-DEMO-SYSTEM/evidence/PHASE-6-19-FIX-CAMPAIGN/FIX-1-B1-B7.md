# FIX-1 — B1 (P1, Phase 6) + B7 (P1, Phase 14)

**Codex audited HEAD:** `a359b39`
**Kapsam:** Codex bağımsız Phase 6-19 audit'inin bulduğu 2 P1 blocker.

---

## B1 — GraphQL createOrder PAID notification WebSocket'e iletilmiyordu

### Kök neden (kod okunarak doğrulandı)

`backend/src/app.js`, `pushNotificationToUser`'ı `createOrdersRouter`'a
(REST) enjekte ediyordu, ama `createGraphQLHandler(db)`'ye HİÇ
geçmiyordu. `graphql/resolvers.js`'in `createOrder` resolver'ı,
`orders.service.createOrder()`'ı çağırıp `result.notification`'ı
alıyordu ama onunla hiçbir şey yapmıyordu — REST route'un aksine.
Sonuç: GraphQL üzerinden oluşturulan PAID sipariş, notification'ı DB'ye
GERÇEKTEN yazıyordu (sonraki `GET /api/notifications` çağrısında
görünür), ama o an bağlı bir WebSocket istemcisine ASLA push
edilmiyordu.

### Düzeltme

- `backend/src/graphql/index.js`: `createGraphQLHandler(db,
  pushNotificationToUser = () => false)` — REST route'un aldığı AYNI
  fonksiyon, aynı DI deseniyle, `contextValue`'ya eklendi.
- `backend/src/graphql/resolvers.js`: `createOrder` resolver'ı, REST
  route'un yaptığı İLE AYNI şeyi yapıyor — `result.notification` varsa
  `context.pushNotificationToUser(...)` çağırıyor. Yeni bir business
  logic YOK, yalnızca zaten var olan canonical fonksiyonun GraphQL
  transport'una da bağlanması.
- `backend/src/app.js`: `createGraphQLHandler(db, pushNotificationToUser)`.

### Test kanıtı

`backend/tests/graphql-websocket-notification.test.js` (5 yeni test):

1. GraphQL PAID order → doğru kullanıcının WS'ine push edilir, mesaj
   gerçek order id'siyle correlate ediliyor (pozitif).
2. Başka bağlı kullanıcı, GraphQL'in oluşturduğu order'ın bildirimini
   ALMIYOR (negatif — ownership/isolation).
3. GraphQL DECLINED order → hiçbir realtime mesaj push edilmiyor.
4. Unauthenticated `createOrder` mutation → push denenmeden
   UNAUTHENTICATED ile reddediliyor.
5. Regresyon kilidi: REST üzerinden oluşturulan order'lar bu fix'ten
   SONRA da hâlâ push ediliyor (mevcut davranış bozulmadı).

```
$ node --test tests/graphql-websocket-notification.test.js
tests 5, pass 5, fail 0
```

**Timing:** Testler sabit `setTimeout` bekleme YERİNE gerçek
`ws.once('message', ...)` event-driven promise'leri kullanıyor
(mevcut `websocket-events-advanced.test.js` deseniyle aynı) — flaky
timing-only assertion YOK.

---

## B7 — Dockerfile shared/test-data path uyuşmazlığı

### Kök neden (kod okunarak + ampirik path hesabıyla doğrulandı)

`backend/src/database/seed.js`:
```js
const SHARED_TEST_DATA_DIR = path.join(__dirname, '..', '..', '..', '..', 'shared', 'test-data');
```
Container içinde `__dirname` = `/app/QA-DEMO-SYSTEM/backend/src/database`
olduğundan bu **`/app/shared/test-data`**'ya çözümleniyor (doğrudan
`node -e` ile path aritmetiği çalıştırılarak doğrulandı — varsayılmadı).

Ama eski Dockerfile: `COPY shared /shared` — bu, `shared/`'ı
container'ın DOSYA SİSTEMİ KÖKÜNE (`/shared`) kopyalıyordu, `/app`'ın
TAMAMEN DIŞINA. Runtime'da seed.js `/app/shared/test-data`'yı ararken
bulamayacaktı.

### Düzeltme

`COPY shared /app/shared` — artık `WORKDIR /app` altına, seed.js'in
gerçekten aradığı yere kopyalanıyor. Yorum satırı, path aritmetiğinin
NEDEN bu şekilde çözümlendiğini açıklayacak şekilde güncellendi.

### Doğrulama

```
$ node -e "... path.join('/app/QA-DEMO-SYSTEM/backend/src/database', '..','..','..','..','shared','test-data') ..."
/app/shared/test-data
Match: true
```

Diğer path'ler yeniden gözden geçirildi, hepsi tutarlı:
- `WORKDIR /app/QA-DEMO-SYSTEM` + `CMD ["node", "backend/src/server.js"]`
  → `/app/QA-DEMO-SYSTEM/backend/src/server.js` — doğru.
- `DB_PATH=/app/QA-DEMO-SYSTEM/backend/data/qa-demo.db`,
  `docker-compose.yml`'deki volume target'ıyla BİREBİR aynı — doğru.
- Healthcheck `PORT` env'i kullanıyor, `docker-compose.yml`'in
  healthcheck'iyle aynı desen — doğru.
- `.dockerignore` (repo kökü) `node_modules`/`data`/`reports`/
  `results`/`*.log` hariç tutuyor; secrets/credential dosyası (`.env`
  vb.) repo'da zaten YOK (Phase 19 secret scan'de doğrulandı) —
  image'e gömülen bir secret YOK.

### Runtime doğrulama durumu — DÜRÜSTÇE

Bu oturumda `docker info` / `docker build` yeniden çalıştırıldı:
```
$ docker build -f QA-DEMO-SYSTEM/Dockerfile -t qa-demo-system-test .
ERROR: failed to connect to the docker API at unix:///var/run/docker.sock:
dial unix /var/run/docker.sock: connect: no such file or directory
```
Sandbox'ta hâlâ (Phase 14'te olduğu gibi) bir Docker daemon YOK — bu
GERÇEKTEN doğrulandı, varsayılmadı. `docker compose config` (daemon
gerektirmeyen syntax kontrolü) TEKRAR PASS etti.

**Sınıflandırma: IMPLEMENTATION FIXED — RUNTIME VALIDATION BLOCKED BY
ENVIRONMENT (doğrulanmış, PASS iddiasında bulunulmadı).**

---

## Full Backend Regresyon (B1+B7 sonrası)

```
$ node --test tests/**/*.test.js
tests 140, pass 140, fail 0
```
(135 önceki + 5 yeni B1 testi. B7 kaynak kodu — Dockerfile — backend
test suite'inin kapsamı dışında, regresyona etkisi yok, beklenen
sonuç budur.)

**Açık blocker (B1, B7): 0 — ikisi de RESOLVED.**
