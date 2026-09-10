# QA Role & Scope Boundaries

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

QA'nın sistemi anlaması gerektiği doğrudur — ama "anlamak" ile "o rolün
sorumluluğunu üstlenmek" farklı şeylerdir. Bu dosya, QA'nın komşu
rollerle olan sınırını netleştirir.

---

## 2. Temel Yaklaşım

**QA diğer ekiplerin işini yapmak zorunda değildir.**

Ama QA, sistem davranışını anlayacak ve bir problemi **doğru katmana
izole edecek** kadar teknik bilgi sahibi olabilir/olmalıdır.

Bu iki cümle birlikte okunmalıdır: QA, derin implementasyon sorumluluğu
taşımaz ama yüzeysel bir "bilmiyorum, başka ekibin işi" yaklaşımı da
sergilemez. QA'nın değeri, tam da bu ikisinin ortasındaki **izolasyon
becerisinde** yatar.

---

## 3. QA ile Developer

**Sınır:** Developer, kodu yazar ve implementasyondan sorumludur. QA,
kodun beklenen davranışı gösterip göstermediğini doğrular.

**Örnek:** QA, bir API endpoint'inin yanlış status code döndürdüğünü
tespit eder ve raporlar. Kodun hangi satırının hatalı olduğunu bulmak
ve düzeltmek Developer'ın işidir.

---

## 4. QA ile Backend Developer

**Sınır:** Backend Developer, servis mantığını ve veri işleme kurallarını
geliştirir. QA, servisin business kurallarına uygun response ürettiğini
doğrular.

**Örnek:** QA, indirim hesaplamasının API response'unda yanlış
olduğunu bulur; hesaplama formülünün kod içinde nerede yanlış
yazıldığını Backend Developer belirler.

---

## 5. QA ile Mobile Developer

**Sınır:** Mobile Developer, platforma özgü (Android/iOS) implementasyon
detaylarından sorumludur. QA, uygulamanın farklı cihaz/OS
kombinasyonlarında beklenen davranışı gösterip göstermediğini doğrular.

**Örnek:** QA, bir ekranın belirli bir ekran boyutunda taştığını
raporlar; layout kodunu düzeltmek Mobile Developer'a aittir.

---

## 6. QA ile DevOps

**Sınır:** DevOps, pipeline ve infrastructure architecture'ı geliştirir
ve yönetir. QA, CI/CD sonucunu kullanır ve test failure'ları analiz
eder.

**Örnek:**

> QA pipeline sonucunu analiz edebilir. Bu QA'yı DevOps Engineer yapmaz.

QA, bir pipeline job'ının neden başarısız olduğunu (test failure mi,
environment sorunu mu) analiz edip doğru ekibe yönlendirebilir. Ancak
pipeline'ın altyapısını (runner konfigürasyonu, deployment stratejisi)
tasarlamak DevOps'un işidir.

---

## 7. QA ile DBA

**Sınır:** DBA, database altyapısını tasarlar ve yönetir. QA, database
davranışını ve veri tutarlılığını validate eder.

**Örnek:**

> QA database validation yapabilir. Bu QA'yı DBA yapmaz.

QA, bir siparişin veritabanında doğru `status` değeriyle kaydedildiğini
sorgulayarak doğrulayabilir. Ancak veritabanının indeksleme stratejisi,
performans tuning'i veya backup politikası DBA'nın sorumluluğundadır.

---

## 8. QA ile Security Engineer

**Sınır:** Security Engineer, derin security assessment ve offensive
security çalışmaları yürütür. QA, temel security risklerini test edip
raporlar.

**Örnek:**

> QA authorization problemi bulabilir. Bu QA'yı Pentester yapmaz.

QA, bir kullanıcının yetkisi olmayan bir kaynağa erişebildiğini
(authorization açığı) fark edip raporlayabilir. Ancak sistematik
penetrasyon testi, exploit geliştirme ve derin güvenlik değerlendirmesi
Security Engineer/Pentester'ın işidir.

