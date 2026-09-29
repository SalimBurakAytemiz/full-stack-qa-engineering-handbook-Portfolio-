# Automation Candidate Analysis

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Her şeyi otomatize edelim" yaklaşımı,
`00-QA-FOUNDATIONS/COMMON-MISTAKES.md`'de anlatılan temel bir hatadır.
Bu dosya, bir Test Case'in otomasyona **uygun olup olmadığını**
sistematik olarak değerlendirmeyi öğretir.

---

## 2. Her Test Case Automate Edilmez

Bir Test Case'in var olması, onun otomatize edilmesi gerektiği
anlamına gelmez. Bazı test case'ler manuel veya exploratory testte
kalmalıdır — çünkü otomasyonun getirdiği fayda, bakım maliyetini
karşılamayabilir.

---

## 3. Automation Candidate Değerlendirme Faktörleri

### Repetition (Tekrar Sıklığı)

Bu test, ne sıklıkla çalıştırılacak? Her release'de mi, yoksa yalnızca
bir kez mi?

### Stability (Kararlılık)

Test edilen özellik sık değişiyor mu? Sık değişen bir UI/akış,
otomasyonun sürekli kırılmasına (flaky/broken test) yol açar.

### Business Criticality (İş Kritikliği)

Bu senaryo, işin temel akışının (örn. checkout) bir parçası mı?

### Regression Value (Regresyon Değeri)

Bu test, gelecekteki değişikliklerde geriye dönük bir bozulmayı
yakalama potansiyeli taşıyor mu?

### Execution Frequency (Çalıştırma Sıklığı)

Bu test manuel olarak ne sıklıkla çalıştırılıyor? Sık çalıştırılan
manuel testler, otomasyon için güçlü adaylardır.

### Data Complexity (Veri Karmaşıklığı)

Bu testin çalışması için gereken veri hazırlığı ne kadar karmaşık?
Aşırı karmaşık veri hazırlığı, otomasyonun kurulum (setup) maliyetini
artırır.

### Maintenance Cost (Bakım Maliyeti)

Bu test otomatize edildiğinde, gelecekte ne kadar bakım gerektirecek?

### Environment Dependency (Ortam Bağımlılığı)

Bu test, kararsız veya erişimi zor bir ortama/servise bağımlı mı?

### Human Judgement Requirement (İnsan Değerlendirmesi Gereksinimi)

Bu testin sonucu, öznel bir değerlendirme (görsel tasarım kalitesi,
kullanıcı deneyimi hissi) gerektiriyor mu?

---

## 4. Örnek Karşılaştırma Tablosu

| Test Case | Repetition | Stability | Business Criticality | Data Complexity | Human Judgement | Automation Candidate? |
|---|---|---|---|---|---|---|
| Login — geçerli credential ile başarılı giriş | Yüksek (her release) | Yüksek (nadiren değişir) | Yüksek | Düşük | Yok | **Evet — Güçlü Aday** |
| Checkout — kayıtlı kartla ödeme tamamlama | Yüksek (her release) | Orta (ödeme akışı zaman zaman değişir) | Yüksek | Orta | Yok | **Evet — Güçlü Aday** |
| Yeni bir promosyon banner'ının görsel tasarımı doğru mu | Düşük (yalnızca bu kampanya için) | Düşük (kampanya bazlı, sık değişir) | Düşük | Düşük | Yüksek (görsel/estetik değerlendirme) | **Hayır — Manuel/Exploratory** |
| Farklı ekran boyutlarında responsive davranış | Orta | Orta | Orta | Orta | Yüksek (görsel değerlendirme) | **Kısmi — Kritik breakpoint'ler otomatize edilebilir, detaylı görsel inceleme manuel kalmalı** |
| Ürün arama sonuçlarının sıralaması | Yüksek | Yüksek | Orta | Düşük | Düşük | **Evet — Aday** |
| Tek seferlik veri migration doğrulaması | Çok Düşük (bir kereye mahsus) | Yok (tekrar çalışmayacak) | Yüksek (o anlık) | Yüksek | Orta | **Hayır — Manuel, tek seferlik** |

---

## 5. Automation Candidate = Bütün Regression Demek Değildir

**Yanlış varsayım:** "Regression suite'indeki her test otomatize
edilmelidir."

**Doğru yaklaşım:** Regression suite'i içindeki test case'ler bile,
yukarıdaki faktörlere göre değerlendirilmelidir. Örneğin, regression
suite'inde yer alan ama Data Complexity'si çok yüksek ve Repetition'ı
düşük bir senaryo, otomatize edilmeden manuel regression'da kalabilir.

Automation Candidate seçimi, "bu test suite'in bir parçası mı" sorusundan
bağımsız, **kendi başına** yapılan bir değerlendirmedir.

---

## 6. Common Mistakes

- Her test case'i "regression suite'inde olduğu için" otomatik olarak
  otomasyon adayı saymak.
- Yalnızca "kolay otomatize edilebilir" testleri seçip, kritik ama
  zor testleri (yüksek Data Complexity) tamamen manuel bırakmak
  (oysa bunlar için setup yatırımı yapılabilir).
- Human Judgement gerektiren testleri (görsel/estetik) zorla
  otomatize etmeye çalışmak.

---

## 7. Best Practices

- Her yeni test case için Automation Candidate değerlendirmesini test
  tasarımının bir parçası yapın.
- Yüksek Repetition + Yüksek Stability + Yüksek Business Criticality
  kombinasyonuna sahip testleri önceliklendirin.
- Human Judgement gerektiren testleri bilinçli olarak manuel/exploratory
  kategorisinde tutun.

---

## 8. Interview Notes

- "Bir test case'i otomatize edip etmeyeceğinize nasıl karar
  verirsiniz?" sorusuna en az 4-5 faktörü (Repetition, Stability,
  Business Criticality, Maintenance Cost) sayarak cevap verin.
- "Her regression testi otomatize edilmeli mi?" sorusuna hayır
  diyerek, Automation Candidate değerlendirmesinin ayrı bir karar
  olduğunu açıklayın.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Common Mistakes](../00-QA-FOUNDATIONS/COMMON-MISTAKES.md)
- [examples/AUTHENTICATION-FEATURE — Automation Candidates](examples/AUTHENTICATION-FEATURE/13-AUTOMATION-CANDIDATES.md)
- [01-REQUIREMENT-ANALYSIS — Change Impact Analysis](../01-REQUIREMENT-ANALYSIS/09-CHANGE-IMPACT-ANALYSIS.md)
