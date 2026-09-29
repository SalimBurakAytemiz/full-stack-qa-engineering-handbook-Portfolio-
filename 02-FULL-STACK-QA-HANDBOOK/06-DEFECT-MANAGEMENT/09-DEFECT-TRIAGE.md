# Defect Triage

**Status: EXPERIENCE**

> `TERMINOLOGY-GLOSSARY.md`'de bu kavram "Bug Triage" olarak
> tanımlıdır; bu dosyada "Defect Triage" ve "Bug Triage" birbirinin
> yerine kullanılır.

---

## 1. Neden Önemli?

Bir defect raporlandıktan sonra, kimin, ne zaman, nasıl ele alacağı
belirsizse defect "havada kalır". Triage, bu belirsizliği ortadan
kaldıran yapılandırılmış karar sürecidir.

---

## 2. Defect Triage Nedir?

QA, Development, Product veya diğer ekiplerin, bir defect'in
**severity, priority, owner ve release impact** gibi özelliklerini
birlikte değerlendirdiği süreçtir.

---

## 3. Triage Sürecinde Değerlendirilenler

| Değerlendirme | Soru |
|---|---|
| Geçerlilik | Bu gerçekten bir defect mi, yoksa NOT A BUG/DUPLICATE mi (bkz. `13-DUPLICATE-REJECTED-NOT-A-BUG.md`)? |
| Severity | Teknik/işlevsel etkisi ne kadar ciddi (bkz. `06-SEVERITY-VS-PRIORITY.md`)? |
| Priority | Ne kadar acil çözülmeli? |
| Owner | Hangi ekip/kişi sorumlu (bkz. `14-ROOT-CAUSE-ISOLATION.md` — hangi katmana ait)? |
| Release Impact | Bu defect, mevcut release'i engelliyor mu (bkz. `../05-TEST-MANAGEMENT/17-RELEASE-QA-SIGN-OFF.md`)? |

---

## 4. Tipik Triage Toplantısı Akışı

```text
Yeni Defect'ler Listelenir (NEW statüsünde)
   ↓
Her Defect İçin:
   - Geçerli mi? (Evet → devam / Hayır → REJECTED/DUPLICATE/NOT A BUG)
   - Severity teyit edilir
   - Priority belirlenir (iş bağlamı dahil edilerek)
   - Owner atanır
   ↓
Defect OPEN Statüsüne Geçer (bkz. 02-DEFECT-LIFECYCLE.md)
```

---

## 5. Kim Katılır?

Triage genellikle şu rollerin katılımıyla yürütülür:

- **QA:** Defect'i bulan/raporlayan kişi, teknik detayı sunar.
- **Development:** Fix'in karmaşıklığı ve etkilenen alan hakkında
  girdi sağlar.
- **Product/Business (gerektiğinde):** İş etkisini değerlendirir,
  Priority kararına katkı sağlar (özellikle Severity/Priority farklı
  olduğunda — bkz. `06-SEVERITY-VS-PRIORITY.md` örnekleri).

---

## 6. Common Mistakes

- Triage'ı yalnızca QA'nın tek başına yaptığı bir karar sanmak.
- Her defect'i triage etmeden doğrudan Development'a atamak.
- Triage kararlarını (neden bu Priority, neden bu Owner) dokümante
  etmemek.

---

## 7. Best Practices

- Triage'ı düzenli bir kadans ile (örn. günlük veya haftalık) yapın.
- Her kararın gerekçesini kısaca not edin.
- Release'i etkileyebilecek yüksek öncelikli defect'leri triage'da
  öne çıkarın.

---

## 8. Interview Notes

- "Defect Triage nedir, kimler katılır?" sorusuna QA/Development/
  Product rolleriyle ve değerlendirilen boyutlarla cevap verin.
- "Triage'da hangi kararlar verilir?" sorusuna geçerlilik, severity,
  priority, owner, release impact ile cevap verin.

---

## İlgili Konular

- [Severity vs Priority](06-SEVERITY-VS-PRIORITY.md)
- [Duplicate / Rejected / Not a Bug](13-DUPLICATE-REJECTED-NOT-A-BUG.md)
- [Defect Lifecycle](02-DEFECT-LIFECYCLE.md)
