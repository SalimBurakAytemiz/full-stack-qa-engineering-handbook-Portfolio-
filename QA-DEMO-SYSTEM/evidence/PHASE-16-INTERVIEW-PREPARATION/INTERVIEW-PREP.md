# QA Technical Interview Preparation

Bu doküman, ROADMAP.md Phase 16'nın istediği gibi, bu repository'yi
aynı zamanda bir teknik mülakat hazırlık kaynağı haline getirir. Her
soru 5 bölümden oluşur: **Short Answer**, **Detailed Answer**,
**Example**, **Real QA Risk**, **Related Lab**. "Related Lab" alanları
JENERİK DEĞİLDİR — bu campaign'in GERÇEKTEN yaptığı, bu repo'da
gerçekten mevcut ve çalıştırılabilir işe işaret eder (dosya yolları
doğrulanmıştır).

> Kapsam notu: her kategori için tükenmez bir soru bankası değil,
> kategoriyi gerçekten temsil eden ve bu repo'nun gerçek çalışmasına
> bağlı 1-3 soru sunulmuştur (gerçek dağılım kategoriye göre değişir —
> örn. Appium'da 1, API/Security/Scenario Questions'ta 3; tam dağılım
> için `evidence/PHASE-16-INTERVIEW-PREPARATION/EXECUTION.md`'ye
> bakınız — Codex final fix round N5).

---

## 1. Manual QA

### S1.1 — Bir "generic error message" (bilgi sızıntısını önleyen hata mesajı) neden önemlidir?

- **Short Answer:** Bir sistemin "email var ama şifre yanlış" ile
  "email hiç yok" arasında farklı hata mesajı vermesi, saldırganın
  kayıtlı email'leri enumerate etmesine izin verir.
- **Detailed Answer:** Authentication hatalarında hem "wrong
  password" hem "unknown email" durumları AYNI generic mesajı
  dönmelidir. Bu, OWASP'ın "User Enumeration" riskine karşı standart
  bir savunmadır.
- **Example:** Bu sistemde her iki durum da `Email veya şifre hatalı`
  döner (`auth.service.js`).
- **Real QA Risk:** Bir QA, yalnızca "doğru senaryoyu" test edip bu
  ayrımı manuel olarak KONTROL ETMEZSE, bu sınıf bir bug production'a
  kadar gidebilir.
- **Related Lab:** `QA-DEMO-SYSTEM/backend/tests/auth.test.js`,
  `QA-DEMO-SYSTEM/backend/tests/security.test.js`.

### S1.2 — Exploratory testing ile scripted testing arasındaki fark nedir, ne zaman hangisi kullanılır?

- **Short Answer:** Scripted testing önceden yazılmış adımları takip
  eder (tekrarlanabilir, regresyon için ideal); exploratory testing
  test sırasında öğrenilenlere göre yönü değiştirir (yeni özellik/
  bug avı için ideal).
- **Detailed Answer:** İkisi rakip değil, tamamlayıcıdır. Bu campaign,
  scripted otomasyonu (node:test, Playwright, Postman) ağırlıklı
  kullandı çünkü hedef sürekli regresyona dayanıklı bir demo sistemdi;
  ama her yeni özellik (örn. Phase 6 GraphQL) önce manuel/exploratory
  bir "smoke check" (curl ile gerçek istek) ile doğrulandı, SONRA
  otomatik teste dönüştürüldü.
- **Example:** Phase 6'da GraphQL endpoint'i yazıldıktan hemen sonra
  4 gerçek manuel `curl` isteğiyle smoke test edildi, testler
  YAZILMADAN önce.
- **Real QA Risk:** Yalnızca scripted testing'e güvenmek, testin
  KENDİSİNİN öngörmediği hata sınıflarını (örn. Phase 9'un
  false-negative visual-regression toleransı) kaçırabilir.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-6-GRAPHQL-WEBSOCKET-EVENT/EXECUTION.md`.

---

## 2. Test Design

### S2.1 — Boundary Value Analysis'i gerçek bir örnekle açıklayın.

- **Short Answer:** Bir değer aralığının SINIRLARINDA (min, min-1,
  max, max+1) test yapmak, "off-by-one" hatalarını yakalar.
- **Detailed Answer:** `quantity > 0` gibi bir kural için gerçek
  sınır değerleri: `0` (reddedilmeli), `1` (kabul edilmeli), negatif
  değerler (reddedilmeli).
- **Example:** `CHECK constraint rejects a non-positive order_items
  quantity` testi tam olarak `0` sınırını hedefler.
- **Real QA Risk:** Yalnızca "normal" değerlerle test etmek (örn.
  quantity=5), sınır ihlallerini asla yakalamaz.
- **Related Lab:** `QA-DEMO-SYSTEM/backend/tests/seed.test.js`.

### S2.2 — Negatif test senaryosu tasarlarken nelere dikkat edersiniz?

- **Short Answer:** Sistemin "olmaması gereken" girdilere karşı NASIL
  başarısız olduğunu (doğru status code, doğru hata mesajı, veri
  bütünlüğünün korunması) doğrulamak.
- **Detailed Answer:** Bir negatif test yalnızca "hata verdi mi"
  değil, "DOĞRU şekilde hata verdi mi, yan etki bırakmadan mı" sorusunu
  sormalıdır.
- **Example:** Phase 5 P5.7, geçersiz bir sipariş denemesinin
  STOK/DB'de HİÇBİR yan etki bırakmadığını (zero-write snapshot)
  kanıtladı — yalnızca "400 döndü" demek yeterli değildi.
- **Real QA Risk:** Bir negatif test yalnızca status code'u kontrol
  edip DB'yi kontrol ETMEZSE, "hata döndü ama yine de yarım yazdı"
  sınıfı bir bug kaçabilir.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/P5-API-TESTING/P5.7-API-DB-VALIDATION/EXECUTION.md`.

