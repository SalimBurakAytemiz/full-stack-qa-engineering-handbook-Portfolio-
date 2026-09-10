# Interview Notes — Risk-Based Testing

**Status: EXPERIENCE**

---

### Question 1

Risk ile Severity arasındaki fark nedir?

### Short Answer

Risk proaktif bir değerlendirmedir (test öncesi), Severity reaktif bir
değerlendirmedir (defect bulunduktan sonra).

### Detailed Answer

Risk, bir şeyin gerçekleşme olasılığı ile etkisinin birleşimidir ve
test planlamasını yönlendirir. Severity, bulunan bir defect'in
ciddiyet derecesidir.

### Example

"Ödeme alanı yüksek risklidir" (Risk) vs. "Bu bulunan bug Critical
severity'dir" (Severity).

### Common Trap

İkisini aynı anlamda kullanmak.

---

### Question 2

Risk Priority nasıl hesaplanır?

### Short Answer

Basit yaklaşım: Probability × Impact; ancak bu tek matematiksel model
değildir.

### Detailed Answer

Organizasyonlar Exposure, ağırlıklandırma veya kategorik matris gibi
farklı yaklaşımlar kullanabilir. Önemli olan tutarlılık ve
gerekçelendirilebilirlik.

### Example

Payment failure (Medium Probability, Critical Impact) → High Priority.

### Common Trap

Probability × Impact'in tek doğru formül olduğunu düşünmek.

---

### Question 3

Exposure nedir, Impact'ten nasıl farklıdır?

### Short Answer

Exposure, riskin etkilediği kullanıcı/sistem yüzeyinin büyüklüğüdür.

### Detailed Answer

Aynı Impact'e sahip iki risk, farklı Exposure'a sahip olabilir —
biri tüm kullanıcıları, diğeri yalnızca birkaç admin kullanıcıyı
etkileyebilir.

### Example

Checkout bug'ı (yüksek Exposure) vs. nadir kullanılan raporlama
ekranı bug'ı (düşük Exposure).

### Common Trap

Exposure'ı Impact ile aynı kavram sanmak.

---

### Question 4

Test priority neden yalnızca Probability'ye göre belirlenmez?

### Short Answer

Çünkü düşük olasılıkla gerçekleşen ama kritik etkili bir hata, sık
karşılaşılan ama düşük etkili bir hatadan daha önceliklidir.

### Detailed Answer

Priority, Probability ve Impact'in birleşimine bakar; yalnızca sıklığa
bakmak yanıltıcıdır.

### Example

Payment failure (Medium Probability, Critical Impact) vs. cosmetic
issue (High Probability, Low Impact) — payment daha öncelikli.

### Common Trap

En sık karşılaşılan senaryoyu otomatik olarak en öncelikli sanmak.

---

### Question 5

Risk Matrix nasıl kullanılır?

### Short Answer

Probability ve Impact'i iki boyutlu bir tabloda kesiştirerek
kategorik bir öncelik (Low/Medium/High/Critical) üretir.

### Detailed Answer

Risk Matrix, farklı riskleri görsel ve karşılaştırılabilir hale
getirir; test kaynaklarının nereye yoğunlaştırılacağına karar
vermeyi kolaylaştırır.

### Example

Unauthorized Access (Low Probability, Critical Impact) → High
Priority.

### Common Trap

Matrix'i bir kez oluşturup sistem değiştikçe güncellememek.

---

### Question 6

Test Prioritization'da Business Criticality dışında hangi faktörler
kullanılır?

### Short Answer

Change Frequency, Integration Complexity, Historical Defects,
Financial/Security/Regulatory Impact gibi faktörler.

### Detailed Answer

Bu faktörler birlikte değerlendirilerek göreceli bir sıralama
yapılır; tek bir faktöre dayanmak eksik bir değerlendirme yaratır.

### Example

Sık değişen ve geçmişte çok defect üretmiş bir alan, düşük Business
Criticality'ye sahip olsa bile daha yüksek öncelik alabilir.

### Common Trap

Yalnızca Business Criticality'ye bakıp diğer faktörleri atlamak.

---

### Question 7

