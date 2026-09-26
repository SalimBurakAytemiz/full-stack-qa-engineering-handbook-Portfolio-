# Smoke / Sanity / Regression Suites

**Status: EXPERIENCE**

> `00-QA-FOUNDATIONS/05-TEST-TYPES.md`, Smoke/Sanity/Regression
> Testing'in kavramsal farkını anlatmıştı. Bu dosya, bu üç test
> türünün **suite (paket) olarak nasıl yönetildiğini** ele alır.

---

## 1. Neden Önemli?

Bir test operasyonunda "hangi suite'i ne zaman çalıştırırız" sorusu,
zaman yönetiminin temelidir. Bu dosya, üç suite türünü **ne zaman
tetiklenir, kim çalıştırır, ne kadar sürer** boyutlarıyla ele alır.

---

## 2. Smoke Suite

**İçerik:** Sistemin en kritik, geniş fonksiyonlarını kapsayan az
sayıda (genelde 10-20) Test Case.

**Ne Zaman Çalıştırılır:** Her yeni build/deployment sonrası, ilk
adım olarak.

**Süre:** Çok kısa (dakikalar).

**Amaç:** "Bu build detaylı teste değer mi?" sorusuna hızlı cevap.

---

## 3. Sanity Suite

**İçerik:** Belirli bir fix/değişikliğin doğrudan etkilediği dar bir
alanı kapsayan Test Case'ler.

**Ne Zaman Çalıştırılır:** Küçük bir fix/değişiklik sonrası.

**Süre:** Kısa (fix'in kapsamına göre değişir).

**Amaç:** "Bu fix mantıklı çalışıyor mu?" sorusuna hızlı cevap.

---

## 4. Regression Suite

**İçerik:** Sistemin genelini (ilgili ve potansiyel olarak ilgisiz
alanları) kapsayan, kapsamlı Test Case seti.

**Ne Zaman Çalıştırılır:** Her release öncesi, önemli bir değişiklik
sonrası.

**Süre:** Uzun (saatler, hatta günler — kapsam ve otomasyon oranına
göre değişir).

**Amaç:** "Bu değişiklik başka bir yeri bozdu mu?" sorusuna kapsamlı
cevap.

---

## 5. Suite Seçim Akışı

```text
Yeni Build Deploy Edildi
   ↓
Smoke Suite Çalıştırılır
   ↓
PASS ise → Detaylı Functional Test'e Geç
FAIL ise → Build Reddedilir, Detaylı Test Başlamaz
   ↓
Küçük Fix mi, Büyük Değişiklik mi?
   ↓
Küçük Fix → Sanity Suite (dar kapsam)
Büyük Değişiklik / Release Öncesi → Regression Suite (geniş kapsam)
```

---

## 6. Suite Boyutu Nasıl Belirlenir?

Suite boyutu, Risk-Based Testing prensipleriyle belirlenir (bkz.
`02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md`):

- **Smoke Suite:** Yalnızca en yüksek Business Criticality'ye sahip
  akışlar (login, ana sayfa, ödeme başlatma).
- **Regression Suite:** Business Criticality + Change Frequency +
  Historical Defects kombinasyonuna göre önceliklendirilmiş geniş bir
  set.

---

## 7. Common Mistakes

- Smoke Suite'i çok büyük tutup, "hızlı sağlık kontrolü" amacını
  kaybetmek.
- Her küçük fix için tam Regression Suite'i çalıştırmaya çalışıp
  zaman kaybetmek (Sanity yeterliyken).
- Regression Suite'i hiç güncellememek — yeni riskli alanlar suite'e
  eklenmezse coverage zamanla eskir.

---

## 8. Best Practices

- Smoke Suite'i 15-20 dakikayı geçmeyecek şekilde küçük tutun.
- Sanity ile Regression arasındaki sınırı (ne kadar kapsam = "küçük
  fix") ekip içinde netleştirin.
- Regression Suite'i her sprint sonunda gözden geçirip güncel tutun.

---

## 9. Interview Notes

- "Smoke, Sanity ve Regression Suite'lerini ne zaman kullanırsınız?"
  sorusuna zamanlama ve kapsam farklarıyla cevap verin.
- "Regression Suite ne kadar sıklıkla güncellenmelidir?" sorusuna,
  her sprint sonunda gözden geçirilmesi gerektiğini belirterek cevap
  verin.

---

## İlgili Konular

- [00-QA-FOUNDATIONS — Test Types](../00-QA-FOUNDATIONS/05-TEST-TYPES.md)
- [Test Suite & Test Cycle](05-TEST-SUITE-AND-TEST-CYCLE.md)
- [Test Prioritization](../02-RISK-BASED-TESTING/04-TEST-PRIORITIZATION.md)
