# Test Prioritization

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Risk Matrix, statik bir görüntü verir. Ancak gerçek dünyada test
önceliği yalnızca Probability × Impact'ten daha fazla faktörden
etkilenir. Bu dosya, bu ek faktörleri ve "her şeyi aynı derinlikte
test etmek" yaklaşımının neden gerçekçi olmadığını anlatır.

---

## 2. Test Priority'yi Etkileyen Faktörler

### Business Criticality

Bu alan, işin temel gelir/operasyon akışının bir parçası mı?
(Örn. checkout, login — kritik; bir yardım sayfası — daha az kritik.)

### User Impact

Bu alan, kullanıcıların ne kadarını ve ne sıklıkla etkiliyor?

### Probability

Bu alanın hata üretme olasılığı nedir (bkz.
`02-PROBABILITY-AND-IMPACT.md`).

### Change Frequency

Bu alan ne sıklıkla değişiyor? Sık değişen kod, regresyon riski
taşır.

### Integration Complexity

Bu alan kaç farklı sistemle/servisle etkileşime giriyor? Daha fazla
entegrasyon, daha fazla hata noktası demektir.

### Historical Defects

Bu alanda geçmişte ne kadar defect bulundu? Geçmişte sorunlu olan
alanlar, gelecekte de sorunlu olma eğilimindedir.

### Financial Impact

Bu alandaki bir hata, doğrudan parasal kayba yol açar mı?

### Security Impact

Bu alandaki bir hata, güvenlik açığı yaratır mı (yetkisiz erişim,
veri sızıntısı)?

### Regulatory Impact

Bu alandaki bir hata, yasal/regülasyon uyumluluğunu ihlal eder mi
(örn. KVKK, finansal regülasyonlar)?

---

## 3. Faktörlerin Birlikte Değerlendirilmesi

Bu faktörler, tek bir sayısal formülle birleştirilmek zorunda
değildir (bkz. `01-RISK-FUNDAMENTALS.md`, bölüm 9). Pratikte, QA
genellikle bu faktörleri bir **kontrol listesi** gibi kullanarak
göreceli bir sıralama yapar.

**Örnek:** İki alan karşılaştırılıyor — "Ürün Arama Filtreleri" ve
"Ödeme Yöntemi Seçimi".

| Faktör | Ürün Arama Filtreleri | Ödeme Yöntemi Seçimi |
|---|---|---|
| Business Criticality | Orta | Yüksek |
| User Impact | Yüksek (çok kullanılıyor) | Yüksek |
| Change Frequency | Düşük | Yüksek (yeni ödeme yöntemleri sık ekleniyor) |
| Integration Complexity | Düşük (yalnızca DB sorgusu) | Yüksek (payment provider entegrasyonu) |
| Financial Impact | Yok | Yüksek |
| Security Impact | Düşük | Yüksek (kart bilgisi işleniyor) |

Bu karşılaştırma, Ödeme Yöntemi Seçimi'nin belirgin şekilde daha
yüksek öncelikli olduğunu gösterir — tek bir faktöre değil, birden
fazla faktörün tutarlı şekilde aynı yöne işaret etmesine dayanarak.

---

## 4. "Her Şeyi Aynı Derinlikte Test Etmek" Neden Gerçekçi Değil?

Sınırsız zaman ve kaynak olmadığı sürece, her senaryoyu aynı
derinlikte test etmek üç sorun yaratır:

1. **Kaynak İsrafı:** Düşük riskli bir alana (örn. footer linki)
   yüksek riskli bir alanla (örn. ödeme) aynı efor harcanırsa, kritik
   alan yeterince derinlemesine test edilemeyebilir.
2. **Yanlış Güven:** "Her şeyi test ettik" hissi, aslında hiçbir alanın
   yeterince derinlemesine test edilmediği bir durumu gizleyebilir.
3. **Sürdürülemezlik:** Sistem büyüdükçe, her şeyi aynı derinlikte
   test etmek zaman içinde imkansız hale gelir; bu yaklaşım ölçeklenmez.

Risk-Based Testing, kaynakları **kasıtlı olarak eşit dağıtmama**
disiplinidir — yüksek riskli alanlara daha fazla, düşük riskli
alanlara daha az zaman ayrılır.

---

## 5. Common Mistakes

- Yalnızca tek bir faktöre (örn. yalnızca Business Criticality) bakıp
  diğer faktörleri göz ardı etmek.
- "Her şeyi test etmeliyiz" ilkesini, sınırlı kaynaklarla çelişse
  bile sorgulamadan uygulamak.
- Historical Defects verisini hiç kullanmamak — geçmiş veri, gelecekteki
  riskli alanları tahmin etmede güçlü bir sinyaldir.

---

## 6. Best Practices

- Test önceliklendirmesini yazılı ve gerekçelendirilmiş şekilde
  dokümante edin (bkz. `06-RISK-REGISTER-EXAMPLE.md`).
- Historical Defect verisini düzenli olarak gözden geçirin ve
  önceliklendirmeye dahil edin.
- Önceliklendirmeyi statik bırakmayın — her release öncesi güncel
  değişikliklere göre yeniden değerlendirin.

---

## 7. Interview Notes

- "Test önceliğini belirlerken hangi faktörleri göz önünde
  bulundurursunuz?" sorusuna en az 4-5 faktörü (Business Criticality,
  Change Frequency, Historical Defects vb.) sayarak cevap verin.
- "Her şeyi aynı derinlikte test etmek neden gerçekçi değildir?"
  sorusuna kaynak israfı ve yanlış güven riskleriyle cevap verin.

---

## İlgili Konular

- [Risk Fundamentals](01-RISK-FUNDAMENTALS.md)
- [Risk-Based Test Planning](05-RISK-BASED-TEST-PLANNING.md)
- [Risk Register Example](06-RISK-REGISTER-EXAMPLE.md)
