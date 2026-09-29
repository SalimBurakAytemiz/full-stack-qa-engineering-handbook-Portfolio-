# Professional Bug Report

**Status: EXPERIENCE**

> Bu dosya, repository'nin vitrin dosyalarından biridir — profesyonel
> bir bug raporunun her alanının **neden gerekli olduğunu**, **ne
> zaman kullanıldığını** ve **kötü kullanımının nasıl göründüğünü**
> gösterir.

---

## 1. Neden Önemli?

"Login bozuk" gibi bir rapor, bir defect değil, bir **şikayettir**.
Profesyonel bir bug raporu, başka bir kişinin (developer, başka bir
QA) hiçbir ek soru sormadan sorunu **anlayıp tekrar üretebileceği**
kadar eksiksiz olmalıdır.

---

## 2. Profesyonel Bug Report Alanları

### Bug ID

**Neden gerekli:** Benzersiz referans; Traceability ve tartışmalarda
("BUG-AUTH-014'e bakın") kullanılır.

**Ne zaman kullanılır:** Her defect kaydında.

**Kötü kullanım:** ID'siz, yalnızca başlıkla anılan defect'ler —
zamanla hangi "login bug'ı" konuşulduğu karışır.

### Title / Summary

**Neden gerekli:** Listede tarandığında sorunu tek bakışta anlatır
(bkz. bölüm 3 — "Bug Title Standard").

**Ne zaman kullanılır:** Her zaman, standart formatta.

**Kötü kullanım:** "Login bozuk", "Hata var".

### Feature

**Neden gerekli:** Defect'in hangi modüle ait olduğunu gösterir,
filtreleme ve sorumlu ekip ataması için gereklidir.

**Ne zaman kullanılır:** Her zaman.

**Kötü kullanım:** Feature alanı boş bırakılıp genel bir "Bug"
kategorisine atılmak.

### Platform

**Neden gerekli:** Web/Mobile/API gibi platformlar arasında davranış
farklılıkları olabilir.

**Ne zaman kullanılır:** Özellikle çok platformlu ürünlerde her
zaman.

**Kötü kullanım:** Platform belirtilmeden "uygulamada hata var"
demek.

### Environment

**Neden gerekli:** Bir sorun DEV'de var ama Staging'de olmayabilir —
ortam bilgisi olmadan sorun yanlış yerde aranır.

**Ne zaman kullanılır:** Her zaman.

**Kötü kullanım:** Environment yazılmaması — bkz.
`00-QA-FOUNDATIONS/COMMON-MISTAKES.md` — "Environment problemini
product bug olarak raporlamak" hatasıyla da ilişkilidir.

### Build / Version

**Neden gerekli:** Hangi kod versiyonunda gözlemlendiği, fix
sonrası retest'in doğru build'de yapılmasını sağlar.

**Ne zaman kullanılır:** Her zaman.

**Kötü kullanım:** Build numarası olmadan "şu an bozuk" demek — bir
hafta sonra hangi build'de olduğu unutulur.

### Device / OS / Browser

**Neden gerekli:** Platforma özgü davranış farklılıklarını
(cross-browser/cross-device sorunları) izole etmeye yardımcı olur.

**Ne zaman kullanılır:** Web ve Mobile defect'lerinde.

**Kötü kullanım:** "Bende çalışmıyor" — hangi cihaz/tarayıcı
belirtilmemiş.

### Preconditions

**Neden gerekli:** Sorunun hangi başlangıç durumunda ortaya çıktığını
gösterir (bkz. `04-STEPS-TO-REPRODUCE.md`).

**Ne zaman kullanılır:** Her zaman.

**Kötü kullanım:** Preconditions atlanıp doğrudan adımlara geçmek —
"aktif kullanıcı" mı, "misafir kullanıcı" mı belirsiz kalır.

### Test Data

**Neden gerekli:** Sorunu tekrar üretmek için kullanılan spesifik
veriyi gösterir.

**Ne zaman kullanılır:** Veriye bağımlı her senaryoda.

**Kötü kullanım:** "Bir kullanıcı ile denedim" — hangi kullanıcı,
hangi veriyle belirsiz.

### Steps to Reproduce

**Neden gerekli:** Sorunu **deterministik** şekilde tekrar üretmenin
tek yoludur (bkz. `04-STEPS-TO-REPRODUCE.md`).

**Ne zaman kullanılır:** Her zaman, numaralı ve net adımlarla.

**Kötü kullanım:** "Login ol, hata çıkıyor." (bkz.
`04-STEPS-TO-REPRODUCE.md` — Bad Example)

### Expected Result