---

## 9. QA ile Product Owner

**Sınır:** Product Owner, hangi özelliğin ne için geliştirileceğine ve
business önceliğine karar verir. QA, o özelliğin tanımlandığı gibi
doğru çalıştığını doğrular.

**Örnek:** QA, bir Acceptance Criteria'nın eksik olduğunu fark edip
sorgular; hangi davranışın "doğru" olduğuna business açısından karar
vermek Product Owner'a aittir.

---

## 10. QA ile Business Analyst

**Sınır:** Business Analyst, business ihtiyacını requirement'a
dönüştürür. QA, bu requirement'ın test edilebilir ve tutarlı olup
olmadığını değerlendirir.

**Örnek:** QA, bir requirement'taki iki maddenin birbiriyle çeliştiğini
fark edip Business Analyst'e geri bildirir.

---

## 11. QA ile Designer

**Sınır:** Designer, kullanıcı deneyimi ve arayüz tasarımından
sorumludur. QA, geliştirilen arayüzün tasarıma uygun olup olmadığını
doğrular.

**Örnek:** QA, bir butonun tasarımda belirtilen renkte olmadığını
raporlar; hangi rengin doğru olduğuna karar vermek ve tasarımı
güncellemek Designer'a aittir.

---

## 12. Özet Tablo

| Rol | QA'nın Yapabileceği | QA'nın Sorumluluğu Olmayan |
|---|---|---|
| Developer | Davranış hatasını tespit etme | Kod satırını düzeltme |
| Backend Developer | Response/business kural doğrulama | Servis implementasyonu |
| Mobile Developer | Platform davranışı doğrulama | Native kod yazma |
| DevOps | Pipeline sonucu analiz etme | Pipeline/infra tasarımı |
| DBA | Veri tutarlılığı doğrulama | Database altyapı yönetimi |
| Security Engineer | Temel security riski tespit etme | Derin pentest/offensive security |
| Product Owner | Acceptance Criteria'yı sorgulama | Business öncelik kararı |
| Business Analyst | Requirement tutarlılığını değerlendirme | Requirement'ı yazma/business kararı |
| Designer | Tasarıma uygunluğu doğrulama | Arayüz tasarımı |

---

## 13. Common Mistakes

- QA'nın hiçbir teknik konuda fikir beyan edemeyeceğini düşünmek
  ("bu benim işim değil" aşırılığı).
- QA'nın her sorunu kendisi çözmesi gerektiğini düşünmek (diğer ucun
  aşırılığı).
- Bir problemi doğru role izole etmeden genel bir "bug" olarak
  raporlamak.

---

## 14. Best Practices

- Bir defect raporlarken, mümkünse hangi katmana (frontend, backend,
  database, infra) ait olduğunu belirtin.
- Komşu rollerin temel çalışma mantığını anlayın — onların işini yapmak
  için değil, doğru soruyu sormak ve doğru izolasyonu yapmak için.
- "Bu benim işim değil" demeden önce, sorunu doğru role işaret edecek
  kadar analiz yapın.

---

## 15. Interview Notes

- "QA database ile ne kadar ilgilenir?" sorusuna, validation yapabildiğini
  ama DBA olmadığını örnekle açıklayın.
- "QA security testing yapar mı?" sorusuna, temel risk tespiti
  yapabildiğini ama pentest'in ayrı bir uzmanlık olduğunu belirtin.
- Scope boundary sorularında her zaman "QA yapabilir ama X rolü değildir"
  formülünü kullanın.

---

## İlgili Konular

- [QA / QC / Software Testing](01-QA-QC-AND-SOFTWARE-TESTING.md)
- [Test Levels](04-TEST-LEVELS.md)
- [CONTRIBUTING.md — QA Scope Boundary](../CONTRIBUTING.md)
