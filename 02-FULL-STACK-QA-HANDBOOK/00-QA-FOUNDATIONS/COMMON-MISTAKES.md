# Common Mistakes — QA Foundations

**Status: EXPERIENCE**

Bu dosya, QA Foundations kapsamındaki konularda sık yapılan yanlış
yaklaşımları bir araya toplar. Her madde, ilgili detaylı dosyaya
referans verir.

---

## 1. QA = Testing Sanmak

**Yanlış yaklaşım:** QA'nın tek işinin test çalıştırmak olduğunu
düşünmek.

**Neden yanlış:** QA, requirement analizi, risk değerlendirmesi, test
stratejisi ve production izleme gibi çok daha geniş bir sorumluluk
alanına sahiptir. Testing, QA'nın yalnızca görünür bir parçasıdır.

**Detay:** [01-QA-QC-AND-SOFTWARE-TESTING.md](01-QA-QC-AND-SOFTWARE-TESTING.md)

---

## 2. Her Şeyi Automate Etmeye Çalışmak

**Yanlış yaklaşım:** "Otomasyon her zaman daha iyidir" düşüncesiyle
her senaryoyu otomatize etmeye çalışmak.

**Neden yanlış:** Bazı senaryolar (nadiren değişen, tek seferlik, karmaşık
görsel doğrulama gerektiren) manuel veya exploratory testing için daha
uygundur. Kör otomasyon, yüksek bakım maliyeti ve yanlış güven
duygusu (false confidence) yaratır.

---

## 3. HTTP 200 = Business Success Sanmak

**Yanlış yaklaşım:** Bir API'nin HTTP 200 döndürmesini, işlemin
business açısından da başarılı olduğu anlamına geldiğini düşünmek.

**Neden yanlış:** Bir API, teknik olarak başarıyla cevap verirken
(200 OK) response body'sinde yanlış bir business sonucu (örn. yanlış
hesaplanmış tutar, boş bir liste, hatalı bir durum) döndürebilir.
HTTP status code yalnızca **iletişimin** başarılı olduğunu gösterir,
**içeriğin doğruluğunu** göstermez.

**Detay:** [08-TEST-ORACLE.md](08-TEST-ORACLE.md)

---

## 4. Retest ile Regression'ı Karıştırmak

**Yanlış yaklaşım:** Bir bug fix'lendikten sonra yalnızca o bug'ı tekrar
test edip "regression da yapıldı" sanmak.

**Neden yanlış:** Retest, yalnızca fix'lenen bug'ın düzelip
düzelmediğini kontrol eder. Regression ise, bu değişikliğin **başka**
alanları bozup bozmadığını kontrol eder. İkisi farklı amaçlara
hizmet eder ve genellikle birlikte yapılmalıdır.

**Detay:** [05-TEST-TYPES.md](05-TEST-TYPES.md)

---

## 5. Smoke ile Sanity'yi Karıştırmak

**Yanlış yaklaşım:** İki terimi birbirinin yerine kullanmak.

**Neden yanlış:** Smoke Testing, yeni bir build'in genel sağlığını
(en kritik fonksiyonlar) hızlıca kontrol eder. Sanity Testing ise,
belirli bir fix/değişiklik sonrası dar bir alanı hedefler. Kapsamları
ve amaçları farklıdır.

**Detay:** [05-TEST-TYPES.md](05-TEST-TYPES.md)

---

## 6. Requirement'ı Sorgulamadan Test Case Yazmak

**Yanlış yaklaşım:** Belirsiz veya eksik bir requirement'ı olduğu gibi
kabul edip doğrudan test case yazmaya başlamak.

**Neden yanlış:** Belirsiz bir requirement'tan yazılan test case,
yanlış bir Expected Result'a dayanabilir. Bu durumda test "PASS"
olsa bile, sistem gerçek ihtiyacı karşılamıyor olabilir.

**Detay:** [02-VERIFICATION-AND-VALIDATION.md](02-VERIFICATION-AND-VALIDATION.md)

