# Interview Notes — Test Design

**Status: EXPERIENCE**

---

### Question 1

Test Condition, Test Scenario ve Test Case arasındaki fark nedir?

### Short Answer

Condition bir koşulu, Scenario bu koşulu kullanıcı davranışıyla
somutlaştırır, Case ise çalıştırılabilir tüm detayları içerir.

### Detailed Answer

Condition en soyut seviyedir ("Invalid credentials"), Scenario onu bir
cümleye döker ("User attempts login with invalid password"), Case ise
Precondition/Data/Steps/Expected Result içeren tam bir dokümandır.

### Example

Condition: "Invalid credentials" → Scenario: "Geçersiz password ile
login denemesi" → Case: tam adımlarıyla test case.

### Common Trap

Bu üç terimi birbirinin yerine kullanmak.

---

### Question 2

Equivalence Partitioning test sayısını nasıl azaltır?

### Short Answer

Aynı davranışı gösteren değerleri gruplayıp her gruptan yalnızca bir
temsilci test ederek.

### Detailed Answer

18-65 yaş aralığının her değerini tek tek test etmek yerine, geçerli
ve geçersiz partition'lardan birer temsilci (örn. 30, 10, 80) test
edilir.

### Example

48 farklı yaş değeri yerine 3 test yeterli olur.

### Common Trap

Farklı davranış üreten değerleri (örn. DISABLED vs LOCKED) aynı
partition'a koymak.

---

### Question 3

2-point boundary ile 1-point boundary arasındaki fark nedir?

### Short Answer

2-point hem sınırı hem sınırın hemen dışını test eder, 1-point
yalnızca sınırın kendisini test eder.

### Detailed Answer

2-point (7,8,9,19,20,21) `>`/`>=` tipi hataları daha güvenilir
yakalar; 1-point (8,20) daha hafif ama daha az güvenli bir yaklaşımdır.

### Example

8-20 karakter kuralında 2-point: 7,8,9,19,20,21.

### Common Trap

Yalnızca sınır değerlerini test edip hemen dışındaki değerleri
atlamak.

---

### Question 4

Decision Table Testing ne zaman kullanılır?

### Short Answer

Birden fazla koşulun birlikte sonucu belirlediği durumlarda.

### Detailed Answer

Her koşul kombinasyonu (Account Active, KYC Completed, Balance
Sufficient gibi) sistematik bir tabloda eşleştirilir, hiçbir
kombinasyon atlanmaz.

### Example

3 koşul × 2 değer = 8 kombinasyonluk withdraw-allowed tablosu.

### Common Trap

Koşulları yalnızca tek tek test edip kombinasyonlarını hiç
denememek.

---

### Question 5

State Transition Testing'de "invalid transition" neden test
edilmelidir?

### Short Answer

Sistemin izin vermemesi gereken bir durum değişikliğini gerçekten
engellediğini doğrulamak için.

### Detailed Answer

Yalnızca geçerli geçişleri test etmek, sistemin geçersiz bir geçişi
(örn. DELIVERED → CREATED) yanlışlıkla kabul edip etmediğini
kaçırabilir.

### Example

Teslim edilmiş bir siparişin API üzerinden doğrudan CREATED durumuna
döndürülmeye çalışılması.

### Common Trap

Yalnızca "mutlu yol" geçişlerini test edip invalid transition'ları
hiç denememek.

---

### Question 6

Scenario-Based Testing, bileşen bazlı testlerden nasıl farklıdır?

### Short Answer

Bileşen testleri tek bir alanı, Scenario-Based Testing birden fazla
bileşenin birlikte doğru çalışmasını doğrular.

### Detailed Answer

Her bileşen ayrı ayrı PASS olsa bile, bileşenler arası veri aktarımı
(örn. sepetteki tutarın ödemeye doğru aktarılması) yalnızca uçtan uca
bir senaryoyla doğrulanabilir.

### Example

Product → Cart → Payment → Order → Notification akışının bütün
olarak test edilmesi.

### Common Trap

Yalnızca bileşen testlerine güvenip hiç uçtan uca senaryo yazmamak.

---

### Question 7

Error Guessing rastgele test etmek midir?

### Short Answer

Hayır; deneyime dayalı, hedefli ve tekrarlanabilir bir tekniktir.

### Detailed Answer

Error Guessing, geçmiş deneyimden türetilen somut hipotezleri (örn.
"çift tıklama duplicate order yaratır mı") test eder; amaçsız
gezinme değildir.

### Example

Double-click, refresh during payment, expired session gibi bilinen
senaryoların sistematik olarak denenmesi.

### Common Trap

Error Guessing'i plansız/rastgele test etmekle karıştırmak.

---

### Question 8

Pairwise Testing'in amacı nedir?

### Short Answer

