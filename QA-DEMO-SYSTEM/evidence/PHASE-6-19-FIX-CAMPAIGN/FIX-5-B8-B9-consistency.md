# FIX-5 — B8 (P2, Phase 15) + B9 (P2, Phase 19) + Phase 17-19 Consistency

**Codex audited HEAD:** `a359b39`

---

## B8 — Case study, gerçek browser→DB, order load ve concurrency/overselling kanıtlanmadan kapanmış gibi anlatıyor

### Kök neden (kod okunarak doğrulandı)

`case-study-02-ecommerce-order-flow.md` iki risk satırında overclaim
yapıyordu:

1. **Overselling:** "KAPALI" olarak, yalnızca Phase 5's tek-transaction
   (`BEGIN`/`COMMIT`/`ROLLBACK`) atomicity testlerini kanıt gösteriyordu
   — bu, TEK bir siparişin all-or-nothing yazıldığını kanıtlar, İKİ AYRI
   eşzamanlı siparişin aynı son stoğu kazanamayacağını KANITLAMAZ.
   `grep -rln "Promise.all|concurrent|concurrency|race"
   backend/tests/` ile campaign genelinde arandı: yalnızca concurrent
   LOGIN (`auth.test.js`) ve concurrent WS-bağlantı (`websocket-events-
   advanced.test.js`) testleri bulundu — concurrent ORDER testi hiçbir
   yerde YOKTU.
2. **Frontend↔Backend↔DB tutarlılığı:** "Phase 8 web-tests 'UI → DB
   Validation' testi" diye atıf yapıyordu — ama o zaman (bu fix
   campaign'den ÖNCE) web-tests'te böyle bir test YOKTU (gerçek UI→DB
   testi B2 ile bu campaign'de eklendi).

### Düzeltme

1. **Gerçek concurrency/overselling testi YAZILDI (placeholder/reword
   DEĞİL):** `backend/tests/order-concurrency.test.js` — 2 test:
   - Ürün 3'ün stoğu 1'e ayarlanır, 2 KULLANICI `Promise.all` ile
     GERÇEKTEN eşzamanlı `POST /api/orders` gönderir → TAM OLARAK 1
     tanesi 201/PAID, diğeri 409, final stok TAM OLARAK 0.
   - Aynı senaryo 5 eşzamanlı istekle — TAM OLARAK 1 kazanan, 4 kaybeden.
   - Mimari NEDEN belgelendi: `node:sqlite`'ın senkron `DatabaseSync`
     API'si + Node'un tek-threadli event loop'u, transaction'ın
     event loop'a GERİ DÖNMEDEN tamamlanmasını sağlar — bu garantinin
     TEK-process'e özgü olduğu ve yatay ölçeklenme senaryosunda DB
     seviyesi kilitleme gerekeceği AÇIKÇA sınır olarak belirtildi.
   ```
   $ node --test tests/order-concurrency.test.js
   tests 2, pass 2, fail 0
   ```
2. **Yanlış atıf düzeltildi:** case study artık `web-tests/tests/
   ui-to-db-validation.spec.js`'e (B2'nin GERÇEK sonucu) doğru atıf
   yapıyor, sipariş oluşturma UI'ının hiç var olmadığı AÇIKÇA
   tekrarlanıyor.
3. **`locustfile.py`'daki AYRI bir gerçek bulgu:** dosyanın kendi
   docstring'i "occasionally place an order" diyordu ama HİÇBİR task
   `POST /api/orders` ÇAĞIRMIYORDU — kod, iddia ettiğini yapmıyordu.
   Gerçek bir `place_order` task'ı eklendi, AYNI backend'e karşı
   YENİDEN çalıştırıldı: **549 istek, 0 hata, 22 GERÇEK `POST
   /api/orders`** (p99=6ms). Hem `case-study-02.md` hem Phase 14
   `EXECUTION.md` gerçek yeni sayılarla güncellendi.
4. Case study'nin "Gerçek regresyon" paragrafındaki eski test sayıları
   (128/23) güncel sayılarla (144/26) düzeltildi, yeni test dosyaları
   listeye eklendi.

