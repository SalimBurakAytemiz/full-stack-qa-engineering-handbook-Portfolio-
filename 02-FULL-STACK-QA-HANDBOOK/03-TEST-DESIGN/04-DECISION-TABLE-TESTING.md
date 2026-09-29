# Decision Table Testing

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Birden fazla koşulun **birlikte** sonucu belirlediği durumlarda,
koşulları tek tek test etmek yanıltıcıdır — asıl risk,
**kombinasyonlarda** gizlidir. Decision Table, bu kombinasyonları
sistematik şekilde kapsar.

---

## 2. Örnek: Withdraw Allowed? (Para Çekme İzni)

**Kural:** Bir kullanıcının para çekebilmesi için üç koşulun
**birlikte** sağlanması gerekir:

- Account Active? (Hesap Aktif mi?)
- KYC Completed? (Kimlik Doğrulama Tamamlandı mı?)
- Balance Sufficient? (Bakiye Yeterli mi?)

---

## 3. Tüm Anlamlı Kombinasyonlar

| # | Account Active? | KYC Completed? | Balance Sufficient? | Withdraw Allowed? |
|---|---|---|---|---|
| 1 | Yes | Yes | Yes | **Yes** |
| 2 | Yes | Yes | No | No (Yetersiz bakiye) |
| 3 | Yes | No | Yes | No (KYC eksik) |
| 4 | Yes | No | No | No (KYC eksik) |
| 5 | No | Yes | Yes | No (Hesap aktif değil) |
| 6 | No | Yes | No | No (Hesap aktif değil) |
| 7 | No | No | Yes | No (Hesap aktif değil) |
| 8 | No | No | No | No (Hesap aktif değil) |

3 koşul × 2 olası değer (Yes/No) = **8 kombinasyon**. Bu tablo,
hiçbir kombinasyonun atlanmamasını garanti eder.

---

## 4. Neden Bu Tablo Değerlidir?

Eğer yalnızca "3 koşulu ayrı ayrı" test etseydik (örn. "Account
Active = No iken sistem reddediyor mu", "KYC = No iken sistem
reddediyor mu" gibi 3 ayrı test), şu riski kaçırırdık:

> Sistem, **birden fazla koşul aynı anda başarısız olduğunda** yanlış
> bir öncelik sırasıyla hata mesajı gösterebilir (örn. hesap aktif
> değilken "bakiye yetersiz" mesajı göstermek gibi kullanıcıyı
> yanıltan bir davranış).

Kombinasyon #6 ve #8 gibi satırlar, tam olarak bu tür **çoklu
başarısızlık** senaryolarını test etmemizi sağlar — sistem hangi
hatayı önce göstermeli (Account Active kontrolü genelde en önce
gelir)?

---

## 5. Business Rule Testing ile İlişkisi

Decision Table Testing, `01-REQUIREMENT-ANALYSIS/05-BUSINESS-RULE-ANALYSIS.md`'de
anlatılan Business Rule Validation'ın **somut bir test tasarım
aracıdır**. Bir Business Rule genellikle birden fazla koşulun
birleşimiyle ifade edilir ("KYC tamamlanmamış kullanıcı işlem
yapamaz" gibi); Decision Table, bu kuralın **tüm olası** koşul
kombinasyonlarında doğru uygulandığını sistematik olarak doğrular.

---

## 6. İkinci Örnek: Kupon Uygulama Kuralı

**Kural:** Kupon indirimi uygulanabilmesi için:

- Kupon Geçerli mi?
- Sepet Minimum Tutarı Karşılıyor mu?

| # | Kupon Geçerli? | Min. Tutar Karşılanıyor? | Sonuç |
|---|---|---|---|
| 1 | Yes | Yes | İndirim uygulanır |
| 2 | Yes | No | "Minimum tutar karşılanmadı" hatası |
| 3 | No | Yes | "Geçersiz kupon" hatası |
| 4 | No | No | "Geçersiz kupon" hatası (öncelik: kupon geçerliliği önce kontrol edilir) |

Bu tablo, kombinasyon #4'te **hangi hata mesajının önce
gösterileceğini** de netleştirir — bu, requirement'ta genellikle
atlanan bir detaydır (bkz.
`01-REQUIREMENT-ANALYSIS/11-COMMON-REQUIREMENT-PROBLEMS.md`).

---

## 7. Common Mistakes

- Koşulları yalnızca tek tek test edip kombinasyonlarını hiç
  denememek.
- Çok fazla koşul (5-6+) olduğunda tüm kombinasyonları (2^n) manuel
  oluşturmaya çalışıp tabloyu yönetilemez hale getirmek — bu
  durumda Pairwise Testing (bkz. `08-PAIRWISE-COMBINATORIAL-TESTING.md`)
  değerlendirilmelidir.
- Birden fazla koşul aynı anda başarısız olduğunda hangi hatanın
  önce gösterileceğini hiç netleştirmemek.

---

## 8. Best Practices

- Business Rule'un birden fazla koşula bağlı olduğu her durumda
  Decision Table oluşturun.
- Koşul sayısı arttıkça (4+), tabloyu büyütmeden önce Pairwise
  yaklaşımını değerlendirin.
- "Çoklu başarısızlık" senaryolarını (birden fazla koşul aynı anda
  False) özellikle test edin.

---

## 9. Interview Notes

- "Decision Table Testing ne zaman kullanılır?" sorusuna, birden
  fazla koşulun birlikte sonucu belirlediği durumlarla cevap verin.
- "Decision Table, Business Rule testing ile nasıl ilişkilidir?"
  sorusuna, business kurallarının genelde çoklu koşul içerdiğini ve
  tablonun bu kombinasyonları sistematik kapsadığını açıklayarak
  cevap verin.

---

## İlgili Konular

- [01-REQUIREMENT-ANALYSIS — Business Rule Analysis](../01-REQUIREMENT-ANALYSIS/05-BUSINESS-RULE-ANALYSIS.md)
- [State Transition Testing](05-STATE-TRANSITION-TESTING.md)
- [Pairwise / Combinatorial Testing](08-PAIRWISE-COMBINATORIAL-TESTING.md)
