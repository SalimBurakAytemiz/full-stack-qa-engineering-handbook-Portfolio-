# Interview Notes — Test Management

**Status: EXPERIENCE**

---

### Question 1

Test Strategy ile Test Plan arasındaki fark nedir?

### Short Answer

Test Strategy organizasyon geneli, uzun vadeli yaklaşımı; Test Plan
belirli bir release'in somut planını tanımlar.

### Detailed Answer

Test Strategy nadiren değişir ve Approach/Levels/Types/Automation
gibi stratejik alanları içerir. Test Plan her release'de yeniden
oluşturulur ve Scope/Entry-Exit Criteria/Schedule gibi taktiksel
alanları içerir.

### Example

Strategy: "Risk-Based Testing her release'in kapsamını belirler."
Plan: "Bu sprint'te Kupon Kodu feature'ı test edilecek, Entry
Criteria X, Exit Criteria Y."

### Common Trap

İkisini aynı doküman sanmak.

---

### Question 2

Test Scenario ile Test Case arasındaki fark nedir?

### Short Answer

Scenario bir cümle, Case çalıştırılabilir tam bir dokümandır.

### Detailed Answer

Test Scenario, kullanıcı davranışını bir cümleyle özetler. Test
Case; Precondition, Test Data, Steps, Expected Result gibi tüm
detayları içerir.

### Example

Scenario: "Kullanıcı yanlış password ile login dener." Case: tam
adımlarıyla TC-AUTH-NEG-001.

### Common Trap

İki terimi birbirinin yerine kullanmak.

---

### Question 3

PASS, FAIL, BLOCKED, NOT EXECUTED, SKIPPED arasındaki farklar nedir?

### Short Answer

PASS/FAIL testin sonucudur; BLOCKED dış engel, NOT EXECUTED zaman
kısıtı, SKIPPED bilinçli atlama anlamına gelir.

### Detailed Answer

Her statü farklı bir nedene işaret eder ve farklı bir aksiyon
gerektirir; BLOCKED ürün hatası değildir, dış bağımlılık sorunudur.

### Example

Payment Provider unavailable → BLOCKED, ürün FAIL değil.

### Common Trap

BLOCKED ile FAIL'i karıştırmak.

---

### Question 4

BLOCKED ile FAILED arasındaki fark neden önemlidir?

### Short Answer

Yanlış FAIL raporu development'ı yanlış yere yönlendirir; BLOCKED
doğru ekibe (DevOps, third-party) yönlendirir.

### Detailed Answer

BLOCKED, testin hiç çalıştırılamadığını; FAIL, çalıştırıldığını ve
sistemin yanlış davrandığını gösterir.

### Example

Payment Provider test ortamında erişilemezse test BLOCKED olarak
işaretlenir, ürün kodu suçlanmaz.

### Common Trap

Her çalıştırılamayan testi otomatik olarak FAIL saymak.

---

### Question 5

Requirement Traceability Matrix (RTM) nedir?

### Short Answer

Her requirement'ın hangi test case(ler) tarafından kapsandığını
gösteren tablodur.

### Detailed Answer

RTM, kapsanmamış AC'leri görünür kılar ve coverage boşluklarının
erken tespit edilmesini sağlar.

### Example

REQ-AUTH-001 → AC-AUTH-009 satırında hiç Test Case yoksa, bu bir
coverage boşluğudur.

### Common Trap

RTM'i bir kez oluşturup hiç güncellememek.

---

### Question 6

Test Coverage nasıl ölçülür?

### Short Answer

Yalnızca test case sayısıyla değil, Requirement/Risk/Flow coverage
boyutlarıyla ölçülür.

### Detailed Answer

Coverage; her AC'nin en az bir test case'i olup olmadığı, yüksek
riskli alanların derinliği ve Happy/Negative/Edge dengesiyle
değerlendirilir.

### Example

1000 test case'in 950'si aynı happy path varyasyonuysa coverage
zayıf olabilir.

### Common Trap

Test case sayısını doğrudan coverage kanıtı saymak.

---

### Question 7

QA Metriklerinde "Metric ≠ Quality" ne anlama gelir?

### Short Answer