**Neden gerekli:** Neyin "doğru" kabul edildiğini gösterir (Test
Oracle'a dayanmalı — bkz.
`00-QA-FOUNDATIONS/08-TEST-ORACLE.md`).

**Ne zaman kullanılır:** Her zaman.

**Kötü kullanım:** "Doğru çalışmalı" gibi belirsiz bir ifade.

### Actual Result

**Neden gerekli:** Gözlemlenen gerçek davranışı, Expected Result ile
karşılaştırılabilir şekilde gösterir.

**Ne zaman kullanılır:** Her zaman.

**Kötü kullanım:** Expected ve Actual'ı tek bir cümlede
birleştirmek (bkz. `05-EXPECTED-VS-ACTUAL.md`).

### Reproduction Rate

**Neden gerekli:** Sorunun her zaman mı, bazen mi oluştuğunu gösterir
(bkz. `07-REPRODUCTION-RATE.md`) — bu, önceliklendirme ve kök neden
analizini doğrudan etkiler.

**Ne zaman kullanılır:** Her zaman, mümkünse birden fazla deneme
sonrası.

**Kötü kullanım:** Reproduction Rate hiç belirtilmemek — %100 mü
%10 mu olduğu bilinmeden triage yapılamaz.

### Severity

**Neden gerekli:** Sorunun **etki** seviyesini gösterir (bkz.
`06-SEVERITY-VS-PRIORITY.md`).

**Ne zaman kullanılır:** Her zaman.

**Kötü kullanım:** Severity'yi Priority ile karıştırmak.

### Priority

**Neden gerekli:** Sorunun **çözülme aciliyetini** gösterir.

**Ne zaman kullanılır:** Her zaman (genelde triage sırasında
belirlenir — bkz. `09-DEFECT-TRIAGE.md`).

**Kötü kullanım:** Severity ile aynı değeri otomatik atamak.

### Related Requirement

**Neden gerekli:** Traceability sağlar — bu defect hangi
requirement/AC'yi ihlal ediyor?

**Ne zaman kullanılır:** Mümkün olduğunda her zaman.

**Kötü kullanım:** Requirement referansı hiç eklenmemek.

### Related Test Case

**Neden gerekli:** Bu defect'in hangi test case execution'ından
çıktığını gösterir (bkz.
`../03-TEST-DESIGN/11-TRACEABILITY-FROM-REQUIREMENT-TO-TEST.md`).

**Ne zaman kullanılır:** Bir Test Case execution'ı sırasında
bulunduysa her zaman.

**Kötü kullanım:** Test Case referansı olmadan "test sırasında fark
ettim" demek.

### Regression Impact

**Neden gerekli:** Bu defect'in başka alanları da etkileyip
etkilemediğini gösterir (bkz. `15-REGRESSION-IMPACT.md`).

**Ne zaman kullanılır:** Fix sonrası veya ilk analiz sırasında.

**Kötü kullanım:** Regression Impact'i hiç değerlendirmemek.

### Evidence

**Neden gerekli:** Bulguyu teknik olarak kanıtlar (bkz.
`08-DEFECT-EVIDENCE.md`).

**Ne zaman kullanılır:** Her zaman, defect türüne uygun formatta.

**Kötü kullanım:** Hiç evidence eklememek.

### Logs

**Neden gerekli:** Backend/console log'ları, sorunun teknik kök
nedenine dair ipucu verir.

**Ne zaman kullanılır:** Teknik hatalarda (crash, exception,
beklenmeyen sistem davranışı).

**Kötü kullanım:** Log mevcutken eklenmemesi.

### API Evidence

**Neden gerekli:** Business Rule ihlallerinde, API request/response'u
doğrudan kanıt sunar (bkz.
`../01-REQUIREMENT-ANALYSIS/05-BUSINESS-RULE-ANALYSIS.md`).

**Ne zaman kullanılır:** API/backend kaynaklı sorunlarda.

**Kötü kullanım:** Yalnızca UI ekran görüntüsü paylaşılıp, altındaki
API davranışının hiç gösterilmemesi.

### Owner / Team

**Neden gerekli:** Sorumlu ekibi/kişiyi belirtir (varsa; her
organizasyonda otomatik atanabilir).

**Ne zaman kullanılır:** Triage sonrası.

**Kötü kullanım:** Owner atanmadan defect'in kimsenin sorumluluğunda
olmadan beklemesi.

### Status

**Neden gerekli:** Defect'in lifecycle'daki (bkz.
`02-DEFECT-LIFECYCLE.md`) güncel durumunu gösterir.

**Ne zaman kullanılır:** Her zaman, güncel tutularak.

**Kötü kullanım:** Status'un güncellenmemesi — defect fix edildiği
halde "OPEN" görünmesi.

---