Makul bir maliyetle yüksek bir kapsam elde etmek; tüm kombinasyonları
test etmenin maliyetinden kaçınmak.

### Detailed Answer

Çoğu hata iki değişkenin etkileşiminden kaynaklanır; Pairwise, her
ikili kombinasyonu en az bir kez kapsayarak test sayısını (örn. 54
yerine 9-12) azaltır.

### Example

Browser × OS × User × Payment (54 kombinasyon) yerine pairwise
tablo.

### Common Trap

Pairwise'ın riski sıfıra indirdiğini düşünmek.

---

### Question 9

Null ile Empty arasındaki fark neden önemlidir?

### Short Answer

Sistem bu ikisini farklı davranışlarla ele alabilir; ikisi ayrı ayrı
test edilmelidir.

### Detailed Answer

Bir sistem null alanı "belirtilmemiş", boş string'i "geçersiz" olarak
işleyebilir — bu farklı davranışlar test edilmezse bir kategori
tamamen kaçırılabilir.

### Example

Opsiyonel bir "orta isim" alanına null gönderme vs. boş string
gönderme.

### Common Trap

Null ve Empty'yi aynı test verisi kategorisi sanmak.

---

### Question 10

Test data tasarlarken gerçek müşteri verisi neden kullanılmaz?

### Short Answer

Yasal (KVKK/GDPR) ve güvenlik riskleri taşıdığı için.

### Detailed Answer

Test ortamları genellikle production kadar sıkı güvenliğe sahip
değildir; gerçek veri kullanmak hem regülasyon ihlali hem sızıntı
riski yaratır.

### Example

Sentetik `test.user001@example.com` kullanmak, gerçek bir müşteri
emaili yerine.

### Common Trap

"Elimde zaten gerçek veri var" diyerek onu test ortamında kullanmak.

---

### Question 11

Positive, Negative, Edge ve Boundary arasındaki fark nedir?

### Short Answer

Positive geçerli girdi, Negative geçersiz girdi, Boundary sınır
değerler, Edge Case geçerli ama sıra dışı durumdur.

### Detailed Answer

Money transfer örneğinde: 1000 TL (Positive), -500 TL (Negative), 10
TL/9 TL (Boundary), bakiye=tutar tam eşitliği (Edge Case).

### Example

Bkz. `10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md` karşılaştırma tablosu.

### Common Trap

Edge Case'i her zaman bir Boundary değeriyle eş tutmak.

---

### Question 12

Traceability zinciri Requirement'tan Test Case'e nasıl kurulur?

### Short Answer

REQ → AC → Test Scenario → Test Case → Execution şeklinde, her adım
bir öncekine referans vererek.

### Detailed Answer

Bu zincir, requirement değiştiğinde etkilenen test case'lerin hızlıca
bulunmasını ve coverage'ın kanıtlanmasını sağlar.

### Example

REQ-AUTH-001 → AC-AUTH-001 → TS-AUTH-001 → TC-AUTH-HP-001.

### Common Trap

Test case'leri hangi requirement'a bağlı olduğunu belirtmeden
yazmak.

---

### Question 13

Automation Candidate değerlendirmesinde hangi faktörler kullanılır?

### Short Answer

Repetition, Stability, Business Criticality, Data Complexity,
Maintenance Cost, Human Judgement gibi faktörler.

### Detailed Answer

Bu faktörler birlikte değerlendirilerek bir testin otomasyona uygun
olup olmadığına karar verilir; tek bir faktör yeterli değildir.

### Example

Login testi (yüksek repetition, yüksek stability) güçlü aday; görsel
banner kontrolü (yüksek human judgement) zayıf aday.

### Common Trap

Her regression testinin otomatik olarak otomasyon adayı olduğunu
düşünmek.

---

### Question 14

Business Rule Validation, Technical Validation'dan nasıl farklıdır?

### Short Answer

Technical Validation formatı, Business Rule Validation iş kuralına
uygunluğu doğrular.

### Detailed Answer

HTTP 200 dönmesi teknik başarıyı gösterir; KYC tamamlanmamış
kullanıcıya işlem izni verilmesi business açısından hatalı olabilir.

### Example

`{success: true}` response'u, business kuralı ihlal edilmiş olsa
bile teknik olarak "başarılı" görünebilir.

### Common Trap

HTTP status code'u business doğruluğuyla eş tutmak.

---

### Question 15

Impact Analysis ile Change Impact Analysis arasındaki fark nedir?

### Short Answer

Impact Analysis yeni bir değişikliğin etkisini, Change Impact
Analysis mevcut bir requirement/implementation'ın değişiminin test
varlıklarına etkisini sorar.

### Detailed Answer

Change Impact Analysis; hangi test case, automation, API contract ve
documentation'ın güncellenmesi gerektiğini sorgular.

### Example

Kupon kısıtlamasının sepet bazlıdan kullanıcı bazlıya değişmesi.