Bir metrik değeri, kalitenin kendisi değil, yalnızca bir göstergesidir
ve yanlış yorumlanabilir.

### Detailed Answer

%100 Pass Rate veya 5000 Test Case gibi rakamlar, bağlamsız
sunulduğunda yanıltıcı bir güven duygusu yaratabilir.

### Example

%100 Pass Rate, yalnızca happy path test edilmişse anlamsız kalır.

### Common Trap

Yüksek bir sayıyı otomatik olarak "iyi" kabul etmek.

---

### Question 8

Escaped Defect / Defect Leakage nedir?

### Short Answer

Test sürecinde yakalanmayıp production'da ortaya çıkan defect'lerdir.

### Detailed Answer

Bu metrik, test stratejisinin gerçek etkinliğini gösteren en dürüst
göstergelerden biridir.

### Example

Bir defect test sürecinde hiç bulunmayıp kullanıcı tarafından
production'da fark edilirse, bu bir escaped defect'tir.

### Common Trap

Bu metriği hiç takip etmemek.

---

### Question 9

Daily QA Status ile Executive Summary arasındaki fark nedir?

### Short Answer

Daily QA Status günlük ekip içi detay, Executive Summary üst
yönetime yönelik iş etkisi odaklı özet raporudur.

### Detailed Answer

Hedef kitle ve detay seviyesi farklıdır; aynı veri farklı formatlarda
sunulur.

### Example

Daily Status: "3 yeni bug bulundu." Executive Summary: "Release
riski düşük, GO öneriliyor."

### Common Trap

Tüm hedef kitlelere aynı detay seviyesinde rapor göndermek.

---

### Question 10

Bir Release Test Report'ta hangi alanlar bulunmalıdır?

### Short Answer

Scope, Execution, Passed/Failed/Blocked, Open Defects, Critical
Risks, Known Issues, Untested Areas, QA Recommendation.

### Detailed Answer

Bu alanlar, release kararını bilgilendirecek eksiksiz bir tablo
oluşturur; herhangi biri eksikse karar eksik bilgiyle verilir.

### Example

Untested Areas eksikse, "tablet ekranı test edilmedi" bilgisi karar
vericiye ulaşmaz.

### Common Trap

Yalnızca Passed/Failed sayılarını raporlayıp Known Issues ve
Untested Areas'ı atlamak.

---

### Question 11

QA Sign-Off, Conditional Sign-Off ve No-Go arasındaki fark nedir?

### Short Answer

GO tüm kriterler karşılandığında, CONDITIONAL GO kabul edilebilir
riskle, NO-GO kritik risk varken verilir.

### Detailed Answer

Her karar somut kanıta (defect, risk, metrik) dayanmalı ve
CONDITIONAL GO'da koşullar açıkça belirtilmelidir.

### Example

Açık bir Critical payment bug'ı varsa NO-GO; düşük severity bir
known issue varsa CONDITIONAL GO.

### Common Trap

NO-GO'yu gerekçesiz vermek.

---

### Question 12

QA tek başına release kararı verir mi?

### Short Answer

Hayır; QA riski görünür kılar ve recommendation sağlar, nihai karar
business ile birlikte verilir.

### Detailed Answer

Business, QA'nın NO-GO önerisine rağmen riski bilinçli kabul edip GO
kararı verebilir; bu QA'nın başarısızlığı değildir.

### Example

Pazarlama kampanyası nedeniyle business, CONDITIONAL GO önerisine
rağmen riski kabul edip release edebilir.

### Common Trap

QA'nın release owner olduğunu düşünmek.

---

### Question 13

Known Issue nedir, ne zaman kullanılır?

### Short Answer

Düşük etkili, business tarafından bilinçli kabul edilmiş, dokümante
edilmiş sorunlar için kullanılır.

### Detailed Answer

Known Issue şeffaftır — Accepted By bilgisi ve Target Fix planı
içerir; gizlenmiş bir sorun değildir.

### Example

Yanlış dilde placeholder metni, düşük etki nedeniyle Known Issue
olarak kabul edilebilir.

### Common Trap

Bir sorunu QA'nın kendi kararıyla önemsiz ilan edip hiç raporlamamak.

---

