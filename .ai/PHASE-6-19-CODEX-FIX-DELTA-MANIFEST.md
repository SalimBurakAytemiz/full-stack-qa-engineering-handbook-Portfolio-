# PHASE 6-19 — CODEX FIX-DELTA MANIFEST

**Amaç:** Codex'in Phase 6-19 üzerinde yaptığı bağımsız ilk audit,
9 blocker (B1-B9, P1×2 + P2×7) ve 7 non-blocking not (N1-N7) buldu,
FINAL VERDICT: **FAIL / CHANGES REQUIRED**. Bu doküman, o audit
bulgularına verilen TEK TOPLU FIX CAMPAIGN'in delta'sını özetler —
Codex'in Phase 6-19'un TAMAMINI baştan taramasına gerek KALMADAN,
yalnızca bu delta'yı re-review etmesi için tasarlanmıştır.

**Original audited HEAD:** `a359b391a02cfae20166f61a96a259a4f2601e0d`
**1. fix round final HEAD (Codex'in 1. fix-delta re-review'unun denetlediği):** `2b1966d`
**2. fix round final HEAD (Codex'in 2. fix-delta re-review'unun denetlediği):** `3555b53` (`3555b5336ea4486d161f2da861efd019b24238b0`)
**3. fix round final HEAD (Codex'in 3. fix-delta re-review'unun denetlediği):** `0a52cb6` (`0a52cb661e7e7bb5363ef78f39238b5e96df12f2`) — **[N6, 4. tur]** bu satır ÖNCEDEN "bu commit'in kendisi" self-reference kullanıyordu; bu round HİSTORİK hale geldiği için literal SHA'ya DONDURULDU (Codex'in bu turda bulduğu tam olarak bu desendi).
**4. fix round final HEAD (bu round — N6 historical checkpoint self-reference düzeltmesi, docs-only):** bu commit'in kendisi — `git rev-parse HEAD` ile doğrulayın (bkz. `.ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md` başındaki N6 self-reference notu — bu dosya da AYNI ilkeyi izler, literal bir hex değer stale kalabileceği için buraya yazılmaz)
**Dal:** `feat/phase-6-19-full-completion-campaign` (değişmedi)

### Range semantiği (Codex'in N6 talimatı gereği — her aralık ne temsil ediyor, birbirine karıştırılmaz)

