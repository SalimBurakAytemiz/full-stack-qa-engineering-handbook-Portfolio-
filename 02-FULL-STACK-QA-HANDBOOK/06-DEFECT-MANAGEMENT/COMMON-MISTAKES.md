# Common Mistakes — Defect Management

**Status: EXPERIENCE**

---

## 1. "Çalışmıyor" Diye Bug Açmak

**Neden yanlış:** "Çalışmıyor" bir teşhis değil, bir şikayettir; ne
olduğu, nasıl tekrar üretileceği, ne beklendiği belirsiz kalır.

**Detay:** [03-PROFESSIONAL-BUG-REPORT.md](03-PROFESSIONAL-BUG-REPORT.md)

---

## 2. Environment Yazmamak

**Neden yanlış:** Bir sorun bir ortamda var, başka bir ortamda
olmayabilir; environment bilgisi olmadan sorun yanlış yerde aranır.

**Detay:** [03-PROFESSIONAL-BUG-REPORT.md](03-PROFESSIONAL-BUG-REPORT.md)

---

## 3. Build/Version Yazmamak

**Neden yanlış:** Hangi kod versiyonunda gözlemlendiği bilinmezse,
fix sonrası retest'in doğru build'de yapıldığı doğrulanamaz.

**Detay:** [03-PROFESSIONAL-BUG-REPORT.md](03-PROFESSIONAL-BUG-REPORT.md)

---

## 4. Steps Eksik Yazmak

**Neden yanlış:** Belirsiz adımlar, defect'in tekrar üretilmesini
imkansız veya tutarsız hale getirir.

**Detay:** [04-STEPS-TO-REPRODUCE.md](04-STEPS-TO-REPRODUCE.md)

---

## 5. Expected/Actual Ayırmamak

**Neden yanlış:** İkisi tek bir cümlede birleştirildiğinde, hangi
kısmın beklenen hangi kısmın gerçekleşen olduğu net anlaşılmaz.

**Detay:** [05-EXPECTED-VS-ACTUAL.md](05-EXPECTED-VS-ACTUAL.md)

---

## 6. Severity/Priority Karıştırmak

**Neden yanlış:** Severity teknik etkiyi, Priority çözüm aciliyetini
ölçer; ikisi her zaman aynı değildir (örn. Low Severity/High
Priority).

**Detay:** [06-SEVERITY-VS-PRIORITY.md](06-SEVERITY-VS-PRIORITY.md)

---

## 7. Evidence Eklememek

**Neden yanlış:** Evidence olmadan bir bulgu "iddia" düzeyinde kalır,
teknik olarak kanıtlanabilir hale gelmez.

**Detay:** [08-DEFECT-EVIDENCE.md](08-DEFECT-EVIDENCE.md)

---

## 8. Aynı Bug'ı Duplicate Açmak

**Neden yanlış:** Zaten kayıtlı bir defect'in tekrar açılması,
takibi zorlaştırır ve development'ın zamanını gereksiz yere alır.

**Detay:** [13-DUPLICATE-REJECTED-NOT-A-BUG.md](13-DUPLICATE-REJECTED-NOT-A-BUG.md)

---

## 9. Retest Yapmadan Close Etmek

**Neden yanlış:** Fix'in gerçekten işe yaradığı kanıtlanmadan
kapatılan bir defect, sessizce tekrar ortaya çıkabilir.

**Detay:** [10-RETEST.md](10-RETEST.md)

---

## 10. Fix Sonrası Regression Yapmamak

**Neden yanlış:** Bir fix, hedeflediği sorunu çözerken başka bir yeri
bozabilir; bu yalnızca regression testiyle yakalanabilir.

**Detay:** [12-REGRESSION-AFTER-FIX.md](12-REGRESSION-AFTER-FIX.md)

---

## 11. Environment Incident'ı Application Defect Sanmak

**Neden yanlış:** Bir sorunun ortam/altyapı kaynaklı olduğunu fark
etmeden "feature çalışmıyor" diye raporlamak, development'ı yanlış
yere yönlendirir.

**Detay:** [14-ROOT-CAUSE-ISOLATION.md](14-ROOT-CAUSE-ISOLATION.md)

---

## İlgili Konular

- [06-DEFECT-MANAGEMENT README](README.md)
- [Interview Notes](INTERVIEW.md)
