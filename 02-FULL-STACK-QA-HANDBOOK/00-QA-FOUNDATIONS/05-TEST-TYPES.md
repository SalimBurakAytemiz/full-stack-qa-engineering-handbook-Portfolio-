# Test Types

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Test seviyeleri "nerede" test edildiğini, test türleri ise "ne amaçla"
test edildiğini tanımlar. Bu ikisinin karıştırılması, yanlış test
stratejisi kurulmasına yol açar. Bu dosya en sık kullanılan test
türlerini ve aralarındaki kritik farkları anlatır.

---

## 2. Functional Testing

**Definition:** Sistemin fonksiyonel requirement'lara uygun davranıp
davranmadığının test edilmesi.

**Purpose:** Business kurallarının doğru uygulandığını doğrulamak.

**When to use:** Her yeni özellik veya değişiklikte.

**Example:** Kupon kodu girildiğinde doğru indirim tutarının
uygulanması.

**Common confusion:** Functional testing, "her şeyi kapsayan genel test"
sanılabilir; oysa performance, security gibi non-functional alanları
kapsamaz.

---

## 3. Regression Testing

**Definition:** Yeni bir değişikliğin, mevcut çalışan fonksiyonları
bozup bozmadığının kontrol edilmesi.

**Purpose:** Yeni geliştirmenin yan etkilerini yakalamak.

**When to use:** Her release öncesi, önemli bir değişiklik sonrası.

**Example:** Ödeme akışına yeni bir kart tipi eklendikten sonra, mevcut
kart tiplerinin hâlâ çalıştığının doğrulanması.

**Common confusion:** Regression Testing ile Retest karıştırılır —
bkz. bölüm 10.

---

## 4. Smoke Testing

**Definition:** Yeni bir build/deployment sonrası, sistemin en kritik
fonksiyonlarının çalışıp çalışmadığının hızlı kontrolü.

**Purpose:** Detaylı teste geçmeden önce build'in "test edilebilir"
olduğunu doğrulamak.

**When to use:** Her yeni build/deployment sonrası, ilk adım olarak.

**Example:** Uygulama açılıyor mu, login çalışıyor mu, ana sayfa
yükleniyor mu?

**Common confusion:** Smoke Testing ile Sanity Testing karıştırılır —
bkz. bölüm 9.

---

## 5. Sanity Testing

**Definition:** Belirli bir değişiklik veya fix sonrasında, ilgili
alanın hızlıca kontrol edilmesi.

**Purpose:** Yapılan fix'in mantıklı çalıştığını doğrulamak; detaylı
regression'a gerek olup olmadığına karar vermek.

**When to use:** Küçük bir fix veya minor değişiklik sonrası.

**Example:** "Şifremi unuttum" linkindeki bir hata fix'lendikten sonra,
sadece o akışın hızlıca kontrol edilmesi.

---

## 6. Exploratory Testing

**Definition:** Önceden yazılmış test case'e bağlı kalmadan, test
edenin bilgisi ve sezgisiyle sistemi keşfederek test etmesi.

**Purpose:** Scripted testlerin yakalayamadığı beklenmedik davranışları
bulmak.

**When to use:** Yeni bir özellik ilk kez test edilirken, riskli
alanlarda ek güvence gerektiğinde.

**Example:** Bir form üzerinde beklenmedik karakter kombinasyonları
veya hızlı ardışık tıklamalarla sistemin davranışını gözlemlemek.

**Common confusion:** "Plansız/rastgele test" ile karıştırılır; oysa
exploratory testing hedefli ve zaman kutulu (time-boxed) yürütülür.

---

## 7. Integration Testing

**Definition:** İki veya daha fazla modül/servisin birlikte doğru
çalıştığının test edilmesi.

**Purpose:** Modüller arası veri akışı ve sözleşme (contract) hatalarını
yakalamak.

**When to use:** Modüller arası entegrasyon değiştiğinde veya yeni bir
entegrasyon eklendiğinde.

**Example:** Sipariş servisinin, ödeme servisinden doğru onay cevabını
alması.

**Common confusion:** Integration Testing ile End-to-End Testing
karıştırılır — bkz. bölüm 11.

---

## 8. End-to-End Testing (E2E)

**Definition:** Kullanıcının gerçek dünyada izleyeceği tam akışın,
uçtan uca test edilmesi.

**Purpose:** Sistemin bir bütün olarak, gerçek kullanım senaryosunda
doğru çalıştığını doğrulamak.

**When to use:** Kritik kullanıcı yolculuklarında (örn. checkout akışı).

**Example:** Kullanıcının ürün araması → sepete eklemesi → ödeme
yapması → sipariş onayı alması.

---

## 9. Smoke vs Sanity — Detaylı Fark

