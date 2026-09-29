# Full Stack QA Engineering Handbook & Portfolio
## Documentation Standard

Bu repository'nin amacı; Full Stack QA Engineering kapsamında kullanılan
metodolojileri, araçları, test tekniklerini ve gerçek QA çalışma süreçlerini
Türkçe açıklamalar ve İngilizce teknik terminoloji ile birlikte öğretmek,
uygulamak ve kanıtlamaktır.

---

## Temel Prensip

Her konu üç amacı aynı anda karşılamalıdır:

1. KNOWLEDGE
   Konunun ne olduğunu öğretmek.

2. PRACTICE
   Konunun nasıl uygulandığını çalışan veya uygulanabilir örneklerle göstermek.

3. EVIDENCE
   QA bilgisinin test sonucu, kod, rapor, log, screenshot, video veya başka
   teknik kanıtlarla doğrulanmasını sağlamak.

---

## Dil Standardı

Ana anlatım dili:

Türkçe

Teknik terminoloji:

İngilizce

Örnek:

- İstek Gövdesi (Request Body)
- Cevap Gövdesi (Response Body)
- Şema Doğrulama (Schema Validation)
- Sınır Değer Analizi (Boundary Value Analysis)
- İzlenebilirlik (Traceability)
- Yetkilendirme (Authorization)
- Kimlik Doğrulama (Authentication)

Kod içerisindeki teknik isimler İngilizce kullanılacaktır.

---

## Knowledge Status

Her teknik konu aşağıdaki statülerden biriyle işaretlenecektir.

### EXPERIENCE

Gerçek profesyonel projelerde doğrudan uygulanan bilgi veya teknoloji.

### PARTICIPATED

Gerçek profesyonel projede süreç içerisinde yer alınmış veya katkı sağlanmış,
ancak ana uygulayıcı olunmamış bilgi veya teknoloji.

### PRACTICED

Repository içerisindeki kontrollü QA Lab ortamında uygulanmış ve doğrulanmış
bilgi veya teknoloji.

### LEARNING

Henüz hands-on seviyesinde uygulanmamış veya geliştirilmekte olan bilgi veya
teknoloji.

---

## Standart Konu Yapısı

Repository içerisindeki teknik konular mümkün olduğunca aşağıdaki yapıya
uygun hazırlanmalıdır.

### 1. Tanım / Definition

Kavram veya teknoloji nedir?

### 2. Amaç / Purpose

QA açısından neden kullanılır?

### 3. Terminoloji / Terminology

Konuyla ilgili İngilizce teknik terimler ve Türkçe açıklamaları.

### 4. QA Responsibility

QA Engineer bu alanda neyi yapmalı veya doğrulamalıdır?

### 5. Scope Boundary

Bu noktadan sonra hangi görev Developer, DevOps, DBA, Security Engineer veya
başka bir role aittir?

### 6. Test Risk

Bu kontrol yapılmazsa hangi hata veya kalite problemi oluşabilir?

### 7. Prerequisites

Uygulama için gerekli ortam, araç veya bilgiler.

### 8. How To

Sıfırdan nasıl uygulanır?

### 9. Example

Gerçekçi QA örneği.

### 10. Positive / Happy Path

Başarılı olması gereken senaryo.

### 11. Negative Scenario

Sistemin kontrollü şekilde reddetmesi gereken senaryo.

### 12. Edge Case

Normal kullanımın dışında kalan ancak gerçekleşmesi mümkün senaryolar.

### 13. Boundary

Minimum, maximum ve sınır değer kontrolleri.

### 14. Implementation

Manuel işlem, otomasyon kodu veya teknik uygulama.

### 15. Code Explanation

Kodun QA açısından önemli bölümlerinin açıklaması.

### 16. Expected Result

Beklenen davranış.

### 17. Actual Result

Gerçekleşen davranış.

### 18. Evidence

Screenshot, video, log, report, API response, database result veya diğer
teknik kanıtlar.

### 19. Common Mistakes

Sık yapılan hatalar ve yanlış yaklaşımlar.

### 20. Best Practices

Güncel ve sürdürülebilir yaklaşım.

### 21. Interview Notes

Teknik mülakatta bilinmesi gereken temel ve ileri seviye bilgiler.

---

## Evidence Rule

Gerçekte çalıştırılmamış bir test PASS olarak gösterilemez.

Gerçekte üretilmemiş:

- Screenshot
- Video
- Log
- Performance sonucu
- Automation report
- Test sonucu

üretilmiş gibi gösterilemez.

Çalıştırılmamış işlemler:

NOT EXECUTED

ENVIRONMENT REQUIRED

EVIDENCE PENDING

gibi açık durumlarla belirtilmelidir.

---

## Experience Integrity Rule

Repository'nin amacı kullanıcının sahip olmadığı deneyimi varmış gibi
göstermek değildir.

Amaç:

Gerçek deneyimi kanıtlamak,

eksik bilgiyi öğretmek,

öğrenilen bilgiyi uygulamak,

uygulanan bilgiyi PRACTICED seviyesine taşımaktır.

---

## QA Scope Rule

Repository yalnızca bir aracın nasıl kullanıldığını anlatmayacaktır.

Her bölüm şu soruya cevap vermelidir:

"Bir QA Engineer bu teknoloji veya metodoloji ile hangi kalite problemini
tespit etmeye veya önlemeye çalışır?"

QA sorumluluğu ile Developer, DBA, DevOps, Security Engineer ve diğer teknik
rollerin sorumlulukları birbirinden ayrılmalıdır.
