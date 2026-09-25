# QA / QC / Software Testing

**Status: EXPERIENCE**

---

## 1. Neden Bu Konu Önemli?

Sektöre yeni başlayan pek çok kişi "QA" ve "Testing" kelimelerini birbirinin
yerine kullanır. Bu karışıklık, QA'nın gerçek sorumluluk alanını daraltır ve
QA Engineer'ı yalnızca "test çalıştıran kişi" konumuna indirger.

Bu dosyanın amacı üç kavramı birbirinden net şekilde ayırmaktır:

- Quality (Kalite)
- Quality Assurance (QA)
- Quality Control (QC)
- Software Testing

---

## 2. Quality Nedir?

**Quality (Kalite)**, bir yazılımın belirlenen gereksinimleri, business
ihtiyacını ve kullanıcı beklentisini ne ölçüde karşıladığıdır.

Kalite yalnızca "bug yok" anlamına gelmez. Bir sistem hiç crash olmasa bile:

- Yanlış business kuralını uyguluyorsa
- Kullanıcı ihtiyacını karşılamıyorsa
- Yavaşsa
- Güvenli değilse

kaliteli kabul edilmez.

---

## 3. Quality Assurance (QA) Nedir?

QA, kalite problemlerinin **oluşmasını önlemeye** yönelik süreçlerin
bütünüdür.

QA yalnızca test çalıştırmaz. QA:

- Requirement'ın netliğini değerlendirir
- Testability'yi kontrol eder
- Riskleri analiz eder
- Test stratejisi kurar
- Süreç iyileştirir
- Development ile birlikte erken geri bildirim üretir

QA, **process-oriented** bir yaklaşımdır: "Bu hatayı nasıl önleriz?" sorusunu
sorar.

---

## 4. Quality Control (QC) Nedir?

QC, üretilmiş bir çıktının belirlenen kalite kriterlerine uyup uymadığını
**kontrol eder**.

QC, **product-oriented** bir yaklaşımdır: "Bu çıktı doğru mu?" sorusunu
sorar.

Test Execution, Bug Raporlama, Test Case çalıştırma gibi aktiviteler QC
kapsamına girer.

---

## 5. Software Testing Nedir?

Software Testing, yazılımın beklenen davranışı gösterip göstermediğini
doğrulamak için yapılan **somut aktivitedir**: test tasarlamak, test
çalıştırmak, sonucu analiz etmek, defect raporlamak.

Testing, QC'nin bir alt kümesidir. QC'nin en görünür parçasıdır ama tek
parçası değildir.

---

## 6. QA ≠ Testing

| | QA | Testing |
|---|---|---|
| Odak | Süreç, önleme | Ürün, tespit |
| Soru | "Bunu nasıl önleriz?" | "Bu doğru mu?" |
| Kapsam | Tüm lifecycle | Ağırlıklı execution |
| Örnek Aktivite | Requirement review, risk analizi, test stratejisi | Test case çalıştırma, defect bulma |
| Zamanlama | Baştan sona | Genelde build hazır olduktan sonra |

Testing, QA'nın bir parçasıdır — ama QA, Testing'den çok daha geniştir.

---

## 7. QC ile Testing İlişkisi

QC ile Testing yakından ilişkilidir; çoğu organizasyonda "QC = Testing"
gibi kullanılır. Ancak kavramsal olarak:

- QC, kalite kontrolünün genel disiplinidir.
- Testing, bu kontrolü gerçekleştirmenin ana yöntemidir.

Bu repository'de pratik kullanım kolaylığı için QC ve Testing genellikle
iç içe geçmiş kabul edilir; ayrım özellikle "QA vs QC vs Testing"
karşılaştırması gerektiğinde vurgulanır.

---

## 8. Prevention vs Detection

| | Prevention (Önleme) | Detection (Tespit) |
|---|---|---|
| Ne zaman | Hata oluşmadan önce | Hata oluştuktan sonra |
| Örnek | Requirement review, testability analizi, pair review | Test execution, bug bulma |
| Maliyet | Düşük | Yüksek (geç bulunan hata daha pahalıdır) |
| Sahiplik | QA + tüm ekip | Ağırlıklı QA/Test |

QA'nın asıl değeri, detection'dan çok prevention'da ortaya çıkar. Bir
requirement review sırasında yakalanan belirsizlik, production'da
yakalanan bir defect'ten çok daha ucuzdur.