---

## 3. API

### S3.1 — REST'te 401 ile 403 arasındaki fark nedir, IDOR koruması bunu nasıl etkiler?

- **Short Answer:** 401 = kimliksiz (authentication yok/geçersiz),
  403 = kimlikli ama yetkisiz. IDOR koruması için başka bir kullanıcının
  kaynağına erişim genelde 404 (varlığı GİZLEYEREK) döndürülür, 403
  DEĞİL.
- **Detailed Answer:** 403 dönmek, "bu ID var ama sana ait değil"
  bilgisini sızdırır — bir saldırgan bu şekilde geçerli ID'leri
  enumerate edebilir. 404 dönmek bu bilgiyi gizler.
- **Example:** Bu sistemde `GET /api/orders/:id` başka bir kullanıcının
  siparişi için 404 döner (403 değil) — "IDOR-conscious" tasarım.
- **Real QA Risk:** Bir QA, yalnızca "erişim engellendi mi" diye
  bakıp status code'un 403 mü 404 mü olduğuna dikkat ETMEZSE, bu
  bilgi-sızıntısı sınıfı riski gözden kaçırabilir.
- **Related Lab:** `QA-DEMO-SYSTEM/backend/tests/security.test.js` (IDOR/BOLA bölümü).

### S3.2 — GraphQL'de bir "resolver hatası" ile "transport hatası" arasındaki fark nedir?

- **Short Answer:** Transport hatası (malformed request) gerçek bir
  HTTP 400'dür; resolver/iş-mantığı hatası HTTP 200 ile birlikte
  `errors[]` dizisinde döner.
- **Detailed Answer:** Bu, GraphQL-over-HTTP spesifikasyonunun
  standart davranışıdır — REST'in status-code-tabanlı hata modeliyle
  KARIŞTIRILMAMALIDIR.
- **Example:** `query` alanı hiç yoksa gerçek 400; ama `createOrder`
  mutation'ı stok yetersizliğinde HTTP 200 + `errors[0].message`
  döner.
- **Real QA Risk:** "status code == 200" assertion'ı ile "errors[]
  boş mu" assertion'ı KARIŞTIRILIRSA, testler yanlışlıkla PASS
  gösterebilir.
- **Related Lab:** `QA-DEMO-SYSTEM/backend/tests/graphql.test.js`.

### S3.3 — Mass Assignment nedir, API testinde nasıl doğrulanır?

- **Short Answer:** İstemcinin, sunucunun beklemediği/izin vermediği
  alanları (örn. `user_id`, `status`) request body'sine ekleyip
  sunucu-taraflı state'i manipüle etmeye çalışmasıdır.
- **Detailed Answer:** Korumanın en güvenilir şekli, sunucu kodunun
  o alanı HİÇ OKUMAMASIDIR (allowlist-tabanlı destructuring) —
  "sunucu bu alanı reddediyor" değil, "sunucu bu alanı zaten hiç
  görmüyor".
- **Example:** `POST /api/orders` body'sine `user_id: 2` eklenip
  gönderildi, sipariş yine de gerçek authenticated kullanıcıya (1)
  ait çıktı.
- **Real QA Risk:** Yalnızca "response'ta doğru user_id görünüyor mu"
  kontrolü YETERSİZDİR — DB'nin KENDİSİ sorgulanıp gerçek kalıcı
  değer doğrulanmalıdır.
- **Related Lab:** `QA-DEMO-SYSTEM/backend/tests/security.test.js` (Mass Assignment bölümü).

---

## 4. SQL

### S4.1 — Parametreli sorgular (prepared statements) SQL injection'ı nasıl önler?

- **Short Answer:** Kullanıcı girdisi, SQL komutunun bir PARÇASI
  olarak değil, ayrı bir VERİ olarak driver'a gönderilir — bu nedenle
  girdi hiçbir zaman SQL sözdizimi olarak yorumlanamaz.
- **Detailed Answer:** `db.prepare('... WHERE email = ?').get(email)`
  deseninde, `email` değişkeni ne olursa olsun (`' OR '1'='1`
  dahil) asla sorgunun YAPISINI değiştiremez.
- **Example:** `' OR '1'='1'` payload'ı hem email hem password alanına
  gönderildi, sistem bunu düz bir string olarak eşleştirmeye çalıştı
  ve 401 döndü — auth bypass OLMADI.
