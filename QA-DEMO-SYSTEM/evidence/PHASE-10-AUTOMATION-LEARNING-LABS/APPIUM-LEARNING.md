# PHASE 10 — Appium Lab (LEARNING / DOCUMENTATION-ONLY)

**Neden gerçek test/kod YOK:** Phase 8'in `MOBILE-LEARNING.md`'sinde
zaten doğrulandığı gibi, bu sandboxed container'da gerçek veya emüle
edilmiş bir Android/iOS cihazı YOKTUR. Appium'un kendisi (bir npm
paketi olarak) kurulabilir olsa bile, bağlanacağı bir
cihaz/emulator/simulator olmadan Appium'un temel işlevi (bir mobil
uygulamayı gerçek bir OS üzerinde sürmek) ÇALIŞTIRILAMAZ — bu, Phase 8
Mobile ile TAM OLARAK aynı altyapı-eksikliği sınıfıdır, ayrıca
Selenium lab'ın (bkz. `EXECUTION.md` Bölüm 2) chromedriver/Chromium
sürüm uyumsuzluğundan da farklı bir engel: burada hiçbir "driver" veya
sürüm eşleşmesi denemesi bile anlamsızdır, çünkü sürücünün
bağlanacağı bir hedef (cihaz) yoktur.

Bu proje zaten native bir mobil uygulama İÇERMEDİĞİNDEN (QA-DEMO-SYSTEM
tamamen vanilla web frontend'dir), bu bölüm proje-spesifik değil, genel
Appium/mobil-otomasyon bilgisi olarak sunulur — Selenium lab'da olduğu
gibi projeye özel bir Page Object hedefi yoktur.

---

## Kapsam Maddeleri

| Madde | Kavram | Gerçek bir ortamda nasıl yapılır |
|---|---|---|
| Setup | Appium server + istemci kütüphanesinin kurulumu | `npm install -g appium` + platform-özel driver (`appium driver install uiautomator2` / `xcuitest`) |
| Driver Configuration | Hedef platforma özel capability'lerin tanımlanması | `platformName`, `automationName`, `deviceName`, `app` (APK/IPA yolu) gibi W3C capability'leri |
| Android | Android cihaz/emulator otomasyonu | `UiAutomator2` driver, gerçek cihaz veya Android Studio AVD |
| iOS | iOS cihaz/simulator otomasyonu | `XCUITest` driver, yalnızca macOS host + Xcode gerektirir |
| Locators | Elemanları bulma stratejileri | `accessibility id`, `-android uiautomator`, `-ios predicate string`, `xpath` |
| Waits | Senkronizasyon | Appium'un kendi `WebDriverWait` eşdeğeri (Selenium'un `until` API'siyle aynı temel) |
| Assertions | Doğrulama | Aynı genel-amaçlı assertion kütüphaneleri (chai/assert) — Selenium lab'daki ile aynı desen |
| Page Objects | Sürdürülebilir test yapısı | Selenium lab'daki `LoginPage`/`ProductsPage` desenine birebir eşdeğer, yalnızca locator stratejisi mobile'a özel |
| Helpers | Ortak yardımcı fonksiyonlar (swipe, scroll, izin onaylama) | Appium'un `mobile:` komut uzantıları |
| Test Data | Test kullanıcıları/senaryoları | Selenium lab'daki JSON test-data dosyası deseniyle aynı |
| Reporting | Sonuç raporlama | Selenium lab'daki gibi basit bir konsol reporter, veya Allure/Mochawesome gibi bir üçüncü-parti raporlayıcı |
| CI | Sürekli entegrasyon | Gerçek bir cihaz çiftliği/emulator farmı gerektirir (bkz. Phase 8 Device Matrix notu) — bu proje kapsamında yok |

---

## Sınıflandırma

**LEARNING / DOCUMENTATION-ONLY — NOT TESTED — BLOCKER DEĞİL.**

Gerekçe Phase 8 Mobile ile birebir aynıdır: gerçek bir
cihaz/emulator/simulator bu container'ın dışında bir kaynak
gerektirir (campaign'in "authority outside this repository is
required" durdurma kriteri). Selenium lab'ın aksine (burada gerçek
kod yazılıp gerçek bir çalıştırma denemesi yapıldı ve doğrulanmış bir
hata elde edildi), Appium için gerçek bir çalıştırma denemesi dahi
ANLAMLI DEĞİLDİR — hedef cihaz yokluğu, herhangi bir driver/sürüm
sorunundan önce gelen, daha temel bir engeldir.
