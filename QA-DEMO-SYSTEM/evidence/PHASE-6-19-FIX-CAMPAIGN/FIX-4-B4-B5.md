# FIX-4 — B4 (P2, Phase 10 Selenium) + B5 (P2, Phase 10 JMeter)

**Codex audited HEAD:** `a359b39`

---

## B4 — Selenium: CODE COMPLETE iddiası yanlış güçlü, driver portability zayıf

### Kök neden (kod okunarak doğrulandı)

Phase 10's önceki evidence'ı üst özette (Bölüm 1) tek satırda
`Selenium | CODE COMPLETE — EXECUTION BLOCKED` diyordu, ama kendi
detay tablosu (eski Bölüm 2.1) Parallel Execution/Cross Browser/
Selenium Grid/CI-CD'yi `YOK` olarak listeliyordu — üst özet bu
nüansı taşımıyordu, bu da tam olarak Codex'in bulduğu overclaim'di.

Ayrıca `driver-factory.js`:
```js
options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome');
```
— `CHROME_BINARY_PATH` set edilmediğinde bu sandbox'a ÖZGÜ bir Linux
yoluna SESSİZCE düşüyordu. Başka bir makinede (normal bir CI runner,
Windows/macOS) bu varsayılan YANLIŞ olurdu — "ayarlanmamış" değil,
AKTİF OLARAK var olmayan bir yolu zorluyordu.

### Düzeltme

1. **Portability (asıl istenen düzeltme):** `CHROME_BINARY_PATH` artık
   yalnızca AÇIKÇA set edildiğinde kullanılıyor; aksi halde standart
   Selenium Manager browser-discovery'sine bırakılıyor.
2. **Cross Browser:** `buildFirefoxDriver()` eklendi (yeni npm
   dependency yok — `selenium-webdriver` zaten Firefox destekliyor).
3. **Selenium Grid:** `SELENIUM_GRID_URL` env'i set edilirse
   `builder.usingServer(...)` çağrılıyor.
4. **Parallel Execution:** `selenium/scripts/run-parallel.js` — 3
   bağımsız WebDriver oturumu GERÇEKTEN `Promise.all` ile eşzamanlı
   başlatılıyor (ardışık çalıştırmaları paralel gibi sunma DEĞİL).
5. **CI/CD:** `.github/workflows/ci.yml`'e yeni `selenium-lab` job'u
   eklendi — `ubuntu-latest`'in gerçek Chrome + ağ erişimini kullanarak
   bu lab'ın GERÇEKTEN bir yerde PASS etmesini sağlıyor (bkz. Bölüm
   "CI Doğrulama Sonucu" aşağıda).
6. **Üst özet tablosu düzeltildi:** artık her alt-madde (Setup/
   WebDriver/.../Reporting, Cross-Browser/Grid/Parallel, CI/CD) AYRI
   satırda, gerçek durumuyla — tek bir yekpare "CODE COMPLETE" iddiası
   YOK.

### Doğrulama (ampirik, iki senaryo)

```
# CHROME_BINARY_PATH set EDİLMEDEN (yeni varsayılan davranış):
SELENIUM_LAB_BLOCK_REASON: session not created: cannot find Chrome binary

# CHROME_BINARY_PATH AÇIKÇA set edilerek (bu sandbox'ın dev-oturumu kullanımı):
SELENIUM_LAB_BLOCK_REASON: session not created: This version of ChromeDriver
  only supports Chrome version 147, Current browser version is 141.0.7390.37
```
İkinci senaryo, orijinal (Phase 10) hatayı BİREBİR yeniden üretiyor —
düzeltme, belgelenmiş dev-oturumu kullanımını BOZMADI. `run-parallel.js`
aynı iki senaryoyla test edildi (3/3 oturum, tutarlı sonuç).

`node --check` ile her iki dosya da (driver-factory.js,
run-parallel.js) sözdizimsel olarak doğrulandı.

### CI Doğrulama Sonucu

