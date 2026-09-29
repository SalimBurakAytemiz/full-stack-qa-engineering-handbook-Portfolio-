# Authentication Bug — Evidence Plan

> EDUCATIONAL CONTROLLED EXAMPLE — bkz. [README.md](README.md)

---

## Dürüst Evidence Durumu

Bu defect **gerçekte hiçbir zaman çalıştırılmamıştır** — bu tamamen
kurgusal, eğitim amaçlı bir senaryodur. Bu yüzden hiçbir evidence
**gerçekten üretilmemiştir**. Aşağıdaki durum, `CONTRIBUTING.md` —
Evidence Integrity kuralına uygun olarak **dürüstçe** işaretlenmiştir:

| Evidence Türü | Durum |
|---|---|
| Screenshot | **NOT CAPTURED** |
| Video / Screen Recording | **NOT CAPTURED** |
| Network Evidence | **NOT CAPTURED** |
| API Evidence | **NOT EXECUTED** |
| Backend Log | **NOT AVAILABLE** |
| Console Log | **NOT CAPTURED** |
| Database Result | **NOT AVAILABLE** |

**Hiçbir sahte screenshot, video veya log oluşturulmamıştır.**

---

## Bu Evidence Türleri Gerçekte Nasıl Üretilirdi? (Planlama)

`06-DEFECT-MANAGEMENT/08-DEFECT-EVIDENCE.md`'deki rehbere göre, bu
defect türü (business rule / hata mesajlama sorunu) için **gerçekte**
şu evidence'lar toplanırdı:

1. **Screenshot:** Login formunda gösterilen yanlış hata mesajının
   ekran görüntüsü.
2. **API Evidence:** `/auth/login` endpoint'ine gönderilen request ve
   dönen response'un tam içeriği (hangi status code, hangi error
   body döndüğü).
3. **Backend Log:** Backend'in bu isteği işlerken ürettiği log
   kaydı — generic error'ün nereden (hangi exception/catch bloğundan)
   geldiğini gösterecek.

---

## QA-DEMO-SYSTEM ile Gelecekteki Evidence Üretimi

Bu repository'nin ileriki bir Phase'inde kurulacak olan
**QA-DEMO-SYSTEM**, gerçekten çalışan kontrollü bir uygulama
olacaktır. O sistem hazır olduğunda, bu defect senaryosu (veya
benzeri kontrollü senaryolar) **gerçekten çalıştırılabilir** ve
**gerçek** evidence (gerçek screenshot, gerçek API response, gerçek
log) üretilebilir.

**Bu Phase'de (Phase 3) QA-DEMO-SYSTEM henüz mevcut olmadığı için**,
bu evidence planı yalnızca **ne toplanacağının** dokümantasyonudur —
gerçek evidence üretimi değildir.

---

## Common Mistake'ten Kaçınma

Bu dosya, bilinçli olarak `00-QA-FOUNDATIONS/COMMON-MISTAKES.md`'deki
"Environment problemini product bug olarak raporlamak" ve
`CONTRIBUTING.md`'deki Evidence Integrity ihlallerinden kaçınmak için
yazılmıştır — sahte bir screenshot veya log **eklemek**, bu
repository'nin temel kurallarını ihlal ederdi.

---

## Sonraki Adım

[10 — Retest](10-RETEST.md)
