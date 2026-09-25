# Tools and Workflows

**Status: EXPERIENCE** (bkz. bölüm 6 için istisna)

---

## 1. Neden Önemli?

Bu dosya, QA-COMPETENCY-MAP.md'de EXPERIENCE olarak işaretlenmiş
araçları (Jira, Azure DevOps, Trello, Confluence), **QA perspektifinden**
karşılaştırır: her aracın Test Management ve Defect Management için
nasıl kullanıldığını gösterir.

---

## 2. Jira

**Status: EXPERIENCE**

### QA Ne Yapabilir?

Bug/Defect oluşturma ve takip etme, Test/Requirement ilişkisini Linked
Issues ile kurma, JQL ile filtreli sorgular oluşturma.

### Test Management Nasıl Kullanılır?

Test Case'ler genellikle ayrı bir issue tipi olarak veya (Xray/Zephyr
gibi bir eklenti ile — bkz. bölüm 6) native Jira içinde tutulur.
Kanban/Scrum board üzerinde test aktiviteleri izlenir.

### Bug Nasıl Takip Edilir?

Bug, bir issue tipi olarak oluşturulur; Status alanı (bkz.
`../06-DEFECT-MANAGEMENT/02-DEFECT-LIFECYCLE.md`) workflow'a göre
ilerler (Open → In Progress → Fixed → Retest → Closed).

### Workflow Nasıl Kullanılır?

Jira'nın özelleştirilebilir workflow'ları, organizasyonun defect
lifecycle'ını (bkz. `../06-DEFECT-MANAGEMENT/19-JIRA-BUG-WORKFLOW.md`)
birebir yansıtacak şekilde konfigüre edilir.

### Documentation Nasıl Bağlanır?

Confluence sayfalarına (test planı, requirement dokümanı) Jira
issue'larından link verilir; bu, Traceability'nin (bkz.
`09-TRACEABILITY-MANAGEMENT.md`) araç seviyesindeki karşılığıdır.

---

## 3. Azure DevOps

**Status: EXPERIENCE**

### QA Ne Yapabilir?

Work Item olarak Bug/Test Case oluşturma, Test Plans modülü ile test
suite/cycle yönetimi, Queries ile filtreli raporlama.

### Test Management Nasıl Kullanılır?

Azure DevOps'un **Test Plans** modülü, Test Suite ve Test Case'leri
native olarak destekler — Jira'nın aksine ayrı bir eklenti
gerektirmez.

### Bug Nasıl Takip Edilir?

Bug work item'ı, State alanı (bkz.
`../06-DEFECT-MANAGEMENT/20-AZURE-DEVOPS-DEFECT-WORKFLOW.md`) ile
takip edilir; Test Case'lere doğrudan link'lenebilir (Test/Bug
ilişkisi).

### Workflow Nasıl Kullanılır?

Board üzerinde State bazlı workflow (New → Active → Resolved →
Closed gibi) kullanılır.

### Documentation Nasıl Bağlanır?

Azure DevOps Wiki veya harici bir dokümantasyon aracına work item'lar
üzerinden link verilir.

---

## 4. Trello

**Status: EXPERIENCE**

### QA Ne Yapabilir?

Basit Kanban board'lar üzerinde test/bug takibi, kart bazlı
checklist'ler ile Test Case adımlarını izleme.

### Test Management Nasıl Kullanılır?

Trello, Jira/Azure DevOps kadar zengin bir Test Management altyapısı
sunmaz; genellikle **küçük ekiplerde** veya **basit takip
ihtiyaçlarında** kullanılır. Kartlar üzerinde checklist özelliğiyle
Test Case adımları izlenebilir.

### Bug Nasıl Takip Edilir?

Bug'lar genellikle ayrı bir liste ("Bugs") altında kart olarak
oluşturulur; etiketler (labels) ile severity/priority belirtilir.

### Workflow Nasıl Kullanılır?

Liste bazlı basit bir Kanban akışı (To Do → In Progress → Done gibi)
kullanılır.

### Documentation Nasıl Bağlanır?

Kart açıklamalarına veya yorumlara harici dokümantasyon linkleri
eklenir.

---

## 5. Confluence

