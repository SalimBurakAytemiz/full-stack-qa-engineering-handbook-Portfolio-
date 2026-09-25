# Business Rule Analysis

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir API'nin HTTP 200 dönmesi, işlemin **teknik olarak** başarılı
olduğunu gösterir — **business açısından doğru** olduğunu göstermez.
Bu dosya, Technical Validation ile Business Rule Validation arasındaki
farkı ve bunun neden kritik olduğunu anlatır.

---

## 2. Technical Validation Nedir?

Sistemin, teknik olarak beklenen formatta ve hatasız cevap
verdiğinin doğrulanmasıdır: doğru status code, doğru JSON şeması,
beklenen alanların varlığı.

## 3. Business Rule Validation Nedir?

Sistemin döndürdüğü cevabın, **iş kurallarına uygun** olup olmadığının
doğrulanmasıdır: doğru hesaplama, doğru yetki kontrolü, doğru durum
geçişi.

---

## 4. Örnek: HTTP 200 = Business Success Değildir

**Senaryo:**

```text
API Response:
HTTP 200
{ "success": true, "transactionId": "TXN-001" }
```

Technical Validation açısından bu response **kusursuzdur**: doğru
status code, doğru JSON yapısı, `success: true`.

**Ancak business açısından:**

> KYC (kimlik doğrulama) süreci tamamlanmamış bir kullanıcıya işlem
> izni verilmişse, bu response business açısından **hatalıdır** —
> sistem olmaması gereken bir işlemi gerçekleştirmiştir.

Bu, yalnızca API response'una bakarak asla yakalanamayacak bir
defect'tir. QA, response'un arkasındaki **business kuralını** bilmeden
bu senaryoyu test edemez.

---

## 5. Diğer Business Rule Örnekleri

### Order (Sipariş)

**Kural:** "Sepette stok dışı bir ürün varsa sipariş oluşturulamaz."

**Technical Validation:** Sipariş oluşturma API'si 200 dönüyor mu?

**Business Rule Validation:** Stok dışı ürün sepetteyken sipariş
gerçekten **reddedilmiş** mi, yoksa sistem yanlışlıkla siparişi
oluşturup stok tutarsızlığı mı yaratmış?

### Payment (Ödeme)

**Kural:** "Ödeme başarısız olduğunda sipariş `PAID` durumuna
geçmemeli."

**Technical Validation:** Ödeme API'si doğru hata kodunu döndürüyor
mu?

**Business Rule Validation:** Ödeme reddedildiğinde sipariş gerçekten
`PENDING`/`FAILED` durumunda mı kalıyor, yoksa yanlışlıkla `PAID`
olarak mı işaretleniyor?

### Discount (İndirim)

**Kural:** "Bir kupon kodu, sepet başına yalnızca bir kez
kullanılabilir."

**Business Rule Validation:** Aynı kupon kodu iki kez uygulanmaya
çalışıldığında sistem gerçekten reddediyor mu, yoksa indirim iki kez
mi uygulanıyor?

### User Role (Kullanıcı Rolü)

**Kural:** "Yalnızca Admin rolü, başka bir kullanıcının hesabını
silebilir."

**Business Rule Validation:** Normal bir kullanıcı, API'yi doğrudan
çağırarak (UI'yi bypass ederek) başka bir kullanıcıyı silebiliyor mu?

### Stock (Stok)

**Kural:** "Eşzamanlı iki sipariş, son 1 adet stoğu aynı anda
tüketemez."

**Business Rule Validation:** İki kullanıcı aynı anda son ürünü
satın almaya çalıştığında, yalnızca biri başarılı oluyor mu (race
condition kontrolü)?

### Refund (İade)

**Kural:** "Teslim edilmemiş bir sipariş için iade işlemi
başlatılamaz."

**Business Rule Validation:** Sipariş durumu `SHIPPED` iken (henüz
`DELIVERED` değilken) iade denemesi gerçekten reddediliyor mu?

---

## 6. Business Rule Validation Nasıl Yapılır?

1. İlgili Business Rule'u requirement/business doküman üzerinden
   netleştirin.
2. Kuralın **hangi katmanda** (UI, API, database) uygulanması
   gerektiğini belirleyin — genellikle birden fazla katmanda
   uygulanmalıdır.
3. Yalnızca UI üzerinden değil, doğrudan API çağrısıyla da kuralın
   ihlal edilip edilemediğini test edin (bkz. bölüm 7).
4. Sonucu yalnızca status code ile değil, gerçek veri durumuyla (DB,
   sonraki API çağrısı) doğrulayın.

---

## 7. Common Mistakes

- Business Rule'u yalnızca UI validasyonu üzerinden doğrulayıp,
  API'nin doğrudan çağrılması durumunda kuralın atlanıp
  atlanmadığını kontrol etmemek.
- HTTP status code'un "success" olmasını, işlemin business açısından
  doğru olduğu anlamına geldiğini varsaymak.
- Business Rule'ları yalnızca happy path'te test edip, kuralın ihlal
  edilmeye çalışıldığı (negative) senaryoları atlamak.

---

## 8. Best Practices

- Her kritik Business Rule için, kuralı **ihlal etmeye çalışan** en
  az bir negative test senaryosu tasarlayın.
- Business Rule'ları yalnızca UI'dan değil, API seviyesinde de
  doğrulayın (UI bypass edilebilir).
- Kritik kurallar için sonucu database seviyesinde de çapraz kontrol
  edin (bkz. `00-QA-FOUNDATIONS/08-TEST-ORACLE.md`).

---

## 9. Interview Notes

- "HTTP 200 neden her zaman business başarısı anlamına gelmez?"
  sorusuna KYC örneğiyle cevap verin.
- "Business Rule Validation'ı nasıl yaparsınız?" sorusuna,
  UI-bypass + API + database çapraz kontrolünü açıklayarak cevap
  verin.

---

## İlgili Konular

- [Requirement Types](01-REQUIREMENT-TYPES.md)
- [00-QA-FOUNDATIONS — Test Oracle](../00-QA-FOUNDATIONS/08-TEST-ORACLE.md)
- [00-QA-FOUNDATIONS — Common Mistakes](../00-QA-FOUNDATIONS/COMMON-MISTAKES.md)
