# Traceability Fundamentals

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir defect bulunduğunda "bu hangi requirement'ı bozuyor?" sorusuna hızlı
cevap veremiyorsanız, Traceability eksik demektir. Bu dosya,
Traceability'nin ne olduğunu ve neden her büyüklükteki projede değerli
olduğunu anlatır.

---

## 2. Traceability Nedir?

**Traceability**, bir requirement'ın, test senaryosuna, test case'ine,
execution sonucuna ve varsa defect'e kadar **izlenebilir** olmasıdır.

---

## 3. Neden Gereklidir?

- **Impact Analysis:** Bir requirement değiştiğinde, hangi test
  case'lerin etkilendiğini hızlıca bulabilmek.
- **Coverage Kontrolü:** Her requirement'ın en az bir test case
  tarafından kapsandığını doğrulayabilmek.
- **Kök Neden Analizi:** Bir defect bulunduğunda, hangi requirement'a
  ait olduğunu ve o requirement'ın hangi test senaryolarıyla
  kapsandığını görebilmek.
- **Audit / Release Hazırlığı:** "Bu feature gerçekten test edildi mi?"
  sorusuna kanıtla cevap verebilmek.

---

## 4. İlişki Zinciri

```text
Requirement
    ↓
Test Scenario
    ↓
Test Case
    ↓
Execution
    ↓
Defect
    ↓
Retest
    ↓
Release
```

Her adım, bir öncekine bağlıdır. Bir Requirement'tan başlayarak, o
requirement'ı doğrulayan Test Scenario'lara, onlardan türeyen somut
Test Case'lere, bu case'lerin Execution sonuçlarına, sonuçtan çıkan
Defect'lere, Defect'in Retest edilmesine ve nihayetinde Release
kararına kadar her adım izlenebilir olmalıdır.

---

## 5. Örnek ID'ler Üzerinden Gösterim

**Önemli not:** Aşağıdaki ID formatı yalnızca **eğitim amaçlı örnektir**.
Bu Phase'de repository'nin global ID naming standardı (Test Case ID,
Requirement ID, Bug ID formatı) governance seviyesinde belirlenmemiştir;
bu konu ileride ilgili Phase'lerde (Requirement & Test Design, Test &
Defect Management) ayrıca ele alınacaktır.

```text
REQ-AUTH-001
"Kullanıcı geçerli email ve password ile login olabilir."
    ↓
TC-AUTH-HP-001
"Geçerli email ve password ile login — Happy Path"
    ↓
Execution: FAIL
    ↓
BUG-AUTH-001
"Geçerli credential ile login sonrası session oluşmuyor"
    ↓
Retest: Fix sonrası TC-AUTH-HP-001 tekrar çalıştırıldı → PASS
    ↓
Release: REQ-AUTH-001 karşılandı, defect kapatıldı
```

Bu zincir sayesinde:

- REQ-AUTH-001'in hangi test case'lerle kapsandığı bilinir.
- TC-AUTH-HP-001'in hangi execution'da FAIL olduğu bilinir.
- BUG-AUTH-001'in hangi requirement'ı etkilediği bilinir.
- Release kararı verilirken REQ-AUTH-001'in gerçekten doğrulandığı
  kanıtlanabilir.

---

## 6. Traceability Olmadan Ne Kaybedilir?

Eğer bu ilişkiler kayıt altına alınmazsa:

- Bir requirement değiştiğinde hangi test case'lerin güncellenmesi
  gerektiği bilinmez — eski/yanlış test case'ler çalışmaya devam eder.
- Bir defect'in hangi requirement'ı ihlal ettiği belirsiz kalır, kök
  neden analizi zorlaşır.
- Release öncesi "her şey test edildi mi?" sorusuna kanıta dayalı cevap
  verilemez, yalnızca varsayıma dayalı güven oluşur.

---

## 7. Common Mistakes

- Traceability'yi yalnızca büyük/kurumsal projelere özgü, gereksiz
  bürokrasi sanmak.
- Test case'leri requirement'a hiç referans vermeden yazmak.
- Defect'i, hangi test case'in execution'ından çıktığını kaydetmeden
  raporlamak.

---

## 8. Best Practices

- Küçük projelerde bile, en azından requirement ↔ test case ilişkisini
  basit bir tabloyla veya araç (Jira, Excel) ile takip edin.
- Test case yazarken ilgili requirement'a referans verin.
- Defect raporlarken, defect'in hangi test case execution'ından
  çıktığını belirtin.

---

## 9. Interview Notes

- "Traceability nedir, neden önemlidir?" sorusuna impact analysis ve
  coverage örnekleriyle cevap verin.
- "Traceability olmadan ne kaybedilir?" sorusuna somut bir senaryo
  (requirement değişti ama ilgili test case güncellenmedi) ile cevap
  verin.

---

## İlgili Konular

- [Test Oracle](08-TEST-ORACLE.md)
- [Entry & Exit Criteria](09-ENTRY-AND-EXIT-CRITERIA.md)
- [Quality Gates Overview](15-QUALITY-GATES-OVERVIEW.md)