- **Real QA Risk:** String concatenation ile kurulmuş bir sorgu
  (`"WHERE email = '" + email + "'"`) bu korumayı SAĞLAMAZ — bir QA,
  kaynak kodun GERÇEKTEN parametreli sorgu kullandığını kod
  incelemesiyle DOĞRULAMALIDIR, yalnızca test sonucuna güvenmek
  yeterli değildir (ama test de gerekli bir ikinci kanıt katmanıdır).
- **Related Lab:** `QA-DEMO-SYSTEM/backend/tests/security.test.js` (SQLi-oriented bölümü).

### S4.2 — Bir JOIN sorgusuyla "test oracle" nasıl kurulur?

- **Short Answer:** Uygulamanın kendi hesapladığı bir değeri (örn.
  sipariş toplamı), DB'den BAĞIMSIZ bir SQL aggregate sorgusuyla
  yeniden hesaplayıp karşılaştırmak.
- **Detailed Answer:** Bu, uygulamanın "doğru cevabı biliyormuş gibi
  davranmasını" değil, DB'nin KENDİSİNİN gerçek verilerden bağımsız
  bir doğrulama üretmesini sağlar.
- **Example:** `SELECT o.id, o.total, SUM(oi.quantity*oi.unit_price)
  AS computed_total FROM orders o JOIN order_items oi ON ... GROUP BY
  o.id HAVING ABS(o.total - computed_total) > 0.001` — tek bir sorgu,
  TÜM siparişlerin finansal tutarlılığını kanıtlar.
- **Real QA Risk:** Yalnızca TEK bir örnek sipariş üzerinde elle
  hesaplama yapmak, çok-satırlı/karmaşık siparişlerdeki hataları
  kaçırabilir.
- **Related Lab:** `QA-DEMO-SYSTEM/backend/tests/database-testing.test.js` (Financial Data Validation).

---

## 5. Mobile

### S5.1 — Bir mobil uygulamada "Feature Parity" testi neden web'den farklıdır?

- **Short Answer:** Mobilde ek platform-spesifik durumlar vardır
  (Background/Foreground, Kill/Relaunch, Network Interruption,
  Permissions) — bunların web karşılığı yoktur veya farklı davranır.
- **Detailed Answer:** "Aynı özellik" web'de bir API çağrısıyken,
  mobilde native storage (Keychain/Keystore), push notification
  (FCM/APNs) gibi platform-spesifik mekanizmalara bağımlı olabilir.
- **Example:** Bu projede web `sessionStorage` kullanıyor; bir mobil
  eşdeğeri native secure storage kullanmalıdır — "parity" burada
  DAVRANIŞ eşitliği anlamına gelir, implementasyon eşitliği değil.
- **Real QA Risk:** Bir QA, yalnızca "aynı ekran var mı" diye bakıp
  platform-spesifik durum geçişlerini (arka plana alma, kill/relaunch)
  test ETMEZSE, gerçek kullanıcı senaryolarının çoğunu kaçırır.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-15-CASE-STUDIES/case-study-07-mobile-migration-feature-parity.md`, `QA-DEMO-SYSTEM/evidence/PHASE-8-WEB-MOBILE-QA/MOBILE-LEARNING.md`.

### S5.2 — Gerçek bir cihaz/emulator olmadan mobil test stratejisi nasıl kurulur (LEARNING)?

- **Short Answer:** API sözleşmesi (backend testleri) + kavramsal bir
  parity checklist ile "ortak zemin" test edilir; gerçek UI/native
  davranış test edilemez, bu dürüstçe belirtilir.
- **Detailed Answer:** Bir mobil istemci, web istemcisiyle AYNI
  backend API'sini tüketir — backend'in kendisi sağlam test
  edildiğinde, mobil istemcinin ÇOK tüketeceği yüzey zaten kısmen
  güvenceye alınmış olur (ama native UI/platform davranışı test
  EDİLMEMİŞ olur).
- **Example:** Bu campaign'de gerçek bir Android/iOS
  cihazı/emulator'ı YOKTU — bu dürüstçe belgelendi, sahte bir "test
  edildi" iddiası ÜRETİLMEDİ.
- **Real QA Risk:** "Backend testi yeterli, mobil ayrıca test etmeye
  gerek yok" varsayımı YANLIŞTIR — native-spesifik hatalar (storage,
  lifecycle, push) yalnızca gerçek cihaz/emulator testiyle
  yakalanabilir.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/APPIUM-LEARNING.md`.

---

## 6. Automation

### S6.1 — Page Object Model (POM) neden kullanılır?

- **Short Answer:** Test kodundan UI locator'larını AYIRARAK, UI
  değiştiğinde testleri DEĞİL yalnızca Page Object'i güncellemeyi
  sağlar.
- **Detailed Answer:** Her sayfa/bileşen için bir sınıf (locator'lar +
  eylemler) tanımlanır; testler bu sınıfın metotlarını çağırır,
  ham selector'larla UĞRAŞMAZ.
- **Example:** `LoginPage` sınıfı `login(email, password)` metodunu
  sağlar; hem Playwright (Phase 8) hem Selenium (Phase 10) lab'ı AYNI
  `data-testid` sözleşmesini (farklı POM implementasyonlarıyla) kullanır.
