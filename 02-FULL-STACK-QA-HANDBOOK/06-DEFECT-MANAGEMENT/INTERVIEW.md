# Interview Notes — Defect Management

**Status: EXPERIENCE**

---

### Question 1

Bug, Defect ve Issue arasındaki fark nedir?

### Short Answer

Bug ve Defect bu repository'de eş anlamlıdır; Issue, araç seviyesinde
Bug/Task/Story'yi de kapsayan daha geniş bir terimdir.

### Detailed Answer

Jira/Azure DevOps gibi araçlarda "Issue"/"Work Item" şemsiye terim,
Issue Type olarak "Bug" seçildiğinde bu bir defect'i ifade eder.

### Example

"Jira'da bir issue açtım" — Issue Type: Bug ise bu bir defect
raporudur.

### Common Trap

Issue ve Bug'ı her zaman birebir eş anlamlı sanmak.

---

### Question 2

Tipik bir defect lifecycle'ını anlatır mısınız?

### Short Answer

NEW → OPEN → IN PROGRESS → FIXED → READY FOR RETEST → RETEST →
CLOSED.

### Detailed Answer

Alternatif olarak RETEST FAILED olursa REOPEN'a döner; diğer
resolution'lar DUPLICATE, REJECTED, NOT A BUG, CANNOT REPRODUCE,
WON'T FIX, DEFERRED, KNOWN ISSUE'dur.

### Example

Bir bug FIXED olduktan sonra RETEST'te hâlâ gerçekleşirse REOPEN
edilir.

### Common Trap

Status isimlerinin her organizasyonda birebir aynı olacağını
varsaymak.

---

### Question 3

Profesyonel bir bug raporunda hangi alanlar bulunmalıdır?

### Short Answer

Bug ID, Title, Feature, Platform, Environment, Build, Preconditions,
Steps, Expected/Actual, Reproduction Rate, Severity, Priority,
Evidence, Status gibi en az 15 alan.

### Detailed Answer

Her alan, defect'in tekrar üretilebilir ve kanıtlanabilir olmasını
sağlayan bir amaca hizmet eder.

### Example

Environment eksikse, sorun yanlış ortamda aranabilir.

### Common Trap

Yalnızca Title ve Description yazıp diğer alanları atlamak.

---

### Question 4

İyi bir Bug Title nasıl yazılır?

### Short Answer

`[Platform][Feature] Problem` formatında, spesifik ve anlamlı.

### Detailed Answer

Title, listede tarandığında bile sorunu anlatmalı; "Login bozuk"
gibi belirsiz başlıklar hiçbir değer taşımaz.

### Example

`[Web][Authentication] Invalid password attempt returns generic
system error instead of authentication error`

### Common Trap

"Bug", "Hata var" gibi anlamsız title'lar yazmak.

---

### Question 5

Bad Example ile Good Example Steps to Reproduce arasındaki fark
nedir?

### Short Answer

Good Example precondition, test data ve net numaralı adımlar
içerir; Bad Example bunları atlar.

### Detailed Answer

"Login ol, hata çıkıyor" gibi bir adım seti, başka biri tarafından
tekrar üretilemez; precondition ve spesifik test data eksik olduğu
için.

### Example

Good: "Precondition: Active user exists. 1. Login page'i aç. 2.
Valid email gir..."

### Common Trap

Preconditions'ı atlayıp doğrudan adımlara geçmek.

---

### Question 6

Expected Result ile Actual Result neden ayrı yazılmalıdır?

### Short Answer

Karşılaştırılabilirlik ve netlik için; birleştirilirse hangi kısmın
beklenen hangisinin gerçekleşen olduğu anlaşılmaz.

### Detailed Answer

Expected Result bir Test Oracle'a (requirement, business rule)
dayanmalı; Actual Result gözlemlenen gerçek davranışı, mümkünse
evidence ile göstermelidir.

### Example

Expected: "Email veya şifre hatalı" mesajı. Actual: "System Error"
mesajı.

