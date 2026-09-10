# Release Risk

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Testler PASS oldu" ve "release güvenli" aynı şey değildir. Bu dosya,
Functional Testing sonuçlarının release kararı için **yeterli
olmadığını** ve gerçek bir release risk değerlendirmesinin hangi
boyutları kapsaması gerektiğini anlatır.

---

## 2. Functional PASS ≠ Automatically Safe Release

Bir feature'ın tüm functional test senaryoları PASS olabilir, ama bu,
release'in **güvenli** olduğu anlamına gelmez. Çünkü:

- Functional testler, genellikle **tanımlanan** senaryoları kapsar —
  tanımlanmamış (unknown) senaryoları kapsamaz.
- Functional PASS, performans altında sistemin nasıl davranacağını
  göstermez.
- Functional PASS, güvenlik açıklarının olmadığını garanti etmez.
- Functional PASS, üçüncü parti bir servisin production'da stabil
  olacağını garanti etmez.

Bu yüzden Release Risk değerlendirmesi, Functional Test sonucunun
**ötesine** geçen ayrı bir adımdır (bkz.
`00-QA-FOUNDATIONS/15-QUALITY-GATES-OVERVIEW.md`).

---

## 3. Release Risk Değerlendirme Faktörleri

### Open Defects

Açık, henüz çözülmemiş defect'ler var mı? Bunların severity/priority
dağılımı nasıl?

### Regression Coverage

Bu release'de regression suite'i ne kadar kapsamlı çalıştırıldı?
Kapsanmayan alanlar var mı?

### Untested Areas

Zaman/kaynak kısıtı nedeniyle hiç test edilmemiş alanlar var mı? Bu
alanlar ne kadar riskli?

### Environment Issues

Test edilen ortam, production'ı ne kadar doğru yansıtıyor? Ortam
farklılıkları (konfigürasyon, veri hacmi) bir risk taşıyor mu?

### Performance Concerns

Yeni değişiklik, beklenen yük altında performans sorunlarına yol
açabilir mi? Performans testi yapıldı mı?

### Security Concerns

Yeni değişiklik, bilinen bir güvenlik riski taşıyor mu (örn. yeni bir
input alanı, yeni bir yetki seviyesi)?

### Third Party Risks

Bu release, üçüncü parti bir servise yeni bir bağımlılık ekliyor mu?
O servisin stabilitesi/SLA'sı biliniyor mu?

### Known Issues

Bilinen ama kabul edilmiş (fix edilmemiş) sorunlar açıkça dokümante
edildi mi?

---

## 4. Örnek Değerlendirme

**Senaryo:** Yeni bir "hızlı ödeme" (one-click checkout) özelliği
release edilecek. Tüm functional test senaryoları PASS.

**Release Risk değerlendirmesi:**

| Faktör | Değerlendirme |
|---|---|
| Open Defects | 0 Critical, 1 Medium (indirimli üründe fiyat yuvarlama farkı — kabul edildi) |
| Regression Coverage | Ödeme akışının tamamı regresyona dahil edildi |
| Untested Areas | Mobile'da tablet ekran boyutu test edilmedi (zaman kısıtı) |
| Environment Issues | Test ortamı, production'daki gerçek kullanıcı yükünü simüle etmiyor |
| Performance Concerns | Yeni özellik için ayrı bir load test yapılmadı |
| Security Concerns | Kayıtlı kart bilgisine erişim, mevcut authorization mekanizmasını kullanıyor — yeni bir risk yaratmıyor |
| Third Party Risks | Aynı, zaten kullanılan payment provider — yeni bağımlılık yok |
| Known Issues | Fiyat yuvarlama farkı business tarafından kabul edildi ve dokümante edildi |

**Sonuç:** Functional testler tamamen PASS olsa bile, bu tablo "Untested
Areas" (tablet) ve "Performance Concerns" (load test eksikliği) gibi
açık riskleri gösteriyor. Bu, release kararının **yalnızca test
sonuçlarına değil, bu tam tabloya** dayanması gerektiğini kanıtlar.

---

## 5. Common Mistakes

- Release kararını yalnızca "otomasyon suite'i yeşil" bilgisine
  dayandırmak.
- Untested Areas'ı raporlamadan, sanki test edilmiş gibi sessizce
  geçmek.
- Known Issues'ı business ile paylaşmadan, QA'nın kendi kararıyla
  "önemsiz" ilan edip release etmek.

---

## 6. Best Practices

- Release Risk değerlendirmesini bir checklist/tablo olarak her
  release öncesi doldurun.
- Untested Areas'ı asla gizlemeyin — bu, gelecekteki bir production
  incident'ında "neden test edilmedi" sorusuna dürüst bir cevap
  sağlar.
- Release kararını (Go/No-Go) business ile birlikte, bu tam
  değerlendirme üzerinden verin.

---

## 7. Interview Notes

- "Tüm testler PASS oldu, release edebilir miyiz?" sorusuna hayır
  diyerek, Release Risk değerlendirmesinin diğer boyutlarını (open
  defects, untested areas, performance, security) açıklayın.
- "Release Risk değerlendirmesinde hangi faktörleri kullanırsınız?"
  sorusuna en az 5-6 faktörü sayarak cevap verin.

---

## İlgili Konular

- [Risk Register Example](06-RISK-REGISTER-EXAMPLE.md)
- [00-QA-FOUNDATIONS — Quality Gates Overview](../00-QA-FOUNDATIONS/15-QUALITY-GATES-OVERVIEW.md)
- [00-QA-FOUNDATIONS — Entry & Exit Criteria](../00-QA-FOUNDATIONS/09-ENTRY-AND-EXIT-CRITERIA.md)
