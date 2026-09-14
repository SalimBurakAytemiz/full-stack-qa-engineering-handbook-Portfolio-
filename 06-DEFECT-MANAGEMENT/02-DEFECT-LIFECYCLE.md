# Defect Lifecycle

**Status: EXPERIENCE**

---

## 1. Neden Önemli?

Bir defect, bulunduğu andan kapatıldığı ana kadar birden fazla
durumdan (state) geçer. Bu dosya, tipik bir defect lifecycle'ını ve
alternatif çözüm yollarını anlatır.

---

## 2. Örnek Defect Lifecycle

```text
NEW
   ↓
OPEN
   ↓
IN PROGRESS
   ↓
FIXED
   ↓
READY FOR RETEST
   ↓
RETEST
   ↓
CLOSED
```

### Aşamaların Anlamı

- **NEW:** Defect yeni raporlandı, henüz triage edilmedi.
- **OPEN:** Defect triage edildi (bkz. `09-DEFECT-TRIAGE.md`),
  geçerli kabul edildi, çözüm bekliyor.
- **IN PROGRESS:** Developer, fix üzerinde çalışıyor.
- **FIXED:** Fix tamamlandı, kod merge edildi/deploy edildi.
- **READY FOR RETEST:** Fix, test ortamına ulaştı, retest için hazır.
- **RETEST:** QA, fix'i doğruluyor (bkz. `10-RETEST.md`).
- **CLOSED:** Retest başarılı, defect kapatıldı.

---

## 3. Alternatif Yol: RETEST Başarısız Olursa

```text
RETEST
   ↓
FAILED (fix işe yaramadı)
   ↓
REOPEN
   ↓
(IN PROGRESS'e geri döner)
```

Bkz. `11-REOPEN.md` için detaylı anlatım.

---

## 4. Diğer Resolution Türleri

Her defect "FIXED → CLOSED" yoluyla kapanmaz. Alternatif
resolution'lar:

| Resolution | Anlamı |
|---|---|
| **DUPLICATE** | Bu defect, zaten kayıtlı başka bir defect ile aynı. |
| **REJECTED** | Defect geçersiz bulundu (yanlış raporlama, requirement yanlış anlaşılmış). |
| **NOT A BUG** | Sistem, tanımlandığı gibi doğru çalışıyor; raporlanan davranış aslında beklenen davranış. |
| **CANNOT REPRODUCE** | Defect, açıklanan adımlarla tekrar üretilemedi. |
| **WON'T FIX** | Defect geçerli ama business, bunu düzeltmemeye karar verdi (düşük öncelik/maliyet-fayda). |
| **DEFERRED** | Defect geçerli ama şu an için ertelendi, gelecekte ele alınacak. |
| **KNOWN ISSUE** | Defect geçerli ama düşük etkili, bilinçli kabul edildi (bkz. `../05-TEST-MANAGEMENT/18-KNOWN-ISSUES.md`). |

Bkz. `13-DUPLICATE-REJECTED-NOT-A-BUG.md` için detaylı anlatım.

---

## 5. Her Organizasyonda Status İsimleri Değişebilir

**Önemli not:** Yukarıdaki status isimleri (NEW, OPEN, IN PROGRESS
vb.) **örnek** bir lifecycle'ı temsil eder. Gerçek organizasyonlarda:

- Jira'da varsayılan olarak "To Do → In Progress → Done" kullanılabilir
  ve bu isimler organizasyona göre özelleştirilir (bkz.
  `19-JIRA-BUG-WORKFLOW.md`).
- Azure DevOps'ta "New → Active → Resolved → Closed" gibi farklı bir
  isimlendirme kullanılabilir (bkz.
  `20-AZURE-DEVOPS-DEFECT-WORKFLOW.md`).
- Bazı organizasyonlar "QA Verified" gibi ek ara durumlar ekleyebilir.

**Önemli olan status isimleri değil, temsil ettikleri kavramsal
aşamalardır:** raporlandı → değerlendirildi → çözülüyor → çözüldü →
doğrulanıyor → kapatıldı (veya alternatif bir resolution).

---

## 6. Common Mistakes

- Status isimlerinin her organizasyonda birebir aynı olacağını
  varsaymak.
- RETEST aşamasını atlayıp FIXED'i doğrudan CLOSED'a çevirmek (bkz.
  `10-RETEST.md`).
- Her defect'i "FIXED → CLOSED" yoluna zorlamak, DUPLICATE/REJECTED/
  NOT A BUG gibi geçerli alternatifleri değerlendirmemek.

---

## 7. Best Practices

- Lifecycle'ı, kullandığınız araca (Jira/Azure DevOps) göre
  konfigüre edin ama kavramsal aşamaları koruyun.
- Her resolution türünü (DUPLICATE, REJECTED vb.) gerekçesiyle
  birlikte kapatın.
- RETEST aşamasını hiçbir zaman atlamayın.

---

## 8. Interview Notes

- "Tipik bir defect lifecycle'ını anlatır mısınız?" sorusuna
  NEW→OPEN→IN PROGRESS→FIXED→RETEST→CLOSED zinciriyle cevap verin.
- "Her defect FIXED olarak mı kapanır?" sorusuna hayır diyerek,
  DUPLICATE/REJECTED/NOT A BUG/WON'T FIX gibi alternatifleri
  sayarak cevap verin.

---

## İlgili Konular

- [Retest](10-RETEST.md)
- [Reopen](11-REOPEN.md)
- [Duplicate / Rejected / Not a Bug](13-DUPLICATE-REJECTED-NOT-A-BUG.md)
