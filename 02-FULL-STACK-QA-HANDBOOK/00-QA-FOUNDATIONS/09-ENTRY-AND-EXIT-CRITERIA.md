# Entry & Exit Criteria

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Test etmeye ne zaman başlayabiliriz?" ve "Test etmeyi ne zaman
bitirebiliriz?" soruları, netleşmediğinde ekipler ya hazır olmayan bir
build'i test etmeye çalışır ya da release kararını sağlam bir zemine
oturtmadan verir. Entry ve Exit Criteria bu iki soruyu netleştirir.

---

## 2. Entry Criteria Nedir?

**Entry Criteria**, test aktivitesine (veya bir test seviyesine)
başlamak için karşılanması gereken minimum koşullardır.

## 3. Exit Criteria Nedir?

**Exit Criteria**, test aktivitesinin tamamlandığı ve bir sonraki
aşamaya (örn. release) geçilebileceği kararının dayandığı koşullardır.

---

## 4. Fark

| | Entry Criteria | Exit Criteria |
|---|---|---|
| Soru | "Başlayabilir miyiz?" | "Bitirebilir miyiz?" |
| Zamanlama | Test öncesi | Test sonrası |
| Karşılanmazsa | Test başlatılmaz / risk kabul edilerek başlatılır | Release ertelenir / risk kabul edilerek devam edilir |

---

## 5. Örnek QA Entry Criteria

- Requirement hazır ve QA tarafından review edilmiş.
- Build ilgili test ortamına deploy edilmiş.
- Environment ayakta ve erişilebilir.
- Gerekli Test Data hazırlanmış.
- Kritik dependency'ler (örn. üçüncü parti servis, test API'si) hazır.

Eğer bu koşullardan biri karşılanmazsa (örn. environment ayakta değilse),
test execution'a başlamak zaman kaybına ve yanlış defect raporlarına
(environment kaynaklı false positive) yol açar.

---

## 6. Örnek Exit Criteria

- Kritik (Critical/P0) test senaryoları çalıştırılmış.
- Açık P0 (blocker) defect bulunmuyor.
- Kabul edilen threshold'lar sağlanmış (örn. regression suite %95
  başarı oranı).
- Bilinen sorunlar (Known Issues) dokümante edilmiş.
- Test raporu hazırlanmış ve paylaşılmış.

---

## 7. Gerçek Release Örneği

**Senaryo:** Bir e-ticaret platformunda yeni "Kupon Kodu" özelliği
release edilecek.

**Entry Criteria kontrolü:**

- Requirement ve Acceptance Criteria QA tarafından review edildi. ✔
- Feature, staging ortamına deploy edildi. ✔
- Staging ortamı ayakta ve erişilebilir. ✔
- Test data (geçerli/geçersiz kupon kodları) hazırlandı. ✔
- Ödeme servisi (dependency) staging'de çalışır durumda. ✔

Entry Criteria karşılandığı için test execution başlar.

**Exit Criteria kontrolü:**

- Kritik senaryolar (geçerli kupon, geçersiz kupon, süresi dolmuş kupon,
  minimum sepet tutarı) çalıştırıldı. ✔
- Açık P0 defect yok. ✔
- Regression suite %97 başarı oranıyla tamamlandı (threshold: %95). ✔
- Bilinen bir P3 sorun (kupon kodu input alanında placeholder metni
  yanlış) dokümante edildi ve business tarafından kabul edildi. ✔
- Test raporu hazırlandı. ✔

Exit Criteria karşılandığı için release için **Go** kararı verilebilir.

Eğer regression suite %90 başarı oranıyla tamamlanmış olsaydı (threshold
altında), Exit Criteria karşılanmamış olurdu ve QA, release'i
ertelemeyi veya riski açıkça dokümante ederek business'a karar
bırakmayı önerirdi.

---

## 8. Common Mistakes

- Entry Criteria'yı atlayıp hazır olmayan bir build'de test başlatmak.
- Exit Criteria'yı "tüm testler PASS oldu" ile eş anlamlı sanmak (oysa
  threshold, known issues gibi başka boyutlar da vardır).
- Exit Criteria'yı yalnızca QA'nın belirlediği, business'ın hiç dahil
  olmadığı bir karar sanmak.

---

## 9. Best Practices

- Entry ve Exit Criteria'yı proje/feature başında, herkesin görebileceği
  şekilde yazılı olarak belirleyin.
- Threshold'ları (örn. regression başarı oranı) sayısal ve ölçülebilir
  tanımlayın.
- Exit Criteria karşılanmadığında sessizce devam etmek yerine riski
  açıkça dokümante edip business'a bildirin.

---

## 10. Interview Notes

- "Entry Criteria ile Exit Criteria arasındaki fark nedir?" sorusuna
  "başlama vs bitirme koşulları" ayrımıyla cevap verin.
- "Exit Criteria karşılanmazsa ne yaparsınız?" sorusuna, riski
  dokümante edip business ile Go/No-Go kararını netleştireceğinizi
  belirtin.

---

## İlgili Konular

- [Verification & Validation](02-VERIFICATION-AND-VALIDATION.md)
- [Quality Gates Overview](15-QUALITY-GATES-OVERVIEW.md)
- [Risk-Based Testing Overview](13-RISK-BASED-TESTING-OVERVIEW.md)
