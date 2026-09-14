# Authentication Bug — Severity / Priority

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)

---

## Severity Değerlendirmesi

**Severity: Medium**

**Gerekçe:** Bu defect, kullanıcının login olmasını **engellemiyor**
(yani kritik bir işlevsel bozulma yok — authentication doğru şekilde
reddediliyor). Ancak kullanıcıya **yanlış bilgi** veriyor, bu da
kullanıcı deneyimini ve güven algısını olumsuz etkiliyor. Bu, tam
olarak "Low" (yalnızca kozmetik) değil ama "Critical/High" (sistemi
kullanılamaz kılan) da değil — orta seviye bir işlevsel/UX etkisi.

## Priority Değerlendirmesi

**Priority: High**

**Gerekçe:** Bu sorun, **her başarısız login denemesinde** (yüksek
Reproduction Rate — bkz. `../../../06-DEFECT-MANAGEMENT/07-REPRODUCTION-RATE.md`)
ortaya çıkıyor ve authentication akışı gibi **kritik bir kullanıcı
yolculuğunda** görünüyor. Kullanıcılar yanlış şifre girdiklerinde bunu
anlayamayıp destek talebi açabilir — bu, operasyonel bir maliyet
yaratır. Bu yüzden Severity Medium olsa da Priority High olarak
değerlendirilmiştir.

---

## Bu, Severity ≠ Priority Prensibinin Somut Bir Örneğidir

`06-DEFECT-MANAGEMENT/06-SEVERITY-VS-PRIORITY.md`'de anlatılan
kombinasyonlardan biri burada uygulanmıştır:

> **Medium Severity + High Priority:** Teknik olarak sistemi
> çökertmiyor (Medium) ama sık karşılaşılan ve kullanıcı
> güvenini zedeleyen bir sorun olduğu için hızlı çözülmesi gerekiyor
> (High).

---

## Sonraki Adım

[08 — Regression Impact](08-REGRESSION-IMPACT.md)
