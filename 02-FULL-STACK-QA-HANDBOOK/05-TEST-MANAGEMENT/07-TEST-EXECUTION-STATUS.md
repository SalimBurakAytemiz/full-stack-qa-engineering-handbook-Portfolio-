# Test Execution Status

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir Test Case'in sonucunu yalnızca "çalıştı / çalışmadı" olarak
görmek yetersizdir. Beş farklı Execution Status, birbirinden çok
farklı anlamlar taşır ve yanlış kullanıldığında yanlış kararlara yol
açar.

---

## 2. Beş Execution Status

### PASS

Test Case çalıştırıldı ve Expected Result ile Actual Result birebir
uyuştu.

### FAIL

Test Case çalıştırıldı ama Actual Result, Expected Result'tan farklı
çıktı — sistemde bir defect olduğu anlamına gelir.

### BLOCKED

Test Case'in çalıştırılması, **kontrol dışı bir engel** nedeniyle
mümkün olmadı (bkz. bölüm 4).

### NOT EXECUTED

Test Case henüz hiç çalıştırılmadı (zaman kısıtı, önceliklendirme
veya planlama nedeniyle).

### SKIPPED

Test Case, **bilinçli bir kararla** bu cycle'da atlandı (örn. ilgili
feature bu release'de değişmedi).

---

## 3. Beş Statünün Karşılaştırması

| Status | Test Çalıştı mı? | Sistemde Sorun Var mı? | Nedeni |
|---|---|---|---|
| PASS | Evet | Hayır | — |
| FAIL | Evet | Evet | Sistem beklenen davranışı göstermedi |
| BLOCKED | Hayır (engellendi) | Bilinmiyor | Dış bir engel test'in çalıştırılmasını imkansız kıldı |
| NOT EXECUTED | Hayır | Bilinmiyor | Zaman/planlama nedeniyle henüz sıraya girmedi |
| SKIPPED | Hayır (bilinçli) | Bilinmiyor | Bu cycle'da gerekli görülmedi |

---

## 4. BLOCKED ≠ FAILED

Bu, en kritik ayrımlardan biridir.

**Yanlış yaklaşım:** Bir test çalıştırılamadığında sonucu FAIL olarak
işaretlemek.

**Doğru yaklaşım:** Eğer testin çalıştırılamama nedeni **ürünün
kendisiyle ilgili değilse** (dış bir bağımlılık, ortam sorunu),
sonuç BLOCKED olmalıdır.

### Örnek

**Senaryo:** "Ödeme Yöntemi Seçimi" test case'i çalıştırılacak, ama
**Payment Provider test ortamında unavailable** (bağlantı hatası
veriyor).

**Yanlış raporlama:** "Ödeme testi FAIL — sistem çalışmıyor."

Bu yanlıştır çünkü:
- Uygulamanın kendi kodu hiç çalıştırılmadı.
- Sorun, uygulamanın **dışındaki** bir bağımlılıkta (Payment
  Provider).
- Bu FAIL olarak raporlanırsa, development ekibi kendi kodunda
  olmayan bir "hata"yı aramaya çalışır ve zaman kaybeder.

**Doğru raporlama:** "TC-PAYMENT-001: BLOCKED — Payment Provider
test ortamında erişilemez durumda. Ürün davranışı doğrulanamadı."

Bu, `01-REQUIREMENT-ANALYSIS/08-DEPENDENCY-ANALYSIS.md`'de anlatılan
"bağımlılık unavailable olduğunda test stratejisi" prensibinin somut
bir uygulamasıdır.

---

## 5. Neden Bu Ayrım Önemli?

- **Yanlış FAIL raporu**, development'ı yanlış yere yönlendirir ve
  gereksiz bir "defect investigation" sürecini başlatır.
- **Doğru BLOCKED raporu**, sorunun kaynağını (environment/dependency)
  doğru ekibe (DevOps, üçüncü parti sağlayıcı) yönlendirir.
- **Metrics açısından** (bkz. `14-QA-METRICS.md`), BLOCKED oranının
  yüksek olması, ürün kalitesinden çok **ortam/altyapı kalitesine**
  dair bir sinyaldir — bu ikisi karıştırılırsa yanlış sonuçlara
  varılır.

---

## 6. SKIPPED ile NOT EXECUTED Farkı

| | SKIPPED | NOT EXECUTED |
|---|---|---|
| Karar | Bilinçli, gerekçeli | Henüz sıraya girmedi |
| Örnek | "Bu feature bu release'de değişmedi, regression'a dahil etmiyoruz." | "Zaman yetmedi, bu senaryolar bir sonraki cycle'a kaldı." |
| Risk açısından | Genelde düşük risk kabul edilmiş | Kapsam dışı kalmış, riski hâlâ bilinmiyor |

---

## 7. Common Mistakes

- BLOCKED ile FAIL'i karıştırmak — en sık yapılan hata.
- NOT EXECUTED senaryoları hiç raporlamadan, sanki test edilmiş gibi
  release kararına dahil etmek.
- SKIPPED kararını gerekçesiz vermek.

---

## 8. Best Practices

- Her BLOCKED sonucu için, engelin **kesin nedenini** (hangi
  bağımlılık, hangi ortam sorunu) not edin.
- Test Cycle sonunda NOT EXECUTED ve SKIPPED oranlarını Release Risk
  değerlendirmesine (bkz.
  `../02-RISK-BASED-TESTING/07-RELEASE-RISK.md`) dahil edin.
- BLOCKED oranı yüksekse, bunu bir "ürün kalitesi" sorunu değil
  "environment/dependency" sorunu olarak eskale edin.

---

## 9. Interview Notes

- "BLOCKED ile FAILED arasındaki fark nedir?" sorusuna Payment
  Provider örneğiyle, sorunun kaynağının ürün mü yoksa dış bir engel
  mi olduğuna göre ayrım yapılması gerektiğini açıklayarak cevap
  verin.
- "SKIPPED ile NOT EXECUTED farkı nedir?" sorusuna, birinin bilinçli
  karar diğerinin zaman kısıtı olduğunu belirterek cevap verin.

---

## İlgili Konular

- [01-REQUIREMENT-ANALYSIS — Dependency Analysis](../01-REQUIREMENT-ANALYSIS/08-DEPENDENCY-ANALYSIS.md)
- [Test Evidence Management](08-TEST-EVIDENCE-MANAGEMENT.md)
- [QA Metrics](14-QA-METRICS.md)
