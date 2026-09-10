# Interview Notes — QA Foundations

**Status: EXPERIENCE**

Bu dosya, QA Foundations kapsamındaki konuların teknik mülakat
tekrarı için hazırlanmıştır. Her soru, ezber bir cevap değil, teknik
görüşmede açıklanabilir seviyede bir yanıt hedefler.

---

### Question 1

QA ile QC arasındaki fark nedir?

### Short Answer

QA süreç odaklı ve önleyicidir; QC ürün odaklı ve kontrol edicidir.

### Detailed Answer

QA (Quality Assurance), kalite problemlerinin oluşmasını önlemeye
yönelik süreçlerin bütünüdür — requirement analizi, risk
değerlendirmesi, test stratejisi gibi aktiviteleri kapsar. QC (Quality
Control) ise üretilmiş bir çıktının belirlenen kriterlere uygunluğunu
kontrol eder — test execution bu kapsama girer.

### Example

Bir requirement review yaparak belirsizliği erken yakalamak QA
aktivitesidir; geliştirilmiş bir login ekranını test edip hata
bulmak QC aktivitesidir.

### Common Trap

QA'yı yalnızca "test etmek" ile eşitlemek; QA'nın requirement ve
süreç seviyesindeki katkısını görmezden gelmek.

---

### Question 2

Verification ile Validation arasındaki fark nedir?

### Short Answer

Verification "doğru mu geliştiriliyor" sorusuna, Validation "doğru
şey mi geliştiriliyor" sorusuna cevap arar.

### Detailed Answer

Verification, requirement/design gibi work product'ların belirlenen
kriterlere uygunluğunu değerlendirir (sistem çalışmasa bile
yapılabilir). Validation, geliştirilmiş gerçek sistemin kullanıcı/
business ihtiyacını karşıladığını doğrular (sistem çalışıyor
olmalıdır).

### Example

"Kullanıcı geçerli email/password ile login olabilir" requirement'ında;
Acceptance Criteria'nın yeterliliğini kontrol etmek Verification,
gerçek kullanıcının login olabildiğini test etmek Validation'dır.

### Common Trap

İki terimi yalnızca İngilizce cümleleri ezberleyerek ayırt etmeye
çalışmak, somut örnek verememek.

---

### Question 3

SDLC ile STLC arasındaki ilişki nedir?

### Short Answer

STLC, SDLC'nin yalnızca "Testing" aşamasıyla sınırlı değildir; SDLC'ye
paralel yürüyen bir test alt-sürecidir.

### Detailed Answer

SDLC (Software Development Life Cycle), yazılımın requirement'tan
maintenance'a kadar geçtiği tüm aşamaları kapsar. STLC (Software
Testing Life Cycle) ise Requirement Analysis'ten başlayarak Test
Planning, Test Design, Execution, Defect Management ve Closure'a
kadar SDLC'nin neredeyse tamamına paralel yürür.

### Example

Requirement Analysis, hem SDLC'nin hem STLC'nin ilk adımıdır — QA'nın
işi development başlamadan başlar.

### Common Trap

STLC'yi yalnızca SDLC'nin "Testing" kutusuyla eşleştirmek.

---

### Question 4

Unit Testing ile Integration Testing arasındaki fark nedir, QA hangisinden
sorumludur?

### Short Answer

Unit Testing tek bir kod birimini, Integration Testing modüller arası
etkileşimi test eder; QA genelde Integration seviyesinden itibaren ana
sorumludur.

### Detailed Answer

Unit Testing, izole bir fonksiyon/method/class'ın doğruluğunu test
eder ve genelde Developer'ın sorumluluğundadır. Integration Testing,
iki veya daha fazla modülün birlikte doğru çalıştığını test eder ve
genelde QA'nın ana sorumluluk alanına girer.

### Example

`calculateDiscount()` fonksiyonunun doğru hesaplama yapması Unit
Testing; Order servisinin Inventory servisinden doğru stok bilgisini
alması Integration Testing'dir.

### Common Trap

"Unit test developer'ın işi olduğu için QA hiçbir şey bilmez" gibi
aşırı bir yaklaşım sergilemek.

---

### Question 5

Smoke Testing ile Sanity Testing arasındaki fark nedir?

### Short Answer

Smoke genel build sağlığını, Sanity spesifik bir fix'in sağlığını
kontrol eder.

