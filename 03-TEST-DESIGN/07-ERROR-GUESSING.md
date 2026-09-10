# Error Guessing

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Sistematik teknikler (EP, BVA, Decision Table) requirement'tan
türetilir. Ama bazı hatalar, requirement'ta hiç yazmayan, yalnızca
**deneyimle** tahmin edilebilen davranışlardan kaynaklanır. Error
Guessing, bu boşluğu doldurur.

---

## 2. Error Guessing Nedir?

**Experience-Based Testing Technique:** Test edenin geçmiş deneyimi
ve sezgisine dayanarak, sistemin muhtemelen hata vereceği noktaları
tahmin edip hedefli şekilde test etme tekniğidir.

---

## 3. Yaygın Error Guessing Senaryoları

### Double Click (Çift Tıklama)

Kullanıcı bir "Satın Al" veya "Gönder" butonuna hızlıca iki kez
tıklarsa, sistem **iki kez işlem** oluşturuyor mu?

### Refresh During Payment (Ödeme Sırasında Sayfa Yenileme)

Kullanıcı ödeme işlemi devam ederken sayfayı yenilerse, işlem yarıda
mı kalıyor, çift mi tahsil ediliyor, yoksa doğru şekilde mi ele
alınıyor?

### Empty Value (Boş Değer)

Zorunlu olmayan bir alana hiçbir şey girilmezse (null, boş string,
yalnızca boşluk karakteri) sistem nasıl davranıyor?

### Duplicate Submission (Tekrarlı Gönderim)

Aynı form/istek, ağ gecikmesi nedeniyle kullanıcı tarafından bilerek
veya bilmeyerek iki kez gönderilirse ne olur?

### Expired Session (Süresi Dolmuş Oturum)

Kullanıcı bir formu doldururken oturumu sona ererse, submit ettiğinde
ne olur — veri kaybolur mu, kullanıcıya anlamlı bir mesaj gösterilir
mi?

### Slow Network (Yavaş Ağ Bağlantısı)

Yavaş bir bağlantıda, istek zaman aşımına uğrarsa sistem kullanıcıyı
belirsiz bir durumda mı bırakıyor?

### Back Button (Geri Butonu)

Kullanıcı ödeme onaylandıktan sonra tarayıcının "geri" butonuna basıp
tekrar "Öde" butonuna basarsa, işlem tekrarlanıyor mu?

---

## 4. Error Guessing Rastgele Test Etmek midir?

**Hayır.** Bu, en sık yapılan yanlış anlamalardan biridir.

Error Guessing:

- **Deneyime dayalıdır** — "geçmişte bu tür sistemlerde sık
  karşılaştığım hata türleri" bilgisine dayanır, tamamen tesadüfi
  değildir.
- **Hedeflidir** — belirli bir hipotez test edilir ("çift tıklama
  duplicate order yaratır mı?"), amaçsız gezinme değildir.
- **Tekrarlanabilir listelere dönüştürülebilir** — deneyimli bir QA,
  bu senaryoları bir kontrol listesi haline getirip her feature'da
  sistematik olarak uygulayabilir (yukarıdaki liste buna bir
  örnektir).

Rastgele test etmek (amaçsız tıklama, planlanmamış gezinme), Error
Guessing değil, kontrolsüz bir aktivitedir ve bu repository'nin
metodolojisinin parçası değildir.

---

## 5. Error Guessing Nasıl Sistematik Hale Getirilir?

1. Geçmiş projelerden/sistemlerden öğrenilen yaygın hata
   kategorilerini bir liste haline getirin (yukarıdaki 7 örnek gibi).
2. Her yeni feature için bu listeyi bir kontrol listesi gibi
   uygulayın — "bu feature'da double-submit riski var mı?"
3. Bulunan her yeni hata türünü listeye ekleyin — Error Guessing
   listesi zamanla organizasyonun **kurumsal deneyimini** biriktirir.

---

## 6. Common Mistakes

- Error Guessing'i "plansız, amaçsız test" ile karıştırmak.
- Error Guessing'i yalnızca deneyimli kişilerin yapabileceği,
  öğretilemez bir yetenek sanmak (oysa yukarıdaki gibi listeler
  oluşturularak öğretilebilir).
- Error Guessing sonuçlarını hiç dokümante etmeyip, her seferinde
  sıfırdan "aklına ne gelirse" test etmek.

---

## 7. Best Practices

- Yaygın Error Guessing senaryolarını (double-click, refresh, empty
  value vb.) her yeni feature testinde standart bir kontrol listesi
  olarak uygulayın.
- Bulunan yeni hata türlerini takım bilgisine (bu tür bir kontrol
  listesine) ekleyin.
- Error Guessing'i, sistematik tekniklerin (EP, BVA, Decision Table)
  **yerine değil**, onları tamamlayan bir ek katman olarak kullanın.

---

## 8. Interview Notes

- "Error Guessing nedir, rastgele test etmekten farkı nedir?"
  sorusuna, deneyime dayalı, hedefli ve tekrarlanabilir olduğunu
  vurgulayarak cevap verin.
- "Error Guessing'e örnek verir misiniz?" sorusuna en az 2-3 somut
  senaryo (double-click, refresh during payment) ile cevap verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Test Design Techniques Overview](../00-QA-FOUNDATIONS/14-TEST-DESIGN-TECHNIQUES-OVERVIEW.md)
- [Positive/Negative/Edge/Boundary](10-POSITIVE-NEGATIVE-EDGE-BOUNDARY.md)
- [Test Data Design](09-TEST-DATA-DESIGN.md)