### Question 14

Smoke, Sanity ve Regression Suite'lerini ne zaman kullanırsınız?

### Short Answer

Smoke her build sonrası, Sanity küçük fix sonrası, Regression release
öncesi/büyük değişiklik sonrası kullanılır.

### Detailed Answer

Üçü farklı kapsam ve süreye sahiptir; doğru suite'in seçilmesi zaman
yönetiminin temelidir.

### Example

Küçük bir UI fix'i sonrası tam Regression yerine Sanity yeterlidir.

### Common Trap

Her küçük fix için tam Regression Suite çalıştırmaya çalışmak.

---

### Question 15

Test Suite ile Test Cycle arasındaki fark nedir?

### Short Answer

Suite statik bir grup, Cycle bu grubun belirli bir zamanda/build'de
çalıştırılmasıdır.

### Detailed Answer

Aynı Test Suite, farklı release'lerde farklı Test Cycle'lar olarak
tekrar tekrar çalıştırılır.

### Example

"Checkout Regression Suite" — v2.1, v2.2, v2.3 release'lerinde ayrı
Test Cycle'lar olarak çalıştırılır.

### Common Trap

Suite ile Cycle'ı aynı kavram sanmak.

---

### Question 16

Bir Test Case ne kadar detaylı olmalıdır?

### Short Answer

Uzunluk değil, başka bir QA'nın anlayıp uygulayabilmesi kriterdir.

### Detailed Answer

Test Case gereksiz uzatılmamalı ama Preconditions, Steps ve Expected
Result yeterince açık olmalıdır.

### Example

Kısa ama tam bir test case, 4 adımlık login senaryosuyla yeterli
olabilir.

### Common Trap

Test Case'i gereksiz yere uzatıp okunabilirliği düşürmek.

---

### Question 17

Entry Criteria karşılanmazsa ne yapılır?

### Short Answer

Test aktivitesine başlanmaz veya riski açıkça kabul ederek kısıtlı
şekilde başlanır.

### Detailed Answer

Örneğin test data eksikse, yalnızca veri gerektirmeyen senaryolarla
başlanıp eksik netleşene kadar diğerleri ertelenebilir.

### Example

Environment ayakta değilse test başlatılmaz.

### Common Trap

Entry Criteria'yı atlayıp hazır olmayan bir build'de teste başlamak.

---

### Question 18

Exit Criteria karşılanmazsa ne yapılır?

### Short Answer

Durum açıkça raporlanır ve Sign-Off kararı buna göre verilir.

### Detailed Answer

Exit Criteria karşılanmadan sessizce "test tamamlandı" denemez;
gerçek durum Release Risk değerlendirmesine dahil edilir.

### Example

Regression %90 (eşik %95) ise bu açıkça raporlanır.

### Common Trap

Exit Criteria karşılanmadığını gizleyip release'e devam etmek.

---

### Question 19

Bir feature'ın test süresini nasıl tahmin edersiniz?

### Short Answer

Requirement karmaşıklığı, risk seviyesi, test data hazırlığı,
bağımlılıklar ve otomasyon durumuna göre.

### Detailed Answer

Estimation'a bilinen kararsız bağımlılıklar için mutlaka buffer
eklenmelidir.

### Example

Kararsız bir Discount Service bağımlılığı varsa estimation'a 0.5 gün
buffer eklenir.

### Common Trap

Estimation'ı yalnızca "kaç test case yazılacak" ile sınırlı yapmak.

---

### Question 20

UAT'ta QA'nın rolü nedir?

### Short Answer

Senaryo hazırlama ve süreç koordinasyonu; kabul kararı business'a
aittir.

### Detailed Answer

QA, UAT senaryolarını business diliyle hazırlar, ortamı hazırlar,
sonuçları konsolide eder — ama nihai kararı vermez.

### Example

QA, UAT sonuçlarını raporlar; business kabul/red kararını verir.

### Common Trap

QA'nın UAT kabul kararını kendisinin verdiğini düşünmek.

---

### Question 21

Reopen Rate neyi gösterir?

### Short Answer

Kapatılan defect'lerin ne kadarının tekrar açıldığını, fix veya
retest kalitesine dair bir sinyal verir.

