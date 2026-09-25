# Risk Fundamentals

**Status: EXPERIENCE**

> Bu klasör, `00-QA-FOUNDATIONS/13-RISK-BASED-TESTING-OVERVIEW.md`'de
> tanıtılan Risk-Based Testing kavramının **derinlemesine
> uygulamasıdır**. Overview seviyesindeki temel tanımları burada
> tekrar etmek yerine, doğrudan pratik uygulamaya odaklanılmıştır.

---

## 1. Neden Önemli?

"Risk" kelimesi günlük konuşmada genellikle "Severity" ile
karıştırılır. Bu dosya, Risk'in aslında birden fazla bileşenden oluşan
bir kavram olduğunu ve Severity'nin bunlardan yalnızca biri olduğunu
gösterir.

---

## 2. Risk Nedir?

**Risk**, istenmeyen bir olayın (defect, failure, hatalı davranış)
gerçekleşme **olasılığı** ile gerçekleştiğinde yaratacağı **etkinin**
birleşimidir. Risk, henüz gerçekleşmemiş, potansiyel bir durumdur.

## 3. Probability (Olasılık)

Bir sorunun oluşma ihtimalidir. Karmaşık kod, sık değişen alan, yeni
teknoloji, düşük test coverage gibi faktörler Probability'yi artırır.

## 4. Impact (Etki)

Bir sorun gerçekleştiğinde yaratacağı sonucun ciddiyetidir. Finansal
kayıp, kullanıcı güveni, yasal sorumluluk, operasyonel kesinti gibi
boyutlarla ölçülür.

## 5. Exposure (Maruziyet)

Bir riskin, sistemin ne kadar **büyük bir yüzeyini** veya **kaç
kullanıcıyı** etkileyebileceğidir. Aynı Probability ve Impact'e sahip
iki risk, farklı Exposure'a sahip olabilir.

**Örnek:** Bir bug hem checkout akışını hem de yalnızca nadir
kullanılan bir raporlama ekranını aynı olasılık ve etkiyle
bozabilir — ama checkout akışı **tüm kullanıcıları**, raporlama ekranı
yalnızca **birkaç admin kullanıcıyı** etkiler. Checkout'un Exposure'ı
çok daha yüksektir.

## 6. Priority (Öncelik)

Probability, Impact ve Exposure'ın birleşiminden türetilen, **test
sırasını belirleyen** nihai değerdir.

---

## 7. Risk ile Severity Aynı Şey Değildir

| | Risk | Severity |
|---|---|---|
| **Zamanlama** | Bir şey gerçekleşmeden önce değerlendirilir | Bir defect bulunduktan **sonra** değerlendirilir |
| **Soru** | "Bu alan ne kadar tehlikeli, ne kadar test etmeliyiz?" | "Bu bulunan defect ne kadar ciddi?" |
| **Kullanım** | Test planlama ve önceliklendirme | Defect triage |
| **Örnek** | "Ödeme alanı yüksek risklidir, derinlemesine test edilmeli." | "Bulunan bu ödeme bug'ı Critical severity'dir." |

Risk, **proaktif** bir değerlendirmedir (henüz test etmeden önce
nereye odaklanacağınızı belirler). Severity, **reaktif** bir
değerlendirmedir (bir defect bulunduktan sonra onun önemini belirler).
Bir alan yüksek riskli olabilir ama o alanda hiç defect bulunmayabilir
— bu, riski yanlış değerlendirdiğiniz anlamına gelmez, test
stratejinizin doğru çalıştığı anlamına gelebilir.

---

## 8. Basit Yaklaşım: Risk Priority ≈ Probability × Impact

En yaygın kullanılan basit model:

```text
Risk Priority ≈ Probability × Impact
```

Bu, `00-QA-FOUNDATIONS/13-RISK-BASED-TESTING-OVERVIEW.md`'de tanıtılan
temel formüldür ve pek çok ekip için yeterli bir başlangıç noktasıdır.

---

## 9. Bu Formül Tek Matematiksel Model Değildir

**Önemli:** `Probability × Impact` yalnızca **basitleştirilmiş bir
yaklaşımdır**. Her organizasyon aynı matematiksel modeli kullanmak
zorunda değildir. Farklı ekipler şu şekillerde genişletebilir:

- **Ağırlıklandırma eklemek:** Bazı ekipler, Impact'e Probability'den
  daha fazla ağırlık verir (`Priority = Probability × Impact²` gibi),
  çünkü nadir ama felaket düzeyinde bir hatayı daha ciddiye alırlar.
- **Exposure'ı dahil etmek:** `Priority = Probability × Impact ×
  Exposure` gibi üç boyutlu bir model kullanılabilir.
- **Kategorik skorlama:** Sayısal çarpım yerine, Low/Medium/High/
  Critical gibi kategorik bir matris kullanılabilir (bkz.
  `03-RISK-MATRIX.md`).
- **Ek faktörler eklemek:** Regulatory Impact, Financial Impact gibi
  ek boyutlar formüle dahil edilebilir (bkz.
  `04-TEST-PRIORITIZATION.md`).

Önemli olan, hangi model kullanılırsa kullanılsın, değerlendirmenin
**tutarlı, tekrarlanabilir ve gerekçelendirilebilir** olmasıdır.

---

## 10. Common Mistakes

- Risk ile Severity'yi aynı şey sanmak.
- Yalnızca Probability'ye bakıp Impact'i göz ardı etmek.
- Tek bir matematiksel formülün "doğru" olduğunu, başka yaklaşımların
  yanlış olduğunu düşünmek.

---

## 11. Best Practices

- Risk değerlendirmesini test planlamasının erken bir adımı yapın,
  defect bulunmasını beklemeyin.
- Ekibinizin bağlamına uygun bir risk modeli seçin ve bunu tutarlı
  şekilde uygulayın.
- Exposure'ı (kaç kullanıcı etkileniyor) değerlendirmeye dahil edin,
  yalnızca Probability × Impact ile yetinmeyin.

---

## 12. Interview Notes

- "Risk ile Severity arasındaki fark nedir?" sorusuna zamanlama
  farkıyla (proaktif vs reaktif) cevap verin.
- "Risk Priority hep Probability × Impact ile mi hesaplanır?" sorusuna
  hayır diyerek, bunun yalnızca basit bir başlangıç modeli olduğunu ve
  organizasyona göre genişletilebileceğini açıklayın.

---

## İlgili Konular

- [Probability & Impact](02-PROBABILITY-AND-IMPACT.md)
- [Risk Matrix](03-RISK-MATRIX.md)
- [00-QA-FOUNDATIONS — Risk-Based Testing Overview](../00-QA-FOUNDATIONS/13-RISK-BASED-TESTING-OVERVIEW.md)
