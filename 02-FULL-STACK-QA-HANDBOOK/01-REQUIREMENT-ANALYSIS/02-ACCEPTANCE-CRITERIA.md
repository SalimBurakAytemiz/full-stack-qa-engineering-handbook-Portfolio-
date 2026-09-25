# Acceptance Criteria

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Acceptance Criteria (AC), test tasarımının en doğrudan girdisidir. Zayıf
yazılmış bir AC, zayıf test kapsamı üretir. Bu dosya, "iyi" bir AC'nin
neye benzediğini ve "kötü" bir AC'nin neden problem yarattığını gösterir.

---

## 2. İyi Acceptance Criteria'nın Özellikleri

İyi bir Acceptance Criteria şu özellikleri taşımalıdır:

- **Açık (Clear):** Birden fazla yoruma açık olmamalı.
- **Ölçülebilir (Measurable):** "Doğru" veya "yanlış" olduğu somut
  şekilde belirlenebilmeli.
- **Test Edilebilir (Testable):** Bir test case'e doğrudan
  dönüştürülebilmeli.
- **Belirsiz Olmayan (Unambiguous):** "Hızlı", "kullanıcı dostu" gibi
  öznel ifadeler içermemeli.
- **Expected Behaviour İçeren:** Sistemin ne yapacağını değil, *tam
  olarak nasıl* davranacağını tanımlamalı.
- **Business Rule ile Uyumlu:** İlgili business kurallarıyla
  çelişmemeli.

---

## 3. Kötü Örnek

> "Sistem hızlı çalışmalıdır."

**Neden problemli:**

- "Hızlı" ölçülebilir değil — kaç saniye, kaç milisaniye?
- Hangi koşul altında (kaç kullanıcı, hangi yük)?
- Hangi işlem için (sayfa yüklenmesi mi, API response'u mu)?

Bu haliyle AC, hiçbir test case'e dönüştürülemez; test eden kişi kendi
öznel yargısına göre "hızlı mı değil mi" karar vermek zorunda kalır.

---

## 4. Daha Test Edilebilir Örnek

> "Belirlenen normal yük altında ilgili API endpoint'i, kabul edilen
> response-time kriterini sağlamalıdır."

**Önemli not:** Bu ifade dahi hâlâ tam olarak ölçülebilir değildir —
"kabul edilen response-time kriteri" somut bir sayı içermiyor. Gerçek
bir projede bu cümle şu şekilde tamamlanmalıdır:

> "Belirlenen normal yük altında `/checkout` endpoint'i, p95
> response-time'da [proje bazında belirlenecek eşik] değerini
> aşmamalıdır."

**Eğitim amaçlı not:** Bu repository, gerçek bir performans threshold'u
(örn. "300ms", "500ms") **uydurmaz**. Somut sayı, her projenin kendi
performans gereksinimlerine ve SLA'sına göre belirlenmelidir. Buradaki
amaç, threshold'un *var olması* ve *ölçülebilir* olması gerektiğini
göstermektir — spesifik değeri değil.

---

## 5. AC Yazarken Sorulması Gereken Sorular

- Bu AC'yi okuyan biri, "PASS" ve "FAIL"i nasıl ayırt eder?
- Bu AC'de belirsiz bir sıfat (hızlı, kolay, kullanıcı dostu, güvenli)
  var mı?
- Bu AC, positive senaryonun yanı sıra negative/edge durumu da
  kapsıyor mu, yoksa yalnızca happy path mı anlatıyor?
- Bu AC, ilgili Business Rule ile çelişiyor mu?

---

## 6. Daha Fazla Örnek: Belirsizden Netliğe

| Belirsiz (Kötü) | Net (İyi) |
|---|---|
| "Form doğru şekilde doğrulanmalı." | "Email alanı boş bırakılırsa, form submit edilmemeli ve 'Email zorunludur' mesajı gösterilmelidir." |
| "Kullanıcı kolayca ürün arayabilmeli." | "Kullanıcı arama kutusuna en az 2 karakter girdiğinde, eşleşen ürünler 1 saniye içinde listelenmelidir." *(threshold eğitim amaçlıdır)* |
| "Hatalı girişte uygun mesaj gösterilmeli." | "Geçersiz email/password ile giriş denendiğinde, 'Email veya şifre hatalı' mesajı gösterilmeli ve hangi alanın hatalı olduğu belirtilmemelidir (güvenlik amacıyla)." |

---

## 7. Common Mistakes

- AC'yi yalnızca happy path için yazıp negative/error davranışını
  tanımlamamak.
- Öznel sıfatlar (hızlı, kolay, güvenli) kullanıp ölçülebilir bir
  kritere bağlamamak.
- Bir requirement'ın tek bir AC ile "tamamen" kapsandığını düşünmek —
  genelde birden fazla AC gerekir.

---

## 8. Best Practices

- Her AC'yi "Given / When / Then" gibi yapılandırılmış bir formatla
  yazmayı düşünün — bu, belirsizliği azaltır.
- AC'de sayısal bir threshold gerekiyorsa, bu değeri asla tahmin etmeyin;
  business/product ile netleştirin.
- Her AC'nin bağımsız olarak test edilebilir olduğundan emin olun.

---

## 9. Interview Notes

- "İyi bir Acceptance Criteria nasıl olmalıdır?" sorusuna somut
  kriterlerle (açık, ölçülebilir, test edilebilir) cevap verin.
- "'Sistem hızlı çalışmalıdır' neden kötü bir AC'dir?" sorusuna,
  ölçülebilirlik eksikliğini örnekle açıklayın.

---

## İlgili Konular

- [Requirement Types](01-REQUIREMENT-TYPES.md)
- [Requirement Testability](04-REQUIREMENT-TESTABILITY.md)
- [Requirement Clarification](03-REQUIREMENT-CLARIFICATION.md)
