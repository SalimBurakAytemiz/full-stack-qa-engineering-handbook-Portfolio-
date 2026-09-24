# PHASE 8 — Mobile QA (LEARNING / DOCUMENTATION-ONLY)

**Neden gerçek test/kod YOK:** Bu sandboxed container'da gerçek veya
emüle edilmiş bir Android/iOS cihazı, emulator (Android Studio AVD) ya da
simulator (Xcode iOS Simulator) YOKTUR. Bu bir kod eksikliği değil,
gerçek bir altyapı eksikliğidir (Tooling doğrulaması:
`.ai/PHASE-6-19-CAMPAIGN-STATE.md`). Appium'un kendisi kurulabilir
olsa bile, bağlanacağı gerçek bir cihaz/emulator/simulator olmadan
hiçbir mobil test gerçek anlamda ÇALIŞTIRILAMAZ.

Bu nedenle bu belge, campaign'in Evidence Integrity kuralı gereği,
sahte "ran on real device" kanıtı ÜRETMEK YERİNE, ROADMAP Phase 8
"Mobile" kapsamındaki her maddeyi dürüstçe, gerçek QA kavramları
seviyesinde açıklar — icat edilmiş sonuç YOK, yalnızca kavram +
gerçek bir ortamda nasıl test edileceği.

QA-DEMO-SYSTEM'in kendisi zaten native bir mobil uygulama DEĞİLDİR
(vanilla web frontend) — bu bölüm bu nedenle proje-spesifik değil,
genel mobil QA bilgisi olarak sunulur.

---

## Kapsam Maddeleri

| Madde | Kavram | Gerçek bir ortamda nasıl test edilir |
|---|---|---|
| Android | Google'ın mobil işletim sistemi | Gerçek cihaz veya Android Studio AVD (emulator) + Appium `UiAutomator2` driver |
| iOS | Apple'ın mobil işletim sistemi | Gerçek cihaz veya Xcode Simulator (yalnızca macOS'ta çalışır) + Appium `XCUITest` driver |
| Native | Platform SDK'sıyla yazılmış uygulama (Kotlin/Swift) | Appium, uygulamanın native accessibility tree'sine (UiAutomator/XCUITest) doğrudan erişir |
| Hybrid | Native shell içinde WebView barındıran uygulama | Appium context switching (`NATIVE_APP` ↔ `WEBVIEW_x`) ile hem native hem web katmanı test edilir |
| WebView | Uygulama içi gömülü tarayıcı bileşeni | Chrome DevTools Protocol üzerinden WebView içeriği de bir web sayfası gibi incelenebilir |
| Device Matrix | Farklı cihaz/OS-versiyon/ekran-boyutu kombinasyonlarında test | Gerçek cihaz laboratuvarı veya bulut servisi (BrowserStack/Sauce Labs gibi — bu proje kapsamında lisanslı/harici hesap gerektirir) |
| Permissions | Kamera/konum/bildirim gibi izin diyalogları | Appium'un izin-otomasyonu API'leri (`mobile: acceptAlert`, platform-özel izin komutları) |
| Orientation | Portrait/landscape dönüşü | Appium `driver.orientation = 'LANDSCAPE'` ve layout'un buna tepkisinin doğrulanması |
| Background / Foreground | Uygulamanın arka plana alınıp geri getirilmesi | Appium `driver.backgroundApp(seconds)` — state'in korunduğunun doğrulanması |
| Kill / Relaunch | Uygulamanın tamamen kapatılıp yeniden açılması | Appium `driver.terminateApp()` + `driver.activateApp()` — cold-start davranışının doğrulanması |
| Network Interruption | Ağ bağlantısının kesilmesi/bozulması | Appium `driver.setNetworkConnection()` veya cihaz-seviyesi network throttling araçları |
| Offline | Tamamen bağlantısız çalışma | Uçak modu simülasyonu + yerel cache/offline-first davranışın doğrulanması |
| Push Notification | Sunucudan cihaza itilen bildirim | Gerçek FCM (Android) / APNs (iOS) kimlik bilgileri ve gerçek cihaz/emulator gerektirir — bkz. Phase 6 "Firebase Events" ile AYNI altyapı-eksikliği sınıfı |
| Deep Link | URI şemasıyla uygulama içi belirli bir ekrana yönlendirme | Appium `driver.get('myapp://...')` veya `adb shell am start -a android.intent.action.VIEW -d <uri>` |
| Localization | Farklı dil/bölge ayarlarında davranış | Cihaz/emulator locale ayarını değiştirip UI metinlerinin/format'ların doğrulanması |
| Feature Parity | Aynı özelliğin Android/iOS arasında tutarlı davranması | Aynı test senaryosunun her iki platformda da çalıştırılıp sonuçların karşılaştırılması |

---

## Sınıflandırma

**LEARNING / DOCUMENTATION-ONLY — NOT TESTED — BLOCKER DEĞİL.**

Gerçek bir cihaz/emulator/simulator, bu container'ın dışında bir
kaynak (fiziksel donanım, macOS host, veya bulut cihaz laboratuvarı
hesabı) gerektirir — campaign'in kendi "genuinely human-only" durdurma
kriterlerinden biridir ("authority outside this repository is
required" / gerçek bir donanım/hesap satın alınması gerekir). Bu
nedenle bu madde açık bir blocker olarak değil, dürüstçe belgelenmiş
bir kapsam-dışı altyapı gereksinimi olarak kapatılmıştır.
