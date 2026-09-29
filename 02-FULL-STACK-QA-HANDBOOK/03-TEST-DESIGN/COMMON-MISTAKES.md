# Common Mistakes — Requirement & Test Design (Phase 2)

**Status: EXPERIENCE**

Bu dosya, Phase 2 kapsamındaki (Requirement Analysis, Risk-Based
Testing, Test Design) sık yapılan yanlış yaklaşımları bir araya
toplar.

---

## 1. Requirement'ı Okumadan Test Case Yazmak

**Neden yanlış:** Requirement'ın arkasındaki business kuralı ve
belirsizlikleri anlamadan yazılan test case, yanlış bir Expected
Result'a dayanabilir.

**Detay:** [01-REQUIREMENT-ANALYSIS/03-REQUIREMENT-CLARIFICATION.md](../01-REQUIREMENT-ANALYSIS/03-REQUIREMENT-CLARIFICATION.md)

---

## 2. Acceptance Criteria'yı Requirement'ın Tamamı Sanmak

**Neden yanlış:** AC, requirement'ın ölçülebilir alt koşullarıdır;
requirement'ın kendisi genellikle daha geniştir. AC'lere bakıp
"requirement tamamen anlaşıldı" sanmak, kapsam dışı kalan senaryoları
kaçırabilir.

**Detay:** [01-REQUIREMENT-ANALYSIS/01-REQUIREMENT-TYPES.md](../01-REQUIREMENT-ANALYSIS/01-REQUIREMENT-TYPES.md)

---

## 3. Happy Path ile Yetinmek

**Neden yanlış:** Yalnızca en olumlu senaryo test edilirse, sistemin
gerçek kullanıcı davranışının (hatalar, farklı tercihler, sınır
durumlar) büyük kısmı hiç doğrulanmamış olur.

**Detay:** [01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md](../01-REQUIREMENT-ANALYSIS/06-HAPPY-ALTERNATIVE-NEGATIVE-FLOWS.md)

---

## 4. Negative ile Edge Case'i Karıştırmak

**Neden yanlış:** Negative Flow, geçersiz bir girdinin reddedilmesidir;
Edge Case, geçerli ama sınırda/nadir bir durumun doğru çalışmasıdır.
İkisini karıştırmak, Edge Case senaryolarının yanlışlıkla "hata
bekleniyor" gibi test edilmesine yol açar.

**Detay:** [10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md](10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md)

---

## 5. Boundary'yi Rastgele Değerlerle Test Etmek

**Neden yanlış:** Sınır testinde amaç, tam sınır değeri ve sınırın
hemen dışındaki değeri hedeflemektir (örn. 7, 8, 9, 19, 20, 21).
Rastgele değerler (örn. 12, 15) bu hedefi karşılamaz.

**Detay:** [03-BOUNDARY-VALUE-ANALYSIS.md](03-BOUNDARY-VALUE-ANALYSIS.md)

---

## 6. Bütün Kombinasyonları Manuel Test Etmeye Çalışmak

**Neden yanlış:** Birden fazla değişkenin tüm kombinasyonlarını test
etmek (örn. 54 kombinasyon), çoğu proje için gerçekçi değildir ve
kaynak israfına yol açar.

**Detay:** [08-PAIRWISE-COMBINATORIAL-TESTING.md](08-PAIRWISE-COMBINATORIAL-TESTING.md)

---

## 7. Risk ile Severity'yi Aynı Şey Sanmak

**Neden yanlış:** Risk, test öncesi yapılan proaktif bir
değerlendirmedir; Severity, defect bulunduktan sonra yapılan reaktif
bir değerlendirmedir. İkisini karıştırmak, test önceliklendirmesini
yanlış yönlendirir.

**Detay:** [02-RISK-BASED-TESTING/01-RISK-FUNDAMENTALS.md](../02-RISK-BASED-TESTING/01-RISK-FUNDAMENTALS.md)

---

## 8. Test Case Sayısını Coverage Sanmak

**Neden yanlış:** Çok sayıda ama birbirine benzeyen, düşük değerli
test case'ler, sayıyı artırır ama gerçek riski azaltmaz. Önemli olan
doğru senaryoların (EP, BVA, Decision Table ile belirlenen) kapsanmasıdır.

**Detay:** [00-QA-FOUNDATIONS/COMMON-MISTAKES.md](../00-QA-FOUNDATIONS/COMMON-MISTAKES.md)

---

## 9. Automation Candidate = Bütün Regression Demek Sanmak

**Neden yanlış:** Regression suite'inde olmak, bir testin otomatize
edilmesi gerektiği anlamına gelmez. Her test case, Repetition,
Stability, Data Complexity gibi faktörlere göre ayrı ayrı
değerlendirilmelidir.

**Detay:** [12-AUTOMATION-CANDIDATE-ANALYSIS.md](12-AUTOMATION-CANDIDATE-ANALYSIS.md)

---

## 10. Business Rule'u Yalnızca UI Üzerinden Doğrulamak

**Neden yanlış:** UI, business kuralını uygulasa bile, API doğrudan
çağrıldığında (UI bypass edilerek) aynı kural uygulanmıyor olabilir.
Business Rule'lar API ve database seviyesinde de doğrulanmalıdır.

**Detay:** [01-REQUIREMENT-ANALYSIS/05-BUSINESS-RULE-ANALYSIS.md](../01-REQUIREMENT-ANALYSIS/05-BUSINESS-RULE-ANALYSIS.md)

---

## 11. Dependency'leri Göz Ardı Etmek

**Neden yanlış:** Bir feature'ın bağımlı olduğu servisler
(Internal/External/Third-Party) test edilmeden veya en azından
bilinmeden, test kapsamı eksik kalır ve bağımlılık unavailable
olduğunda test stratejisi hazırlıksız yakalanır.

**Detay:** [01-REQUIREMENT-ANALYSIS/08-DEPENDENCY-ANALYSIS.md](../01-REQUIREMENT-ANALYSIS/08-DEPENDENCY-ANALYSIS.md)

---

## 12. Change Impact Yapmamak

**Neden yanlış:** Bir requirement/implementation değiştiğinde,
etkilenen test case'ler, automation ve documentation
güncellenmezse, eski ve artık geçersiz varsayımlarla test etmeye
devam edilir.

**Detay:** [01-REQUIREMENT-ANALYSIS/09-CHANGE-IMPACT-ANALYSIS.md](../01-REQUIREMENT-ANALYSIS/09-CHANGE-IMPACT-ANALYSIS.md)

---

## İlgili Konular

- [03-TEST-DESIGN README](README.md)
- [Interview Notes](INTERVIEW.md)
