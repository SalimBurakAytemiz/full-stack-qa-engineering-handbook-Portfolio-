# Defect Metrics

**Status: EXPERIENCE**

> `05-TEST-MANAGEMENT/14-QA-METRICS.md`, genel QA metriklerini
> anlatmıştı. Bu dosya, **defect'e özgü** metrikleri derinleştirir.

---

## 1. Neden Önemli?

Defect verisi, doğru analiz edildiğinde ürünün ve sürecin sağlığı
hakkında güçlü sinyaller verir. Bu dosya, temel defect metriklerini
ve doğru yorumlanmalarını anlatır.

---

## 2. Temel Defect Metrikleri

### Defect Count

Belirli bir dönemde bulunan toplam defect sayısı — tek başına
anlamlı değildir, severity dağılımıyla birlikte okunmalıdır.

### Severity Distribution

Defect'lerin severity'ye göre dağılımı (bkz.
`06-SEVERITY-VS-PRIORITY.md`). Örn. "12 defect: 2 Critical, 3 High,
7 Low."

### Reopen Rate

Kapatılan defect'lerin ne kadarının tekrar açıldığı (bkz.
`11-REOPEN.md`).

### Defect Aging

Bir defect'in açıldığı andan kapatıldığı ana kadar geçen süre.

### Escaped Defect / Defect Leakage

Test sürecinde yakalanmayıp production'da ortaya çıkan defect
oranı.

---

## 3. Defect Aging Neyi Gösterir?

Uzun Defect Aging (örn. bir Critical defect'in 3 hafta açık kalması),
şu sorunlara işaret edebilir:

- Triage sürecinin yavaş işlemesi.
- Kaynak/kapasite yetersizliği.
- Defect'in, ilk göründüğünden daha karmaşık bir kök nedene sahip
  olması.

**Doğru kullanım:** Defect Aging'i severity ile birlikte izleyin —
bir Low severity defect'in 2 ay açık kalması normal olabilir, ama bir
Critical defect'in aynı süre açık kalması ciddi bir sinyal
oluşturur.

---

## 4. Defect Leakage Neyi Gösterir?

Defect Leakage (Escaped Defect), test sürecinin **gerçek etkinliğinin**
en dürüst göstergelerinden biridir:

```text
Defect Leakage = Production'da Bulunan Defect Sayısı
                  / (Test Sürecinde + Production'da Bulunan Toplam Defect)
```

Yüksek bir Defect Leakage, ürünün "az hatalı" olduğu anlamına gelmez
— tam tersine, **test sürecinin** yeterince kapsamlı olmadığına işaret
edebilir (bkz. `../05-TEST-MANAGEMENT/10-TEST-COVERAGE.md`).

---

## 5. Severity Distribution'ı Yorumlarken Dikkat

**Yanlış yorum:** "12 defect bulduk, kalite düşük."

**Doğru yorum:** "12 defect'in yalnızca 2'si Critical; bu, test
sürecinin hem yaygın hem de kritik sorunları yakaladığını gösteriyor.
Severity dağılımı olmadan, yalnızca '12 defect' rakamı anlamsızdır."

Bu, `05-TEST-MANAGEMENT/14-QA-METRICS.md`'deki "Metric ≠ Quality"
prensibinin defect metriklerine uygulanmasıdır.

---

## 6. Common Mistakes

- Defect Count'u severity dağılımı olmadan raporlamak.
- Defect Aging'i severity'den bağımsız değerlendirmek.
- Defect Leakage'ı hiç izlememek — bu, test stratejisinin en önemli
  geri bildirim mekanizmalarından birini kaybetmek anlamına gelir.

---

## 7. Best Practices

- Her metriği bağlamıyla (severity, zaman dilimi, feature) birlikte
  raporlayın.
- Defect Leakage'ı düzenli izleyip, yüksek çıktığında test kapsamını
  gözden geçirin.
- Defect Aging'i severity bazında ayrı ayrı izleyin.

---

## 8. Interview Notes

- "Defect Leakage nedir, neden önemlidir?" sorusuna, test sürecinin
  gerçek etkinliğinin göstergesi olduğunu vurgulayarak cevap verin.
- "Defect Aging neyi gösterir?" sorusuna, triage hızı ve kaynak
  yeterliliğine dair sinyal verdiğini, severity ile birlikte
  değerlendirilmesi gerektiğini belirterek cevap verin.

---

## İlgili Konular

- [05-TEST-MANAGEMENT — QA Metrics](../05-TEST-MANAGEMENT/14-QA-METRICS.md)
- [Severity vs Priority](06-SEVERITY-VS-PRIORITY.md)
- [Reopen](11-REOPEN.md)