### Detailed Answer

Smoke Testing, yeni bir build/deployment sonrası sistemin en kritik
fonksiyonlarının çalıştığını hızlıca kontrol eder. Sanity Testing,
belirli bir değişiklik/fix sonrasında yalnızca ilgili dar alanı
hedefler.

### Example

Uygulamanın açılıp açılmadığını, login'in çalışıp çalışmadığını
kontrol etmek Smoke; "şifremi unuttum" linkindeki bir fix sonrası
yalnızca o akışı kontrol etmek Sanity'dir.

### Common Trap

İki terimi birbirinin yerine kullanmak.

---

### Question 6

Regression Testing ile Retest arasındaki fark nedir?

### Short Answer

Retest "bu bug düzeldi mi", Regression "bu değişiklik başka bir şeyi
bozdu mu" sorusuna cevap verir.

### Detailed Answer

Retest, fix'lenen aynı bug'ın gerçekten düzelip düzelmediğini dar
kapsamda kontrol eder. Regression, yapılan değişikliğin ilgili/ilgisiz
başka alanları bozup bozmadığını geniş kapsamda kontrol eder.

### Example

Bir kupon kodu bug'ı fix'lendikten sonra yalnızca o senaryoyu tekrar
çalıştırmak Retest; ödeme akışının genelini tekrar test etmek
Regression'dır.

### Common Trap

Regression'ı "her şeyi baştan test etmek" olarak abartmak veya
Retest'i Regression'ın yerine koymak.

---

### Question 7

Integration Testing ile End-to-End Testing arasındaki fark nedir?

### Short Answer

Integration birkaç modül arasındaki etkileşimi, E2E kullanıcının tüm
akışını test eder.

### Detailed Answer

Integration Testing, iki veya birkaç modül/servisin veri akışı ve
sözleşme doğruluğuna odaklanır. E2E Testing, kullanıcının gerçek
dünyada izleyeceği tam akışı (örn. ürün arama → sepet → ödeme →
onay) uçtan uca test eder.

### Example

Order servisi ile Payment servisinin doğru veri alışverişi yapması
Integration; kullanıcının tüm satın alma yolculuğunu tamamlaması E2E.

### Common Trap

Integration Testing'i atlayıp yalnızca E2E'ye güvenmek — bu, hataların
geç ve pahalı yakalanmasına yol açar.

---

### Question 8

Test Oracle nedir?

### Short Answer

Bir test sonucunun doğru olup olmadığına karar vermek için kullanılan
referans kaynaktır.

### Detailed Answer

Test Oracle, Expected Result'ın nereden geldiğini belirler. Requirement,
Acceptance Criteria, Business Rule, Database, API Contract, Design gibi
kaynaklar Oracle olarak kullanılabilir.

### Example

API'nin döndürdüğü `balance = 1500` değerinin, veritabanındaki
`balance = 1500` ile karşılaştırılması — database burada Test
Oracle'dır.

### Common Trap

Database'i her zaman mutlak doğru kabul etmek; database'in kendisinin
de hatalı/stale olabileceğini göz ardı etmek.

---

### Question 9

Database her zaman güvenilir bir Test Oracle mıdır?

### Short Answer

Hayır, database de yanlış migration, stale veri veya bug sonucu hatalı
veri içerebilir.

### Detailed Answer

Database çoğu zaman güvenilir bir Oracle'dır çünkü sistemin gerçek
durumunu tutar. Ancak database'in kendisi bir bug'ın sonucu olarak
hatalı veri içeriyor olabilir; bu durumda database ile "tutarlı" olmak,
"doğru" olmak anlamına gelmez.

### Example

Yanlış hesaplanan bir indirim tutarı veritabanına da yanlış yazılmışsa,
API'nin bu değerle tutarlı olması sonucu doğru yapmaz.

### Common Trap

Database'i sorgusuz sualsiz Oracle kabul edip asıl kaynak olan
Business Rule/Requirement ile çapraz kontrol yapmamak.

---

### Question 10

Entry Criteria ile Exit Criteria arasındaki fark nedir?

### Short Answer

Entry Criteria test etmeye başlama koşullarıdır, Exit Criteria test
etmeyi bitirme koşullarıdır.

### Detailed Answer

