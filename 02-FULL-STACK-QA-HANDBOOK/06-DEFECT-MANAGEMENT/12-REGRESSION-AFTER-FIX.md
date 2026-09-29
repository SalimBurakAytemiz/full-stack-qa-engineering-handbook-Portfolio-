# Regression After Fix

**Status: EXPERIENCE**

> Bu dosya ile [10-RETEST.md](10-RETEST.md) arasında bilinçli bir
> cross-link vardır.

---

## 1. Neden Önemli?

Bir fix, hedeflediği sorunu çözerken **başka bir yeri bozabilir**.
Regression After Fix, bu riski test etme disiplinidir.

---

## 2. Regression After Fix Nedir?

**Temel Soru:** "Bu fix başka bir yeri bozdu mu?"

Fix'lenen alanın **etrafındaki** (ilgili ama doğrudan hedeflenmeyen)
senaryoların, fix sonrası hâlâ doğru çalıştığının doğrulanmasıdır.

---

## 3. Retest ile Aynı Örnek Üzerinden Karşılaştırma

**Senaryo:** "Kupon kodu, sepet başına birden fazla kez
uygulanabiliyor" defect'i fix edildi.

| | Retest | Regression After Fix |
|---|---|---|
| **Soru** | Bu bug düzeldi mi? | Fix başka yeri bozdu mu? |
| **Kapsam** | Yalnızca orijinal senaryo (aynı kuponu ikinci kez uygulama) | İlgili diğer senaryolar (geçerli kupon ilk kez uygulama, süresi dolmuş kupon, min. tutar altı kupon) |
| **Sonuç Yorumu** | FAIL ise → Reopen (bkz. `11-REOPEN.md`) | FAIL ise → Yeni bir defect (Regression) |

---

## 4. Regression Kapsamı Nasıl Belirlenir?

Fix'in **hangi kod alanını** değiştirdiğine bakılarak, Impact Analysis
(bkz.
`../01-REQUIREMENT-ANALYSIS/07-IMPACT-ANALYSIS.md`) prensipleriyle
regression kapsamı belirlenir:

1. Fix, hangi fonksiyonu/modülü değiştirdi?
2. Bu modülü kullanan **başka** hangi senaryolar var?
3. Bu senaryoların hepsi (veya risk bazlı önceliklendirilmiş bir
   alt kümesi — bkz.
   `../02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md`) tekrar test
   edilmeli.

---

## 5. Örnek Regression Kapsamı

**Fix:** Kupon uygulama mantığındaki "kullanım sayısı kontrolü"
düzeltildi.

**Regression Kapsamı:**

- Geçerli kupon, ilk kez uygulanabiliyor mu? (Fix'in olumlu senaryoyu
  bozup bozmadığı)
- Süresi dolmuş kupon hâlâ reddediliyor mu?
- Minimum sepet tutarı altındaki kupon hâlâ reddediliyor mu?
- Farklı kullanıcıların aynı kuponu (kullanıcı bazlı kısıtlama varsa)
  kullanabilmesi hâlâ çalışıyor mu?

---

## 6. Common Mistakes

- Yalnızca Retest yapıp Regression'ı hiç planlamamak.
- Regression kapsamını fix'in gerçek etki alanına göre değil,
  rastgele belirlemek.
- Regression sırasında bulunan yeni bir sorunu, orijinal defect'in
  "reopen"ı olarak raporlamak (bu bir kavram karışıklığıdır — bkz.
  `11-REOPEN.md`).

---

## 7. Bu Repository'de Regression Durumu

`examples/AUTHENTICATION-BUG/11-REGRESSION.md` dosyasında planlanan
regression alanları listelenmiştir, ancak bu Phase'de **gerçekten
çalıştırılmamıştır** — Status `NOT EXECUTED` olarak işaretlenmiştir
(bkz. `CONTRIBUTING.md` — Evidence Integrity).

---

## 8. Best Practices

- Her fix sonrası, Impact Analysis ile regression kapsamını
  belirleyin.
- Regression kapsamını Risk-Based Testing ile önceliklendirin —
  her regression'ı sıfırdan, aynı derinlikte planlamayın.
- Regression sırasında bulunan sorunları, doğru şekilde (reopen mu,
  yeni defect mi) sınıflandırın.

---

## 9. Interview Notes

- "Regression After Fix'in kapsamını nasıl belirlersiniz?" sorusuna
  Impact Analysis prensipleriyle cevap verin.
- "Retest ile Regression After Fix'i aynı örnek üzerinden ayırt eder
  misiniz?" sorusuna kupon kodu örneğiyle cevap verin.

---

## İlgili Konular

- [Retest](10-RETEST.md)
- [01-REQUIREMENT-ANALYSIS — Impact Analysis](../01-REQUIREMENT-ANALYSIS/07-IMPACT-ANALYSIS.md)
- [templates/REGRESSION-IMPACT-TEMPLATE.md](templates/REGRESSION-IMPACT-TEMPLATE.md)
