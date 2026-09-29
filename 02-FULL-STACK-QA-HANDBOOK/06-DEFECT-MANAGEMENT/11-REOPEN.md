# Reopen

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir fix, her zaman işe yaramaz. Reopen, bu durumu ele alan
mekanizmadır ve doğru kullanılmadığında hem ekip verimliliğini hem
de metrikleri (bkz.
`../05-TEST-MANAGEMENT/14-QA-METRICS.md` — Reopen Rate) bozar.

---

## 2. Reopen Nedir?

**Reopen**, Retest (bkz. `10-RETEST.md`) sırasında fix'in **işe
yaramadığı** tespit edildiğinde, defect'in tekrar **development
sürecine** gönderilmesidir.

---

## 3. Reopen Süreci

```text
RETEST
   ↓
FAIL (bug hâlâ gerçekleşiyor)
   ↓
REOPEN
   ↓
IN PROGRESS'e geri döner (bkz. 02-DEFECT-LIFECYCLE.md)
```

---

## 4. Reopen Ne Zaman Yapılır?

Reopen, yalnızca şu koşulda yapılır:

> Retest sırasında, **orijinal Steps to Reproduce** uygulandığında,
> defect **hâlâ** (kısmen veya tamamen) gerçekleşiyor.

**Önemli ayrım:** Eğer Retest sırasında **farklı, yeni bir** sorun
bulunursa (orijinal sorun düzelmiş ama başka bir şey bozulmuş), bu
Reopen değil, **yeni bir defect** olarak raporlanmalıdır — çünkü bu
durum bir Regression'dır (bkz. `12-REGRESSION-AFTER-FIX.md`), aynı
defect'in devamı değildir.

---

## 5. Reopen Notu Nasıl Yazılır?

Bir defect reopen edilirken, **neden** reopen edildiği açıkça
belirtilmelidir:

```text
Reopen Reason: Retest sırasında, orijinal senaryo (yanlış password
ile login denemesi) tekrar uygulandı. Fix sonrası hata mesajı
düzeldi ("Email veya şifre hatalı" gösteriliyor) ANCAK account lock
sayacı artık hiç artmıyor (AC-AUTH-005 ihlali). Bu, fix'in yan
etkisi olabilir.
```

Bu örnek aslında **kısmi bir Regression'a** işaret ediyor olabilir —
gerçek hayatta bu durumda hem Reopen hem de ayrı bir Regression
defect'i açılması değerlendirilebilir; karar, sorunun orijinal
defect'in **doğrudan devamı** mı yoksa **yan etkisi** mi olduğuna
bağlıdır.

---

## 6. Reopen Rate Neden Önemlidir?

`../05-TEST-MANAGEMENT/14-QA-METRICS.md`'de anlatıldığı gibi, yüksek
bir Reopen Rate şunlara işaret edebilir:

- Fix'lerin yeterince test edilmeden (yalnızca "kod çalışıyor" diye)
  merge edilmesi.
- Retest'in yeterince derinlemesine yapılmaması (yalnızca yüzeysel
  kontrol).
- Root Cause'un doğru izole edilmemiş olması (bkz.
  `14-ROOT-CAUSE-ISOLATION.md`) — semptom fix edilmiş, asıl neden
  değil.

---

## 7. Common Mistakes

- Reopen sebebini belirtmeden yalnızca "hâlâ çalışmıyor" demek.
- Yeni bir sorunu (Regression), orijinal defect'i reopen ederek
  raporlamak — bu, Traceability'yi bozar (bkz.
  `../00-QA-FOUNDATIONS/10-TRACEABILITY-FUNDAMENTALS.md`).
- Reopen Rate'i hiç izlememek.

---

## 8. Best Practices

- Her Reopen'da, Retest sırasında gözlemlenen **tam** davranışı not
  edin.
- Reopen ile yeni bir defect açma kararını, sorunun orijinal
  defect'in doğrudan devamı olup olmadığına göre verin.
- Reopen Rate'i periyodik olarak izleyip yüksekse kök nedenini
  (fix kalitesi mi, retest disiplini mi) araştırın.

---

## 9. Interview Notes

- "Reopen nedir, ne zaman yapılır?" sorusuna, Retest FAIL olduğunda
  ve orijinal sorunun hâlâ gerçekleştiği durumda yapıldığını
  belirterek cevap verin.
- "Reopen ile yeni bir defect açmak arasındaki fark nedir?" sorusuna,
  sorunun orijinal defect'in devamı mı yoksa yan etkisi (regression)
  mi olduğuna göre karar verildiğini açıklayarak cevap verin.

---

## İlgili Konular

- [Retest](10-RETEST.md)
- [Regression After Fix](12-REGRESSION-AFTER-FIX.md)
- [05-TEST-MANAGEMENT — QA Metrics](../05-TEST-MANAGEMENT/14-QA-METRICS.md)