Entry Criteria, test aktivitesine başlamak için gerekli minimum
koşulları (requirement hazır, build deploy edilmiş, environment ayakta
vb.) tanımlar. Exit Criteria, test aktivitesinin tamamlandığı ve bir
sonraki aşamaya geçilebileceği kararının dayandığı koşulları (P0 yok,
threshold sağlandı vb.) tanımlar.

### Example

Environment ayakta değilse test başlatılmaz (Entry Criteria
karşılanmadı); regression suite %90 başarı oranıyla tamamlanmışsa ve
threshold %95 ise release ertelenebilir (Exit Criteria karşılanmadı).

### Common Trap

Exit Criteria'yı yalnızca "tüm testler PASS oldu" ile eş anlamlı
sanmak.

---

### Question 11

Traceability nedir, neden önemlidir?

### Short Answer

Requirement'tan defect'e kadar izlenebilirlik sağlar; impact analysis
ve coverage kontrolü için gereklidir.

### Detailed Answer

Traceability, bir requirement'ın test senaryosuna, test case'ine,
execution sonucuna ve varsa defect'e kadar izlenebilir olmasıdır. Bu
sayede bir requirement değiştiğinde hangi test case'lerin etkilendiği,
bir defect'in hangi requirement'ı ihlal ettiği hızlıca bulunabilir.

### Example

REQ-AUTH-001 → TC-AUTH-HP-001 → Execution FAIL → BUG-AUTH-001 →
Retest PASS → Release zinciri, requirement'ın gerçekten doğrulandığını
kanıtlar.

### Common Trap

Traceability'yi yalnızca büyük/kurumsal projelere özgü gereksiz
bürokrasi sanmak.

---

### Question 12

Shift Left Testing nedir?

### Short Answer

QA aktivitelerinin lifecycle'da mümkün olduğunca erken (requirement
aşamasına doğru) kaydırılmasıdır.

### Detailed Answer

Shift Left, requirement review, erken QA involvement, API contract
review, testability ve risk analizi gibi aktivitelerle hataları
development başlamadan veya erken aşamalarda yakalamayı hedefler.

### Example

Bir requirement'taki belirsizliğin, development başlamadan önce review
sırasında yakalanması.

### Common Trap

Shift Left'i yalnızca "test case'leri erken yazmak" ile sınırlı
sanmak.

---

### Question 13

Shift Right Testing nedir?

### Short Answer

QA aktivitelerinin production'a doğru genişletilmesidir.

### Detailed Answer

Shift Right, production validation, monitoring, log analizi ve
stability verification gibi aktivitelerle gerçek kullanım
koşullarında ortaya çıkan sorunları erken tespit etmeyi hedefler.

### Example

Bir release sonrası production loglarının izlenerek anormal hata
oranının fark edilmesi.

### Common Trap

Shift Right'ı yalnızca DevOps/monitoring ekibinin işi sanmak, QA'nın
production ile hiç ilgilenmemesi gerektiğini düşünmek.

---

### Question 14

Risk-Based Testing'de Probability ve Impact nasıl kullanılır?

### Short Answer

Risk = Probability × Impact; test önceliği bu ikisinin birleşimine
göre belirlenir.

### Detailed Answer

Probability, bir hatanın oluşma olasılığıdır; Impact, oluştuğunda
yaratacağı etkinin ciddiyetidir. Test Priority, yalnızca Probability'ye
değil, ikisinin birleşimine göre belirlenir.

### Example

Payment failure (Medium Probability, Critical Impact) yüksek
öncelikli; cosmetic spacing issue (High Probability, Low Impact)
düşük önceliklidir.

### Common Trap

Yalnızca en sık karşılaşılan senaryoyu en öncelikli sanmak, Impact'i
göz ardı etmek.

---

### Question 15

Quality Gate nedir?

### Short Answer

Bir sonraki aşamaya geçebilmek için karşılanması gereken önceden
tanımlanmış kalite kriterleri kümesidir.

### Detailed Answer

Quality Gate; P0 defect sayısı, kritik smoke sonucu, regression
tamamlanma durumu, performans threshold'u ve bilinen risklerin
dokümante edilmesi gibi birden fazla kriteri birlikte değerlendirir.

### Example

Otomasyon suite'i yeşil olsa bile, açık bir P0 defect varsa Quality
Gate karşılanmamış olur.

