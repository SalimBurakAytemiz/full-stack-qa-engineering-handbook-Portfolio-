# Risk Register Example

**Status: EXPERIENCE**

> **EDUCATIONAL CONTROLLED EXAMPLE** — Bu dosyadaki Risk Register,
> tamamen eğitim amaçlı kurgulanmış bir örnektir. Gerçek bir şirket
> verisi, gerçek bir release veya gerçek bir sistemin risk kaydı
> **değildir**. Kolonların nasıl doldurulacağını göstermek amacıyla
> hazırlanmıştır.

---

## 1. Risk Register Nedir?

**Risk Register**, bir proje veya release için belirlenen tüm
risklerin, değerlendirmeleriyle birlikte tek bir yerde kayıt altına
alındığı dokümandır. Test planlaması ve release kararı için referans
kaynağıdır.

---

## 2. Örnek Risk Register

| Risk ID | Area | Risk Description | Probability | Impact | Priority | Test Approach | Mitigation / Validation | Status |
|---|---|---|---|---|---|---|---|---|
| RISK-001 | Payment | Yeni ödeme yöntemi entegrasyonunda işlem yanlış tutarla tamamlanabilir | Medium | Critical | High | Positive/Negative/Boundary test, farklı tutar kombinasyonları | Test ortamında provider sandbox ile uçtan uca doğrulama | Open |
| RISK-002 | Authentication | Başarısız login denemelerinde account lock mekanizması hiç çalışmayabilir | Low | High | Medium | Ardışık başarısız deneme senaryosu, lock süresi doğrulama | Business ile lock kuralları netleştirildi, test case yazıldı | Open |
| RISK-003 | Order Management | Eşzamanlı iki sipariş, son 1 adet stoğu aynı anda tüketebilir (race condition) | Low | High | Medium | Eşzamanlı istek simülasyonu (temel seviyede) | Backend'de lock mekanizması var mı doğrulanacak | Open |
| RISK-004 | Notification | Yeni bildirim tipi, yanlış kullanıcıya gönderilebilir | Medium | Medium | Medium | Farklı kullanıcı/rol kombinasyonlarıyla bildirim tetikleme testi | Hedef kullanıcı filtresi doğrulanacak | Open |
| RISK-005 | UI | Yeni tasarım güncellemesi, küçük ekranlarda taşma yaratabilir | High | Low | Medium | Farklı ekran boyutlarında görsel kontrol | Exploratory test ile taranacak | Open |
| RISK-006 | Profile | Email güncelleme akışında doğrulama adımı atlanabilir | Low | Medium | Low | Email değişikliği sonrası doğrulama linki senaryosu | Mevcut regression suite'te kapsanıyor | Closed |
| RISK-007 | Discount | Aynı kupon kodu birden fazla kez uygulanabilir | Medium | High | High | Aynı kupon ile ardışık uygulama denemesi | Business Rule Validation ile API seviyesinde test edilecek | Open |

---

## 3. Kolon Açıklamaları

- **Risk ID:** Benzersiz tanımlayıcı (bu Phase'de yalnızca eğitim
  amaçlı bir format kullanılmıştır; governance seviyesinde bir ID
  standardı belirlenmemiştir).
- **Area:** Riskin ait olduğu sistem alanı.
- **Risk Description:** Riskin somut, anlaşılır tanımı.
- **Probability / Impact:** Bkz. `02-PROBABILITY-AND-IMPACT.md`.
- **Priority:** Risk Matrix'ten (bkz. `03-RISK-MATRIX.md`) türetilen
  öncelik.
- **Test Approach:** Bu riski doğrulamak için planlanan test
  yaklaşımı.
- **Mitigation / Validation:** Riskin nasıl azaltıldığı veya
  doğrulanacağı.
- **Status:** Riskin güncel durumu (Open / Closed / Accepted vb.).

---

## 4. Risk Register Nasıl Kullanılır?

1. Her yeni feature/sprint için ilgili riskler belirlenir ve tabloya
   eklenir.
2. Her risk için Test Approach netleştirilir ve test planına
   bağlanır.
3. Risk test edilip doğrulandığında (ya da kabul edilebilir bulunduğunda)
   Status güncellenir.
4. Release öncesi, hâlâ "Open" durumda kalan yüksek öncelikli
   riskler, Release Risk değerlendirmesine (bkz.
   `07-RELEASE-RISK.md`) girdi olur.

---

## 5. Common Mistakes

- Risk Register'ı bir kez oluşturup hiç güncellememek.
- Risk'leri yalnızca listelemek, Test Approach ve Mitigation
  kolonlarını boş bırakmak.
- Kapatılan (Closed) risklerin neden kapatıldığını (hangi test/kanıt
  ile) dokümante etmemek.

---

## 6. Best Practices

- Risk Register'ı her sprint/release planlamasının standart bir
  parçası haline getirin.
- "Open" durumdaki yüksek öncelikli riskleri release toplantılarında
  açıkça gündeme getirin.
- Risk Register'ı Traceability ile (hangi risk hangi test case'e
  bağlı) ilişkilendirin.

---

## 7. Interview Notes

- "Risk Register nedir, neden kullanılır?" sorusuna, risklerin tek bir
  yerde izlenebilir ve test planına bağlanabilir olmasını sağladığını
  belirterek cevap verin.
- "Bir risk 'Closed' olarak işaretlenmeden önce ne olmalıdır?"
  sorusuna, ilgili Test Approach'ın uygulanmış ve sonucun doğrulanmış
  olması gerektiğini belirterek cevap verin.

---

## İlgili Konular

- [Risk Matrix](03-RISK-MATRIX.md)
- [Test Prioritization](04-TEST-PRIORITIZATION.md)
- [Release Risk](07-RELEASE-RISK.md)
