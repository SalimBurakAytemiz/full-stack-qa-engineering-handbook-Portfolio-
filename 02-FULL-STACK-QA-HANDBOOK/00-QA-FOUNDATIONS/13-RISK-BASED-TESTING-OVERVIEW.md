# Risk-Based Testing — Overview

**Status: EXPERIENCE**

> **Kapsam notu:** Bu dosya yalnızca **overview** seviyesindedir. Detaylı
> teknik uygulama (risk matrisi oluşturma, risk skorlama şablonları,
> gerçek proje örnekleri) `02-RISK-BASED-TESTING/` klasörüne ait olup
> ileriki bir Phase'de ele alınacaktır.

---

## 1. Neden Önemli?

Sınırsız zaman ve kaynak yoktur. Her senaryoyu eşit önemde test etmek
mümkün değildir. Risk-Based Testing, "nereye daha çok zaman ayıralım"
sorusuna sistematik bir cevap verir.

---

## 2. Risk Nedir?

**Risk**, bir şeyin yanlış gitme **olasılığı (Probability)** ile yanlış
gittiğinde yaratacağı **etkinin (Impact)** birleşimidir.

```text
Risk = Probability × Impact
```

---

## 3. Probability, Impact, Priority

- **Probability (Olasılık):** Bir hatanın oluşma ihtimali ne kadar
  yüksek? (Karmaşık kod, sık değişen alan, yeni teknoloji gibi
  faktörler olasılığı artırır.)
- **Impact (Etki):** Bu hata oluşursa sonucu ne kadar ciddi olur?
  (Finansal kayıp, kullanıcı güveni, yasal sorumluluk gibi faktörler
  etkiyi artırır.)
- **Priority (Öncelik):** Probability ve Impact'in birleşiminden
  türetilen, test sırasını belirleyen değerdir.

---

## 4. Basit Örnek

| Senaryo | Probability | Impact | Priority |
|---|---|---|---|
| Payment failure (ödeme başarısız oluyor) | Medium | Critical | **Yüksek** |
| Cosmetic spacing issue (buton arası boşluk hatalı) | High | Low | **Düşük** |

Payment failure, daha düşük olasılıkla gerçekleşse bile **etkisi
kritik** olduğu için yüksek öncelikli test edilmesi gereken bir
alandır. Cosmetic spacing issue ise sık karşılaşılsa bile (High
Probability) **etkisi düşük** olduğu için düşük öncelikli kabul edilir.

---

## 5. Test Priority Neden Probability ile Aynı Olmak Zorunda Değil?

Yaygın bir yanlış anlama, "en sık olacak şeyi en önce test edelim"
düşüncesidir. Ancak Risk-Based Testing, yalnızca olasılığa değil,
**olasılık × etki** kombinasyonuna bakar.

**Neden bu önemli:** Sık karşılaşılan ama düşük etkili bir hata (örn.
görsel hizalama sorunu), kullanıcı deneyimini rahatsız edebilir ama
işi durdurmaz. Nadir görülen ama yüksek etkili bir hata (örn. ödeme
başarısız olması, veri kaybı) ise, tek bir kez bile gerçekleşse ciddi
finansal veya itibar kaybına yol açabilir.

Bu yüzden test stratejisi, yalnızca "en sık olacak" değil, "en çok
zarar verecek" senaryolara öncelik vermelidir.

---

## 6. Risk-Based Testing'in Pratik Kullanımı

Sınırlı test süresi olduğunda (örn. release'e 2 gün kala), Risk-Based
Testing şu soruları sorar:

1. Hangi alanlar en yüksek Impact'e sahip? (Ödeme, kimlik doğrulama,
   veri bütünlüğü genellikle yüksektir.)
2. Bu alanlarda son zamanda değişiklik oldu mu? (Değişiklik =
   artan Probability.)
3. Bu alanların test edilmemesi durumunda kabul edilebilir bir risk mi
   oluşur, yoksa kabul edilemez mi?

Bu sorulara verilen cevaplar, test kapsamının önceliklendirilmesini
sağlar.

---

## 7. Detaylı Uygulama Nerede?

Bu dosya yalnızca kavramsal temeli tanıtır. Risk matrisi oluşturma,
risk skorlama şablonları, gerçek proje senaryoları üzerinden risk
analizi gibi derin uygulamalar `02-RISK-BASED-TESTING/` klasörünün
konusudur ve bu Phase'in kapsamı dışındadır.

---

## 8. Common Mistakes

- Yalnızca Probability'ye bakıp Impact'i göz ardı etmek.
- Her şeyi "yüksek risk" olarak etiketleyip önceliklendirmeyi anlamsız
  hale getirmek.
- Risk değerlendirmesini yalnızca QA'nın tek başına yaptığı bir
  aktivite sanmak (business ve development girdisi de gereklidir).

---

## 9. Best Practices

- Risk değerlendirmesini test planlamasının erken bir adımı yapın.
- Impact'i değerlendirirken finansal, kullanıcı deneyimi ve yasal
  boyutları birlikte düşünün.
- Sınırlı zamanda önce yüksek risk, sonra orta risk, en son düşük risk
  alanlarını test edin.

---

## 10. Interview Notes

- "Risk nasıl hesaplanır?" sorusuna Probability × Impact formülüyle ve
  somut bir örnekle (payment vs cosmetic) cevap verin.
- "Test önceliği neden her zaman en sık senaryoya göre belirlenmez?"
  sorusuna Impact'in belirleyici rolünü vurgulayarak cevap verin.

---

## İlgili Konular

- [Entry & Exit Criteria](09-ENTRY-AND-EXIT-CRITERIA.md)
- [Quality Gates Overview](15-QUALITY-GATES-OVERVIEW.md)
- 02-RISK-BASED-TESTING/ (detaylı uygulama — ileriki Phase)
