# Interview Notes — Requirement Analysis

**Status: EXPERIENCE**

---

### Question 1

Requirement ile Acceptance Criteria arasındaki fark nedir?

### Short Answer

Requirement neyin geliştirileceğini, Acceptance Criteria bunun ne
zaman "tamamlanmış" sayılacağını tanımlar.

### Detailed Answer

Requirement genellikle daha geniş ve bazen belirsiz olabilir.
Acceptance Criteria, requirement'ı somut ve ölçülebilir alt
koşullara böler. Bir requirement birden fazla AC ile detaylandırılır.

### Example

"Kullanıcı kayıtlı kartıyla hızlı ödeme yapabilmeli" (Requirement) →
"Seçilen kart için CVV istenmemeli" (AC).

### Common Trap

AC'yi requirement'ın tamamı sanmak.

---

### Question 2

İyi bir Acceptance Criteria'nın özellikleri nelerdir?

### Short Answer

Açık, ölçülebilir, test edilebilir, belirsiz olmayan, expected
behaviour içeren ve business rule ile uyumlu olmalıdır.

### Detailed Answer

Bir AC, iki farklı test eden kişinin aynı sonuca (PASS/FAIL)
ulaşmasını sağlamalıdır. Öznel sıfatlar (hızlı, kolay) içermemeli.

### Example

"Sistem hızlı çalışmalı" yerine "belirlenen normal yük altında ilgili
endpoint kabul edilen response-time kriterini sağlamalı."

### Common Trap

Öznel bir sıfat kullanıp somut bir ölçüte bağlamamak.

---

### Question 3

Requirement Clarification neden Shift Left'in bir örneğidir?

### Short Answer

Belirsizliği development başlamadan yakaladığı için hatayı oluşmadan
önler.

### Detailed Answer

Requirement aşamasında sorulan bir soru, development + testing +
defect fix + retest döngüsüne dönüşebilecek bir hatayı en ucuz
noktada önler.

### Example

"Account lock var mı?" sorusunun development öncesi sorulması.

### Common Trap

Requirement clarification'ı gereksiz bürokrasi sanmak.

---

### Question 4

Testable requirement nedir?

### Short Answer

Measurable, observable ve net expected result içeren, nesnel şekilde
doğrulanabilen requirement'tır.

### Detailed Answer

İki farklı kişi aynı senaryoyu test ettiğinde aynı sonuca ulaşmalıdır.
Subjektif ifadeler (kullanıcı dostu, hızlı) testability'yi bozar.

### Example

"Sayfa kullanıcı dostu olmalı" yerine "sepete ekleme en fazla 3
tıklamada tamamlanabilmeli."

### Common Trap

Subjektif bir requirement'ı "zaten anlaşılıyor" diyerek kabul etmek.

---

### Question 5

Technical Validation ile Business Rule Validation arasındaki fark
nedir?

### Short Answer

Technical Validation cevabın formatını, Business Rule Validation
cevabın iş kurallarına uygunluğunu doğrular.

### Detailed Answer

HTTP 200 dönmesi, işlemin teknik olarak başarılı olduğunu gösterir,
business açısından doğru olduğunu göstermez.

### Example

KYC tamamlanmamış kullanıcıya HTTP 200 ile işlem izni verilmesi —
teknik başarı, business hatası.

### Common Trap

HTTP status code'u business doğruluğuyla eş tutmak.

---

### Question 6

Happy Path, Alternative Flow ve Negative Flow arasındaki fark nedir?

### Short Answer

Happy Path en olağan başarılı senaryo, Alternative Flow başka geçerli
bir yol, Negative Flow kontrollü reddedilmesi gereken senaryodur.

### Detailed Answer

Happy Path ve Alternative Flow'da sonuç başarılıdır (yol farklıdır).
Negative Flow'da sistem bilinçli olarak reddetmelidir.

### Example

Checkout'ta kayıtlı kartla ödeme (Happy), yeni kartla ödeme
(Alternative), reddedilen ödeme (Negative).

### Common Trap