### Common Trap

İkisini tek bir cümlede birleştirmek.

---

### Question 7

Severity ile Priority arasındaki fark nedir?

### Short Answer

Severity teknik etki seviyesini, Priority çözülme aciliyetini ölçer.

### Detailed Answer

İkisi her zaman aynı değildir; iş bağlamı (zamanlama, kullanıcı
etkisi) Priority'yi Severity'den bağımsız şekillendirebilir.

### Example

Low Severity/High Priority: Önemli bir sunumdan 1 saat önce logo
yanlış renkte.

### Common Trap

Severity ve Priority'ye otomatik olarak aynı değeri atamak.

---

### Question 8

Critical Severity / Low Priority kombinasyonu mümkün müdür?

### Short Answer

Evet ama nadirdir ve genellikle ek gerekçe/mitigasyon planı
gerektirir.

### Detailed Answer

Örneğin kullanımdan kaldırılacak bir sistemdeki kritik bir açık,
teknik olarak ciddi olsa da yakın gelecekte sistem kaldırılacaksa
düşük öncelikli kabul edilebilir — ama güvenlik açıklarında bu karar
dikkatli verilmelidir.

### Example

Bir hafta içinde kaldırılacak eski bir admin panelindeki güvenlik
açığı.

### Common Trap

Bu tür nadir kombinasyonları hiç düşünmeden "Critical = her zaman
High Priority" varsaymak.

---

### Question 9

Reproduction Rate nedir, neden önemlidir?

### Short Answer

Bir defect'in kaç denemede kaçında gerçekleştiğinin oranıdır;
önceliklendirme ve kök neden analizini etkiler.

### Detailed Answer

Düşük Reproduction Rate genellikle race condition veya
ortam/veri kaynaklı bir faktöre işaret eder.

### Example

"3/20" — düşük oran, belirli bir ek koşulun araştırılması gerektiğini
gösterir.

### Common Trap

Reproduction Rate'i hiç belirtmeden "bazen oluyor" demek.

---

### Question 10

Bir bug raporunda hangi evidence türünü ne zaman kullanırsınız?

### Short Answer

Defect türüne göre: UI sorunu için Screenshot, zamanlama sorunu için
Screen Recording, API/Business Rule için API Evidence.

### Detailed Answer

Her evidence türü farklı bir defect kategorisini en iyi şekilde
kanıtlar; yanlış tür seçilirse kanıt zayıf kalır.

### Example

Çift tıklama sorunu Screenshot ile değil Screen Recording ile
belgelenir.

### Common Trap

Her defect türü için aynı (yalnızca screenshot) evidence türünü
kullanmak.

---

### Question 11

Defect Triage nedir, kimler katılır?

### Short Answer

QA, Development, Product'ın severity, priority, owner, release
impact'i birlikte değerlendirdiği süreçtir.

### Detailed Answer

Triage, defect'in geçerliliğini de değerlendirir (DUPLICATE/REJECTED/
NOT A BUG olabilir).

### Example

Bir defect triage'da Low Severity ama High Priority olarak
değerlendirilebilir (iş bağlamı nedeniyle).

### Common Trap

Triage'ı yalnızca QA'nın tek başına yaptığı bir karar sanmak.

---

### Question 12

Retest nedir?

### Short Answer

Fix'lenen defect'in aynı senaryo üzerinde tekrar test edilerek
düzelip düzelmediğinin doğrulanmasıdır.

### Detailed Answer

Retest, orijinal Steps to Reproduce ile birebir yapılmalıdır; farklı
bir senaryo test etmek gerçek fix'i doğrulamaz.

### Example

Yanlış password ile login denemesi fix sonrası tekrar denenir.

### Common Trap

Retest'i atlayıp defect'i doğrudan Closed işaretlemek.

---

### Question 13

Retest ile Regression After Fix arasındaki fark nedir?

### Short Answer

Retest "bu bug düzeldi mi", Regression "fix başka yeri bozdu mu"
sorusuna cevap verir.