**Sınıflandırma: RESOLVED — gerçek eşzamanlılık testi ve gerçek
order-load koşusuyla, iddia edilenle GERÇEKTEN kanıtlanan artık
birebir eşleşiyor.**

---

## B9 — `api:test:schema:negative-proof` local/static olmasına rağmen live execution olarak anlatılıyordu

### Kök neden (kod okunarak doğrulandı)

`api-tests/scripts/schema-negative-proof.js`'de `grep -n
"fetch|http://|localhost"` **0 eşleşme** verdi — bu suite hiçbir HTTP
isteği ATMAZ, sabit/kurgusal JSON payload'larını doğrudan AJV'ye karşı
test eder. Ama `PHASE-19-CLEAN/EXECUTION.md`'nin final tablosu bu
satırı, 5 GERÇEKTEN canlı suite'in YANINA aynı tabloya koyup "Tüm
suite'ler ... gerçek, canlı bir backend sunucusuna karşı ...
çalıştırıldı — hiçbiri mock/stub değildir" cümlesiyle kapatmıştı — bu
6 satırdan 1'i için YANLIŞTI. Bu ayrım Phase 5.9'da BİR KEZ zaten
düzeltilmişti; bu Phase 19 evidence'ı aynı karışıklığı yeniden
içeri almıştı.

### Düzeltme

`PHASE-19-CLEAN/EXECUTION.md`, `.ai/PHASE-6-19-CAMPAIGN-STATE.md`, ve
`.ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md` — üçü de, 6 API-tests
suite'ini artık AÇIKÇA **5 LIVE + 1 LOCAL/STATIC** olarak ayırıyor,
`grep` ile doğrulanan gerekçeyle. Sayı tahmin EDİLMEDİ — kod okunarak
doğrulandı.

**Sınıflandırma: RESOLVED — doğru sınıflandırma her üç dosyada da
tutarlı.**

---

## Phase 17-19 Consistency Re-Pass

Codex'in "Phase 18 self-audit gerçekten artık açık blockerları
yakalıyor mu kontrol et" ve "Phase 19 yalnız blocker 0 ise READY
olabilir" talimatları üzerine, Phase 17/18/19'un kendi evidence
dosyalarına dürüst amendment notları eklendi (tarihsel içerik
SİLİNMEDİ/DEĞİŞTİRİLMEDİ — yalnızca üstüne net bir "sonradan eklenen
not" konuldu):

- **Phase 17** (`EXECUTION.md`): kontrol listesinin MEKANİK
  tutarlılık kontrolleri olduğu, teknik DOĞRULUĞU değerlendirmediği
  (bu Phase 18'in işiydi) ve Codex'in Phase 18'in de kaçırdığı 9
  blocker bulduğu AÇIKÇA belirtildi.
- **Phase 18** (`CLAUDE-SELF-AUDIT.md`): "gerçekten yakalıyor mu"
  sorusuna DÜRÜST cevap eklendi — **HAYIR**, self-audit B1-B9'un
  HİÇBİRİNİ yakalamadı; bu, dosyanın kendisinin zaten itiraf ettiği
  "bağımsız inceleme YERİNE GEÇMEZ" ifadesinin somut kanıtı olarak
  belgelendi.
- **Phase 19** (`EXECUTION.md`): "Açık blocker: 0" iddiasının Codex
  tarafından YANLIŞ bulunduğu, gerçek durumun bu fix-campaign'in
  evidence'ında olduğu, üst kısımda net bir amendment ile belirtildi.

Bu notlar, campaign'in Evidence Integrity ilkesinin doğal bir
uzantısıdır: geçmişte GERÇEKTEN inanılan (ve o an GERÇEKTEN
çalıştırılan komutlara dayanan) bir sonucun, sonradan yanlış çıktığı
ortaya çıktığında, kaydı SİLMEK yerine DÜRÜSTÇE düzeltmek.

---

## Regresyon

```
$ node --test tests/**/*.test.js   # backend
tests 144, pass 144, fail 0
```

**Açık blocker (B8, B9): 0 — ikisi de RESOLVED.**
