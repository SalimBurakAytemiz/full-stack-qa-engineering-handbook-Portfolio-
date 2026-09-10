# Shift Left & Shift Right

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Klasik anlayışta QA, lifecycle'ın sonunda ("Testing Phase") devreye
girer. Shift Left ve Shift Right, QA'nın lifecycle'ın **başına** ve
**sonrasına** (production'a) nasıl yayıldığını gösterir.

---

## 2. Shift Left Testing Nedir?

Shift Left, QA aktivitelerinin lifecycle'da mümkün olduğunca **erken**
(sola doğru) kaydırılmasıdır. Amaç, hataları development başlamadan
veya erken aşamalarda yakalamaktır.

Shift Left aktiviteleri:

- **Requirement Review:** Requirement'ların netlik ve testability
  açısından erken değerlendirilmesi.
- **Early QA Involvement:** QA'nın sprint planning / requirement
  yazımı aşamasında dahil olması.
- **API Contract Review:** API sözleşmesinin (request/response şeması)
  development başlamadan önce gözden geçirilmesi.
- **Testability:** Sistemin test edilebilir şekilde tasarlanıp
  tasarlanmadığının değerlendirilmesi.
- **Risk Analysis:** Hangi alanların yüksek riskli olduğunun erken
  belirlenmesi.

---

## 3. Shift Right Testing Nedir?

Shift Right, QA aktivitelerinin lifecycle'ın **sonrasına** (sağa doğru),
yani production'a doğru genişletilmesidir. Amaç, gerçek kullanım
koşullarında ortaya çıkan sorunları erken tespit etmektir.

Shift Right aktiviteleri:

- **Production Validation:** Canlıya alınan bir değişikliğin gerçek
  ortamda beklendiği gibi çalıştığının doğrulanması.
- **Monitoring:** Sistem metriklerinin (hata oranı, yanıt süresi)
  sürekli izlenmesi.
- **Logs:** Production loglarının analiz edilerek anormal davranışların
  tespit edilmesi.
- **Stability Verification:** Deployment sonrası sistemin kararlılığının
  doğrulanması (örn. post-release smoke test).
- **User Behaviour:** Gerçek kullanıcı davranışının (örn. hangi
  akışlarda kullanıcılar takılıyor) analiz edilmesi.
- **Production Quality Signals:** Crash oranı, hata log yoğunluğu gibi
  sinyallerin kalite göstergesi olarak kullanılması.

---

## 4. Karşılaştırma

| | Shift Left | Shift Right |
|---|---|---|
| Yön | Lifecycle'ın başına doğru | Lifecycle'ın sonrasına (production) doğru |
| Amaç | Hatayı oluşmadan önlemek | Gerçek ortamdaki sorunu erken yakalamak |
| Örnek | Requirement review | Production log analizi |
| Ortam | Henüz çalışmayan sistem | Gerçek, çalışan production sistemi |

---

## 5. QA'nın Lifecycle Boyunca Yeri

```text
Shift Left                                          Shift Right
    ↓                                                     ↓
Requirement → Design → Development → Testing → Release → Production
    QA           QA         QA          QA         QA        QA
```

Bu diyagram, QA'nın yalnızca "Testing" kutusunda değil, lifecycle'ın
**tamamında** bir rolü olduğunu gösterir:

- Requirement'ta: netlik ve testability değerlendirmesi.
- Design'da: testability ve risk analizi.
- Development'ta: API contract review, erken geri bildirim.
- Testing'de: fonksiyonel/regression/exploratory test.
- Release'de: Exit Criteria değerlendirmesi.
- Production'da: stability doğrulama, log/monitoring analizi.

---

## 6. Common Mistakes

- Shift Left'i "test case'leri erken yazmak" ile sınırlı sanmak (oysa
  requirement review ve testability değerlendirmesi de kapsar).
- Shift Right'ı yalnızca DevOps/monitoring ekibinin işi sanmak.
- QA'nın production'a hiç dokunmaması gerektiğini düşünmek.

---

## 7. Best Practices

- Requirement review'u, sprint planning'in zorunlu bir parçası haline
  getirin (shift-left).
- Kritik release'ler sonrası production loglarını QA perspektifiyle
  gözden geçirin (shift-right).
- Shift Left ve Shift Right'ı birbirinin alternatifi değil, birbirini
  tamamlayan iki uç olarak konumlandırın.

---

## 8. Interview Notes

- "Shift Left nedir?" sorusuna requirement review ve early involvement
  örnekleriyle cevap verin.
- "Shift Right nedir, QA ile ilgisi ne?" sorusuna production monitoring
  ve log analizi örnekleriyle cevap verin.
- "QA sadece testing phase'inde mi çalışır?" sorusuna bu iki kavramla
  hayır diyerek cevap verin.

---

## İlgili Konular

- [SDLC & STLC](03-SDLC-AND-STLC.md)
- [Static & Dynamic Testing](06-STATIC-AND-DYNAMIC-TESTING.md)
- [Quality Gates Overview](15-QUALITY-GATES-OVERVIEW.md)