### Detailed Answer

Retest dar ve derin (yalnızca orijinal senaryo); Regression geniş ve
sığ (ilgili tüm alan) bir kontrol yapar.

### Example

Kupon kodu fix'i sonrası: Retest = aynı kuponu ikinci kez uygulama;
Regression = geçerli/süresi dolmuş/min. tutar senaryoları.

### Common Trap

Retest ile Regression'ı aynı aktivite sanmak.

---

### Question 14

Reopen ne zaman yapılır?

### Short Answer

Retest'te orijinal sorun hâlâ gerçekleştiğinde.

### Detailed Answer

Eğer Retest sırasında farklı, yeni bir sorun bulunursa bu Reopen
değil, yeni bir defect (regression) olarak raporlanmalıdır.

### Example

Fix sonrası hata mesajı düzelmiş ama account lock sayacı artık
çalışmıyorsa, bu ayrı bir değerlendirme gerektirir.

### Common Trap

Yeni bir sorunu orijinal defect'i reopen ederek raporlamak.

---

### Question 15

Reopen Rate neyi gösterir?

### Short Answer

Fix veya retest kalitesine dair bir sinyal.

### Detailed Answer

Yüksek Reopen Rate, yetersiz fix'lere veya zayıf retest disiplinine
işaret edebilir.

### Example

Bir sprint'te kapatılan 10 bug'dan 4'ü tekrar açılırsa bu yüksek bir
orandır.

### Common Trap

Reopen Rate'i hiç izlememek.

---

### Question 16

Duplicate defect nasıl tespit edilir ve kapatılır?

### Short Answer

Aynı kök soruna işaret eden bir defect zaten kayıtlıysa, yeni kayıt
orijinaline referansla Duplicate olarak kapatılır.

### Detailed Answer

Yalnızca yüzeysel benzerlik yeterli değildir — kök nedenin gerçekten
aynı olduğu doğrulanmalıdır.

### Example

Farklı ekranlarda aynı "generic error" görünmesi ama farklı
nedenlerle olması Duplicate değildir.

### Common Trap

Duplicate kararını kök nedeni doğrulamadan vermek.

---

### Question 17

Rejected ile Not a Bug arasındaki fark nedir?

### Short Answer

Rejected raporlama hatası/geçersiz veri; Not a Bug sistemin
tasarlandığı gibi doğru çalışması.

### Detailed Answer

Rejected'da defect requirement'a belirsiz/ilgisizdir; Not a Bug'da
sistem requirement'a tam uygun davranıyordur.

### Example

Rejected: süresi dolmuş kuponla test edip "çalışmıyor" demek. Not a
Bug: sepet limitinin tasarım gereği 10 olması.

### Common Trap

İkisini aynı anlamda kullanmak.

---

### Question 18

QA'nın root cause analizindeki rolü nedir?

### Short Answer

Kod seviyesinde çözmek zorunda değildir ama sorunun hangi katmandan
kaynaklandığını izole etmeye çalışabilir.

### Detailed Answer

QA; UI, API, Backend, Database, Environment, Server, Third Party gibi
katmanlar arasında izolasyon yapar, kesin teşhisi genelde development/
DevOps'a bırakır.

### Example

6 node'dan yalnızca 1'inde hata varsa, bu bir environment/deployment
sorunu olabilir, genel kod hatası değil.

### Common Trap

QA'nın kök nedeni kod satırı seviyesinde bulması gerektiğini
düşünmek.

---

### Question 19

Bir sorun bazı sunucularda var, bazılarında yok — nasıl
raporlarsınız?

### Short Answer

"Feature çalışmıyor" demek yerine, hangi node/koşulda gerçekleştiğini
spesifik olarak belirtirim.

### Detailed Answer

Tutarsız bir sorunu genellemek, yanlış aciliyet algısı yaratır ve
development'ı yanlış yöne yönlendirir.

### Example

