# Test Data Design

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

En iyi tasarlanmış test case bile, yanlış veya yetersiz test data ile
çalıştırılırsa anlamlı bir sonuç üretmez. Bu dosya, hangi test data
kategorilerinin sistematik olarak düşünülmesi gerektiğini ve neden
gerçek müşteri verisinin **asla** kullanılmaması gerektiğini anlatır.

---

## 2. Test Data Kategorileri

### Valid Data

Sistemin kabul etmesi beklenen, kurallara uygun veri.

**Örnek:** Geçerli formatta bir email adresi.

### Invalid Data

Sistemin reddetmesi gereken, kurallara uymayan veri.

**Örnek:** `@` içermeyen bir email string'i.

### Boundary Data

Bir kuralın sınır değerlerindeki veri (bkz.
`03-BOUNDARY-VALUE-ANALYSIS.md`).

**Örnek:** Minimum sipariş tutarının tam sınırındaki değer.

### Null

Alanın hiç değer içermemesi (veritabanı/API seviyesinde `null`).

**Örnek:** Opsiyonel bir "orta isim" alanına `null` gönderilmesi.

### Empty

Alanın teknik olarak bir değeri olması ama bu değerin boş olması
(`""`, boş dizi `[]`).

**Örnek:** Arama kutusuna hiçbir karakter girmeden arama yapılması.

**Not:** Null ve Empty farklı davranışlara yol açabilir — bir sistem
`null` alanı "belirtilmemiş", boş string'i ise "geçersiz" olarak
işleyebilir. Bu iki durum **ayrı ayrı** test edilmelidir.

### Duplicate

Sistemde zaten var olan bir değerin tekrar kullanılması.

**Örnek:** Zaten kayıtlı bir email adresiyle yeniden kayıt olmaya
çalışmak.

### Expired

Geçerlilik süresi dolmuş veri.

**Örnek:** Süresi dolmuş bir kredi kartı veya kupon kodu.

### Unauthorized

Erişim yetkisi olmayan bir kullanıcıya ait veya bu kullanıcının
erişemeyeceği veri.

**Örnek:** Bir kullanıcının, başka bir kullanıcının sipariş ID'sini
kullanarak veriye erişmeye çalışması.

### Role-Based

Farklı kullanıcı rollerine özgü veri/davranış kombinasyonları.

**Örnek:** Admin, Moderator, Standard User rollerinin her biri için
ayrı test verisi.

### Country-Specific

Ülkeye özgü format/kural gerektiren veri.

**Örnek:** Farklı ülkelerin telefon numarası veya posta kodu
formatları.

### State-Specific

Bir varlığın belirli bir durumda (state) olmasını gerektiren veri
(bkz. `05-STATE-TRANSITION-TESTING.md`).

**Örnek:** `SHIPPED` durumundaki bir siparişin test verisi (iade
senaryosunu test etmek için).

---

## 3. Test Data Kategorilerinin Bir Arada Kullanımı

Gerçek bir test senaryosu genellikle birden fazla kategoriyi
birleştirir:

**Örnek:** "Süresi dolmuş bir kuponu (Expired), zaten bir kez
kullanılmış bir hesapla (Duplicate) tekrar uygulamaya çalışmak" —
bu, Expired ve Duplicate kategorilerinin birleşimidir.

---

## 4. PII veya Gerçek Müşteri Verisi Kullanılmamalıdır

**Kritik kural:** Test data tasarımında **asla** gerçek kullanıcı/müşteri
verisi (PII — Personally Identifiable Information: gerçek isim,
gerçek email, gerçek telefon numarası, gerçek kart bilgisi vb.)
kullanılmamalıdır.

**Nedenleri:**

- **Yasal:** KVKK/GDPR gibi regülasyonlar, kişisel verinin amacı
  dışında (test ortamında) kullanılmasını yasaklar.
- **Güvenlik:** Test ortamları genellikle production kadar sıkı
  güvenlik kontrolüne sahip değildir; gerçek veri sızıntı riski
  taşır.
- **Repository Kuralı:** `CONTRIBUTING.md` — "Real Company Data
  Rule", gerçek şirket/müşteri verisinin repository'ye eklenmesini
  açıkça yasaklar.

**Doğru yaklaşım:** Sentetik (uydurma ama gerçekçi formatta) test
verisi kullanın — örn. `test.user001@example.com`,
`+90 5xx xxx xx xx` formatında kurgusal numaralar.

---

## 5. Common Mistakes

- Yalnızca Valid Data ile test edip Invalid/Boundary/Null/Empty
  kategorilerini atlamak.
- Null ve Empty'yi aynı şey sanıp yalnızca birini test etmek.
- Test ortamında gerçek kullanıcı verisini "elimde zaten var" diyerek
  kullanmak.

---

## 6. Best Practices

- Her test senaryosu için hangi Test Data kategorisinin kullanıldığını
  açıkça belirtin (bkz. `10-TEST-CASES.md` formatı).
- Sentetik veri üretirken gerçekçi formatlar kullanın (gerçek isimler
  değil, ama gerçekçi görünen kurgusal isimler).
- Role-Based ve State-Specific veri setlerini, ilgili test ortamında
  önceden hazırlayıp (seed data) tekrar kullanılabilir hale getirin.

---

## 7. Interview Notes

- "Null ile Empty arasındaki fark neden önemlidir?" sorusuna, farklı
  sistem davranışlarına yol açabileceğini örnekle açıklayın.
- "Test data tasarlarken neden gerçek müşteri verisi kullanılmaz?"
  sorusuna yasal ve güvenlik risklerini belirterek cevap verin.

---

## İlgili Konular

- [Equivalence Partitioning](02-EQUIVALENCE-PARTITIONING.md)
- [Boundary Value Analysis](03-BOUNDARY-VALUE-ANALYSIS.md)
- [CONTRIBUTING.md — Real Company Data Rule](../CONTRIBUTING.md)