### Common Trap

Quality Gate'i yalnızca "otomasyon PASS oldu mu" sorusuna indirgemek.

---

### Question 16

QA'nın günlük işi yalnızca test çalıştırmak mıdır?

### Short Answer

Hayır; requirement analizi, risk değerlendirmesi, test tasarımı ve
production izleme de QA'nın kapsamındadır.

### Detailed Answer

QA, lifecycle'ın tamamında (Requirement, Design, Development, Testing,
Release, Production) farklı sorumluluklar üstlenir. Test execution,
bu sorumlulukların yalnızca bir parçasıdır.

### Example

Bir requirement review sırasında belirsizliği yakalamak, test
execution kadar değerli bir QA aktivitesidir.

### Common Trap

QA'yı yalnızca "Testing Phase"de çalışan bir rol olarak görmek.

---

### Question 17

QA ile DBA arasındaki sorumluluk sınırı nedir?

### Short Answer

QA veri tutarlılığını validate edebilir; bu QA'yı DBA yapmaz.

### Detailed Answer

QA, bir işlemin veritabanına doğru şekilde yansıdığını sorgulayarak
doğrulayabilir. Ancak veritabanı altyapısının tasarımı, performans
tuning'i ve yönetimi DBA'nın sorumluluğundadır.

### Example

QA, bir siparişin `status` alanının doğru güncellendiğini kontrol
edebilir; ama indeksleme stratejisini tasarlamaz.

### Common Trap

QA'nın database ile hiç ilgilenmemesi gerektiğini ya da DBA'nın
işini üstlenmesi gerektiğini düşünmek — ikisi de aşırı uçlardır.

---

### Question 18

Error, Defect ve Failure arasındaki fark nedir?

### Short Answer

Error insan hatasıdır, Defect kodda bıraktığı izdir, Failure bu izin
çalışma zamanında gözlemlenen hatalı davranışa dönüşmesidir.

### Detailed Answer

Zincir şu şekildedir: Human Error → Defect in Code → Runtime Failure →
User Impact. Her Defect mutlaka Failure'a dönüşmeyebilir (örn. dead
code).

### Example

Yanlış yazılan bir indirim formülü (Error) kodda kalır (Defect);
kullanıcı o kod yoluna girdiğinde yanlış fiyat görür (Failure).

### Common Trap

Üç terimi birbirinin yerine kullanmak, kök neden analizini atlamak.

---

### Question 19

Static Testing ile Dynamic Testing arasındaki fark nedir?

### Short Answer

Static Testing sistemi çalıştırmadan yapılır, Dynamic Testing sistemi
çalıştırarak yapılır.

### Detailed Answer

Static Testing; review, walkthrough, inspection gibi yöntemlerle
requirement/design/kod üzerinde yapılır. Dynamic Testing, gerçek
girdi verip çıktı gözlemleyerek yapılır.

### Example

Requirement review Static Testing; bir formu doldurup submit etmek
Dynamic Testing'dir.

### Common Trap

Static Testing'i "gereksiz toplantı" olarak görmek, erken hata
yakalamanın maliyet avantajını göz ardı etmek.

---

### Question 20

Equivalence Partitioning ile Boundary Value Analysis nasıl birlikte
kullanılır?

### Short Answer

EP girdi gruplarını belirler, BVA bu grupların sınır değerlerini
hedefler.

### Detailed Answer

EP, girdileri aynı davranışın beklendiği gruplara ayırıp her gruptan
bir temsilci değer seçer. BVA, hataların genellikle sınırlarda
oluştuğu gözlemiyle, bu grupların sınır değerlerini ve hemen
yanındaki değerleri test eder.

### Example

18-65 yaş aralığında EP ile 30 (geçerli), 10 (geçersiz) test edilir;
BVA ile 17, 18, 65, 66 test edilir.

### Common Trap

Yalnızca EP veya yalnızca BVA kullanıp diğerini atlamak.

---

### Question 21

Decision Table Testing ne zaman kullanılır?

### Short Answer

Birden fazla koşulun farklı kombinasyonlarının farklı sonuçlar
ürettiği durumlarda kullanılır.

### Detailed Answer

Decision Table, koşulları ve olası kombinasyonlarını sistematik bir
tabloda eşleştirerek, hiçbir kombinasyonun atlanmamasını sağlar.