- **Real QA Risk:** POM olmadan, UI'da tek bir `id` değişikliği
  ONLARCA test dosyasını KIRABİLİR — POM bu riski TEK bir dosyaya
  izole eder.
- **Related Lab:** `QA-DEMO-SYSTEM/automation-labs/selenium/pages/`, `QA-DEMO-SYSTEM/web-tests/tests/helpers.js`.

### S6.2 — "Flaky test" nedir, nasıl önlenir?

- **Short Answer:** Kod değişmediği halde bazen PASS bazen FAIL olan
  test — genelde zamanlama/senkronizasyon sorunlarından kaynaklanır.
- **Detailed Answer:** En yaygın nedenler: sabit `sleep()` kullanımı
  (yeterli/fazla bekleme), paylaşılan state (testler arası
  temizlenmeyen veri), gerçek asenkron olayların (WS mesajı, animasyon)
  yanlış beklenmesi.
- **Example:** Bu campaign'de `retries: 0` BİLİNÇLİ olarak seçildi
  (Playwright config) — "flaky görünen ama gerçekte gizli bir hata
  olan" bir sonucun sahte PASS'e dönüşmesini engellemek için; her
  suite en az 2-3 kez ardışık çalıştırılıp GERÇEKTEN stabil olduğu
  kanıtlandı.
- **Real QA Risk:** Bir test'i "flaky" diye retry'layıp geçmesini
  beklemek, ALTINDA yatan gerçek bir zamanlama bug'ını (örn. bir
  race condition) GİZLER.
- **Related Lab:** `QA-DEMO-SYSTEM/web-tests/playwright.config.js`, `QA-DEMO-SYSTEM/evidence/PHASE-8-WEB-MOBILE-QA/EXECUTION.md`.

---

## 7. Selenium

### S7.1 — WebDriver ile Chromium/chromedriver sürüm uyuşmazlığı neden test'i çökertir?

- **Short Answer:** chromedriver, kendisiyle eşleşmeyen büyük major
  sürümdeki bir tarayıcıyı başlatmayı REDDEDER (`session not created`
  hatası).
- **Detailed Answer:** WebDriver protokolü, driver'ın tarayıcının
  DevTools/otomasyon arayüzünü tam olarak bilmesini gerektirir — çok
  farklı sürümler arasında bu arayüz uyuşmayabilir.
- **Example:** Bu campaign'de GERÇEKTEN yaşandı: chromedriver 147.x
  + Chromium 141.x → `"This version of ChromeDriver only supports
  Chrome version 147"`. Kök neden izole edilip (Selenium Manager'ın
  kendi otomatik-indirmesi de ağ kısıtı nedeniyle başarısız oldu)
  dürüstçe "EXECUTION BLOCKED" olarak belgelendi — kod hatası
  DEĞİLDİ.
- **Real QA Risk:** CI/CD ortamında sabit-pinlenmiş bir chromedriver
  sürümü, tarayıcı otomatik güncellendiğinde SESSİZCE kırılabilir —
  bu nedenle Selenium Manager gibi otomatik-eşleştirme araçları
  (gerçek ağ erişimiyle) tercih edilir.
- **Related Lab:** `QA-DEMO-SYSTEM/automation-labs/selenium/driver-factory.js`, `QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/EXECUTION.md`.

### S7.2 — Explicit wait ile implicit wait arasındaki fark nedir?

- **Short Answer:** Implicit wait TÜM element aramalarına global bir
  timeout uygular; explicit wait BELİRLİ bir koşulu (örn. element
  görünür oldu) hedefli şekilde bekler.
- **Detailed Answer:** Explicit wait, "bu spesifik eleman şu spesifik
  durumda olana kadar bekle" der — daha öngörülebilir ve
  debug-edilebilirdir. Implicit wait, HER aramaya aynı süreyi
  uygulayıp gereksiz yavaşlığa veya yetersiz beklemeye yol açabilir.
- **Example:** `driver.wait(until.elementLocated(By.css(...)), 10_000)`
  — "email input GÖRÜNENE kadar en fazla 10sn bekle" (blind
  `sleep(10000)` DEĞİL).
