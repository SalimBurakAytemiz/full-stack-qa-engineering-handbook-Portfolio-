# Jira Bug Workflow

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Jira, QA-COMPETENCY-MAP.md'de EXPERIENCE olarak işaretlenen ana bug
takip araçlarından biridir. Bu dosya, bir QA'nın Jira üzerinde
**gerçek defect operasyonunu** nasıl yürüttüğünü anlatır.

> **Not:** Bu dosyada gerçek bir Jira arayüzü ekran görüntüsü
> uydurulmamıştır ve gerçek bir Jira UI screenshot'ı varmış gibi de
> gösterilmemiştir — burada yalnızca **kavramsal alan/adım anlatımı**
> yapılmaktadır.

---

## 2. Create Issue

Bir defect bulunduğunda, Jira'da yeni bir Issue oluşturulur.

## 3. Issue Type

Issue Type olarak **Bug** seçilir (bkz.
`01-BUG-DEFECT-ISSUE-TERMINOLOGY.md` — Issue vs Bug/Defect ayrımı).

## 4. Summary

Bug Title Standard'a uygun yazılır (bkz.
`03-PROFESSIONAL-BUG-REPORT.md`, bölüm 3): `[Platform][Feature]
Problem`.

## 5. Description

Profesyonel bug raporunun tüm alanları (bkz.
`03-PROFESSIONAL-BUG-REPORT.md`) buraya yazılır: Preconditions, Test
Data, Steps to Reproduce, Expected/Actual Result.

## 6. Environment

Jira'nın "Environment" alanı (veya özel bir custom field), testin
çalıştırıldığı ortamı (Staging, QA, vb.) belirtir.

## 7. Priority

Jira'nın built-in Priority alanı kullanılır (bkz.
`06-SEVERITY-VS-PRIORITY.md` — Severity genelde ayrı bir custom
field olarak eklenir çünkü Jira'nın varsayılan şeması yalnızca
Priority içerir).

## 8. Labels

Feature, platform veya kategori bazlı etiketleme (örn.
"authentication", "regression-candidate") — filtreleme ve raporlama
için kullanılır.

## 9. Assignee

Triage sonrası (bkz. `09-DEFECT-TRIAGE.md`) sorumlu geliştirici
atanır.

## 10. Attachments

Evidence (screenshot, log dosyası, video) buraya eklenir (bkz.
`08-DEFECT-EVIDENCE.md`).

## 11. Linked Issues

Traceability için kullanılır — ilgili Requirement/Story'ye, Test
Case'e (eğer Xray/Zephyr kullanılıyorsa) veya Duplicate/related
başka bir Bug'a link verilir (bkz.
`01-BUG-DEFECT-ISSUE-TERMINOLOGY.md`).

## 12. Comments

Triage tartışmaları, ek bilgi talepleri, Root Cause Isolation
bulguları (bkz. `14-ROOT-CAUSE-ISOLATION.md`) buraya not edilir.

## 13. Status

Defect Lifecycle'ın (bkz. `02-DEFECT-LIFECYCLE.md`) Jira'daki
karşılığı — organizasyona göre özelleştirilmiş bir workflow (örn.
"To Do → In Progress → In Review → Ready for QA → In QA → Done").

## 14. Retest

QA, Status'u "Ready for QA"dan "In QA"ya çeker, Retest'i (bkz.
`10-RETEST.md`) yapar, sonuca göre "Done"a taşır veya Reopen eder.

## 15. Close / Reopen

Retest PASS ise Issue "Done"/"Closed" olarak işaretlenir. Retest FAIL
ise Issue "Reopened" durumuna alınır ve Assignee'ye geri döner (bkz.
`11-REOPEN.md`).

---

## 16. Jira Workflow Örneği (Kavramsal)

```text
To Do (NEW/OPEN)
   ↓
In Progress (Development çalışıyor)
   ↓
Ready for QA (Fix deploy edildi)
   ↓
In QA (Retest sürüyor)
   ↓
   ├── Done (Retest PASS)
   └── Reopened (Retest FAIL) → In Progress'e geri döner
```

---

## 17. Common Mistakes

- Issue Type'ı yanlış seçmek (Bug yerine Task) — bu, defect
  metriklerinin (bkz. `18-DEFECT-METRICS.md`) yanlış hesaplanmasına
  yol açar.
- Linked Issues'ı hiç kullanmamak — Traceability kaybolur.
- Status'u güncel tutmamak — defect'in gerçek durumu belirsiz kalır.

---

## 18. Best Practices

- Bug Title Standard'ı Jira Summary alanında tutarlı uygulayın.
- Severity için ayrı bir custom field kullanın (Priority ile
  karıştırmayın).
- Her Attachment'ı, ilgili olduğu bulguyla (Steps, Actual Result)
  açıkça ilişkilendirin.

---

## 19. Interview Notes

- "Jira'da bir bug'ı nasıl raporlarsınız?" sorusuna Issue Type, Summary,
  Description, Environment, Priority, Attachments, Linked Issues
  sırasıyla cevap verin.
- "Jira'da Severity nasıl temsil edilir?" sorusuna, genellikle ayrı
  bir custom field olarak eklendiğini, built-in Priority'den farklı
  olduğunu belirterek cevap verin.

---

## İlgili Konular

- [Professional Bug Report](03-PROFESSIONAL-BUG-REPORT.md)
- [Azure DevOps Defect Workflow](20-AZURE-DEVOPS-DEFECT-WORKFLOW.md)
- [05-TEST-MANAGEMENT — Tools and Workflows](../05-TEST-MANAGEMENT/20-TOOLS-AND-WORKFLOWS.md)