## 3. Bug Title Standard

İyi bir Bug Title, listede tarandığında bile sorunu anlatmalıdır.

### Önerilen Format

```text
[Platform][Feature] Problem
```

### İyi Örnekler

- `[Web][Authentication] Invalid password attempt returns generic
  system error instead of authentication error`
- `[Mobile][Checkout] App crashes when applying an expired coupon
  code`
- `[API][Order] Order status remains PENDING after successful
  payment confirmation`

### Kötü Örnekler

- `Login bozuk` — Platform yok, Feature yok, sorun net değil.
- `Hata var` — Hiçbir bilgi taşımıyor.
- `Bug` — Anlamsız, tarama sırasında hiçbir değer sağlamıyor.
- `Ödeme çalışmıyor bazen` — "Bazen" belirsiz; hangi koşulda
  olduğu title'da değil (bu detay Steps to Reproduce'a ait olsa da,
  title en azından "hangi ödeme senaryosu" bilgisini vermelidir —
  örn. `[Web][Payment] Payment confirmation intermittently fails for
  wallet method`).

### Neden Bu Format?

`[Platform][Feature]` ön eki, bir defect listesi taranırken (örn.
Jira board'da) aynı feature'a ait sorunların **gruplanmasını** ve
hangi platformu etkilediğinin **anında** görülmesini sağlar. "Problem"
kısmı ise, mümkün olduğunca **spesifik** olmalı — "çalışmıyor" yerine
**ne olduğunu** (hangi hata, hangi yanlış davranış) anlatmalıdır.

---

## 4. Tüm Alanları Bir Arada Gösteren Örnek

```text
Bug ID: BUG-AUTH-014
Title: [Web][Authentication] Invalid password attempt returns
       generic system error instead of authentication error
Feature: Authentication
Platform: Web
Environment: Staging
Build/Version: v2.5.0-rc1
Device/OS/Browser: Desktop / Windows 11 / Chrome 124

Preconditions: Aktif, kayıtlı bir kullanıcı hesabı mevcut.
Test Data: email=test.active01@example.com,
           password=WrongPass999! (yanlış password)

Steps to Reproduce:
  1. Login sayfasını aç.
  2. Geçerli bir email gir.
  3. Yanlış bir password gir.
  4. "Giriş Yap" butonuna tıkla.

Expected Result: "Email veya şifre hatalı" mesajı gösterilmeli,
                 kullanıcı login olamamalı.
Actual Result: Sistem "System Error — Please try again later"
               mesajı gösteriyor; kullanıcı hangi alanın hatalı
               olduğunu anlayamıyor.

Reproduction Rate: 5/5 (her denemede tekrarlanıyor)
Severity: Medium
Priority: High
Related Requirement: AC-AUTH-004
Related Test Case: TC-AUTH-NEG-001
Regression Impact: Yok (yalnızca hata mesajlama katmanını etkiliyor)
Evidence: [Screenshot, API Response — bkz. 08-DEFECT-EVIDENCE.md]
Logs: [Backend log excerpt]
API Evidence: [Request/Response — bkz. ilgili evidence dosyası]
Owner/Team: Backend Team (Authentication Service)
Status: OPEN
```

---

## 5. Common Mistakes

- Steps to Reproduce'u belirsiz yazmak ("Login ol, hata çıkıyor").
- Expected ve Actual Result'ı ayırmadan tek bir cümlede birleştirmek.
- Evidence eklemeden yalnızca metinsel açıklamayla yetinmek.
- Severity ve Priority'yi otomatik olarak aynı değer sanmak.

---

## 6. Best Practices

- Her alanı, `templates/BUG-REPORT-TEMPLATE.md` formatıyla tutarlı
  doldurun.
- Steps to Reproduce'u, hiç bilmeyen birinin uygulayabileceği kadar
  net yazın.
- Evidence'ı defect türüne uygun seçin (bkz.
  `../05-TEST-MANAGEMENT/08-TEST-EVIDENCE-MANAGEMENT.md`).

---

## 7. Interview Notes

- "Profesyonel bir bug raporunda hangi alanlar olmalıdır?" sorusuna
  en az 10-12 alanı sayarak cevap verin.
- "Reproduction Rate neden önemlidir?" sorusuna, önceliklendirme ve
  kök neden analizini etkilediğini açıklayarak cevap verin.

---

## İlgili Konular

- [templates/BUG-REPORT-TEMPLATE.md](templates/BUG-REPORT-TEMPLATE.md)
- [Steps to Reproduce](04-STEPS-TO-REPRODUCE.md)
- [examples/AUTHENTICATION-BUG](examples/AUTHENTICATION-BUG/03-BUG-REPORT.md)
