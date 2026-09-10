# Authentication Feature — Dependency Analysis

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [01-REQUIREMENT.md](01-REQUIREMENT.md)

---

## Yöntem

`01-REQUIREMENT-ANALYSIS/08-DEPENDENCY-ANALYSIS.md`'deki bağımlılık
türleri kullanılarak, Authentication feature'ının bağımlılık zinciri
haritalanmıştır.

---

## Bağımlılık Zinciri

```text
Frontend (Web/Mobile)
   ↓
API (/auth/login)
   ↓
Authentication Service
   ↓
User Database
   ↓
Session Store
   ↓
Audit Log Service
```

---

## Bağımlılık Türlerine Göre Sınıflandırma

| Bağımlılık | Tür | Açıklama |
|---|---|---|
| Frontend → API | Internal Dependency | Aynı organizasyon içinde geliştirilen bileşenler. |
| API → Authentication Service | Internal Dependency | Login mantığını yürüten iç servis. |
| Authentication Service → User Database | Internal Dependency | Kullanıcı bilgisi ve durumu bu veritabanında tutulur. |
| Authentication Service → Session Store | Internal Dependency | Session token'larının saklandığı depolama katmanı (örn. in-memory cache). |
| Authentication Service → Audit Log Service | Internal Dependency | Başarısız denemelerin loglanması için kullanılan iç servis. |
| Test Data → Kayıtlı Test Kullanıcıları | Data Dependency | Farklı durumlardaki (ACTIVE, DISABLED, LOCKED) test kullanıcılarının test ortamında önceden hazırlanmış olması gerekir. |
| Test Ortamı → Konfigürasyon | Environment Dependency | Lock süresi (15 dakika), session timeout (30 dakika) gibi değerlerin test ortamında doğru konfigüre edilmiş olması gerekir. |

**Not:** Bu kontrollü örnekte External veya Third-Party bir bağımlılık
(örn. harici bir SSO sağlayıcısı) bulunmamaktadır — Authentication
tamamen sistem içi (internal) bileşenlerle yürütülmektedir.

---

## Bağımlılık Unavailable Olduğunda Test Stratejisi

**Senaryo:** Session Store (örn. cache servisi) test ortamında ayakta
değilse:

- Login'in **kendisi** (credential doğrulama) yine de test
  edilebilir — bu adım Session Store'a bağımlı değildir.
- Ancak "başarılı login sonrası session oluşturulması" ve "multiple
  session" (BR-AUTH-004) senaryoları test edilemez; bu durum
  `ENVIRONMENT REQUIRED` olarak işaretlenmeli ve raporlanmalıdır (bkz.
  `01-REQUIREMENT-ANALYSIS/08-DEPENDENCY-ANALYSIS.md`, bölüm 4).

---

## Sonraki Adım

[07 — Risk Matrix](07-RISK-MATRIX.md)
