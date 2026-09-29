# Requirement Review Checklist

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bu dosya, önceki dosyalarda anlatılan tüm analiz boyutlarını (types,
AC, clarification, testability, business rules, flows, impact,
dependency) tek bir **kullanılabilir kontrol listesine** dönüştürür.
Bir requirement review sırasında doğrudan kullanılabilir.

---

## 2. Nasıl Kullanılır?

Bu checklist, her yeni requirement/feature için development
başlamadan önce (Entry Criteria aşamasında) gözden geçirilmelidir.
Her madde için "Evet / Hayır / Belirsiz" değerlendirmesi yapılır;
"Belirsiz" işaretlenen her madde bir Clarification sorusuna dönüşür.

---

## 3. Checklist

### Functional Behaviour

- [ ] Sistemin normal koşullarda göstermesi gereken davranış net mi?
- [ ] Happy Path, Alternative Flow'lar tanımlanmış mı?

### Business Rules

- [ ] Bu requirement'ı etkileyen tüm Business Rule'lar listelenmiş mi?
- [ ] Business Rule'ların hangi katmanda (UI/API/DB) uygulanacağı net
      mi?

### Input Rules

- [ ] Geçerli girdi formatları/sınırları tanımlanmış mı?
- [ ] Zorunlu/opsiyonel alanlar belirtilmiş mi?

### Output Rules

- [ ] Beklenen çıktı formatı (response, UI davranışı) net mi?

### Error Handling

- [ ] Hatalı girdi/durumlarda gösterilecek mesajlar tanımlanmış mı?
- [ ] Sistem hataları (timeout, servis hatası) için davranış
      belirtilmiş mi?

### Roles / Authorization

- [ ] Bu davranışı kimin gerçekleştirebileceği (rol bazlı) net mi?
- [ ] Yetkisiz erişim durumunda beklenen davranış tanımlanmış mı?

### State

- [ ] İlgili varlığın (order, user, payment vb.) olası durumları ve
      geçişleri tanımlanmış mı?
- [ ] Geçersiz durum geçişleri (invalid transition) belirtilmiş mi?

### Dependencies

- [ ] Bu feature'ın bağımlı olduğu internal/external/third-party
      servisler listelenmiş mi?

### Data

- [ ] Gerekli test data / ön koşul verisi tanımlanmış mı?
- [ ] Veri saklama/silme kuralları (varsa) belirtilmiş mi?

### Integration

- [ ] Bu feature başka bir sistemle veri alışverişi yapıyor mu?
- [ ] Entegrasyon noktalarının hata senaryoları tanımlanmış mı?

### UI

- [ ] Ekran/görsel davranış (varsa) tasarım dokümanıyla tutarlı mı?

### Mobile

- [ ] Mobile platformda aynı davranış bekleniyor mu (parity)?

### Localization

- [ ] Farklı dil/bölge desteği gerekiyor mu, tanımlanmış mı?

### Accessibility Awareness

- [ ] Temel erişilebilirlik beklentisi (varsa) belirtilmiş mi?

### Performance Expectations

- [ ] Ölçülebilir bir performans beklentisi (threshold) var mı?

### Security Awareness

- [ ] Hassas veri işleniyor mu, korunma kuralı tanımlanmış mı?
- [ ] Yetkilendirme/authentication gereksinimleri net mi?

### Logging

- [ ] Bu davranışın loglanması gerekiyor mu?

### Analytics / Events

- [ ] Bu davranış için izlenmesi gereken bir event/metrik var mı?

### Notifications

- [ ] Bu davranış bir bildirim tetikliyor mu, içeriği tanımlı mı?

### Backward Compatibility

- [ ] Bu değişiklik mevcut kullanıcıları/entegrasyonları bozuyor mu?

### Environment

- [ ] Bu feature'ın test edilebilmesi için özel bir ortam/konfigürasyon
      gerekiyor mu?

### Testability

- [ ] Requirement, `00-QA-FOUNDATIONS/09` ve
      `01-REQUIREMENT-ANALYSIS/04-REQUIREMENT-TESTABILITY.md`
      kriterlerine göre test edilebilir mi?

---

## 4. Checklist Kullanım Notu

Her "Hayır" veya "Belirsiz" işaretli madde, development başlamadan
önce ilgili paydaşla (Product, Business Analyst, Developer) netleştirilmeli
ve requirement'a veya Acceptance Criteria'ya eklenmelidir. Bu checklist,
tüm maddelerin her feature'da eşit derinlikte doldurulmasını
gerektirmez — amaç, hiçbir boyutun **atlanmadığından** emin olmaktır.

---

## 5. Common Mistakes

- Checklist'i yalnızca "Functional Behaviour" ve "Error Handling"
  ile sınırlı tutup diğer boyutları (Analytics, Backward
  Compatibility, Environment) atlamak.
- Checklist'i bir kez doldurup, requirement değiştiğinde tekrar
  gözden geçirmemek.
- "Belirsiz" işaretlenen maddeleri takip etmeden checklist'i
  "tamamlandı" olarak kapatmak.

---

## 6. Best Practices

- Checklist'i requirement review toplantısının standart gündem
  maddesi haline getirin.
- Her "Belirsiz" maddeyi somut bir soruya (bkz.
  `03-REQUIREMENT-CLARIFICATION.md`) dönüştürüp takip edin.
- Checklist sonucunu, Entry Criteria'nın (bkz.
  `00-QA-FOUNDATIONS/09-ENTRY-AND-EXIT-CRITERIA.md`) bir parçası
  olarak kullanın.

---

## 7. İlgili Konular

- [Requirement Clarification](03-REQUIREMENT-CLARIFICATION.md)
- [Requirement Testability](04-REQUIREMENT-TESTABILITY.md)
- [Common Requirement Problems](11-COMMON-REQUIREMENT-PROBLEMS.md)