"Login 6 node'un 5'inde çalışıyor, yalnızca Node 6'da başarısız —
DevOps'un Node 6 konfigürasyonunu incelemesi önerilir."

### Common Trap

Tutarsız bir sorunu sistemin tamamını etkiliyormuş gibi raporlamak.

---

### Question 20

Regression Impact nedir, Regression After Fix'ten nasıl farklıdır?

### Short Answer

Regression Impact defect'in kendi etki alanını, Regression After Fix
fix'in yan etkilerini değerlendirir.

### Detailed Answer

Regression Impact, defect'in kök nedeninin paylaşılan bir bileşende
olup olmadığını sorgular.

### Example

Kupon kodu doğrulama fonksiyonundaki bir hata, referans kodu ve
hediye kartı kodu alanlarını da etkileyebilir.

### Common Trap

Bir defect'i yalnızca ilk bulunduğu ekran bağlamında değerlendirmek.

---

### Question 21

Cross-Team bir defect'i nasıl yönetirsiniz?

### Short Answer

Root Cause Isolation ile ilgili katmanları netleştirip tüm ekipleri
koordine ederim.

### Detailed Answer

Defect'in tek bir ekibe yanlış atanmasını önlemek için isolation
bulgularını paylaşırım; owner genelde birincil tetikleyici katmana
en yakın ekiptir.

### Example

Notification gecikmesi hem Notification Service hem DevOps hem
Third Party sağlayıcıyı ilgilendirebilir.

### Common Trap

Cross-team bir defect'i tek bir ekibe atayıp diğer katkıları
izlememek.

---

### Question 22

Production'da bir defect bulunduğunda ilk yaklaşımınız nedir?

### Short Answer

Önce mitigasyon (rollback/feature flag), sonra kalıcı fix.

### Detailed Answer

Mükemmel bir fix beklemek kullanıcı etkisini uzatır; öncelik etkiyi
durdurmaktır.

### Example

Rollback mümkünse önce rollback yapılır, ardından root cause analizi
ve kalıcı fix planlanır.

### Common Trap

Production'da acele bir fix'i yeterince test etmeden tekrar deploy
etmek.

---

### Question 23

QA'nın production'daki rolü nedir?

### Short Answer

Smoke/stability doğrulama ve monitoring izleme (Shift Right).

### Detailed Answer

Her deployment sonrası smoke test, production loglarının düzenli
izlenmesi ve mitigasyon sonrası doğrulama QA'nın sorumluluğundadır.

### Example

Deployment sonrası kritik akışların (login, ödeme) hızlıca
doğrulanması.

### Common Trap

QA'nın production ile hiç ilgilenmemesi gerektiğini düşünmek.

---

### Question 24

Defect Leakage nedir, neden önemlidir?

### Short Answer

Test sürecinde yakalanmayıp production'da ortaya çıkan defect
oranıdır; test etkinliğinin göstergesidir.

### Detailed Answer

Yüksek Defect Leakage, ürünün az hatalı olduğu değil, test sürecinin
yeterince kapsamlı olmadığı anlamına gelebilir.

### Example

Bir defect hiç test sürecinde bulunmayıp yalnızca production'da fark
edilirse, bu escaped bir defecttir.

### Common Trap

Defect Leakage'ı hiç izlememek.

---

### Question 25

Defect Aging neyi gösterir?

### Short Answer

Bir defect'in açık kaldığı süreyi; triage hızı ve kaynak
yeterliliğine dair sinyal verir.

### Detailed Answer

Defect Aging severity ile birlikte değerlendirilmelidir — bir
Critical defect'in uzun süre açık kalması ciddi bir sinyaldir.

### Example

Bir Critical bug'ın 3 hafta açık kalması, triage/kaynak sorununa
işaret edebilir.

### Common Trap

Defect Aging'i severity'den bağımsız değerlendirmek.

---

### Question 26

Jira'da bir bug'ı nasıl raporlarsınız?

### Short Answer