Alternative Flow'u düşük öncelikli/opsiyonel sanmak.

---

### Question 7

Edge Case ile Negative Flow arasındaki fark nedir?

### Short Answer

Negative Flow geçersiz bir girdinin reddedilmesidir; Edge Case
geçerli ama sınırda/nadir bir durumun doğru çalışmasıdır.

### Detailed Answer

Negative Flow'da beklenen sonuç red/hata mesajıdır. Edge Case'de
sistem yine de tanımlı ve doğru davranmalıdır.

### Example

Geçersiz kart numarası (Negative) vs. sepette son 1 adet stokla ödeme
(Edge Case).

### Common Trap

İki kavramı aynı kategori altında test etmek.

---

### Question 8

Impact Analysis nedir?

### Short Answer

Bir değişikliğin sistemin hangi alanlarını (web, mobile, API, DB vb.)
etkilediğini belirleme sürecidir.

### Detailed Answer

Küçük görünen bir değişiklik (örn. yeni bir order status) birden
fazla katmanı (UI, mobile parity, notification, analytics) etkileyebilir.

### Example

Order Status modeline yeni durum eklenmesi — web, mobile, admin panel,
notification, analytics etkilenir.

### Common Trap

Değişikliği yalnızca değiştirilen kod dosyasının katmanıyla sınırlı
sanmak.

---

### Question 9

Internal, External ve Third-Party Dependency arasındaki fark nedir?

### Short Answer

Internal aynı organizasyon içinde, External organizasyon dışında
(iş ortağı), Third-Party dışarıdan satın alınan/entegre edilen
servislerdir.

### Detailed Answer

Kontrol edilebilirlik açısından fark eder: Internal dependency'ler
genelde daha kolay koordine edilir, Third-Party'ler organizasyon
kontrolü dışındadır.

### Example

Payment Provider (Third-Party), Inventory servisi (Internal).

### Common Trap

Tüm bağımlılıkları aynı risk seviyesinde görmek.

---

### Question 10

Bir bağımlılık test ortamında unavailable ise QA ne yapmalıdır?

### Short Answer

Mock kullanmak, testi ertelemek veya kapsamı daraltmak arasında
seçim yapıp bunu açıkça raporlamalıdır.

### Detailed Answer

Hangi seçenek kullanılırsa kullanılsın, mock ile alınan sonucun
gerçek entegrasyon sonucu gibi sunulmaması gerekir.

### Example

Provider ayakta değilse mock ile Frontend→API→DB akışı test edilir,
ama gerçek Provider davranışı doğrulanmadığı belirtilir.

### Common Trap

Mock sonucunu gerçek entegrasyon testi gibi sunmak.

---

### Question 11

Change Impact Analysis, Impact Analysis'ten nasıl farklıdır?

### Short Answer

Impact Analysis yeni bir feature'ın etkisini, Change Impact Analysis
var olan bir requirement/implementation'ın değişiminin test
varlıklarına etkisini sorar.

### Detailed Answer

Change Impact Analysis; hangi test case'in, automation'ın, API
contract'ının, documentation'ın güncellenmesi gerektiğini sorgular.

### Example

Kupon kısıtlaması "sepet bazlı"dan "kullanıcı bazlı"ya değiştiğinde
ilgili test case ve automation güncellenmeli.

### Common Trap

Automation'ın "zaten yeşil" olmasını doğru test ettiği anlamına
geldiğini varsaymak.

---

### Question 12

Requirement Review Checklist neden gereklidir?

### Short Answer

Analiz boyutlarının (functional, business rule, error handling,
security vb.) hiçbirinin atlanmamasını sağlar.

### Detailed Answer

Checklist, her maddeyi Evet/Hayır/Belirsiz olarak değerlendirmeyi
sağlar; "Belirsiz" işaretlenen her madde bir clarification sorusuna
dönüşür.

### Example

"Roles/Authorization" maddesi kontrol edilmezse, yetkisiz erişim
senaryosu hiç test edilmeyebilir.

### Common Trap

Checklist'i yalnızca functional behaviour ile sınırlı tutmak.

---