| | Smoke Testing | Sanity Testing |
|---|---|---|
| Ne zaman | Her yeni build sonrası | Küçük bir fix/değişiklik sonrası |
| Kapsam | Sistemin en kritik, geniş fonksiyonları | Fix'lenen dar alan |
| Derinlik | Sığ, hızlı | Sığ ama hedefli |
| Amaç | "Build test edilebilir mi?" | "Bu fix mantıklı çalışıyor mu?" |
| Örnek | Login, ana sayfa, ödeme başlatma | Yalnızca "şifremi unuttum" akışı |

Kısaca: **Smoke = genel build sağlığı**, **Sanity = spesifik fix
sağlığı**.

---

## 10. Regression vs Retest — Detaylı Fark

| | Regression Testing | Retest |
|---|---|---|
| Amaç | Yeni değişikliğin **başka** yerleri bozup bozmadığını kontrol etmek | Fix'lenen **aynı** bug'ın gerçekten düzelip düzelmediğini kontrol etmek |
| Kapsam | Geniş, ilgili/ilgisiz alanları içerebilir | Dar, yalnızca ilgili bug |
| Örnek | Kupon kodu fonksiyonuna dokunulduktan sonra, ödeme akışının genelinin test edilmesi | Kupon kodu bug'ı fix'lendikten sonra, sadece o bug'ın senaryosunun tekrar çalıştırılması |

Retest, "bu bug düzeldi mi?" sorusuna cevap verir. Regression, "bu
değişiklik başka bir şeyi bozdu mu?" sorusuna cevap verir. İkisi genelde
birlikte, ama farklı amaçlarla yapılır.

---

## 11. Integration vs E2E — Detaylı Fark

| | Integration Testing | End-to-End Testing |
|---|---|---|
| Kapsam | İki veya birkaç modül/servis arası | Sistemin tamamı, gerçek kullanıcı akışı |
| Odak | Veri akışı, contract doğruluğu | Kullanıcı deneyiminin uçtan uca doğruluğu |
| Örnek | Order servisi ↔ Inventory servisi | Ürün arama → sepet → ödeme → onay |
| Hata Yakalama | Servisler arası sözleşme hataları | Akış kesintileri, kullanıcı deneyimi sorunları |

Integration Testing, sistemin "parçaları" arasındaki ilişkiyi; E2E
Testing, sistemin "bütün olarak kullanıcıya sunduğu deneyimi" test eder.

---

## 12. Diğer Test Türleri (Kısa Özet)

| Tür | Definition | Purpose |
|---|---|---|
| User Acceptance Testing (UAT) | Business/kullanıcı tarafından kabul testi | Gerçek ihtiyacın karşılandığını teyit etmek |
| Compatibility Testing | Farklı cihaz/tarayıcı/OS kombinasyonlarında test | Tutarlı davranışı doğrulamak |
| Localization Testing | Farklı dil/bölge ayarlarında test | Doğru çeviri, format ve kültürel uygunluk |
| Performance Testing | Sistem davranışını yük altında test etme | Yanıt süresi, kararlılık, kapasite doğrulama |
| Security Testing | Güvenlik açıklarını test etme | Yetkisiz erişim, veri sızıntısı riskini azaltmak |
| Accessibility Testing | Erişilebilirlik standartlarına uygunluk testi | Farklı kullanıcı ihtiyaçlarını desteklemek |
| Visual Testing | Arayüzün görsel doğruluğunun test edilmesi | Layout/tasarım bozulmalarını yakalamak |

Bu türlerin detaylı uygulaması ilgili Phase'lerde (Performance, Security,
Accessibility, Visual) ayrıca ele alınacaktır.

---

## 13. Common Mistakes

- Smoke ve Sanity'yi birbirinin yerine kullanmak.
- Regression'ı "her şeyi baştan test etmek" sanmak.
- Integration Testing'i atlayıp doğrudan E2E'ye geçmek (hataların geç
  ve daha maliyetli yakalanmasına yol açar).

---

## 14. Best Practices

- Her release öncesi hangi test türünün hangi sırayla çalıştırılacağını
  netleştirin (Smoke → Functional → Regression → E2E).
- Sanity Testing'i yalnızca dar kapsamlı fix'ler için kullanın; kapsam
  büyüdüğünde Regression'a geçin.
- Exploratory Testing'i scripted testlerin **yerine değil**,
  tamamlayıcısı olarak kullanın.

---

## 15. Interview Notes

- "Smoke ile Sanity arasındaki fark nedir?" sorusunda "genel build
  sağlığı vs spesifik fix sağlığı" ayrımını vurgulayın.
- "Regression ile Retest'i nasıl ayırt edersiniz?" sorusunda "başka
  yerleri bozdu mu vs bu bug düzeldi mi" ayrımını kullanın.
- "Integration Testing ile E2E arasındaki fark nedir?" sorusunda
  scope farkını (birkaç modül vs tüm sistem) somut örnekle anlatın.

---

## İlgili Konular

- [Test Levels](04-TEST-LEVELS.md)
- [Test Oracle](08-TEST-ORACLE.md)
- [Common Mistakes](COMMON-MISTAKES.md)
