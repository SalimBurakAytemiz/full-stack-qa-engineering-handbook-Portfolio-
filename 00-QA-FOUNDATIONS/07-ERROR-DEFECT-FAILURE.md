# Error / Defect / Failure

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Bug", "Defect", "Error" ve "Failure" günlük konuşmada birbirinin yerine
kullanılır. Ancak bu kavramlar bir **neden-sonuç zinciri** oluşturur ve
bu zinciri anlamak, kök neden analizine (root cause analysis) yardımcı
olur.

---

## 2. Tanımlar

### Error (Hata)

Bir kişinin (genelde developer'ın) yaptığı **insan hatasıdır**. Yanlış
bir varsayım, yanlış bir formül, eksik bir kontrol — bunların hepsi
"error"dur.

### Defect (Kusur)

Error'ın kod içinde bıraktığı **iz**dir. Kodun, beklenen davranıştan
sapmasına neden olan satır veya mantık hatasıdır.

### Bug

Defect ile günlük kullanımda büyük ölçüde aynı anlamda kullanılır. Bu
repository'de "Bug" ve "Defect" birbirinin yerine kullanılacaktır (bkz.
`TERMINOLOGY-GLOSSARY.md`).

### Failure (Arıza)

Defect'in, sistem **çalışırken** gözlemlenebilir hatalı bir davranışa
dönüşmesidir. Defect kodda "gizli" durabilir — Failure, bu defect'in
gerçek dünyada ortaya çıkmasıdır.

---

## 3. Örnek Zincir

```text
Human Error
    ↓
Defect in Code
    ↓
Runtime Failure
    ↓
User Impact
```

**Somut örnek:**

1. **Human Error:** Developer, indirim yüzdesini hesaplarken `price - percentage`
   yazması gerekirken `price - percentage / 100` yerine yanlışlıkla
   `price * percentage` yazar.
2. **Defect in Code:** Bu satır artık kod tabanında, yanlış bir indirim
   hesaplama mantığı olarak durur.
3. **Runtime Failure:** Kullanıcı %10 indirimli bir ürünü sepete
   ekler; sistem fiyatı 100'den 10'a düşürür (100 * 0.10) — beklenen
   90 yerine.
4. **User Impact:** Kullanıcı çok düşük bir fiyat görür, sipariş verir;
   şirket finansal kayıp yaşar veya sipariş iptal edilir, kullanıcı
   güveni sarsılır.

Bu zincirde her adım, bir öncekinin doğal sonucudur. Ancak her Defect
mutlaka bir Failure'a dönüşmez — örneğin kullanıcı o kod yoluna hiç
girmezse (dead code, nadir senaryo) defect fark edilmeyebilir.

---

## 4. Bug ve Defect'in Sektörel Kullanımı

Akademik literatürde bazen "Defect" ve "Bug" arasında ince ayrımlar
yapılır (örn. Defect = henüz bulunmamış kusur, Bug = raporlanmış
kusur). Ancak günlük sektör pratiğinde (Jira, Azure DevOps vb.
araçlarda) bu iki terim neredeyse tamamen birbirinin yerine kullanılır.

Bu repository, pratik sektör kullanımını takip eder: "Bug" ve "Defect"
aynı anlamda, birbirinin yerine kullanılabilir terimlerdir.

---

## 5. Neden Bu Ayrım Önemli?

Bu zinciri anlamak, QA'ya şu soruları sormasını sağlar:

- Bu Failure'ın kökeninde hangi Defect var?
- Bu Defect'in kökeninde hangi Error var — bu bir yanlış varsayım mıydı,
  eksik bir requirement mıydı?
- Bu Error'ı gelecekte nasıl önleriz (prevention)?

Yalnızca Failure'ı fix'lemek (semptomu tedavi etmek), aynı Error'ın
başka bir yerde tekrar Defect üretmesini engellemez.

---

## 6. Common Mistakes

- "Error", "Defect" ve "Failure"ı aynı şey sanıp kök neden analizini
  atlamak.
- Her Failure'ın arkasında mutlaka bir kod hatası olduğunu varsaymak
  (bazen requirement veya environment kaynaklı olabilir).
- Bug raporunu yalnızca "ne bozuldu" ile sınırlayıp "neden bozuldu"
  sorusunu sormamak.

---

## 7. Best Practices

- Defect raporlarken mümkünse kök nedeni (root cause) de not edin.
- Tekrarlayan Error pattern'lerini (örn. sürekli aynı tip hesaplama
  hatası) ekip ile paylaşın — bu bir prevention fırsatıdır.
- "Bug" ve "Defect" terimlerini ekip içinde tutarlı kullanın; karışıklık
  raporlama kalitesini düşürür.

---

## 8. Interview Notes

- "Error, Defect ve Failure arasındaki fark nedir?" sorusuna zincir
  örneğiyle (human error → defect → failure → user impact) cevap verin.
- "Her defect bir failure'a dönüşür mü?" sorusuna, dönüşmeyebileceğini
  ve bunun neden önemli olduğunu (dead code, nadir senaryo) açıklayın.

---

## İlgili Konular

- [Test Oracle](08-TEST-ORACLE.md)
- [Quality Gates Overview](15-QUALITY-GATES-OVERVIEW.md)
- [Common Mistakes](COMMON-MISTAKES.md)
