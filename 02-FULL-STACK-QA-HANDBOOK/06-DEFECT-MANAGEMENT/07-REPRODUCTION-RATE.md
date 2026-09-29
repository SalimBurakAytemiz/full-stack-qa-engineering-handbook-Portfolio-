# Reproduction Rate

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir bug her zaman **her koşulda** aynı şekilde ortaya çıkmayabilir.
Reproduction Rate, bu tutarlılığı ölçer ve hem önceliklendirmeyi hem
de kök neden analizini doğrudan etkiler.

---

## 2. Reproduction Rate Nedir?

**Reproduction Rate**, bir defect'in belirtilen Steps to Reproduce
(bkz. `04-STEPS-TO-REPRODUCE.md`) uygulandığında, **kaç denemede
kaçında** gerçekleştiğinin oranıdır.

**Örnek:** "5/5" — 5 denemenin tamamında tekrarlandı (deterministik).
"2/10" — 10 denemeden yalnızca 2'sinde gerçekleşti (aralıklı/
intermittent).

---

## 3. Neden Önceliklendirmeyi Etkiler?

- **Yüksek Reproduction Rate (örn. 5/5):** Sorun her zaman
  gerçekleşiyor — kullanıcıların büyük çoğunluğu bu sorunla
  karşılaşacaktır. Genellikle daha yüksek Priority alır.
- **Düşük Reproduction Rate (örn. 1/10):** Sorun nadiren gerçekleşiyor
  — belirli, henüz tam anlaşılmamış bir koşula bağlı olabilir. Bu,
  Priority'yi düşürmez ama **araştırma yaklaşımını** değiştirir (bkz.
  bölüm 5).

---

## 4. Neden Kök Neden Analizini Etkiler?

Düşük bir Reproduction Rate, genellikle şu ihtimalleri işaret eder:

- **Race condition** (zamanlamaya bağlı bir hata — bkz.
  `../03-TEST-DESIGN/07-ERROR-GUESSING.md`).
- **Ortam/veri kaynaklı bir faktör** (belirli bir sunucu node'u,
  belirli bir veri durumu — bkz. `14-ROOT-CAUSE-ISOLATION.md`).
- **Belirtilmemiş bir ön koşul** (Steps to Reproduce'da eksik bir
  precondition olabilir).

Bu durumda QA'nın görevi, yalnızca "bazen oluyor" demek değil, **hangi
ek koşulun** farkı yarattığını araştırmaktır.

---

## 5. Düşük Reproduction Rate ile Çalışmak

1. Denemeleri tekrarlarken, her denemenin **koşullarını** (zaman,
   veri, ortam, network durumu) not edin.
2. Başarılı ve başarısız tekrar üretim denemeleri arasında bir **ortak
   fark** arayın (örn. yalnızca belirli bir tarayıcıda, yalnızca
   yoğun trafik anında).
3. Bulduğunuz her ek koşulu, Steps to Reproduce'a **eklenmesi gereken
   bir ipucu** olarak raporlayın — bu, Reproduction Rate'i artırmaya
   yardımcı olabilir.

---

## 6. Örnek

**İlk rapor:** "Checkout sırasında bazen ödeme onayı gecikiyor.
Reproduction Rate: 3/20."

**Araştırma sonrası:** "Yalnızca aynı anda birden fazla sekmeden
işlem yapıldığında gerçekleşiyor. Bu koşulla Reproduction Rate:
8/10."

Bu, düşük bir Reproduction Rate'in, doğru koşul bulunduğunda çok daha
yüksek ve **deterministik** hale gelebileceğini gösterir.

---

## 7. Common Mistakes

- Reproduction Rate'i hiç belirtmeden "bazen oluyor" demek.
- Düşük Reproduction Rate'li bir bug'ı, "tekrar üretemedim" diyerek
  hemen CANNOT REPRODUCE olarak kapatmak (bkz.
  `13-DUPLICATE-REJECTED-NOT-A-BUG.md`) — önce ek koşulları araştırmak
  gerekir.
- Reproduction Rate'i yalnızca bir kez, tek bir denemeyle belirlemek.

---

## 8. Best Practices

- Her defect için en az birkaç deneme yapıp Reproduction Rate'i
  somut bir oran olarak (X/Y) raporlayın.
- Düşük oranlı bug'larda, denemeler arasındaki farkları not edin —
  bu, gizli bir koşulu ortaya çıkarabilir.
- Reproduction Rate'i triage kararına (bkz. `09-DEFECT-TRIAGE.md`)
  girdi olarak kullanın.

---

## 9. Interview Notes

- "Reproduction Rate nedir, neden önemlidir?" sorusuna, önceliklendirme
  ve kök neden analizine etkisini açıklayarak cevap verin.
- "Düşük Reproduction Rate'li bir bug'ı nasıl araştırırsınız?"
  sorusuna, denemeler arası koşul farklarını arayacağınızı belirterek
  cevap verin.

---

## İlgili Konular

- [Steps to Reproduce](04-STEPS-TO-REPRODUCE.md)
- [Root Cause Isolation](14-ROOT-CAUSE-ISOLATION.md)
- [Defect Triage](09-DEFECT-TRIAGE.md)
