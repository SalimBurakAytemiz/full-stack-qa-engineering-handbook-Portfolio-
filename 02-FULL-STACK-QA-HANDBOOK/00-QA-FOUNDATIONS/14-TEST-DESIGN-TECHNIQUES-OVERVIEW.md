# Test Design Techniques — Overview

**Status: EXPERIENCE**

> **Kapsam notu:** Bu dosya yalnızca **overview** seviyesindedir. Detaylı
> case'ler, alıştırmalar ve gerçek requirement üzerinden derin uygulama
> `03-TEST-DESIGN/` klasörüne ait olup ileriki bir Phase'de ele
> alınacaktır.

---

## 1. Neden Önemli?

Test Design Techniques, "hangi test case'leri yazmalıyım, kaç tane
yeterli" sorusuna sistematik bir cevap verir. Rastgele test case
yazmak yerine, bu teknikler kapsamı ölçülebilir ve savunulabilir hale
getirir.

---

## 2. Equivalence Partitioning (EP)

**Tanım:** Girdi değerlerini, sistemin aynı şekilde davranması
beklenen gruplara (partition) ayırıp, her gruptan yalnızca bir temsilci
değer test etmek.

**Örnek:** Bir yaş alanı 18-65 arasını kabul ediyorsa:

- Geçerli partition: 18-65 arası (örn. 30 test edilir)
- Geçersiz partition (düşük): 18'den küçük (örn. 10 test edilir)
- Geçersiz partition (yüksek): 65'ten büyük (örn. 80 test edilir)

Her partition'dan bir değer test etmek, o partition'daki tüm değerleri
test etmiş kadar güven sağlar (aynı partition'daki değerlerin aynı
şekilde davranacağı varsayılır).

---

## 3. Boundary Value Analysis (BVA)

**Tanım:** Hataların genellikle sınır değerlerde (partition'ların
kenarlarında) oluştuğu gözlemine dayanan teknik. Sınır değerler ve
hemen yanındaki değerler test edilir.

**Örnek:** Yaş alanı 18-65 arasını kabul ediyorsa:

- 17 (sınırın hemen altı — reddedilmeli)
- 18 (alt sınır — kabul edilmeli)
- 65 (üst sınır — kabul edilmeli)
- 66 (sınırın hemen üstü — reddedilmeli)

BVA, EP ile birlikte kullanıldığında çok güçlü bir kapsam sağlar.

---

## 4. Decision Table Testing

**Tanım:** Birden fazla koşulun farklı kombinasyonlarının, farklı
sonuçlar ürettiği durumlarda kullanılan teknik. Koşullar ve sonuçlar
tablo halinde eşleştirilir.

**Örnek:** Bir kupon kodu sisteminde:

| Kupon Geçerli mi? | Sepet Min. Tutarı Karşılıyor mu? | Sonuç |
|---|---|---|
| Evet | Evet | İndirim uygulanır |
| Evet | Hayır | "Minimum tutar karşılanmadı" hatası |
| Hayır | Evet | "Geçersiz kupon" hatası |
| Hayır | Hayır | "Geçersiz kupon" hatası |

Bu tablo, iki koşulun dört olası kombinasyonunu sistematik şekilde
kapsar.

---

## 5. State Transition Testing

**Tanım:** Bir sistemin farklı durumlar (state) arasında, belirli
olaylarla (event) nasıl geçiş yaptığını test eden teknik.

**Örnek:** Bir sipariş durumu:

```text
Created → Paid → Shipped → Delivered
             ↓
          Cancelled
```

Test edilmesi gereken geçişler:

- Created → Paid (ödeme yapıldığında)
- Paid → Shipped (kargoya verildiğinde)
- Paid → Cancelled (ödeme sonrası iptal edildiğinde)
- Created → Cancelled (ödeme öncesi iptal edildiğinde)

Ayrıca **geçersiz geçişler** de test edilmelidir: örneğin `Created`
durumundan doğrudan `Shipped`'e geçiş mümkün olmamalıdır.

---

## 6. Scenario-Based Testing

**Tanım:** Gerçek kullanıcı davranışını yansıtan uçtan uca senaryolar
üzerinden test etme tekniği. Genellikle "kullanıcı hikayesi" formatında
kurgulanır.

**Örnek:** "Bir kullanıcı ürün arar, filtreler, sepete ekler, kupon
kodu girer, ödeme yapar ve sipariş onayı alır." Bu tek senaryo, birden
fazla fonksiyonun birlikte doğru çalıştığını doğrular.

---

## 7. Error Guessing

**Tanım:** Test edenin deneyim ve sezgisine dayanarak, sistemin
muhtemelen hata vereceği noktaları tahmin edip hedefli test etme
tekniği.

**Örnek:** Bir tarih alanına `29 Şubat 2023` (artık yıl olmayan bir
yılda 29 Şubat) girmeyi denemek — bu, deneyimli bir test edenin
"burada muhtemelen bir hata var" sezgisiyle bulduğu bir senaryodur.

---

## 8. Tekniklerin Birlikte Kullanımı

Bu teknikler birbirini dışlamaz, tamamlar:

- EP, hangi grupları test edeceğinizi belirler.
- BVA, o grupların sınırlarını hedefler.
- Decision Table, birden fazla koşulun kombinasyonlarını kapsar.
- State Transition, sistemin durumlar arası davranışını kapsar.
- Scenario-Based Testing, bunları gerçekçi bir kullanıcı akışında
  birleştirir.
- Error Guessing, deneyime dayalı ek güvence sağlar.

---

## 9. Detaylı Uygulama Nerede?

Bu dosya yalnızca genel tanıtım seviyesindedir. Gerçek requirement'lar
üzerinden derin case'ler, alıştırmalar ve kombinasyon teknikleri
(örn. pairwise testing) `03-TEST-DESIGN/` klasörünün konusudur ve bu
Phase'in kapsamı dışındadır.

---

## 10. Common Mistakes

- Yalnızca "aklıma gelen" test case'leri yazıp sistematik teknik
  kullanmamak.
- BVA'yı yalnızca sayısal alanlara özgü sanmak (tarih, string uzunluğu
  gibi alanlarda da geçerlidir).
- Decision Table'ı yalnızca çok karmaşık sistemler için gerekli sanmak.

---

## 11. Best Practices

- Girdi alanı olan her senaryoda önce EP, sonra BVA uygulamayı alışkanlık
  haline getirin.
- Birden fazla koşulun sonucu etkilediği durumlarda Decision Table
  kullanın.
- Durum bazlı sistemlerde (sipariş, kullanıcı hesabı vb.) State
  Transition diyagramı çıkarın.

---

## 12. Interview Notes

- "Equivalence Partitioning ile Boundary Value Analysis'i birlikte nasıl
  kullanırsınız?" sorusuna somut bir alan (örn. yaş) örneğiyle cevap
  verin.
- "Decision Table Testing'i ne zaman kullanırsınız?" sorusuna birden
  fazla koşulun kombinasyonlarının sonucu etkilediği bir örnekle cevap
  verin.

---

## İlgili Konular

- [Risk-Based Testing Overview](13-RISK-BASED-TESTING-OVERVIEW.md)
- [Test Oracle](08-TEST-ORACLE.md)
- 03-TEST-DESIGN/ (detaylı uygulama — ileriki Phase)
