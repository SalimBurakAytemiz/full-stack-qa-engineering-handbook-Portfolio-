# UAT Management

**Status: EXPERIENCE**

> `00-QA-FOUNDATIONS/04-TEST-LEVELS.md`, UAT'ı bir test seviyesi
> olarak tanıtmıştı. Bu dosya, UAT'ın **QA tarafından nasıl
> koordine edildiğini** anlatır.

---

## 1. Neden Önemli?

UAT, karar yetkisi business'a ait olsa da, genellikle **QA tarafından
koordine edilen** bir süreçtir. Bu dosya, QA'nın UAT'taki gerçek
rolünü netleştirir.

---

## 2. UAT'ta QA'nın Rolü

- UAT senaryolarını, gerçek kullanıcı ihtiyacını yansıtacak şekilde
  hazırlamak (genellikle Functional test senaryolarından türetilir
  ama iş dilinde, teknik jargon olmadan yazılır).
- UAT ortamının hazır olduğunu (Entry Criteria) doğrulamak.
- Business kullanıcılarına UAT sürecinde destek olmak (soruları
  yanıtlamak, karşılaşılan sorunları triage etmek).
- UAT sırasında bulunan sorunları defect olarak kayıt altına almak.
- UAT sonuçlarını konsolide edip raporlamak.

**Önemli:** QA, UAT senaryolarını hazırlar ve süreci **koordine
eder** — ama nihai "kabul" kararı **business'a** aittir (bkz.
`00-QA-FOUNDATIONS/04-TEST-LEVELS.md`, bölüm 7).

---

## 3. UAT Senaryosu Örneği

**Functional Test Senaryosu (teknik):** "TC-COUPON-HP-001: Geçerli
kupon kodu ile %10 indirim uygulanması."

**UAT Senaryosu (business dili):** "Bir müşteri olarak, elimde geçerli
bir indirim kuponu var. Sepetime kuponu uyguladığımda toplam
tutarımın doğru şekilde düştüğünü görmek istiyorum."

UAT senaryosu, aynı davranışı test eder ama **kullanıcı perspektifinden**
ve teknik detaydan arındırılmış şekilde yazılır.

---

## 4. UAT Süreci

```text
UAT Senaryoları Hazırlanır (QA)
   ↓
UAT Ortamı Hazırlanır (QA + DevOps)
   ↓
Business Kullanıcıları Senaryoları Çalıştırır
   ↓
Sorun Bulunursa → Defect Kaydı (QA koordine eder)
   ↓
UAT Sonuçları Konsolide Edilir (QA)
   ↓
Business Kabul Kararı Verir (Business)
```

---

## 5. Common Mistakes

- UAT senaryolarını teknik jargonla yazıp business kullanıcısının
  anlamasını zorlaştırmak.
- QA'nın UAT sonucuna göre kabul kararını kendisinin verdiğini
  düşünmek.
- UAT sırasında bulunan sorunları defect olarak kayıt altına
  almadan sözlü geri bildirimle bırakmak.

---

## 6. Best Practices

- UAT senaryolarını business diliyle, teknik terimlerden arındırarak
  yazın.
- UAT sürecini açık bir Entry/Exit Criteria ile (bkz.
  `11-ENTRY-EXIT-CRITERIA.md`) çerçeveleyin.
- UAT sonuçlarını `templates/UAT-TEMPLATE.md` formatıyla tutarlı
  şekilde raporlayın.

---

## 7. Interview Notes

- "UAT'ta QA'nın rolü nedir?" sorusuna, senaryo hazırlama ve süreç
  koordinasyonu ile sınırlı olduğunu, kabul kararının business'a ait
  olduğunu vurgulayarak cevap verin.
- "UAT senaryosu ile Functional Test senaryosu arasındaki fark
  nedir?" sorusuna dil ve perspektif farkıyla (business dili vs
  teknik dil) cevap verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Test Levels](../00-QA-FOUNDATIONS/04-TEST-LEVELS.md)
- [templates/UAT-TEMPLATE.md](templates/UAT-TEMPLATE.md)
- [Release QA Sign-Off](17-RELEASE-QA-SIGN-OFF.md)