| Aralık adı | Range | Commit | Dosya | Durum |
|---|---|---|---|---|
| Original audit range | `837ff2f..a359b39` | (Bölüm 1 tablosu, audit manifest'te) | — | Codex 1. audit: FAIL (B1-B9) |
| First consolidated fix range | `a359b39..2b1966d` | **8** | **35** | Codex 1. re-review: FAIL (B5 fail-gate eksik, N6 stale, N4/N5/N7 reopened) — [önceki tur "7/34" yazmıştı, aralığın kendi son commit'i (`2b1966d`) listeden atlanmıştı, düzeltildi] |
| Remaining-fix range | `2b1966d..3555b53` | 2 | 20 | Codex 2. re-review: FAIL (N4'ün KENDİ FIX-7 kodunda malformed-query regresyonu, N6 yine stale) |
| 3. fix round range | `3555b53..0a52cb6` | 2 | 6 | Codex 3. re-review: FAIL (FIX-8 checkpoint satırı hâlâ "bu commit" self-reference kullanıyordu, tarihsel bir checkpoint için literal SHA'ya DONDURULMAMIŞTI) |
| Bu round (4. — N6 self-reference düzeltmesi) | `0a52cb6..HEAD` | 1 | (aşağıda güncel hesaplanmış) | FIX-11: FIX-8 ve FIX-10 checkpoint satırları literal SHA'ya donduruldu, docs-only |
| Final campaign range | `837ff2f..HEAD` | 43 | 97 | (audit manifest, Bölüm 0) |
| Fix-campaign'in kendi toplamı | `a359b39..HEAD` | 13 | 46 | Dört round toplamı, BU COMMIT DAHİL |

Yukarıdaki `a359b39..2b1966d`, `2b1966d..3555b53` ve `3555b53..0a52cb6`
satırları artık TARİHSEL/DONMUŞ'tur — bu round'un commit'i bunların
DIŞINDA, bu yüzden bir daha değişmezler. Yalnızca "Bu round" satırı
canlıdır; bir sonraki round geldiğinde O DA dondurulmalıdır.

---

## Codex'in 2. Turdaki (2. fix-delta) Re-Review Bulguları ve O Round'daki Düzeltmeleri

Codex'in `3555b53` üzerindeki 2. fix-delta re-review'u **FAIL / CHANGES
REQUIRED** verdi — yalnızca 2 açık blocker kalmıştı:

1. **N4 — GERÇEK regresyon:** FIX-7'de eklenen `redactSensitiveQuery()`,
   `decodeURIComponent(key)`'i unguarded çağırıyordu; malformed
   percent-encoding (`x%ZZ`) bir `URIError` fırlatıyor, bu da
   `requestContext()` içinde `next()`'ten ÖNCE senkron olarak
   çalıştığı için Express'in generic error handler'ına düşüp
   route'un gerçek cevabını 500'e çeviriyordu — "logging application
   behavior'ını bozmamalı" ilkesinin ihlali.
2. **N6 — yine stale:** `a359b39..2b1966d` satırı bu dosyada hâlâ
   "34 dosya / 7 commit" yazıyordu; Codex'in bağımsız `git`
   doğrulaması gerçek sayının 35/8 olduğunu gösterdi (aralığın kendi
   son commit'i, `2b1966d`, listeden atlanmıştı).

O round (FIX-9 + FIX-10) her ikisini kapattı.

---

## Codex'in 3. Turdaki (3. fix-delta) Re-Review Bulgusu ve Bu Round'daki Düzeltmesi

Codex'in `0a52cb6` üzerindeki 3. fix-delta re-review'u **FAIL / CHANGES
REQUIRED** verdi — tek bir açık blocker kaldı:

1. **N6 — checkpoint self-reference dondurulmamış:** Audit manifest'in
   FIX-8 satırı hâlâ "bu commit" self-reference'ı kullanıyordu. FIX-8
   `3555b53`'te tamamlanmış, tarihsel bir checkpoint'ti — ama sonraki
   round'lar (FIX-9, FIX-10) geldiğinde bu satır literal SHA'ya
   DONDURULMEMİŞTİ. Aynı desen FIX-10 satırında da vardı (bu round
   geldiğinde o da tarihsel hale geldi).

Bu round (FIX-11, docs-only) her ikisini de literal SHA'ya dondurur —
detaylar aşağıda ilgili B/N maddesinin ALTINA eklenmiştir (tarihçe
SİLİNMEDİ, yalnızca GÜNCEL durum en altta).

---

## B1 (P1, Phase 6) — GraphQL createOrder PAID notification WebSocket'e iletilmiyordu

- **Files:** `backend/src/graphql/index.js`, `backend/src/graphql/resolvers.js`, `backend/src/app.js`, `backend/tests/graphql-websocket-notification.test.js` (yeni)
- **Commit:** `1b01a4d`
- **Tests:** 5 yeni (pozitif delivery+order-id correlation, cross-user isolation, DECLINED-order silence, unauthenticated rejection, REST-path regresyon kilidi) — `node --test tests/graphql-websocket-notification.test.js` → 5/5 PASS
- **Evidence:** `QA-DEMO-SYSTEM/evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-1-B1-B7.md`

## B2 (P2, Phase 7) — "UI→DB" testi browser/DOM kullanmıyordu

- **Files:** `backend/tests/database-testing.test.js` (reclassify → "API -> DB Validation"), `web-tests/tests/ui-to-db-validation.spec.js` (yeni, GERÇEK Playwright UI→DB), `evidence/PHASE-7-DATABASE-TESTING/EXECUTION.md`
- **Commit:** `1169b82`
- **Tests:** 2 yeni gerçek tarayıcı-sürücülü test — `npx playwright test tests/ui-to-db-validation.spec.js` → 2/2 PASS
- **Evidence:** `QA-DEMO-SYSTEM/evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-3-B2-B3.md`

## B3 (P2, Phase 9) — Visual regression %1 full-page tolerance gerçek değişiklikleri kaçırabiliyordu

- **Files:** `web-tests/tests/visual-regression.spec.js` (`maxDiffPixelRatio: 0.01` → `maxDiffPixels: 25` + Windows baseline policy dokümantasyonu + yeni controlled-proof testi)
- **Commit:** `1169b82`
- **Tests:** 1 yeni controlled-difference proof + 2 mevcut production assertion, 2 ardışık run ile stabilite doğrulandı — 4/4 PASS (2 gerçek `test.fail()` dahil)
- **Evidence:** `QA-DEMO-SYSTEM/evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-3-B2-B3.md`

## B4 (P2, Phase 10) — Selenium CODE COMPLETE iddiası yanlış güçlü, driver portability zayıf

- **Files:** `automation-labs/selenium/driver-factory.js` (portability fix + Firefox + Grid desteği), `automation-labs/selenium/scripts/run-parallel.js` (yeni), `.github/workflows/ci.yml` (+selenium-lab job)
- **Commit:** `3ee709a` (+ `ce5b98c` CI sonucu takibi)
- **Tests:** Driver portability iki senaryoda (env var set/unset) doğrulandı; `run-parallel.js` 3 oturumla test edildi; **GitHub Actions'ta GERÇEKTEN çalıştırıldı: 2/2 PASS** (job log doğrudan okundu)
- **Evidence:** `QA-DEMO-SYSTEM/evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-4-B4-B5.md`

## B5 (P2, Phase 10) — JMeter'da gerçek correlation ve threshold/fail gate yoktu

- **Files:** `automation-labs/jmeter/qa-demo-system-load-test.jmx` (JSONPostProcessor correlation + DurationAssertion threshold)
- **Commit:** `3ee709a`
- **Tests:** XML well-formedness doğrulandı; gerçek backend'e karşı yeniden denendi, AYNI (yeni bir dosya-spesifik hata YOK) kök-nedenli `ForbiddenClassException` alındı
- **Evidence:** `QA-DEMO-SYSTEM/evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-4-B4-B5.md`

**[Codex 2. tur re-review]** Correlation ve Threshold gerçekti ama
başarısız bir JMeter örneğini/assertion'ını process exit code'a
bağlayan bir RUNNER hâlâ YOKTU — Codex bunu ayrı, kalan bir P2 bulgusu
olarak işaretledi.

**2. round düzeltmesi (FIX-7, `81b77b4`):** `automation-labs/jmeter/scripts/run-jmeter.js`
(yeni) — JMeter'ı çalıştırır, SONRA JTL sonuç dosyasının GERÇEK
içeriğini (header-driven `success` sütunu) bağımsız değerlendirip
exit code üretir; JMeter'ın KENDİ exit code'una GÜVENMEZ (ampirik
olarak bu sandbox'ta gerçek bir JMeter çöküşünde bile JMeter'ın kendi
exit code'unun 0 olduğu yeniden doğrulandı). 7/7 fixture-tabanlı unit
test + controlled PASS/FAIL kanıtı (gerçek process exit code'larıyla)
+ gerçek (hâlâ environment-blocked) `jmeter` binary'sine karşı uçtan
uca doğrulama — detay: `evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-7-B5-N4-N5-N7.md`.

**B5 NİHAİ DURUM: IMPLEMENTATION PASS, CONTROLLED FAIL GATE PASS,
NORMAL PASS GATE PASS, CORRELATION PASS, THRESHOLD PASS, JMeter native
runtime ENVIRONMENT BLOCKED (doğrulanmış). RESOLVED.**

## B6 (P2, Phase 13) — Malformed JSON 400 response requestContext'ten önce döndüğü için X-Request-Id üretilemiyordu

- **Files:** `backend/src/app.js` (middleware sırası: `requestContext` artık `express.json()`'dan ÖNCE), `backend/tests/observability.test.js` (2 yeni)
- **Commit:** `56f99ee`
- **Tests:** 2 yeni regresyon-kilidi + tam suite yeniden çalıştırıldı — `node --test tests/observability.test.js` → 7/7 PASS; live Postman suite'lerle de re-verified (11/11, 19/19)
- **Evidence:** `QA-DEMO-SYSTEM/evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-2-B6.md`

## B7 (P1, Phase 14) — Dockerfile shared dosyaları yanlış path'e kopyalıyordu

- **Files:** `QA-DEMO-SYSTEM/Dockerfile` (`COPY shared /shared` → `COPY shared /app/shared`)
- **Commit:** `1b01a4d`
- **Tests:** Path aritmetiği `node -e` ile ampirik doğrulandı (seed.js'in gerçekten aradığı path ile eşleşme kanıtlandı); `docker compose config` syntax PASS; gerçek `docker build` denendi, daemon YOK (aynı, önceden doğrulanmış kısıt, YENİDEN doğrulandı) — implementation fixed, runtime validation blocked by environment
- **Evidence:** `QA-DEMO-SYSTEM/evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-1-B1-B7.md`

## B8 (P2, Phase 15) — Case study, browser→DB/order load/concurrency kanıtlanmadan kapanmış gibi anlatıyordu

- **Files:** `backend/tests/order-concurrency.test.js` (yeni, gerçek eşzamanlılık testi), `automation-labs/locust/locustfile.py` (+`place_order` task), `evidence/PHASE-15-CASE-STUDIES/case-study-02-*.md`, `evidence/PHASE-14-.../EXECUTION.md`
- **Commit:** `e737c95`
- **Tests:** 2 yeni concurrency testi (2-way + 5-way race, `Promise.all` ile gerçek eşzamanlı HTTP) → 2/2 PASS; Locust yeniden çalıştırıldı → 549 istek, 0 hata, 22 gerçek order
- **Evidence:** `QA-DEMO-SYSTEM/evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-5-B8-B9-consistency.md`

## B9 (P2, Phase 19) — `api:test:schema:negative-proof` local/static olmasına rağmen live execution olarak anlatılıyordu

- **Files:** `PHASE-19-CLEAN/EXECUTION.md`, `.ai/PHASE-6-19-CAMPAIGN-STATE.md`, `.ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md` (5 live + 1 local/static ayrımı netleştirildi)
- **Commit:** `e737c95`
- **Tests:** `grep -n "fetch|http://|localhost" schema-negative-proof.js` → 0 eşleşme (doğrulama, yeni test gerekmedi)
- **Evidence:** `QA-DEMO-SYSTEM/evidence/PHASE-6-19-FIX-CAMPAIGN/FIX-5-B8-B9-consistency.md`

---

## Non-blocking fixes (N1-N7)

| # | Bulgu | Sonuç | Commit |
|---|---|---|---|
| N1 | WS "tek mesaj" testi sabit 150ms window | RESOLVED — "mesaj geldi mi" artık event-driven | `8fab168` |
| N2 | Mobile/multi-browser scope doc | VERIFIED — zaten doğru, değişiklik gerekmedi | — |
| N3 | CI/Jenkins DB cleanup path uyuşmazlığı | RESOLVED — 3 yerde `backend/data/qa-demo.db`'ye düzeltildi | `8fab168` |
| N4 | Access log query leakage | 1. round: "gerçek risk yok" (ampirik) — reopened, defense-in-depth redaksiyon istendi. 2. round: "RESOLVED" denildi (`redactSensitiveQuery`) — Codex 2. re-review'u bu KODUN KENDİSİNDE gerçek bir regresyon buldu: `decodeURIComponent(key)` unguarded, malformed `%ZZ` → `URIError` → route 500'e düşüyordu. **3. round: GERÇEKTEN RESOLVED** — `safeDecodeURIComponent()` (try/catch, throw etmez) + fail-closed `<invalid-encoding>=<redacted>` placeholder, 8 yeni test (A/B/C/D senaryolarının hepsi, gerçek HTTP isteğiyle) | `56f99ee` (1.) → `81b77b4` (2., regresyonlu) → `2d6620d` (3., GERÇEK kapanış) |
| N5 | Phase 16 evidence 26 vs gerçek 30 soru | 1. round: soru SAYISI (30) düzeltildi — 2. turda "her kategoride 2-3 soru" ifadesinin YANLIŞ olduğu bulundu (Appium=1). **2. round: RESOLVED** — gerçek kategori dağılımı tablo olarak eklendi, yeni soru İCAT EDİLMEDİ. 3. round'da dokunulmadı (Codex'in bu round'daki talimatı gereği kapsam dışı) | `8fab168` (1.) → `81b77b4` (2., GERÇEK kapanış) |
| N6 | Manifest commit count Git ile uyuşmuyordu | 1. round: "RESOLVED" denildi ama YİNE stale kaldı (37/87 yazılmıştı, gerçek 38/88'di). 2. round: "bu commit" self-reference ilkesiyle "GERÇEKTEN RESOLVED" denildi — ANCAK `a359b39..2b1966d`'nin TARİHSEL satırı (34/7) hiç yeniden hesaplanmamıştı, gerçek: 35/8. 3. round: "GERÇEKTEN RESOLVED" denildi (tüm tarihsel aralıklar yeniden doğrulandı) — ANCAK Codex'in 3. re-review'u YİNE bir eksik buldu: audit manifest'in FIX-8 checkpoint SATIRI (Bölüm 1c) hâlâ "bu commit" self-reference kullanıyordu; FIX-8 kendisi tarihsel hale geldiği (FIX-9/FIX-10 geldiği) halde bu satır literal SHA'ya DONMAMIŞTI — aynı desen FIX-10 satırında da vardı. **4. round: GERÇEKTEN RESOLVED** — FIX-8 (`3555b53`) ve FIX-10 (`0a52cb6`) checkpoint satırları literal exact SHA'ya donduruldu; yalnızca GÜNCEL/final round alanı self-reference kullanmaya devam ediyor | (bu dosya + manifest, bu commit — FIX-11) |
| N7 | WHY comment'leri ağırlıkla English | 1. round: DOCUMENTED (kod değiştirilmedi) — 2. turda hedefli kapsamla (7 dosya) YENİDEN AÇTI. **2. round: RESOLVED** — 7 dosyada hedefli Türkçe WHY paragrafı eklendi, churn yok. 3. round'da dokunulmadı (kapsam dışı) | `8fab168` (1., DOCUMENTED) → `81b77b4` (2., GERÇEK kapanış) |

---

## Final Regression (1. round sonrası, tam campaign — `2b1966d` itibarıyla)

```
Backend (node:test):        144/144 pass
Web-tests (Playwright):     26/26 pass
API-tests — Public:         11 req / 26 assertion, 0 fail (LIVE)
API-tests — Protected:      19 req / 42 assertion, 0 fail (LIVE)
API-tests — Orders&Payment: 64 req / 118 assertion, 0 fail (LIVE)
API-tests — Notifications:  20 req / 48 assertion, 0 fail (LIVE)
API-tests — API→DB:         17 scenario / 97 assertion, 0 fail (LIVE)
API-tests — Schema proof:   19/19 proof case (LOCAL/STATIC)
GitHub Actions CI:          4/4 job SUCCESS (backend, web-tests, api-schema, selenium-lab — YENİ)
Secret scan:                0 gerçek secret
Broken markdown links:      0 (1 false-positive incelendi, elendi)
```

## 2. Round Regresyon (FIX-7+FIX-8 sonrası, `3555b53` itibarıyla)

```
Backend (node:test):              149/149 pass (144 + 5 yeni N4 redaksiyon testi)
JMeter fail-gate unit (node:test): 7/7 pass — JMeter runtime'ından bağımsız
node --check (9 değiştirilen .js): 9/9 sözdizimsel doğru
Secret scan (a359b39..HEAD diff):  0 gerçek secret
Stray runtime artifact:            0 (git status clean, .log taraması temiz)
GitHub Actions CI:                 FIX-A (81b77b4) → SUCCESS (4/4 job)
```

## 3. Round Regresyon (FIX-9 sonrası, `0a52cb6` itibarıyla)

```
Backend (node:test):              157/157 pass (149 + 8 yeni N4 malformed-query testi)
node --check (requestContext.js): sözdizimsel doğru
decodeURIComponent('x%ZZ')        THROWS (kök neden ampirik doğrulandı)
safeDecodeURIComponent('x%ZZ')    undefined (throw ETMEZ — fix doğrulandı)
Secret scan (a359b39..HEAD diff): 0 gerçek secret
Stray runtime artifact:           0 (git status clean)
GitHub Actions CI:                 FIX-9 (2d6620d) → SUCCESS, FIX-10 (0a52cb6) → SUCCESS
```

## 4. Round (bu round, FIX-11 — docs-only, talimat gereği test suite ÇALIŞTIRILMADI)

```
Kod/test değişikliği:             YOK (yalnızca .ai/ manifest dosyaları)
Değişen dosyalar:                 .ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md,
                                   .ai/PHASE-6-19-CODEX-FIX-DELTA-MANIFEST.md
Secret scan:                      0 gerçek secret (docs-only diff)
GitHub Actions CI:                 bu round'un Türkçe raporunda ayrıca
                                   belirtilecek, rapor anında IN_PROGRESS
                                   ise PASS olarak VARSAYILMAYACAK
```

---

## Final Status

- B1 RESOLVED
- B2 RESOLVED
- B3 RESOLVED
- B4 RESOLVED
- B5 RESOLVED (2. round'da fail-gate parçası da dahil TAM RESOLVED)
- B6 RESOLVED
- B7 RESOLVED
- B8 RESOLVED
- B9 RESOLVED
- N4 RESOLVED (3. round — 2. round'daki kodun KENDİSİNDE bulunan gerçek regresyon düzeltildi)
- N5 RESOLVED (2. round, gerçek kategori dağılımı)
- N6 RESOLVED (4. round — FIX-8 ve FIX-10 checkpoint satırları artık literal exact SHA gösteriyor, self-reference yalnızca GÜNCEL/final round alanında kullanılıyor)
- N7 RESOLVED (2. round, hedefli Türkçe WHY yorumları)

**Open blocker: 0. Open non-blocking note: 0.**

**CODEX FIX-DELTA RE-REVIEW READY: EVET** (Codex bir sonraki turda
isterse yalnızca `0a52cb6..HEAD` delta'sını inceleyebilir).
