# Entry / Exit Criteria (Test Management Bağlamında)

**Status: EXPERIENCE**

> `00-QA-FOUNDATIONS/09-ENTRY-AND-EXIT-CRITERIA.md`, Entry/Exit
> Criteria'nın kavramsal temelini örneklerle anlatmıştı. Bu dosya,
> aynı kavramların bir **Test Plan'ın içinde operasyonel olarak nasıl
> kullanıldığını** ele alır.

---

## 1. Neden Önemli?

Test Plan'ın (bkz. `02-TEST-PLAN.md`) en kritik iki alanı Entry ve
Exit Criteria'dır — bunlar olmadan "ne zaman başlarız, ne zaman
biteriz" soruları öznel kalır.

---

## 2. Test Plan İçinde Entry Criteria Nasıl Yazılır?

Entry Criteria, **ölçülebilir ve kontrol edilebilir** koşullar olarak
yazılmalıdır:

**Kötü:** "Sistem hazır olduğunda başlarız."

**İyi:**
- Build, Staging ortamına deploy edilmiş olmalı.
- Smoke Suite (bkz. `06-SMOKE-SANITY-REGRESSION-SUITES.md`) PASS
  olmalı.
- Gerekli test data hazırlanmış olmalı.
- Kritik bağımlılıklar (bkz.
  `01-REQUIREMENT-ANALYSIS/08-DEPENDENCY-ANALYSIS.md`) erişilebilir
  olmalı.

---

## 3. Test Plan İçinde Exit Criteria Nasıl Yazılır?

**Kötü:** "Testler bitince süreç tamamlanır."

**İyi:**
- Planlanan Test Case'lerin %100'ü çalıştırılmış olmalı (BLOCKED
  hariç, gerekçeli).
- Açık P0/Critical defect bulunmamalı.
- Regression Suite en az %95 PASS oranıyla tamamlanmış olmalı.
- Known Issues (bkz. `18-KNOWN-ISSUES.md`) dokümante edilmiş olmalı.

---

## 4. Entry/Exit Criteria Karşılanmadığında Ne Olur?

### Entry Criteria Karşılanmazsa

QA, test aktivitesine **başlamama** veya **riski açıkça kabul ederek
kısıtlı şekilde başlama** kararı verir. Örneğin, test data eksikse,
yalnızca test data gerektirmeyen senaryolarla başlanıp eksik veri
netleşene kadar diğer senaryolar ertelenebilir.

### Exit Criteria Karşılanmazsa

QA, bu durumu **açıkça raporlar** (bkz. `15-TEST-REPORTING.md`) ve
QA Sign-Off (bkz. `17-RELEASE-QA-SIGN-OFF.md`) kararını buna göre
verir — Exit Criteria karşılanmadan sessizce "test tamamlandı"
denmez.

---

## 5. Common Mistakes

- Entry/Exit Criteria'yı Test Plan şablonunda "doldurulması gereken
  bir formalite" olarak görüp gerçek anlamda kullanmamak.
- Exit Criteria karşılanmadığında bunu raporlamadan release'e devam
  etmek.
- Entry Criteria'yı yalnızca "build hazır mı" ile sınırlı tutup test
  data ve dependency durumunu göz ardı etmek.

---

## 6. Best Practices

- Her Test Plan'da Entry/Exit Criteria'yı somut, ölçülebilir
  maddeler halinde yazın.
- Exit Criteria karşılanmadığında, bunu Release Risk değerlendirmesine
  (bkz. `../02-RISK-BASED-TESTING/07-RELEASE-RISK.md`) açıkça dahil
  edin.

---

## 7. Interview Notes

- "Bir Test Plan'da Exit Criteria nasıl yazılır?" sorusuna somut,
  ölçülebilir maddelerle (P0=0, %95 regression) cevap verin.
- "Exit Criteria karşılanmazsa ne yaparsınız?" sorusuna, durumu açıkça
  raporlayıp Sign-Off kararını buna göre vereceğinizi belirterek
  cevap verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Entry & Exit Criteria](../00-QA-FOUNDATIONS/09-ENTRY-AND-EXIT-CRITERIA.md)
- [Test Plan](02-TEST-PLAN.md)
- [Release QA Sign-Off](17-RELEASE-QA-SIGN-OFF.md)
