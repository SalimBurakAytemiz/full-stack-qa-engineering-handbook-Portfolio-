# Case Study 01 — Authentication

## Senaryo

QA-DEMO-SYSTEM'in email+password authentication akışı: bir kullanıcı
`POST /api/auth/login` ile giriş yapar, gerçek bir `demo-session-<uuid>`
token'ı alır, bu token sonraki tüm korumalı isteklerde `Authorization:
Bearer <token>` olarak kullanılır.

## Risk Analizi

| Risk | Ciddiyet | Gerekçe |
|---|---|---|
| Bilgi sızıntısı (email var mı yok mu belli olması) | Yüksek | Saldırgan hangi email'lerin kayıtlı olduğunu enumerate edebilir |
| Zayıf/tahmin edilebilir session token | Yüksek | Session hijacking |
| SUSPENDED kullanıcının giriş yapabilmesi | Orta | Yetkisiz erişim |
| SQL injection ile auth bypass | Kritik | Tüm sistemin ele geçirilmesi |

## Test Stratejisi ve GERÇEK Sonuçlar

Bu case study YENİ test YAZMADI — bu campaign boyunca ZATEN üretilmiş
gerçek kanıtı sentezliyor:

| Risk | Kanıt | Sonuç |
|---|---|---|
| Bilgi sızıntısı | Phase 5 P5.3 + `security.test.js` ("wrong password" ve "unknown email" AYNI `Email veya şifre hatalı` mesajını döner) | **KAPALI** — generic error message, BR-AUTH-003 |
| Zayıf token | `auth.service.js` — `crypto.randomUUID()` (kriptografik olarak güçlü, tahmin edilemez) | **KAPALI** |
| SUSPENDED kullanıcı | `auth.service.js` — `user.status !== 'ACTIVE'` kontrolü, generic hata ile reddedilir | **KAPALI** |
| SQL injection | `security.test.js` — `' OR '1'='1'` payload'ı hem email hem password alanında denendi, 401 ile reddedildi | **KAPALI** (parametreli sorgular sayesinde) |
| XSS (email alanına script) | `security.test.js` — `<script>alert(1)</script>` payload'ı denendi, response'da hiç reflect edilmedi | **KAPALI** |

**Gerçek regresyon:** `node --test tests/auth.test.js tests/security.test.js` → tüm testler PASS (Phase 6/11/13 checkpoint'lerinde defalarca doğrulandı, en son 128/128'lik tam suite'in bir parçası olarak).

## Bilinen Sınırlamalar

- OTP/2FA yok (Phase 11'de NOT IMPLEMENTED olarak belgelendi) — tek
  faktörlü authentication, gerçek bir production sisteminde ek bir
  katman olurdu.
- Rate limiting yok (Phase 11) — brute-force denemeleri şu an
  sınırlanmıyor; bu, gerçek bir production ortamı için bilinen,
  belgelenmiş bir hardening notu.
- Şifreler düz metin saklanıyor (bilinçli mimari karar, sentetik test
  hedefi için — `ARCHITECTURE.md` bölüm 6'da zaten belgelenmiş).

## Öğrenilenler

Bu case study, "generic error message" prensibinin (BR-AUTH-003) hem
fonksiyonel hem güvenlik testleriyle NASIL çapraz doğrulandığını
gösteriyor — aynı davranış iki farklı QA merceğinden (Phase 5
fonksiyonel, Phase 11 güvenlik) bağımsız olarak test edildi ve TUTARLI
sonuç verdi, bu da bulgunun güvenilirliğini artırıyor.
