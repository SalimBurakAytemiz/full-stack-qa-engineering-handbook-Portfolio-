# Full Stack QA Engineering Terminology Glossary

Bu doküman repository içerisinde kullanılan QA, Software Testing,
Automation, API, Database, Mobile, Web, CI/CD ve diğer teknik terimlerin
standart kullanımını tanımlar.

Ana anlatım dili Türkçe'dir.

Teknik terminoloji mümkün olduğunca İngilizce orijinal haliyle korunur.

Örnek:

İstek Gövdesi (Request Body)

yerine yalnızca:

İstek Gövdesi

veya yalnızca:

Request Body

kullanılmaması tercih edilir.

Amaç hem Türkçe anlamı hem de sektörde kullanılan İngilizce teknik
terminolojiyi birlikte öğrenmektir.

---

# 1. Quality Terminology

## Quality Assurance - QA

Türkçe:

Kalite Güvence

Tanım:

Bir ürünün yalnızca test edilmesini değil, kalite problemlerinin
oluşmasını önlemeye yönelik süreçlerin tamamını kapsar.

QA yalnızca bug bulmak değildir.

Requirement, process, testability, risk, test design, automation,
release ve production quality süreçlerini de kapsar.

---

## Quality Control - QC

Türkçe:

Kalite Kontrol

Tanım:

Üretilmiş ürün veya çıktının belirlenen kalite kriterlerine uygunluğunu
kontrol etmeye odaklanır.

QA daha çok süreç ve hata önleme yaklaşımıyken,
QC ürün üzerindeki kalite kontrolüne odaklanır.

---

## Software Testing

Türkçe:

Yazılım Testi

Tanım:

Yazılımın beklenen gereksinimleri karşılayıp karşılamadığını,
hata içerip içermediğini ve kullanıcı/business beklentilerine uygun
davranıp davranmadığını doğrulama faaliyetidir.

---

## Verification

Türkçe:

Doğrulama

Temel soru:

"Ürünü doğru şekilde geliştiriyor muyuz?"

Requirement, design, specification ve diğer work product'ların
belirlenen kriterlere uygunluğunu değerlendirmeyi kapsar.

---

## Validation

Türkçe:

Geçerleme / Kullanıcı ihtiyacını doğrulama

Temel soru:

"Doğru ürünü mü geliştiriyoruz?"

Ürünün gerçek kullanıcı veya business ihtiyacını karşılayıp
karşılamadığını değerlendirir.

---

# 2. Requirement Terminology

## Requirement

Türkçe:

Gereksinim

Tanım:

Sistemin sağlaması beklenen business veya teknik davranış.

---

## Business Requirement

Türkçe:

İş Gereksinimi

Tanım:

Ürünün business açısından sağlaması gereken ihtiyaç veya davranış.

---

## Acceptance Criteria

Türkçe:

Kabul Kriterleri

Tanım:

Bir feature veya requirement'ın kabul edilmiş sayılabilmesi için
karşılaması gereken ölçülebilir koşullar.

---

## Requirement Clarification

Türkçe:

Gereksinim Netleştirme

Tanım:

Eksik, belirsiz veya çelişkili requirement noktalarının Product,
Business veya Development ekipleriyle netleştirilmesi.

---

## Testability

Türkçe:

Test Edilebilirlik

Tanım:

Bir requirement veya sistem davranışının objektif ve ölçülebilir
şekilde doğrulanabilir olması.

---

# 3. Test Design Terminology

## Test Scenario

Türkçe:

Test Senaryosu

Tanım:

Test edilmesi gereken yüksek seviyeli business veya sistem davranışı.

---

## Test Case

Türkçe:

Test Vakası

Tanım:

Belirli bir davranışı doğrulamak için kullanılan detaylı test tanımı.

Genellikle şunları içerir:

- Test Case ID
- Title
- Preconditions
- Test Data
- Steps
- Expected Result
- Actual Result
- Status

---

## Happy Path

Türkçe:

Başarılı Ana Akış

Tanım:

Kullanıcının beklenen girdiler ve doğru sistem davranışıyla işlemi
başarıyla tamamladığı ana senaryo.

---

## Alternative Flow

Türkçe:

Alternatif Akış

Tanım:

Happy Path dışında kalan fakat yine geçerli ve başarılı olan iş akışı.

---

## Negative Testing

Türkçe:

Negatif Test

Tanım:

Hatalı veya geçersiz girdiler karşısında sistemin kontrollü ve doğru
şekilde davranmasını doğrulamak.

---

## Edge Case

Türkçe:

Uç Durum

Tanım:

Normal kullanım dışında kalan ancak gerçek hayatta oluşması mümkün
olağandışı senaryolar.

---

## Boundary Value Analysis - BVA

Türkçe:

Sınır Değer Analizi

Tanım:

Bir input'un minimum ve maximum sınırlarının hemen altı, sınırı ve
hemen üstünü test etmeye dayalı test design technique.

Örnek:

Allowed:

1 - 100

Test:

0
1
2
99
100
101

---

## Equivalence Partitioning - EP

Türkçe:

Eşdeğer Bölümleme

Tanım:

Benzer davranış göstermesi beklenen input değerlerini gruplara ayırarak
her gruptan temsilci değer seçmek.

---

## Decision Table Testing

Türkçe:

Karar Tablosu Testi

Tanım:

Birden fazla koşulun farklı kombinasyonlarının farklı sonuçlar
oluşturduğu business rule'ları test etmek için kullanılan yöntem.

---

## State Transition Testing

Türkçe:

Durum Geçişi Testi

Tanım:

Bir sistem, kullanıcı veya nesnenin bir state'ten başka bir state'e
geçişlerini doğrulamak.

Örnek:

CREATED
→ PAID
→ PREPARING
→ SHIPPED
→ DELIVERED

---

# 4. Test Execution Terminology

## Test Execution

Türkçe:

Test Çalıştırma

Tanım:

Hazırlanan Test Case veya Test Scenario'ların sistem üzerinde
uygulanması.

---

## Passed

Test beklenen sonucu vermiştir.

---

## Failed

Test beklenen sonucu vermemiştir.

---

## Blocked

Test, environment, dependency veya başka teknik engel nedeniyle
çalıştırılamamıştır.

---

## Not Run

Test henüz çalıştırılmamıştır.

---

## Skipped

Test bilinçli olarak execution kapsamı dışında bırakılmıştır.

---

# 5. Test Types

## Functional Testing

Türkçe:

Fonksiyonel Test

Sistemin tanımlanan fonksiyonlarının requirement'a uygun çalışmasını
doğrular.

---

## Regression Testing

Türkçe:

Regresyon Testi

Yeni değişikliklerin mevcut çalışan fonksiyonları bozup bozmadığını
kontrol eder.

---

## Smoke Testing

Türkçe:

Duman Testi / Temel Sağlık Kontrolü

Yeni build veya deployment sonrası sistemin en kritik fonksiyonlarının
çalışıp çalışmadığını hızlıca kontrol eder.

---

## Sanity Testing

Türkçe:

Hedefli Temel Doğrulama

Belirli bir değişiklik veya fix sonrasında ilgili alanın hızlı şekilde
kontrol edilmesidir.

---

## Exploratory Testing

Türkçe:

Keşif Testi

Tester'ın bilgi, deneyim ve gözlemlerini kullanarak test tasarımı ile
test execution'ı birlikte yürüttüğü test yaklaşımı.

---

## User Acceptance Testing - UAT

Türkçe:

Kullanıcı Kabul Testi

Sistemin business ve kullanıcı beklentilerini karşılayıp
karşılamadığının doğrulandığı test süreci.

---

## End-to-End Testing - E2E

Türkçe:

Uçtan Uca Test

Bir business flow'un başlangıçtan sona kadar birden fazla sistem veya
katmandan geçerek doğrulanması.

---

## Integration Testing

Türkçe:

Entegrasyon Testi