- **Real QA Risk:** Sabit `sleep()` kullanmak, ya testi gereksiz
  yavaşlatır (element aslında 200ms'de hazır) ya da yavaş bir CI
  runner'da yetersiz kalıp flaky teste yol açar.
- **Related Lab:** `QA-DEMO-SYSTEM/automation-labs/selenium/pages/LoginPage.js`.

---

## 8. Appium

### S8.1 — Appium'un Selenium'dan temel farkı nedir?

- **Short Answer:** Appium, WebDriver protokolünü MOBİL platformlara
  (Android/iOS) genişletir — `UiAutomator2`/`XCUITest` gibi
  platform-spesifik driver'lar kullanır, tarayıcı DEĞİL native/hybrid
  uygulamaları sürer.
- **Detailed Answer:** Locator stratejileri farklıdır (`accessibility
  id`, `-android uiautomator`, `-ios predicate string` — CSS selector
  DEĞİL); "context switching" (native ↔ webview) hybrid uygulamalara
  özgü bir Appium kavramıdır.
- **Example:** Selenium'un `By.css(...)`'i, Appium'da genelde
  `accessibility id` ile değiştirilir.
- **Real QA Risk:** Appium testleri GERÇEK bir cihaz/emulator olmadan
  ANLAMSIZDIR — Selenium'un aksine (ki en azından headless bir
  tarayıcı ile TEK-makineli bir CI'da çalışabilir), Appium'un temel
  gereksinimi (bir mobil OS örneği) her zaman ek altyapı ister.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/APPIUM-LEARNING.md`.

---

## 9. Performance

### S9.1 — Load, Stress, Spike ve Soak testleri arasındaki fark nedir?

- **Short Answer:** Load = beklenen normal trafik; Stress = sistemi
  kırılma noktasına kadar zorlamak; Spike = ani/keskin trafik artışı;
  Soak = uzun süreli sabit düşük yük (bellek sızıntısı gibi zaman-içi
  sorunları yakalamak için).
- **Detailed Answer:** Dördü de AYNI temel araçla (örn. JMeter/Locust),
  yalnızca thread-sayısı/ramp-up/süre PARAMETRELERİ değiştirilerek
  elde edilir — ayrı bir test tasarımı gerekmez.
- **Example:** Bu campaign'in JMeter planı (`qa-demo-system-load-test.jmx`)
  `${__P(threads,5)}`/`${__P(rampUp,5)}`/`${__P(loops,3)}` ile
  parametrelenmiştir — TEK dosya, dört profili destekler.
- **Real QA Risk:** Yalnızca Load testi yapıp Stress/Spike/Soak'ı
  ATLAMAK, sistemin GERÇEK kırılma noktasını veya zaman-içi
  degradasyonunu asla ortaya çıkarmaz.
- **Related Lab:** `QA-DEMO-SYSTEM/automation-labs/jmeter/qa-demo-system-load-test.jmx`, `QA-DEMO-SYSTEM/automation-labs/locust/locustfile.py`.

### S9.2 — p95/p99 latency neden ortalama (average) latency'den daha önemlidir?

- **Short Answer:** Ortalama, aykırı değerleri (outlier) GİZLER; p95/
  p99 "kullanıcıların en yavaş %5/%1'inin deneyimi ne kadar kötü"
  sorusuna cevap verir.
- **Detailed Answer:** Bir sistemin ortalama yanıt süresi 50ms olsa
  bile, kullanıcıların %1'i 2 saniye bekliyor olabilir — bu, ortalama
  ile tamamen GİZLENİR ama p99 ile GÖRÜNÜR hale gelir.
- **Example:** Gerçek Locust çalıştırmasında: ortalama 2ms ama p99
  15ms, maksimum 40ms — ortalamaya bakan biri bu farkı KAÇIRIRDI.
- **Real QA Risk:** Yalnızca ortalamaya bakan bir performans raporu,
  gerçek kullanıcı deneyimindeki ciddi bir "kuyruk" (tail latency)
  sorununu tamamen GİZLEYEBİLİR.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-14-MODERN-QA-LEARNING-LABS/EXECUTION.md` (Bölüm 3).

---

## 10. Security

### S10.1 — OWASP API Security Top 10'dan "Broken Object Level Authorization" (BOLA/IDOR) nedir, nasıl test edilir?

- **Short Answer:** Bir kullanıcının, kendisine ait OLMAYAN bir
  kaynağa (örn. başka bir kullanıcının siparişi) yalnızca ID'yi
  değiştirerek erişebilmesi.
- **Detailed Answer:** Test stratejisi: kullanıcı A bir kaynak
  oluşturur, kullanıcı B (farklı bir authenticated session) AYNI
  kaynağın ID'siyle erişmeyi dener — erişim REDDEDİLMELİ (ve ID'nin
  varlığını sızdırmayacak şekilde, genelde 404 ile).
- **Example:** `security.test.js`'teki "sequential order-id
  enumeration across two users never crosses ownership" testi, bir
  ID ARALIĞINI tarayarak sızıntı olmadığını kanıtlar.
- **Real QA Risk:** Yalnızca "kendi kaynağına erişebiliyor mu" testi
  YETERSİZDİR — "BAŞKASININ kaynağına erişemiyor mu" AYRI ve daha
  kritik bir testtir.
- **Related Lab:** `QA-DEMO-SYSTEM/backend/tests/security.test.js`, `QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/OWASP-API-TOP-10-MAPPING.md`.

### S10.2 — Bir hata mesajının kullanıcı girdisini "yansıtması" (reflection) her zaman bir güvenlik açığı mıdır?

- **Short Answer:** Hayır — bağlama bağlıdır. JSON API yanıtında
  ham girdi görünmesi, bu girdi bir TARAYICIDA `innerHTML` ile
  render EDİLMEDİĞİ sürece doğrudan XSS'e dönüşmez.
- **Detailed Answer:** Gerçek risk üç faktöre bağlıdır: (1) yanıtın
  content-type'ı (JSON mu HTML mi), (2) tüketen istemcinin bu veriyi
  NASIL render ettiği (`textContent` mi `innerHTML` mi), (3) bu
  spesifik hatanın gerçekten bir UI'da GÖSTERİLİP gösterilmediği.
