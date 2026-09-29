# Traceability Management

**Status: EXPERIENCE**

> `00-QA-FOUNDATIONS/10-TRACEABILITY-FUNDAMENTALS.md` ve
> `03-TEST-DESIGN/11-TRACEABILITY-FROM-REQUIREMENT-TO-TEST.md`,
> Traceability'nin kavramsal temelini anlatmıştı. Bu dosya,
> Traceability'nin **operasyonel olarak (bir test yönetim aracında)
> nasıl sürdürüldüğünü** anlatır.

---

## 1. Neden Önemli?

Kavramsal olarak doğru bir Traceability zinciri kurmak yeterli
değildir — bu zincirin **büyüyen bir sistemde güncel tutulması**
ayrı bir disiplindir.

---

## 2. Requirement Traceability Matrix (RTM)

**RTM**, tüm requirement'ların, hangi test case(ler) tarafından
kapsandığını gösteren bir tablodur.

| Requirement | AC | Test Case(ler) | Coverage Durumu |
|---|---|---|---|
| REQ-AUTH-001 | AC-AUTH-001 | TC-AUTH-HP-001 | Kapsanmış |
| REQ-AUTH-001 | AC-AUTH-005 | TC-AUTH-EDGE-001, TC-AUTH-EDGE-002 | Kapsanmış |
| REQ-AUTH-001 | AC-AUTH-009 | — | **Kapsanmamış** |

RTM, bu üçüncü satırdaki gibi **kapsanmamış** (test case'i olmayan)
AC'leri görünür kılar — bu, coverage boşluklarını erken tespit
etmenin en pratik yoludur.

---

## 3. Traceability Yönetiminin Operasyonel Adımları

1. Her yeni Requirement/AC oluşturulduğunda RTM'e eklenir (başlangıçta
   "Kapsanmamış" durumunda).
2. Test Case tasarlandıkça, ilgili AC'ye bağlanır ve durum
   "Kapsanmış" olarak güncellenir.
3. Requirement değiştiğinde (bkz.
   `01-REQUIREMENT-ANALYSIS/09-CHANGE-IMPACT-ANALYSIS.md`), RTM
   üzerinden etkilenen Test Case'ler bulunur ve gözden geçirilir.
4. Release öncesi RTM taranır — "Kapsanmamış" AC kalmadığı
   doğrulanır (veya kalan boşluklar bilinçli olarak Release Risk'e
   (bkz. `../02-RISK-BASED-TESTING/07-RELEASE-RISK.md`) dahil
   edilir).

---

## 4. Araçlarda Traceability

Modern test/proje yönetim araçlarında (Jira, Azure DevOps — bkz.
`20-TOOLS-AND-WORKFLOWS.md`) Traceability genellikle **linked
issues** özelliğiyle sağlanır: bir Test Case work item'ı, ilgili
Requirement/Story work item'ına link'lenir. Bu, RTM'in elle tablo
tutmak yerine araç içinde sorgulanabilir hale gelmesini sağlar.

---

## 5. Common Mistakes

- RTM'i yalnızca proje başında bir kez oluşturup hiç güncellememek.
- Test Case'leri Requirement'a bağlamadan yazmak — bu, Traceability'yi
  baştan imkansız kılar.
- "Kapsanmamış" AC'leri fark edip hiç raporlamadan release'e devam
  etmek.

---

## 6. Best Practices

- RTM'i her sprint/release döngüsünün standart bir çıktısı yapın.
- Araç kullanıyorsanız (Jira/Azure DevOps), link'leme disiplinini
  ekip standardı haline getirin.
- Release öncesi RTM'i tarayıp kapsanmamış alanları açıkça
  raporlayın.

---

## 7. Interview Notes

- "Requirement Traceability Matrix nedir, ne işe yarar?" sorusuna,
  coverage boşluklarını görünür kıldığını somut bir örnekle
  (kapsanmamış AC satırı) açıklayarak cevap verin.
- "Bir requirement değiştiğinde Traceability nasıl kullanılır?"
  sorusuna, RTM üzerinden etkilenen test case'lerin bulunacağını
  belirterek cevap verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Traceability Fundamentals](../00-QA-FOUNDATIONS/10-TRACEABILITY-FUNDAMENTALS.md)
- [Test Coverage](10-TEST-COVERAGE.md)
- [Tools and Workflows](20-TOOLS-AND-WORKFLOWS.md)