**Status: EXPERIENCE**

### QA Ne Yapabilir?

Test Strategy, Test Plan, Requirement Analysis dokümanlarını
oluşturmak ve organize etmek; Jira/Work Item'larla çift yönlü
link'leme yapmak.

### Test Management Nasıl Kullanılır?

Test Plan (bkz. `02-TEST-PLAN.md`) ve Test Strategy (bkz.
`01-TEST-STRATEGY.md`) gibi uzun formatlı dokümanlar Confluence'ta
yazılır; Jira issue'ları bu sayfalara link verilir.

### Bug Nasıl Takip Edilir?

Confluence, bug takibi için kullanılmaz (bu Jira'nın işidir) — ancak
"Bug Triage Meeting Notes" gibi süreç dokümanları Confluence'ta
tutulabilir.

### Workflow Nasıl Kullanılır?

Confluence'ın kendi workflow'u yoktur; dokümanlar genellikle Draft →
Review → Published aşamalarından geçer.

### Documentation Nasıl Bağlanır?

Confluence, "documentation nasıl bağlanır" sorusunun **kendisinin
cevabıdır** — Jira/Azure DevOps'taki work item'lar, Confluence
sayfalarına referans verir.

---

## 6. Xray / Zephyr / TestRail

> **Knowledge Status: LEARNING**

Xray, Zephyr ve TestRail, Jira/Azure DevOps üzerine (veya bağımsız
olarak) Test Case Management'ı zenginleştiren özel araçlardır (Test
Case repository, execution tracking, gelişmiş raporlama gibi
özellikler sunarlar).

Bu repository'de bu araçlarla **profesyonel deneyim iddiası
yapılmamaktadır**. Bu araçların genel amacı ve Jira/Azure DevOps'un
native Test Management yeteneklerine göre ne kattıkları
**öğrenilecek** bir alan olarak işaretlenmiştir:

- Xray: Jira üzerinde native Test Management eklentisi.
- Zephyr: Jira üzerinde alternatif Test Management eklentisi.
- TestRail: Bağımsız, araç-agnostik Test Case Management platformu.

---

## 7. Common Mistakes

- Bir aracın genel popülerliğine dayanarak, o araçla deneyim iddia
  etmek.
- Trello'yu, zengin Test Management ihtiyaçları olan büyük bir
  proje için Jira/Azure DevOps'un yerine önermek.
- Confluence'ı bir bug takip aracı gibi kullanmaya çalışmak.

---

## 8. Best Practices

- Aracı, ekibin ve projenin ölçeğine göre seçin (küçük ekip → Trello
  yeterli olabilir; kurumsal ölçek → Jira/Azure DevOps).
- Documentation ile issue tracking aracını (örn. Confluence + Jira)
  her zaman çift yönlü link'leyin.
- Bilmediğiniz bir aracı (Xray/Zephyr/TestRail gibi) EXPERIENCE olarak
  sunmayın — LEARNING olarak dürüstçe belirtin.

---

## 9. Interview Notes

- "Jira ile Azure DevOps arasındaki temel fark nedir?" sorusuna,
  Azure DevOps'un native Test Plans modülüne sahip olduğunu, Jira'nın
  bunun için genelde eklenti gerektirdiğini belirterek cevap verin.
- "Trello'yu ne zaman kullanırsınız?" sorusuna, küçük ekip/basit
  takip ihtiyaçları için uygun olduğunu, büyük ölçekli Test Management
  için yetersiz kalabileceğini açıklayarak cevap verin.
- "Xray veya TestRail kullandınız mı?" sorusuna dürüstçe, bu
  araçların LEARNING seviyesinde olduğunu belirterek cevap verin.

---

## İlgili Konular

- [Kanban QA Workflow](19-KANBAN-QA-WORKFLOW.md)
- [06-DEFECT-MANAGEMENT — Jira Bug Workflow](../06-DEFECT-MANAGEMENT/19-JIRA-BUG-WORKFLOW.md)
- [06-DEFECT-MANAGEMENT — Azure DevOps Defect Workflow](../06-DEFECT-MANAGEMENT/20-AZURE-DEVOPS-DEFECT-WORKFLOW.md)
