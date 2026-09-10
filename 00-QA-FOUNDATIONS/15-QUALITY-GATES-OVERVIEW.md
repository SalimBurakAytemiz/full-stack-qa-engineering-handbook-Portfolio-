# Quality Gates — Overview

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Testler PASS oldu, o zaman release edebiliriz" düşüncesi tehlikeli bir
basitleştirmedir. Quality Gate kavramı, release kararının çok boyutlu
bir değerlendirme olduğunu gösterir.

---

## 2. Quality Gate Nedir?

**Quality Gate**, bir yazılımın bir sonraki aşamaya (örn. bir sonraki
environment'a veya production'a) geçebilmesi için karşılaması gereken
**önceden tanımlanmış kalite kriterleri kümesidir**.

## 3. Release Gate Nedir?

**Release Gate**, spesifik olarak production'a çıkış öncesi
uygulanan Quality Gate'tir. Genellikle en katı kriterleri içerir çünkü
sonrasında gerçek kullanıcılar etkilenir.

---

## 4. Örnek Kriterler

- **P0 = 0:** Açık, kritik (blocker) defect bulunmamalı.
- **Critical smoke PASS:** Sistemin en kritik akışları (login, ödeme
  vb.) başarıyla çalışmalı.
- **Required regression completed:** Zorunlu regression suite
  tamamlanmış olmalı.
- **Required API checks PASS:** Kritik API kontratları/response'ları
  doğrulanmış olmalı.
- **Accepted performance threshold:** Yanıt süresi gibi performans
  kriterleri kabul edilebilir sınırlar içinde olmalı.
- **Known risks documented:** Bilinen ama kabul edilen riskler açıkça
  yazılı olmalı.

---

## 5. Quality Gate = Yalnızca Automation PASS mı?

**Hayır.** Bu, en sık yapılan hatalardan biridir.

Automation'ın PASS dönmesi, yalnızca **bir boyutun** karşılandığını
gösterir — kodun otomatik test senaryolarına göre beklenen davranışı
gösterdiğini. Ancak Quality Gate, çok daha geniş bir değerlendirmedir:

- Otomasyon PASS olabilir ama kapsamı yetersiz olabilir (örn. yeni
  bir riskli senaryo hiç otomatize edilmemiş).
- Performans threshold'u karşılanmamış olabilir, otomasyon bunu test
  etmiyor olabilir.
- Bilinen bir P1 sorun, business tarafından henüz kabul edilmemiş
  olabilir.
- Manuel/exploratory testing'de bulunan bir risk, otomasyon suite'inde
  hiç yer almıyor olabilir.

Bu yüzden Quality Gate, otomasyon sonucunu **girdi** olarak alır ama
tek başına **karar** olarak kullanmaz.

---

## 6. Quality Gate ile Exit Criteria İlişkisi

Quality Gate, aslında Exit Criteria'nın (bkz.
`09-ENTRY-AND-EXIT-CRITERIA.md`) daha geniş, çoğunlukla release
seviyesinde uygulanan halidir. Exit Criteria bir test aktivitesinin
bitişini değerlendirirken, Quality Gate genellikle bir environment
geçişinin (örn. staging → production) bütününü değerlendirir.

---

## 7. Common Mistakes

- Quality Gate'i yalnızca CI/CD pipeline'ındaki otomatik bir "yeşil
  tik" sanmak.
- P0 defect sayısını kontrol edip diğer kriterleri (performans, known
  risks) göz ardı etmek.
- Quality Gate kararını yalnızca QA'nın verdiğini düşünmek — oysa
  business/product de karara dahildir.

---

## 8. Best Practices

- Quality Gate kriterlerini proje başında yazılı ve ölçülebilir
  tanımlayın.
- Otomasyon sonucunu tek kriter değil, birden fazla kriterden biri
  olarak kullanın.
- Known risks'i "gizlemek" yerine açıkça dokümante edip business ile
  paylaşın.

---

## 9. Interview Notes

- "Quality Gate nedir?" sorusuna, release kararının çok boyutlu bir
  değerlendirme olduğunu vurgulayarak cevap verin.
- "Otomasyon PASS oldu, release edebilir miyiz?" sorusuna hayır diyerek,
  diğer kriterlerin (coverage, performans, known risks) de
  değerlendirilmesi gerektiğini açıklayın.

---

## İlgili Konular

- [Entry & Exit Criteria](09-ENTRY-AND-EXIT-CRITERIA.md)
- [Risk-Based Testing Overview](13-RISK-BASED-TESTING-OVERVIEW.md)
- [Common Mistakes](COMMON-MISTAKES.md)
