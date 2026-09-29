# Common Requirement Problems

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bu dosya, requirement review sırasında sık karşılaşılan problem
türlerini, her birini somut bir örnekle göstererek listeler. Amaç,
bu problemleri **tanıyabilmek** ve development başlamadan
raporlayabilmektir.

---

## 2. Ambiguous Requirement (Belirsiz Requirement)

**Örnek:** "Kullanıcı profilini güncelleyebilir."

**Problem:** Hangi alanlar güncellenebilir? Email güncellemesi
doğrulama gerektirir mi? Belirsiz.

---

## 3. Missing Acceptance Criteria (Eksik Kabul Kriterleri)

**Örnek:** "Kullanıcı ürünleri filtreleyebilir." — hiçbir AC eklenmemiş.

**Problem:** Hangi filtreler, birden fazla filtre birlikte
kullanılabilir mi, filtre sonucu boşsa ne gösterilir — hiçbiri
tanımlanmamış.

---

## 4. Conflicting Requirement (Çelişen Requirement)

**Örnek:** Bir maddede "misafir kullanıcılar sepete ürün ekleyebilir"
yazarken, başka bir maddede "sepete ekleme yalnızca giriş yapmış
kullanıcılar için geçerlidir" yazıyor.

**Problem:** İki madde birbiriyle doğrudan çelişiyor; hangisi
geçerli belirsiz.

---

## 5. Missing Error Behaviour (Eksik Hata Davranışı)

**Örnek:** "Kullanıcı ödeme yapabilir." — ödeme başarısız olursa ne
olacağı hiç yazılmamış.

**Problem:** Negative Flow tamamen eksik; sistem hatalı durumda ne
yapacağını bilmiyor.

---

## 6. Missing Boundary (Eksik Sınır Tanımı)

**Örnek:** "Kullanıcı adı alanı bir uzunluk sınırına sahip olmalı."

**Problem:** Minimum/maksimum karakter sayısı belirtilmemiş — Boundary
Value Analysis (bkz. `03-TEST-DESIGN/03-BOUNDARY-VALUE-ANALYSIS.md`)
uygulanamaz.

---

## 7. Undefined Role Behaviour (Tanımsız Rol Davranışı)

**Örnek:** "Admin kullanıcı yönetimi ekranına erişebilir." — Moderator
rolünün bu ekrana erişip erişemeyeceği hiç belirtilmemiş.

**Problem:** Admin ve normal kullanıcı dışındaki rollerin davranışı
tanımsız kalmış.

---

## 8. Hidden Dependency (Gizli Bağımlılık)

**Örnek:** "Kullanıcı siparişini iptal edebilir." — ama iptal
işleminin, ödeme servisine bir "refund" çağrısı tetiklediği
requirement'ta hiç belirtilmemiş; bu bağımlılık yalnızca kod
incelendiğinde ortaya çıkıyor.

**Problem:** Test kapsamı, gizli bağımlılık fark edilmezse eksik
kalır (bkz. `08-DEPENDENCY-ANALYSIS.md`).

---

## 9. Undefined State Transition (Tanımsız Durum Geçişi)

**Örnek:** Sipariş durumları `CREATED`, `PAID`, `SHIPPED`,
`DELIVERED` olarak tanımlanmış ama `DELIVERED` durumundan
`CREATED`'e geri dönülüp dönülemeyeceği (örn. iade sonrası) hiç
belirtilmemiş.

**Problem:** Geçersiz geçişlerin nasıl engelleneceği tanımsız (bkz.
`03-TEST-DESIGN/05-STATE-TRANSITION-TESTING.md`).

---

## 10. Undefined Empty State (Tanımsız Boş Durum)

**Örnek:** "Kullanıcı sipariş geçmişini görüntüleyebilir." — hiç
siparişi olmayan bir kullanıcı bu ekranı açtığında ne göreceği
belirtilmemiş.

**Problem:** Boş liste/boş durum (empty state) davranışı çoğu zaman
requirement'larda unutulur, ama gerçek kullanıcı deneyiminin önemli
bir parçasıdır.

---

## 11. Undefined Timeout (Tanımsız Zaman Aşımı)

**Örnek:** "Sistem ödeme sağlayıcısından yanıt bekler." — ne kadar
süre beklenileceği, süre dolduğunda ne olacağı belirtilmemiş.

**Problem:** Timeout senaryosu test edilemez; sistem sonsuza kadar mı
bekleyecek, yoksa belirli bir süre sonra mı hata verecek belirsiz.

---

## 12. Undefined Retry Behaviour (Tanımsız Tekrar Deneme Davranışı)

**Örnek:** "Bildirim gönderimi başarısız olursa sistem tekrar
dener." — kaç kez, hangi aralıklarla, ne zaman vazgeçileceği
belirtilmemiş.

**Problem:** Retry mantığı test edilemez ve yanlış implemente
edilme riski yüksektir (örn. sonsuz retry döngüsü).

---

## 13. Missing Audit/Log Requirement (Eksik Denetim Kaydı Gereksinimi)

**Örnek:** "Admin kullanıcı silebilir." — bu işlemin loglanıp
loglanmayacağı, kim tarafından yapıldığının kaydedilip
kaydedilmeyeceği belirtilmemiş.

**Problem:** Kritik işlemler için audit trail eksikliği, hem
operasyonel hem de güvenlik açısından risk yaratır.

---

## 14. Environment Assumption (Ortam Varsayımı)

**Örnek:** Requirement, "kullanıcının cihazında her zaman internet
bağlantısı olduğunu" zımnen varsayıyor; offline/zayıf bağlantı
davranışı hiç ele alınmamış.

**Problem:** Gerçek dünyada geçersiz olan bir varsayım, test
kapsamının önemli bir kısmını (network interruption, offline mode)
tamamen dışarıda bırakır.

---

## 15. Common Mistakes

- Bu problemleri yalnızca "büyük" requirement'larda aramak; küçük
  görünen requirement'larda da aynı problemler oluşabilir.
- Bir problemi fark edip, raporlamadan "ben zaten biliyorum" diyerek
  geçmek — bu bilgi dokümante edilmezse ekip içinde paylaşılmaz.
- Tüm bu problemleri development bittikten sonra fark etmek.

---

## 16. Best Practices

- Requirement Review Checklist'i (bkz.
  `10-REQUIREMENT-REVIEW-CHECKLIST.md`) kullanırken bu problem
  listesini referans olarak yanınızda bulundurun.
- Her fark edilen problemi somut bir soru veya öneri şeklinde
  raporlayın — yalnızca "bu belirsiz" demek yeterli değildir.
- Tekrarlayan problem türlerini (örn. sürekli "empty state" unutuluyor)
  ekip ile paylaşıp süreç iyileştirmesi önerin (prevention).

---

## 17. Interview Notes

- "Requirement review'da en sık karşılaştığınız problem türü nedir?"
  sorusuna somut bir örnekle (örn. missing error behaviour) cevap
  verin.
- "Hidden dependency'yi nasıl tespit edersiniz?" sorusuna, yalnızca
  requirement metnine değil, ilgili sistemin genel mimarisine de
  bakmanız gerektiğini açıklayarak cevap verin.

---

## İlgili Konular

- [Requirement Review Checklist](10-REQUIREMENT-REVIEW-CHECKLIST.md)
- [Requirement Clarification](03-REQUIREMENT-CLARIFICATION.md)
- [Requirement Testability](04-REQUIREMENT-TESTABILITY.md)
