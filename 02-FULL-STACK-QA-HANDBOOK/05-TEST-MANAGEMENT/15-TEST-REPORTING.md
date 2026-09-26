# Test Reporting

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Aynı test verisi, farklı hedef kitlelere farklı formatlarda
sunulmalıdır. Bir Developer'a giden rapor ile bir yöneticiye giden
rapor aynı detay seviyesinde olmamalıdır. Bu dosya, dört temel rapor
türünü ve ortak bir rapor formatını anlatır.

---

## 2. Dört Rapor Türü

### Daily QA Status

**Hedef Kitle:** Günlük çalışan ekip (Developer, QA, Scrum Master).

**İçerik:** O günkü test aktivitesi, bulunan yeni defect'ler, karşılaşılan
engeller (BLOCKED durumlar).

**Sıklık:** Günlük.

### Test Summary Report

**Hedef Kitle:** QA ekibi, Development Lead.

**İçerik:** Bir Test Cycle'ın (bkz. `05-TEST-SUITE-AND-TEST-CYCLE.md`)
tam sonucu — kaç test çalıştırıldı, PASS/FAIL/BLOCKED dağılımı, açık
defect'ler.

**Sıklık:** Her Test Cycle sonunda.

### Release Test Report

**Hedef Kitle:** Release'e karar verecek paydaşlar (Product Owner,
Engineering Lead).

**İçerik:** Release kapsamındaki tüm test aktivitesinin özeti,
Release Risk değerlendirmesi (bkz.
`../02-RISK-BASED-TESTING/07-RELEASE-RISK.md`), QA Recommendation.

**Sıklık:** Her release öncesi.

### Executive Summary

**Hedef Kitle:** Üst yönetim, business karar vericiler.

**İçerik:** Teknik detaydan arındırılmış, iş etkisine odaklı özet —
"release edilebilir mi, hangi risk kabul ediliyor."

**Sıklık:** Büyük release'ler veya kritik durumlarda.

---

## 3. Ortak Rapor Formatı

Rapor türü ne olursa olsun (detay seviyesi farklı olsa da), aşağıdaki
alanlar genellikle bulunmalıdır:

| Alan | Açıklama |
|---|---|
| Scope | Bu raporun kapsadığı feature/release. |
| Execution | Kaç test case planlandı, kaçı çalıştırıldı. |
| Passed | PASS sayısı/oranı. |
| Failed | FAIL sayısı/oranı. |
| Blocked | BLOCKED sayısı/oranı ve nedeni. |
| Open Defects | Açık defect sayısı, severity dağılımı. |
| Critical Risks | Bu release'e özgü yüksek riskli alanlar. |
| Known Issues | Bilinen, kabul edilmiş sorunlar (bkz. `18-KNOWN-ISSUES.md`). |
| Untested Areas | Zaman/kapsam nedeniyle test edilmemiş alanlar. |
| QA Recommendation | GO / CONDITIONAL GO / NO-GO (bkz. `17-RELEASE-QA-SIGN-OFF.md`). |

---

## 4. Örnek: Release Test Report İskeleti

```text
Scope: Kupon Kodu Feature — v2.3 Release

Execution: 42/45 test case çalıştırıldı (3 BLOCKED — Discount
Service test ortamında kararsız)

Passed: 39
Failed: 1 (TC-COUPON-NEG-003 — geçersiz kupon mesajı yanlış
gösteriliyor, BUG-COUPON-002)
Blocked: 3 (Discount Service unavailable — bkz. Root Cause
Isolation)

Open Defects: 1 (Low severity, BUG-COUPON-002)

Critical Risks: Discount Service'in production'da da kararsız
olma ihtimali — DevOps ile teyit edilmeli.

Known Issues: Kupon input alanında placeholder metni yanlış
(P3, business tarafından kabul edildi).

Untested Areas: Tablet ekran boyutu (zaman kısıtı).

QA Recommendation: CONDITIONAL GO — Discount Service stabilitesi
production'da doğrulanmalı; BUG-COUPON-002 düşük öncelikli, release'i
engellemez.
```

---

## 5. Common Mistakes

- Tüm hedef kitlelere aynı detay seviyesinde rapor göndermek (Executive
  Summary'ye teknik log detayı eklemek gibi).
- Untested Areas'ı raporlamadan gizlemek.
- QA Recommendation bölümünü atlayıp yalnızca ham sayıları sunmak.

---

## 6. Best Practices

- Rapor türünü hedef kitleye göre seçin ve detay seviyesini buna
  göre ayarlayın.
- Her raporda Known Issues ve Untested Areas'ı açıkça belirtin.
- QA Recommendation'ı her zaman gerekçesiyle birlikte sunun.

---

## 7. Interview Notes

- "Test Summary Report ile Executive Summary arasındaki fark nedir?"
  sorusuna hedef kitle ve detay seviyesi farkıyla cevap verin.
- "Bir release raporunda hangi alanlar mutlaka bulunmalıdır?"
  sorusuna en az 6-7 alanı (Execution, Open Defects, Known Issues,
  QA Recommendation) sayarak cevap verin.

---

## İlgili Konular

- [templates/TEST-SUMMARY-REPORT-TEMPLATE.md](templates/TEST-SUMMARY-REPORT-TEMPLATE.md)
- [Release QA Sign-Off](17-RELEASE-QA-SIGN-OFF.md)
- [Known Issues](18-KNOWN-ISSUES.md)