"Her şeyi aynı derinlikte test etmek" neden gerçekçi bir yaklaşım
değildir?

### Short Answer

Kaynak israfına, yanlış güvene ve ölçeklenemeyen bir sürece yol açar.

### Detailed Answer

Sınırlı zaman/kaynakla her senaryoyu eşit derinlikte test etmek,
kritik alanların yeterince test edilmemesine neden olabilir.

### Example

Footer linkine ödeme akışıyla aynı efor harcanırsa, ödeme yeterince
derinlemesine test edilemeyebilir.

### Common Trap

"Kapsamlı test" ile "her şeyi eşit test etmek"i aynı şey sanmak.

---

### Question 8

Risk-Based Test Planning'de değişmemiş ama kritik bir alan nasıl ele
alınmalıdır?

### Short Answer

Tamamen atlanmamalı, hafifletilmiş bir smoke/sanity kontrolüyle
doğrulanmalıdır.

### Detailed Answer

Değişmemiş kritik alanlar, yeni bir regresyon riski taşımasa da,
sistemin bütünlüğü açısından temel düzeyde kontrol edilmelidir.

### Example

Login değişmemişse bile, release öncesi temel bir smoke testiyle
doğrulanır.

### Common Trap

"Zaten çalışıyordu" diyerek kritik ama değişmemiş bir alanı tamamen
atlamak.

---

### Question 9

Risk Register nedir, ne işe yarar?

### Short Answer

Belirlenen tüm risklerin değerlendirmeleriyle birlikte kayıt altına
alındığı, test planlamasına girdi olan dokümandır.

### Detailed Answer

Her risk için Probability, Impact, Priority, Test Approach ve
Mitigation/Validation bilgisi tutulur; release kararına kanıt
sağlar.

### Example

"Aynı kupon kodu birden fazla kez uygulanabilir" riski, Test Approach
ve Status ile birlikte kayıt altına alınır.

### Common Trap

Risk Register'ı bir kez oluşturup güncel tutmamak.

---

### Question 10

Functional testler PASS oldu, release güvenli midir?

### Short Answer

Hayır; Functional PASS yalnızca tanımlanan senaryoların doğru
çalıştığını gösterir, release'in tüm risklerden arınmış olduğunu
göstermez.

### Detailed Answer

Release Risk değerlendirmesi; open defects, untested areas,
performance concerns, security concerns gibi ek boyutları da
kapsamalıdır.

### Example

Tüm functional testler PASS olsa da, tablet ekranında hiç test
yapılmamışsa bu bir untested area riskidir.

### Common Trap

Release kararını yalnızca otomasyon/functional test sonucuna
dayandırmak.

---

### Question 11

Release Risk değerlendirmesinde "Known Issues" neden önemlidir?

### Short Answer

Bilinen ama kabul edilmiş sorunların şeffaf şekilde dokümante
edilmesini sağlar.

### Detailed Answer

Known Issues dokümante edilmezse, business release kararını eksik
bilgiyle verir ve sorun production'da "sürpriz" olarak ortaya çıkar.

### Example

Fiyat yuvarlama farkının business tarafından bilinçli olarak kabul
edilmesi ve dokümante edilmesi.

### Common Trap

QA'nın kendi kararıyla bir sorunu "önemsiz" ilan edip business'a hiç
bildirmemesi.

---

### Question 12

Historical Defects verisi test önceliklendirmesinde nasıl kullanılır?

### Short Answer

Geçmişte sık defect üreten alanlar, gelecekte de riskli kabul edilir
ve önceliklendirilir.

### Detailed Answer

Bu veri, Probability değerlendirmesinin somut bir girdisidir; sezgiye
değil geçmiş kanıta dayanır.

### Example

Geçmiş 3 release'de en çok defect çıkan modül, yeni release'de de
öncelikli test edilir.

### Common Trap

Historical Defect verisini hiç incelemeden önceliklendirme yapmak.

---

## İlgili Konular

- [02-RISK-BASED-TESTING README](README.md)
- [00-QA-FOUNDATIONS — Risk-Based Testing Overview](../00-QA-FOUNDATIONS/13-RISK-BASED-TESTING-OVERVIEW.md)
