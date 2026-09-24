# Phase 6–19 Full Completion Campaign — State

> Bu dosya campaign'in canonical checkpoint kaydıdır. Implementation
> evidence'ının YERİNE geçmez — her phase kendi evidence dosyasını
> `QA-DEMO-SYSTEM/evidence/` altında üretir. Bu dosya yalnızca "nerede
> kaldık, sırada ne var" sorusuna hızlı cevap verir.

- **Campaign branch:** `feat/phase-6-19-full-completion-campaign`
- **Base commit (main, Phase 5 CLEAN):** `837ff2ff1c0c1ada0435d793cfb09479fa954e2f`
- **Codex review policy:** Codex, Phase 6–19 implementation sırasında KULLANILMIYOR.
  Yalnızca campaign tamamen bittikten sonra, bağımsız audit için devreye girecek.
  Bu nedenle her phase'in kendi statüsü **"CLAUDE IMPLEMENTATION COMPLETE —
  PENDING FINAL CODEX AUDIT"** olarak işaretlenir; asla "Codex reviewed"
  veya "independently verified" denmez (bkz. Phase 18 notu aşağıda).
- **Merge policy:** Campaign boyunca PR açılmaz, main'e merge edilmez.
  Her phase yalnızca bu campaign branch'ine commit/push edilir.

## Phase 18 — Independent Review netliği

