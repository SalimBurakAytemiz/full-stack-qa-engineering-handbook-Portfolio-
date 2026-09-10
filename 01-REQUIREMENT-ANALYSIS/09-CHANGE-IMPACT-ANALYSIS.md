# Change Impact Analysis

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Impact Analysis (bkz. `07-IMPACT-ANALYSIS.md`), yeni bir feature'ın
sistemi nasıl etkilediğini sorar. Change Impact Analysis ise bir adım
daha ileri gider: **var olan** bir requirement veya implementasyon
değiştiğinde, bu değişikliğin test varlıklarını (test case,
automation, documentation) nasıl etkilediğini sorar.

---

## 2. Requirement veya Implementation Değiştiğinde Sorulması Gerekenler

### Hangi Test Case Değişmeli?

Değişen davranışı kapsayan mevcut test case'ler artık **geçersiz**
veya **eksik** hale gelmiş olabilir. Bunlar güncellenmezse, ya yanlış
bir beklentiyle test edilmeye devam edilir ya da yeni davranış hiç
kapsanmaz.

**Örnek:** "Password minimum 6 karakter" kuralı "minimum 8 karakter"
olarak değiştirildiğinde, eski test case'lerdeki 6-7 karakterlik
test verileri artık yanlış beklenti taşır.

### Hangi Regression Alanları Etkilenir?

Değişen alanla **doğrudan ilgili olmayan** ama dolaylı etkilenebilecek
alanlar belirlenmelidir (bkz. `07-IMPACT-ANALYSIS.md`).

### Automation Etkileniyor mu?

Otomatikleştirilmiş test senaryoları, değişen davranışla artık
**false positive** (yanlışlıkla PASS) veya **false negative**
(yanlışlıkla FAIL) üretebilir. Automation script'lerinin assertion'ları
gözden geçirilmelidir.

### API Contract Değişiyor mu?

Request/response şemasında bir değişiklik varsa, bu şemaya bağımlı
tüm client'lar (web, mobile, üçüncü parti entegrasyonlar)
etkilenebilir. API contract testleri (bkz.
`TERMINOLOGY-GLOSSARY.md` — Contract Testing) güncellenmelidir.

### Mobile/Web Parity Etkileniyor mu?

Bir platformda yapılan değişiklik, diğer platformda da aynı anda
uygulanmazsa, kullanıcı deneyimi platformlar arası tutarsız hale
gelebilir.

### Documentation Güncellenmeli mi?

Requirement dokümanları, API dokümantasyonu, test planı ve varsa
kullanıcı dokümantasyonu, değişikliği yansıtacak şekilde
güncellenmelidir. Güncel olmayan dokümantasyon, gelecekteki
Requirement Clarification sürecini yanıltır.

---

## 3. Örnek Senaryo

**Değişiklik:** "Kupon kodu, sepet başına yalnızca 1 kez
kullanılabilir" kuralı, "Kupon kodu, kullanıcı başına 1 kez
kullanılabilir" olarak değiştirildi (sepet bazlı kısıtlamadan
kullanıcı bazlı kısıtlamaya geçiş).

**Change Impact Analizi:**

- **Test Case:** Eski "aynı sepette kuponu iki kez uygulama" test
  case'i artık farklı bir davranışı (kullanıcı bazlı kontrol)
  doğrulamalı; yeniden yazılmalı.
- **Regression:** Farklı kullanıcıların aynı kuponu kullanabilmesi
  senaryosu (öncesinde geçerliydi, şimdi kullanıcı bazlı kontrol
  varsa hâlâ geçerli olmalı) regression'a eklenmeli.
- **Automation:** Otomatik testte "aynı sepet" bazlı assertion,
  "aynı kullanıcı" bazlı assertion'a güncellenmeli.
- **API Contract:** Kupon geçerlilik kontrol endpoint'i muhtemelen
  aynı response şemasını koruyor, ama iş mantığı değişti — contract
  testi değil ama business rule testi güncellenmeli.
- **Mobile/Web Parity:** Her iki platform da aynı kuralı mı
  uyguluyor, yoksa yalnızca web mi güncellendi?
- **Documentation:** Kupon kullanım kuralı dokümanı güncellenmeli.

---

## 4. Common Mistakes

- Bir requirement değiştiğinde yalnızca yeni davranışı test edip,
  eski test case'lerin hâlâ geçerli olup olmadığını kontrol etmemek.
- Automation suite'ini "zaten yeşil" diye güncellemeden bırakmak —
  yeşil olması, doğru şeyi test ettiği anlamına gelmez.
- Documentation güncellemesini "sonra yaparız" diyerek erteleyip hiç
  yapmamak.

---

## 5. Best Practices

- Her requirement değişikliğinde, ilişkili test case'leri
  Traceability üzerinden (bkz.
  `00-QA-FOUNDATIONS/10-TRACEABILITY-FUNDAMENTALS.md`) bulup gözden
  geçirin.
- Automation değişikliklerini, değişen business kuralına özel bir
  gözden geçirme adımı olarak planlayın.
- Change Impact Analysis çıktısını, Impact Analysis gibi kısa ve
  yazılı şekilde dokümante edin.

---

## 6. Interview Notes

- "Bir requirement değiştiğinde ilk kontrol ettiğiniz şey nedir?"
  sorusuna, ilişkili test case ve automation'ı Traceability üzerinden
  bulacağınızı belirterek cevap verin.
- "Automation her zaman güvenilir bir regression sinyali midir?"
  sorusuna hayır diyerek, business kuralı değiştiğinde eski
  assertion'ların yanlış güven verebileceğini açıklayın.

---

## İlgili Konular

- [Impact Analysis](07-IMPACT-ANALYSIS.md)
- [00-QA-FOUNDATIONS — Traceability Fundamentals](../00-QA-FOUNDATIONS/10-TRACEABILITY-FUNDAMENTALS.md)
- [03-TEST-DESIGN — Automation Candidate Analysis](../03-TEST-DESIGN/12-AUTOMATION-CANDIDATE-ANALYSIS.md)
