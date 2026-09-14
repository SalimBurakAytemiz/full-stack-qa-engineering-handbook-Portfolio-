# QA Metrics

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Metrikler, QA operasyonunun sağlığını görünür kılar — ama yanlış
yorumlandığında **yanlış bir kalite algısı** yaratabilir. Bu dosya,
temel QA metriklerini ve "Metric ≠ Quality" prensibini anlatır.

---

## 2. Temel QA Metrikleri

### Execution Progress

Planlanan Test Case'lerin ne kadarı çalıştırıldı (PASS + FAIL +
BLOCKED + SKIPPED) / Toplam.

### Pass Rate

Çalıştırılan Test Case'ler içinde PASS oranı.

### Fail Rate

Çalıştırılan Test Case'ler içinde FAIL oranı.

### Blocked Rate

Çalıştırılamayan (BLOCKED) Test Case'lerin oranı (bkz.
`07-TEST-EXECUTION-STATUS.md`).

### Requirement Coverage

Kaç Requirement/AC en az bir Test Case tarafından kapsanıyor (bkz.
`09-TRACEABILITY-MANAGEMENT.md`).

### Test Coverage

Bkz. `10-TEST-COVERAGE.md` — yalnızca sayı değil, risk/flow
dengesiyle değerlendirilir.

### Defect Count

Bulunan toplam defect sayısı (genellikle severity/priority ile
kırılımlı).

### Severity Distribution

Defect'lerin severity'ye göre dağılımı (kaç Critical, kaç High, kaç
Low — bkz.
`../06-DEFECT-MANAGEMENT/06-SEVERITY-VS-PRIORITY.md`).

### Reopen Rate

Kapatılan defect'lerin ne kadarının tekrar açıldığı (bkz.
`../06-DEFECT-MANAGEMENT/11-REOPEN.md`) — yüksek reopen rate, fix
kalitesinin veya retest disiplininin sorunlu olduğuna işaret edebilir.

### Escaped Defect / Defect Leakage

Test sürecinde yakalanmayıp production'da ortaya çıkan defect
sayısı/oranı — bu, test kapsamının etkinliğinin en önemli
göstergelerinden biridir.

### Defect Aging

Bir defect'in açıldığından kapatılana kadar geçen süre — uzun aging,
triage veya kaynak sorununa işaret edebilir.

### Automation Coverage

Regression suite'inin ne kadarının otomatize edildiği.

---

## 3. Metric ≠ Quality

**Bu, bu dosyanın en kritik prensibidir.**

Metrikler, kaliteyi **temsil edebilir** ama kalitenin **kendisi
değildir**. Yanlış yorumlandığında, metrikler yanlış bir güven
duygusu yaratabilir.

### Örnek 1: Test Case Sayısı

> "5000 Test Case'imiz var, demek ki sistemimiz kaliteli."

**Yanlış.** 5000 Test Case sayısı, yalnızca **miktarı** gösterir.
Bu case'lerin ne kadarının kritik riskleri kapsadığı, ne kadarının
birbirinin neredeyse aynısı olduğu (düşük değerli tekrar) bu sayıdan
anlaşılmaz (bkz. `10-TEST-COVERAGE.md`).

### Örnek 2: %100 Pass Rate

> "%100 Pass Rate elde ettik, sistem kusursuz."

**Yanlış veya eksik olabilir.** %100 Pass Rate şu nedenlerle
yanıltıcı olabilir:

- Test case'ler yalnızca Happy Path'i kapsıyor olabilir (Negative/Edge
  hiç test edilmemiş).
- Test case'lerin Expected Result'ları yanlış/gevşek yazılmış
  olabilir (Test Oracle hatası — bkz.
  `00-QA-FOUNDATIONS/08-TEST-ORACLE.md`).
- Yüksek riskli alanlar hiç kapsanmamış, yalnızca kolay/düşük riskli
  senaryolar test edilmiş olabilir.

%100 Pass Rate, "her şey mükemmel çalışıyor" değil, **"test ettiğimiz
her şey PASS oldu"** anlamına gelir — bu ikisi aynı şey değildir.

---

## 4. Metrikleri Doğru Kullanmak

Bir metriği raporlarken her zaman **bağlamını** da verin:

| Yalnız Metrik (Yanıltıcı) | Bağlamlı Metrik (Anlamlı) |
|---|---|
| "%100 Pass Rate" | "%100 Pass Rate, planlanan 45 senaryonun tamamı üzerinden; bunların %60'ı Negative/Edge senaryolarıdır." |
| "5000 Test Case" | "5000 Test Case, RTM'e göre AC'lerin %98'ini kapsıyor; kapsanmayan %2, düşük riskli alanlardır." |
| "Defect Count: 12" | "Defect Count: 12 (2 Critical, 3 High, 7 Low); Reopen Rate bu sprint'te %0." |

---

## 5. Common Mistakes

- Metrikleri bağlamsız, tek başına bir sayı olarak sunmak.
- Test Case sayısını veya Pass Rate'i doğrudan kalite kanıtı olarak
  sunmak.
- Escaped Defect / Defect Leakage'ı hiç takip etmemek — bu, test
  sürecinin gerçek etkinliğini gösteren en dürüst metriktir.

---

## 6. Best Practices

- Her metriği, onu anlamlı kılan bağlamla birlikte raporlayın.
- Pass Rate'i her zaman Coverage ve Flow dağılımıyla birlikte
  sunun.
- Defect Leakage'ı düzenli izleyin — bu, test stratejisinin gerçek
  etkinliğini ölçer.

---

## 7. Interview Notes

- "%100 Pass Rate her zaman iyi bir şey midir?" sorusuna hayır
  diyerek, coverage ve flow dengesi olmadan yanıltıcı olabileceğini
  açıklayın.
- "Test Case sayısı neden bir kalite metriği değildir?" sorusuna,
  miktar ile değer arasındaki farkı vurgulayarak cevap verin.
- "Defect Leakage nedir, neden önemlidir?" sorusuna, production'da
  ortaya çıkan ama test sürecinde yakalanmayan defect'lerin test
  etkinliğinin göstergesi olduğunu belirterek cevap verin.

---

## İlgili Konular

- [Test Coverage](10-TEST-COVERAGE.md)
- [Test Reporting](15-TEST-REPORTING.md)
- [06-DEFECT-MANAGEMENT — Defect Metrics](../06-DEFECT-MANAGEMENT/18-DEFECT-METRICS.md)