- **Example:** Bu campaign'de GERÇEK bir bulgu: `payment_token` hata
  mesajı ham girdiyi JSON'a yansıtıyordu — ama üç bağımsız kontrolle
  (JSON content-type, frontend'in yalnızca `textContent` kullanması,
  bu hatanın hiçbir sayfada gösterilmemesi) uçtan uca istismar
  edilemez olduğu KANITLANDI; yine de non-blocking bir hardening
  notu olarak KÜÇÜMSENMEDEN kaydedildi.
- **Real QA Risk:** "Reflection var, demek ki XSS var" aceleci
  sonucu YANLIŞ pozitiflere yol açabilir; ama "reflection var ama
  şu an istismar edilemez" sonucunu da KÖRÜKÖRÜNE "önemsiz" diye
  kapatmak TEHLİKELİDİR — gelecekte yeni bir istemci eklenirse aynı
  reflection gerçek bir risk haline gelebilir.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/EXECUTION.md` (Bölüm 3).

### S10.3 — Rate limiting olmayan bir API'nin gerçek riski nedir?

- **Short Answer:** Brute-force saldırılar (şifre deneme), kaynak
  tüketimi saldırıları (DoS) sınırlanamaz.
- **Detailed Answer:** Rate limiting genelde IP/kullanıcı/endpoint
  bazında bir zaman penceresinde izin verilen istek sayısını
  sınırlayan bir middleware katmanıdır (örn. `express-rate-limit`).
- **Example:** Bu sistemde rate limiting kaynak kodda `grep` ile
  DOĞRULANARAK yok olduğu belgelendi — icat edilmiş bir "test edildi"
  iddiası üretilmedi, dürüstçe NOT IMPLEMENTED olarak kaydedildi.
- **Real QA Risk:** Bir QA, "sistem çalışıyor" diye rate limiting
  eksikliğini göz ardı EDERSE, production'da gerçek bir brute-force/
  DoS riski gizlenmiş olur.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/EXECUTION.md` (Bölüm 4).

---

## 11. CI/CD

### S11.1 — Bir CI pipeline'ında "Quality Gate" nedir?

- **Short Answer:** Bir job/aşama BAŞARISIZ olduğunda, pipeline'ın
  sonraki aşamalara (deploy dahil) İLERLEMESİNİ ENGELLEYEN bir kontrol
  noktası.
- **Detailed Answer:** Bu genelde `needs:` (GitHub Actions) veya
  `stage` bağımlılıkları (Jenkins) ile modellenir — bir test job'ı
  FAIL olursa, deploy job'ı hiç TETİKLENMEZ.
- **Example:** Bu campaign'in `ci.yml`'i 3 bağımsız job (backend,
  web-tests, api-schema) çalıştırır; hepsi SUCCESS olmadan bir
  gerçek deploy adımı (bu pipeline'da YOK ama olsaydı) tetiklenmezdi.
- **Real QA Risk:** Quality gate olmadan, kırık bir build/test
  sonucu FARK EDİLMEDEN production'a kadar ilerleyebilir.
- **Related Lab:** `.github/workflows/ci.yml`, `QA-DEMO-SYSTEM/evidence/PHASE-12-CICD-ENVIRONMENT/EXECUTION.md`.

### S11.2 — Bir CI ortamı ile yerel geliştirme ortamı arasında "Selenium çalıştı ama JMeter çalışmadı" gibi bir fark neden olabilir?

- **Short Answer:** Farklı ortamların farklı ağ politikaları, farklı
  önceden-kurulu paket sürümleri veya farklı işletim sistemi
  paketleri olabilir.
- **Detailed Answer:** Bu campaign'de GERÇEKTEN yaşandı: sandboxed
  geliştirme oturumunda hem Selenium (chromedriver/Chromium sürüm
  uyuşmazlığı) hem JMeter (apt paket/XStream uyumsuzluğu) ÇALIŞMADI —
  ama AYNI Playwright testi, GitHub Actions'ın GERÇEK internet erişimi
  olan runner'ında GERÇEKTEN ÇALIŞTI (gerçek `playwright install`
  ile).
- **Example:** Phase 12'nin GitHub Actions çalıştırması (Run ID
  35950797840), 3/3 job SUCCESS ile sonuçlandı — bu, "altyapı kısıtı"
  ile "gerçek kod hatası" arasındaki farkı SOMUT olarak gösterdi.
