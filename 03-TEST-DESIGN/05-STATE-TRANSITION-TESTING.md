# State Transition Testing

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Birçok sistem varlığı (sipariş, kullanıcı hesabı, ödeme) zaman
içinde farklı **durumlar** arasında geçiş yapar. Bu geçişlerin
**doğru** ve yalnızca **izin verilenlerin** mümkün olması gerekir.
State Transition Testing, bu geçişleri sistematik olarak doğrular.

---

## 2. Temel Terimler

- **State (Durum):** Varlığın belirli bir andaki hâli (örn. `CREATED`,
  `PAID`).
- **Transition (Geçiş):** Bir durumdan başka bir duruma geçiş.
- **Event (Olay):** Geçişi tetikleyen eylem (örn. "ödeme onaylandı").
- **Valid Transition (Geçerli Geçiş):** Sistemin izin verdiği bir
  durum değişikliği.
- **Invalid Transition (Geçersiz Geçiş):** Sistemin **engellemesi**
  gereken bir durum değişikliği.

---

## 3. Örnek: Order (Sipariş) State Diyagramı

```text
CREATED
   ↓ (ödeme onaylandı)
PAID
   ↓ (hazırlık başladı)
PREPARING
   ↓ (kargoya verildi)
SHIPPED
   ↓ (teslim edildi)
DELIVERED
```

---

## 4. Geçerli Geçişler (Valid Transitions)

| Mevcut Durum | Event | Yeni Durum |
|---|---|---|
| CREATED | Ödeme onaylandı | PAID |
| PAID | Hazırlık başladı | PREPARING |
| PREPARING | Kargoya verildi | SHIPPED |
| SHIPPED | Teslim edildi | DELIVERED |

Her biri test edilmelidir: doğru event tetiklendiğinde, sistem
gerçekten doğru bir sonraki duruma geçiyor mu?

---

## 5. Geçersiz Geçiş Örneği

> **DELIVERED → CREATED**

Bir siparişin "teslim edildi" durumundan doğrudan "oluşturuldu"
durumuna geri dönmesi **anlamsız ve tehlikelidir** — bu, sistemin
tutarlılığını bozabilir (örn. zaten teslim edilmiş bir sipariş
yeniden "yeni sipariş" gibi işlenebilir).

**Test edilmesi gereken:** Sistem, `DELIVERED` durumundaki bir
siparişi `CREATED` durumuna geri döndürmeye çalışan bir isteği
(örn. doğrudan API çağrısıyla, UI'yi bypass ederek) **reddediyor
mu**?

---

## 6. Diğer Geçersiz Geçiş Örnekleri

| Geçersiz Geçiş | Neden Test Edilmeli |
|---|---|
| CREATED → SHIPPED | Ödeme ve hazırlık adımları atlanarak doğrudan kargoya çıkış olmamalı |
| PAID → CREATED | Ödenmiş bir sipariş "ödenmemiş" durumuna geri dönmemeli |
| DELIVERED → PREPARING | Teslim edilmiş bir sipariş yeniden hazırlığa alınmamalı |

---

## 7. Cancelled (İptal) Durumu ile Genişletilmiş Diyagram

Gerçek sistemlerde genellikle bir de "iptal" dalı bulunur:

```text
CREATED ──→ PAID ──→ PREPARING ──→ SHIPPED ──→ DELIVERED
   │           │
   └──────→ CANCELLED ←──────┘
```

- `CREATED` durumunda iptal: Ödeme henüz yapılmadığı için doğrudan
  iptal edilebilir.
- `PAID` durumunda iptal: Ödeme yapılmış, iptal işlemi bir **refund**
  (iade) süreci tetiklemeli.
- `PREPARING`, `SHIPPED`, `DELIVERED` durumlarından `CANCELLED`'e
  geçiş genellikle **kapalıdır** (veya farklı bir "iade" sürecine
  yönlendirilir) — bu, requirement'ta netleştirilmesi gereken bir
  noktadır.

---

## 8. Test Tasarımı: Hangi Geçişler Test Edilmeli?

1. Tüm **geçerli** geçişler (diyagramdaki oklar) — her biri doğru
   çalışıyor mu?
2. En az birkaç **geçersiz** geçiş — sistem bunları gerçekten
   reddediyor mu?
3. Her durumdan **iptal** dalına geçiş (izin veriliyorsa) veya
   reddedilmesi (izin verilmiyorsa).
4. Aynı durumdan **aynı duruma** geçiş denemesi (örn. zaten `PAID`
   olan bir siparişi tekrar "ödeme onaylandı" eventiyle tetiklemek)
   — sistem bunu nasıl ele alıyor (idempotency)?

---

## 9. Common Mistakes

- Yalnızca geçerli geçişleri test edip geçersiz geçişleri hiç
  denememek.
- State diyagramını yalnızca "mutlu yol" (CREATED → ... →
  DELIVERED) ile sınırlı çizip iptal/hata dallarını atlamak.
- Bir durumun API üzerinden doğrudan (UI bypass edilerek) değiştirilip
  değiştirilemediğini test etmemek.

---

## 10. Best Practices

- Her state'li varlık için requirement analizinin bir parçası olarak
  state diyagramı çıkarın (bkz.
  `01-REQUIREMENT-ANALYSIS/11-COMMON-REQUIREMENT-PROBLEMS.md` —
  Undefined State Transition).
- Geçersiz geçişleri, mümkünse doğrudan API seviyesinde (UI'yi
  bypass ederek) test edin.
- State geçiş testlerini Traceability zincirine (bkz.
  `11-TRACEABILITY-FROM-REQUIREMENT-TO-TEST.md`) bağlayın.

---

## 11. Interview Notes

- "State Transition Testing nedir?" sorusuna Order örneğiyle, valid
  ve invalid transition ayrımını vurgulayarak cevap verin.
- "Geçersiz bir state geçişini nasıl test edersiniz?" sorusuna,
  API'yi doğrudan çağırarak UI kısıtlamalarını bypass etmeyi
  deneyeceğinizi belirterek cevap verin.

---

## İlgili Konular

- [Decision Table Testing](04-DECISION-TABLE-TESTING.md)
- [01-REQUIREMENT-ANALYSIS — Common Requirement Problems](../01-REQUIREMENT-ANALYSIS/11-COMMON-REQUIREMENT-PROBLEMS.md)
- [Scenario-Based Testing](06-SCENARIO-BASED-TESTING.md)
