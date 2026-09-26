# Requirement Types

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Requirement" tek bir şey değildir. Business Requirement, Functional
Requirement, User Story, Acceptance Criteria, Business Rule ve
Constraint — hepsi farklı amaçlara hizmet eder ve QA'nın her birini
farklı şekilde okuması gerekir. Bu dosyanın amacı, bu türleri karıştırmadan
ayırt etmeyi öğretmektir.

---

## 2. Business Requirement

**Definition:** Ürünün business açısından karşılaması gereken üst
seviye ihtiyaç.

**QA Perspective:** QA, business requirement'ı doğrudan test etmez;
ama alt seviyedeki functional requirement'ların bu ihtiyacı gerçekten
karşılayıp karşılamadığını değerlendirir.

**Example:** "Şirket, kullanıcıların online ödeme yapabilmesini
istiyor."

**Common Mistake:** Business Requirement'ı doğrudan bir test case'e
çevirmeye çalışmak — bu seviye çok soyuttur, önce functional
requirement'a indirgenmelidir.

---

## 3. Functional Requirement

**Definition:** Sistemin somut olarak ne yapması gerektiğini tanımlayan
gereksinim.

**QA Perspective:** Test tasarımının ana girdisidir; genellikle
doğrudan test scenario/case üretimine kaynaklık eder.

**Example:** "Kullanıcı geçerli kart bilgileriyle ödeme yapabilmeli."

**Common Mistake:** Functional requirement'ı yalnızca "olumlu" senaryo
olarak okumak, hata durumlarını (negative flow) requirement'ın parçası
saymamak.

---

## 4. Non-Functional Requirement

**Definition:** Sistemin *nasıl* davranması gerektiğini tanımlayan,
performans, güvenlik, kullanılabilirlik gibi nitelik gereksinimleri.

**QA Perspective:** Genellikle ölçülebilir bir threshold gerektirir;
threshold belirtilmemişse requirement test edilebilir değildir.

**Example:** "Ödeme işlemi, belirlenen normal yük altında kabul edilen
response-time kriterini sağlamalıdır."

**Common Mistake:** Non-functional requirement'ı "iyi olsun" gibi
subjektif bir ifadeyle bırakıp ölçülebilir bir kritere bağlamamak.

---

## 5. Technical Requirement

**Definition:** Sistemin teknik altyapısına veya implementasyon
kısıtlarına dair gereksinim.

**QA Perspective:** QA bu gereksinimi genelde implementasyondan çok
"bu kısıt test stratejisini nasıl etkiliyor" açısından okur.

**Example:** "Ödeme servisi, mevcut microservice mimarisiyle uyumlu
olmalı ve REST API üzerinden çağrılmalı."

**Common Mistake:** Technical requirement'ı business requirement ile
karıştırıp "bu neden gerekli" sorusunu atlamak.

---

## 6. User Story

**Definition:** Bir özelliğin kullanıcı perspektifinden, genellikle
"Bir [rol] olarak, [ihtiyaç] istiyorum, böylece [fayda] elde ederim"
formatında yazılan kısa anlatımı.

**QA Perspective:** User Story, genellikle Acceptance Criteria ile
birlikte gelir; QA, story'nin arkasındaki gerçek ihtiyacı Acceptance
Criteria üzerinden doğrular.

**Example:** "Bir kayıtlı kullanıcı olarak, kayıtlı kartımla hızlıca
ödeme yapmak istiyorum, böylece kart bilgimi tekrar girmem gerekmez."

**Common Mistake:** User Story'yi tek başına yeterli bir test girdisi
sanmak; Acceptance Criteria olmadan story çoğu zaman eksik kalır.

---

## 7. Acceptance Criteria

**Definition:** Bir User Story veya Requirement'ın "tamamlanmış/kabul
edilmiş" sayılabilmesi için karşılaması gereken somut, ölçülebilir
koşullar.

**QA Perspective:** Test case tasarımının en doğrudan kaynağıdır.

**Example:** "Kayıtlı bir kart seçildiğinde, kullanıcı CVV girmeden
ödemeyi tamamlayabilmelidir."

