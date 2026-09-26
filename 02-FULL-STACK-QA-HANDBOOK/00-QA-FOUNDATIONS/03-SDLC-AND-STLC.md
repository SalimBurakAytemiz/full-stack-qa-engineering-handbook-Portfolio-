# SDLC & STLC

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

QA'nın "yalnızca Testing Phase'inde çalıştığı" yanılgısı, büyük ölçüde
SDLC ve STLC'nin yanlış anlaşılmasından kaynaklanır. Bu dosya, QA'nın
lifecycle boyunca nerede devreye girdiğini net şekilde gösterir.

---

## 2. Software Development Life Cycle (SDLC) Nedir?

SDLC, bir yazılımın fikir aşamasından production'a kadar geçirdiği tüm
aşamaları tanımlayan süreç modelidir.

Tipik SDLC aşamaları:

1. Requirement Analysis
2. Design
3. Development (Implementation)
4. Testing
5. Deployment
6. Maintenance

---

## 3. Software Testing Life Cycle (STLC) Nedir?

STLC, SDLC içerisindeki testing aktivitelerinin kendi başına yapılandırılmış
alt sürecidir. SDLC'nin "Testing" aşamasıyla sınırlı değildir — SDLC'nin
neredeyse tamamına paralel yürür.

STLC aşamaları:

1. Requirement Analysis
2. Test Planning
3. Test Design
4. Environment Preparation
5. Execution
6. Defect Management
7. Closure

---

## 4. Her Aşamada QA'nın Rolü

### Requirement Analysis

QA, requirement'ları testability açısından analiz eder: hangi senaryolar
test edilebilir, hangi noktalar belirsiz, hangi kabul kriteri eksik.

**Örnek:** "Sistem büyük dosyaları desteklemeli" gibi ölçülemez bir
requirement'ta QA, "büyük" kelimesinin somut bir değere (örn. maksimum
50MB) bağlanmasını talep eder.

### Test Planning

QA, test stratejisini belirler: hangi test seviyeleri kullanılacak, hangi
riskler öncelikli, hangi kaynaklar gerekli, hangi araçlar kullanılacak.

### Test Design

QA, test senaryolarını ve test case'lerini tasarlar. Equivalence
Partitioning, Boundary Value Analysis gibi teknikler bu aşamada kullanılır.

### Environment Preparation

QA, test ortamının ihtiyaçlara uygun olup olmadığını doğrular: doğru build,
doğru konfigürasyon, gerekli test data.

### Execution

QA, tasarlanan test case'leri çalıştırır, sonuçları kaydeder, beklenmeyen
davranışları defect olarak raporlar.

### Defect Management

QA, bulunan defect'leri raporlar, severity/priority belirler, fix sonrası
retest yapar, regression riskini değerlendirir.

### Closure

QA, test sonuçlarını özetler, Exit Criteria'nın karşılanıp karşılanmadığını
değerlendirir, öğrenilen dersleri (lessons learned) dokümante eder.

---

## 5. SDLC ve STLC İlişkisi

STLC, SDLC'nin bağımsız bir aşaması değil, SDLC'ye **paralel** yürüyen bir
süreçtir.

```text
SDLC:  Requirement → Design → Development → Testing → Deployment → Maintenance
STLC:  Requirement Analysis → Test Planning → Test Design → Environment Prep → Execution → Defect Mgmt → Closure
```

Requirement Analysis her iki modelde de başlangıç noktasıdır — bu,
QA'nın işinin SDLC'nin "Testing" kutucuğunu beklemeden başladığının
kanıtıdır.

---

## 6. Waterfall ve Agile Bağlamındaki Farklar

### Waterfall

- Aşamalar sırayla ve genelde tek seferde yürür.
- STLC, SDLC'nin "Testing" aşamasına daha yakın zamanda yoğunlaşır.
- Requirement'lar erken dondurulur, değişiklik maliyeti yüksektir.

### Agile

- SDLC ve STLC, her sprint içinde küçük döngüler halinde tekrar eder.
- QA, sprint planning'den itibaren (requirement/user story seviyesinde)
  dahildir.
- Test Planning ve Test Design, her sprint için yeniden ama daha hafif
  şekilde yapılır.
- Continuous feedback esastır; defect'ler mümkün olduğunca erken
  yakalanır (shift-left).

---

## 7. QA Yalnızca "Testing Phase" Sırasında Çalışmaz

STLC'nin ilk iki aşaması (Requirement Analysis, Test Planning), SDLC'nin
"Development" aşamasıyla eş zamanlı, hatta öncesinde başlar.

**Somut örnek:** Bir e-ticaret sisteminde "Sepete ürün ekleme" özelliği
geliştirilirken:

- Requirement Analysis (Development başlamadan): QA, stok sınırı ve
  maksimum adet senaryolarını sorgular.
- Test Planning (Development sürerken): QA, hangi test seviyelerinin
  (unit, integration, E2E) hangi senaryoları kapsayacağını planlar.
- Execution (Development tamamlandıktan sonra): QA, gerçek testleri
  çalıştırır.

Bu örnek, QA aktivitesinin SDLC'nin "Testing" kutusuna hapsolmadığını
gösterir.

---

## 8. Common Mistakes

- STLC'yi SDLC'nin yalnızca "Testing" aşamasıyla sınırlı sanmak.
- Test Planning'i Development bitene kadar ertelemek.
- Agile'da "sprint kısa, planlamaya vakit yok" diyerek Test Design
  adımını atlamak.

---

## 9. Best Practices

- Requirement Analysis'i Development başlamadan tamamlayın.
- Agile'da Test Design'ı user story'nin "Definition of Ready" kriterine
  dahil edin.
- Closure aşamasında yalnızca "test geçti mi" değil, "hangi risk hâlâ
  açık" sorusunu da cevaplayın.

---

## 10. Interview Notes

- "STLC'nin SDLC'den farkı nedir?" sorusuna, STLC'nin SDLC'ye paralel
  yürüyen bir test alt-süreci olduğunu vurgulayarak cevap verin.
- "Agile'da test planlama nasıl değişir?" sorusuna, planlamanın ortadan
  kalkmadığını, sadece sprint bazlı ve daha hafif hale geldiğini belirtin.

---

## İlgili Konular

- [QA / QC / Software Testing](01-QA-QC-AND-SOFTWARE-TESTING.md)
- [Entry & Exit Criteria](09-ENTRY-AND-EXIT-CRITERIA.md)
- [Shift Left & Shift Right](11-SHIFT-LEFT-AND-SHIFT-RIGHT.md)
