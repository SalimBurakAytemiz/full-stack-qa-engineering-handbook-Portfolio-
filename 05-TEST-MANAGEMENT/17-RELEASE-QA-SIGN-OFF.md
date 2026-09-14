# Release QA Sign-Off

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

QA Sign-Off, bir test operasyonunun **nihai çıktısıdır** — tüm
Test Management aktivitelerinin (Plan, Execution, Reporting) release
kararına dönüştüğü andır. Bu dosya, üç sign-off türünü ve QA'nın
gerçek yetkisinin sınırlarını anlatır.

---

## 2. Üç Sign-Off Türü

### QA Sign-Off (GO)

Tüm Exit Criteria karşılanmış, açık kritik risk yok. QA, release'i
**onaylar**.

### Conditional Sign-Off (CONDITIONAL GO)

Exit Criteria büyük ölçüde karşılanmış ama bazı **kabul edilebilir**
riskler/known issues var. QA, release'i **koşullu olarak onaylar** —
koşullar açıkça belirtilir.

### No-Go Recommendation (NO-GO)

Kritik Exit Criteria karşılanmamış (örn. açık P0 defect, kritik bir
alan hiç test edilememiş). QA, release'i **önermez**.

---

## 3. Örnekler

### GO Örneği

> "Kupon Kodu feature'ı için tüm planlanan test senaryoları
> çalıştırıldı. P0/P1 defect yok. Regression %97 PASS oranıyla
> tamamlandı. QA Recommendation: **GO**."

### CONDITIONAL GO Örneği

> "Kupon Kodu feature'ı için testler tamamlandı. 1 adet Low severity
> defect açık (BUG-COUPON-002, kabul edilebilir). Discount Service'in
> test ortamında zaman zaman kararsız olduğu gözlemlendi ancak
> production'da bu servis farklı bir altyapıda çalışıyor. QA
> Recommendation: **CONDITIONAL GO** — production'a çıkış sonrası
> ilk 2 saat Discount Service metrikleri yakından izlenmelidir."

### NO-GO Örneği

> "Ödeme akışında, belirli kart tiplerinde çift tahsilat riski
> tespit edildi (BUG-PAYMENT-014, Critical). Root cause henüz
> izole edilemedi. QA Recommendation: **NO-GO** — bu defect
> çözülmeden release önerilmez."

---

## 4. QA Tek Başına Release Owner Değildir

**Bu, bu dosyanın en kritik prensibidir.**

QA, release kararını **tek başına vermez**. QA'nın rolü:

- Kalite riskini **görünür hale getirmek** (test sonuçları, açık
  defect'ler, untested areas).
- Bu bilgiye dayanan bir **recommendation** (GO/CONDITIONAL
  GO/NO-GO) sunmak.

Nihai release kararı, genellikle **business/product owner ile
birlikte**, bazen QA'nın NO-GO önerisine rağmen (business'ın riski
bilinçli olarak kabul etmesiyle) verilir. Bu durumda bile QA'nın
görevi tamamlanmıştır — çünkü riski **açıkça** görünür kılmıştır.

**Örnek:** QA, bir feature için CONDITIONAL GO önerse de, business
"bu risk pazarlama kampanyası nedeniyle bugün release edilmeli"
diyerek riski bilinçli kabul edip GO kararı verebilir. Bu, QA'nın
başarısızlığı değildir — QA riski doğru şekilde raporlamıştır, karar
business'a aittir.

---

## 5. Common Mistakes

- QA'nın release kararını tek başına verdiğini/vermesi gerektiğini
  düşünmek.
- NO-GO önerisini gerekçesiz vermek (somut defect/risk referansı
  olmadan).
- CONDITIONAL GO'da "koşulları" belirtmeden yalnızca "koşullu"
  demek.

---

## 6. Best Practices

- Her Sign-Off kararını somut kanıtla (defect ID, test sonucu,
  metrik) destekleyin.
- CONDITIONAL GO'da koşulları (ne izlenmeli, ne zaman) açıkça yazın.
- Sign-Off kararını `templates/RELEASE-QA-REPORT-TEMPLATE.md`
  formatıyla dokümante edin.

---

## 7. Interview Notes

- "QA Sign-Off, Conditional Sign-Off ve No-Go arasındaki fark
  nedir?" sorusuna somut örneklerle cevap verin.
- "QA release kararını tek başına verir mi?" sorusuna hayır diyerek,
  QA'nın riski görünür kılıp recommendation sağladığını, kararın
  business ile birlikte verildiğini açıklayın.

---

## İlgili Konular

- [Test Reporting](15-TEST-REPORTING.md)
- [02-RISK-BASED-TESTING — Release Risk](../02-RISK-BASED-TESTING/07-RELEASE-RISK.md)
- [templates/RELEASE-QA-REPORT-TEMPLATE.md](templates/RELEASE-QA-REPORT-TEMPLATE.md)
