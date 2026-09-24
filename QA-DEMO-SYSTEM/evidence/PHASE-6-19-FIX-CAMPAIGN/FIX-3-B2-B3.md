# FIX-3 — B2 (P2, Phase 7) + B3 (P2, Phase 9)

**Codex audited HEAD:** `a359b39`

---

## B2 — "UI→DB" testi browser/DOM kullanmıyordu, doğrudan HTTP çağrısı yapıyordu

### Kök neden (kod okunarak + frontend taranarak doğrulandı)

`backend/tests/database-testing.test.js`'in "UI -> DB Validation" testi
`fetch()` ile HTTP çağrıları yapıyordu — hiçbir `page`/DOM/tarayıcı
etkileşimi YOKTU. İsim, testin gerçekte kanıtladığından daha güçlü bir
iddiada bulunuyordu (Codex'in tam olarak bulduğu şey).

Ayrıca doğrulandı: `frontend/js/products.js` ve `products.html`'de
`grep -n "order|buy|purchase|cart|checkout"` **0 eşleşme** verdi — bu
uygulamanın frontend'inde sipariş oluşturma/checkout UI'ı HİÇ YOK,
yalnızca login ve ürün gezinme var (Phase 8'in
`realtime-notification.spec.js` başlık yorumunda zaten dürüstçe
belgelenmişti). Bu nedenle tam bir tarayıcı-sürücülü "sipariş oluştur
→ DB" akışı bu repo'da FİZİKSEL OLARAK MÜMKÜN DEĞİL.

### Düzeltme (Option A + B birlikte, dürüstçe)

1. **Reclassify (Option B):** `database-testing.test.js`'teki test
   `"API -> DB Validation"` olarak yeniden adlandırıldı; hem test
   adı hem çevresindeki yorumlar hem de `PHASE-7-DATABASE-TESTING/
   EXECUTION.md`'nin özet tablosu ve "Bilinen Sınırlamalar" bölümü bu
   gerçeği yansıtacak şekilde güncellendi.
2. **Real UI→DB (Option A, mümkün olan kapsamda):**
   `web-tests/tests/ui-to-db-validation.spec.js` (YENİ) — GERÇEK
   Playwright tarayıcı aksiyonlarıyla (form doldurma, tıklama, gerçek
   navigasyon), bu uygulamanın GERÇEKTEN UI'a sahip olduğu 2 akış için:
   - **Login → session persistence:** gerçek login formu → DB'de
     `sessions` tablosunda, tarayıcının `sessionStorage`'ından okunan
     TOKEN'la eşleşen bir satır var mı (DB, yalnızca test ORACLE'ı
     olarak sorgulanıyor — action'ın kendisi HTTP ile bypass
     edilmiyor).
   - **Ürün gezinme → DOM/DB fidelity:** gerçek tarayıcıda render
     edilen her ürünün adı/fiyatı/stok etiketi, DB'deki `products`
     satırlarıyla BİREBİR karşılaştırılıyor.

   DB erişimi, Playwright'ın webServer'ının kullandığı BİLİNEN sabit
   test DB dosyasından (`backend/data/playwright-test.db`,
   `playwright.config.js`'de tanımlı) doğrudan `node:sqlite`
   `DatabaseSync` ile — backend'in kendi `getDatabase()` fonksiyonu
   yeniden kullanılarak (kod tekrarı yok).

### Test kanıtı

```
$ npx playwright test tests/ui-to-db-validation.spec.js
2 passed
```

### Kapsam dürüstlüğü

`web-tests/tests/ui-to-db-validation.spec.js`'in başlık yorumu AÇIKÇA
belirtiyor: sipariş oluşturma için UI→DB iddiası YOKTUR, çünkü UI'ın
kendisi yoktur. Bu, "placeholder completion" değil — gerçekten var
olan UI kapsamı için gerçek bir tarayıcı testi, gerçekten olmayan
kapsam için dürüst bir sınır beyanı.

---

## B3 — Visual regression %1 full-page tolerance gerçek değişiklikleri kaçırabiliyordu

### Kök neden (ampirik olarak doğrulandı)

Üretim assertion'ları (`login-page.png`, `products-page.png`)
`maxDiffPixelRatio: 0.01` kullanıyordu — 1280×720 viewport'ta bu,
**9,216 piksele kadar** fark TOLERE ediliyordu. Suite'in KENDİ negatif
kontrol testi, bu AYNI 1% oranının GERÇEKTEN bir farkı (login sayfası
vs products sayfası) yakalayamadığını daha önce (Phase 9'da) ampirik
olarak bulmuştu — Codex'in bağımsız bulgusuyla BİREBİR aynı zayıflık.

**Bu oturumda YENİDEN ölçüldü (varsayılmadı):** gerçek commit'li
baseline'lara karşı `maxDiffPixels: 0` (sıfır tolerans) ile prob testi
çalıştırıldı:
```
$ npx playwright test tests/probe-diff.spec.js   # (geçici, silindi)
2 passed
```
Yani bu ortamda/browser build'inde iki tekrar çalıştırma arasında
GERÇEKTEN SIFIR piksel farkı var — "anti-aliasing gürültüsünü absorbe
etmek için" gerekçesiyle konan 1% toleransın, bu ortamda hiçbir
gürültü olmadığı için tamamen gereksiz derecede gevşek olduğu
KANITLANDI.

Ek olarak: `grep -n "animation|transition|@keyframes"
frontend/css/style.css` → **0 eşleşme** — flakiness riski oluşturacak
CSS animasyonu/geçişi zaten yok.

### Düzeltme

- `maxDiffPixelRatio: 0.01` (viewport-boyutuna göre ölçeklenen bir
  oran) → `maxDiffPixels: 25` (viewport'tan BAĞIMSIZ, sabit, çok daha
  sıkı bir mutlak piksel tavanı — 9,216'dan 25'e, ~369x daha sıkı).
  Küçük bir güvenlik payı (0 değil, 25) bırakıldı; farklı bir
  Chromium build'inde/CI runner'ında teorik bir font-rendering
  sapması olursa test'i gereksiz kırmamak için — ama bu ortamda
  ÖLÇÜLEN gerçek fark 0 olduğundan bu payın kendisi zaten cömert.
- Dinamik bölge maskeleme (`notification-list`) AYNEN korundu —
  yalnızca sayı/mekanizma değişti, maskeleme mantığı bozulmadı.
- **YENİ controlled-difference proof testi:** login sayfasına, test
  ÇALIŞMA ZAMANINDA `page.addStyleTag()` ile GERÇEKÇİ ölçekte tek bir
  deliberate değişiklik enjekte ediliyor (bir butonun arka plan rengi)
  — frontend KAYNAK KODU DEĞİŞTİRİLMEDEN (canonical source bozulmadı,
  yalnızca runtime'da inject edildi). Bu, mevcut negatif-kontrol
  testinden (iki FARKLI sayfayı karşılaştırma) DAHA GÜÇLÜ bir kanıt —
  AYNI sayfada KÜÇÜK, gerçekçi bir değişikliğin bile yeni sıkı
  toleransta yakalandığını kanıtlıyor.
- **Windows baseline/run policy** dokümante edildi: Playwright'ın
  KENDİ varsayılan snapshot adlandırması zaten platform'u dosya
  adına gömüyor (`*-chromium-linux.png`) — bu repo'nun TEK gerçekten
  çalıştırılan ortamı Linux'tur (bu sandbox VE gerçek GitHub Actions
  CI, `.github/workflows/ci.yml`, `runs-on: ubuntu-latest`, 3/3 job,
  doğrulandı) — Windows'ta HİÇBİR ŞEY "PASS etti" diye iddia
  edilmiyor. Playwright, eksik bir platform-spesifik baseline için
  "snapshot doesn't exist" ile FAIL-CLOSED olur (bu davranış, bu
  oturumda eksik bir baseline'a karşı GERÇEKTEN gözlemlendi) — kod
  değişikliği gerekmedi, yalnızca politika belgelendi.

### Kararlılık kanıtı (2 ardışık çalıştırma — flaky DEĞİL)

```
$ npx playwright test tests/visual-regression.spec.js   # RUN 1
4 passed (2 gerçek + 1 controlled-proof [beklenen FAIL] + 1 negatif-kontrol [beklenen FAIL])

$ npx playwright test tests/visual-regression.spec.js   # RUN 2
4 passed (aynı sonuç, ikinci kez)
```

---

## Full Regresyon (B2+B3 sonrası)

```
$ node --test tests/**/*.test.js                 # backend
tests 142, pass 142, fail 0

$ npx playwright test                             # web-tests (tam suite)
26 passed
```
(23 önceki + 2 yeni B2 testi + 1 yeni B3 controlled-proof testi.)

**Açık blocker (B2, B3): 0 — ikisi de RESOLVED.**