### Example

Kupon geçerliliği ve minimum sepet tutarının birlikte değerlendirildiği
bir indirim sisteminde dört kombinasyonun (evet/evet, evet/hayır,
hayır/evet, hayır/hayır) test edilmesi.

### Common Trap

Decision Table'ı yalnızca çok karmaşık sistemler için gerekli sanmak.

---

### Question 22

State Transition Testing nedir?

### Short Answer

Bir sistemin durumlar arasında belirli olaylarla nasıl geçiş yaptığını
test eden tekniktir.

### Detailed Answer

Sistemin state diyagramı çıkarılır; geçerli geçişlerin yanı sıra
geçersiz geçişlerin de reddedildiği test edilir.

### Example

Bir siparişin Created → Paid → Shipped → Delivered geçişleri ve
Created → Shipped gibi geçersiz bir geçişin reddedilmesi.

### Common Trap

Yalnızca geçerli geçişleri test edip geçersiz geçişleri atlamak.

---

### Question 23

Test Levels arasında QA'nın en çok sorumlu olduğu seviye hangisidir?

### Short Answer

System Testing, QA'nın ana çalışma alanıdır; Integration Testing'de
de genelde ana sorumludur.

### Detailed Answer

Unit ve Component Testing genelde Developer sorumluluğundadır.
Integration Testing'den itibaren QA ana sorumlu haline gelir; System
Testing tamamen QA'nın alanıdır. Acceptance Testing'de ise QA
koordinasyon sağlar ama karar business'a aittir.

### Example

Sistemin uçtan uca (ürün arama → sepet → ödeme) doğru çalışması
System Testing kapsamındadır ve QA'nın ana sorumluluğundadır.

### Common Trap

Tüm test seviyelerinin QA'nın sorumluluğunda olduğunu ya da hiçbirinin
olmadığını düşünmek.

---

### Question 24

Exploratory Testing, "rastgele test etmek" midir?

### Short Answer

Hayır; hedefli ve zaman kutulu (time-boxed) yürütülen, deneyime dayalı
sistematik bir tekniktir.

### Detailed Answer

Exploratory Testing, önceden yazılmış test case'e bağlı kalmadan, test
edenin bilgi ve sezgisiyle sistemi keşfetmesidir — ancak plansız
değildir; belirli bir hedef ve süre çerçevesinde yürütülür.

### Example

Yeni bir form üzerinde beklenmedik karakter kombinasyonlarını,
belirlenen bir süre içinde hedefli şekilde denemek.

### Common Trap

Exploratory Testing'i "amaçsız gezinme" ile karıştırmak.

---

### Question 25

Bir release öncesi Quality Gate karşılanmazsa QA ne yapmalıdır?

### Short Answer

Riski açıkça dokümante edip business ile Go/No-Go kararını
netleştirmelidir.

### Detailed Answer

Quality Gate karşılanmadığında QA, sessizce devam etmek yerine hangi
kriterin karşılanmadığını (örn. açık P0 defect, threshold altı
regression) açıkça raporlar ve karar business ile birlikte verilir.

### Example

Regression suite %90 başarı oranıyla tamamlanmış (threshold %95) ise,
bu durum dokümante edilip business'a bildirilir.

### Common Trap

Quality Gate kararını yalnızca QA'nın tek başına verdiğini düşünmek.

---

### Question 26

Traceability olmadan bir projede ne kaybedilir?

### Short Answer

Impact analysis, coverage kontrolü ve kök neden analizi zorlaşır.

### Detailed Answer

Requirement değiştiğinde hangi test case'lerin güncellenmesi
gerektiği bilinmez; bir defect'in hangi requirement'ı etkilediği
belirsiz kalır; release öncesi "her şey test edildi mi" sorusuna
kanıta dayalı cevap verilemez.

### Example

Bir requirement değiştiği halde ilgili test case güncellenmezse, eski
ve artık geçersiz bir senaryo test edilmeye devam eder.

### Common Trap

Traceability eksikliğinin sonuçlarını yalnızca "dokümantasyon eksik"
olarak küçümsemek; gerçek risk (yanlış coverage, geç fark edilen
kök neden) etkisini görmezden gelmek.

---

## İlgili Konular

- [QA Foundations README](README.md)
- [Common Mistakes](COMMON-MISTAKES.md)