Issue Type: Bug, standart Summary formatı, Description'da tüm
profesyonel alanlar, Environment, Priority, Attachments, Linked
Issues ile.

### Detailed Answer

Severity genelde ayrı bir custom field olarak eklenir çünkü Jira'nın
varsayılan şeması yalnızca Priority içerir.

### Example

`[Web][Authentication] ...` başlığıyla, Steps to Reproduce ve
Evidence eklenerek raporlanır.

### Common Trap

Issue Type'ı yanlış seçmek (Bug yerine Task).

---

### Question 27

Azure DevOps ile Jira'nın Severity/Priority yaklaşımı nasıl
farklıdır?

### Short Answer

Azure DevOps native bir Severity alanına sahiptir; Jira'da bu genelde
custom field gerektirir.

### Detailed Answer

Azure DevOps'ta Severity 1-4 arası native bir skaladır; Jira'da
yalnızca Priority built-in'dir.

### Example

Azure DevOps: Severity=1 (Critical), Priority=2. Jira: Priority
alanı var, Severity için custom field eklenmiş olmalı.

### Common Trap

İki aracın şemasını birebir aynı sanmak.

---

### Question 28

Azure DevOps'ta Bug ile Test Case ilişkisi nasıl kurulur?

### Short Answer

Test Plans modülü, bir Test Case execution'ı sırasında doğrudan Bug
work item'ı oluşturmayı destekler.

### Detailed Answer

Bu, Test Case ile Bug arasındaki link'i otomatik kurar — Jira'da
genelde bir eklenti (Xray/Zephyr) gerektirir.

### Example

Bir Test Case FAIL olduğunda, Azure DevOps üzerinde doğrudan ilişkili
bir Bug oluşturulabilir.

### Common Trap

Test Plans modülünü kullanmadan Bug/Test Case ilişkisini yalnızca
metinle belirtmek.

---

### Question 29

Known Issue ile Rejected defect arasındaki fark nedir?

### Short Answer

Known Issue geçerli ama düşük etkili, bilinçli kabul edilmiş bir
sorundur; Rejected geçersiz/hatalı bir raporlamadır.

### Detailed Answer

Known Issue'da defect gerçektir ve dokümante edilir; Rejected'da
defect'in kendisi geçersiz bulunur.

### Example

Yanlış dilde placeholder metni Known Issue; süresi dolmuş kuponla
test edip "çalışmıyor" demek Rejected.

### Common Trap

Her düşük öncelikli defect'i otomatik olarak Rejected saymak.

---

### Question 30

Bir defect'i "Not a Bug" olarak kapatmadan önce ne yapmalısınız?

### Short Answer

İlgili Requirement/AC ile karşılaştırıp, davranışın gerçekten
tasarlandığı gibi olduğunu doğrulamalısınız.

### Detailed Answer

"Not a Bug" kararı gerekçesiz verilmemeli; requirement referansıyla
desteklenmelidir.

### Example

Sepet limitinin AC-CART-003'te tanımlı 10 ürün sınırı olduğunun
doğrulanması.

### Common Trap

"Not a Bug" kararını requirement referansı olmadan vermek.

---

### Question 31

Bir gerçek defect'i, iş yükünü azaltmak için Rejected olarak
kapatmak neden yanlıştır?

### Short Answer

Bu, Evidence Integrity ve şeffaflık prensiplerini ihlal eder; gerçek
bir sorunu gizler.

### Detailed Answer

Gerçek bir sorun, Known Issue veya Deferred gibi doğru bir
resolution ile şeffaf şekilde ele alınmalıdır, görmezden
gelinmemelidir.

### Example

Düşük öncelikli ama gerçek bir UI sorunu, "Rejected" yerine "Known
Issue" olarak dokümante edilmelidir.

### Common Trap

Gerçek defect'leri iş yükünü azaltmak için geçersiz ilan etmek.

---

## İlgili Konular

- [06-DEFECT-MANAGEMENT README](README.md)
- [Common Mistakes](COMMON-MISTAKES.md)