ROADMAP.md'nin kendi Phase 18'i ("Repository bağımsız reviewer tarafından
incelenecektir") normalde Codex'in rolüdür. Bu campaign'de Codex Phase
6–19 boyunca kullanılmadığından, campaign içindeki "Phase 18" adımı
**Claude'un kendi yapılandırılmış self-audit'i** olacaktır — gerçek,
bağımsız üçüncü-taraf inceleme YERİNE GEÇMEZ ve evidence'ta asla öyle
sunulmaz. Repository'nin gerçek "Independent Review" durumu, bu
campaign'in sonunda yapılacak asıl Codex audit'i ile sağlanacaktır.

---

## Tooling / Environment Notları (bu oturumda doğrulandı)

| Araç | Durum | Not |
|---|---|---|
| Node.js | v22.22.2 | Mevcut, Phase 5'te kullanıldı |
| `graphql` (npm) | 17.0.2, kurulabilir | Phase 6 GraphQL katmanı için |
| Playwright + Chromium | `/opt/pw-browsers/chromium` kurulu | Phase 8 (Web) / Phase 9 (Visual/A11y) için — `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` |
| `selenium-webdriver` (npm) | 4.49.0, kurulabilir | Phase 10 Selenium lab için |
| Java | OpenJDK 21.0.10, kurulu | JMeter için gerekli |
| JMeter | `apt-get install jmeter` ile kuruldu — **v2.13 (2015), eski** | Phase 10 JMeter lab için; modern 5.x DEĞİL — bu dürüstçe dokümante edilecek. **Sistem-seviyesi kurulum, repo'ya commit edilmez** — RUN-INSTRUCTIONS'a prerequisite olarak yazılacak |
| Appium | Kurulmadı — gerçek Android/iOS emulator/simulator bu container'da YOK | Phase 8 Mobile ve Phase 10 Appium için gerçek altyapı eksikliği — **infrastructure gap**, LEARNING/documentation olarak ele alınacak, fake "ran against real device" evidence üretilmeyecek |
| Jenkins | Kurulu değil, gerçek server yok | Phase 12 — GitHub Actions ile paralel/eşdeğer bir CI pipeline + gerçek bir Jenkinsfile (syntax-valid, ama çalıştırılmadığı dürüstçe belirtilerek) üretilecek |
| Elastic / OpenTelemetry / Jaeger | Kurulu değil | Phase 13 — gerçek stack kurulumu yerine LEARNING dokümantasyonu + backend'e gerçek correlation-ID/structured-logging eklenmesi (bu kısmı gerçek kod) |
| Burp Suite / OWASP ZAP | Kurulu değil (GUI/lisanslı araçlar) | Phase 11 — LEARNING dokümantasyonu; güvenlik testleri kendisi QA-DEMO-SYSTEM'e karşı gerçek Newman/Node testleriyle yapılacak |
| k6 / Gatling / Locust | Gerçek k6 binary'si npm'de değil (ayrı Go binary) | Phase 14 — kurulum denenecek, olmazsa LEARNING dokümantasyonu |

**Genel prensip:** Gerçekten çalıştırılabilen her şey GERÇEK kod+test+evidence
ile yapılır. Bu sandboxed ortamda gerçekten mevcut olmayan altyapı
(mobil cihaz/emulator, Jenkins server, Elastic stack, lisanslı GUI
araçları, harici bulut hesapları) için sahte "PASS" evidence ÜRETİLMEZ —
bunun yerine dürüst LEARNING/dokümantasyon içeriği + (mümkünse) o konunun
gerçek, çalıştırılabilir bir alt-kümesi sağlanır. Bu, projenin baştan beri
uyguladığı Evidence Integrity kuralının doğal devamıdır.

---

## Phase Durumu

| Phase | Adı | Durum | Base SHA | Head SHA |
|---|---|---|---|---|
| 6 | GraphQL / WebSocket / Event Testing | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | 837ff2f | 9e83721 |
| 7 | Database Testing | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | 9e83721 | 8a31c62 |
| 8 | Web & Mobile QA | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | 8a31c62 | 026623c |
| 9 | Visual & Accessibility | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | 026623c | 5b94cea |
| 10 | Automation Learning Labs (Selenium/Appium/JMeter) | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | 5b94cea | 9d4d6a6 |
| 11 | Security-Aware QA | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | 9d4d6a6 | ace6371 |
| 12 | CI/CD & Environment | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | ace6371 | 7796f0f |
| 13 | Logging / Observability / Production QA | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | 7796f0f | d6848a1 |
| 14 | Modern QA Learning Labs | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | d6848a1 | 90a4b04 |
| 15 | Case Studies (7) | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | 90a4b04 | 27ea9d8 |
| 16 | Interview Preparation | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | 27ea9d8 | f8b4188 |
| 17 | Final Integration | CLAUDE IMPLEMENTATION COMPLETE — PENDING FINAL CODEX AUDIT | f8b4188 | fda6e61 |
| 18 | Independent Review (Claude self-audit) | CLAUDE SELF-AUDIT COMPLETE — PENDING FINAL CODEX AUDIT | fda6e61 | *(bu checkpoint commit'i — bkz. `git log -1`)* |
| 19 | Clean | IN PROGRESS | *(Phase 18 head)* | — |

---

## Phase 6 — Kapanış Özeti (tamamlandı)

- 24 yeni test (19 GraphQL + 5 WS-advanced), tam backend regresyonu 96/96.
- Phase 5 bağımlılığı (`requireAuth.js` → `resolveSession` refactor)
  gerçek Postman koleksiyonuna karşı ayrıca doğrulandı (19/19 request,
  42/42 assertion).
- Firebase Events → dürüstçe LEARNING-only (gerçek bulut hesabı yok).
- Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-6-GRAPHQL-WEBSOCKET-EVENT/EXECUTION.md`

## Phase 7 — Kapanış Özeti (tamamlandı)

- 15 yeni test (`tests/database-testing.test.js`) — SELECT/WHERE/JOIN/
  Sorting, CRUD lifecycle, NULL/UNIQUE(email) validation, financial
  SUM-aggregate cross-check, timestamp format+monotonicity, UI→DB
  end-to-end, seed-vs-source-JSON determinism proof.
- Mevcut Phase 4/5 testleri (`seed.test.js`/`events.test.js`/
  `notifications.test.js`) zaten CHECK/FK/UNIQUE(order_id,*) kapsıyordu
  — tekrar edilmedi, evidence'ta referans verildi.
- Tam backend regresyonu: 111/111. Yeni dependency yok.
- Audit/History → dürüstçe NOT IMPLEMENTED (kaynak kodda audit tablosu yok).
- Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-7-DATABASE-TESTING/EXECUTION.md`
- Detaylar için evidence dosyalarına bakınız — bu state dosyası onların
  yerine geçmez.

## Phase 8 — Kapanış Özeti (tamamlandı)

- Yeni `web-tests` npm workspace, `@playwright/test` (devDependency),
  önceden kurulu Chromium (`/opt/pw-browsers/chromium-1194`) kullanıldı,
  indirme yapılmadı.
- 14 yeni Playwright testi (Functional, Responsive, Network Inspection,
  Storage, Cookies-negatif, DevTools console, Frontend/Backend
  Validation, gerçek WS→DOM realtime bildirim). İki ardışık çalıştırma
  ikisinde de 14/14 (flaky değil).
- Tam backend regresyonu: 111/111 (yeni workspace backend'i etkilemedi).
- Cross-Browser → yalnızca Chromium (dürüstçe belirtildi, Firefox/WebKit yok).
- Mobile (16 madde) → dürüstçe LEARNING-only (`MOBILE-LEARNING.md`).
- Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-8-WEB-MOBILE-QA/EXECUTION.md` + `MOBILE-LEARNING.md`

## Phase 9 — Kapanış Özeti (tamamlandı)

- `@axe-core/playwright` (devDependency, MPL-2.0) eklendi. 6 yeni
  accessibility testi: WCAG (wcag2a+wcag2aa, login+products), Contrast
  (color-contrast kuralı), Accessibility Labels
  (`toHaveAccessibleName()`), Keyboard Navigation + Focus (Tab sırası +
  klavye-yalnızca form submit) — **axe-core GERÇEKTEN 0 violation
  buldu, bastırılmadı**.
- 3 yeni visual-regression testi (login/products baseline + negatif
  kontrol) — negatif kontrol testinde ilk denemede yanlış
  `maxDiffPixelRatio` nedeniyle false-negative riski BULUNDU ve
  düzeltildi (bkz. evidence Bölüm 5) — "Difference Visualization
  gerçekten fark yakalıyor mu?" sorusu ciddiye alındı.
- Tam web-tests suite 3 ardışık çalıştırmada 23/23 (flaky değil). Tam
  backend regresyonu 111/111.
- Figma Comparison + gerçek ekran-okuyucu yazılımı → dürüstçe
  LEARNING-only.
- Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-9-VISUAL-ACCESSIBILITY/EXECUTION.md`

## Phase 10 — Kapanış Özeti (tamamlandı)

- **Selenium:** Gerçek POM kodu yazıldı (`automation-labs/selenium/`),
  gerçek backend'e (port 4400) karşı çalıştırıldı. Kök neden kesin
  izole edildi: chromedriver 147.x + Chromium 141.x uyumsuz, eşleşen
  driver'ı hem Selenium Manager hem `npm install chromedriver@141`
  indiremedi (`googlechromelabs.github.io` allowlist dışı, 403). CODE
  COMPLETE — EXECUTION BLOCKED (doğrulanmış).
- **JMeter:** Gerçek `.jmx` planı yazıldı, gerçek backend'e (port 4500)
  karşı çalıştırıldı. Hata (`ForbiddenClassException: ScriptWrapper`)
  JMeter'ın KENDİ stok şablonuyla çapraz doğrulanarak dosya değil
  kurulum sorunu olduğu KANITLANDI — apt `jmeter 2.13` (2015) + sistem
  `libxstream-java 1.4.20` (tek mevcut sürüm) uyumsuzluğu. CODE
  COMPLETE — EXECUTION BLOCKED (doğrulanmış).
- **Appium:** LEARNING-only (Phase 8 Mobile ile aynı gerekçe).
- Tam backend regresyonu: 111/111. Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/`

## Phase 11 — Kapanış Özeti (tamamlandı)

- Yeni `backend/tests/security.test.js` (12 test): IDOR/BOLA (3),
  XSS-oriented (2 — biri GERÇEK bir bulgu içeriyor, aşağıda), SQLi-
  oriented (3), Mass Assignment (2), Sensitive Data (2).
- **Gerçek bulgu:** `payment_token` bilinmeyen değer hatası, ham
  istemci girdisini JSON mesajına yansıtıyor (`payment.service.js`).
  Üç bağımsız kontrol noktasıyla (content-type JSON, frontend
  `textContent` kullanımı, bu hatanın hiçbir UI'da gösterilmemesi)
  uçtan uca istismar edilemez olduğu KANITLANDI — non-blocking
  hardening notu olarak kaydedildi, küçümsenmedi.
- RBAC/OTP/Rate Limiting/File Upload → `grep` ile doğrulanıp NOT
  IMPLEMENTED (icat edilmedi).
- OWASP API Security Top 10 → gerçek eşleştirme
  (`OWASP-API-TOP-10-MAPPING.md`). Burp Suite/OWASP ZAP → LEARNING-only.
- Tam backend regresyonu: 123/123 (111 mevcut + 12 yeni).
- Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/`

## Phase 12 — Kapanış Özeti (tamamlandı)

- **GERÇEK, bu oturumdan BAĞIMSIZ doğrulanmış CI/CD kanıtı:**
  `.github/workflows/ci.yml` push edildi (commit `6ac36bc`), GitHub
  Actions Run #1 (`id: 35950797840`) GitHub'ın kendi API'siyle
  sorgulandı — **3/3 job SUCCESS** (backend node:test, web-tests
  Playwright gerçek `playwright install` ile, api-tests Newman/AJV).
  Bu, Phase 10'un Selenium/JMeter altyapı-kısıtlarıyla doğrudan
  tezat oluşturuyor: GH Actions runner'ları bu sandbox'ın ağ
  kısıtlarına TABİ DEĞİL, dolayısıyla GERÇEK bir PASS elde edildi.
- `web-tests/playwright.config.js` taşınabilir hale getirildi
  (sabit sandbox yolu yerine opsiyonel `PLAYWRIGHT_CHROMIUM_PATH`
  env var) — yerel 23/23 PASS ile yeniden doğrulandı.
- `Jenkinsfile` (syntax-valid, `ci.yml` ile aynı 3 aşama) yazıldı,
  dürüstçe NOT EXECUTED (gerçek Jenkins server yok).
- DEV/QA/UAT/Stage/Production, Environment Validation, Server/
  Application Recycle — `ENVIRONMENT-CONCEPTS.md`.
- Tam backend regresyonu: 123/123. Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-12-CICD-ENVIRONMENT/`

## Phase 13 — Kapanış Özeti (tamamlandı)

- Yeni `backend/src/middleware/requestContext.js` — her isteğe
  `crypto.randomUUID()` korelasyon ID'si, `X-Request-Id` response
  header'ı, yapısal tek-satırlık access-log.
- **Gerçek bulgu + düzeltme:** İlk yazımda `req.path` `finish` event'i
  içinde LAZY okunduğu için Express'in router-mount path-stripping
  davranışı nedeniyle YANLIŞ logluyordu (`/api/products` için `/`) —
  kök neden izole edildi, `req.originalUrl`'i senkron yakalayarak
  düzeltildi, regresyon testiyle kilitlendi.
- 5 yeni test (`observability.test.js`). Tam backend regresyonu:
  128/128 (123 mevcut + 5 yeni). Global middleware olduğu için Phase
  5'in protected Postman koleksiyonuna karşı da ayrıca doğrulandı
  (19/19, 42/42).
- Smoke/Production/Release/Stability/Hotfix Testing → Phase 12'nin
  GERÇEK CI pipeline'ı ve bu campaign'in kendi pratiği referans
  verilerek karşılandı (tekrar test yazılmadı).
- Elastic/OpenTelemetry/Jaeger → dürüstçe LEARNING-only.
- Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-13-LOGGING-OBSERVABILITY/`

## Phase 14 — Kapanış Özeti (tamamlandı)

- **Code Coverage (GERÇEK):** `node --test --experimental-test-coverage`
  — 128/128 test, `all files: line 99.11% / branch 96.63% / funcs
  97.77%`. Yeni dependency yok, `backend/package.json`'a `test:coverage`
  script'i eklendi. Çıktı `code-coverage-output.txt`'e kaydedildi.
- **k6/Gatling/Locust (GERÇEK — Locust ile):** `pip3 install locust`
  başarılı (saf Python, JMeter'ın JVM/XStream sorunundan bağımsız).
  Gerçek `locustfile.py` gerçek backend'e karşı çalıştırıldı: 526
  istek, **0 hata**, p95=5ms p99=15ms.
- **Docker for QA (CODE COMPLETE — EXECUTION BLOCKED, doğrulanmış):**
  `docker` CLI var, daemon YOK (`docker info` ile doğrulandı). Gerçek
  `Dockerfile` + `docker-compose.yml` + `.dockerignore` yazıldı;
  `docker compose config` (daemon gerektirmez) ile syntax GERÇEKTEN
  doğrulandı. İki gerçek tasarım hatası (npm workspace lockfile
  uyuşmazlığı, `shared/`'ın yanlış konumlandırılması) yapım
  denemesinden ÖNCE bulunup düzeltildi.
- Kalan 9 madde (Pact/Kafka/RabbitMQ/SonarQube/Allure/Feature Flags/
  Canary/Blue-Green/Cloud QA) → dürüstçe LEARNING-only.
- Tam backend regresyonu: 128/128 (bu faz backend kaynak koduna
  dokunmadı). Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-14-MODERN-QA-LEARNING-LABS/`

## Phase 15 — Kapanış Özeti (tamamlandı)

- 7 case-study dosyası yazıldı — 4/7 GERÇEK sentez (Authentication,
  E-Commerce Order Flow, Payment Flow, Real-Time WebSocket/Event Flow
  — hepsi Phase 5/6/7/8/11/14'ün ZATEN çalıştırılmış gerçek kanıtına
  dayanıyor), 2/7 dürüstçe LEARNING (Multi-Country/Localization —
  `grep` ile NOT IMPLEMENTED doğrulandı; Mobile Migration — Phase 8/10
  altyapı eksikliği), 1/7 kısmen ikisi de (Production Incident —
  Phase 13'ün correlation-ID altyapısı gerçek, senaryo kurgusal).
- Bu faz yeni kod/test YAZMADI (bilinçli, test-ekonomisi) — 128
  testlik tam backend regresyonu, case study'lerde referans verilen
  TÜM test dosyalarının hâlâ PASS olduğunu doğruladı.
- Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-15-CASE-STUDIES/`

## Phase 16 — Kapanış Özeti (tamamlandı)

- `INTERVIEW-PREP.md` — 14 kategori, 26 soru, 5-bölümlü format (Short/
  Detailed/Example/Real QA Risk/Related Lab).
- TÜM "Related Lab" referansları (24 benzersiz dosya yolu) bu oturumda
  GERÇEKTEN dosya-varlığı kontrolüyle doğrulandı — sıfır kırık
  referans.
- Sorular gerçek campaign bulgularına atıf yapıyor (chromedriver/
  Chromium uyuşmazlığı, payment_token reflection, req.path bug'ı,
  GraphQL nullable field davranışı, retries:0 kararı, gerçek CI
  çalıştırması, gerçek p95/p99 sayıları) — icat edilmedi.
- Tam backend regresyonu: 128/128 (bu faz kod değiştirmedi). Açık
  blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-16-INTERVIEW-PREPARATION/`

## Phase 17 — Kapanış Özeti (tamamlandı)

- 13 kontrol (broken links, terminology, knowledge status, tests,
  automation, reports, evidence, CI, security, secrets, repository
  navigation, case study traceability, documentation consistency)
  çalıştırıldı.
- **1 gerçek tutarsızlık bulundu ve düzeltildi:** Case Study 05'teki
  `web-tests/realtime-notification.spec.js` referansı `tests/`
  alt-dizinini atlıyordu — düzeltildi.
- **GERÇEK CI geçmişi doğrulandı:** GitHub Actions API ile 6/6
  çalıştırma SUCCESS (Phase 12'den bu yana HER push'ta) — bu, Phase
  13-16'da eklenen tüm yeni testlerin CI'da da gerçekten PASS ettiğinin
  bağımsız kanıtı.
- Tam backend regresyonu: 128/128. Tam web-tests regresyonu: 23/23.
- Kapsamlı secret taraması (69 dosya, 7102 satır — tüm Phase 6-19
  diff'i): sıfır gerçek secret.
- ROADMAP.md'nin "Current Status" bölümü BİLİNÇLİ olarak dokunulmadı
  (Phase 6-19 henüz Codex tarafından incelenmedi, Phase 5'te durduğu
  gibi kalması DOĞRU).
- Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-17-FINAL-INTEGRATION/`

## Phase 18 — Kapanış Özeti (tamamlandı)

- Risk-odaklı, eleştirel bir kendi-kendini-inceleme yapıldı (mekanik
  kontroller değil, "bu gerçekten doğru mu" sorusu).
- **1 GERÇEK bulgu bulundu ve düzeltildi:** GraphQL katmanının,
  REST'in `errorHandler.js` disiplininin aksine, beklenmeyen dahili
  hataları maskelemediği (ham mesaj sızıntısı riski) — ampirik olarak
  doğrulandı (`node -e` ile gerçek bir crash senaryosu), düzeltildi
  (`maskUnexpectedErrors()`, yalnızca execution-fazı + bilinmeyen-kod
  hatalarını maskeler, validation hatalarını ASLA maskelemez — bu
  ayrım da ampirik doğrulandı), 7 yeni testle kilitlendi
  (`tests/graphql-error-masking.test.js`).
- **1 kapsam-dışı gözlem** (session expiry mesajı yanıltıcı, Phase
  4'ten kalma, bu campaign'in kapsamı dışında) sessizce atlanmadan
  kaydedildi, düzeltilmedi.
- Tam backend regresyonu: 135/135 (128 önceki + 7 yeni). Tam
  web-tests regresyonu: 23/23.
- Açık blocker: 0.
- Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-18-INDEPENDENT-REVIEW/`
  (`CLAUDE-SELF-AUDIT.md` + `EXECUTION.md`) — AÇIKÇA "bağımsız
  inceleme DEĞİLDİR" olarak etiketlendi.

## NEXT EXACT ACTION

Phase 19 (Clean) — campaign'in SON fazı. ROADMAP'ın Phase 19 kriteri:
Testler başarılı, kritik bulgu yok, evidence doğrulanmış, Learning/
Experience statüleri doğru, documentation tamam, Case Studies çalışır,
review sonucu CLEAN.

**Kritik hatırlatma (campaign'in kendi kuralı):** Phase 19'un sonu
"CLAUDE BUILD CAMPAIGN: COMPLETE / CODEX AUDIT: PENDING" ile
bitmelidir — ASLA "Codex certified" değil. Main'e merge YOK, PR YOK,
branch silme YOK, history squash YOK.

1. TEK bir FULL CAMPAIGN REGRESSION: Phase 0-5 uyumluluğu (backend
   testleri zaten Phase 0-5'in üzerine inşa edildi, aynı suite içinde)
   + Phase 6-18'in tamamı (backend `node --test`, `web-tests`
   Playwright, varsa `api-tests` Newman) tek seferde çalıştırılıp
   nihai sayılar kaydedilecek.
2. Açık blocker sayısının GERÇEKTEN 0 olduğu son kez teyit edilecek.
3. Konsolide Codex Audit Manifest'i yazılacak (önerilen yol:
   `.ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md`) — Phase 6-18 tablosu
   (Phase, Ad, Base SHA, Head SHA, Değişen dosyalar, Testler,
   Regresyon, Evidence, Bilinen sınırlamalar, Açık blocker, Claude
   self-review) + cross-cutting audit kategorileri.
4. Mandated 31-madde Türkçe final campaign raporu hazırlanacak (branch;
   her fazın (6-19) statüsü+base/head — 14 ayrı satır; toplam değişen
   dosya; toplam test sonucu; final regresyon sonucu; güvenlik
   taraması; secret taraması; dependency/lisans sonucu; generated
   artifact sonucu; açık blocker sayısı; bilinen sınırlamalar; gelecek
   sertleştirme; ROADMAP Phase 6-19 implementasyon statüsü; Codex audit
   manifest yolu; Codex için kesin phase commit aralıkları; working
   tree temiz mi; remote campaign branch güncel mi; CODEX FULL AUDIT
   READY?).
5. Evidence: `QA-DEMO-SYSTEM/evidence/PHASE-19-CLEAN/EXECUTION.md`
6. Son commit + push — SONRA DUR (PR yok, merge yok).