- **Real QA Risk:** Bir "yerelde çalışmadı" sonucunu hemen "kod
  hatalı" diye yorumlamak YANLIŞ olabilir — kök neden GERÇEKTEN
  izole edilmeden (bu ortama mı özgü, yoksa gerçekten mi kırık)
  sonuç çıkarılmamalıdır.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-12-CICD-ENVIRONMENT/EXECUTION.md` (Bölüm 2).

---

## 12. Senior QA

### S12.1 — Bir senior QA, "bu test flaky, retry ekleyelim" önerisine nasıl yaklaşmalıdır?

- **Short Answer:** Retry, GERÇEK bir sorunu (race condition, yanlış
  senkronizasyon) MASKELER — kök nedeni bulmak, retry eklemekten
  ÖNCELİKLİDİR.
- **Detailed Answer:** Bir senior QA, "neden flaky" sorusunu sorar:
  sabit sleep mi, paylaşılan state mi, gerçek bir asenkron race
  condition mı? Yalnızca kök neden GERÇEKTEN bulunamıyorsa (ve bu
  nadir olmalı) sınırlı, açıkça belgelenmiş bir retry kabul edilebilir.
- **Example:** Bu campaign'de `retries: 0` BİLİNÇLİ bir mimari karar
  olarak seçildi — "flaky görünen bir sonucun gizli bir hatayı
  maskelemesini" engellemek için; her suite yerine 2-3 kez ardışık
  çalıştırılarak GERÇEK stabilite kanıtlandı.
- **Real QA Risk:** Retry-ile-maskeleme kültürü, zamanla test
  suite'inin GERÇEK sinyal değerini kaybetmesine yol açar — "PASS"
  artık "gerçekten doğru çalışıyor" anlamına gelmez.
- **Related Lab:** `QA-DEMO-SYSTEM/web-tests/playwright.config.js`.

### S12.2 — Bir senior QA, kendi yazdığı bir testin YANLIŞ VARSAYIMA dayandığını nasıl fark eder ve ne yapar?

- **Short Answer:** Test GERÇEKTEN çalıştırılıp gerçek sonuç
  beklenenle KARŞILAŞTIRILDIĞINDA fark edilir — kodu okumak yeterli
  DEĞİLDİR, ÇALIŞTIRMAK gerekir.
- **Detailed Answer:** Bir test yazarken "böyle davranır" varsayımı
  YAPILABİLİR — ama bu varsayım gerçek bir çalıştırmayla
  DOĞRULANMADAN "test yazıldı, iş bitti" denilemez.
- **Example:** Bu campaign'de EN AZ 4 kez GERÇEKTEN yaşandı: Phase 6
  GraphQL'de `order(id)` alanının nullable olduğu için `data: null`
  değil `data.order: null` döndüğü (yanlış varsayım, test düzeltildi,
  kod DEĞİL); Phase 9'da visual-regression toleransının çok gevşek
  olduğu; Phase 11'de `payment_token` hata davranışının varsayılanın
  aksine "unknown token" 400'ü olduğu; Phase 13'te `req.path`'in
  yanlış logland��ğı (bu kez GERÇEK bir kod hatasıydı, kod
  düzeltildi).
- **Real QA Risk:** Bir testin "PASS" vermesi, testin DOĞRU olduğu
  anlamına GELMEZ — test yanlış bir varsayıma dayanıp YANLIŞ bir şeyi
  doğruluyor olabilir; her ikisi de (kod hatası mı test hatası mı)
  dikkatle AYRIŞTIRILMALIDIR.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-6-GRAPHQL-WEBSOCKET-EVENT/EXECUTION.md` (Bölüm 4), `QA-DEMO-SYSTEM/evidence/PHASE-9-VISUAL-ACCESSIBILITY/EXECUTION.md` (Bölüm 5).

---

## 13. QA Lead

### S13.1 — Bir QA Lead, "bu özellik test edilemedi, altyapı yok" durumunu nasıl yönetir?

- **Short Answer:** Sahte bir "test edildi" iddiası ÜRETMEK yerine,
  durumu dürüstçe belgeleyip (neden, ne eksik, gerçek bir ortamda
  nasıl test edilirdi) net bir sınıflandırma (LEARNING/BLOCKED) ile
  kapatır.
- **Detailed Answer:** Bu, "Evidence Integrity" prensibinin
  organizasyonel karşılığıdır — bir ekibin GÜVENİLİRLİĞİ, yalnızca
  "her şey yeşil" demesinden değil, "şunu test EDEMEDİK, işte neden"
  demekten gelir.
- **Example:** Bu campaign boyunca 6 farklı madde (Firebase Events,
  Mobile cihazlar, Burp/ZAP, Jenkins, Docker execution, k6 binary)
  bu şekilde dürüstçe LEARNING/BLOCKED olarak sınıflandırıldı — her
  biri için kök neden GERÇEKTEN araştırılıp belgelendi.
- **Real QA Risk:** "Her şey test edildi" diye sahte bir rapor sunan
  bir ekip, gerçek bir üretim hatası çıktığında GÜVENİLİRLİĞİNİ
  tamamen KAYBEDER.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/EXECUTION.md`.

### S13.2 — Bir QA Lead, test coverage yüzdesini NASIL yorumlamalıdır?

- **Short Answer:** Yüksek coverage, "az bug" anlamına GELMEZ — yalnızca
  "kodun şu kadarı çalıştırıldı" anlamına gelir; hangi SATIRLARIN
  kapsanmadığı ve NEDEN, daha önemlidir.
- **Detailed Answer:** %99 coverage'lı bir sistemde bile, kapsanmayan
  %1'in NEDEN kapsanmadığı (örn. yalnızca beklenmeyen 500 hatalarında
  çalışan kod) anlaşılmalı — bu, "eksik test" mi yoksa "doğal olarak
  tetiklenemeyen kod" mu ayrımını netleştirir.
- **Example:** Bu sistemde `errorHandler.js` %76 satır coverage'a
  sahip — düşük ama İYİ bir nedenle: genel hata handler'ı yalnızca
  gerçek, beklenmeyen 500 senaryolarında çalışır ve HİÇBİR test
  KASITLI olarak böyle bir senaryo üretmedi (doğru davranış).
- **Real QA Risk:** "%100 coverage hedefi" koymak, anlamsız/yapay
  testler yazılmasına (yalnızca satırı çalıştırmak için, gerçek bir
  senaryoyu doğrulamadan) yol açabilir.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-14-MODERN-QA-LEARNING-LABS/code-coverage-output.txt`.

