# Bug / Defect / Issue Terminology

**Status: EXPERIENCE**

> `00-QA-FOUNDATIONS/07-ERROR-DEFECT-FAILURE.md`, Error/Defect/Bug/
> Failure zincirini kavramsal olarak anlatmıştı. Bu dosya, aynı
> terimlerin **sektörel/pratik kullanımını** ve "Issue" kavramının
> nereye oturduğunu netleştirir.

---

## 1. Neden Önemli?

Farklı araçlar (Jira, Azure DevOps) ve farklı ekipler, aynı kavram
için farklı kelimeler kullanır. Bu dosya, bu terimler arasında
**pratik bir eşleme** kurar.

---

## 2. Bug / Defect

Bu repository'de (bkz. `TERMINOLOGY-GLOSSARY.md`), **Bug** ve
**Defect** birbirinin yerine kullanılabilir terimlerdir. İkisi de:

> Sistemin beklenen davranıştan sapmasını, dokümante edilmiş ve
> takip edilebilir bir kayıt haline getirilmiş halini ifade eder.

## 3. Issue

**Issue**, Jira/Azure DevOps gibi araçlarda kullanılan, **daha geniş**
bir şemsiye terimdir. Bir Issue; bir Bug/Defect olabileceği gibi, bir
Task, Story, Epic de olabilir.

```text
Issue (şemsiye terim — araç seviyesinde)
   ├── Bug / Defect (bu repository'de birbirinin yerine kullanılır)
   ├── Task
   ├── Story
   └── Epic
```

---

## 4. Pratik Kullanım

Bir QA Engineer, günlük konuşmada şu üç ifadeyi de duyabilir ve
hepsi genellikle **aynı şeyi** kastediyor olabilir:

- "Bir **bug** buldum."
- "Bu **defect**'i raporladım."
- "Jira'da bir **issue** açtım." *(burada "issue", aracın issue
  type'ı Bug olarak seçildiği için, fiilen bir defect'i ifade eder)*

Karışıklık, "Issue" kelimesinin araç seviyesinde **daha geniş**
(Task/Story/Epic'i de kapsayan) bir anlamı olmasından kaynaklanır.
Bir QA, "issue açtım" dediğinde bağlamdan (issue type = Bug) bunun
bir defect olduğu anlaşılmalıdır — ama teknik olarak her Issue bir
Bug değildir.

---

## 5. Bu Repository'nin Terim Tercihi

Klasör adı (`06-DEFECT-MANAGEMENT`) ve içerik boyunca **Bug** ve
**Defect** terimleri birbirinin yerine, tutarlı şekilde kullanılır.
"Issue" terimi yalnızca Jira/Azure DevOps gibi **araç bağlamında**
(bkz. `19-JIRA-BUG-WORKFLOW.md`, `20-AZURE-DEVOPS-DEFECT-WORKFLOW.md`)
kullanılır.

---

## 6. Common Mistakes

- "Issue" ve "Bug"ı her zaman birebir eş anlamlı sanmak (oysa Issue
  daha geniş bir kategoridir).
- Bug ve Defect arasında akademik bir ayrım aramaya çalışmak (bu
  repository'de pratik sektör kullanımı benimsenmiştir — bkz.
  `00-QA-FOUNDATIONS/07-ERROR-DEFECT-FAILURE.md`, bölüm 4).

---

## 7. Best Practices

- Ekip içinde hangi terimin (Bug/Defect) standart olarak
  kullanılacağını netleştirin ve tutarlı kalın.
- Bir Issue oluştururken doğru Issue Type'ı (Bug) seçtiğinizden emin
  olun — bu, raporlama ve metriklerin (bkz. `18-DEFECT-METRICS.md`)
  doğru çalışması için kritiktir.

---

## 8. Interview Notes

- "Bug, Defect ve Issue arasındaki fark nedir?" sorusuna, Bug/Defect'in
  bu repository'de eş anlamlı kullanıldığını, Issue'nun ise araç
  seviyesinde daha geniş bir şemsiye terim olduğunu açıklayarak cevap
  verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Error/Defect/Failure](../00-QA-FOUNDATIONS/07-ERROR-DEFECT-FAILURE.md)
- [Defect Lifecycle](02-DEFECT-LIFECYCLE.md)
- [Jira Bug Workflow](19-JIRA-BUG-WORKFLOW.md)
