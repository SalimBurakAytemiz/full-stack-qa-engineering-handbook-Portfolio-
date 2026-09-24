# FIX-7 — B5 fail gate + N4 + N5 + N7 (final remaining fix campaign)

**Codex fix-delta re-review'un denetlediği HEAD:** `2b1966d`
**Kapsam:** Codex'in fix-delta re-review'unda bulduğu 2 açık P2
blocker'dan 1'i (B5'in eksik parçası — fail gate) ve 3 açık non-blocking
not (N4, N5, N7). N6 (manifest/Git consistency) bu dosyanın DIŞINDA,
FIX-8'de (final manifest senkronizasyonu) ele alınmıştır.

---

## B5 (P2 — kalan parça) — JMeter fail gate

Önceki tur (FIX-4) gerçek Correlation ve Threshold (`DurationAssertion`)
ekledi ama Codex'in doğru bulduğu gibi, başarısız bir JMeter sonucunu
process exit code'a bağlayan bir RUNNER yoktu — `.jmx` doğrudan `jmeter
-n -t ...` ile çalıştırılıyordu, hiçbir sarmalayıcı YOKTU.

**Kök neden AMPİRİK olarak yeniden doğrulandı:** bu sandbox'ta gerçek
bir JMeter çöküşünde (`ForbiddenClassException`) bile JMeter'ın KENDİ
process exit code'u **0** idi — sarmalayıcısız bir CI adımı bunu
YANLIŞLIKLA PASS sayardı.

**Düzeltme:** `automation-labs/jmeter/scripts/run-jmeter.js` (yeni) —
`parseJtl()` (header-driven, `success` sütununu isimle bulur, sabit
kolon sırası VARSAYMAZ) + `determineExitCode()` (herhangi bir
`success=false` satırı → non-zero) + `runJMeter()` (gerçek `jmeter`
binary'sini `spawnSync` ile çalıştırır, JMeter'ın KENDİ exit code'unu
bir taban olarak kontrol eder, SONRA JTL içeriğini bağımsız değerlendirir).

**Doğrulama (üç ayrı seviyede, hepsi bu turda GERÇEKTEN çalıştırıldı):**

1. **Fixture-tabanlı unit testler** (`run-jmeter.test.js`, 7 test,
   JMeter runtime'ından bağımsız): `node --test run-jmeter.test.js` →
   7/7 PASS. Bu testlerin GELİŞTİRME sırasında GERÇEK bir hata
   yakaladığı da belgelendi (bir fixture'daki tırnaksız virgül alanı) —
   test altyapısının kozmetik değil, GERÇEKTEN iş yaptığının kanıtı.
2. **Controlled PASS/FAIL kanıtı** (doğrudan `node -e` ile, gerçek
   process exit code okunarak): PASS fixture → exit 0; FAIL fixture
   (1 fonksiyonel + 1 duration-threshold hatası) → exit 1, her iki
   hata da doğru raporlandı.
3. **Gerçek JMeter binary'sine karşı uçtan uca** (`npm run jmeter:test`
   ile): aynı XStream çöküşü oluştu, ama sarmalayıcı bu SEFER
   `LAUNCH_OR_RUNTIME_ERROR` ile **exit code 1** verdi — JMeter'ın
   kendi 0'lık exit code'una RAĞMEN doğru davrandı.

Detay: `evidence/PHASE-10-AUTOMATION-LEARNING-LABS/EXECUTION.md`
Bölüm 3.5.

**B5 nihai durum: IMPLEMENTATION PASS, CONTROLLED FAIL GATE PASS,
NORMAL PASS GATE PASS, CORRELATION PASS, THRESHOLD PASS, JMeter native
runtime ENVIRONMENT BLOCKED (doğrulanmış, sarmalayıcı doğru
raporluyor). RESOLVED.**

---

## N4 — Access log query leakage (bu turda gerçekten kapatıldı)

Önceki tur bunu "gerçek risk yok, kod değişikliği gerekmedi" olarak
kapatmıştı — Codex bunu YENİDEN AÇTI ve savunma-derinliği (defense in
depth) açısından gerçek bir redaksiyon istedi (bir client'ın YANLIŞLIKLA
bir token/password'ü query string'e koyabileceği senaryosu için).

**Düzeltme:** `backend/src/middleware/requestContext.js` —
`redactSensitiveQuery()` (yeni, export edilmiş): `token|password|secret|
api[_-]?key|auth` deseniyle eşleşen query KEY'lerinin (DEĞERLERİNİN
DEĞİL — bu yanlış-pozitif üretmez) değerini `<redacted>` ile değiştirir,
diğer TÜM key'leri ve path'i olduğu gibi bırakır (gözlemlenebilirlik
korunur).

**Test kanıtı:** `observability.test.js`'e 5 yeni test — unit-seviyesi
(normal path, non-sensitive değer korunur, 5 farklı sensitive key
deseni, karışık key'ler) + 1 GERÇEK entegrasyon testi (canlı sunucuya
`?token=SUPER-SECRET-DO-NOT-LOG&category=keyboards` ile istek atılır,
gerçek log satırı okunur):
```
[http] request_id=... method=GET path=/api/products?token=<redacted>&category=keyboards status=200 duration_ms=0.5
```
Ham secret değeri log satırında YOK, `category` değeri korunmuş.
`node --test tests/observability.test.js` → 12/12 PASS.

**Durum: RESOLVED.**

---

## N5 — Phase 16 kategori dağılımı yanlış belgelenmişti

Önceki tur soru SAYISINI (30) düzeltmişti ama "her kategoride 2-3 soru"
ifadesi YANLIŞTI — Appium kategorisinde (S8) yalnızca 1 soru var.

**Düzeltme:** Gerçek dağılım `grep -c "^### S<n>\."` ile kategori
başına yeniden sayıldı ve `EXECUTION.md`'ye tam bir tablo olarak
eklendi (Manual QA=2, Test Design=2, API=3, SQL=2, Mobile=2,
Automation=2, Selenium=2, **Appium=1**, Performance=2, Security=3,
CI/CD=2, Senior QA=2, QA Lead=2, Scenario Questions=3, Toplam=30).
`INTERVIEW-PREP.md`'nin kendi "2-4 soru" kapsam notu da "1-3 soru"
olarak düzeltildi (gerçek aralık budur). Yeni soru EKLENMEDİ — sırf
cümle "doğru" görünsün diye icat etmek yasaktı.

**Durum: RESOLVED.**

---

## N7 — Türkçe WHY comment standardı (hedefli, churn'süz)

Önceki tur bu notu "bilinçli kapsam kararı, kod değiştirilmedi" olarak
kapatmıştı — Codex bunu, spesifik bir hedefli kapsamla (100 dosyaya
yorum spam'i DEĞİL, yalnızca Phase 6-19'un GERÇEKTEN önemli logic'i)
YENİDEN AÇTI.

**Düzeltme:** 7 dosyada, TEK bir hedefli Türkçe WHY paragrafı eklendi
(mevcut İngilizce açıklamaların ÜZERİNE, onları SİLMEDEN/DEĞİŞTİRMEDEN
— churn yok, kod davranışı DEĞİŞMEDİ):

| Dosya | Alan |
|---|---|
| `backend/src/graphql/resolvers.js` (`requireUserId`) | GraphQL auth/authz |
| `backend/src/realtime/websocketServer.js` (`socketsByUserId`) | WebSocket routing/izolasyon |
| `backend/src/services/events.service.js` (`createOrderPaidEvent`) | Event/correlation zinciri |
| `backend/src/services/orders.service.js` (transaction bloğu) | Transaction/data integrity — B8'in eşzamanlılık kanıtının mimari nedeni |
| `backend/src/middleware/requestContext.js` (redaksiyon deseni) | Observability/security dengesi |
| `automation-labs/selenium/driver-factory.js` | Selenium portability nedeni |
| `automation-labs/jmeter/scripts/run-jmeter.js` (`determineExitCode`) | JMeter fail gate nedeni |
| `QA-DEMO-SYSTEM/Dockerfile` | Docker runtime-sensitive path nedeni |

İngilizce canonical identifier'lar (fonksiyon/değişken adları)
DEĞİŞMEDİ. Trivial WHAT açıklaması EKLENMEDİ — yalnızca "bu NEDEN
böyle" sorusuna cevap veren paragraflar.

**Doğrulama:** `node --test tests/**/*.test.js` → 149/149 (değişiklik
YOK, yalnızca yorum eklendi); `node --check` ile tüm değiştirilen `.js`
dosyaları sözdizimsel olarak doğrulandı.

**Durum: RESOLVED.**

---

## Regresyon (bu round sonrası)

```
$ node --test tests/**/*.test.js          # backend
tests 149, pass 149, fail 0

$ node --test run-jmeter.test.js          # JMeter fail-gate unit
tests 7, pass 7, fail 0
```

**Açık blocker (bu round): B5 RESOLVED. Açık non-blocking: N4, N5, N7
hepsi RESOLVED.**
