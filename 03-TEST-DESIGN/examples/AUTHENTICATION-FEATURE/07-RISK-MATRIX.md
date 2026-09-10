# Authentication Feature — Risk Matrix

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)

---

## Yöntem

`02-RISK-BASED-TESTING/03-RISK-MATRIX.md`'deki 5x5 matrix kullanılarak,
Authentication feature'ının riskleri değerlendirilmiştir.

---

## Risk Değerlendirmesi

| Risk ID | Risk Description | Probability | Impact | Priority |
|---|---|---|---|---|
| RISK-AUTH-01 | Inactive (disabled/deleted) kullanıcının API üzerinden login olabilmesi (BR-AUTH-001 ihlali) | Low | Critical | **High** |
| RISK-AUTH-02 | Account lock mekanizmasının hiç çalışmaması (sınırsız deneme hakkı) | Medium | High | **High** |
| RISK-AUTH-03 | Hata mesajının, email'in sistemde kayıtlı olup olmadığını ifşa etmesi | Medium | Medium | **Medium** |
| RISK-AUTH-04 | Session timeout süresinin yanlış uygulanması (çok erken veya hiç sonlanmaması) | Medium | Medium | **Medium** |
| RISK-AUTH-05 | Multiple session desteğinin bir cihazdaki logout işleminde diğerini de sonlandırması (BR-AUTH-004 ihlali) | Low | Low | **Low** |
| RISK-AUTH-06 | Login formundaki buton renginin tasarıma uygun olmaması | High | Very Low | **Low** |

---

## Önceliklendirme Gerekçesi

- **RISK-AUTH-01** ve **RISK-AUTH-02** en yüksek önceliklidir çünkü
  ikisi de güvenlik açığına doğrudan yol açabilecek Business Rule
  ihlalleridir (bkz.
  [04-BUSINESS-RULES.md](04-BUSINESS-RULES.md)) — bu iki risk, test
  tasarımında (bkz. `08-TEST-CONDITIONS.md`) en derinlemesine kapsanan
  alanlardır.
- **RISK-AUTH-03** ve **RISK-AUTH-04**, kullanıcı deneyimini ve
  güvenliği orta düzeyde etkiler; temel senaryolarla kapsanır.
- **RISK-AUTH-05** ve **RISK-AUTH-06**, düşük etkili oldukları için
  test kapsamında yer alır ama derinlemesine senaryo çeşitliliği
  gerektirmez.

---

## Bu Risk Değerlendirmesi Test Tasarımını Nasıl Yönlendirir?

`02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md`'deki prensiple
tutarlı olarak, en yüksek öncelikli riskler (RISK-AUTH-01,
RISK-AUTH-02), bir sonraki adımda (`08-TEST-CONDITIONS.md`) en fazla
sayıda ve en çeşitli (positive, negative, edge) test condition ile
temsil edilecektir.

---

## Sonraki Adım

[08 — Test Conditions](08-TEST-CONDITIONS.md)
