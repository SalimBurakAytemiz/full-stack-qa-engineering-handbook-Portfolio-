# Test Levels

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir defect'i hangi seviyede yakalamanız gerektiğini bilmemek, ya gereksiz
tekrar teste ya da geç bulunan pahalı hatalara yol açar. Bu dosya, beş
temel test seviyesini ve her birinde QA'nın gerçek sorumluluğunu tanımlar.

---

## 2. Test Levels Karşılaştırması

| Seviye | Scope | Primary Responsibility | Test Objective | Örnek | QA Involvement |
|---|---|---|---|---|---|
| Unit Testing | Tek bir fonksiyon/method/class | Developer | Kod biriminin izole doğruluğu | `calculateDiscount()` fonksiyonunun %10 indirimi doğru hesaplaması | Coverage/strategy'yi anlama, kritik senaryoların atlanmadığını gözden geçirme |
| Component Testing | Bir modül/servis, dış bağımlılıklar mock'lanmış | Developer (bazen QA destekli) | Modülün kendi içinde doğru çalışması | Payment servisinin, mock bir bankayla doğru response üretmesi | Test edilebilirlik için geri bildirim, kritik component senaryolarını önerme |
| Integration Testing | İki veya daha fazla modül/servis arası etkileşim | QA + Developer | Modüller arası veri akışının doğruluğu | Order servisinin, Inventory servisinden doğru stok bilgisini alması | Ana sorumlu genelde QA; senaryo tasarımı ve execution |
| System Testing | Uçtan uca tüm sistem | QA | Sistemin bütün olarak requirement'ları karşılaması | Kullanıcının ürün arayıp sepete ekleyip ödeme yapabilmesi | Ana sorumlu QA |
| Acceptance Testing (UAT) | Business/kullanıcı perspektifinden sistem | QA + Business/Product | Sistemin gerçek business ihtiyacını karşılaması | Product Owner'ın yeni checkout akışını onaylaması | QA destek/koordinasyon sağlar, karar business'a aittir |

---

## 3. Unit Testing

**Scope:** Tek bir fonksiyon, method veya class — dış bağımlılıklardan
izole.

**Primary Responsibility:** Developer.

**Test Objective:** Kod biriminin, belirlenen girdi/çıktı davranışını
doğru şekilde göstermesi.

**Örnek:** Bir `calculateDiscount(price, percentage)` fonksiyonunun,
negatif fiyat girildiğinde hata fırlatması.

**QA Involvement:** QA genellikle unit test'i kendisi yazmaz, ancak:

- Unit test coverage stratejisini anlayabilir.
- Kritik business kurallarının unit seviyesinde atlanmadığını sorgulayabilir.
- Test edilebilirlik (testability) konusunda geri bildirim verebilir.

---

## 4. Component Testing

**Scope:** Bir modül veya servis, dış bağımlılıkları (DB, diğer servisler)
genellikle mock/stub ile izole edilmiş.

**Primary Responsibility:** Developer, bazı organizasyonlarda QA destekli.

**Test Objective:** Modülün kendi sınırları içinde doğru davranması.

**Örnek:** Payment servisinin, mock bir banka API'sinden gelen "insufficient
funds" cevabına doğru şekilde tepki vermesi.

**QA Involvement:** QA, hangi component senaryolarının kritik olduğunu
önerebilir; ancak implementation genelde development'a aittir.

---

## 5. Integration Testing

**Scope:** İki veya daha fazla modül/servisin birlikte çalışması.

**Primary Responsibility:** Genellikle QA, bazı senaryolarda Developer ile
birlikte.

**Test Objective:** Modüller arası veri akışının ve sözleşmenin (contract)
doğru çalışması.

**Örnek:** Order servisi, Inventory servisinden stok bilgisini doğru
şekilde alıp sipariş oluşturabiliyor mu?

**QA Involvement:** Bu seviyede QA genellikle ana sorumludur — senaryo
tasarımı, test data hazırlığı ve execution.

---

## 6. System Testing

**Scope:** Uçtan uca, tüm sistemin bir bütün olarak davranışı.

**Primary Responsibility:** QA.

**Test Objective:** Sistemin, tanımlanan tüm requirement'ları bir bütün
olarak karşılaması.

**Örnek:** Kullanıcının ürün araması, sepete eklemesi, ödeme yapması ve
sipariş onayı alması uçtan uca doğru çalışıyor mu?

**QA Involvement:** Bu seviye QA'nın ana çalışma alanıdır.

---

## 7. Acceptance Testing (UAT)

**Scope:** Sistemin business/kullanıcı perspektifinden kabul edilebilirliği.

**Primary Responsibility:** Business, Product Owner veya gerçek kullanıcı
temsilcileri; QA koordinasyon ve destek sağlar.

**Test Objective:** Sistemin gerçek business ihtiyacını karşıladığının
teyit edilmesi.

**Örnek:** Product Owner'ın, yeni checkout akışını canlıya almadan önce
onaylaması.

**QA Involvement:** QA, UAT senaryolarını hazırlayabilir, business'a
destek olabilir; ancak nihai "kabul" kararı business'a aittir.

---

## 8. QA ile Developer Sorumluluk Sınırı

Yanlış yaklaşım: *"Unit test developer'ın işi olduğu için QA hiçbir şey
bilmez."*

Doğru yaklaşım: QA, unit test'in **implementation ownership**'ini
genellikle taşımaz — ama:

- Unit test coverage raporunu okuyup yorumlayabilir.
- Kritik bir business kuralının hiç unit test'i olmadığını fark edip
  soru sorabilir.
- Unit seviyesinde atlanan bir riskin, üst seviyelerde (integration/system)
  nasıl test edileceğini planlayabilir.

Yani QA, unit testing'i **yazmaz** ama **anlar ve stratejik olarak
değerlendirir**. Sorumluluk sınırı "kim yazar" ile "kim anlar ve
kullanır" arasında farklıdır.

---

## 9. Common Mistakes

- Integration Testing ile System Testing'i aynı şey sanmak.
- Unit test coverage'ı yüksek olduğu için System Testing'i gereksiz
  görmek.
- UAT'yi QA'nın tek başına yürüttüğü bir aşama sanmak.

---

## 10. Best Practices

- Her seviyede "bu seviyede hangi risk yakalanır, hangi risk yakalanmaz"
  sorusunu netleştirin.
- Unit test coverage raporlarını QA review sürecine dahil edin.
- Integration seviyesinde contract (API sözleşmesi) değişikliklerini
  erken takip edin.

---

## 11. Interview Notes

- "Integration Testing ile System Testing arasındaki fark nedir?"
  sorusuna scope farkıyla (birkaç modül vs. tüm sistem) cevap verin.
- "QA, unit testing ile hiç ilgilenmez mi?" sorusuna, implementation
  ownership'in development'ta olduğunu ama QA'nın coverage/strateji
  seviyesinde farkındalık taşıdığını belirtin.

---

## İlgili Konular

- [SDLC & STLC](03-SDLC-AND-STLC.md)
- [Test Types](05-TEST-TYPES.md)
- [QA Role & Scope Boundaries](12-QA-ROLE-AND-SCOPE-BOUNDARIES.md)
