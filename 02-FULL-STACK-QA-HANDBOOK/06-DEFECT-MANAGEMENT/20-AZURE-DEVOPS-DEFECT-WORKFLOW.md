# Azure DevOps Defect Workflow

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Azure DevOps, QA-COMPETENCY-MAP.md'de EXPERIENCE olarak işaretlenen
diğer ana araçtır. Bu dosya, Azure DevOps'un **Work Item** mantığıyla
QA kullanımını anlatır.

---

## 2. Work Item Türleri

Azure DevOps'ta iş, **Work Item** olarak modellenir. QA açısından en
önemli iki tür:

- **Bug:** Defect kaydı (bkz.
  `01-BUG-DEFECT-ISSUE-TERMINOLOGY.md`).
- **Task:** Genel iş kalemi (bug fix dışındaki işler).

---

## 3. Bug Work Item Alanları

### Assigned To

Sorumlu geliştirici (Jira'daki Assignee'nin karşılığı).

### State

Defect Lifecycle'ın (bkz. `02-DEFECT-LIFECYCLE.md`) Azure DevOps'taki
karşılığı: tipik olarak `New → Active → Resolved → Closed`.

### Priority

1 (en yüksek) - 4 (en düşük) arası sayısal skala (Jira'nın
Highest-Lowest etiketlerine benzer).

### Severity

Azure DevOps'un **native** bir Severity alanı vardır (1 - Critical'dan
4 - Low'a kadar) — bu, Jira'nın aksine genellikle **ek bir custom
field gerektirmeden** kullanılabilir (bkz.
`06-SEVERITY-VS-PRIORITY.md`).

### Repro Steps

Steps to Reproduce'un (bkz. `04-STEPS-TO-REPRODUCE.md`) Azure
DevOps'taki karşılığı — zengin metin formatında yazılır.

### System Info

Environment, Build, Device/OS/Browser bilgilerinin toplandığı alan.

### Links

Traceability için kullanılır — ilgili Test Case work item'ına
(Azure DevOps Test Plans modülü ile) veya User Story/Requirement'a
link verilir.

### Attachments

Evidence (bkz. `08-DEFECT-EVIDENCE.md`).

### Comments

Discussion/triage notları.

---

## 4. Test/Bug İlişkisi

Azure DevOps'un **Test Plans** modülü, bir Test Case'in execution'ı
sırasında **doğrudan** bir Bug work item'ı oluşturmayı destekler —
bu, Test Case ile Bug arasındaki link'i **otomatik olarak** kurar.
Bu, `05-TEST-MANAGEMENT/09-TRACEABILITY-MANAGEMENT.md`'de anlatılan
Traceability'nin Azure DevOps'taki native uygulamasıdır.

---

## 5. Jira ile Kavramsal Karşılaştırma

| Kavram | Jira | Azure DevOps |
|---|---|---|
| Defect Kaydı | Issue (Type: Bug) | Work Item (Type: Bug) |
| Durum Takibi | Status (özelleştirilebilir workflow) | State (New/Active/Resolved/Closed) |
| Severity | Genelde custom field | Native alan (1-4) |
| Test/Bug İlişkisi | Genelde eklenti (Xray/Zephyr) gerekir | Native (Test Plans modülü) |
| Traceability | Linked Issues | Links (Work Item Links) |
| Board | Kanban/Scrum Board | Board (Kanban/Sprint) |

---

## 6. Common Mistakes

- Severity ve Priority alanlarını (Azure DevOps'ta ikisi de native
  olduğu için) birbirine karıştırmak.
- Test Plans modülünü kullanmadan, Bug ile Test Case arasındaki
  ilişkiyi yalnızca metinle (link olmadan) belirtmek.
- State'i güncel tutmamak.

---

## 7. Best Practices

- Azure DevOps'un native Severity alanını doğru kullanın — Jira'daki
  gibi ayrı bir custom field oluşturmanıza gerek yoktur.
- Test Plans modülü üzerinden Test Case'den doğrudan Bug oluşturarak
  Traceability'yi otomatikleştirin.
- Repro Steps'i `04-STEPS-TO-REPRODUCE.md`'deki Good Example
  formatıyla tutarlı yazın.

---

## 8. Interview Notes

- "Azure DevOps'ta Bug ile Test Case ilişkisi nasıl kurulur?"
  sorusuna Test Plans modülünün native desteğiyle cevap verin.
- "Azure DevOps ile Jira'nın Severity/Priority yaklaşımı nasıl
  farklıdır?" sorusuna, Azure DevOps'un native bir Severity alanına
  sahip olduğunu, Jira'da bunun genelde custom field gerektirdiğini
  belirterek cevap verin.

---

## İlgili Konular

- [Jira Bug Workflow](19-JIRA-BUG-WORKFLOW.md)
- [Severity vs Priority](06-SEVERITY-VS-PRIORITY.md)
- [05-TEST-MANAGEMENT — Traceability Management](../05-TEST-MANAGEMENT/09-TRACEABILITY-MANAGEMENT.md)
