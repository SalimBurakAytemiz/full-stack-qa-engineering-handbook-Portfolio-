# Impact Analysis

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir değişiklik "küçük" görünse bile, sistemin birden fazla katmanını
etkileyebilir. Impact Analysis, "bu değişiklik gerçekte nereleri
etkiliyor?" sorusuna sistematik bir cevap arar.

---

## 2. Impact Analysis Nedir?

**Impact Analysis**, bir feature değişikliğinin veya yeni bir
geliştirmenin, sistemin hangi alanlarını (doğrudan veya dolaylı)
etkileyebileceğini belirleme sürecidir.

---

## 3. Analiz Edilmesi Gereken Alanlar

| Alan | Sorgulanması Gereken |
|---|---|
| **Web** | Bu değişiklik web arayüzünde görünür bir davranış değişikliği yaratıyor mu? |
| **Mobile** | Mobile uygulama (Android/iOS) aynı veriyi/davranışı kullanıyor mu? Parity bozulur mu? |
| **API** | API contract (request/response şeması) değişiyor mu? Var olan tüketiciler (consumer) etkilenir mi? |
| **Backend** | İş mantığı, servis katmanında değişiklik gerektiriyor mu? |
| **Database** | Şema değişikliği, yeni alan, migration gerekiyor mu? |
| **Admin Panel** | Yönetici ekranlarında bu veriyi gösteren/yöneten bir alan var mı? |
| **CMS** | İçerik yönetim sisteminde ilgili bir konfigürasyon/metin var mı? |
| **Notification** | Bu değişiklik, kullanıcıya giden bildirim içeriğini/tetiklenmesini etkiliyor mu? |
| **Event** | Sistem içi event/mesaj (örn. message queue) yapısı değişiyor mu? |
| **Analytics** | Bu değişiklik, izlenen metrikleri veya event tracking'i etkiliyor mu? |
| **Third Party** | Harici bir servis/entegrasyon bu veriye bağımlı mı? |
| **Existing Regression** | Mevcut regression suite'inde bu alanı kapsayan senaryolar güncellenmeli mi? |

---

## 4. Örnek: "Order Status Modeline Yeni Status Eklendi"

**Değişiklik:** Sipariş durumu (`Order Status`) modeline yeni bir
durum eklendi: `PARTIALLY_SHIPPED` (kısmi kargo).

İlk bakışta bu, "yalnızca backend/database değişikliği" gibi
görünebilir. Ancak Impact Analysis uygulandığında:

- **Web:** Sipariş takip sayfasında bu yeni durumun gösterilmesi
  gerekir. Gösterilmezse kullanıcı yanlış/eksik bilgi görür.
- **Mobile:** Mobile uygulama, bu yeni status değerini
  tanımıyorsa nasıl davranacak? Crash mi olur, "Unknown Status" mi
  gösterir?
- **API:** `GET /orders/{id}` response'undaki `status` enum'una yeni
  bir değer eklendi — bu, API'yi tüketen tüm client'ları (web, mobile,
  üçüncü parti entegrasyonlar) etkiler.
- **Backend:** Sipariş durumu geçiş mantığı (state machine) bu yeni
  durumu nereye yerleştirecek şekilde güncellenmeli?
- **Database:** `status` alanı enum/constraint kullanıyorsa, migration
  gerekebilir.
- **Admin Panel:** Müşteri hizmetleri ekibinin kullandığı admin
  panelinde bu durum filtrelenebiliyor/görünüyor mu?
- **Notification:** Kısmi kargo durumunda kullanıcıya bildirim
  gönderilecek mi? Şablon var mı?
- **Analytics:** Sipariş durumu dağılımını izleyen dashboard'lar bu
  yeni değeri doğru kategorize ediyor mu?
- **Existing Regression:** Mevcut "sipariş durumu geçişleri" test
  suite'i, bu yeni durumu ve geçişlerini (hangi durumdan
  `PARTIALLY_SHIPPED`'e geçilebilir, hangi durumdan geçilemez)
  kapsayacak şekilde güncellenmeli.

Bu örnek, tek bir alan değişikliğinin (`status`) en az 8-9 farklı
sistem bileşenini etkileyebileceğini gösterir.

---

## 5. Impact Analysis Nasıl Yapılır?

1. Değişikliğin **teknik tanımını** okuyun (ne değişiyor).
2. Yukarıdaki tabloyu bir kontrol listesi gibi kullanarak her alanı
   tek tek sorgulayın.
3. "Etkilenmiyor" dediğiniz alanlar için de kısa bir gerekçe not edin
   — bu, kararın bilinçli verildiğini gösterir.
4. Etkilenen alanları, ilgili test planına ve regression kapsamına
   ekleyin.

---

## 6. Common Mistakes

- Değişikliği yalnızca "değiştirilen kod dosyasının bulunduğu katman"
  ile sınırlı sanmak.
- Mobile/Web parity'yi göz ardı edip yalnızca bir platformda test
  etmek.
- Analytics ve Notification gibi "görünmeyen" etkileri hiç
  sorgulamamak.

---

## 7. Best Practices

- Impact Analysis'i requirement review'un standart bir adımı haline
  getirin.
- Etkilenen her alan için sorumlu ekibi (Mobile, Backend, Admin vb.)
  erken bilgilendirin.
- Impact Analysis çıktısını test planına doğrudan bağlayın — "etkilenen
  alan = test kapsamına giren alan" olmalıdır.

---

## 8. Interview Notes

- "Bir değişikliğin etki alanını nasıl belirlersiniz?" sorusuna
  sistematik bir kontrol listesi (Web, Mobile, API, DB vb.)
  kullanarak cevap verin.
- "Küçük bir backend değişikliği neden geniş bir Impact Analysis
  gerektirebilir?" sorusuna Order Status örneğiyle cevap verin.

---

## İlgili Konular

- [Dependency Analysis](08-DEPENDENCY-ANALYSIS.md)
- [Change Impact Analysis](09-CHANGE-IMPACT-ANALYSIS.md)
- [00-QA-FOUNDATIONS — Risk-Based Testing Overview](../00-QA-FOUNDATIONS/13-RISK-BASED-TESTING-OVERVIEW.md)