**Common Mistake:** Acceptance Criteria'yı requirement'ın **tamamı**
sanmak — bkz. bölüm 9.

---

## 8. Business Rule

**Definition:** Sistemin uyması gereken, genellikle birden fazla
requirement'ı etkileyen iş kuralı.

**QA Perspective:** Business Rule'lar çoğu zaman UI'da görünmez; API
ve database seviyesinde de doğrulanmalıdır (bkz.
`05-BUSINESS-RULE-ANALYSIS.md`).

**Example:** "KYC (kimlik doğrulama) tamamlanmamış kullanıcı, 1000
TL üzerinde işlem yapamaz."

**Common Mistake:** Business Rule'u yalnızca bir ekranın validasyonu
sanıp, kuralın API/backend seviyesinde de uygulanıp uygulanmadığını
kontrol etmemek.

---

## 9. Constraint

**Definition:** Sistemin veya sürecin uymak zorunda olduğu, genellikle
değiştirilemeyen sınır veya kısıtlama.

**QA Perspective:** Constraint'ler test kapsamının sınırlarını (nelerin
test edilmeyeceğini) belirler.

**Example:** "Sistem yalnızca Türkiye'deki kullanıcılara hizmet
verecek; uluslararası ödeme desteklenmeyecek."

**Common Mistake:** Constraint'i göz ardı edip, kapsam dışı bir
senaryoyu (örn. uluslararası kart) gereksiz yere test etmeye çalışmak.

---

## 10. Requirement ile Acceptance Criteria Aynı Şey midir?

**Hayır.** Bu, en sık yapılan karışıklıklardan biridir.

- **Requirement**, *neyin* geliştirileceğini tanımlar — genellikle
  daha geniş ve bazen belirsiz olabilir.
- **Acceptance Criteria**, requirement'ın *ne zaman* "tamamlanmış"
  sayılacağını tanımlayan, somut ve ölçülebilir alt koşullardır.

**Örnek:**

> **Requirement:** "Kullanıcı kayıtlı kartıyla hızlı ödeme yapabilmeli."
>
> **Acceptance Criteria:**
> - Kayıtlı kart listeden seçilebilmeli.
> - Seçilen kart için CVV istenmemeli.
> - Ödeme onaylandığında sipariş `PAID` durumuna geçmeli.
> - Kart süresi dolmuşsa, kart seçilemez durumda gösterilmeli.

Bir requirement, birden fazla Acceptance Criteria ile detaylandırılır.
Acceptance Criteria olmadan requirement, test tasarımı için genellikle
yetersizdir — bu yüzden 02. dosyada bu konu ayrıca derinleştirilir.

---

## 11. Common Mistakes

- Requirement türlerini birbirinin yerine kullanmak (örn. bir Business
  Rule'u Constraint sanmak).
- Acceptance Criteria'yı requirement'ın tamamı sanmak.
- Non-Functional Requirement'ları "sonra bakarız" diyerek erteleyip
  hiç threshold tanımlamamak.

---

## 12. Best Practices

- Her requirement'ı okurken "bu hangi türde" sorusunu sorun — bu,
  doğru analiz yöntemini (Verification, Testability, Business Rule
  analizi vb.) seçmenize yardımcı olur.
- User Story'lerin mutlaka Acceptance Criteria ile birlikte geldiğinden
  emin olun.
- Constraint'leri test kapsamı dokümanında açıkça belirtin.

---

## 13. Interview Notes

- "Requirement ile Acceptance Criteria arasındaki fark nedir?" sorusuna
  somut bir örnekle (Requirement → birden fazla AC) cevap verin.
- "Business Rule ile Functional Requirement'ı nasıl ayırt edersiniz?"
  sorusuna, Business Rule'ların genellikle birden fazla requirement'ı
  etkileyen ve UI dışında da (API/DB) doğrulanması gereken kurallar
  olduğunu vurgulayarak cevap verin.

---

## İlgili Konular

- [Acceptance Criteria](02-ACCEPTANCE-CRITERIA.md)
- [Business Rule Analysis](05-BUSINESS-RULE-ANALYSIS.md)
- [Requirement Review Checklist](10-REQUIREMENT-REVIEW-CHECKLIST.md)
