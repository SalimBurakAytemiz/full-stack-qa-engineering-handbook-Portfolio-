# Cross-Team Defects

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bazı defect'ler, tek bir ekibin sınırları içinde kalmaz — birden
fazla ekibin (Frontend, Backend, DevOps, üçüncü parti) koordinasyonunu
gerektirir. Bu dosya, bu tür defect'lerin nasıl yönetildiğini anlatır.

---

## 2. Cross-Team Defect Nedir?

Kök nedeni veya çözümü, **birden fazla ekibin** sorumluluk alanına
yayılan defect'tir.

---

## 3. Örnek Senaryo

**Defect:** "Ödeme onaylandıktan sonra, sipariş bildirimi kullanıcıya
ulaşmıyor."

**Root Cause Isolation sonrası (bkz. `14-ROOT-CAUSE-ISOLATION.md`):**

- Backend, ödeme onayını doğru işliyor ve bildirim event'ini doğru
  tetikliyor (Backend ekibi: sorun yok).
- Notification Service, event'i alıyor ama üçüncü parti SMS/email
  sağlayıcısına gönderirken zaman aşımına uğruyor (Notification
  ekibi + Third Party bağımlılığı).
- Bu zaman aşımı, DevOps tarafından yönetilen network konfigürasyonu
  ile de ilişkili olabilir (DevOps ekibi).

Bu defect, **üç farklı ekibin** (Notification, DevOps, dolaylı olarak
Third Party sağlayıcı) koordinasyonunu gerektirir.

---

## 4. Cross-Team Defect'lerde QA'nın Rolü

- Root Cause Isolation ile, sorunun **hangi katmanlarda** olduğunu
  mümkün olduğunca netleştirmek (bkz. `14-ROOT-CAUSE-ISOLATION.md`).
- İlgili tüm ekipleri, ellerindeki **kanıtla** (evidence, isolation
  bulguları) bilgilendirmek.
- Defect'in **tek bir ekibe** yanlış atanmasını önlemek — örneğin,
  yalnızca "Notification çalışmıyor" demek yerine, sorunun aslında
  üçüncü parti sağlayıcı kaynaklı olabileceğini belirtmek.
- Tüm ekipler arası koordinasyonu (kimin ne zaman ne yapacağı)
  izlemek, defect'in "kimsenin sorumluluğunda değil" gibi kaybolmasını
  önlemek.

---

## 5. Cross-Team Defect'in Owner'ı Kim Olmalı?

Genellikle, defect'in **birincil tetikleyici katmanına** en yakın
ekip (bu örnekte Notification ekibi) owner olarak atanır, ama diğer
ekiplerin (DevOps, Third Party koordinasyonu) katkısı defect kaydında
açıkça izlenir (yorumlar, linked issues ile).

---

## 6. Common Mistakes

- Cross-team bir defect'i tek bir ekibe atayıp, diğer ekiplerin
  katkısını hiç izlememek.
- Root Cause Isolation yapmadan defect'i "en olası" ekibe atamak.
- Ekipler arası koordinasyonu takip etmemek, defect'in ekipler
  arasında "kayıp" gitmesine izin vermek.

---

## 7. Best Practices

- Root Cause Isolation'ı mümkün olduğunca derinlemesine yapıp,
  etkilenen tüm katmanları/ekipleri belirtin.
- Cross-team defect'lerde düzenli bir status güncellemesi (hangi
  ekip ne durumda) takip edin.
- Third Party bağımlılıkları olan defect'lerde, sağlayıcı ile
  iletişim sürecini de defect kaydına not edin.

---

## 8. Interview Notes

- "Cross-Team bir defect'i nasıl yönetirsiniz?" sorusuna, Root Cause
  Isolation ile ilgili katmanları netleştirip tüm ekipleri
  koordine edeceğinizi belirterek cevap verin.
- "Cross-team bir defect'in owner'ı nasıl belirlenir?" sorusuna,
  birincil tetikleyici katmana en yakın ekip örneğiyle cevap verin.

---

## İlgili Konular

- [Root Cause Isolation](14-ROOT-CAUSE-ISOLATION.md)
- [Production Defects](17-PRODUCTION-DEFECTS.md)
- [Defect Triage](09-DEFECT-TRIAGE.md)
