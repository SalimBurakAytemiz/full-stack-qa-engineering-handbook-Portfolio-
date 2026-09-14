# Regression Impact

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir defect'in kendisi kadar, o defect'in **başka alanları etkileyip
etkilemediği** de önemlidir. Regression Impact, bu genişletilmiş
değerlendirmeyi kapsar.

---

## 2. Regression Impact Nedir?

Bir defect'in (fix edilmeden önce veya fix edildikten sonra),
sistemin **başka alanlarını** ne ölçüde etkilediğinin
değerlendirilmesidir.

**Not:** Bu, `12-REGRESSION-AFTER-FIX.md`'de anlatılan "fix sonrası
regression testi" ile ilişkili ama farklı bir kavramdır — Regression
Impact, defect'in **kendisinin** etki alanını değerlendirir (fix
öncesi bile), Regression After Fix ise fix'in **kendisinin** yan
etkilerini test eder.

---

## 3. Regression Impact Değerlendirmesi

Bir defect bulunduğunda şu sorular sorulur:

- Bu defect, yalnızca bir ekranı mı etkiliyor, yoksa birden fazla
  akışta mı ortaya çıkıyor?
- Bu defect'in kök nedeni (bkz. `14-ROOT-CAUSE-ISOLATION.md`), paylaşılan
  bir bileşende mi (örn. ortak bir validation fonksiyonu)?
- Bu defect, benzer başka senaryolarda da gerçekleşiyor mu?

---

## 4. Örnek

**Defect:** "Kupon kodu doğrulama fonksiyonunda, boş string bir
input null pointer hatasına yol açıyor."

**Regression Impact Değerlendirmesi:**

> Bu doğrulama fonksiyonu yalnızca kupon kodu alanında değil, aynı
> zamanda "Referans Kodu" ve "Hediye Kartı Kodu" alanlarında da
> **paylaşılan bir yardımcı fonksiyon** olarak kullanılıyor. Bu
> defect'in kök nedeni bu paylaşılan fonksiyondaysa, aynı hatanın
> Referans Kodu ve Hediye Kartı Kodu akışlarında da test edilmesi
> gerekir.

Bu değerlendirme, tek bir defect raporunun, **regression kapsamını**
genişletebileceğini gösterir.

---

## 5. Regression Impact ile Triage İlişkisi

Regression Impact değerlendirmesi, genellikle Defect Triage (bkz.
`09-DEFECT-TRIAGE.md`) sırasında yapılır ve Priority kararını
etkileyebilir — geniş etki alanına sahip bir defect, dar etkili bir
defect'ten daha yüksek Priority alabilir.

---

## 6. Common Mistakes

- Bir defect'i yalnızca ilk bulunduğu ekran/senaryo bağlamında
  değerlendirip, paylaşılan bileşenler üzerindeki geniş etkisini göz
  ardı etmek.
- Regression Impact değerlendirmesini triage sürecine dahil etmemek.

---

## 7. Best Practices

- Her defect için, kök nedeninin paylaşılan bir bileşende olup
  olmadığını sorgulayın.
- Regression Impact bulgularını `templates/REGRESSION-IMPACT-TEMPLATE.md`
  ile dokümante edin.
- Geniş etkili defect'leri Priority kararına yansıtın.

---

## 8. Interview Notes

- "Regression Impact nedir, Regression After Fix'ten nasıl
  farklıdır?" sorusuna, birinin defect'in kendi etki alanını,
  diğerinin fix'in yan etkisini değerlendirdiğini belirterek cevap
  verin.
- "Paylaşılan bir bileşendeki bir defect neden geniş etkili
  olabilir?" sorusuna kupon kodu/referans kodu örneğiyle cevap
  verin.

---

## İlgili Konular

- [Regression After Fix](12-REGRESSION-AFTER-FIX.md)
- [Root Cause Isolation](14-ROOT-CAUSE-ISOLATION.md)
- [templates/REGRESSION-IMPACT-TEMPLATE.md](templates/REGRESSION-IMPACT-TEMPLATE.md)
