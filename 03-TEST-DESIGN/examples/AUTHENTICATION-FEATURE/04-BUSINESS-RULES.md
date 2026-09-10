# Authentication Feature — Business Rules

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)

---

## Yöntem

`01-REQUIREMENT-ANALYSIS/05-BUSINESS-RULE-ANALYSIS.md`'de anlatıldığı
gibi, Business Rule'lar yalnızca UI değil, **API ve database
seviyesinde de** doğrulanmalıdır. Bu dosya, Authentication feature'ının
business kurallarını ve hangi katmanda test edilmesi gerektiğini
listeler.

---

## Business Rule Listesi

### BR-AUTH-001: Yalnızca Aktif Kullanıcılar Login Olabilir

**Kural:** `ACTIVE` durumunda olmayan (DISABLED, DELETED, LOCKED)
kullanıcılar login olamaz.

**Doğrulanması Gereken Katmanlar:**
- **UI:** Login formu, hatalı durumda uygun mesajı gösteriyor mu?
- **API:** `/auth/login` endpoint'i doğrudan çağrıldığında (UI bypass
  edilerek), inactive bir kullanıcı için gerçekten 401/403 dönüyor
  mu, yoksa yanlışlıkla bir session token'ı mı üretiyor?
- **Database:** Başarısız bir login denemesi sonrası, kullanıcı
  durumunun (`status`) yanlışlıkla değişmediği doğrulanmalı.

### BR-AUTH-002: Account Lock Mekanizması

**Kural:** 5 ardışık başarısız denemeden sonra hesap 15 dakika
kilitlenir.

**Doğrulanması Gereken Katmanlar:**
- **API:** 5. başarısız denemeden hemen sonraki (doğru credential ile
  yapılan) 6. deneme de reddediliyor mu?
- **Database:** Başarısız deneme sayacı (`failed_attempt_count`) doğru
  artıyor mu, lock süresi dolduğunda sıfırlanıyor mu?

### BR-AUTH-003: Genel Hata Mesajı (Bilgi Sızıntısı Önleme)

**Kural:** Email'in sistemde kayıtlı olup olmadığı, hata mesajından
anlaşılmamalıdır.

**Doğrulanması Gereken Katmanlar:**
- **API:** Kayıtlı olmayan bir email ile ve kayıtlı ama yanlış
  password ile yapılan denemeler, **aynı** hata mesajını ve mümkünse
  benzer bir response süresini dönüyor mu (zamanlama farkı da bir
  bilgi sızıntısı kaynağı olabilir)?

### BR-AUTH-004: Session Bağımsızlığı (Multiple Session)

**Kural:** Bir kullanıcının birden fazla aktif session'ı olabilir;
bir cihazdan logout olmak diğer cihazlardaki session'ı sonlandırmaz.

**Doğrulanması Gereken Katmanlar:**
- **API:** İki farklı cihazdan aynı kullanıcı ile login olunduğunda,
  her ikisi de bağımsız olarak geçerli session token'ı alıyor mu?
- **Database:** Session kayıtları, kullanıcı bazında birden fazla
  aktif kayıt tutabiliyor mu?

---

## Örnek: Yalnızca UI Kontrolü Neden Yeterli Değildir

**Senaryo:** UI, disabled bir kullanıcı login formunu doldurduğunda
"Hesabınız devre dışı" mesajını gösteriyor ve doğru görünüyor.

**Ancak:** Eğer `/auth/login` API endpoint'i **doğrudan** (Postman
veya benzeri bir araçla, UI bypass edilerek) çağrılırsa ve backend'de
`status = ACTIVE` kontrolü **yalnızca UI tarafında** yapılıyorsa —
API bu kullanıcı için geçerli bir session token'ı üretebilir.

Bu, **BR-AUTH-001'in yalnızca UI seviyesinde** uygulandığı, API
seviyesinde uygulanmadığı bir Business Rule ihlalidir ve yalnızca UI
üzerinden test edildiğinde **asla fark edilmez**.

---

## Sonraki Adım

[05 — Impact Analysis](05-IMPACT-ANALYSIS.md)
