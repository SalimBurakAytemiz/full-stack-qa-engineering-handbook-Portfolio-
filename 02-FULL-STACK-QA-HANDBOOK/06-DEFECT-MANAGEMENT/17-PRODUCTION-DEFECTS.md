# Production Defects

**Status: EXPERIENCE**

> `00-QA-FOUNDATIONS/11-SHIFT-LEFT-AND-SHIFT-RIGHT.md`'de anlatılan
> Shift Right prensibinin, defect yönetimindeki somut uygulamasıdır.

---

## 1. Neden Önemli?

Production'da bulunan bir defect, test ortamında bulunan bir
defect'ten **farklı** bir aciliyet ve süreç gerektirir — gerçek
kullanıcılar zaten etkileniyordur.

---

## 2. Production Defect Nedir?

Test ortamlarını atlayıp doğrudan **canlı (production) ortamda**,
gerçek kullanıcı trafiği üzerinde tespit edilen defect'tir.

---

## 3. Production Defect'in Test Ortamı Defect'inden Farkı

| | Test Ortamı Defect'i | Production Defect'i |
|---|---|---|
| **Etki** | Henüz kullanıcıya ulaşmamış | Gerçek kullanıcılar zaten etkileniyor |
| **Aciliyet** | Release'e göre değişir | Genellikle acil |
| **İlk Aksiyon** | Fix planlama | Önce **mitigasyon** (etkiyi durdurma), sonra fix |
| **Evidence Kaynağı** | Kontrollü test verisi | Gerçek (ama anonimleştirilmiş/maskelenmiş) production logları |

---

## 4. Production Defect Süreci

```text
Production'da Sorun Tespit Edildi
   (monitoring, kullanıcı şikayeti, log anomalisi)
   ↓
Hızlı Triage: Etki Ne Kadar Geniş? (bkz. 14-ROOT-CAUSE-ISOLATION.md)
   ↓
Mitigasyon Değerlendirilir:
   - Rollback mümkün mü?
   - Feature flag ile kapatılabilir mi?
   - Geçici bir workaround var mı?
   ↓
Mitigasyon Uygulanır (mümkünse)
   ↓
Root Cause Analizi Yapılır
   ↓
Kalıcı Fix Geliştirilir ve Test Edilir
   ↓
Post-Mortem / Öğrenilen Dersler Dokümante Edilir
```

---

## 5. QA'nın Production Defect'teki Rolü

- **Smoke/Stability Doğrulama:** Her production deployment sonrası,
  kritik akışların çalıştığını hızlıca doğrulamak (bkz.
  `../05-TEST-MANAGEMENT/06-SMOKE-SANITY-REGRESSION-SUITES.md`).
- **Log/Monitoring İzleme:** Production loglarını ve metrikleri
  izleyerek anormal davranışları erken fark etmek (Shift Right).
- **Hızlı Triage:** Bir production sorunu bildirildiğinde, etkisini
  ve olası kök nedenini hızlıca değerlendirmek.
- **Mitigasyon Sonrası Doğrulama:** Rollback/feature flag gibi bir
  mitigasyon uygulandığında, bunun gerçekten etkiyi durdurduğunu
  doğrulamak.
- **Fix Sonrası Regression:** Kalıcı fix, production'a çıkmadan önce
  test ortamında derinlemesine test edilmelidir (bkz.
  `12-REGRESSION-AFTER-FIX.md`).

---

## 6. Neden "Önce Mitigasyon, Sonra Fix"?

Production'da bir sorun tespit edildiğinde, **mükemmel bir fix**
beklemek, kullanıcı etkisinin uzamasına neden olur. Bu yüzden öncelik
sırası genellikle:

1. Etkiyi **durdurmak** (rollback, feature flag, geçici workaround).
2. Ardından **doğru ve test edilmiş** bir kalıcı fix geliştirmek.

---

## 7. Common Mistakes

- Production'da acele bir fix'i, yeterince test etmeden (regression
  atlanarak) tekrar deploy etmek — bu, ikinci bir production
  incident'ına yol açabilir.
- Production defect'ini test ortamı defect'i gibi normal öncelikte
  ele almak.
- Post-Mortem/öğrenilen dersleri dokümante etmemek — aynı sorunun
  tekrarlanma riski kalır.

---

## 8. Best Practices

- Her production deployment sonrası bir Smoke Suite çalıştırın.
- Production monitoring'i düzenli izleyin (Shift Right — bkz.
  `../00-QA-FOUNDATIONS/11-SHIFT-LEFT-AND-SHIFT-RIGHT.md`).
- Mitigasyon sonrası bile, kalıcı fix'i normal test disiplininden
  (Regression dahil) geçirin.
- `templates/PRODUCTION-INCIDENT-TEMPLATE.md` ile süreci dokümante
  edin.

---

## 9. Interview Notes

- "Production'da bir defect bulunduğunda ilk yaklaşımınız nedir?"
  sorusuna, önce mitigasyon (rollback/feature flag) sonra kalıcı fix
  sırasını açıklayarak cevap verin.
- "QA'nın production'daki rolü nedir?" sorusuna, smoke/stability
  doğrulama ve monitoring izleme ile (Shift Right) cevap verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Shift Left & Shift Right](../00-QA-FOUNDATIONS/11-SHIFT-LEFT-AND-SHIFT-RIGHT.md)
- [Root Cause Isolation](14-ROOT-CAUSE-ISOLATION.md)
- [templates/PRODUCTION-INCIDENT-TEMPLATE.md](templates/PRODUCTION-INCIDENT-TEMPLATE.md)