### Common Trap

Automation'ın "zaten yeşil" olmasını doğru test ettiği anlamına
geldiğini varsaymak.

---

### Question 16

Bir requirement'ın "testable" olup olmadığını nasıl değerlendirirsiniz?

### Short Answer

Measurable, observable, known input/output/conditions kriterlerine
uyup uymadığına bakarak.

### Detailed Answer

Subjektif ifadeler (kullanıcı dostu, hızlı) içeren bir requirement,
farklı kişiler tarafından farklı şekilde yorumlanabileceği için
testable değildir.

### Example

"Sayfa kullanıcı dostu olmalı" yerine "sepete ekleme en fazla 3
tıklamada tamamlanmalı."

### Common Trap

Subjektif bir requirement'ı "zaten anlaşılıyor" diyerek kabul etmek.

---

### Question 17

Risk Matrix'te "Unauthorized Access" neden yüksek öncelikli
değerlendirilir?

### Short Answer

Olasılığı düşük olsa bile etkisi kritik olduğu için.

### Detailed Answer

Risk Matrix, yalnızca Probability'ye değil Probability×Impact
birleşimine bakar; düşük olasılıklı ama kritik etkili riskler yüksek
öncelik alır.

### Example

Low Probability + Critical Impact = High Priority (Risk Matrix
üzerinde).

### Common Trap

Düşük olasılıklı riskleri otomatik olarak düşük öncelikli sanmak.

---

### Question 18

Bir feature'ın test edilmesi gereken kombinasyon sayısı çok fazlaysa
ne yaparsınız?

### Short Answer

Pairwise Testing gibi bir yaklaşımla kombinasyon sayısını azaltıp
bilinen yüksek riskli kombinasyonları ayrıca eklerim.

### Detailed Answer

Tüm kombinasyonları test etmek yerine, her ikili etkileşimi kapsayan
daha küçük bir test seti oluşturulur; kritik/bilinen riskli
kombinasyonlar ek olarak test edilir.

### Example

54 kombinasyon yerine 9-12 pairwise senaryo + bilinen "Safari+Wallet"
sorunu için ekstra test.

### Common Trap

Pairwise'ı tek başına yeterli sanıp bilinen riskli kombinasyonları
ayrıca eklemeyi unutmak.

---

### Question 19

Requirement Review Checklist neden yalnızca "Functional Behaviour"
ile sınırlı olmamalıdır?

### Short Answer

Çünkü Security, Analytics, Backward Compatibility gibi diğer boyutlar
atlanırsa önemli riskler gözden kaçar.

### Detailed Answer

Checklist; Roles/Authorization, State, Logging, Notifications gibi 20+
boyutu kapsar; yalnızca functional davranışa odaklanmak diğer
boyutları kör noktaya çevirir.

### Example

"Backward Compatibility" kontrol edilmezse, API'den kaldırılan bir
alan eski mobile client'ı crash ettirebilir.

### Common Trap

Checklist'i yalnızca functional behaviour ve error handling ile
sınırlı tutmak.

---

### Question 20

Bir Test Case'te "Automation Candidate: Yes" yazmak neyi garanti
etmez?

### Short Answer

Testin otomatize edildiğini veya otomatikleştirmenin zaten yapıldığını
garanti etmez — yalnızca bir değerlendirme sonucudur.

### Detailed Answer

Automation Candidate alanı, testin otomasyona **uygun** olduğunu
belirtir; gerçek implementasyon ayrı bir iştir ve önceliklendirmeye
tabidir.

### Example

Bir test "Automation Candidate: Yes" olarak işaretlense de, kaynak
kısıtı nedeniyle henüz otomatize edilmemiş olabilir.

### Common Trap

"Automation Candidate: Yes" etiketini, testin zaten otomatik
çalıştığı anlamına geldiğini sanmak.

---

### Question 21

Test Case formatında "Status: NOT EXECUTED" ne anlama gelir?

### Short Answer

Bu test case henüz çalıştırılmamıştır; sonuç PASS/FAIL değildir.

### Detailed Answer

Eğitim amaçlı örneklerde, gerçekte çalıştırılmamış bir testin PASS
olarak gösterilmesi Evidence Integrity kuralını ihlal eder; bu yüzden
NOT EXECUTED açıkça belirtilir.

### Example

`examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md` içindeki tüm test
case'ler NOT EXECUTED durumundadır.

### Common Trap

Eğitim amaçlı bir test case'i gerçekten çalıştırılmış gibi PASS
olarak göstermek.

---

## İlgili Konular

- [03-TEST-DESIGN README](README.md)
- [Common Mistakes](COMMON-MISTAKES.md)
- [examples/AUTHENTICATION-FEATURE](examples/AUTHENTICATION-FEATURE/01-REQUIREMENT.md)
