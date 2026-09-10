# Verification & Validation

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Verification ve Validation, QA literatüründe en çok ezberlenen ama en az
içselleştirilen iki kavramdır. Bu dosyanın amacı ezber cümleyi bırakmak,
gerçek bir requirement üzerinden ikisinin pratikte ne anlama geldiğini
göstermektir.

---

## 2. Verification Nedir?

**Temel soru:** "Ürünü doğru şekilde geliştiriyor muyuz?"
(Are we building the product right?)

Verification, requirement, design, specification gibi **work product'ların**
belirlenen kriterlere uygun olup olmadığını değerlendirir. Çalışan bir
sistem gerektirmez — dokümanlar, tasarımlar ve planlar üzerinde yapılır.

---

## 3. Validation Nedir?

**Temel soru:** "Doğru ürünü mü geliştiriyoruz?"
(Are we building the right product?)

Validation, geliştirilmiş **gerçek sistemin**, kullanıcı ve business
ihtiyacını karşılayıp karşılamadığını değerlendirir. Çalışan bir sistem
üzerinde yapılır.

---

## 4. Aradaki Fark

| | Verification | Validation |
|---|---|---|
| Soru | Doğru mu geliştiriliyor? | Doğru şey mi geliştiriliyor? |
| Nesne | Requirement, design, spec | Çalışan sistem |
| Zamanlama | Development öncesi/sırası | Development sonrası |
| Yöntem | Review, walkthrough, inspection | Test execution |
| Örnek Aktivite | Requirement review | Fonksiyonel test çalıştırma |

---

## 5. Örnek Requirement Üzerinden Gösterim

**Requirement:** "Kullanıcı geçerli email ve password ile login olabilir."

### Verification Tarafı

Sistem henüz çalışmıyor olsa bile şu sorular sorulur:

- **Requirement açık mı?** "Geçerli email" ne demek? Format kontrolü mü,
  kayıtlı kullanıcı mı?
- **Acceptance Criteria yeterli mi?** Yanlış password girilirse ne olacağı,
  kaç deneme hakkı olduğu, hesap kilitlenmesi olup olmadığı belirtilmiş mi?
- **Design requirement'a uygun mu?** Login formu, tanımlanan alanları
  (email, password) içeriyor mu? Hata mesajları tasarımda var mı?

Bu aşamada henüz hiçbir kod çalıştırılmaz. Amaç, yanlış bir şeyin
geliştirilmesini **önlemektir**.

### Validation Tarafı

Sistem geliştirildikten sonra:

- **Gerçek kullanıcı login olabiliyor mu?** Doğru email/password ile
  giriş başarılı oluyor mu?
- **Sistem business ihtiyacını karşılıyor mu?** Yanlış credential'da
  güvenli bir hata mesajı dönüyor mu? Session doğru başlatılıyor mu?

Bu aşamada gerçek sistem çalıştırılır ve davranış gözlemlenir.

---

## 6. Neden İkisi de Gerekli?

Yalnızca Validation yapılırsa: Yanlış yazılmış bir requirement mükemmel
şekilde uygulanabilir — ama yanlış ihtiyacı karşılar. Sistem "doğru
çalışır" ama "yanlış şeyi" yapar.

Yalnızca Verification yapılırsa: Requirement'lar tutarlı ve net olabilir
ama gerçek sistem hiç test edilmediği için çalışma zamanı hataları
production'a kadar fark edilmeyebilir.

---

## 7. Common Mistakes

- Verification ve Validation'ı yalnızca İngilizce cümleleri ezberleyerek
  ayırt etmeye çalışmak.
- Requirement review'u "gereksiz bürokrasi" sanmak.
- Validation'ı yalnızca "test çalıştırmak" olarak görüp business ihtiyacını
  göz ardı etmek.

---

## 8. Best Practices

- Her yeni requirement için önce Verification (review), sonra Validation
  (test execution) adımını planlayın.
- Acceptance Criteria yazılırken hem positive hem negative senaryoları
  zorunlu tutun.
- Validation sırasında yalnızca "çalışıyor mu" değil "doğru business
  sonucunu mu üretiyor" sorusunu sorun.

---

## 9. Interview Notes

- "Verification ve Validation arasındaki fark nedir?" sorusuna somut bir
  requirement örneğiyle cevap verin — yalnızca tanım okumayın.
- "Hangi aşamada Verification, hangi aşamada Validation yaparsınız?"
  sorusuna lifecycle sırasıyla (requirement/design → verification,
  build sonrası → validation) cevap verin.

---

## İlgili Konular

- [QA / QC / Software Testing](01-QA-QC-AND-SOFTWARE-TESTING.md)
- [Entry & Exit Criteria](09-ENTRY-AND-EXIT-CRITERIA.md)
- [Test Oracle](08-TEST-ORACLE.md)