Birden fazla sistem, servis veya component arasındaki veri ve iş
akışlarının doğrulanması.

---

# 6. Defect Terminology

## Defect

Türkçe:

Hata / Kusur

Tanım:

Sistemin beklenen davranıştan sapması.

---

## Bug

Defect ile günlük kullanımda büyük ölçüde aynı anlamda kullanılır.

Repository içerisinde ağırlıklı olarak:

Bug / Defect

birlikte kullanılacaktır.

---

## Steps to Reproduce

Türkçe:

Hatayı Tekrar Oluşturma Adımları

Tanım:

Başka bir kişinin aynı problemi tekrar oluşturabilmesini sağlayacak
net ve sıralı adımlar.

---

## Expected Result

Türkçe:

Beklenen Sonuç

Sistemin requirement veya business rule'a göre göstermesi gereken
davranış.

---

## Actual Result

Türkçe:

Gerçekleşen Sonuç

Test sırasında sistemin gerçekten gösterdiği davranış.

---

## Severity

Türkçe:

Hata Etki Seviyesi

Tanım:

Bug'ın sistem üzerindeki teknik veya business etkisinin büyüklüğü.

---

## Priority

Türkçe:

Çözüm Önceliği

Tanım:

Bug'ın ne kadar hızlı çözülmesi gerektiğini ifade eder.

Severity ve Priority aynı kavram değildir.

---

## Retest

Türkçe:

Yeniden Test

Fix sonrasında ilgili bug'ın gerçekten düzelip düzelmediğinin tekrar
kontrol edilmesi.

---

## Reopen

Türkçe:

Bug'ı Yeniden Açma

Fix sonrasında problem devam ediyorsa bug'ın tekrar development
sürecine gönderilmesi.

---

## Bug Triage

Türkçe:

Bug Değerlendirme

QA, Development, Product veya diğer ekiplerin defect'lerin severity,
priority, owner ve release impact gibi özelliklerini değerlendirdiği
süreç.

---

# 7. API Terminology

## API

Application Programming Interface

Türkçe:

Uygulama Programlama Arayüzü

Farklı yazılım sistemlerinin birbiriyle iletişim kurmasını sağlar.

---

## Endpoint

Bir API servisinin erişilebilir adresi.

Örnek:

GET /api/v1/users

---

## Request

Türkçe:

İstek

Client tarafından API'ye gönderilen işlem.

---

## Request Body

Türkçe:

İstek Gövdesi

API'ye gönderilen veriyi içerir.

---

## Response

Türkçe:

Cevap

Server tarafından client'a dönen sonuç.

---

## Response Body

Türkçe:

Cevap Gövdesi

API response içerisinde dönen veri yapısı.

---

## Header

Request veya response hakkında ek bilgi taşıyan metadata.

Örnek:

Content-Type

Authorization

Accept

---

## Query Parameter

URL üzerinden gönderilen filtre veya kontrol parametresi.

Örnek:

?page=2&limit=20

---

## Path Parameter

Endpoint path içerisinde bulunan dinamik değer.

Örnek:

/users/123

Burada:

123

Path Parameter'dır.

---

## Authentication

Türkçe:

Kimlik Doğrulama

Temel soru:

"Kimsin?"

---

## Authorization

Türkçe:

Yetkilendirme

Temel soru:

"Neyi yapmaya yetkilisin?"

---

## HTTP Status Code

HTTP protokol seviyesindeki işlem sonucunu ifade eden status code.

Örnek:

200
201
400
401
403
404
409
500

---

## Application Status

Response body içerisinde application veya business seviyesinde dönen
işlem durumu.

HTTP Status ile aynı şey değildir.

---

## JSON Schema

Bir JSON response veya request'in beklenen yapısını tanımlayan schema.

---

## Schema Validation

Türkçe:

Şema Doğrulama

JSON datasının tanımlanan contract'a uygun olup olmadığının kontrolü.

---

## Contract Testing

Türkçe:

Sözleşme Testi

