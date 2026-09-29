# Test Evidence Management

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

"Bug var" demek yeterli değildir. Evidence (kanıt), bir bulgunun
**tekrar üretilebilir ve teknik olarak doğrulanabilir** olmasını
sağlar. Bu dosya, hangi evidence türlerinin ne zaman toplanacağını
ve hassas veri güvenliğini anlatır.

---

## 2. Evidence Türleri

### Screenshot

Arayüzdeki hatalı/beklenmeyen durumun görsel kaydı.

### Screen Recording / Video

Adım adım tekrar üretilen bir sürecin, zaman içindeki davranışının
kaydı (özellikle zamanlamaya bağlı hatalar için değerlidir).

### API Request

Gönderilen isteğin tam içeriği (endpoint, method, headers, body).

### API Response

Sistemin döndürdüğü tam cevap (status code, body, headers).

### Network Log

Tarayıcı/uygulama ile sunucu arasındaki ağ trafiğinin kaydı (istek/
cevap zamanlamaları, başarısız istekler).

### Console Log

Tarayıcı/uygulama konsolunda görünen hata veya uyarı mesajları.

### Backend Log

Sunucu tarafında üretilen log kayıtları (hata stack trace'i,
işlem izleri).

### Database Result

İlgili veritabanı sorgusunun sonucu (beklenen/beklenmeyen veri
durumunu gösterir).

### Build Number

Testin hangi yazılım versiyonunda çalıştırıldığı.

### Environment

Testin hangi ortamda (DEV/QA/Staging) çalıştırıldığı.

### Timestamp

Testin/hatanın ne zaman gözlemlendiği.

### Device

Testin hangi cihazda (model, mobil/masaüstü) çalıştırıldığı.

### Browser

Testin hangi tarayıcıda ve versiyonda çalıştırıldığı.

### OS

Testin hangi işletim sisteminde çalıştırıldığı.

---

## 3. Evidence'in Amacı

**Evidence'in amacı "Bug var" demek değildir.**

**Evidence'in amacı, "Bug tekrar üretilebilir ve teknik olarak
kanıtlanabilir" hale getirmektir.**

Bu ayrım kritik önemdedir:

- "Bug var" — sübjektif bir iddia, başka biri tarafından
  doğrulanamayabilir.
- "İşte adımlar, işte ekran görüntüsü, işte API response'u, aynı
  build'de tekrar üretebilirsin" — objektif, doğrulanabilir bir
  kanıt seti.

Development ekibi bir defect'i fix etmeden önce genellikle onu
**kendi ortamında tekrar üretmek** ister — güçlü evidence, bu süreci
hızlandırır ve "benim tarafımda çalışıyor" (works on my machine)
tartışmalarını azaltır.

---

## 4. Hangi Evidence Ne Zaman Toplanır?

| Defect Türü | Öncelikli Evidence |
|---|---|
| UI görsel sorunu | Screenshot |
| Zamanlamaya bağımlı sorun (race condition, çift tıklama) | Screen Recording |
| API/Business Rule ihlali | API Request + Response |
| Frontend hatası | Console Log |
| Backend hatası/exception | Backend Log |
| Veri tutarsızlığı | Database Result |
| Ortama özgü sorun (bkz. `../06-DEFECT-MANAGEMENT/14-ROOT-CAUSE-ISOLATION.md`) | Build Number + Environment + Device/Browser/OS |

---

## 5. Hassas Veri Güvenliği

Evidence toplarken şu kurallara **kesinlikle** uyulmalıdır:

- Screenshot/log'larda **gerçek kullanıcı verisi** (gerçek email,
  gerçek isim, gerçek kart bilgisi) görünmemelidir — yalnızca
  sentetik test verisi kullanılmalıdır (bkz.
  `03-TEST-DESIGN/09-TEST-DATA-DESIGN.md`).
- API evidence'ında **authentication token'ları veya şifreler**
  maskelenerek paylaşılmalıdır.
- Backend log'larında **PII (Personally Identifiable Information)**
  varsa, paylaşmadan önce maskelenmelidir.
- Bu kurallar, `CONTRIBUTING.md` — "Real Company Data Rule" ile
  tutarlıdır.

---

## 6. Common Mistakes

- Yalnızca "Bug var" yazıp hiçbir evidence eklememek.
- Screenshot'ta test ortamına ait gerçek kullanıcı verisini
  maskelemeden paylaşmak.
- Zamanlamaya bağımlı bir hatayı yalnızca screenshot ile
  belgelemeye çalışmak (video daha uygun olurdu).

---

## 7. Best Practices

- Defect türüne göre en uygun evidence türünü seçin (bölüm 4).
- Her evidence'ın yanına Build Number, Environment ve Timestamp
  ekleyin — bu bilgiler olmadan evidence'ın "ne zaman, hangi
  koşulda" alındığı belirsiz kalır.
- Evidence paylaşmadan önce hassas veri içerip içermediğini kontrol
  edin.

---

## 8. Interview Notes

- "Evidence'in amacı nedir?" sorusuna, "bug var demek" ile "bug
  tekrar üretilebilir ve kanıtlanabilir" arasındaki farkı vurgulayarak
  cevap verin.
- "Zamanlamaya bağımlı bir hata için hangi evidence türünü
  tercih edersiniz?" sorusuna Screen Recording'i gerekçesiyle
  açıklayarak cevap verin.

---

## İlgili Konular

- [06-DEFECT-MANAGEMENT — Defect Evidence](../06-DEFECT-MANAGEMENT/08-DEFECT-EVIDENCE.md)
- [Test Execution Status](07-TEST-EXECUTION-STATUS.md)
- [CONTRIBUTING.md — Real Company Data Rule](../../CONTRIBUTING.md)