### Detailed Answer

Yüksek Reopen Rate, ya fix'lerin yetersiz olduğunu ya da retest
disiplininin zayıf olduğunu gösterebilir.

### Example

Bir sprint'te kapatılan 10 bug'dan 4'ü tekrar açılırsa bu yüksek bir
reopen rate'tir.

### Common Trap

Reopen Rate'i hiç izlememek.

---

### Question 22

Jira ile Azure DevOps'un Test Management açısından farkı nedir?

### Short Answer

Azure DevOps native Test Plans modülüne sahiptir; Jira genelde
eklenti (Xray/Zephyr) gerektirir.

### Detailed Answer

İkisi de Bug/Work Item takibini destekler ama Test Case yönetimi
yaklaşımları farklıdır.

### Example

Azure DevOps Test Plans ile suite/cycle organizasyonu native; Jira'da
bu genelde eklentiyle sağlanır.

### Common Trap

İki aracı birebir aynı yeteneklere sahip sanmak.

---

### Question 23

WIP Limit nedir, bu repository'de hangi Knowledge Status'tadır?

### Short Answer

Bir aşamada aynı anda bulunabilecek maksimum kart sayısıdır; ileri
seviye kullanımı LEARNING statüsündedir.

### Detailed Answer

Temel Kanban kullanımı EXPERIENCE'tır ama WIP Limit optimizasyonu,
Flow Efficiency gibi ileri konular LEARNING'dir.

### Example

Board'da kart taşımak EXPERIENCE; optimal WIP sayısını flow
metrikleriyle belirlemek LEARNING'dir.

### Common Trap

WIP Limit'in ileri seviye kullanımını EXPERIENCE olarak sunmak.

---

### Question 24

Bir Kanban board'da Blocked bir kart WIP'e dahil midir?

### Short Answer

Hayır; Blocked, aktif olarak çalışılmayan bir durumdur.

### Detailed Answer

WIP, aktif olarak üzerinde çalışılan işi ölçer; Blocked kartlar
board'da kalır ama akışı temsil etmez.

### Example

Payment Provider engeliyle Blocked olan bir kart, WIP sayısını
yanıltıcı şekilde şişirmemelidir.

### Common Trap

Blocked kartları WIP hesaplamasına dahil etmek.

---

### Question 25

Test Case sayısı neden bir kalite metriği değildir?

### Short Answer

Sayı, yalnızca miktarı gösterir; senaryoların değerini veya
dağılımını göstermez.

### Detailed Answer

Çok sayıda benzer/tekrar eden test case, gerçek riski azaltmadan
sayıyı artırabilir.

### Example

1000 test case'in çoğu aynı happy path'in varyasyonuysa, kritik
Negative/Edge senaryolar hâlâ eksik olabilir.

### Common Trap

"Çok test case = kaliteli sistem" varsayımı.

---

### Question 26

Bir Test Plan'da "Out of Scope" bölümü neden önemlidir?

### Short Answer

Bilinçli olarak test edilmeyen alanları şeffaf şekilde dokümante
eder.

### Detailed Answer

Out of Scope yazılmazsa, sonradan "neden test edilmedi" sorusuna
gerekçeli bir cevap verilemez.

### Example

Çoklu kupon kombinasyonu bu sprint'te Out of Scope olarak
belirtilirse, gelecekte bu bilinçli bir karar olarak izlenebilir.

### Common Trap

Out of Scope bölümünü hiç yazmamak.

---

### Question 27

Confluence, Test Management sürecinde nasıl kullanılır?

### Short Answer

Test Strategy ve Test Plan gibi uzun formatlı dokümanları barındırır;
Jira ile çift yönlü link'lenir.

### Detailed Answer

Confluence bug takibi için kullanılmaz; dokümantasyonun merkezi
kaynağıdır.

### Example

Bir Test Plan Confluence'ta yazılır, ilgili Jira epic'ine link
verilir.

### Common Trap

Confluence'ı bir bug takip aracı gibi kullanmaya çalışmak.

---

## İlgili Konular

- [05-TEST-MANAGEMENT README](README.md)
- [Common Mistakes](COMMON-MISTAKES.md)