---

## 14. Scenario Questions

### S14.1 — Senaryo: "Kullanıcı sipariş verdi ama bildirim gelmedi" şikayeti geldi. Nasıl araştırırsınız?

- **Short Answer:** Correlation/request ID ile logları izle → DB'de
  siparişin gerçek durumunu kontrol et → event/notification'ın
  gerçekten üretilip üretilmediğini kontrol et → WS delivery'nin
  bağlantı durumuna bağlı best-effort olduğunu unutma.
- **Detailed Answer:** Bu, gerçek bir root-cause-isolation
  senaryosudur — her adımda "regresyon mu, beklenen davranış mı, yeni
  bug mu" sorusu ayrı ayrı cevaplanmalıdır.
- **Example:** Bu tam olarak Case Study 06'da adım adım anlatılan
  senaryodur.
- **Real QA Risk:** "Bildirim gelmedi" şikayetini hemen "bug var" diye
  yorumlamak yanlış olabilir — sistem bilinçli olarak "kullanıcı
  bağlı değilse push gönderilmez, ama bildirim DB'de kalır, sonradan
  fetch edilebilir" şeklinde tasarlanmıştır; gerçek soru "kullanıcı
  bildirimi GET /api/notifications ile alabiliyor mu" olmalıdır.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-15-CASE-STUDIES/case-study-06-production-incident-investigation.md`.

### S14.2 — Senaryo: Bir PR'da CI kırmızı ama "benim değişikliğimle alakası yok" deniyor. Ne yaparsınız?

- **Short Answer:** Önce base branch'te de aynı hata var mı kontrol
  et (gerçekten alakasız mı) — varsa, base'i PR'a merge edip aynı
  hatanın hâlâ var olup olmadığını doğrula; yoksa, kendi
  değişikliğinin neden olduğunu VARSAY ve kök nedeni araştır.
- **Detailed Answer:** "Benimle alakası yok" iddiası bir VARSAYIMDIR,
  bir KANIT değildir — gerçek doğrulama (base branch'te de kırmızı mı)
  yapılmadan bu iddiaya güvenilmemelidir.
- **Example:** Bu campaign'in kendi CI disiplini (bkz. sistem
  talimatları) tam olarak bunu zorunlu kılar: bir hata "bu PR'ın
  değil" diye kapatılmadan önce base branch'te de kırmızı olduğu
  GERÇEKTEN doğrulanmalı, yalnızca o zaman "flaky/alakasız" olarak
  işaretlenebilir (ve yine de bir açıklama yorumu gerekir).
- **Real QA Risk:** Her kırmızı CI'ı "alakasız" diye görmezden gelmek,
  gerçek regresyonların fark edilmeden birikmesine yol açar.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-12-CICD-ENVIRONMENT/EXECUTION.md`.

### S14.3 — Senaryo: Bir güvenlik testi, bir hata mesajının kullanıcı girdisini yansıttığını buldu. Bunu nasıl raporlarsınız?

- **Short Answer:** Bulguyu KÜÇÜMSEMEDEN, ama aynı zamanda ABARTMADAN
  — gerçek istismar edilebilirliği (content-type, tüketen istemcinin
  render şekli, bu hatanın gerçekten bir UI'da gösterilip
  gösterilmediği) somut kanıtla değerlendirip raporlarsınız.
- **Detailed Answer:** İyi bir güvenlik raporu üç şeyi ayrı ayrı
  belirtir: (1) bulgunun KENDİSİ (ne gözlemlendi), (2) GERÇEK
  istismar edilebilirlik analizi (somut kanıtla), (3) önerilen
  aksiyon (blocker mı, hardening notu mu).
- **Example:** Bu campaign'in `payment_token` reflection bulgusu tam
  olarak bu şekilde raporlandı — üç bağımsız kanıtla "şu an istismar
  edilemez" sonucuna varıldı, ama "genel prensip ihlali" olarak
  KAYDEDİLDİ, görmezden gelinmedi.
- **Real QA Risk:** Bir bulguyu "önemsiz" diye ATLAMAK, gelecekte
  koşullar değiştiğinde (yeni bir istemci, yeni bir render yolu)
  gerçek bir açığa dönüşebilecek bir riski GÖRMEZDEN GELMEK anlamına
  gelebilir — bu yüzden HER ZAMAN belgelenmeli, yalnızca doğru
  ciddiyet seviyesiyle.
- **Related Lab:** `QA-DEMO-SYSTEM/evidence/PHASE-11-SECURITY-AWARE-QA/EXECUTION.md` (Bölüm 3).
