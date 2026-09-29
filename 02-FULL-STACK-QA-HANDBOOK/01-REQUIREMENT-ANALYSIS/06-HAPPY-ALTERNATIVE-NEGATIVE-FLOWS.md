# Happy Path / Alternative Flow / Negative Flow

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir requirement'ı yalnızca "en olumlu senaryo" üzerinden analiz etmek,
test kapsamının büyük bir kısmını gözden kaçırır. Bu dosya, üç temel
akış türünü ve Edge Case ile Negative Flow arasındaki farkı bir
E-Commerce Checkout senaryosu üzerinden gösterir.

---

## 2. Happy Path

**Tanım:** Kullanıcının hiçbir hata yapmadan, sistemin beklendiği gibi
çalıştığı, en olağan/başarılı senaryo.

**Checkout Örneği:**

```text
Product
  ↓
Cart
  ↓
Address
  ↓
Payment
  ↓
Order Created
```

Kullanıcı bir ürün seçer, sepete ekler, adres girer, ödeme yapar ve
sipariş başarıyla oluşturulur. Her adım sorunsuz ilerler.

---

## 3. Alternative Flow

**Tanım:** Sistemin desteklediği, ama "en tipik" olmayan, başka
geçerli bir yol izleyen senaryo. Sonuç yine **başarılıdır** ama yol
farklıdır.

**Checkout Örneği:**

> Kullanıcı, kayıtlı kartlarından birini seçmek yerine **yeni bir
> kart** (New Card) girerek ödeme yapar.

Bu, hâlâ geçerli ve desteklenen bir yoldur — sonuç yine başarılı
sipariş oluşturmadır, ama akış (kayıtlı kart seçme yerine yeni kart
girme) farklıdır.

**Diğer örnekler:**

- Kayıtlı adres yerine yeni adres girme.
- Guest checkout (üye olmadan sipariş verme) — üyeli checkout'un
  alternatifi.
- Kupon kodu kullanarak ödeme yapma.

---

## 4. Negative Flow

**Tanım:** Sistemin, geçersiz bir girdi veya durum karşısında,
**kontrollü şekilde reddetmesi** gereken senaryo.

**Checkout Örneği:**

> Ödeme sağlayıcısı (payment provider), kartı **reddeder** (Payment
> Rejected) — örneğin yetersiz bakiye nedeniyle.

Sistem bu durumda siparişi oluşturmamalı, kullanıcıya anlaşılır bir
hata mesajı göstermeli ve sepeti korumalıdır.

**Diğer örnekler:**

- Geçersiz kart numarası girme.
- Süresi dolmuş kart ile ödeme denemesi.
- Zorunlu bir adres alanını boş bırakma.

---

## 5. Edge Case ile Negative Flow Arasındaki Fark

Bu, en sık karıştırılan ayrımlardan biridir.

| | Negative Flow | Edge Case |
|---|---|---|
| **Tanım** | Sistemin bilerek reddetmesi gereken, geçersiz bir girdi/durum | Normal kullanımın sınırında veya nadir/sıra dışı ama **geçerli** olabilecek durum |
| **Beklenen Sonuç** | Kontrollü red (hata mesajı) | Sistem yine de doğru davranmalı (başarılı ya da tanımlı bir şekilde) |
| **Checkout Örneği** | Geçersiz kart numarasıyla ödeme denemesi → reddedilmeli | Sepette tam olarak stokta kalan son 1 adet ürün varken ödeme yapılması → işlem başarıyla tamamlanmalı ve stok 0'a düşmeli |
| **Amaç** | Sistemin "hayır" diyebildiğini doğrulamak | Sistemin sınır durumlarda da doğru çalıştığını doğrulamak |

**Kısaca:** Negative Flow, "bu geçersiz, reddedilmeli" senaryosudur.
Edge Case, "bu geçerli ama sıra dışı, yine de doğru çalışmalı"
senaryosudur.

**Ek örnek:** Checkout sırasında sepette **0 TL tutarında** (örn.
%100 indirim kuponu uygulanmış) bir sipariş oluşturulmaya
çalışılması — bu bir Edge Case'dir (sistem bunu nasıl ele alacağını
tanımlı şekilde bilmelidir: izin verilir mi, verilmez mi, bu
requirement'ta netleştirilmelidir), geçersiz bir girdi değildir.

---

## 6. Neden Üçü de Gereklidir?

Yalnızca Happy Path test edilirse, sistemin "ideal koşullarda" çalıştığı
bilinir ama gerçek kullanıcı davranışının büyük kısmı (hatalar, farklı
tercihler, sınır durumlar) hiç doğrulanmamış olur. Alternative Flow'lar
sistemin esnekliğini, Negative Flow'lar sistemin sağlamlığını
(robustness) doğrular.

---

## 7. Common Mistakes

- Yalnızca Happy Path'i test edip "temel akış çalışıyor" ile
  yetinmek.
- Negative Flow ile Edge Case'i karıştırmak (bkz. bölüm 5).
- Alternative Flow'ları "opsiyonel, zaman kalırsa test ederiz"
  şeklinde düşük öncelikli görmek.

---

## 8. Best Practices

- Her requirement için önce Happy Path'i, sonra "bu akışın başka
  geçerli bir yolu var mı?" (Alternative), sonra "bu akış nerede
  reddedilmeli?" (Negative) sorularını sorun.
- Edge Case'leri ayrı bir kategori olarak listeleyin — Negative
  Flow listesine karıştırmayın.
- Test kapsamını raporlarken üç akış türünü ayrı ayrı gösterin, bu
  coverage'ın dengeli olduğunu kanıtlar.

---

## 9. Interview Notes

- "Alternative Flow ile Negative Flow arasındaki fark nedir?"
  sorusuna, ikisinin de geçerli/geçersiz olma durumuyla (Alternative
  = geçerli farklı yol, Negative = geçersiz, reddedilmeli) cevap
  verin.
- "Edge Case, Negative Flow'un bir türü müdür?" sorusuna hayır
  diyerek, Edge Case'in genelde geçerli ama sınırda bir durum
  olduğunu somut bir örnekle (son 1 stok) açıklayın.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Test Design Techniques Overview](../00-QA-FOUNDATIONS/14-TEST-DESIGN-TECHNIQUES-OVERVIEW.md)
- [03-TEST-DESIGN — Positive/Negative/Edge/Boundary](../03-TEST-DESIGN/10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md)
- [Impact Analysis](07-IMPACT-ANALYSIS.md)
