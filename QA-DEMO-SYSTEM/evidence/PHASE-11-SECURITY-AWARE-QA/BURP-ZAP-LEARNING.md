# PHASE 11 — Burp Suite / OWASP ZAP (LEARNING / DOCUMENTATION-ONLY)

**Neden gerçek çalıştırma YOK:** Burp Suite (lisanslı, GUI tabanlı) ve
OWASP ZAP (GUI/daemon tabanlı, gerçek bir proxy arayüzü gerektirir) bu
headless, GUI'siz sandboxed container'da kurulu DEĞİLDİR ve kurulumu
da bu ortamın kapsamı dışındadır (ZAP'ın kendisi teorik olarak
headless/CLI modunda `zap-baseline.py` ile çalıştırılabilir, ancak bu
ortamda kurulu değildir ve indirme için gerekli
`github.com/zaproxy` / `getzap.io` gibi domainler ağ allowlist'inde
YOKTUR — Selenium/JMeter lab'larında (Phase 10) doğrulanan aynı ağ
kısıtı sınıfı).

Bu projede güvenlik testleri bunun yerine `security.test.js` (bu
paket) ve Phase 5'in Newman/Postman tabanlı API testleriyle GERÇEKTEN
yapıldı — Burp/ZAP'ın otomatik tarayıcılarının tipik olarak
bulacağı şeylerin (IDOR, mass assignment, hata mesajı bilgi sızıntısı,
input reflection) manuel/hedefli eşdeğerleri bu testlerle KANITLANDI,
yalnızca bu iki spesifik GUI aracının kendisi çalıştırılamadı.

## Kavramsal Karşılaştırma

| Konu | Burp/ZAP'ın yaptığı | Bu projede yapılan gerçek eşdeğer |
|---|---|---|
| Otomatik tarama (crawl + scan) | Tüm endpoint'leri otomatik keşfedip fuzz eder | `security.test.js` hedefli, bilinen endpoint'lere karşı SQLi/XSS-oriented payload'lar gönderir |
| Passive scanning | Trafik geçerken header/config sorunlarını tespit eder | `errorHandler.js` incelemesi + Sensitive Data testleri (manuel, ama gerçek) |
| Intruder / fuzzing | Parametrelere otomatik payload listesi dener | IDOR testinde manuel ID enumeration (küçük, hedefli aralık) |
| Repeater | Tek bir isteği elle değiştirip tekrar gönderme | `curl`/`fetch` ile bu campaign boyunca defalarca yapıldı (örn. Phase 6 GraphQL smoke test) |

## Sınıflandırma

**LEARNING / DOCUMENTATION-ONLY — NOT TESTED (bu iki spesifik araç) —
BLOCKER DEĞİL.** Gerekçe: GUI/lisanslı araç + ağ erişimi kısıtı — bkz.
Phase 10'un Selenium/JMeter bulgularıyla aynı sınıf altyapı eksikliği.
