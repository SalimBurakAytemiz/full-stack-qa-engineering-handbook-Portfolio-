# Pairwise / Combinatorial Testing

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Birden fazla değişken (Browser, OS, User Type, Payment Method vb.)
birlikte test edilmesi gerektiğinde, **tüm kombinasyonları** test
etmek pratikte imkansız hale gelebilir. Pairwise Testing, bu maliyeti
azaltırken makul bir kapsam sağlar.

---

## 2. Örnek Değişkenler

| Değişken | Değerler |
|---|---|
| Browser | Chrome, Firefox, Safari |
| OS | Windows, macOS |
| User | Guest, Registered, Premium |
| Payment | Card, Wallet, Transfer |

---

## 3. Tüm Kombinasyonlar Ne Kadar Pahalı?

Bu dört değişkenin **tüm** kombinasyonlarını test etmek için:

```text
3 (Browser) × 2 (OS) × 3 (User) × 3 (Payment) = 54 kombinasyon
```

54 farklı test senaryosu çalıştırmak, hem zaman hem de bakım maliyeti
açısından çoğu proje için gerçekçi değildir — özellikle her yeni
değişken eklendiğinde bu sayı **katlanarak** artar (örneğin 5.
değişken eklenirse 54 × N olur).

---

## 4. Pairwise Testing Nedir?

Pairwise Testing, **her iki değişkenin her olası ikili
kombinasyonunun** en az bir test senaryosunda yer almasını garanti
eden, ama tüm n-li kombinasyonları test etmeyen bir tekniktir.

Araştırmalar ve pratik deneyimler, çoğu yazılım hatasının **iki
değişkenin etkileşiminden** kaynaklandığını gösterir (örn. "Safari +
Wallet" kombinasyonunda bir sorun olması gibi) — üç veya daha fazla
değişkenin **aynı anda** etkileşmesinden kaynaklanan hatalar çok daha
nadirdir.

---

## 5. Basitleştirilmiş Pairwise Örneği

54 kombinasyon yerine, Pairwise yaklaşımı her ikili kombinasyonu
(Browser-OS, Browser-User, Browser-Payment, OS-User, OS-Payment,
User-Payment) en az bir kez kapsayacak şekilde çok daha az sayıda
(örneğin 9-12) senaryo üretir:

| # | Browser | OS | User | Payment |
|---|---|---|---|---|
| 1 | Chrome | Windows | Guest | Card |
| 2 | Chrome | macOS | Registered | Wallet |
| 3 | Firefox | Windows | Premium | Transfer |
| 4 | Firefox | macOS | Guest | Wallet |
| 5 | Safari | Windows | Registered | Transfer |
| 6 | Safari | macOS | Premium | Card |
| 7 | Chrome | macOS | Premium | Transfer |
| 8 | Firefox | Windows | Guest | Card |
| 9 | Safari | macOS | Guest | Card |

**Not:** Bu tablo, Pairwise mantığını göstermek amacıyla elle
oluşturulmuş basitleştirilmiş bir örnektir; gerçek bir projede bu tür
tablolar genellikle özel bir pairwise generation aracıyla üretilir.

---

## 6. Araç Kullanmak Zorunlu mu?

**Hayır.** Az sayıda değişken (2-4 değişken, her biri 2-4 değerli)
için Pairwise mantığı **elle** de uygulanabilir — önemli olan her
ikili kombinasyonun en az bir satırda yer aldığından emin olmaktır.

Değişken sayısı arttıkça (5+) veya her değişkenin değer sayısı
arttıkça, elle pairwise tablo oluşturmak zorlaşır ve bu noktada
özel araçlar (bu repository'nin kapsamı dışındadır) tercih edilebilir.
Ancak **kavramı anlamak ve elle uygulayabilmek**, araç kullanmadan
önce gelen temel yetenektir.

---

## 7. Pairwise'ın Amacı Nedir?

Pairwise Testing'in amacı, **sıfır risk** almak değil, **makul bir
maliyetle yüksek bir kapsam** elde etmektir. Yüksek riskli
kombinasyonlar (örn. bilinen bir tarayıcı uyumluluk sorunu) için,
Pairwise'a ek olarak **hedefli** (Risk-Based) senaryolar da
eklenmelidir — Pairwise, Risk-Based Testing'in (bkz.
`02-RISK-BASED-TESTING/`) yerini almaz, onu tamamlar.

---

## 8. Common Mistakes

- Tüm kombinasyonları test etmeye çalışıp zamanın büyük kısmını
  düşük değerli tekrar senaryolarına harcamak.
- Pairwise'ı, bilinen yüksek riskli bir kombinasyonu (örn. geçmişte
  sorun çıkmış "Safari + Wallet") kapsamadığı bir durumda dahi tek
  başına yeterli sanmak.
- Pairwise için mutlaka bir araç gerektiğini düşünüp, küçük ölçekli
  senaryolarda elle uygulamayı hiç denememek.

---

## 9. Best Practices

- Değişken sayısı ve değer sayısı arttıkça Pairwise'ı değerlendirin;
  az sayıda değişkende tüm kombinasyonları test etmek hâlâ makul
  olabilir.
- Bilinen yüksek riskli kombinasyonları Pairwise tablosuna ek olarak
  ayrıca test edin.
- Pairwise sonucunu, neden o kombinasyonların seçildiğini
  açıklayacak şekilde dokümante edin.

---

## 10. Interview Notes

- "Pairwise Testing nedir, neden kullanılır?" sorusuna, tüm
  kombinasyonların maliyetini örnekle (54 kombinasyon) göstererek
  cevap verin.
- "Pairwise Testing riski sıfıra indirir mi?" sorusuna hayır diyerek,
  üç veya daha fazla değişkenin aynı anda etkileşiminden kaynaklanan
  nadir hataların kaçırılabileceğini belirtin.

---

## İlgili Konular

- [Decision Table Testing](04-DECISION-TABLE-TESTING.md)
- [02-RISK-BASED-TESTING — Test Prioritization](../02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md)
- [Test Data Design](09-TEST-DATA-DESIGN.md)