`selenium-lab` job'u push edildikten SONRA GitHub Actions API'siyle
GERÇEKTEN sorgulandı — sonuç bu dosyanın SONUNDA (bu checkpoint'in
push'ından hemen sonraki adımda) kaydedilmiştir; ayrıca
`evidence/PHASE-10-AUTOMATION-LEARNING-LABS/EXECUTION.md` Bölüm 2.4'e
de işlenmiştir.

**Sınıflandırma: Portability bug DÜZELTİLDİ (repository sorunuydu,
"environment issue" olarak saklanmadı). Cross-Browser/Grid/Parallel:
CODE COMPLETE — EXECUTION BLOCKED (bu sandbox'ta, doğrulanmış). CI/CD:
bkz. CI Doğrulama Sonucu.**

---

## B5 — JMeter: gerçek correlation ve threshold/fail gate yoktu

### Kök neden (kod okunarak doğrulandı)

`.jmx` planı, login sampler'ının GERÇEKTEN döndürdüğü session
token'ını hiçbir yerde EXTRACT ETMİYOR ve yeniden KULLANMIYORDU — tek
"dinamik" görünen değer CSV'den (`${email}`/`${password}`) geliyordu,
ki bu STATİK test-data parametrizasyonudur, correlation DEĞİLDİR
(önceki evidence turu bunu yanlışlıkla "Correlation" olarak
etiketlemişti). Ayrıca hiçbir sampler'da bir yanıt-süresi eşiği/fail
gate YOKTU — yalnızca fonksiyonel `ResponseAssertion`'lar (status +
body) vardı; `connect_timeout`/`response_timeout` bir THRESHOLD
DEĞİLDİR, yalnızca asılı kalan bir isteği iptal eder.

### Düzeltme

1. **Correlation (gerçek):** POST `/api/auth/login` sampler'ına bir
   `JSONPostProcessor` eklendi (`$.token` → `${authToken}`). Bu değer,
   YENİ eklenen `GET /api/notifications` sampler'ının `Authorization:
   Bearer ${authToken}` header'ında yeniden kullanılıyor — sunucunun
   yalnızca ÇALIŞMA ZAMANINDA ifşa ettiği bir değerin bir sampler'dan
   diğerine taşınması (gerçek correlation'ın tanımı, CSV'den FARKLI).
2. **Threshold / Fail Gate:** her 4 sampler'a (`health`, `products`,
   `login`, `notifications`) bir `DurationAssertion` (3000ms) eklendi
   — JMeter CLI modunda bir `DurationAssertion` hatası bir sample
   FAIL'i sayılır, genel PASS/FAIL'i etkiler. Yeni bir plugin
   dependency EKLENMEDİ (zaten kırılgan JMeter 2.13/XStream kurulumuna
   ek risk katmamak için stok elemanlar kullanıldı).
3. **Terminoloji netliği:** Thread/Ramp-Up/Loop, Load Model olarak
   AYRI bir satırda; Correlation ile Test Data Parameterization AYRI
   satırlarda — evidence tablosu artık bunları karıştırmıyor.

### Doğrulama

```
$ python3 -c "import xml.dom.minidom as m; m.parse('qa-demo-system-load-test.jmx')"
XML well-formed: OK

$ jmeter -n -t qa-demo-system-load-test.jmx -Jport=3000 -l /tmp/fix4-jmeter-results.jtl
Error in NonGUIDriver com.thoughtworks.xstream.security.ForbiddenClassException: org.apache.jmeter.save.ScriptWrapper
```
**Aynı, önceden izole edilmiş kök neden** (JMeter 2.13 + sistem
`libxstream-java` 1.4.20 uyumsuzluğu) — YENİ elemanlar (JSONPostProcessor/
DurationAssertion) bir dosya-spesifik hataya yol AÇMADI, plan
correctness ile runtime execution ayrımı korundu.

**Sınıflandırma: CODE COMPLETE — EXECUTION BLOCKED (doğrulanmış paket
kısıtı, DEĞİŞMEDİ), artık gerçek Correlation + Threshold/Fail Gate
içeriyor.**

---

## Regresyon

```
$ node --test tests/**/*.test.js   # backend — B4/B5 backend kodunu etkilemedi
tests 142, pass 142, fail 0
```

**Açık blocker (B4, B5): 0 — ikisi de RESOLVED.**
