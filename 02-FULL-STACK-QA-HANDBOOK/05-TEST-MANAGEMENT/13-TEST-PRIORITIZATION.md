# Test Prioritization (Test Management Bağlamında)

**Status: EXPERIENCE**

> `02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md`, test
> önceliklendirmenin risk metodolojisini derinlemesine anlatmıştı. Bu
> dosya, aynı önceliklendirmenin **Test Management operasyonuna**
> (suite seçimi, execution sırası, kaynak dağılımı) nasıl yansıdığını
> ele alır.

---

## 1. Neden Önemli?

Risk değerlendirmesi teoride yapılmış olabilir — ama bu değerlendirme
**günlük test operasyonuna** (hangi test case önce çalıştırılır,
hangi suite'e girer) yansımıyorsa değersizdir.

---

## 2. Önceliklendirmenin Operasyonel Yansımaları

### Suite Üyeliği

Yüksek öncelikli senaryolar Smoke Suite'e (bkz.
`06-SMOKE-SANITY-REGRESSION-SUITES.md`), orta öncelikli senaryolar
Regression Suite'e dahil edilir.

### Execution Sırası

Zaman kısıtlı bir Test Cycle'da (bkz.
`05-TEST-SUITE-AND-TEST-CYCLE.md`), en yüksek öncelikli senaryolar
**ilk** çalıştırılır — böylece zaman biterse en kritik alanlar zaten
test edilmiş olur.

### Kaynak Dağılımı

Daha deneyimli QA kaynağı, en yüksek riskli alanlara (örn. ödeme,
authentication) atanır.

### Otomasyon Önceliği

Yüksek öncelikli ve stabil senaryolar, otomasyon backlog'unda üst
sıraya alınır (bkz.
`../03-TEST-DESIGN/12-AUTOMATION-CANDIDATE-ANALYSIS.md`).

---

## 3. Priority Etiketleme Standardı

Test Case'lerde kullanılan Priority etiketleri genellikle Risk
Matrix'ten (bkz. `../02-RISK-BASED-TESTING/03-RISK-MATRIX.md`)
türetilir:

| Priority | Anlamı | Execution Sırası |
|---|---|---|
| Critical | En yüksek riskli, mutlaka test edilmeli | İlk çalıştırılır |
| High | Yüksek riskli, zaman kısıtında öncelikli | İkinci sırada |
| Medium | Orta riskli, zaman varsa çalıştırılır | Üçüncü sırada |
| Low | Düşük riskli, zaman kalırsa çalıştırılır | Son sırada |

---

## 4. Common Mistakes

- Risk değerlendirmesi yapıp bunu Test Case Priority alanına hiç
  yansıtmamak.
- Tüm Test Case'leri "High" olarak etiketleyip önceliklendirmeyi
  anlamsız hale getirmek (bkz.
  `00-QA-FOUNDATIONS/COMMON-MISTAKES.md` — "Her şeyi P0 yapmak").
- Zaman kısıtlı bir cycle'da senaryoları rastgele/alfabetik sırayla
  çalıştırmak.

---

## 5. Best Practices

- Her Test Case'in Priority alanını, Risk Matrix değerlendirmesine
  dayandırın.
- Zaman kısıtlı cycle'larda, en yüksek öncelikli senaryoları önce
  planlayın.
- Priority dağılımını periyodik olarak gözden geçirin — her şeyin
  "Critical" olmadığından emin olun.

---

## 6. Interview Notes

- "Risk değerlendirmesi günlük test operasyonuna nasıl yansır?"
  sorusuna suite üyeliği, execution sırası ve kaynak dağılımı
  örnekleriyle cevap verin.
- "Tüm test case'ler High Priority olursa ne olur?" sorusuna,
  önceliklendirmenin anlamını kaybettiğini belirterek cevap verin.

---

## İlgili Konular

- [02-RISK-BASED-TESTING — Test Prioritization](../02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md)
- [Smoke/Sanity/Regression Suites](06-SMOKE-SANITY-REGRESSION-SUITES.md)
- [Test Estimation](12-TEST-ESTIMATION.md)
