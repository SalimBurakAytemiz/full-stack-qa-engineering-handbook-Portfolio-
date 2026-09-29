# Dependency Analysis

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Hiçbir sistem izole çalışmaz. Bir feature'ın test edilebilir olması,
genellikle bağımlı olduğu diğer bileşenlerin de çalışır durumda
olmasına bağlıdır. Dependency Analysis, bu bağımlılıkları haritalamayı
öğretir.

---

## 2. Bağımlılık Türleri

### Internal Dependency

Aynı sistem/organizasyon içindeki başka bir modül veya servise
bağımlılık.

**Örnek:** Order servisi, aynı şirketin geliştirdiği Inventory
servisine bağımlıdır.

### External Dependency

Organizasyon dışındaki, genellikle iş ortağı veya farklı bir ekip
tarafından yönetilen bir sisteme bağımlılık.

**Örnek:** Bir lojistik firmasının kargo takip API'si.

### Third-Party Dependency

Dışarıdan satın alınan veya entegre edilen, genellikle organizasyonun
kontrolü dışında olan bir servis.

**Örnek:** Ödeme sağlayıcısı (payment provider), SMS gönderim servisi.

### Environment Dependency

Belirli bir ortamın (environment) doğru konfigüre edilmiş ve ayakta
olmasına bağımlılık.

**Örnek:** Test ortamındaki bir feature flag'in doğru şekilde açık
olması.

### Data Dependency

Belirli bir test data setinin veya önceden var olan bir kaydın
mevcudiyetine bağımlılık.

**Örnek:** Bir "indirim" senaryosunu test edebilmek için, sistemde
geçerli bir kupon kodunun tanımlı olması gerekir.

---

## 3. Örnek: Payment Flow Bağımlılık Zinciri

```text
Frontend
   ↓
API
   ↓
Payment Service
   ↓
Provider (Third-Party)
   ↓
Database
   ↓
OMS (Order Management System)
   ↓
Notification
```

Bu zincirde:

- Frontend → API: **Internal Dependency**
- API → Payment Service: **Internal Dependency**
- Payment Service → Provider: **Third-Party Dependency**
- Payment Service → Database: **Internal Dependency**
- Database → OMS: **Internal Dependency** (farklı bir sistem/servis
  olabilir)
- OMS → Notification: **Internal Dependency**

---

## 4. Bağımlılık Unavailable Olduğunda Test Stratejisi Nasıl Değişir?

Bir bağımlılık (örn. Provider) test ortamında erişilemez durumdaysa,
QA'nın önünde birkaç temel seçenek vardır:

1. **Mock/Stub Kullanmak:** Provider'ı simüle eden bir mock ile test
   etmeye devam etmek. Bu, akışın geri kalanını (Frontend → API →
   Payment Service → Database → OMS → Notification) test etmeye
   olanak tanır, ama gerçek Provider davranışını doğrulamaz.
2. **Test'i Ertelemek:** Bağımlılık gerçekten kritikse ve mock yeterli
   güven sağlamıyorsa, ilgili test senaryosunu bağımlılık ayağa
   kalkana kadar ertelemek ve bunu açıkça (`ENVIRONMENT REQUIRED`
   gibi) dokümante etmek.
3. **Kapsamı Daraltmak:** Yalnızca bağımlılığın etkilemediği
   senaryoları (örn. geçersiz kart formatı — Provider'a hiç
   gitmeyen bir validation) test etmek.

**Önemli:** Hangi seçenek kullanılırsa kullanılsın, bu durum test
raporunda **açıkça belirtilmelidir**. Mock ile alınan sonucu, gerçek
Provider ile alınan sonuç gibi sunmak, yanlış bir güvenlik hissi
yaratır (bkz. `CONTRIBUTING.md` — Evidence Integrity).

---

## 5. Common Mistakes

- Bağımlılıkları yalnızca "kod seviyesinde çağrılan servisler" ile
  sınırlı sanmak; environment ve data dependency'leri göz ardı etmek.
- Bir bağımlılık unavailable olduğunda, test edilemeyen senaryoyu
  sessizce atlayıp raporlamamak.
- Mock ile alınan test sonucunu, gerçek entegrasyon testi sonucuymuş
  gibi sunmak.

---

## 6. Best Practices

- Test planlaması öncesi, ilgili feature'ın bağımlılık zincirini
  (diyagram olarak) çıkarın.
- Her bağımlılık için "bu unavailable olursa ne yaparım?" sorusunun
  cevabını önceden belirleyin.
- Third-Party bağımlılıkları özellikle erken tespit edin — bunlar
  genelde en az kontrol edilebilir olanlardır.

---

## 7. Interview Notes

- "Internal ve Third-Party Dependency arasındaki fark nedir?"
  sorusuna kontrol edilebilirlik farkını vurgulayarak cevap verin.
- "Bir bağımlılık test ortamında çalışmıyorsa ne yaparsınız?"
  sorusuna mock/erteleme/kapsam daraltma seçeneklerini ve bunların
  raporlanması gerektiğini açıklayarak cevap verin.

---

## İlgili Konular

- [Impact Analysis](07-IMPACT-ANALYSIS.md)
- [Change Impact Analysis](09-CHANGE-IMPACT-ANALYSIS.md)
- [02-RISK-BASED-TESTING — Risk Fundamentals](../02-RISK-BASED-TESTING/01-RISK-FUNDAMENTALS.md)
