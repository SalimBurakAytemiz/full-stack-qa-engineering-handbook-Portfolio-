# Case Study 04 — Multi-Country / Localization (LEARNING)

## Gerçek Sistem Durumu (Doğrulandı)

```
$ grep -rln "locale\|i18n\|currency\|country\|TRY\|USD\|EUR" backend/src frontend --include="*.js" --include="*.html"
(sıfır sonuç)
```

QA-DEMO-SYSTEM **tek-locale**dir: tüm UI metinleri Türkçe
sabit-kodlanmıştır (`frontend/js/products.js`: `${product.price.toFixed(2)}
TL`), hiçbir i18n framework'ü, locale-switching mekanizması veya
çoklu-para-birimi desteği YOKTUR. Bu, bu case study'nin dürüstçe
LEARNING-only olmasının GERÇEK, doğrulanmış nedenidir — icat edilmiş
bir "test edildi" iddiası ÜRETİLMEDİ.

## Kavramsal Senaryo (LEARNING)

Bu sistem çok-ülkeli hale getirilseydi, gerçek bir QA süreci şunları
test ederdi:

| Test Alanı | Gerçek bir QA yaklaşımı |
|---|---|
| Para birimi formatlama | `149.90 TL` yerine locale'e göre `$149.90` / `149,90 €` — `Intl.NumberFormat` ile |
| Tarih/saat formatı | `YYYY-MM-DD HH:MM:SS` (mevcut SQLite formatı) yerine locale'e göre `MM/DD/YYYY` vs `DD.MM.YYYY` |
| Metin genişliği/taşma | Almanca gibi diller İngilizce'den %30 daha uzun olabilir — UI'ın (`main { max-width: 480px }`) bunu kaldırıp kaldıramadığı |
| RTL diller (Arapça/İbranice) | Bu uygulamanın CSS'i yalnızca LTR varsayıyor — `dir="rtl"` desteği yok |
| Vergi/yasal metin farklılıkları | Ülkeye özgü KVKK/GDPR benzeri metinler |
| Zaman dilimi | `CURRENT_TIMESTAMP` (SQLite, UTC) — kullanıcının yerel saatine çevrilmesi |

## Bu Projede Gerçekten Yapılabilecek Bir Sonraki Adım (Yapılmadı, Kapsam Dışı)

Gerçek bir i18n eklentisi (örn. basit bir `locale.json` sözlüğü +
`Intl.NumberFormat`/`Intl.DateTimeFormat`) eklemek, campaign'in
"no scope creep" kuralına göre bu case study'nin kapsamı DIŞINDADIR —
bu, ROADMAP'ın kendisinin talep ettiği bir Phase 6-19 özelliği
DEĞİLDİR, yalnızca "nasıl test edilirdi" sorusuna cevap vermesi
istenen bir case study'dir.

## Sınıflandırma

**LEARNING / DOCUMENTATION-ONLY — NOT IMPLEMENTED (doğrulandı) —
BLOCKER DEĞİL.**
