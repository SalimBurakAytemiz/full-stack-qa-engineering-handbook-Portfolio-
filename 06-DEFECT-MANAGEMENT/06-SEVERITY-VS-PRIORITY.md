# Severity vs Priority

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Severity ve Priority, en sık karıştırılan iki defect alanıdır. Bu
dosya, ikisinin farklı sorulara cevap verdiğini ve **her zaman aynı
olmadığını** somut kombinasyonlarla gösterir.

---

## 2. Severity Nedir?

**Severity**, bir bug'ın **impact seviyesini** — sistemin
işlevselliğine, verisine veya kullanıcıya olan **teknik/işlevsel
etkisini** — ölçer.

**Soru:** "Bu ne kadar ciddi bir bozulma?"

## 3. Priority Nedir?

**Priority**, bir bug'ın **çözülme önceliğini** — ne kadar hızlı
ele alınması gerektiğini — ölçer.

**Soru:** "Bunu ne kadar acil çözmeliyiz?"

---

## 4. Neden Her Zaman Aynı Değildir?

Severity, sistemin **teknik durumuna** bakar. Priority ise Severity'ye
ek olarak **iş bağlamını** (business context) — zamanlama, kullanıcı
sayısı, iş hedefleri — de hesaba katar. Bu yüzden aynı Severity'ye
sahip iki bug, çok farklı Priority alabilir.

---

## 5. Farklı Kombinasyon Örnekleri

### Critical Severity / High Priority

**Örnek:** Ödeme onaylandığı halde sipariş oluşturulmuyor — kullanıcı
parasını kaybediyor ama sipariş kaydı yok.

**Neden:** Hem teknik olarak ciddi (veri kaybı, finansal risk) hem de
hemen çözülmesi gerekiyor.

### Low Severity / High Priority

**Örnek:** Ana sayfada şirket logosu, önemli bir yatırımcı sunumundan
1 saat önce yanlış renkte görünüyor.

**Neden:** Teknik olarak önemsiz (görsel, işlevi etkilemiyor —
Severity: Low) ama iş bağlamı nedeniyle **hemen** düzeltilmesi
gerekiyor (Priority: High).

### High Severity / Medium Priority

**Örnek:** Nadiren kullanılan bir "veri dışa aktarma" (export)
özelliği, belirli bir filtre kombinasyonunda sistemi çökertiyor.

**Neden:** Teknik olarak ciddi (crash — Severity: High) ama bu
özellik çok az kullanıcı tarafından ve seyrek kullanıldığı için
hemen değil, bir sonraki sprint'te ele alınabilir (Priority: Medium).

### Critical Severity / Low Priority

**Örnek:** Artık kullanılmayan, kullanımdan kaldırılması planlanan
eski bir admin panelinde authentication bypass mümkün.

**Neden:** Teknik olarak çok ciddi (güvenlik açığı — Severity:
Critical) ama bu panel zaten önümüzdeki hafta kaldırılacağı için
ayrıca fix etmeye yatırım yapmaya değmiyor (Priority: Low) — **not:**
bu kombinasyon dikkatli değerlendirilmelidir; genellikle güvenlik
açıkları düşük priority alsa bile hızlıca devre dışı bırakma
(mitigasyon) gerektirir.

---

## 6. Özet Tablo

| Severity | Priority | Anlamı |
|---|---|---|
| Critical | High | Hem teknik olarak ciddi hem acil — en yaygın "gerçek kriz" kombinasyonu |
| Low | High | Teknik olarak küçük ama iş bağlamı nedeniyle acil |
| High | Medium | Teknik olarak ciddi ama düşük kullanım/etki nedeniyle bekleyebilir |
| Critical | Low | Nadir — genellikle ek gerekçe/mitigasyon planı gerektirir |

---

## 7. Severity ve Priority Kim Tarafından Belirlenir?

- **Severity**, genellikle bug'ı bulan QA tarafından, **teknik
  gözlemlere** dayanarak ilk değerlendirmede belirlenir.
- **Priority**, genellikle Defect Triage (bkz. `09-DEFECT-TRIAGE.md`)
  sürecinde, QA + Development + Product birlikte, **iş bağlamını**
  da katarak belirlenir/teyit edilir.

---

## 8. Common Mistakes

- Severity ve Priority'ye otomatik olarak aynı değeri atamak.
- Priority'yi yalnızca QA'nın kendi kararıyla belirlemek, business
  bağlamını (zamanlama, kullanıcı etkisi) hiç sormamak.
- Düşük Severity'li bir bug'ı, iş bağlamını değerlendirmeden otomatik
  olarak düşük Priority yapmak (logo örneği bunun tersini gösterir).

---

## 9. Interview Notes

- "Severity ile Priority arasındaki fark nedir?" sorusuna "ne kadar
  ciddi" vs "ne kadar acil" ayrımıyla cevap verin.
- "Low Severity / High Priority örneği verir misiniz?" sorusuna
  somut bir örnekle (logo/sunum senaryosu gibi) cevap verin.
- "Severity ve Priority'yi kim belirler?" sorusuna, Severity'nin
  QA'nın ilk gözlemi, Priority'nin triage sürecinin ortak kararı
  olduğunu belirterek cevap verin.

---

## İlgili Konular

- [Defect Triage](09-DEFECT-TRIAGE.md)
- [templates/BUG-REPORT-TEMPLATE.md](templates/BUG-REPORT-TEMPLATE.md)
- [00-QA-FOUNDATIONS — Common Mistakes](../00-QA-FOUNDATIONS/COMMON-MISTAKES.md)