---

## 7. Expected Result'ın Kaynağını Bilmemek

**Yanlış yaklaşım:** Bir test case'in Expected Result'ını "bana
mantıklı geldi" diyerek belirlemek.

**Neden yanlış:** Expected Result, güvenilir bir Test Oracle'a
(requirement, business rule, API contract vb.) dayanmalıdır. Aksi
halde test, öznel bir tahmine dönüşür ve yanlış sonuçlar üretebilir.

**Detay:** [08-TEST-ORACLE.md](08-TEST-ORACLE.md)

---

## 8. Her Bug'ı Aynı Severity Yapmak

**Yanlış yaklaşım:** Tüm defect'leri aynı önem seviyesinde raporlamak
veya hepsini "yüksek" işaretlemek.

**Neden yanlış:** Bu, gerçekten kritik olan defect'lerin öne
çıkmasını engeller ve triage sürecini anlamsız hale getirir. Severity,
Risk-Based Testing mantığıyla (Impact değerlendirmesi) belirlenmelidir.

**Detay:** [13-RISK-BASED-TESTING-OVERVIEW.md](13-RISK-BASED-TESTING-OVERVIEW.md)

---

## 9. QA'yı Yalnız Release Sonuna Bırakmak

**Yanlış yaklaşım:** QA'yı yalnızca development tamamlandıktan sonra
sürece dahil etmek.

**Neden yanlış:** Bu yaklaşım, Shift Left prensibinin tam tersidir.
Requirement aşamasında yakalanabilecek belirsizlikler, geç fark
edildiğinde çok daha maliyetli hale gelir.

**Detay:** [11-SHIFT-LEFT-AND-SHIFT-RIGHT.md](11-SHIFT-LEFT-AND-SHIFT-RIGHT.md)

---

## 10. Test Case Sayısını Kalite Metriği Sanmak

**Yanlış yaklaşım:** "1000 test case yazdık, demek ki kaliteliyiz"
düşüncesi.

**Neden yanlış:** Test case sayısı, kapsamın **derinliğini** veya
**doğruluğunu** göstermez. Birbirine çok benzeyen, düşük değerli
test case'ler sayıyı artırır ama gerçek riski azaltmaz. Önemli olan
doğru senaryoların (Risk-Based Testing, Test Design Techniques ile
belirlenen) kapsanmasıdır.

**Detay:** [14-TEST-DESIGN-TECHNIQUES-OVERVIEW.md](14-TEST-DESIGN-TECHNIQUES-OVERVIEW.md)

---

## 11. Environment Problemini Product Bug Olarak Raporlamak

**Yanlış yaklaşım:** Test ortamı kaynaklı bir sorunu (örn. yanlış
konfigürasyon, ayakta olmayan bir dependency) ürün hatası olarak
raporlamak.

**Neden yanlış:** Bu, geliştirme ekibinin zamanını gereksiz yere
harcar ve gerçek Entry Criteria eksikliğini gizler. Environment
sorunları önce environment seviyesinde doğrulanmalıdır.

**Detay:** [09-ENTRY-AND-EXIT-CRITERIA.md](09-ENTRY-AND-EXIT-CRITERIA.md)

---

## 12. Automation PASS'i Release İçin Tek Kalite Ölçütü Sanmak

**Yanlış yaklaşım:** "Otomasyon suite'i yeşil, o zaman release
edebiliriz" düşüncesi.

**Neden yanlış:** Quality Gate, otomasyon sonucunun yanı sıra
performans, bilinen riskler, manuel/exploratory bulgular gibi birden
fazla boyutu değerlendirir. Otomasyon PASS'i tek başına yeterli bir
Exit/Release kriteri değildir.

**Detay:** [15-QUALITY-GATES-OVERVIEW.md](15-QUALITY-GATES-OVERVIEW.md)

---

## İlgili Konular

- [QA Foundations README](README.md)
- [Interview Notes](INTERVIEW.md)
