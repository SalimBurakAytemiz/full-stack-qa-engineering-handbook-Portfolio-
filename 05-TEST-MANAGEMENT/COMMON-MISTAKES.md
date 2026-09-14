# Common Mistakes — Test Management

**Status: EXPERIENCE**

---

## 1. Test Case Sayısını Kalite Sanmak

**Neden yanlış:** Test case sayısı, kapsamın derinliğini veya
doğruluğunu göstermez; birbirine benzeyen düşük değerli tekrarlar
sayıyı şişirebilir.

**Detay:** [10-TEST-COVERAGE.md](10-TEST-COVERAGE.md)

---

## 2. Her Şeyi P0 Yapmak

**Neden yanlış:** Tüm test case'ler/defect'ler "Critical" olarak
etiketlenirse, önceliklendirme anlamını kaybeder ve gerçek kritik
alanlar öne çıkamaz.

**Detay:** [13-TEST-PRIORITIZATION.md](13-TEST-PRIORITIZATION.md)

---

## 3. BLOCKED ile FAIL'i Karıştırmak

**Neden yanlış:** Dış bir bağımlılık nedeniyle çalıştırılamayan bir
test, ürünün hatalı olduğu anlamına gelmez; bu ayrım yapılmazsa
development yanlış yere yönlendirilir.

**Detay:** [07-TEST-EXECUTION-STATUS.md](07-TEST-EXECUTION-STATUS.md)

---

## 4. Evidence Tutmamak

**Neden yanlış:** Evidence olmadan bir bulgu tekrar üretilebilir ve
kanıtlanabilir olmaz; "bug var" demek yeterli bir teknik iddia
değildir.

**Detay:** [08-TEST-EVIDENCE-MANAGEMENT.md](08-TEST-EVIDENCE-MANAGEMENT.md)

---

## 5. Coverage'ı Yalnız Case Count Görmek

**Neden yanlış:** Requirement/Risk/Flow coverage boyutları göz ardı
edildiğinde, yüksek bir sayı yanlış bir güven duygusu yaratabilir.

**Detay:** [10-TEST-COVERAGE.md](10-TEST-COVERAGE.md)

---

## 6. Out of Scope Yazmamak

**Neden yanlış:** Bilinçli olarak test edilmeyen alanlar dokümante
edilmezse, sonradan "neden test edilmedi" sorusuna şeffaf bir cevap
verilemez.

**Detay:** [02-TEST-PLAN.md](02-TEST-PLAN.md)

---

## 7. Known Issue Gizlemek

**Neden yanlış:** Bir sorunu QA'nın kendi kararıyla "önemsiz" ilan
edip business'a hiç bildirmeden release etmek, şeffaflığı ihlal eder.

**Detay:** [18-KNOWN-ISSUES.md](18-KNOWN-ISSUES.md)

---

## 8. Release Riskini Söylememek

**Neden yanlış:** QA Sign-Off kararını (GO/CONDITIONAL GO/NO-GO)
gerekçesiz veya eksik risk bilgisiyle vermek, business'ın bilinçli
bir karar almasını engeller.

**Detay:** [17-RELEASE-QA-SIGN-OFF.md](17-RELEASE-QA-SIGN-OFF.md)

---

## İlgili Konular

- [05-TEST-MANAGEMENT README](README.md)
- [Interview Notes](INTERVIEW.md)
