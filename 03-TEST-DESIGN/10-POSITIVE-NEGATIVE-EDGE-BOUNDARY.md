# Positive / Negative / Edge / Boundary

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bu dört kavram, test tasarımının en temel sözlüğüdür ama sık sık
birbirine karıştırılır. Bu dosya, hepsini **tek bir örnek** (money
transfer amount — para transferi tutarı) üzerinden karşılaştırarak
farkı netleştirir.

---

## 2. Örnek Kural

**Kural:** Bir para transferi işleminde, minimum transfer tutarı 10
TL, maksimum tek seferlik transfer tutarı 50.000 TL'dir.

---

## 3. Positive (Olumlu)

**Tanım:** Sistemin **kabul etmesi** beklenen, geçerli bir girdi.

**Örnek:** 1.000 TL transfer edilmesi — geçerli aralıkta, sistem
işlemi başarıyla tamamlamalı.

## 4. Negative (Olumsuz)

**Tanım:** Sistemin **reddetmesi** gereken, geçersiz bir girdi.

**Örnek:** -500 TL (negatif tutar) transfer edilmeye çalışılması —
sistem bunu anlamlı bir hata mesajıyla reddetmeli.

## 5. Edge Case (Sınır Durumu)

**Tanım:** Normal kullanımın dışında kalan ama **geçerli olabilecek**,
nadir/sıra dışı bir durum.

**Örnek:** Kullanıcının bakiyesinin **tam olarak** transfer tutarına
eşit olması (örn. bakiye 1.000 TL, transfer tutarı da 1.000 TL) —
işlem tamamlandıktan sonra bakiye tam olarak 0 TL'ye düşmeli. Bu,
geçersiz bir girdi değildir, ama sistemin "yetersiz bakiye" kontrolünü
**yanlışlıkla** tetikleyip tetiklemediğini test eden kritik bir
durumdur.

## 6. Boundary (Sınır Değer)

**Tanım:** Bir kuralın **tam sınırındaki** ve sınırın **hemen
dışındaki** değerler.

**Örnek:**

```text
9 TL      → Reddedilmeli (minimumun altı)
10 TL     → Kabul edilmeli (minimum sınır)
50.000 TL → Kabul edilmeli (maksimum sınır)
50.001 TL → Reddedilmeli (maksimumun üstü)
```

---

## 7. Dördünü Bir Arada Karşılaştırma

| Kavram | Money Transfer Örneği | Beklenen Sonuç | Kategori |
|---|---|---|---|
| Positive | 1.000 TL | Kabul edilir | Geçerli, tipik değer |
| Negative | -500 TL | Reddedilir | Geçersiz girdi |
| Edge Case | Bakiye = Transfer Tutarı (tam eşit) | Kabul edilir, bakiye 0'a düşer | Geçerli ama sıra dışı |
| Boundary (alt) | 9 TL / 10 TL | Reddedilir / Kabul edilir | Sınırın her iki tarafı |
| Boundary (üst) | 50.000 TL / 50.001 TL | Kabul edilir / Reddedilir | Sınırın her iki tarafı |

---

## 8. Kavramlar Arası İlişki

- **Positive** ve **Negative**, girdinin **geçerliliği** ile
  ilgilidir (EP'nin valid/invalid partition ayrımıyla örtüşür — bkz.
  `02-EQUIVALENCE-PARTITIONING.md`).
- **Boundary**, bu partition'ların **sınırlarını** hedefler (bkz.
  `03-BOUNDARY-VALUE-ANALYSIS.md`).
- **Edge Case**, girdinin geçerliliğinden bağımsız olarak, **sistemin
  durumu** veya **kombinasyonun nadirliği** nedeniyle özel dikkat
  gerektiren bir durumdur — her zaman bir "sınır" değeri olmak
  zorunda değildir (bakiye = tutar örneği, sayısal bir sınır değil,
  durumsal bir eşitliktir).

---

## 9. Ek Örnek: Edge Case'in Boundary Olmayan Hâli

**Kural:** "Kullanıcı aynı anda en fazla 3 aktif transfer işlemi
başlatabilir."

**Edge Case:** Kullanıcının tam olarak 3. transferini, önceki
transferlerden biri **tam o anda** tamamlanırken başlatması (race
condition benzeri bir zamanlama durumu). Bu, sayısal bir "sınır
değeri" değildir (3 zaten Boundary testinde kapsanır), ama zamanlama
açısından sıra dışı bir Edge Case'dir.

---

## 10. Common Mistakes

- Edge Case'i her zaman bir Boundary değeriyle eş tutmak — Edge Case
  bazen durumsal/zamanlama kaynaklı olabilir.
- Negative Flow'u (bkz.
  `01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md`)
  ve Negative (girdi geçerliliği) kavramını birbirine karıştırmak —
  ikisi ilişkili ama aynı seviyede değildir (Flow, akış seviyesinde;
  Negative, girdi seviyesindedir).
- Yalnızca Positive senaryoları test edip diğer üçünü "zaman kalırsa"
  diye ertelemek.

---

## 11. Best Practices

- Her kritik girdi alanı için bu dört kategoriyi sistematik olarak
  düşünün.
- Edge Case'leri belirlerken yalnızca sayısal sınırları değil,
  sistemin **durumunu** (state) ve **zamanlamasını** da göz önünde
  bulundurun.
- Dört kategoriyi test planında ayrı ayrı gösterin — bu, coverage'ın
  dengeli olduğunu kanıtlar.

---

## 12. Interview Notes

- "Positive, Negative, Edge ve Boundary'i tek bir örnekle
  karşılaştırır mısınız?" sorusuna money transfer örneğiyle net bir
  tablo çizerek cevap verin.
- "Edge Case her zaman bir Boundary değeri midir?" sorusuna hayır
  diyerek, durumsal/zamanlama kaynaklı Edge Case örnekleriyle cevap
  verin.

---

## İlgili Konular

- [Equivalence Partitioning](02-EQUIVALENCE-PARTITIONING.md)
- [Boundary Value Analysis](03-BOUNDARY-VALUE-ANALYSIS.md)
- [01-REQUIREMENT-ANALYSIS — Happy/Alternative/Negative Flows](../01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md)
