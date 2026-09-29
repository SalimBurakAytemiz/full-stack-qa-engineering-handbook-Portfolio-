# Test Oracle

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir test çalıştırdığınızda "Actual Result"ı neyle karşılaştırırsınız?
Bu sorunun cevabı **Test Oracle**'dır. Test Oracle olmadan bir test
sonucunun PASS mi FAIL mi olduğuna karar vermek mümkün değildir. Bu
yüzden bu bölüm QA Foundations içinde kritik bir konudur.

---

## 2. Test Oracle Nedir?

**Test Oracle**, bir sistemin gerçek davranışının (Actual Result) doğru
olup olmadığına karar vermek için kullanılan **referans kaynağıdır**.

Test Oracle, "Expected Result nereden geliyor?" sorusunun cevabıdır.

---

## 3. Expected Result Nasıl Belirlenir?

Expected Result, rastgele veya sezgisel belirlenmez. Güvenilir bir
kaynaktan (Oracle'dan) türetilir. Bir test case yazılırken "bu senaryoda
beklenen sonuç ne olmalı" sorusunun cevabı, mutlaka bir Oracle'a
dayanmalıdır — aksi halde test, öznel bir tahmine dönüşür.

---

## 4. Oracle Kaynakları

| Kaynak | Açıklama | Örnek |
|---|---|---|
| Requirement | Yazılı iş gereksinimi | "Kupon %10 indirim uygulamalı" |
| Acceptance Criteria | Kabul kriterleri | "Geçersiz kupon girildiğinde hata mesajı gösterilmeli" |
| Business Rule | İş kuralı dokümanı | "Stok 0 ise satın alma butonu pasif olmalı" |
| Database | Veritabanındaki gerçek veri | `orders` tablosundaki `status` alanı |
| API Contract | API sözleşmesi/şeması | OpenAPI/Swagger tanımındaki response şeması |
| Existing System | Önceki/mevcut sistem davranışı | Migration öncesi eski sistemin ürettiği sonuç |
| Design / Figma | Tasarım dokümanları | Buton renginin/yerleşiminin tasarıma uygunluğu |
| Regulatory Rule | Yasal/regülasyon kuralı | KVKK/GDPR kapsamında veri saklama süresi |
| Domain Knowledge | Sektörel/alan bilgisi | Bankacılıkta faiz hesaplama mantığı |

---

## 5. Örnek: Database Test Oracle Olarak

**Senaryo:**

```text
API:
balance = 1500

DB:
balance = 1500
```

Bu durumda API'nin döndürdüğü `balance` değeri ile veritabanındaki
gerçek `balance` değeri karşılaştırılır. Database burada **Test
Oracle** rolündedir — API'nin doğru veri döndürüp döndürmediğine karar
vermek için kullanılır.

---

## 6. Database Her Zaman Mutlak Doğru mudur?

**Hayır.** Bu, sık yapılan bir hatadır.

Database, çoğu zaman güvenilir bir Oracle'dır çünkü sistemin "gerçek
durumunu" tutar. Ancak database'in kendisi de:

- Yanlış bir migration script'i ile bozulmuş olabilir.
- Eski/stale bir veri içeriyor olabilir (cache senkronizasyon sorunu).
- Yanlış bir business logic sonucu hatalı yazılmış olabilir (yani
  database'deki veri, sistemin *bug'ının sonucu* olabilir).

**Örnek:** Eğer bir bug nedeniyle indirim yanlış hesaplanıp
veritabanına yanlış `balance` olarak yazıldıysa, API'nin veritabanıyla
"tutarlı" olması, sonucun **doğru** olduğu anlamına gelmez — sadece
**tutarlı şekilde yanlış** olduğu anlamına gelir.

Bu yüzden database tek başına yeterli bir Oracle değildir; asıl Oracle
genellikle **business rule** veya **requirement**'tır. Database, bu
kuralın doğru uygulanıp uygulanmadığını çapraz kontrol etmek için
kullanılan **ikincil bir doğrulama kaynağıdır**.

---

## 7. Birden Fazla Oracle Kullanmanın Değeri

Güçlü bir test stratejisi, tek bir Oracle'a değil, birden fazla
kaynağın çapraz doğrulamasına dayanır:

1. Requirement: İndirim %10 olmalı.
2. Business Rule: İndirim, sepet toplamına değil, ürün fiyatına
   uygulanmalı.
3. API: Response'ta indirimli fiyat 90 olarak dönüyor.
4. Database: `order_items` tablosunda `discounted_price = 90` yazıyor.

Dört kaynak da birbiriyle tutarlıysa, güven seviyesi yüksektir. Eğer
API ile Database tutarlı ama Business Rule ile tutarsızsa, gerçek
Defect burada ortaya çıkar.

---

## 8. Common Mistakes

- Expected Result'ı "bana mantıklı geldi" diyerek belirlemek (Oracle'sız
  test case).
- Database'i sorgusuz sualsiz "mutlak doğru" kabul etmek.
- Farklı Oracle kaynaklarını hiç çapraz kontrol etmeden tek kaynağa
  güvenmek.

---

## 9. Best Practices

- Her test case'in Expected Result'ı için kullanılan Oracle'ı (Requirement,
  Business Rule vb.) açıkça not edin.
- Database'i Oracle olarak kullanırken, database verisinin kendisinin de
  doğrulanmış olduğundan emin olun.
- Requirement belirsizse, Test Oracle da belirsiz olur — bu durumda önce
  Verification (requirement review) yapılmalıdır.

---

## 10. Interview Notes

- "Test Oracle nedir?" sorusuna yalnızca tanım değil, Expected Result'ın
  kaynağı olduğunu somut bir örnekle anlatın.
- "Database her zaman güvenilir bir Oracle mıdır?" sorusuna, hayır
  diyerek stale/hatalı veri riskini örnekle açıklayın.
- Birden fazla Oracle kaynağının çapraz kontrolüne dair bir örnek
  hazırlayın.

---

## İlgili Konular

- [Verification & Validation](02-VERIFICATION-AND-VALIDATION.md)
- [Error / Defect / Failure](07-ERROR-DEFECT-FAILURE.md)
- [Traceability Fundamentals](10-TRACEABILITY-FUNDAMENTALS.md)
