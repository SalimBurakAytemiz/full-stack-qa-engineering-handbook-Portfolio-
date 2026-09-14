# Defect Evidence

**Status: EXPERIENCE**

> `05-TEST-MANAGEMENT/08-TEST-EVIDENCE-MANAGEMENT.md`, evidence
> türlerini ve amacını genel olarak anlatmıştı. Bu dosya, aynı
> prensiplerin **defect raporlarına özgü uygulamasını** ele alır.

---

## 1. Neden Önemli?

Bir bug raporunda evidence eksikse, o rapor **iddia** düzeyinde kalır.
Bu dosya, QA-COMPETENCY-MAP.md'de EXPERIENCE olarak işaretlenen
evidence türlerinin (Screenshot, Screen Recording, API Evidence,
Network Evidence, Console/Backend Logs) defect raporlarında nasıl
kullanıldığını gösterir.

---

## 2. Defect Türüne Göre Evidence Seçimi

| Defect Türü | Öncelikli Evidence | Gerekçe |
|---|---|---|
| UI görsel bozukluk | Screenshot | Görsel sorunun en direkt kanıtı |
| Zamanlamaya bağımlı sorun | Screen Recording | Statik görüntü, zaman içindeki davranışı gösteremez |
| API/Business Rule ihlali | API Request + Response | Sunucu tarafı davranışın doğrudan kanıtı |
| Ağ/performans sorunu | Network Evidence | İstek/cevap sürelerini ve başarısız çağrıları gösterir |
| Frontend hata/crash | Console Logs | Tarayıcı tarafı hata mesajlarını gösterir |
| Backend hata/exception | Backend Logs | Sunucu tarafı stack trace ve hata detayını gösterir |

---

## 3. API Evidence Örneği (Format)

```text
Request:
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: { "email": "test.active01@example.com", "password": "***" }

Response:
HTTP 500
{ "error": "Internal Server Error", "message": "Unexpected error" }
```

**Not:** Password gibi hassas alanlar `***` ile maskelenmelidir (bkz.
bölüm 5).

---

## 4. Screen Recording Ne Zaman Screenshot'tan Daha Değerlidir?

Statik bir screenshot, yalnızca **tek bir anı** yakalar. Aşağıdaki
durumlarda Screen Recording tercih edilmelidir:

- Çift tıklama, hızlı ardışık eylemler gibi zamanlamaya bağımlı
  sorunlar (bkz. `../03-TEST-DESIGN/07-ERROR-GUESSING.md`).
- Bir animasyon/geçiş sırasında oluşan görsel bozukluk.
- Kullanıcının izlediği tam adım sırasının, raporlanan Steps to
  Reproduce ile birebir eşleştiğini kanıtlamak.

---

## 5. Hassas Veri Güvenliği (Defect Bağlamında)

- Evidence'ta gerçek kullanıcı verisi **asla** kullanılmamalı,
  yalnızca sentetik test verisi kullanılmalıdır (bkz.
  `../03-TEST-DESIGN/09-TEST-DATA-DESIGN.md`).
- API Evidence'ında authentication token, password gibi alanlar
  maskelenmelidir.
- Backend log'larında PII varsa paylaşmadan önce maskelenmelidir.
- Bu kurallar `CONTRIBUTING.md` — "Real Company Data Rule" ile
  tutarlıdır.

---

## 6. Common Mistakes

- Yalnızca UI screenshot'ı paylaşıp, altındaki API/backend
  davranışını hiç göstermemek — bu, defect'in kök nedenini gizler.
- Zamanlamaya bağımlı bir sorunu yalnızca statik screenshot ile
  belgelemeye çalışmak.
- Evidence'ta maskelenmeden bırakılan hassas alanlar (token, şifre).

---

## 7. Best Practices

- Defect türüne en uygun evidence türünü seçin (bölüm 2).
- API/Backend kaynaklı sorunlarda, mümkün olduğunda hem UI hem
  API/log evidence'ını birlikte sunun.
- Evidence paylaşmadan önce hassas veri kontrolü yapın.

---

## 8. Interview Notes

- "Bir bug raporunda hangi evidence türünü ne zaman kullanırsınız?"
  sorusuna defect türü bazlı somut örneklerle cevap verin.
- "Screen Recording, Screenshot'tan ne zaman daha değerlidir?"
  sorusuna zamanlamaya bağımlı sorunlar örneğiyle cevap verin.

---

## İlgili Konular

- [05-TEST-MANAGEMENT — Test Evidence Management](../05-TEST-MANAGEMENT/08-TEST-EVIDENCE-MANAGEMENT.md)
- [Professional Bug Report](03-PROFESSIONAL-BUG-REPORT.md)
- [examples/AUTHENTICATION-BUG — Evidence Plan](examples/AUTHENTICATION-BUG/09-EVIDENCE-PLAN.md)
