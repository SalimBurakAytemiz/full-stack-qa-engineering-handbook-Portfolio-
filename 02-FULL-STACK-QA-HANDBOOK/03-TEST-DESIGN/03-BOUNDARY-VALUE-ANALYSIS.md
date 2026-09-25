# Boundary Value Analysis (BVA)

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Deneyimler gösteriyor ki hatalar en sık **sınır değerlerde**
(partition'ların kenarlarında) oluşur — bir geliştirici `>=` yazması
gerekirken `>` yazabilir, ya da tam tersi. BVA, bu tür hataları
hedefleyen sistematik bir tekniktir.

---

## 2. Örnek: Allowed Length (İzin Verilen Uzunluk)

**Kural:** Kullanıcı adı 8-20 karakter arasında olmalı.

**Test edilecek değerler:**

```text
7   → Reddedilmeli (sınırın hemen altı)
8   → Kabul edilmeli (alt sınır)
9   → Kabul edilmeli (sınırın hemen üstü)
19  → Kabul edilmeli (sınırın hemen altı)
20  → Kabul edilmeli (üst sınır)
21  → Reddedilmeli (sınırın hemen üstü)
```

---

## 3. 2-Point Boundary Yaklaşımı

Yukarıdaki 6 değerlik set, **2-point boundary** yaklaşımıdır: her
sınırın **tam üzerindeki** değer ve **hemen dışındaki** değer test
edilir (8 ve 7; 20 ve 21).

Bu yaklaşım, "sınır dahil mi değil mi" (`>=` vs `>` hatası) tipi
hataları doğrudan hedefler.

---

## 4. 1-Point Boundary Yaklaşımı

Daha hafif bir yaklaşım olan **1-point boundary**, yalnızca sınır
değerlerin kendisini test eder:

```text
8   → Kabul edilmeli
20  → Kabul edilmeli
```

Bu yaklaşım, zaman kısıtlı durumlarda kullanılabilir ama 2-point'e
göre daha az güvenlidir — çünkü sınırın **hemen dışındaki** değerin
yanlışlıkla kabul edilip edilmediğini (örn. 21'in kabul edilmesi
gibi bir hata) doğrudan test etmez.

---

## 5. Karşılaştırma

| Yaklaşım | Test Edilen Değerler (8-20 örneği) | Güven Seviyesi |
|---|---|---|
| 1-point | 8, 20 | Temel — yalnızca sınırların kendisi kabul ediliyor mu |
| 2-point | 7, 8, 9, 19, 20, 21 | Daha yüksek — sınırın her iki tarafı da doğrulanıyor |
| 3-point (nadir kullanılır) | 7, 8, 9, 19, 20, 21 + ortadaki bir değer | En kapsamlı ama genelde EP ile zaten karşılanır |

Bu repository'de, pratik ve dengeli olduğu için **2-point boundary**
yaklaşımı önerilir.

---

## 6. BVA Yalnızca Sayısal Alanlarda mı Kullanılır?

**Hayır.** BVA, sayısal olmayan alanlarda da uygulanabilir:

- **Tarih:** Bir promosyonun geçerlilik tarihinin son günü ve bir
  sonraki gün.
- **Karakter sayısı:** String uzunluğu (yukarıdaki örnek).
- **Liste/koleksiyon boyutu:** "Sepette en fazla 10 ürün olabilir"
  kuralında 9, 10, 11 adet ürün test edilir.
- **Dosya boyutu:** "Maksimum 5MB" kuralında 4.9MB, 5MB, 5.1MB.

---

## 7. Örnek: Sepet Ürün Sayısı

**Kural:** Sepette en fazla 10 farklı ürün bulunabilir.

| Değer | Beklenen |
|---|---|
| 9 ürün | Kabul edilir |
| 10 ürün | Kabul edilir (üst sınır) |
| 11 ürün | Reddedilir, "sepet limiti aşıldı" mesajı gösterilir |

---

## 8. Common Mistakes

- BVA'yı yalnızca sayısal input alanlarına özgü sanmak.
- Yalnızca sınırın kendisini (8, 20) test edip hemen dışındaki
  değerleri (7, 21) atlamak — bu, `>` / `>=` hatalarını kaçırma
  riski taşır.
- BVA'yı EP olmadan, hangi partition'ların sınırı olduğunu
  belirlemeden uygulamaya çalışmak.

---

## 9. Best Practices

- Her sayısal/uzunluk/tarih kısıtı olan alanda otomatik olarak BVA
  uygulamayı alışkanlık haline getirin.
- 2-point boundary'yi varsayılan yaklaşım olarak kullanın.
- BVA'yı her zaman EP ile birlikte planlayın — önce partition'ları
  belirleyin, sonra sınırlarını test edin.

---

## 10. Interview Notes

- "Boundary Value Analysis nedir, neden önemlidir?" sorusuna,
  hataların sınırlarda yoğunlaştığı gözlemiyle cevap verin.
- "1-point ile 2-point boundary arasındaki fark nedir?" sorusuna,
  2-point'in sınırın her iki tarafını da test ettiğini, dolayısıyla
  daha güvenli olduğunu belirterek cevap verin.

---

## İlgili Konular

- [Equivalence Partitioning](02-EQUIVALENCE-PARTITIONING.md)
- [Positive/Negative/Edge/Boundary](10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md)
- [00-QA-FOUNDATIONS — Test Design Techniques Overview](../00-QA-FOUNDATIONS/14-TEST-DESIGN-TECHNIQUES-OVERVIEW.md)
