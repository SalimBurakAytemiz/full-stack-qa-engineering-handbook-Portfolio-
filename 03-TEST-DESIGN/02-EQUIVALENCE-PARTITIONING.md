# Equivalence Partitioning (EP)

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

`00-QA-FOUNDATIONS/14-TEST-DESIGN-TECHNIQUES-OVERVIEW.md`, EP'yi genel
hatlarıyla tanıtmıştı. Bu dosya, gerçekçi girdi alanları üzerinden
tekniği derinlemesine uygular.

---

## 2. Equivalence Partitioning Nedir?

Girdi değerlerini, sistemin **aynı şekilde davranması beklenen**
gruplara (partition) ayırıp, her gruptan yalnızca bir temsilci değeri
test etme tekniğidir.

---

## 3. Örnek 1: Age (Yaş)

**Kural:** Sistem, 18-65 yaş arası kullanıcıları kabul eder.

| Partition | Aralık | Temsilci Değer | Beklenen |
|---|---|---|---|
| Invalid (Düşük) | < 18 | 10 | Reddedilir |
| Valid | 18-65 | 30 | Kabul edilir |
| Invalid (Yüksek) | > 65 | 80 | Reddedilir |

**Neden 3 değer yeterli:** 19, 25, 40, 60 gibi değerlerin hepsi aynı
"Valid" partition'ında olduğu için, aynı şekilde davranacakları
varsayılır — bu yüzden yalnızca birini (30) test etmek yeterlidir.

---

## 4. Örnek 2: Order Amount (Sipariş Tutarı)

**Kural:** Minimum sipariş tutarı 50 TL, kredi kartı ile ödeme için
maksimum tek seferlik tutar 10.000 TL.

| Partition | Aralık | Temsilci Değer | Beklenen |
|---|---|---|---|
| Invalid (Düşük) | < 50 TL | 20 TL | Reddedilir ("minimum tutar karşılanmadı") |
| Valid | 50 TL - 10.000 TL | 500 TL | Kabul edilir |
| Invalid (Yüksek) | > 10.000 TL | 15.000 TL | Reddedilir ("maksimum limit aşıldı") |

---

## 5. Örnek 3: User Status (Kullanıcı Durumu)

Sayısal olmayan (kategorik) alanlarda da EP uygulanabilir.

**Kural:** Yalnızca `ACTIVE` durumundaki kullanıcılar login olabilir.

| Partition | Değer | Beklenen |
|---|---|---|
| Valid | ACTIVE | Login başarılı |
| Invalid | DISABLED | Login reddedilir |
| Invalid | DELETED | Login reddedilir |
| Invalid | LOCKED | Login reddedilir ("hesap kilitli") |

**Önemli not:** Kategorik alanlarda, "Invalid" partition'ları kendi
içinde de **farklı davranışlar** gösterebilir (DISABLED ve LOCKED
farklı hata mesajları üretebilir). Bu durumda her biri **ayrı bir
partition** olarak ele alınmalıdır — hepsini "invalid" diye tek bir
grupta toplamak yanlış olur.

---

## 6. Örnek 4: Payment Method (Ödeme Yöntemi)

**Kural:** Sistem `CREDIT_CARD`, `WALLET`, `BANK_TRANSFER` ödeme
yöntemlerini destekler; her biri farklı bir doğrulama akışına
sahiptir.

| Partition | Değer | Beklenen Davranış |
|---|---|---|
| Valid | CREDIT_CARD | Kart bilgisi formu gösterilir, CVV istenir |
| Valid | WALLET | Bakiye kontrolü yapılır |
| Valid | BANK_TRANSFER | Banka bilgileri ve referans kodu üretilir |
| Invalid | (desteklenmeyen bir değer, örn. CRYPTO) | Reddedilir |

Burada üç "Valid" partition'ı **birbirinden farklı davranış**
ürettiği için ayrı ayrı test edilmelidir — EP'nin "her partition'dan
bir temsilci yeterli" kuralı, yalnızca **aynı davranışı** üreten
değerler için geçerlidir.

---

## 7. EP Test Sayısını Nasıl Azaltır, Coverage'ı Nasıl Korur?

Eğer Age alanı için 18-65 arasındaki **her** değeri (48 farklı değer)
tek tek test etseydik, bu hem zaman kaybı hem de gereksiz olurdu —
çünkü 19 ile 40'ın farklı davranması için hiçbir mantıksal sebep
yoktur.

EP, "aynı partition'daki değerler aynı şekilde davranır" varsayımına
dayanarak, **48 test yerine 3 test** ile aynı güven seviyesini
sağlar. Bu, coverage'ı **azaltmaz** — partition'lar doğru
belirlendiği sürece, her partition'ın davranışı bir temsilci ile
doğrulanmış olur.

**Kritik nokta:** EP'nin güvenilirliği, partition'ların **doğru
belirlenmesine** bağlıdır. Partition sınırları yanlış çizilirse
(örn. 65 dahil mi değil mi belirsizse), EP de yanıltıcı olur — bu
yüzden EP her zaman Boundary Value Analysis (bkz.
`03-BOUNDARY-VALUE-ANALYSIS.md`) ile birlikte kullanılır.

---

## 8. Common Mistakes

- Farklı davranış üreten değerleri (örn. DISABLED vs LOCKED) aynı
  "invalid" partition'a koymak.
- Yalnızca sayısal alanlarda EP uygulanabileceğini düşünmek —
  kategorik alanlarda da geçerlidir.
- EP'yi tek başına yeterli sanıp sınır değerleri (BVA) hiç test
  etmemek.

---

## 9. Best Practices

- Her partition'ı belirlerken "bu grup gerçekten aynı mı davranıyor?"
  sorusunu sorun.
- Kategorik alanlarda, her farklı davranış üreten değeri ayrı bir
  partition olarak ele alın.
- EP'yi her zaman BVA ile birlikte kullanın.

---

## 10. Interview Notes

- "Equivalence Partitioning nedir, nasıl test sayısını azaltır?"
  sorusuna Age örneğiyle (48 değer yerine 3) cevap verin.
- "Kategorik bir alanda EP nasıl uygulanır?" sorusuna Payment Method
  örneğiyle, farklı davranışların ayrı partition olması gerektiğini
  vurgulayarak cevap verin.

---

## İlgili Konular

- [Boundary Value Analysis](03-BOUNDARY-VALUE-ANALYSIS.md)
- [Test Condition / Scenario / Case](01-TEST-CONDITION-SCENARIO-CASE.md)
- [Positive/Negative/Edge/Boundary](10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md)