Sistemler arasındaki API sözleşmesinin taraflar arasında uyumlu
kalmaya devam ettiğini doğrulayan testing yaklaşımı.

---

# 8. Database Terminology

## Database

Türkçe:

Veritabanı

---

## SQL

Structured Query Language

Relational database sistemleriyle veri sorgulama ve yönetim için
kullanılan dil.

---

## Data Validation

Türkçe:

Veri Doğrulama

Sistem katmanları arasında verinin doğru, tutarlı ve beklenen formatta
olduğunu kontrol etmek.

---

## Test Oracle

Bir test sonucunun doğru veya yanlış olduğunu belirlemek için kullanılan
referans bilgi veya sistem.

Database QA süreçlerinde sıkça Test Oracle olarak kullanılabilir.

---

# 9. Automation Terminology

## Test Automation

Türkçe:

Test Otomasyonu

Tekrarlanabilir test işlemlerinin kod veya automation araçlarıyla
çalıştırılması.

---

## Assertion

Türkçe:

Doğrulama İfadesi

Actual Result ile Expected Result arasındaki kontrolü yapan kod.

---

## Locator

UI Automation sırasında element'i bulmak için kullanılan tanımlayıcı.

---

## Page Object Model - POM

UI elementleri ve page-level işlemlerin test senaryolarından
ayrılmasını sağlayan automation design pattern.

---

## Fixture

Test environment, context, test data veya setup bilgilerinin
tekrar kullanılabilir şekilde yönetilmesini sağlayan yapı.

---

## Setup

Test çalışmadan önce gerekli state veya environment hazırlığı.

---

## Teardown

Test tamamlandıktan sonra yapılan cleanup işlemleri.

---

## Test Isolation

Bir testin sonucunun başka bir testin state veya datasına bağlı
olmaması prensibi.

---

## Flaky Test

Product'ta gerçek bir değişiklik olmadığı halde bazen PASS bazen FAIL
olan güvenilir olmayan automated test.

---

# 10. Performance Terminology

## Performance Testing

Sistemin hız, kapasite, stabilite ve resource davranışlarının
değerlendirilmesi.

---

## Load Testing

Sistemin beklenen kullanıcı veya transaction yükü altındaki davranışını
ölçmek.

---

## Stress Testing

Sistemin normal kapasitesinin üzerine çıkılarak limitlerinin ve failure
davranışının araştırılması.

---

## Spike Testing

Yükün kısa sürede ani şekilde yükseltilmesine verilen sistem
tepkisinin test edilmesi.

---

## Soak / Endurance Testing

Sistemin uzun süre yük altında bırakılarak zaman içerisinde ortaya
çıkabilecek performans veya stabilite problemlerinin araştırılması.

---

## Response Time

Request ile response arasındaki geçen süre.

---

## Throughput

Belirli zaman içerisinde sistemin işleyebildiği request veya
transaction miktarı.

---

## Percentile

Response time dağılımının belirli yüzdelik kısmını ifade eder.

Örnek:

P95 = 800 ms

Request'lerin yaklaşık %95'i 800 ms veya daha kısa sürede
tamamlanmıştır.

---

# 11. CI/CD Terminology

## Continuous Integration - CI

Kod değişikliklerinin sık şekilde merkezi repository'ye alınması ve
otomatik build/test süreçleriyle doğrulanması yaklaşımı.

---

## Continuous Delivery / Deployment - CD

Yazılım değişikliklerinin kontrollü veya otomatik şekilde deployment'a
hazırlanması ya da ortamlara dağıtılması süreci.

---

## Pipeline

Build, test, deploy ve quality gate gibi işlemleri belirli sırada
çalıştıran otomasyon akışı.

---

## Quality Gate

Bir değişikliğin sonraki aşamaya geçebilmesi için sağlaması gereken
kalite kriterleri.

---

# 12. Production Terminology

## Production

Türkçe:

Canlı Ortam

Gerçek kullanıcıların kullandığı sistem ortamı.

---

## Production Validation

Release sonrasında production üzerinde kritik sistem davranışlarının
kontrollü şekilde doğrulanması.

