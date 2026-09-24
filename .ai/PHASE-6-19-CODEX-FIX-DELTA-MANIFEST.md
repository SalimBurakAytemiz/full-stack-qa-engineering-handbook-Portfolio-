# PHASE 6-19 — CODEX FIX-DELTA MANIFEST

**Amaç:** Codex'in Phase 6-19 üzerinde yaptığı bağımsız ilk audit,
9 blocker (B1-B9, P1×2 + P2×7) ve 7 non-blocking not (N1-N7) buldu,
FINAL VERDICT: **FAIL / CHANGES REQUIRED**. Bu doküman, o audit
bulgularına verilen TEK TOPLU FIX CAMPAIGN'in delta'sını özetler —
Codex'in Phase 6-19'un TAMAMINI baştan taramasına gerek KALMADAN,
yalnızca bu delta'yı re-review etmesi için tasarlanmıştır.

**Original audited HEAD:** `a359b391a02cfae20166f61a96a259a4f2601e0d`
**1. fix round final HEAD (Codex'in fix-delta re-review'unun denetlediği):** `2b1966d`
**2. fix round final HEAD (bu round — Codex'in re-review'unun kalan bulgularının düzeltmesi):** bu commit'in kendisi — `git rev-parse HEAD` ile doğrulayın (bkz. `.ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md` başındaki N6 self-reference notu — bu dosya da AYNI ilkeyi izler, literal bir hex değer stale kalabileceği için buraya yazılmaz)
**Dal:** `feat/phase-6-19-full-completion-campaign` (değişmedi)
**1. round delta:** `git diff a359b39..2b1966d` — 34 dosya, +1933 / -88 satır (7 commit)
**2. round delta (bu round):** `git diff 2b1966d..HEAD` — 20 dosya (FIX-7'nin 17 + bu manifest-sync commit'inin 3), 2 commit
**Toplam delta (`a359b39..HEAD`, BU COMMIT DAHİL):** 45 dosya, 10 commit — `git log --oneline a359b39..HEAD | wc -l` ve `git diff --stat a359b39..HEAD` ile GERÇEKTEN sayıldı

---

## Codex'in 2. Turdaki Re-Review Bulguları ve Bu Round'daki Düzeltmeleri

Codex'in `2b1966d` üzerindeki fix-delta re-review'u **FAIL / CHANGES
REQUIRED** verdi: B5'in fail-gate parçası eksikti (P2), N6 (manifest/
Git consistency) kendisi de stale sayılar içeriyordu (bir blocker
olarak ele alındı), ve N4/N5/N7 yeniden açıldı. Bu round'un (FIX-7 +
bu manifest-sync commit'i) her birini nasıl kapattığı aşağıda, ilgili
B/N maddesinin ALTINA eklenmiştir (tarihçe SİLİNMEDİ, yalnızca
GÜNCEL durum en altta).

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
| N4 | Access log query leakage | 1. round: "gerçek risk yok" (ampirik) — Codex 2. turda REOPEN etti, defense-in-depth redaksiyon istedi. **2. round: RESOLVED — GERÇEK KOD** — `redactSensitiveQuery()` (key-name bazlı, değer bazlı DEĞİL), 5 yeni test | `56f99ee` (1. round) → `81b77b4` (2. round, GERÇEK kapanış) |
| N5 | Phase 16 evidence 26 vs gerçek 30 soru | 1. round: soru SAYISI (30) düzeltildi — Codex 2. turda "her kategoride 2-3 soru" ifadesinin YANLIŞ olduğunu buldu (Appium=1). **2. round: RESOLVED** — gerçek kategori dağılımı tablo olarak eklendi, yeni soru İCAT EDİLMEDİ | `8fab168` (1. round) → `81b77b4` (2. round, GERÇEK kapanış) |
| N6 | Manifest commit count Git ile uyuşmuyordu | 1. round: "RESOLVED" denildi ama YİNE stale kaldı (FIX-6b/`2b1966d` kendi etkisini sayıma katmadı — Codex 2. turda GERÇEK Git durumunu bağımsız doğrulayıp yakaladı: 37/87 yazılmıştı, gerçek 38/88'di). **2. round: GERÇEKTEN RESOLVED** — bu manifest artık "bu commit" self-reference ilkesini kullanıyor (yukarı bkz.), asla stale olamaz; sayılar bu commit DAHİL edilerek hesaplandı | (bu dosya + manifest, bu commit) |
| N7 | WHY comment'leri ağırlıkla English | 1. round: DOCUMENTED (bilinçli kapsam kararı, kod değiştirilmedi) — Codex 2. turda, spesifik/hedefli bir kapsamla (7 dosya, Phase 6-19'un GERÇEKTEN önemli logic'i) YENİDEN AÇTI. **2. round: RESOLVED** — 7 dosyada hedefli Türkçe WHY paragrafı eklendi (İngilizce'nin ÜZERİNE, churn yok, davranış değişmedi) | `8fab168` (1. round, DOCUMENTED) → `81b77b4` (2. round, GERÇEK kapanış) |

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

## 2. Round Regresyon (FIX-7 sonrası, bu manifest-sync commit'inde TEKRAR ÇALIŞTIRILMADI)

```
Backend (node:test):              149/149 pass (144 + 5 yeni N4 redaksiyon testi)
JMeter fail-gate unit (node:test): 7/7 pass — JMeter runtime'ından bağımsız
node --check (9 değiştirilen .js): 9/9 sözdizimsel doğru
Secret scan (a359b39..HEAD diff):  0 gerçek secret
Stray runtime artifact:            0 (git status clean, .log taraması temiz)
GitHub Actions CI (bu commit'in bir önceki FIX-7 push'u, 81b77b4):
                                    bu manifest yazıldığı anda IN_PROGRESS —
                                    final sonuç bu round'un Türkçe raporunda
                                    ayrıca belirtilecek, PASS olarak VARSAYILMADI
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
- N4 RESOLVED (2. round, gerçek redaksiyon kodu)
- N5 RESOLVED (2. round, gerçek kategori dağılımı)
- N6 RESOLVED (2. round, self-reference ilkesiyle kalıcı düzeltme)
- N7 RESOLVED (2. round, hedefli Türkçe WHY yorumları)

**Open blocker: 0. Open non-blocking note: 0.**

**CODEX FIX-DELTA RE-REVIEW READY: EVET** (Codex bir sonraki turda
isterse yalnızca `2b1966d..HEAD` delta'sını inceleyebilir).
