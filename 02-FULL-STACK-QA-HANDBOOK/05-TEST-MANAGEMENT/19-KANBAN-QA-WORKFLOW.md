# Kanban QA Workflow

**Status: EXPERIENCE** (bkz. bölüm 5 için istisna)

---

## 1. Neden Önemli?

Modern QA operasyonları, çoğunlukla Kanban tabanlı iş akışlarında
yürütülür. Bu dosya, tipik bir QA Kanban workflow'unu ve temel Kanban
kavramlarını anlatır.

---

## 2. Örnek QA Kanban Workflow

```text
BACKLOG
   ↓
READY
   ↓
IN DEVELOPMENT
   ↓
READY FOR QA
   ↓
IN QA
   ↓
BUG FIX  ←──────┐
   ↓            │
RETEST ─────────┘ (fix başarısızsa geri döner)
   ↓
DONE
```

### Aşamaların Anlamı

- **BACKLOG:** Henüz planlanmamış, gelecekte ele alınacak işler.
- **READY:** Requirement netleşmiş, development'a hazır (bkz.
  `01-REQUIREMENT-ANALYSIS/10-REQUIREMENT-REVIEW-CHECKLIST.md`).
- **IN DEVELOPMENT:** Geliştirme sürüyor.
- **READY FOR QA:** Geliştirme tamamlandı, test için deploy edildi
  (Entry Criteria karşılanmalı — bkz. `11-ENTRY-EXIT-CRITERIA.md`).
- **IN QA:** Test aktif olarak yürütülüyor.
- **BUG FIX:** Test sırasında bulunan bir defect, development'a geri
  döndü.
- **RETEST:** Fix'lenen defect, QA tarafından yeniden test ediliyor
  (bkz. `../06-DEFECT-MANAGEMENT/10-RETEST.md`).
- **DONE:** Test tamamlandı, Exit Criteria karşılandı.

---

## 3. Blocked Durumu

Kanban board'da, herhangi bir aşamadaki bir kart **Blocked**
olarak işaretlenebilir — bu, o kartın ilerleyemediği ama board'daki
konumunu koruduğu anlamına gelir.

```text
IN QA
   ↓
[BLOCKED] — örn. Payment Provider test ortamında unavailable
   ↓ (engel kalktığında)
IN QA (devam eder)
```

Bu, `07-TEST-EXECUTION-STATUS.md`'deki BLOCKED Execution Status'unun
Kanban board üzerindeki karşılığıdır.

---

## 4. Temel Kanban Kavramları

### WIP (Work In Progress)

Aynı anda **aktif olarak** üzerinde çalışılan iş sayısı.

### WIP Limit

Bir aşamada aynı anda bulunabilecek maksimum kart sayısı — akışı
düzenlemek ve darboğazları erken görmek için kullanılır.

### Blocked

Bir kartın, dış bir engel nedeniyle ilerleyememesi (bkz. bölüm 3).

### Waiting

Bir kartın, engellenmemiş ama henüz kimsenin üzerinde aktif olarak
çalışmadığı durum (örn. "READY FOR QA"da bekleyen bir kart).

### Flow

İşin board üzerinde, aşamalar arasında ne kadar **akıcı** ilerlediği.

### Bottleneck (Darboğaz)

Board üzerinde işlerin biriktiği, akışın yavaşladığı aşama (örn.
sürekli "IN QA" aşamasında çok fazla kart birikmesi, QA kapasitesinin
darboğaz olduğunu gösterebilir).

---

## 5. WIP Limit — Knowledge Status: LEARNING

> **Knowledge Status: LEARNING**

QA-COMPETENCY-MAP.md ile tutarlı olarak, **temel Kanban kullanımı**
(board, kartların aşamalar arası hareketi, Blocked işaretleme)
**EXPERIENCE** statüsündedir. Ancak **WIP Limit'in ileri seviye
kullanımı** (optimal limit belirleme, Flow Efficiency ölçümü, Queue
Management, gelişmiş Blocked/Waiting politikaları) bu repository'de
**LEARNING** statüsündedir.

Bu ayrım bilinçlidir: WIP Limit kavramını **bilmek ve board'da
uygulamak** farklı bir şey, WIP Limit'i **optimize etmek** (doğru
sayıyı bulmak, flow metrikleriyle ayarlamak) farklı bir uzmanlık
seviyesidir. Bu repository, ikincisi için henüz **EXPERIENCE** iddiası
yapmaz.

---

## 6. Common Mistakes

- BLOCKED bir kartı, sanki aktif olarak ilerliyormuş gibi WIP'e dahil
  saymak.
- Her aşamada sınırsız kart birikmesine izin verip darboğazı fark
  etmemek.
- WIP Limit'in ileri seviye optimizasyonunu (Flow Efficiency vb.)
  temel Kanban kullanımıyla aynı deneyim seviyesinde sunmak.

---

## 7. Best Practices

- "IN QA" aşamasında biriken kart sayısını düzenli izleyin — bu,
  QA kapasite sorununu erken gösterir.
- BLOCKED kartları board üzerinde görsel olarak ayırt edilebilir
  yapın.
- RETEST'ten "BUG FIX"e geri dönen akışı (fix başarısız olursa) board
  üzerinde açıkça modelleyin.

---

## 8. Interview Notes

- "Bir QA Kanban workflow'unda tipik aşamalar nelerdir?" sorusuna
  BACKLOG→READY→...→DONE zinciriyle cevap verin.
- "Blocked bir kart WIP'e dahil midir?" sorusuna hayır diyerek,
  aktif çalışılmadığını açıklayın.
- "WIP Limit optimizasyonu deneyiminiz var mı?" sorusuna dürüstçe,
  temel Kanban kullanımının EXPERIENCE olduğunu ama ileri seviye WIP
  optimizasyonunun LEARNING alanı olduğunu belirterek cevap verin.

---

## İlgili Konular

- [Test Execution Status](07-TEST-EXECUTION-STATUS.md)
- [Tools and Workflows](20-TOOLS-AND-WORKFLOWS.md)
- [06-DEFECT-MANAGEMENT — Retest](../06-DEFECT-MANAGEMENT/10-RETEST.md)