---

## Stability Verification

Release sonrasında sistemin kritik kullanıcı ve entegrasyon
akışlarının stabil çalışmaya devam ettiğinin doğrulanması.

---

## Hotfix

Production'daki kritik bir problemi hızlı şekilde çözmek için
hazırlanan hedefli yazılım değişikliği.

---

## Rollback

Sorunlu deployment'ın geri alınarak önceki stabil versiyona
dönülmesi.

---

# 13. Knowledge Status Terminology

## EXPERIENCE

Profesyonel projede doğrudan uygulanmış bilgi.

## PARTICIPATED

Profesyonel süreçte aktif katkı sağlanmış ancak ana uygulayıcı
olunmamış alan.

## PRACTICED

Repository QA Lab ortamında uygulanmış ve kanıtlanmış bilgi.

## LEARNING

Henüz hands-on seviyesine taşınmamış öğrenme alanı.

---

# 14. Process & Lifecycle Terminology

## Error

Türkçe:

Hata (İnsan Hatası)

Tanım:

Bir kişinin (genelde developer'ın) yaptığı, kodda Defect'e yol açan
insan hatası.

QA açısından kullanım:

Kök neden analizinde "Error → Defect → Failure" zincirinin başlangıç
noktasıdır.

---

## Static Testing

Türkçe:

Statik Test

Tanım:

Yazılımı çalıştırmadan, requirement/design/kod gibi work product'lar
üzerinde yapılan inceleme (review, walkthrough, inspection).

---

## Dynamic Testing

Türkçe:

Dinamik Test

Tanım:

Yazılımı gerçekten çalıştırarak, girdi verip çıktı gözlemleyerek
yapılan test aktivitesi.

---

## Entry Criteria

Türkçe:

Giriş Kriterleri

Tanım:

Bir test aktivitesine başlamak için karşılanması gereken minimum
koşullar.

---

## Exit Criteria

Türkçe:

Çıkış Kriterleri

Tanım:

Bir test aktivitesinin tamamlandığı ve bir sonraki aşamaya
geçilebileceği kararının dayandığı koşullar.

---

## Traceability

Türkçe:

İzlenebilirlik

Tanım:

Bir requirement'ın test senaryosuna, test case'ine, execution
sonucuna ve varsa defect'e kadar izlenebilir olması.

---

## Shift Left Testing

Türkçe:

Sola Kaydırma

Tanım:

QA aktivitelerinin lifecycle'da mümkün olduğunca erken (requirement
aşamasına doğru) kaydırılması.

---

## Shift Right Testing

Türkçe:

Sağa Kaydırma

Tanım:

QA aktivitelerinin production'a doğru genişletilmesi (monitoring, log
analizi, production validation).

---

## Risk-Based Testing

Türkçe:

Riske Dayalı Test

Tanım:

Test önceliklendirmesinin, bir senaryonun olasılığı (Probability) ile
etkisinin (Impact) birleşimine göre yapılması.

---

## Unit Testing

Türkçe:

Birim Testi

Tanım:

Tek bir fonksiyon, method veya class'ın, dış bağımlılıklardan izole
şekilde test edilmesi.

---

## Component Testing

Türkçe:

Bileşen Testi

Tanım:

Bir modül/servisin, dış bağımlılıkları genellikle mock/stub ile izole
edilerek test edilmesi.

---

## System Testing

Türkçe:

Sistem Testi

Tanım:

Sistemin bir bütün olarak, tanımlanan requirement'ları uçtan uca
karşıladığının test edilmesi.

---

# Glossary Maintenance Rule

Repository büyüdükçe yeni teknik terimler bu dosyaya eklenmelidir.

Yeni terim eklenirken mümkün olduğunca şu format kullanılmalıdır:

Technical Term

Türkçe karşılık

Tanım

QA açısından kullanım

Gerekirse kısa örnek

Terimler farklı bölümlerde birbirleriyle çelişecek şekilde
tanımlanmamalıdır.
