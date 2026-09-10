# Traceability From Requirement to Test

**Status: EXPERIENCE**

> Bu dosya, `00-QA-FOUNDATIONS/10-TRACEABILITY-FUNDAMENTALS.md`'de
> tanıtılan Traceability kavramını, Phase 2'nin analiz ve tasarım
> katmanlarına (Requirement → Acceptance Criteria → Test Scenario →
> Test Case) genişletir. Bu Phase'de Jira/Defect detayına
> girilmemektedir — bu konu ileriki bir Phase'e (Test & Defect
> Management) aittir.

---

## 1. Neden Önemli?

Phase 2 boyunca öğrenilen tüm analiz adımları (Requirement Types,
Acceptance Criteria, Risk Assessment, Test Design) birbirinden kopuk
kalırsa değerini kaybeder. Traceability, bu adımları **tek bir
izlenebilir zincire** bağlar.

---

## 2. Genişletilmiş Zincir

```text
REQ-AUTH-001                (Requirement)
    ↓
AC-AUTH-001                 (Acceptance Criteria)
    ↓
TS-AUTH-001                 (Test Scenario)
    ↓
TC-AUTH-HP-001               (Test Case)
    ↓
Execution                   (Test Case çalıştırılır)
    ↓
BUG-AUTH-001 (varsa)         (Execution FAIL olursa)
```

---

## 3. Her Adımın Anlamı

| Adım | Kaynak Dosya (bu repository içinde) |
|---|---|
| Requirement | `01-REQUIREMENT-ANALYSIS/01-REQUIREMENT-TYPES.md` |
| Acceptance Criteria | `01-REQUIREMENT-ANALYSIS/02-ACCEPTANCE-CRITERIA.md` |
| Risk Değerlendirmesi (Priority) | `02-RISK-BASED-TESTING/03-RISK-MATRIX.md` |
| Test Condition / Scenario | `03-TEST-DESIGN/01-TEST-CONDITION-SCENARIO-CASE.md` |
| Test Case | `03-TEST-DESIGN/10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md` |
| Defect (Execution FAIL olursa) | İleriki Phase (Test & Defect Management) |

---

## 4. Örnek Zincir Üzerinden Gösterim

**REQ-AUTH-001:** "Kayıtlı ve aktif kullanıcı geçerli email ve
password kullanarak sisteme login olabilir."

**AC-AUTH-001:** "Geçerli email ve password girildiğinde kullanıcı
başarıyla login olur ve ana sayfaya yönlendirilir."

**TS-AUTH-001:** "Kullanıcı geçerli email ve password ile login
dener." (Test Scenario)

**TC-AUTH-HP-001:** Precondition + Test Data + Steps + Expected
Result içeren somut Test Case (bkz.
`examples/AUTHENTICATION-FEATURE/10-TEST-CASES.md`).

**Execution:** `TC-AUTH-HP-001` çalıştırılır. Eğer sonuç beklenenle
uyuşmuyorsa (örn. login başarısız oluyor), bu execution bir defect'e
bağlanır: **BUG-AUTH-001**.

---

## 5. Bu Zincir Neden Değerlidir?

- **Impact Analysis kolaylaşır:** REQ-AUTH-001 değiştiğinde, hangi
  AC, TS ve TC'lerin güncellenmesi gerektiği anında bulunabilir.
- **Coverage kanıtlanabilir:** Her AC'nin en az bir TC tarafından
  kapsandığı gösterilebilir.
- **Kök neden analizi hızlanır:** Bir defect bulunduğunda, hangi
  requirement'ı ihlal ettiği zincir üzerinden geriye doğru izlenebilir.

---

## 6. Önemli Sınır: Bu Phase'de Defect Detayına Girilmiyor

Bu dosya, zincirin **BUG-AUTH-001** ile nasıl bağlanabileceğini
gösterir, ama defect lifecycle'ı (severity/priority belirleme, bug
triage, retest, reopen gibi konular) bu Phase'in kapsamı dışındadır.
Bu konular `06-DEFECT-MANAGEMENT/` klasöründe, ileriki bir Phase'de
ele alınacaktır.

---

## 7. Common Mistakes

- Test Case'leri, hangi Requirement/AC'ye bağlı olduğunu belirtmeden
  yazmak.
- Zinciri yalnızca dokümantasyon için oluşturup, requirement
  değiştiğinde hiç güncellememek.
- Zincirin son adımını (defect bağlantısı) tamamen atlayıp, bir
  execution'ın neden FAIL olduğunu izlenebilir kılmamak.

---

## 8. Best Practices

- Her Test Case'i yazarken, ilgili Requirement/AC'ye açık bir
  referans ekleyin.
- Zinciri basit bir tabloyla bile olsa (büyük araçlar gerekmez) takip
  edin.
- Requirement değiştiğinde, zincir üzerinden etkilenen tüm TC'leri
  gözden geçirin (bkz.
  `01-REQUIREMENT-ANALYSIS/09-CHANGE-IMPACT-ANALYSIS.md`).

---

## 9. Interview Notes

- "Requirement'tan Test Case'e kadar olan zinciri nasıl kurarsınız?"
  sorusuna somut bir örnek (REQ → AC → TS → TC) ile cevap verin.
- "Bu zincir neden coverage kanıtlamak için önemlidir?" sorusuna,
  her AC'nin en az bir TC tarafından kapsandığının gösterilebilir
  olması gerektiğini belirterek cevap verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Traceability Fundamentals](../00-QA-FOUNDATIONS/10-TRACEABILITY-FUNDAMENTALS.md)
- [examples/AUTHENTICATION-FEATURE — Traceability](examples/AUTHENTICATION-FEATURE/12-TRACEABILITY.md)
- [Test Condition / Scenario / Case](01-TEST-CONDITION-SCENARIO-CASE.md)