---

## 9. Process-Oriented vs Product-Oriented Yaklaşım

- **Process-oriented (QA)**: "Bu süreç neden bu hatayı üretti? Süreci nasıl
  iyileştiririz?"
- **Product-oriented (QC/Testing)**: "Bu spesifik build/feature doğru
  çalışıyor mu?"

İkisi birbirini tamamlar. Yalnızca process-oriented yaklaşım, gerçek
ürün davranışını doğrulamadan kaliteyi garanti edemez. Yalnızca
product-oriented yaklaşım ise her seferinde aynı hataların tekrar
üretilmesini önleyemez.

---

## 10. QA Engineer Yalnızca Bug Bulan Kişi midir?

Hayır. Bir QA Engineer'ın gerçek katkısı şunları içerir:

- Requirement netliğini sorgulamak
- Acceptance Criteria'nın test edilebilir olup olmadığını değerlendirmek
- Risk bazlı önceliklendirme yapmak
- Test stratejisi ve test design tekniklerini uygulamak
- Defect bulmak ve doğru şekilde raporlamak
- Regression riskini yönetmek
- Release kararına teknik girdi sağlamak
- Production'daki davranışı izlemek (shift-right)

Bug bulmak, QA'nın **sonuçlarından biridir**, tanımı değildir.

---

## 11. Gerçek Software Project Lifecycle İçinde QA

### Requirement Aşaması

QA, requirement yazılırken veya review edilirken devreye girer:

- Requirement açık mı, ölçülebilir mi?
- Acceptance Criteria eksik senaryo bırakıyor mu?
- Testability var mı?

**Örnek:** "Kullanıcı ürünü sepete ekleyebilir" yazılmış ama stok yoksa
ne olacağı, maksimum adet sınırı olup olmadığı belirtilmemiş. QA bu
belirsizliği development başlamadan önce sorar.

### Development Aşaması

QA, kod tamamlanmadan önce bile katkı sağlar:

- API contract'ı review eder
- Test data ihtiyacını planlar
- Test edilebilirlik (testability) için geri bildirim verir
- Erken entegrasyon riskleri hakkında developer ile konuşur

### Testing Aşaması

En görünür QA aktivitesi burada gerçekleşir:

- Test case tasarımı ve çalıştırma
- Functional, regression, exploratory testing
- Defect raporlama ve takip

### Release Aşaması

- Exit Criteria'nın karşılanıp karşılanmadığını değerlendirir
- Known Issues'ı dokümante eder
- Go / No-Go kararına teknik girdi sağlar

### Production Aşaması

- Smoke / stability doğrulaması yapar
- Production loglarını ve davranışını izler (shift-right testing)
- Gerçek kullanıcı etkisini değerlendirir

---

## 12. Common Mistakes

- QA'yı yalnızca "test eden kişi" olarak görmek.
- QC ile Testing'i tamamen ayrı, ilgisiz kavramlar sanmak.
- Prevention aktivitelerini (requirement review, risk analizi) "gerçek iş"
  saymamak.
- QA'nın yalnızca Testing aşamasında devreye girdiğini düşünmek.

---

## 13. Best Practices

- Her Phase'de QA'nın hangi soruyu sorması gerektiğini netleştirin
  (Requirement: "Açık mı?", Development: "Test edilebilir mi?",
  Testing: "Doğru mu?", Release: "Yayınlanabilir mi?", Production: "Stabil
  mi?").
- QA'yı sürecin bir parçası olarak erken dahil edin (shift-left).
- Bug bulmayı değil, riski azaltmayı birincil hedef olarak konumlandırın.

---

## 14. Interview Notes

- "QA ile QC arasındaki fark nedir?" sorusuna yalnızca tanım okuyarak değil,
  process-oriented / product-oriented ayrımıyla cevap verin.
- "QA Engineer'ın günlük işi sadece test mi?" sorusuna lifecycle örneğiyle
  (Requirement → Production) cevap verin.
- Prevention örneği verirken somut bir senaryo kullanın (örn. requirement
  review sırasında yakalanan belirsizlik).

---

## İlgili Konular

- [Verification & Validation](02-VERIFICATION-AND-VALIDATION.md)
- [SDLC & STLC](03-SDLC-AND-STLC.md)
- [QA Role & Scope Boundaries](12-QA-ROLE-AND-SCOPE-BOUNDARIES.md)
