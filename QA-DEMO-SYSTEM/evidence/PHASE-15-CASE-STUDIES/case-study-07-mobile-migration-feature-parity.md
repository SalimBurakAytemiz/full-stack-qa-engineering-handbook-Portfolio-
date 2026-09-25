# Case Study 07 — Mobile Migration / Feature Parity (LEARNING)

## Gerçek Sistem Durumu

QA-DEMO-SYSTEM'in bir native mobil uygulaması YOKTUR — yalnızca
framework-less bir web frontend'i vardır. Phase 8'de zaten
doğrulandığı gibi, bu sandboxed container'da gerçek bir Android/iOS
cihazı/emulator/simulator da YOKTUR. Bu nedenle bu case study
dürüstçe LEARNING-only'dir.

## Kavramsal Senaryo (LEARNING)

**Senaryo:** QA-DEMO-SYSTEM'in web deneyimi, bir React Native/Flutter
mobil uygulamasına "migrate" ediliyor. QA'nın görevi, Feature Parity
(web'de olan HER ŞEYİN mobilde de doğru çalıştığını) doğrulamak.

**Bu projenin GERÇEK web özellik envanterinden çıkan parity
checklist'i** (Phase 8'de doğrulanmış gerçek özellikler, icat
edilmedi):

| Web Özelliği (GERÇEK, bu projede var) | Mobilde Parity Testi Nasıl Yapılır |
|---|---|
| Email+password login, sessionStorage token | Mobilde `sessionStorage` yok — Appium ile native secure storage (Keychain/Keystore) kullanıldığı doğrulanır |
| Ürün listesi (`GET /api/products`) | Appium locator'larıyla (`accessibility id`) aynı veri render edildiği doğrulanır — Phase 10'un Appium LEARNING bölümündeki "Locators" konsepti |
| Gerçek zamanlı WebSocket bildirimleri | Mobilde uygulama arka plana alındığında (Background/Foreground, Phase 8 Mobile kapsamı) WS bağlantısının davranışı — genellikle gerçek push notification'a (FCM/APNs) geçiş gerekir, bkz. Phase 6 Firebase Events LEARNING |
| Responsive/fluid layout (`max-width: 480px`) | Mobilde bu CSS kısıtı YOKTUR — native UI kendi layout sistemini kullanır, "parity" burada piksel-eşitliği değil DAVRANIŞ-eşitliği anlamına gelir |
| Cookie-free, Bearer-token auth (Phase 8 bulgusu) | Mobilde de aynı prensip (token'ı güvenli native storage'da tutmak, cookie kullanmamak) korunmalı |

## Bu Projede Gerçekten Test Edilen Ortak Zemin

Feature parity testinin GERÇEKTEN test edilebilir kısmı — API
sözleşmesinin KENDİSİ — zaten bu campaign'de kapsamlı şekilde test
edildi (Phase 5 REST + Phase 6 GraphQL). Bir mobil istemci, web
istemcisiyle AYNI API'yi tüketir; bu nedenle API sözleşmesindeki her
regresyon, hem web hem (hipotetik) mobil istemciyi AYNI ANDA etkiler
— bu, "backend testi zaten kısmi bir parity garantisidir" prensibinin
somut bir örneğidir.

## Sınıflandırma

**LEARNING / DOCUMENTATION-ONLY — NOT APPLICABLE (native mobil
uygulama yok) — BLOCKER DEĞİL.** Gerçek altyapı (Appium + cihaz/
emulator) Phase 8/10'da zaten doğrulanmış bir eksikliktir.