### Question 13

Ambiguous Requirement örneği verir misiniz?

### Short Answer

"Kullanıcı profilini güncelleyebilir" — hangi alanların
güncellenebileceği belirsizdir.

### Detailed Answer

Ambiguous requirement, birden fazla yoruma açık olduğu için farklı
kişiler farklı test kapsamı üretebilir.

### Example

Email güncellemesinin doğrulama gerektirip gerektirmediği belirsizse,
test edenler farklı varsayımlarla ilerler.

### Common Trap

Belirsizliği "muhtemelen şöyledir" diye varsayıp ilerlemek.

---

### Question 14

Undefined State Transition problemi nedir?

### Short Answer

Bir varlığın hangi durumdan hangi duruma geçebileceğinin (veya
geçemeyeceğinin) tanımlanmamasıdır.

### Detailed Answer

Bu problem, geçersiz geçişlerin (örn. DELIVERED → CREATED) sistemde
nasıl engelleneceğinin belirsiz kalmasına yol açar.

### Example

Sipariş durumları tanımlanmış ama `DELIVERED`'den geri dönüşün mümkün
olup olmadığı belirtilmemiş.

### Common Trap

Yalnızca geçerli geçişleri düşünüp geçersiz geçişleri sorgulamamak.

---

### Question 15

Hidden Dependency nasıl tespit edilir?

### Short Answer

Yalnızca requirement metnine değil, ilgili sistemin genel mimarisine
ve gerçek implementasyona bakarak tespit edilir.

### Detailed Answer

Bazı bağımlılıklar requirement'ta hiç yazılmaz (örn. iptal işleminin
refund servisini tetiklemesi); bunlar mimari bilgi veya kod incelemesi
ile ortaya çıkar.

### Example

"Sipariş iptal edilebilir" requirement'ı, arka planda bir ödeme
iade çağrısını tetiklediğini belirtmeyebilir.

### Common Trap

Yalnızca requirement dokümanına güvenip mimariyi hiç sorgulamamak.

---

### Question 16

Missing Boundary problemi test tasarımını nasıl etkiler?

### Short Answer

Boundary Value Analysis uygulanamaz hale gelir çünkü sınır değerler
tanımsızdır.

### Detailed Answer

"Kullanıcı adı bir uzunluk sınırına sahip olmalı" gibi bir requirement,
minimum/maksimum belirtilmediği sürece test edilebilir değildir.

### Example

Minimum/maksimum karakter sayısı netleşmeden BVA test verisi
(7,8,9...) oluşturulamaz.

### Common Trap

Sınır belirtilmeden "makul bir değer" varsayıp test etmek.

---

### Question 17

Requirement analizinde "Backward Compatibility" neden kontrol
edilmelidir?

### Short Answer

Bir değişikliğin mevcut kullanıcıları veya entegrasyonları
bozmadığından emin olmak için.

### Detailed Answer

API contract veya davranış değişikliği, eski client'ların (mobile
app'in eski versiyonu gibi) çalışmasını bozabilir.

### Example

API response'undan bir alan kaldırıldığında, o alana bağımlı eski
mobile versiyonu crash olabilir.

### Common Trap

Yalnızca en güncel client'ı test edip eski versiyonları göz ardı
etmek.

---

### Question 18

Requirement Clarification sürecinin çıktısı nasıl dokümante
edilmelidir?

### Short Answer

Requirement güncellenerek veya yeni Acceptance Criteria eklenerek.

### Detailed Answer

Sözlü olarak alınan bir cevap, yazılı hale getirilmezse ekip içinde
kaybolur ve tutarsız varsayımlara yol açar.

### Example

"Account lock 5 başarısız denemeden sonra 15 dakika" cevabı, AC
olarak yazılı hale getirilmelidir.

### Common Trap

Clarification cevaplarını yalnızca sözlü/toplantı notunda bırakmak.

---

## İlgili Konular

- [01-REQUIREMENT-ANALYSIS README](README.md)
- [Common Requirement Problems](11-COMMON-REQUIREMENT-PROBLEMS.md)
